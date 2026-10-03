import { dateKey, type State } from "./learning";

export const ranks = [
  { title: "單字新手", icon: "🌱" },
  { title: "字彙探險家", icon: "🧭" },
  { title: "商務解碼員", icon: "🗝️" },
  { title: "聽讀突擊手", icon: "🎧" },
  { title: "考場策略家", icon: "🛡️" },
  { title: "TOEIC 衝刺王", icon: "🏆" },
];

export function gameStats(state: State, now: number) {
  const logs = state.logs;
  const rewarded = new Set<string>();
  const xpLog = logs.filter((log) => {
    const key = `${dateKey(log.at)}:${log.kind}:${log.wordId}`;
    if (rewarded.has(key)) return false;
    rewarded.add(key);
    return true;
  });
  const points = (log: (typeof logs)[number]) =>
    log.kind === "review" ? 8 : log.correct ? 12 : 5;
  const xp = xpLog.reduce((sum, log) => sum + points(log), 0);
  const level = Math.floor(xp / 250) + 1;
  const currentRank =
    ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 3))];
  const today = dateKey(now);
  const todayLogs = logs.filter((log) => dateKey(log.at) === today);
  const reviewToday = new Set(
    todayLogs.filter((log) => log.kind === "review").map((log) => log.wordId),
  ).size;
  const quizToday = todayLogs.filter((log) => log.kind === "quiz").length;
  const quizCorrectToday = todayLogs.filter(
    (log) => log.kind === "quiz" && log.correct,
  ).length;
  const week = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - offset));
    const key = dateKey(date.getTime());
    return { key, count: logs.filter((log) => dateKey(log.at) === key).length };
  });
  const learned = Object.keys(state.cards).length;
  const perfectQuiz = new Set(
    logs
      .filter((log) => log.kind === "quiz" && log.correct)
      .map((log) => log.wordId),
  ).size;
  return {
    xp,
    level,
    currentRank,
    levelProgress: xp % 250,
    todayXp: xpLog
      .filter((log) => dateKey(log.at) === today)
      .reduce((sum, log) => sum + points(log), 0),
    reviewToday,
    quizToday,
    quizCorrectToday,
    week,
    badges: [
      { title: "初次出發", icon: "🚩", unlocked: logs.length > 0 },
      { title: "字彙收藏家", icon: "📚", unlocked: learned >= 50 },
      { title: "答題連勝", icon: "⚡", unlocked: perfectQuiz >= 20 },
      {
        title: "七日不缺席",
        icon: "🔥",
        unlocked: week.every((day) => day.count > 0),
      },
    ],
  };
}
