"use client";
import dynamic from "next/dynamic";
import { Phonetic } from "./phonetic";
import { AuthGate } from "./auth-gate";
import { useCloudProgress } from "./use-cloud-progress";
import type { Session } from "@supabase/supabase-js";
import type { Change } from "@/lib/cloud-progress";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronRight,
  Cloud,
  LogOut,
  RefreshCw,
  Download,
  Flame,
  LayoutDashboard,
  Leaf,
  ListChecks,
  Search,
  Settings2,
  Star,
  Target,
  Volume2,
  X,
} from "lucide-react";
import { words, type Word } from "@/lib/vocabulary";
import {
  dateKey,
  isDate,
  optionsFor,
  quizQueue,
  streak,
  studyQueue,
  type Grade,
  type State,
} from "@/lib/learning";
import { Dashboard, Library, Progress, Study, Quiz } from "./views";
const ExamCenter = dynamic(() => import("./exam-center"), {
  loading: () => <p>正在載入練習中心…</p>,
});
export type View =
  "today" | "study" | "quiz" | "library" | "progress" | "academy";
const nav = [
  { id: "today", label: "今日衝刺", icon: LayoutDashboard },
  { id: "study", label: "單字卡", icon: BookOpen },
  { id: "quiz", label: "每日測驗", icon: ListChecks },
  { id: "academy", label: "多益練習", icon: Target },
  { id: "library", label: "單字庫", icon: Search },
  { id: "progress", label: "學習進度", icon: ChartNoAxesColumnIncreasing },
] as const;
export type Shared = {
  state: State;
  now: number;
  speak: (text: string) => void;
  favorite: (id: string) => void;
  showWord: (word: Word) => void;
  startStudy: () => void;
  startQuiz: () => void;
};
export default function Home() {
  return (
    <AuthGate>
      {(session, signOut) => (
        <LearningWorkspace
          key={session.user.id}
          session={session}
          signOut={signOut}
        />
      )}
    </AuthGate>
  );
}
function LearningWorkspace({
  session,
  signOut,
}: {
  session: Session;
  signOut: () => Promise<void>;
}) {
  const cloud = useCloudProgress(session.user.id);
  const { state, stateRef } = cloud;
  const [view, setView] = useState<View>("today"),
    [now, setNow] = useState(0);
  const [notice, setNotice] = useState(""),
    [queue, setQueue] = useState<string[]>([]),
    [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false),
    [sessionDone, setSessionDone] = useState(0);
  const [quiz, setQuiz] = useState<string[]>([]),
    [qi, setQi] = useState(0),
    [options, setOptions] = useState<string[]>([]),
    [answer, setAnswer] = useState<string | null>(null),
    [score, setScore] = useState(0),
    [finished, setFinished] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [backupLink, setBackupLink] = useState<{
    url: string;
    name: string;
  } | null>(null);
  useEffect(
    () => () => {
      if (backupLink) URL.revokeObjectURL(backupLink.url);
    },
    [backupLink],
  );
  const [draftDate, setDraftDate] = useState(""),
    [draftDaily, setDraftDaily] = useState(15),
    [draftTarget, setDraftTarget] = useState(700);
  const settingsDialog = useRef<HTMLDialogElement>(null),
    wordDialog = useRef<HTMLDialogElement>(null);
  const actionLock = useRef(false);
  const afterSave = useRef<(() => void) | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [examBusy, setExamBusy] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const commit = useCallback(
    async (change: Change, saved?: () => void) => {
      if (cloud.busy || cloud.pending || signingOut) return;
      afterSave.current = saved ?? null;
      if (await cloud.commit(change)) {
        afterSave.current?.();
        afterSave.current = null;
        setNow(Date.now());
      }
    },
    [cloud.busy, cloud.pending, cloud.commit, signingOut],
  );
  async function retrySync() {
    if (cloud.pending) {
      if (await cloud.retry()) {
        afterSave.current?.();
        afterSave.current = null;
        setNow(Date.now());
      }
    } else await cloud.refresh();
  }
  async function logout() {
    if (cloud.busy || signingOut || examBusy) return;
    if (
      cloud.pending &&
      !window.confirm(
        "有一筆操作尚未確認儲存。登出會放棄這次待重試操作；已送達雲端的紀錄仍會保留。確定登出？",
      )
    )
      return;
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setNotice("登出失敗，請檢查網路後重試。");
    } finally {
      setSigningOut(false);
    }
  }
  const startStudy = useCallback(() => {
    if (!stateRef.current) return;
    setQueue(studyQueue(stateRef.current, Date.now()));
    setIndex(0);
    setFlipped(false);
    setSessionDone(0);
    setView("study");
  }, []);
  const startQuiz = useCallback(() => {
    if (!stateRef.current) return;
    const ids = quizQueue(stateRef.current);
    setQuiz(ids);
    setQi(0);
    setOptions(optionsFor(ids[0]));
    setAnswer(null);
    setScore(0);
    setFinished(false);
    setView("quiz");
  }, []);
  const go = (next: View) => {
    if (examBusy) {
      setNotice("請先完成測驗同步或儲存筆記，再切換頁面。");
      return;
    }
    if (cloud.pending || signingOut) return;
    if (next === "study") startStudy();
    else if (next === "quiz") startQuiz();
    else setView(next);
  };
  const gradeCard = useCallback(
    async (grade: Grade) => {
      if (!flipped || !queue[index] || !stateRef.current || actionLock.current)
        return;
      actionLock.current = true;
      await commit({ kind: "review", wordId: queue[index], grade }, () => {
        setIndex((i) => i + 1);
        setSessionDone((n) => n + 1);
        setFlipped(false);
      });
      actionLock.current = false;
    },
    [flipped, queue, index, commit],
  );
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        view !== "study" ||
        el.closest("input,select,textarea,button,dialog") ||
        document.querySelector("dialog[open]") ||
        e.repeat
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped && ["1", "2", "3"].includes(e.key))
        gradeCard(
          ({ 1: "again", 2: "hard", 3: "good" } as Record<string, Grade>)[
            e.key
          ],
        );
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [view, flipped, gradeCard]);
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => unknown;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (t: Tool, o: { signal: AbortSignal }) => unknown;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "read_learning_progress",
            description:
              "Read the signed-in user's loaded TOICE learning progress without changing it.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute(input) {
              if (
                !input ||
                typeof input !== "object" ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error("Expected an empty object");
              const s = stateRef.current;
              if (!s) throw new Error("Learning data is loading");
              return {
                learned: Object.keys(s.cards).length,
                total: words.length,
                due: words.filter((w) => s.cards[w.id]?.due <= Date.now())
                  .length,
                examDate: s.settings.examDate,
                target: s.settings.target,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setNotice("此瀏覽器不支援朗讀，請改用 Chrome 或 Edge。");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    const voice =
      window.speechSynthesis.getVoices().find((v) => v.lang === "en-US") ??
      window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled")
        setNotice("目前無法播放語音，請確認裝置已安裝英文語音並稍後重試。");
    };
    window.speechSynthesis.speak(utterance);
  }
  function favorite(id: string) {
    const s = stateRef.current;
    if (s)
      void commit({
        kind: "favorite",
        wordId: id,
        selected: !s.favorites.includes(id),
      });
  }
  function openSettings() {
    if (!state) return;
    setDraftDate(state.settings.examDate);
    setDraftDaily(state.settings.dailyNew);
    setDraftTarget(state.settings.target);
    settingsDialog.current?.showModal();
  }
  function showWord(word: Word) {
    setSelectedWord(word);
    wordDialog.current?.showModal();
  }
  function download(content: string, name: string) {
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    setBackupLink({ url, name });
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.style.display = "none";
    (document.querySelector("dialog[open]") ?? document.body).appendChild(a);
    a.click();
    a.remove();
  }
  function exportBackup() {
    if (!state) return;
    download(
      JSON.stringify(state, null, 2),
      "toice-backup-" + dateKey(Date.now()) + ".json",
    );
    setNotice("備份已準備。若未自動下載，請點選「下載備份檔」。");
  }
  async function chooseAnswer(id: string) {
    if (answer !== null || !stateRef.current || actionLock.current) return;
    actionLock.current = true;
    const correct = id === quiz[qi];
    await commit({ kind: "quiz", wordId: quiz[qi], correct }, () => {
      setAnswer(id);
      if (correct) setScore((s) => s + 1);
    });
    actionLock.current = false;
  }
  function nextQuestion() {
    if (qi + 1 === quiz.length) {
      setFinished(true);
      return;
    }
    setQi((q) => q + 1);
    setOptions(optionsFor(quiz[qi + 1]));
    setAnswer(null);
  }
  const due = state
    ? words.filter((w) => state.cards[w.id]?.due <= now).length
    : 0;
  const shared: Shared | null = state
    ? { state, now, speak, favorite, showWord, startStudy, startQuiz }
    : null;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="TOICE 首頁">
          <span className="brand-mark">
            t<span>.</span>
          </span>
          <span>
            toice<span className="brand-caption">YOUR DAILY TOEIC</span>
          </span>
        </a>
        <div className="workspace-label">我的學習空間</div>
        <nav aria-label="主要導覽">
          {nav.map((item) => (
            <button
              key={item.id}
              className={"nav-item " + (view === item.id ? "active" : "")}
              onClick={() => go(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.id === "study" && due > 0 && <b>{due}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="goal-card">
            <div>
              <Settings2 size={18} />
              <span>我的目標</span>
              <button
                className="icon-btn"
                aria-label="編輯學習目標"
                onClick={openSettings}
              >
                <Settings2 size={16} />
              </button>
            </div>
            <p>
              400 <ArrowRight size={18} />{" "}
              <strong>{state?.settings.target ?? 700}</strong>
              <small>分</small>
            </p>
            <div className="goal-line">
              <span
                style={{
                  width:
                    (state
                      ? (Object.keys(state.cards).length / words.length) * 100
                      : 0) + "%",
                }}
              />
            </div>
            <small>一步一步，累積你的實力。</small>
          </div>
          <button className="nav-item settings-nav" onClick={openSettings}>
            <Settings2 size={20} />
            學習設定與備份
          </button>
          <div className="profile">
            <div className="avatar">
              {session.user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <strong>我的衝刺計畫</strong>
              <span className="account-email" title={session.user.email}>
                {session.user.email}
              </span>
            </div>
            <Leaf size={18} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            我的學習空間 <ChevronRight size={14} />{" "}
            <strong>{nav.find((n) => n.id === view)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="streak">
              <Flame size={17} /> {state ? streak(state, now) : 0} 天連續學習
            </span>
            <button
              className="icon-btn"
              aria-label="登出帳號"
              title="登出帳號"
              disabled={cloud.busy || signingOut || examBusy}
              onClick={() => void logout()}
            >
              <LogOut size={19} />
            </button>
            <button
              className="small-avatar"
              aria-label="開啟設定"
              onClick={openSettings}
            >
              {session.user.email?.[0]?.toUpperCase() ?? "U"}
            </button>
          </div>
        </header>
        <main>
          <div
            className={"cloud-status " + (cloud.error ? "cloud-error" : "")}
            role={cloud.error ? "alert" : "status"}
          >
            <Cloud size={18} />
            <span>
              {cloud.error ||
                (cloud.busy
                  ? cloud.pending
                    ? "正在儲存進度…"
                    : "正在讀取雲端進度…"
                  : cloud.updatedAt
                    ? `已同步 · ${new Date(cloud.updatedAt).toLocaleTimeString("zh-TW")}`
                    : "正在準備學習空間…")}
            </span>
            <button
              className="text-btn"
              disabled={cloud.busy || signingOut}
              onClick={() => void retrySync()}
            >
              <RefreshCw size={15} />
              {cloud.error ? "重試" : "同步"}
            </button>
          </div>
          {!state || !shared ? (
            <div className="loading">
              <span className="brand-mark">t.</span>
              <p>
                {cloud.error
                  ? "暫時無法載入學習紀錄，請重試或登出後重新登入。"
                  : "正在讀取你的學習進度…"}
              </p>
            </div>
          ) : (
            <div inert={cloud.busy || cloud.pending || signingOut}>
              {view === "today" && (
                <>
                  <div className="training-entry">
                    <div>
                      <strong>全新多益練習中心</strong>
                      <span>
                        Part 1–7 · 516 題 · 聽寫、错題複習與 200 題模考
                      </span>
                    </div>
                    <button
                      className="primary-btn"
                      onClick={() => go("academy")}
                    >
                      開始練習 <ArrowRight size={17} />
                    </button>
                  </div>
                  <Dashboard {...shared} openSettings={openSettings} />
                </>
              )}
              {view === "academy" && (
                <ExamCenter
                  userId={session.user.id}
                  state={state}
                  onBusy={setExamBusy}
                />
              )}
              {view === "study" && (
                <Study
                  {...shared}
                  queue={queue}
                  index={index}
                  flipped={flipped}
                  flip={() => setFlipped(true)}
                  grade={gradeCard}
                  sessionDone={sessionDone}
                  exit={() => setView("today")}
                />
              )}
              {view === "quiz" && (
                <Quiz
                  {...shared}
                  quiz={quiz}
                  qi={qi}
                  options={options}
                  answer={answer}
                  score={score}
                  finished={finished}
                  choose={chooseAnswer}
                  next={nextQuestion}
                />
              )}
              {view === "library" && <Library {...shared} />}
              {view === "progress" && (
                <Progress {...shared} exportBackup={exportBackup} />
              )}
              <footer>
                <span>
                  <span className="footer-brand">toice.</span> 每天前進一點點。
                </span>
                <span>
                  <Cloud size={14} />
                  帳號進度・雲端儲存
                </span>
              </footer>
            </div>
          )}
        </main>
      </div>
      <dialog
        ref={settingsDialog}
        className="modal"
        aria-labelledby="settings-title"
      >
        <div className="section-head">
          <h2 id="settings-title">學習設定與備份</h2>
          <button
            className="icon-btn"
            aria-label="關閉設定"
            onClick={() => settingsDialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !state ||
              !isDate(draftDate) ||
              draftDaily < 5 ||
              draftDaily > 30 ||
              draftTarget < 10 ||
              draftTarget > 990
            )
              return;
            void commit(
              {
                kind: "settings",
                settings: {
                  examDate: draftDate,
                  dailyNew: draftDaily,
                  target: draftTarget,
                },
              },
              () => {
                settingsDialog.current?.close();
                setNotice("學習設定已儲存到雲端。");
              },
            );
          }}
        >
          <label>
            考試日期
            <input
              type="date"
              required
              min="2000-01-01"
              max="2100-12-31"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </label>
          <div className="form-row">
            <label>
              每日新字上限
              <input
                type="number"
                required
                min={5}
                max={30}
                value={draftDaily}
                onChange={(e) => setDraftDaily(Number(e.target.value))}
              />
            </label>
            <label>
              目標分數
              <input
                type="number"
                required
                min={10}
                max={990}
                step={5}
                value={draftTarget}
                onChange={(e) => setDraftTarget(Number(e.target.value))}
              />
            </label>
          </div>
          <p className="form-hint">
            複習優先，新字每天補足額度。調整後重新進入單字卡即生效。
          </p>
          <button
            type="submit"
            className="primary-btn full"
            disabled={cloud.busy || cloud.pending}
          >
            {cloud.pending ? "儲存中…" : "儲存設定"} <Check size={17} />
          </button>
        </form>
        {cloud.error && (
          <p role="alert" className="auth-error">
            {cloud.error}
            <button
              className="text-btn"
              disabled={cloud.busy}
              onClick={() => void retrySync()}
            >
              重試同步
            </button>
          </p>
        )}
        {notice && (
          <p role="status" className="dialog-notice">
            {notice}
          </p>
        )}
        {backupLink && (
          <a
            className="backup-download"
            href={backupLink.url}
            download={backupLink.name}
          >
            下載備份檔
          </a>
        )}
        <div className="backup-section">
          <h3>保留你的學習紀錄</h3>
          <p>
            進度儲存在你的帳號，換裝置登入即可接續。也可以下載一份紀錄自行保留。
          </p>
          <p className="account-email">登入帳號：{session.user.email}</p>
          <div className="button-row">
            <button className="secondary-btn" onClick={exportBackup}>
              <Download size={17} />
              匯出備份
            </button>
            <button
              className="secondary-btn"
              onClick={() => void logout()}
              disabled={cloud.busy || signingOut}
            >
              <LogOut size={17} />
              登出帳號
            </button>
          </div>
        </div>
      </dialog>
      <dialog
        ref={wordDialog}
        className="modal word-modal"
        aria-label="單字詳情"
      >
        <div className="section-head">
          <span className="tiny-label">WORD DETAILS</span>
          <button
            className="icon-btn"
            aria-label="關閉單字詳情"
            onClick={() => wordDialog.current?.close()}
          >
            <X />
          </button>
        </div>
        {selectedWord && (
          <>
            <div className="word-category">{selectedWord.category}</div>
            <div className="detail-title">
              <h2>{selectedWord.word}</h2>
              <button
                className="icon-btn"
                aria-label="播放單字發音"
                onClick={() => speak(selectedWord.word)}
              >
                <Volume2 />
              </button>
            </div>
            <p className="meaning">
              <span>{selectedWord.pos}</span> {selectedWord.meaning}
            </p>
            <Phonetic text={selectedWord.ipa} />
            <div className="example">
              <p>{selectedWord.example}</p>
              <Phonetic text={selectedWord.exampleIpa} />
              <small>{selectedWord.translation}</small>
              <button
                className="text-btn"
                onClick={() => speak(selectedWord.example)}
              >
                <Volume2 size={16} />
                朗讀例句
              </button>
            </div>
            <div className="phrase">
              <span>常見搭配</span>
              <strong>{selectedWord.phrase}</strong>
            </div>
          </>
        )}
      </dialog>
      {notice && (
        <div className="toast" role="status">
          {notice}
          {backupLink && (
            <a
              className="backup-download"
              href={backupLink.url}
              download={backupLink.name}
            >
              下載備份檔
            </a>
          )}
          <button aria-label="關閉通知" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
