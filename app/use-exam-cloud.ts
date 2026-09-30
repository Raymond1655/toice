"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { parseAttempt } from "@/lib/exam";
import type { Attempt, AttemptRow, Annotation } from "@/lib/exam-types";
export function useExamCloud(userId: string) {
  const [rows, setRows] = useState<AttemptRow[]>([]),
    [notes, setNotes] = useState<Annotation[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const current = useRef(rows),
    locked = useRef(false),
    alive = useRef(true),
    pending = useRef<{ data: Attempt; revision: number; op: string } | null>(
      null,
    );
  const [needsRetry, setNeedsRetry] = useState(false);
  const accept = (row: AttemptRow) => {
    current.current = [row, ...current.current.filter((r) => r.id !== row.id)];
    setRows(current.current);
  };
  const refresh = useCallback(async () => {
    if (locked.current || pending.current) return;
    locked.current = true;
    setLoading(true);
    try {
      const client = getSupabase()!;
      const all: AttemptRow[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await client
          .from("toice_attempts")
          .select("id,revision,data")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .range(offset, offset + 499)
          .abortSignal(AbortSignal.timeout(15000));
        if (result.error) throw result.error;
        for (const row of result.data)
          all.push({ ...row, data: parseAttempt(row.data) });
        if (result.data.length < 500) break;
      }
      const annotations: Annotation[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await client
          .from("toice_annotations")
          .select("id,note,favorite")
          .eq("user_id", userId)
          .order("id")
          .range(offset, offset + 499)
          .abortSignal(AbortSignal.timeout(15000));
        if (result.error) throw result.error;
        annotations.push(...result.data);
        if (result.data.length < 500) break;
      }
      if (alive.current) {
        current.current = all;
        setRows(all);
        setNotes(annotations);
        setError("");
      }
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    } finally {
      locked.current = false;
      if (alive.current) setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => {
      alive.current = false;
    };
  }, [refresh]);
  async function retry(): Promise<Attempt | null> {
    if (locked.current || !pending.current) return null;
    locked.current = true;
    setSaving(true);
    setError("");
    try {
      const p = pending.current;
      const { data, error } = await getSupabase()!
        .rpc("toice_save_attempt", {
          p_data: p.data,
          p_revision: p.revision,
          p_operation: p.op,
        })
        .abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      const row = {
        id: data.id,
        revision: data.revision,
        data: parseAttempt(data.data),
      };
      if (alive.current) accept(row);
      pending.current = null;
      setNeedsRetry(false);
      if (data.status === "conflict")
        setError(
          "另一台裝置已更新這場測驗，已載入雲端版本；請確認目前答案再繼續。",
        );
      return row.data;
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
      return null;
    } finally {
      locked.current = false;
      if (alive.current) setSaving(false);
    }
  }
  async function save(a: Attempt) {
    if (locked.current || pending.current) return null;
    parseAttempt(a);
    pending.current = {
      data: a,
      revision: current.current.find((r) => r.id === a.id)?.revision ?? -1,
      op: crypto.randomUUID(),
    };
    setNeedsRetry(true);
    return retry();
  }
  async function annotate(id: string, note: string, favorite: boolean) {
    if (locked.current || pending.current) return false;
    locked.current = true;
    setSaving(true);
    try {
      const { error } = await getSupabase()!
        .from("toice_annotations")
        .upsert(
          { user_id: userId, id, note: note.slice(0, 2000), favorite },
          { onConflict: "user_id,id" },
        )
        .abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      setNotes((old) => [
        ...old.filter((n) => n.id !== id),
        { id, note, favorite },
      ]);
      setError("");
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      locked.current = false;
      setSaving(false);
    }
  }
  useEffect(() => {
    if (!needsRetry) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [needsRetry]);
  return {
    rows,
    notes,
    loading,
    saving,
    error,
    needsRetry,
    refresh,
    save,
    retry,
    annotate,
  };
}
function errorMessage(e: unknown) {
  const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
  if (["42P01", "PGRST202", "PGRST205"].includes(code))
    return "練習中心資料庫尚未啟用。請在 Supabase 執行 202610010001_exam_center.sql，然後重試。";
  if (code === "42501") return "帳號權限已失效，請重新登入。";
  return "尚未確認儲存，請保持此頁開啟並重試；已同步的紀錄會保留。";
}
