"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createCloudApi, cloudError } from "@/lib/cloud-api";
import {
  defaultState,
  saveOperation,
  type Change,
  type CloudApi,
  type Operation,
  type Snapshot,
} from "@/lib/cloud-progress";
import type { State } from "@/lib/learning";

export function useCloudProgress(userId: string) {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const stateRef = useRef<State | null>(null);
  const snapshot = useRef<Snapshot | null>(null);
  const operation = useRef<Operation | null>(null);
  const api = useRef<CloudApi | null>(null);
  const locked = useRef(false);
  const lifecycle = useRef(0);
  const accept = useCallback((next: Snapshot) => {
    snapshot.current = next;
    stateRef.current = next.state;
    setState(next.state);
    setUpdatedAt(next.updatedAt);
    setError("");
  }, []);
  const refresh = useCallback(async () => {
    if (locked.current || operation.current || !api.current) return;
    const epoch = lifecycle.current;
    locked.current = true;
    setBusy(true);
    try {
      const next = await api.current.load(defaultState());
      if (epoch === lifecycle.current) accept(next);
    } catch (e) {
      if (epoch === lifecycle.current) setError(cloudError(e));
    } finally {
      if (epoch === lifecycle.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  }, [accept]);
  useEffect(() => {
    lifecycle.current++;
    locked.current = false;
    api.current = createCloudApi(userId);
    void refresh();
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(update, 30000);
    window.addEventListener("focus", update);
    window.addEventListener("online", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      lifecycle.current++;
      api.current = null;
      stateRef.current = null;
      clearInterval(timer);
      window.removeEventListener("focus", update);
      window.removeEventListener("online", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [userId, refresh]);
  useEffect(() => {
    if (!pending) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending]);
  const retry = useCallback(async (): Promise<boolean> => {
    if (
      locked.current ||
      !operation.current ||
      !api.current ||
      !snapshot.current
    )
      return false;
    const epoch = lifecycle.current;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await saveOperation(
        api.current,
        snapshot.current,
        operation.current,
      );
      if (epoch !== lifecycle.current) return false;
      accept(next);
      operation.current = null;
      setPending(false);
      return true;
    } catch (e) {
      if (epoch === lifecycle.current) setError(cloudError(e));
      return false;
    } finally {
      if (epoch === lifecycle.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  }, [accept]);
  const commit = useCallback(
    async (change: Change) => {
      if (locked.current || operation.current || !snapshot.current)
        return false;
      operation.current = { id: crypto.randomUUID(), at: Date.now(), change };
      setPending(true);
      return retry();
    },
    [retry],
  );
  return {
    state,
    stateRef,
    busy,
    pending,
    error,
    updatedAt,
    refresh,
    commit,
    retry,
  };
}
