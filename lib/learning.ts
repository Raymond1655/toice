import { distractors } from "./distractors.ts";
import { words } from "./vocabulary.ts";
export type Grade = "again" | "hard" | "good";
export type CardProgress = {
  due: number;
  interval: number;
  reviews: number;
  lapses: number;
  firstSeen: number;
  lastReviewed: number;
};
export type Log = {
  at: number;
  wordId: string;
  kind: "review" | "quiz";
  correct: boolean;
  grade?: Grade;
};
export type State = {
  version: 1;
  startedAt: number;
  settings: { examDate: string; dailyNew: number; target: number };
  cards: Record<string, CardProgress>;
  favorites: string[];
  logs: Log[];
};
export const DAY = 86400000;
export function dateKey(timestamp: number) {
  const d = new Date(timestamp);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function defaultState(now = Date.now()): State {
  const date = new Date(now);
  date.setDate(date.getDate() + 60);
  return {
    version: 1,
    startedAt: now,
    settings: { examDate: dateKey(date.getTime()), dailyNew: 15, target: 700 },
    cards: {},
    favorites: [],
    logs: [],
  };
}
export function schedule(
  old: CardProgress | undefined,
  grade: Grade,
  now = Date.now(),
): CardProgress {
  const interval =
    grade === "again"
      ? 0
      : grade === "hard"
        ? 1
        : old?.interval
          ? Math.min(60, Math.max(3, Math.round(old.interval * 2.3)))
          : 1;
  return {
    due: now + (grade === "again" ? 10 * 60000 : interval * DAY),
    interval,
    reviews: (old?.reviews ?? 0) + 1,
    lapses: (old?.lapses ?? 0) + (grade === "again" ? 1 : 0),
    firstSeen: old?.firstSeen ?? now,
    lastReviewed: now,
  };
}
export function review(
  state: State,
  id: string,
  grade: Grade,
  now = Date.now(),
): State {
  return {
    ...state,
    cards: { ...state.cards, [id]: schedule(state.cards[id], grade, now) },
    logs: [
      ...state.logs,
      { at: now, wordId: id, kind: "review", correct: grade === "good", grade },
    ],
  };
}
export function quizAnswer(
  state: State,
  id: string,
  correct: boolean,
  now = Date.now(),
): State {
  const cards = { ...state.cards };
  if (!correct) cards[id] = schedule(cards[id], "again", now);
  return {
    ...state,
    cards,
    logs: [...state.logs, { at: now, wordId: id, kind: "quiz", correct }],
  };
}
export function studyQueue(state: State, now = Date.now()) {
  const due = words
    .filter((w) => state.cards[w.id]?.due <= now)
    .sort((a, b) => state.cards[a.id].due - state.cards[b.id].due);
  const todayNew = Object.values(state.cards).filter(
    (p) => dateKey(p.firstSeen) === dateKey(now),
  ).length;
  return [
    ...due,
    ...words
      .filter((w) => !state.cards[w.id])
      .slice(0, Math.max(0, state.settings.dailyNew - todayNew)),
  ].map((w) => w.id);
}
export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function quizQueue(state: State): string[] {
  const weak = shuffle(
    words.filter((w) => (state.cards[w.id]?.lapses ?? 0) > 0),
  );
  const seen = shuffle(
    words.filter((w) => state.cards[w.id] && !weak.some((x) => x.id === w.id)),
  );
  return [...weak, ...seen, ...shuffle(words.filter((w) => !state.cards[w.id]))]
    .slice(0, 10)
    .map((w) => w.id);
}
export function optionsFor(id: string): string[] {
  return shuffle([id, ...distractors[id]]);
}
export function streak(state: State, now = Date.now()) {
  const days = new Set(state.logs.map((l) => dateKey(l.at)));
  const d = new Date(now);
  let count = 0;
  if (!days.has(dateKey(d.getTime()))) d.setDate(d.getDate() - 1);
  while (days.has(dateKey(d.getTime()))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
export function daysLeft(examDate: string, now = Date.now()) {
  const [y, m, d] = examDate.split("-").map(Number);
  const today = new Date(now);
  return Math.max(
    0,
    Math.ceil(
      (Date.UTC(y, m - 1, d) -
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
        DAY,
    ),
  );
}
export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    y >= 2000 &&
    y <= 2100 &&
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}
function record(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function num(v: unknown, min = 0, max = 8640000000000000): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}
function integer(v: unknown, min = 0, max = 1000000): v is number {
  return num(v, min, max) && Number.isInteger(v);
}
export function parseBackup(value: unknown): State {
  const fail = (): never => {
    throw new Error("檔案格式不正確，請選擇 TOICE 匯出的 JSON 備份。");
  };
  if (
    !record(value) ||
    value.version !== 1 ||
    !num(value.startedAt) ||
    !record(value.settings) ||
    !record(value.cards) ||
    !Array.isArray(value.logs) ||
    !Array.isArray(value.favorites)
  )
    return fail();
  const s = value.settings;
  if (
    !isDate(s.examDate) ||
    !integer(s.dailyNew, 5, 30) ||
    !integer(s.target, 10, 990)
  )
    return fail();
  const known = new Set(words.map((w) => w.id));
  const cards: Record<string, CardProgress> = {};
  for (const [id, p] of Object.entries(value.cards)) {
    if (
      !known.has(id) ||
      !record(p) ||
      !num(p.due) ||
      !num(p.firstSeen) ||
      !num(p.lastReviewed) ||
      !integer(p.interval, 0, 60) ||
      !integer(p.reviews) ||
      !integer(p.lapses)
    )
      return fail();
    cards[id] = {
      due: p.due,
      firstSeen: p.firstSeen,
      lastReviewed: p.lastReviewed,
      interval: p.interval,
      reviews: p.reviews,
      lapses: p.lapses,
    };
  }
  if (
    value.logs.length > 100000 ||
    value.favorites.some((id) => typeof id !== "string" || !known.has(id))
  )
    return fail();
  const logs: Log[] = value.logs.map((l) => {
    if (
      !record(l) ||
      !num(l.at) ||
      typeof l.wordId !== "string" ||
      !known.has(l.wordId) ||
      (l.kind !== "review" && l.kind !== "quiz") ||
      typeof l.correct !== "boolean"
    )
      return fail();
    if (
      l.kind === "review" &&
      l.grade !== "again" &&
      l.grade !== "hard" &&
      l.grade !== "good"
    )
      return fail();
    return {
      at: l.at,
      wordId: l.wordId,
      kind: l.kind,
      correct: l.correct,
      ...(l.kind === "review" ? { grade: l.grade as Grade } : {}),
    };
  });
  return {
    version: 1,
    startedAt: value.startedAt,
    settings: { examDate: s.examDate, dailyNew: s.dailyNew, target: s.target },
    cards,
    favorites: [...new Set(value.favorites as string[])],
    logs,
  };
}
