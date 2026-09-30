import test from "node:test";
import assert from "node:assert/strict";
import {
  DAY,
  dateKey,
  defaultState,
  daysLeft,
  isDate,
  optionsFor,
  parseBackup,
  quizAnswer,
  quizQueue,
  review,
  schedule,
  streak,
  studyQueue,
} from "../lib/learning.ts";
import { words, categories } from "../lib/vocabulary.ts";
import { distractors } from "../lib/distractors.ts";
const now = new Date(2026, 8, 25, 12).getTime();
test("forgotten cards return after 10 minutes and preserve first-seen date", () => {
  const p = schedule(undefined, "good", now);
  const again = schedule(p, "again", now + DAY);
  assert.equal(again.due, now + DAY + 600000);
  assert.equal(again.interval, 0);
  assert.equal(again.firstSeen, now);
  assert.equal(again.lapses, 1);
  assert.equal(again.reviews, 2);
});
test("correct recall increases intervals; hard recall returns tomorrow", () => {
  let p = schedule(undefined, "good", now);
  assert.equal(p.interval, 1);
  p = schedule(p, "good", p.due);
  assert.equal(p.interval, 3);
  p = schedule(p, "good", p.due);
  assert.equal(p.interval, 7);
  assert.equal(schedule(p, "hard", now).due, now + DAY);
  for (let i = 0; i < 10; i++) p = schedule(p, "good", p.due);
  assert.equal(p.interval, 60);
});
test("daily quota, due-first ordering and tomorrow replenishment", () => {
  let s = defaultState(now);
  s.settings.dailyNew = 5;
  for (const w of words.slice(0, 5)) s = review(s, w.id, "good", now);
  assert.deepEqual(studyQueue(s, now), []);
  s = review(s, words[0].id, "again", now);
  assert.deepEqual(studyQueue(s, now + 600000), [words[0].id]);
  const tomorrow = studyQueue(s, now + DAY);
  assert.equal(tomorrow.length, 10);
  assert.equal(tomorrow[0], words[0].id);
});
test("wrong quiz answer queues a review and right answers do not inflate mastery", () => {
  const initial = defaultState(now);
  const wrong = quizAnswer(initial, "reimburse", false, now);
  assert.equal(wrong.cards.reimburse.due, now + 600000);
  assert.equal(wrong.logs.length, 1);
  assert.equal(
    quizAnswer(initial, "applicant", true, now).cards.applicant,
    undefined,
  );
});
test("backup round-trip and invalid imports are rejected", () => {
  const s = review(defaultState(now), "applicant", "good", now);
  s.favorites = ["applicant"];
  assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(s))), s);
  for (const invalid of [
    null,
    {},
    { ...s, version: 2 },
    { ...s, settings: { ...s.settings, examDate: "2026-02-30" } },
    { ...s, cards: { unknown: s.cards.applicant } },
    { ...s, favorites: ["unknown"] },
    {
      ...s,
      logs: [
        {
          at: now,
          wordId: "applicant",
          kind: "review",
          correct: true,
          grade: "invalid",
        },
      ],
    },
  ])
    assert.throws(() => parseBackup(invalid));
});
test("calendar and streak calculations respect local day boundaries", () => {
  assert.equal(daysLeft(defaultState(now).settings.examDate, now), 60);
  assert.equal(daysLeft("2026-09-24", now), 0);
  assert.equal(isDate("2026-02-30"), false);
  let s = review(defaultState(now), "applicant", "good", now - DAY);
  s = review(s, "recruit", "good", now);
  assert.equal(streak(s, now), 2);
  assert.equal(streak(s, now + DAY), 2);
  assert.equal(streak(s, now + 2 * DAY), 0);
  assert.equal(dateKey(now), "2026-09-25");
});
test("all 900 vocabulary entries have complete content and valid quiz choices", () => {
  assert.equal(words.length, 900);
  assert.equal(categories.length, 18);
  assert.equal(new Set(words.map((w) => w.id)).size, 900);
  assert.equal(words.filter((w) => w.quizType === "meaning").length, 828);
  for (const w of words) {
    if (w.quizType === "meaning") {
      assert.equal(w.question, w.example);
      assert.ok(new RegExp(`\\b${w.word}\\b`, "i").test(w.phrase));
      assert.equal(
        w.exampleIpa.split(" ").length,
        w.example.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length,
        `${w.id}: every example token has IPA`,
      );
    } else {
      assert.ok(w.question.includes("_____"));
      assert.equal(w.question.replace("_____", w.word), w.example);
    }
    assert.ok(w.example && w.translation && w.phrase && w.explanation);
    assert.ok(w.ipa && w.exampleIpa, `${w.id} needs word and sentence IPA`);
    assert.ok(
      w.exampleIpa.includes(w.ipa),
      `${w.id} pronunciation matches its example`,
    );
    const choices = optionsFor(w.id);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.ok(choices.includes(w.id));
    assert.equal(distractors[w.id].length, 3);
    assert.ok(choices.every((id) => words.some((word) => word.id === id)));
    if (w.quizType === "meaning") {
      assert.equal(
        new Set(
          choices.map((id) => words.find((word) => word.id === id)!.meaning),
        ).size,
        4,
      );
    }
  }
});

test("the original 72-word backup retains progress and unlocks new topics", () => {
  let state = defaultState(now - 2 * DAY);
  const starters = words.slice(0, 72);
  assert.equal(starters[0].id, "applicant");
  assert.equal(starters[71].id, "policy");
  for (const word of starters) {
    state = review(state, word.id, "good", now - 2 * DAY);
    state.cards[word.id].due = now + DAY;
  }
  state.favorites = ["applicant", "reimburse"];
  const restored = parseBackup(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  const queue = studyQueue(restored, now);
  assert.equal(queue.length, state.settings.dailyNew);
  assert.deepEqual(queue.slice(0, 5), [
    "employee",
    "meeting",
    "passport",
    "order",
    "account",
  ]);
  assert.ok(queue.every((id) => !starters.some((word) => word.id === id)));
  const updated = review(restored, "employee", "good", now);
  assert.deepEqual(updated.cards.applicant, restored.cards.applicant);
  assert.ok(updated.cards.employee);
  assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(updated))), updated);
});

test("new words support quiz grading, scheduling and sense-specific IPA", () => {
  const word = words.find((w) => w.id === "resume")!;
  assert.equal(word.ipa, "ˈrɛzəmeɪ");
  assert.equal(words.find((w) => w.id === "wind")!.ipa, "wɪnd");
  assert.equal(words.find((w) => w.id === "permit")!.ipa, "ˈpɜrmɪt");
  const state = quizAnswer(defaultState(now), word.id, false, now);
  assert.equal(state.cards.resume.due, now + 10 * 60 * 1000);
  assert.equal(quizQueue(state)[0], "resume");
  assert.ok(optionsFor("resume").includes("resume"));
});
test("quiz prioritizes weak words and has no duplicate questions", () => {
  const s = review(defaultState(now), "reimburse", "again", now);
  const ids = quizQueue(s);
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  assert.equal(ids[0], "reimburse");
});
