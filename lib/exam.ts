import bank from "./exam-bank.json" with { type: "json" };
import summary from "./exam-summary.json" with { type: "json" };
import { words } from "./vocabulary.ts";
import type { Attempt, Part, Question, Answer } from "./exam-types.ts";
export const questions = bank as Question[];
export const questionMap = new Map(questions.map((q) => [q.id, q]));
export const wordMap = new Map(words.map((w) => [w.id, w]));
export const mockCounts = [6, 25, 39, 30, 30, 16, 54];
export const examSummary = summary;
export const mockSets = summary.mocks;
export type PracticeFilter = {
  topic?: string;
  unseen?: boolean;
  seenIds?: ReadonlySet<string>;
};
export function practiceGroups(
  part: Part | 0 = 0,
  skill = "",
  filter: PracticeFilter = {},
) {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.pool !== "practice" || (part && q.part !== part)) continue;
    const key = q.group || q.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }
  // Match a skill at group level so other questions from the same passage stay together.
  return [...groups.values()].filter(
    (group) =>
      (!skill || group.some((q) => q.skill === skill)) &&
      (!filter.topic || group.some((q) => q.topic === filter.topic)) &&
      (!filter.unseen || !group.some((q) => filter.seenIds?.has(q.id))),
  );
}
export function normalizeSpelling(s: string) {
  return s
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}
export function isCorrect(a: Attempt, id: string) {
  const answer = a.answers[id];
  if (!answer) return false;
  return a.mode === "spelling" || a.mode === "dictation"
    ? normalizeSpelling(String(answer.choice)) ===
        normalizeSpelling(wordMap.get(id)?.word ?? "!")
    : answer.choice === questionMap.get(id)?.correct;
}
export function shuffled<T>(xs: T[], random = Math.random) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function selectPractice(
  part: Part | 0,
  count = 20,
  skill = "",
  random = Math.random,
  filter: PracticeFilter = {},
) {
  const groups = shuffled(practiceGroups(part, skill, filter), random);
  const queues = shuffled([1, 2, 3, 4, 5, 6, 7] as Part[], random).map((p) =>
    groups.filter((g) => g[0].part === p),
  );
  const result: string[] = [];
  // Round-robin parts prevents single-question grammar groups from dominating mixed practice.
  while (result.length < count && queues.some((q) => q.length)) {
    for (const queue of queues) {
      if (result.length >= count) break;
      const group = queue.shift();
      if (group) result.push(...group.map((q) => q.id));
    }
  }
  return result;
}
export function newAttempt(
  mode: Attempt["mode"],
  ids: string[],
  title: string,
  now = Date.now(),
): Attempt {
  return {
    id: crypto.randomUUID(),
    title,
    mode,
    ids,
    answers: {},
    startedAt: now,
    finishedAt: null,
    duration:
      mode === "mock"
        ? 7200000
        : mode === "mini"
          ? Math.ceil(ids.length * 1.2) * 60000
          : 0,
    index: 0,
    played: [],
  };
}
export function mockIds(setId = "01") {
  return questions
    .filter((q) => q.pool === "mock" && (q.mockSet || "01") === setId)
    .sort((a, b) => a.part - b.part)
    .map((q) => q.id);
}
export function examPhase(a: Attempt, now: number) {
  if (a.finishedAt) return "finished";
  if (a.duration && now >= a.startedAt + a.duration) return "expired";
  if (a.mode === "mock")
    return now < a.startedAt + 2700000 ? "listening" : "reading";
  return "open";
}
export function canAnswer(a: Attempt, index: number, now: number) {
  const phase = examPhase(a, now);
  if (phase === "finished" || phase === "expired") return false;
  const p = questionMap.get(a.ids[index])?.part ?? 5;
  return phase === "open" || (phase === "listening" ? p < 5 : p >= 5);
}
export function recordAnswer(
  a: Attempt,
  id: string,
  answer: Answer,
  now: number,
): Attempt {
  const index = a.ids.indexOf(id);
  if (index < 0 || !canAnswer(a, index, now)) return a;
  return { ...a, answers: { ...a.answers, [id]: answer } };
}
export function results(a: Attempt) {
  const correct = a.ids.filter((id) => isCorrect(a, id)).length;
  return {
    correct,
    total: a.ids.length,
    answered: Object.keys(a.answers).length,
    percent: Math.round((correct / a.ids.length) * 100),
    guessed: Object.values(a.answers).filter((x) => x.guessed).length,
  };
}
export function weakQuestions(attempts: Attempt[], now = Date.now()) {
  const stats = new Map<
    string,
    {
      id: string;
      last: number;
      misses: number;
      streak: number;
      due: number;
      guessed: boolean;
    }
  >();
  for (const a of [...attempts]
    .filter(
      (a) => a.finishedAt && a.mode !== "spelling" && a.mode !== "dictation",
    )
    .sort((a, b) => a.finishedAt! - b.finishedAt!)) {
    for (const id of a.ids) {
      const answer = a.answers[id];
      const bad = !isCorrect(a, id) || !!answer?.guessed;
      const old = stats.get(id);
      if (!old && !bad) continue;
      const streak = bad ? 0 : (old?.streak ?? 0) + 1;
      stats.set(id, {
        id,
        last: a.finishedAt!,
        misses: (old?.misses ?? 0) + (bad ? 1 : 0),
        streak,
        due:
          a.finishedAt! + (bad ? 600000 : streak >= 2 ? 604800000 : 86400000),
        guessed: !!answer?.guessed,
      });
    }
  }
  return [...stats.values()]
    .filter((s) => s.streak < 2)
    .sort((a, b) => a.due - b.due)
    .map((s) => ({ ...s, ready: s.due <= now }));
}
export function analytics(attempts: Attempt[]) {
  const done = attempts.filter(
    (a) => a.finishedAt && a.mode !== "spelling" && a.mode !== "dictation",
  );
  return ([1, 2, 3, 4, 5, 6, 7] as Part[]).map((part) => {
    let total = 0,
      correct = 0,
      ms = 0,
      guessed = 0,
      answered = 0;
    for (const a of done)
      for (const id of a.ids)
        if (questionMap.get(id)?.part === part) {
          total++;
          if (isCorrect(a, id)) correct++;
          if (a.answers[id]) {
            ms += a.answers[id].ms;
            answered++;
            if (a.answers[id].guessed) guessed++;
          }
        }
    return {
      part,
      total,
      correct,
      percent: total ? Math.round((correct / total) * 100) : 0,
      seconds: answered ? Math.round(ms / answered / 1000) : 0,
      guessed,
    };
  });
}
export function parseAttempt(value: unknown): Attempt {
  const a = value as Attempt;
  if (
    !a ||
    typeof a !== "object" ||
    !/^[-a-f0-9]{36}$/i.test(a.id) ||
    !["practice", "mini", "mock", "spelling", "dictation"].includes(a.mode) ||
    typeof a.title !== "string" ||
    a.title.length > 160 ||
    !Array.isArray(a.ids) ||
    !a.ids.length ||
    a.ids.length > 200 ||
    new Set(a.ids).size !== a.ids.length ||
    !Number.isFinite(a.startedAt) ||
    a.startedAt < 0 ||
    !Number.isInteger(a.index) ||
    a.index < 0 ||
    a.index >= a.ids.length ||
    !Number.isFinite(a.duration) ||
    a.duration < 0 ||
    a.duration > 7200000 ||
    (a.finishedAt !== null &&
      (!Number.isFinite(a.finishedAt) || a.finishedAt < a.startedAt)) ||
    !a.answers ||
    typeof a.answers !== "object" ||
    Array.isArray(a.answers) ||
    !Array.isArray(a.played) ||
    a.played.some((x) => typeof x !== "string" || x.length > 100)
  )
    throw Error("測驗紀錄格式不正確");
  const vocab = a.mode === "spelling" || a.mode === "dictation";
  if (a.ids.some((id) => !(vocab ? wordMap : questionMap).has(id)))
    throw Error("測驗題目不存在");
  if (
    a.mode === "mock" &&
    (a.duration !== 7200000 ||
      a.ids.join(",") !==
        mockIds(questionMap.get(a.ids[0])?.mockSet || "01").join(","))
  )
    throw Error("模考題目或時間設定不正確");
  for (const [id, x] of Object.entries(a.answers))
    if (
      !a.ids.includes(id) ||
      !x ||
      typeof x.guessed !== "boolean" ||
      !Number.isFinite(x.ms) ||
      x.ms < 0 ||
      x.ms > 86400000 ||
      (vocab
        ? typeof x.choice !== "string" || x.choice.length > 100
        : !Number.isInteger(x.choice) ||
          Number(x.choice) < 0 ||
          Number(x.choice) >= (questionMap.get(id)?.options.length ?? 0))
    )
      throw Error("答案格式不正確");
  return a;
}
