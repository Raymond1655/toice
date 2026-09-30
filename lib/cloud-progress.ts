import {
  defaultState,
  parseBackup,
  quizAnswer,
  review,
  type Grade,
  type State,
} from "./learning.ts";

export type Change =
  | { kind: "review"; wordId: string; grade: Grade }
  | { kind: "quiz"; wordId: string; correct: boolean }
  | { kind: "favorite"; wordId: string; selected: boolean }
  | { kind: "settings"; settings: State["settings"] };
export type Operation = { id: string; at: number; change: Change };
export type Snapshot = { state: State; revision: number; updatedAt: string };
export type SaveResult = Snapshot & {
  status: "saved" | "conflict" | "replayed";
};
export interface CloudApi {
  load(initial: State): Promise<Snapshot>;
  save(
    state: State,
    expectedRevision: number,
    operationId: string,
  ): Promise<SaveResult>;
}
export function parseSnapshot(value: unknown): Snapshot {
  if (!value || typeof value !== "object")
    throw new Error("雲端資料格式不正確。");
  const data = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(data.revision) ||
    (data.revision as number) < 0 ||
    typeof data.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(data.updatedAt))
  ) {
    throw new Error("雲端資料版本不正確。");
  }
  return {
    state: parseBackup(data.state),
    revision: data.revision as number,
    updatedAt: data.updatedAt,
  };
}
export function applyChange(state: State, operation: Operation): State {
  const c = operation.change;
  let next: State;
  if (c.kind === "review" || c.kind === "quiz") {
    // A slower device clock must not move a card's last review backwards.
    const at = Math.max(
      operation.at,
      (state.cards[c.wordId]?.lastReviewed ?? 0) + 1,
    );
    next =
      c.kind === "review"
        ? review(state, c.wordId, c.grade, at)
        : quizAnswer(state, c.wordId, c.correct, at);
  } else if (c.kind === "favorite") {
    next = {
      ...state,
      favorites: c.selected
        ? [...new Set([...state.favorites, c.wordId])]
        : state.favorites.filter((id) => id !== c.wordId),
    };
  } else {
    next = { ...state, settings: { ...c.settings } };
  }
  return parseBackup(next);
}
export async function saveOperation(
  api: CloudApi,
  snapshot: Snapshot,
  operation: Operation,
): Promise<Snapshot> {
  let base = snapshot;
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await api.save(
      applyChange(base.state, operation),
      base.revision,
      operation.id,
    );
    if (result.status !== "conflict") return result;
    base = result;
  }
  throw new Error("另一台裝置正在更新進度，請稍後重試。");
}
export { defaultState };
