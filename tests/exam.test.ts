import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createHash } from "node:crypto";
import {
  questions,
  mockIds,
  mockCounts,
  mockSets,
  examSummary,
  questionMap,
  practiceGroups,
  newAttempt,
  selectPractice,
  normalizeSpelling,
  isCorrect,
  results,
  examPhase,
  canAnswer,
  recordAnswer,
  weakQuestions,
  parseAttempt,
  analytics,
} from "../lib/exam.ts";

test("expanded bank keeps four independent 200-question mocks and complete practice groups", async () => {
  assert.equal(questions.length, 2082);
  assert.equal(examSummary.total, questions.length);
  assert.equal(
    examSummary.practice,
    questions.filter((q) => q.pool === "practice").length,
  );
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  const mock = mockIds();
  assert.equal(mock.length, 200);
  assert.equal(mockSets.length, 4);
  for (const set of mockSets) {
    const ids = mockIds(set.id);
    assert.equal(ids.length, 200);
    const attempt = newAttempt("mock", ids, "Test " + set.id, 1000);
    assert.equal(parseAttempt(attempt).ids.length, 200);
    const foreignId = mockIds(set.id === "01" ? "02" : "01")[0];
    assert.throws(() =>
      parseAttempt({ ...attempt, ids: [foreignId, ...ids.slice(1)] }),
    );
    for (let p = 1; p <= 7; p++)
      assert.equal(
        ids.filter((id) => questionMap.get(id)!.part === p).length,
        mockCounts[p - 1],
      );
  }
  const allMockIds = mockSets.flatMap((s) => mockIds(s.id));
  assert.equal(new Set(allMockIds).size, 800);
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(questions.slice(0, 516)))
      .digest("hex"),
    (
      await readFile(
        new URL("./fixtures/legacy-exam.sha256", import.meta.url),
        "utf8",
      )
    ).trim(),
    "original questions, options and grading must remain byte-for-byte compatible",
  );
  for (const q of questions) {
    assert.equal(q.options.length, q.part === 2 ? 3 : 4);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.options[q.correct]);
    assert.ok(q.explanation.length > 5);
    assert.ok(q.ipa);
    assert.equal(q.optionIpa?.length, q.options.length);
    assert.ok(!q.ipa?.includes("["));
    if (q.passage || q.transcript)
      assert.ok(q.passageIpa && !q.passageIpa.includes("["));
    if (q.graphic) assert.ok(q.graphicIpa && !q.graphicIpa.includes("["));
    if (q.part < 5) {
      assert.ok(q.audio);
      const f = await readFile(new URL("../public" + q.audio, import.meta.url));
      if (q.audio.endsWith(".mp3"))
        assert.equal(f.subarray(0, 3).toString(), "ID3");
      else assert.equal(f.subarray(0, 4).toString(), "RIFF");
      assert.ok(f.length > 1000);
    }
    if (q.image)
      assert.ok(
        (await stat(new URL("../public" + q.image, import.meta.url))).size > 0,
      );
  }
  const seen = new Set<string>();
  for (const q of questions) {
    const key = [
      q.prompt,
      q.passage || q.transcript || q.image || "",
      q.options.slice().sort().join("|"),
    ].join("~");
    assert.ok(!seen.has(key), "duplicate question: " + q.id);
    seen.add(key);
  }
  for (const part of [0, 1, 2, 3, 4, 5, 6, 7] as const) {
    const ids = selectPractice(part, 20);
    assert.ok(ids.length);
    assert.ok(ids.every((id) => !allMockIds.includes(id)));
    for (const id of ids) {
      const q = questions.find((q) => q.id === id)!;
      if (q.group)
        assert.ok(
          questions
            .filter((x) => x.group === q.group)
            .every((x) => ids.includes(x.id)),
        );
    }
  }
});
test("skill and topic filters retain complete groups, and unseen mode excludes whole attempted groups", () => {
  const chart = questions.find((q) => q.id === "v2-advanced-12-1")!;
  assert.ok(
    chart.optionIpa![chart.options.indexOf("Workshop A")].endsWith("eɪ"),
  );
  assert.ok(chart.passageIpa!.includes("laɪv klæs"));
  const skill = "圖表整合";
  const groups = practiceGroups(0, skill);
  assert.ok(groups.length > 5);
  const seenIds = new Set([groups[0][0].id]);
  const ids = selectPractice(0, 200, skill, () => 0.37, {
    unseen: true,
    seenIds,
  });
  assert.ok(ids.length > 0);
  assert.ok(!ids.some((id) => groups[0].some((q) => q.id === id)));
  for (const id of ids) {
    const q = questionMap.get(id)!;
    const whole = questions.filter((x) => x.group === q.group);
    assert.ok(whole.every((x) => ids.includes(x.id)));
    assert.ok(whole.some((x) => x.skill === skill));
  }
  assert.equal(
    selectPractice(0, 20, "", Math.random, {
      unseen: true,
      seenIds: new Set(questions.map((q) => q.id)),
    }).length,
    0,
  );
  const topicIds = selectPractice(7, 20, "", () => 0.2, { topic: "採購物流" });
  assert.ok(topicIds.length > 0);
  assert.ok(topicIds.every((id) => questionMap.get(id)!.topic === "採購物流"));
  const mixed = selectPractice(0, 20, "", () => 0.42);
  assert.equal(new Set(mixed.map((id) => questionMap.get(id)!.part)).size, 7);
  for (const name of [
    "句子插入",
    "說話者意圖",
    "圖表整合",
    "跨文件推論",
    "字義辨識",
  ])
    assert.ok(questions.some((q) => q.skill === name));
});
test("absolute timers enforce sections after reopening and reject late answers", () => {
  const a = newAttempt("mock", mockIds(), "mock", 1000);
  assert.equal(examPhase(a, 1000), "listening");
  assert.equal(canAnswer(a, 100, 2000), false);
  assert.equal(examPhase(a, 2701000), "reading");
  assert.equal(canAnswer(a, 0, 2701000), false);
  assert.equal(canAnswer(a, 100, 2701000), true);
  assert.equal(examPhase(a, 7201000), "expired");
  assert.equal(canAnswer(a, 100, 7201000), false);
  assert.equal(
    recordAnswer(a, a.ids[0], { choice: 1, guessed: false, ms: 100 }, 7201000),
    a,
  );
  assert.throws(() => parseAttempt({ ...a, duration: 0 }));
  assert.throws(() => parseAttempt({ ...a, ids: [...a.ids].reverse() }));
});
test("grading counts unanswered questions and guessed correct answers require review", () => {
  const q = questions.find((q) => q.part === 5 && q.pool === "practice")!;
  let a = newAttempt("practice", [q.id], "test", 1000);
  a = recordAnswer(
    a,
    q.id,
    { choice: q.correct, guessed: true, ms: 1234 },
    2000,
  );
  a.finishedAt = 2000;
  assert.equal(results(a).correct, 1);
  assert.equal(weakQuestions([a], 2000).length, 1);
  const b = {
    ...a,
    id: crypto.randomUUID(),
    finishedAt: 4000,
    answers: { [q.id]: { choice: q.correct, guessed: false, ms: 999 } },
  };
  assert.equal(weakQuestions([a, b]).length, 1);
  const c = { ...b, id: crypto.randomUUID(), finishedAt: 6000 };
  assert.equal(weakQuestions([a, b, c]).length, 0);
  const empty = { ...a, answers: {} };
  assert.equal(results(empty).percent, 0);
  assert.equal(weakQuestions([empty]).length, 1);
  assert.equal(analytics([a, b])[4].seconds, 1);
  const spelling = newAttempt("spelling", ["applicant"], "spell");
  spelling.answers.applicant = { choice: " APPLICANT ", guessed: false, ms: 1 };
  assert.ok(isCorrect(spelling, "applicant"));
  assert.equal(normalizeSpelling("  A  B "), "a b");
  assert.throws(() =>
    parseAttempt({
      ...a,
      answers: { [q.id]: { choice: 8, guessed: false, ms: 1 } },
    }),
  );
});
test("exam database isolates accounts and protects revision, retry and final submissions", async () => {
  const db = new PGlite();
  const aId = "10000000-0000-4000-8000-000000000001",
    bId = "10000000-0000-4000-8000-000000000002";
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to anon,authenticated;`,
    );
    await db.query("insert into auth.users values ($1),($2)", [aId, bId]);
    const sql = await readFile(
      new URL(
        "../supabase/migrations/202610010001_exam_center.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    async function login(id: string | null) {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id ?? "",
      ]);
      await db.exec(id ? "set role authenticated" : "set role anon");
    }
    async function save(a: unknown, rev: number, op = crypto.randomUUID()) {
      const r = await db.query<{
        v: { status: string; revision: number; data: unknown };
      }>(
        "select public.toice_save_attempt($1::jsonb,$2::bigint,$3::uuid) as v",
        [JSON.stringify(a), rev, op],
      );
      return r.rows[0].v;
    }
    const a = newAttempt("practice", selectPractice(5, 2), "test", 1000);
    const op = crypto.randomUUID();
    await login(null);
    await assert.rejects(save(a, -1), /permission denied/);
    await login(aId);
    const first = await save(a, -1, op);
    assert.equal(first.revision, 0);
    assert.equal((await save(a, -1, op)).revision, 0);
    await assert.rejects(
      db.query("update public.toice_attempts set revision=0"),
      /permission denied/,
    );
    const next = { ...a, index: 1 };
    assert.equal((await save(next, 0)).revision, 1);
    assert.equal((await save(a, 0)).status, "conflict");
    await assert.rejects(
      save({ ...next, startedAt: 5 }, 1),
      /identity cannot change/,
    );
    await assert.rejects(
      save(
        { ...next, answers: { unknown: { choice: 0, guessed: false, ms: 1 } } },
        1,
      ),
      /Invalid answer/,
    );
    await login(bId);
    assert.equal(
      (await db.query("select * from public.toice_attempts")).rows.length,
      0,
    );
    await assert.rejects(save(a, 1), /Access denied/);
    await assert.rejects(
      db.query(
        "insert into public.toice_annotations(user_id,id,note) values($1,$2,$3)",
        [aId, "x", "bad"],
      ),
      /row-level security/,
    );
    await login(aId);
    await db.query(
      "insert into public.toice_annotations(user_id,id,note) values($1,$2,$3)",
      [aId, a.ids[0], "my note"],
    );
    await login(bId);
    assert.equal(
      (await db.query("select * from public.toice_annotations")).rows.length,
      0,
    );
    await login(aId);
    const finished = { ...next, finishedAt: 2000 };
    const finalOp = crypto.randomUUID();
    await save(finished, 1, finalOp);
    assert.equal((await save(finished, 1, finalOp)).revision, 2);
    await assert.rejects(save(next, 2), /immutable/);
    const expandedMock = newAttempt("mock", mockIds("04"), "完整模考 04", 1000);
    assert.equal((await save(expandedMock, -1)).revision, 0);
    const restoredMock = parseAttempt((await save(expandedMock, 0)).data);
    assert.deepEqual(restoredMock.ids, expandedMock.ids);
    await db.exec("reset role");
    assert.equal(
      (
        await db.query<{ n: number }>(
          "select count(*)::int as n from public.toice_attempts",
        )
      ).rows[0].n,
      2,
    );
  } finally {
    await db.close();
  }
});
