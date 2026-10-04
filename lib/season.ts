import type { Attempt } from "./exam-types";
import type { State } from "./learning";
import { isCorrect, questionMap } from "./exam";
import { gameStats } from "./gamification";

export const seasonStart = new Date(2026, 9, 1).getTime();
export const seasonLength = 28 * 24 * 60 * 60 * 1000;
export function seasonInfo(now: number, state: State, attempts: Attempt[]) {
  const index = Math.max(0, Math.floor((now - seasonStart) / seasonLength));
  const start = seasonStart + index * seasonLength;
  const end = start + seasonLength;
  const seasonAttempts = attempts.filter(
    (a) => a.startedAt >= start && a.startedAt < end,
  );
  const seasonLogs = state.logs.filter(
    (log) => log.at >= start && log.at < end,
  );
  const xp =
    seasonLogs.reduce(
      (sum, log) => sum + (log.kind === "review" ? 8 : log.correct ? 12 : 5),
      0,
    ) +
    seasonAttempts.reduce(
      (sum, a) => sum + (a.finishedAt ? Object.keys(a.answers).length * 3 : 0),
      0,
    );
  const lifetimeXp =
    gameStats(state, now).xp +
    attempts.reduce(
      (sum, a) => sum + (a.finishedAt ? Object.keys(a.answers).length * 3 : 0),
      0,
    );
  return {
    index: index + 1,
    start,
    end,
    xp,
    lifetimeXp,
    level: Math.min(20, Math.floor(lifetimeXp / 200) + 1),
    progress: Math.min(100, Math.floor((lifetimeXp % 200) / 2)),
  };
}

export function todayProgress(now: number, state: State, attempts: Attempt[]) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const start = d.getTime();
  const logs = state.logs.filter((log) => log.at >= start && log.at <= now);
  const todayAttempts = attempts.filter(
    (a) => a.startedAt >= start && a.startedAt <= now,
  );
  const answered = todayAttempts.reduce(
    (sum, a) => sum + Object.keys(a.answers).length,
    0,
  );
  const reviews = logs.filter((log) => log.kind === "review").length;
  const listened = todayAttempts.filter(
    (a) =>
      a.title.startsWith("【聽力專項】") &&
      a.finishedAt &&
      a.ids.every((id) => {
        const question = questionMap.get(id);
        return !question?.audio || a.played.includes(question.group || id);
      }),
  ).length;
  const revenge = todayAttempts.filter(
    (a) => a.title.startsWith("【錯題復仇】") && a.finishedAt,
  ).length;
  return [
    {
      id: "review",
      label: "單字複習 10 張",
      current: reviews,
      target: 10,
      action: "go-vocabulary",
    },
    {
      id: "answer",
      label: "完成 12 題訓練",
      current: answered,
      target: 12,
      action: "adaptive",
    },
    {
      id: "listen",
      label: "完成一回聽力任務",
      current: listened,
      target: 1,
      action: "listening",
    },
    {
      id: "revenge",
      label: "完成一場錯題復仇",
      current: revenge,
      target: 1,
      action: "revenge",
    },
  ];
}

export function storyAffinity(attempts: Attempt[], character: string) {
  return attempts
    .filter((a) => a.title.startsWith(`【支線:${character}】`) && a.finishedAt)
    .reduce((sum, a) => sum + a.ids.filter((id) => isCorrect(a, id)).length, 0);
}
