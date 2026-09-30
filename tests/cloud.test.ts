import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  applyChange,
  defaultState,
  parseSnapshot,
  saveOperation,
  type CloudApi,
  type Operation,
  type SaveResult,
} from "../lib/cloud-progress.ts";

const userA = "10000000-0000-4000-8000-000000000001";
const userB = "10000000-0000-4000-8000-000000000002";
const at = new Date("2026-09-30T12:00:00Z").getTime();
const op = (change: Operation["change"], time = at): Operation => ({
  id: crypto.randomUUID(),
  at: time,
  change,
});

test("cloud operations preserve unrelated progress and explicit favorite intent", () => {
  const base = defaultState(at);
  const learned = applyChange(
    base,
    op({ kind: "review", wordId: "employee", grade: "good" }),
  );
  const marked = applyChange(
    learned,
    op({ kind: "favorite", wordId: "employee", selected: true }),
  );
  const markedTwice = applyChange(
    marked,
    op({ kind: "favorite", wordId: "employee", selected: true }),
  );
  assert.deepEqual(markedTwice.favorites, ["employee"]);
  const unmarked = applyChange(
    markedTwice,
    op({ kind: "favorite", wordId: "employee", selected: false }),
  );
  assert.deepEqual(unmarked.cards, learned.cards);
  assert.deepEqual(unmarked.favorites, []);
  const next = applyChange(
    learned,
    op({ kind: "review", wordId: "employee", grade: "hard" }, at - 10000),
  );
  assert.ok(
    next.cards.employee.lastReviewed > learned.cards.employee.lastReviewed,
  );
  assert.throws(() =>
    applyChange(
      base,
      op({ kind: "favorite", wordId: "unknown-word", selected: true }),
    ),
  );
  assert.throws(() =>
    parseSnapshot({ state: base, revision: -1, updatedAt: "invalid" }),
  );
});

