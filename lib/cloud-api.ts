import { getSupabase } from "./supabase";
import {
  parseSnapshot,
  type CloudApi,
  type SaveResult,
} from "./cloud-progress";

export function cloudError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  if (code === "PGRST202" || code === "42P01")
    return "雲端資料庫尚未完成設定，請聯絡網站管理者。";
  if (["42501", "PGRST301", "PGRST303"].includes(code))
    return "登入狀態已失效或沒有權限，請重新登入。";
  return "無法連線至雲端，這次操作尚未確認儲存。請保持此頁開啟並重試。";
}
export function createCloudApi(userId: string): CloudApi {
  const client = getSupabase();
  if (!client) throw new Error("帳號服務尚未設定。");
  return {
    async load(initial) {
      const { data, error } = await client
        .rpc("toice_load_progress", { p_user_id: userId, p_initial: initial })
        .abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      return parseSnapshot(data);
    },
    async save(state, expectedRevision, operationId) {
      const { data, error } = await client
        .rpc("toice_save_progress", {
          p_user_id: userId,
          p_state: state,
          p_expected_revision: expectedRevision,
          p_operation_id: operationId,
        })
        .abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      const snapshot = parseSnapshot(data);
      if (!["saved", "conflict", "replayed"].includes(data.status))
        throw new Error("Unexpected save result");
      return { ...snapshot, status: data.status } as SaveResult;
    },
  };
}
