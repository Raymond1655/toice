"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Annotation } from "@/lib/exam-types";

export function useVideoNotes(userId: string) {
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const result = await getSupabase()!
        .from("toice_annotations")
        .select("id,note,favorite")
        .eq("user_id", userId)
        .like("id", "yt:%")
        .abortSignal(AbortSignal.timeout(15000));
      if (result.error) throw result.error;
      setNotes(result.data ?? []);
      setError("");
    } catch {
      setError("影片收藏同步失敗，請檢查網路後重試。");
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const annotate = useCallback(
    async (id: string, note: string, favorite: boolean) => {
      setSaving(true);
      try {
        const result = await getSupabase()!
          .from("toice_annotations")
          .upsert(
            { user_id: userId, id, note: note.slice(0, 2000), favorite },
            { onConflict: "user_id,id" },
          )
          .abortSignal(AbortSignal.timeout(15000));
        if (result.error) throw result.error;
        setNotes((old) => [
          ...old.filter((item) => item.id !== id),
          { id, note: note.slice(0, 2000), favorite },
        ]);
        setError("");
        return true;
      } catch {
        setError("影片紀錄同步失敗，請稍後再試。");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [userId],
  );
  return { notes, loading, saving, error, refresh, annotate };
}