test("PostgreSQL RPCs enforce identity, version checks and idempotent saves", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
      grant usage on schema auth, public to anon, authenticated;
    `);
    await db.query("insert into auth.users values ($1), ($2)", [userA, userB]);
    const migration = await readFile(
      new URL(
        "../supabase/migrations/202609300001_cloud_progress.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration); // Setup can safely be rerun without dropping progress.
    async function login(id: string | null) {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
        id ?? "",
      ]);
      await db.exec(id ? "set role authenticated" : "set role anon");
    }
    function apiFor(id: string): CloudApi {
      return {
        async load(initial) {
          const result = await db.query<{ value: unknown }>(
            "select public.toice_load_progress($1::uuid, $2::jsonb) as value",
            [id, JSON.stringify(initial)],
          );
          return parseSnapshot(result.rows[0].value);
        },
        async save(state, expectedRevision, operationId) {
          const result = await db.query<{ value: SaveResult }>(
            "select public.toice_save_progress($1::uuid, $2::jsonb, $3::bigint, $4::uuid) as value",
            [id, JSON.stringify(state), expectedRevision, operationId],
          );
          const data = result.rows[0].value;
          return { ...parseSnapshot(data), status: data.status };
        },
      };
    }
    const apiA = apiFor(userA),
      apiB = apiFor(userB);
    await t.test(
      "anonymous access is rejected and new accounts start empty",
      async () => {
        await login(null);
        await assert.rejects(apiA.load(defaultState(at)), /permission denied/);
        await login(userA);
        const first = await apiA.load(defaultState(at));
        assert.deepEqual(first.state.cards, {});
        assert.deepEqual(first.state.favorites, []);
        assert.equal(first.revision, 0);
        await assert.rejects(
          apiB.load(defaultState(at)),
          /Authentication required/,
        );
        const second = await apiA.load(defaultState(at + 10000));
        assert.equal(second.state.startedAt, at);
      },
    );
    await t.test(
      "stale devices rebase their changes without losing other reviews",
      async () => {
        await login(userA);
        const firstDevice = await apiA.load(defaultState(at));
        const secondDevice = await apiA.load(defaultState(at));
        await saveOperation(
          apiA,
          firstDevice,
          op({ kind: "review", wordId: "applicant", grade: "good" }),
        );
        const result = await saveOperation(
          apiA,
          secondDevice,
          op({ kind: "review", wordId: "employee", grade: "hard" }),
        );
        assert.equal(result.revision, 2);
        assert.equal(result.state.cards.applicant.reviews, 1);
        assert.equal(result.state.cards.employee.reviews, 1);
        assert.equal(result.state.logs.length, 2);
      },
    );
    await t.test(
      "a lost response can be retried without counting a review twice",
      async () => {
        const base = await apiA.load(defaultState(at));
        const operation = op({
          kind: "review",
          wordId: "salary",
          grade: "again",
        });
        let dropResponse = true;
        const unreliable: CloudApi = {
          ...apiA,
          async save(...args) {
            const result = await apiA.save(...args);
            if (dropResponse) {
              dropResponse = false;
              throw new Error("network interrupted after commit");
            }
            return result;
          },
        };
        await assert.rejects(
          saveOperation(unreliable, base, operation),
          /network interrupted/,
        );
        const recovered = await saveOperation(unreliable, base, operation);
        assert.equal(recovered.revision, base.revision + 1);
        assert.equal(recovered.state.cards.salary.reviews, 1);
        assert.equal(
          recovered.state.logs.filter((log) => log.wordId === "salary").length,
          1,
        );
      },
    );
    await t.test(
      "removing a favorite on a stale device preserves other changes",
      async () => {
        const initial = await apiA.load(defaultState(at));
        const starred = await saveOperation(
          apiA,
          initial,
          op({ kind: "favorite", wordId: "applicant", selected: true }),
        );
        await saveOperation(
          apiA,
          starred,
          op({ kind: "review", wordId: "applicant", grade: "good" }),
        );
        const final = await saveOperation(
          apiA,
          starred,
          op({ kind: "favorite", wordId: "applicant", selected: false }),
        );
        assert.equal(final.state.favorites.includes("applicant"), false);
        assert.equal(final.state.cards.applicant.reviews, 2);
      },
    );
    await t.test(
      "RLS hides another account and direct writes cannot bypass RPCs",
      async () => {
        await login(userB);
        const accountB = await apiB.load(defaultState(at));
        assert.deepEqual(accountB.state.cards, {});
        const visible = await db.query<{ user_id: string }>(
          "select user_id from public.toice_progress",
        );
        assert.deepEqual(
          visible.rows.map((row) => row.user_id),
          [userB],
        );
        assert.equal(
          (
            await db.query(
              "select * from public.toice_progress where user_id = $1",
              [userA],
            )
          ).rows.length,
          0,
        );
        await assert.rejects(
          db.exec("update public.toice_progress set revision = 999"),
          /permission denied/,
        );
        await assert.rejects(
          db.exec("select * from public.toice_operations"),
          /permission denied/,
        );
        // An old account's in-flight request cannot write under a newly switched session.
        await assert.rejects(
          apiA.save(accountB.state, 0, crypto.randomUUID()),
          /Authentication required/,
        );
        assert.equal((await apiB.load(defaultState(at))).revision, 0);
      },
    );
    await t.test(
      "malformed payloads fail without replacing the saved state",
      async () => {
        const base = await apiB.load(defaultState(at));
        const invalid = {
          ...base.state,
          settings: { ...base.state.settings, dailyNew: 1000 },
        };
        await assert.rejects(
          apiB.save(invalid, base.revision, crypto.randomUUID()),
          /Invalid learning state/,
        );
        for (const invalidPayload of [
          {
            ...base.state,
            settings: { ...base.state.settings, examDate: null },
          },
          {
            ...base.state,
            settings: { ...base.state.settings, examDate: "2026-02-30" },
          },
          { ...base.state, cards: { applicant: { reviews: -1 } } },
          { ...base.state, favorites: [123] },
          {
            ...base.state,
            logs: [
              {
                at,
                wordId: "applicant",
                kind: "review",
                correct: true,
                grade: "invalid",
              },
            ],
          },
        ]) {
          await assert.rejects(
            db.query(
              "select public.toice_save_progress($1::uuid,$2::jsonb,0,$3::uuid)",
              [userB, JSON.stringify(invalidPayload), crypto.randomUUID()],
            ),
            /Invalid learning state/,
          );
        }
        assert.deepEqual((await apiB.load(defaultState(at))).state, base.state);
      },
    );
  } finally {
    await db.close();
  }
});
