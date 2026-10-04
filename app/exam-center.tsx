"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Headphones,
  Timer,
  Target,
  Check,
  ArrowRight,
  Star,
  Volume2,
  Download,
  BarChart3,
  NotebookPen,
  Keyboard,
  Flag,
  Zap,
  Heart,
  Trophy,
  Shield,
  Sparkles,
  LockKeyhole,
  Map as MapIcon,
} from "lucide-react";
import {
  questions,
  questionMap,
  wordMap,
  selectPractice,
  newAttempt,
  mockIds,
  mockSets,
  examSummary,
  practiceGroups,
  isCorrect,
  results,
  weakQuestions,
  analytics,
  examPhase,
  canAnswer,
  recordAnswer,
  shuffled,
} from "@/lib/exam";
import { gameRunStats, personalGameRecords } from "@/lib/exam-games";
import { campaignStages, campaignTitle, campaignStageResult, starsFor } from "@/lib/campaign";
import {
  collectionCatalog,
  collectionProfileId,
  readCollection,
  type CollectionSlot,
  type Collectible,
} from "@/lib/collectibles";
import {
  gameRules,
  partNames,
  type Part,
  type Attempt,
  type Question,
} from "@/lib/exam-types";
import { words } from "@/lib/vocabulary";
import type { State } from "@/lib/learning";
import { useExamCloud } from "./use-exam-cloud";
import { Phonetic } from "./phonetic";
import "./exam-center.css";

type Tab =
  | "practice"
  | "mock"
  | "mistakes"
  | "vocabulary"
  | "report"
  | "notes"
  | "collection"
  | "campaign";
const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "practice", label: "題型練習", icon: BookOpen },
  { id: "mock", label: "限時模考", icon: Timer },
  { id: "mistakes", label: "錯題本", icon: Flag },
  { id: "vocabulary", label: "單字特訓", icon: Keyboard },
  { id: "report", label: "實力分析", icon: BarChart3 },
  { id: "notes", label: "收藏筆記", icon: NotebookPen },
  { id: "collection", label: "角色收藏館", icon: Sparkles },
  { id: "campaign", label: "劇情戰役", icon: MapIcon },
];
const grammarTips = [
  [
    "詞性判斷",
    "先找空格前後：冠詞／所有格後常需要名詞；修飾動作用副詞；名詞前常用形容詞。",
    "The team worked efficiently.",
  ],
  [
    "介系詞與連接詞",
    "介系詞後接名詞或動名詞；連接詞引導子句。注意 despite + 名詞、although + 主詞 + 動詞。",
    "Despite the rain, the delivery arrived.",
  ],
  [
    "間接應答",
    "Part 2 不一定用 yes 或 no 回答。提供原因、替代方式或「還不知道」，都可能是合理答案。",
    "Can I park here? — This space is reserved.",
  ],
  [
    "閱讀定位",
    "先看問題，再找人名、日期、條件。多文件題必須把資訊放在一起，不只找相同單字。",
    "Free delivery on orders of twenty meals or more.",
  ],
  [
    "同義改寫",
    "留意 arrive / reach、purchase / buy、at no charge / free、postpone / delay、reply / respond。",
    "The meeting was postponed. = The meeting was delayed.",
  ],
  [
    "字首與字尾",
    "re- 常表示再次；un- 常表示否定；-tion / -ment 常形成名詞；-ly 常形成副詞。搭配例句確認詞義。",
    "revise → revision; develop → development; careful → carefully",
  ],
];
const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function ExamCenter({
  userId,
  state,
  onBusy,
}: {
  userId: string;
  state: State;
  onBusy: (value: boolean) => void;
}) {
  const cloud = useExamCloud(userId);
  const [tab, setTab] = useState<Tab>("practice"),
    [active, setActive] = useState<Attempt | null>(null),
    [now, setNow] = useState(Date.now()),
    [part, setPart] = useState<Part | 0>(0),
    [skill, setSkill] = useState(""),
    [topic, setTopic] = useState(""),
    [unseenOnly, setUnseenOnly] = useState(false),
    [mockSet, setMockSet] = useState("01"),
    [preview, setPreview] = useState<Question | null>(null),
    [query, setQuery] = useState(""),
    [favoriteOnly, setFavoriteOnly] = useState(false);
  const [collectionSlot, setCollectionSlot] =
    useState<CollectionSlot>("avatar");
  const [rate, setRate] = useState(1),
    [repeatAudio, setRepeatAudio] = useState(false),
    [accent, setAccent] = useState("en-US"),
    [message, setMessage] = useState(""),
    [typed, setTyped] = useState(""),
    [guessed, setGuessed] = useState(false),
    [reviewIndex, setReviewIndex] = useState(0),
    [notesId, setNotesId] = useState(""),
    [noteText, setNoteText] = useState(""),
    [noteDirty, setNoteDirty] = useState(false),
    [wordCategory, setWordCategory] = useState("全部"),
    [wordFilter, setWordFilter] = useState("all");
  const tick = useRef(Date.now()),
    lock = useRef(false),
    activeRef = useRef(active),
    audio = useRef<HTMLAudioElement>(null);
  activeRef.current = active;
  const attempts = useMemo(() => cloud.rows.map((r) => r.data), [cloud.rows]);
  const seenIds = useMemo(
    () => new Set(attempts.flatMap((a) => a.ids)),
    [attempts],
  );
  const eligibleGroups = useMemo(
    () => practiceGroups(part, skill, { topic, unseen: unseenOnly, seenIds }),
    [part, skill, topic, unseenOnly, seenIds],
  );
  const topics = useMemo(
    () =>
      [
        ...new Set(
          questions
            .filter((q) => q.pool === "practice" && (!part || q.part === part))
            .map((q) => q.topic)
            .filter((x): x is string => !!x),
        ),
      ].sort(),
    [part],
  );
  const explored = questions.filter(
    (q) => q.pool === "practice" && seenIds.has(q.id),
  ).length;
  const weak = useMemo(
      () => weakQuestions(attempts, now),
      [attempts, Math.floor(now / 60000)],
    ),
    stats = useMemo(() => analytics(attempts), [attempts]),
    completed = attempts.filter((a) => a.finishedAt),
    pending = attempts.filter((a) => !a.finishedAt);
  const gameRecords = useMemo(() => personalGameRecords(attempts), [attempts]);
  const gameRuns = attempts.filter((a) => a.challenge && a.finishedAt).length;
  const finishedGames = attempts.filter((a) => a.challenge && a.finishedAt);
  const isCampaignAttempt = (attempt: Attempt) => /^【戰役:C\d-S\d】/.test(attempt.title);
  const longestGameCombo = Math.max(
    0,
    ...finishedGames.map((attempt) => gameRunStats(attempt).bestCombo),
  );
  const arcadeBadges = [
    { title: "第一場挑戰", icon: "🚩", unlocked: gameRuns >= 1 },
    { title: "五場磨練", icon: "🎖️", unlocked: gameRuns >= 5 },
    { title: "五連擊", icon: "⚡", unlocked: longestGameCombo >= 5 },
    {
      title: "生存無傷",
      icon: "💎",
      unlocked: finishedGames.some(
        (attempt) =>
          attempt.challenge === "survival" &&
          gameRunStats(attempt).misses === 0,
      ),
    },
    {
      title: "三模式制霸",
      icon: "🏆",
      unlocked: Object.values(gameRecords).every((record) => record.clears > 0),
    },
  ];
  const collectibles = useMemo(
    () => collectionCatalog(state, attempts, now),
    [state, attempts, Math.floor(now / 60000)],
  );
  const selection = readCollection(
    cloud.notes.find((note) => note.id === collectionProfileId)?.note,
  );
  const equipped = (slot: CollectionSlot) =>
    collectibles.find(
      (item) =>
        item.slot === slot && item.id === selection[slot] && item.unlocked,
    ) ?? collectibles.find((item) => item.slot === slot && item.unlocked)!;
  const equippedAvatar = equipped("avatar");
  const equippedCompanion = equipped("companion");
  const equippedFrame = equipped("frame");
  const busy = cloud.loading || cloud.saving || cloud.needsRetry;
  useEffect(() => {
    setSkill("");
    setTopic("");
    setPreview(null);
  }, [part]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    onBusy(cloud.saving || cloud.needsRetry || noteDirty);
    return () => onBusy(false);
  }, [cloud.saving, cloud.needsRetry, noteDirty, onBusy]);
  useEffect(() => {
    if (!noteDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [noteDirty]);
  useEffect(() => {
    setTyped("");
    setGuessed(false);
    tick.current = Date.now();
    window.speechSynthesis?.cancel();
  }, [active?.id, active?.index, reviewIndex]);
  const activeAudio = active
    ? questionMap.get(
        active.ids[active.finishedAt ? reviewIndex : active.index],
      )?.audio
    : undefined;
  useEffect(() => {
    const player = audio.current;
    return () => player?.pause();
  }, [activeAudio]);
  // Absolute deadlines keep running even when the app is backgrounded or reloaded.
  useEffect(() => {
    if (!active || active.finishedAt || busy || lock.current) return;
    const phase = examPhase(active, now);
    if (phase === "expired") {
      audio.current?.pause();
      void persist({
        ...active,
        finishedAt: active.startedAt + active.duration,
      });
    } else if (
      phase === "reading" &&
      (questionMap.get(active.ids[active.index])?.part ?? 5) < 5
    ) {
      audio.current?.pause();
      void persist({ ...active, index: 100 });
    }
  }, [now, active, busy]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);
  async function persist(a: Attempt) {
    if (lock.current || busy) return null;
    lock.current = true;
    try {
      const saved = await cloud.save(a);
      if (saved) setActive(saved);
      return saved;
    } finally {
      lock.current = false;
    }
  }
  async function start(
    mode: Attempt["mode"],
    ids: string[],
    title: string,
    challenge?: Attempt["challenge"],
  ) {
    if (!ids.length) {
      setMessage("目前沒有符合條件的題目。");
      return;
    }
    if (noteDirty) {
      setMessage("請先儲存正在編輯的筆記。");
      return;
    }
    audio.current?.pause();
    window.speechSynthesis?.cancel();
    const base = newAttempt(mode, ids, title);
    const a = challenge
      ? { ...base, challenge, duration: gameRules[challenge].duration }
      : base;
    if (await persist(a)) {
      setReviewIndex(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function startChallenge(challenge: NonNullable<Attempt["challenge"]>) {
    const rules = gameRules[challenge];
    let ids: string[];
    if (challenge === "boss") {
      const weakestPart = recommendations[0]?.part ?? 0;
      const weakFirst = shuffled([...new Set(weak.map((item) => item.id))]);
      ids = shuffled(
        [
          ...new Set([
            ...weakFirst.slice(0, rules.questions),
            ...selectPractice(weakestPart, rules.questions),
          ]),
        ].slice(0, rules.questions),
      );
    } else {
      ids = selectPractice(0, rules.questions);
    }
    void start("mini", ids, rules.title, challenge);
  }
  async function equipCollectible(item: Collectible) {
    if (!item.unlocked || busy) return;
    const next = { ...selection, [item.slot]: item.id };
    if (await cloud.annotate(collectionProfileId, JSON.stringify(next), true)) {
      setMessage(`${item.name} 已裝備，收藏設定已同步到帳號。`);
    }
  }
  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setMessage("此裝置不支援語音朗讀；題庫聽力仍可使用固定音檔。");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = accent;
    u.rate = rate;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang === accent);
    if (voice) u.voice = voice;
    u.onerror = (e) => {
      if (!["canceled", "interrupted"].includes(e.error))
        setMessage("語音無法播放，請確認裝置已安裝英文語音。");
    };
    window.speechSynthesis.speak(u);
  }
  async function answer(choice: number | string) {
    const a = activeRef.current;
    if (!a || a.finishedAt || busy) return;
    const id = a.ids[a.index];
    if (
      (a.mode === "practice" ||
        a.challenge ||
        a.mode === "spelling" ||
        a.mode === "dictation") &&
      a.answers[id]
    )
      return;
    const next = recordAnswer(
      a,
      id,
      {
        choice,
        guessed,
        ms: Math.min(
          86400000,
          (a.answers[id]?.ms ?? 0) + Math.max(0, Date.now() - tick.current),
        ),
      },
      Date.now(),
    );
    if (next === a) {
      setMessage("這一部分的作答時間已結束。");
      return;
    }
    const outOfLives =
      a.challenge === "survival" &&
      gameRunStats(next).misses >= gameRules.survival.hearts;
    const allAnswered = Object.keys(next.answers).length === next.ids.length;
    const submitRun = (!!a.challenge && (outOfLives || allAnswered)) || (isCampaignAttempt(a) && allAnswered);
    if (await persist(submitRun ? { ...next, finishedAt: Date.now() } : next)) {
      tick.current = Date.now();
      if (outOfLives)
        setMessage("三顆愛心都用完了！本回挑戰已結束，回大廳再試一次吧。");
    }
  }
  async function jump(index: number) {
    if (!active || busy) return;
    if (active.finishedAt) {
      setReviewIndex(index);
      return;
    }
    if (!canAnswer(active, index, Date.now())) {
      setMessage("目前只能作答正在計時的部分。");
      return;
    }
    if (
      (active.challenge || isCampaignAttempt(active)) &&
      index > active.index &&
      (index !== active.index + 1 || !active.answers[active.ids[active.index]])
    ) {
      setMessage("挑戰中請先完成目前題目，再前進到下一題。");
      return;
    }
    await persist({ ...active, index });
  }
  async function finish() {
    if (!active || busy) return;
    const remaining = active.ids.length - Object.keys(active.answers).length;
    if (
      !window.confirm(
        `確定交卷？${remaining ? `還有 ${remaining} 題未答，將計為未答錯題。` : "交卷後可查看完整解析。"}`,
      )
    )
      return;
    audio.current?.pause();
    const deadline = active.duration
      ? active.startedAt + active.duration
      : Date.now();
    await persist({ ...active, finishedAt: Math.min(Date.now(), deadline) });
    setReviewIndex(0);
  }
  function leave() {
    if (busy || noteDirty) return;
    audio.current?.pause();
    window.speechSynthesis?.cancel();
    setActive(null);
    setReviewIndex(0);
  }
  async function playExam(q: Question) {
    if (!active || busy || !audio.current) return;
    const id = q.group || q.id;
    if (active.played.includes(id)) {
      setMessage("模考音檔已播放過；交卷後可不限次數重播。");
      return;
    }
    // Start playback inside the gesture on mobile, then persist its consumption.
    try {
      audio.current.playbackRate = 1;
      await audio.current.play();
      await persist({ ...active, played: [...active.played, id] });
    } catch {
      setMessage("音檔尚未就緒，請檢查網路後再播放。");
    }
  }
  async function saveNote() {
    if (!notesId) return;
    const old = cloud.notes.find((n) => n.id === notesId);
    if (await cloud.annotate(notesId, noteText, old?.favorite ?? false)) {
      setNoteDirty(false);
      setMessage("筆記已同步。");
    }
  }
  function editNote(id: string) {
    if (noteDirty && id !== notesId) {
      setMessage("請先儲存目前筆記。");
      return;
    }
    setNotesId(id);
    setNoteText(cloud.notes.find((n) => n.id === id)?.note ?? "");
  }
  async function favorite(id: string) {
    const old = cloud.notes.find((n) => n.id === id);
    await cloud.annotate(id, old?.note ?? "", !old?.favorite);
  }
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            attempts,
            annotations: cloud.notes.filter(
              (note) => note.id !== collectionProfileId,
            ),
            collection: selection,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "toice-exams-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const index = active?.finishedAt ? reviewIndex : (active?.index ?? 0);
  const currentId = active?.ids[index] ?? "";
  const q = questionMap.get(currentId),
    w = wordMap.get(currentId);
  const isVocab = active?.mode === "spelling" || active?.mode === "dictation";
  const currentAnswer = active?.answers[currentId];
  const reveal =
    !!active &&
    (!!active.finishedAt ||
      ((!!active.challenge || isCampaignAttempt(active)) && !!currentAnswer) ||
      (["practice", "spelling", "dictation"].includes(active.mode) &&
        !!currentAnswer));
  const strict = !!active && !active.finishedAt && active.mode === "mock";
  const summary = active ? results(active) : null;
  const activeGameStats = active?.challenge ? gameRunStats(active) : null;
  const previousGameBest = active?.challenge
    ? personalGameRecords(
        attempts.filter((attempt) => attempt.id !== active.id),
      )[active.challenge].best
    : 0;
  const activeGameBest = Math.max(
    previousGameBest,
    activeGameStats?.score ?? 0,
  );
  const filteredWeak = weak.filter((x) => {
    const question = questionMap.get(x.id);
    return (
      question &&
      (!part || question.part === part) &&
      (!favoriteOnly || cloud.notes.some((n) => n.id === x.id && n.favorite)) &&
      (!query ||
        `${question.prompt} ${question.skill} ${question.explanation}`
          .toLowerCase()
          .includes(query.toLowerCase()))
    );
  });
  const recommendations = [...stats]
    .filter((s) => s.total >= 5)
    .sort((a, b) => a.percent - b.percent);
  const skills = useMemo(
    () => [
      ...new Set(
        questions
          .filter((q) => q.pool === "practice" && (!part || q.part === part))
          .map((q) => q.skill),
      ),
    ],
    [part],
  );

  return (
    <section className="academy" aria-label="多益練習中心">
      <div className="academy-heading">
        <div>
          <span className="tiny-label">TOEIC TRAINING STUDIO</span>
          <h1>練習，直到變成實力。</h1>
          <p>單字 × 聽力 × 閱讀。讓每一次練習，都知道下一步。</p>
        </div>
        <button
          className="academy-player-badge"
          onClick={() => setTab("collection")}
          aria-label="前往角色收藏館"
        >
          <span className={`academy-player-avatar ${equippedFrame.id}`}>
            {equippedAvatar.image ? <img src={equippedAvatar.image} alt="" /> : equippedAvatar.icon}
          </span>
          <span>
            <small>我的衝刺隊伍</small>
            <strong>{equippedAvatar.name}</strong>
          </span>
          <span
            className="academy-player-pet"
            aria-label={`裝備：${equippedCompanion.name}`}
          >
            {equippedCompanion.icon}
          </span>
        </button>
      </div>
      <div className="academy-cloud" role={cloud.error ? "alert" : "status"}>
        <span>
          {cloud.error ||
            (cloud.loading
              ? "讀取測驗紀錄…"
              : cloud.saving
                ? "正在儲存…"
                : cloud.needsRetry
                  ? "尚有待儲存操作"
                  : "測驗紀錄已同步至帳號")}
        </span>
        <button
          disabled={cloud.loading || cloud.saving}
          onClick={async () => {
            if (cloud.needsRetry) {
              const next = await cloud.retry();
              if (next) setActive(next);
            } else {
              await cloud.refresh();
            }
          }}
        >
          {cloud.error ? "重試" : "同步"}
        </button>
      </div>
      {message && (
        <p className="academy-message" role="status">
          {message}
        </p>
      )}
      {active ? (
        <>
          <div className="exam-toolbar">
            <button
              className="secondary-btn"
              onClick={leave}
              disabled={busy || noteDirty}
            >
              返回練習中心
            </button>
            <span>{active.title}</span>
            {!active.finishedAt && active.duration > 0 && (
              <strong className="exam-clock" aria-label="剩餘時間">
                <Timer size={17} />
                {strict
                  ? examPhase(active, now) === "listening"
                    ? "聽力 "
                    : "閱讀 "
                  : ""}
                {fmt(
                  (strict && examPhase(active, now) === "listening"
                    ? active.startedAt + 2700000
                    : active.startedAt + active.duration) - now,
                )}
              </strong>
            )}
          </div>
          {active.challenge && !active.finishedAt && activeGameStats && (
            <div className="arcade-live" aria-live="polite">
              <div className="arcade-live-mode">
                <span>
                  {active.challenge === "blitz"
                    ? "⚡"
                    : active.challenge === "survival"
                      ? "❤️"
                      : "🛡️"}
                </span>
                <strong>{gameRules[active.challenge].title}</strong>
              </div>
              {active.challenge === "survival" && (
                <div
                  className="arcade-hearts"
                  aria-label={`剩餘 ${Math.max(0, gameRules.survival.hearts - activeGameStats.misses)} 顆愛心`}
                >
                  {Array.from({ length: gameRules.survival.hearts }, (_, i) => (
                    <Heart
                      key={i}
                      size={20}
                      fill={
                        i < gameRules.survival.hearts - activeGameStats.misses
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
              )}
              <div className="arcade-live-stat">
                <strong>{activeGameStats.currentCombo}</strong>
                <small>連擊</small>
              </div>
              <div className="arcade-live-stat">
                <strong>{activeGameStats.score.toLocaleString()}</strong>
                <small>目前分數</small>
              </div>
              <div className="arcade-live-progress">
                {Object.keys(active.answers).length} / {active.ids.length}
              </div>
            </div>
          )}
          {active.finishedAt && summary && (
            <div className="exam-result">
              <div>
                <span>本回測驗結果</span>
                <h2>
                  {summary.percent}
                  <small>%</small>
                </h2>
                <p>
                  {summary.correct} / {summary.total} 題答對 ·{" "}
                  {summary.total - summary.answered} 題未答 · {summary.guessed}{" "}
                  題標記猜答
                </p>
              </div>
              <div>
                <p>用時 {fmt(active.finishedAt - active.startedAt)}</p>
                <p>以下可逐題檢查答案。錯題與猜答會加入複習。</p>
                <small>自編訓練題正確率，不換算成官方多益分數。</small>
              </div>
            </div>
          )}
          {active.finishedAt && active.challenge && activeGameStats && (
            <section className="arcade-result-card" aria-label="遊戲挑戰成績">
              <div className="arcade-result-emblem">
                {active.challenge === "blitz"
                  ? "⚡"
                  : active.challenge === "survival"
                    ? "❤️"
                    : "🛡️"}
              </div>
              <div>
                <span>本局得分</span>
                <strong>
                  {activeGameStats.score.toLocaleString()}
                  <small> 分</small>
                </strong>
                <p>
                  {activeGameStats.correct} 題答對 · 最長連擊{" "}
                  {activeGameStats.bestCombo} · 個人最佳{" "}
                  {activeGameBest.toLocaleString()} 分
                </p>
              </div>
              {activeGameStats.score > previousGameBest && (
                <div className="arcade-new-record">
                  <Trophy size={17} /> 新紀錄
                </div>
              )}
            </section>
          )}
          <div className="exam-layout">
            <div className="exam-main">
              <article className="exam-card">
                <div className="exam-card-top">
                  <span>
                    {isVocab
                      ? active.mode === "dictation"
                        ? "聽寫單字"
                        : "拼字練習"
                      : `Part ${q?.part} · ${q ? partNames[q.part] : ""}`}
                  </span>
                  <span>
                    {index + 1} / {active.ids.length}
                  </span>
                </div>
                {q && (
                  <>
                    {q.image && (
                      <figure className="exam-figure">
                        <img src={q.image} alt="用於聽力圖像描述的場景示意圖" />
                        <figcaption>圖像描述練習 · 原創示意圖</figcaption>
                      </figure>
                    )}
                    {q.audio && (
                      <div className="exam-audio">
                        <Headphones size={22} />
                        <div>
                          <strong>
                            {q.part <= 2
                              ? "請聆聽題目與選項"
                              : "請聆聽題組內容"}
                          </strong>
                          <small>
                            固定美式合成語音
                            {strict
                              ? " · 每題／題組播放一次"
                              : " · 可重播、調速"}
                          </small>
                        </div>
                        <audio
                          ref={audio}
                          key={q.audio}
                          src={q.audio}
                          preload="metadata"
                          controls={!strict}
                          loop={!strict && repeatAudio}
                          onLoadedMetadata={() => {
                            if (audio.current)
                              audio.current.playbackRate = strict ? 1 : rate;
                          }}
                          onError={() =>
                            setMessage(
                              "音檔載入失敗，請確認網路後重新開啟本題。",
                            )
                          }
                        />
                        {strict && (
                          <button
                            className="primary-btn"
                            disabled={
                              busy || active.played.includes(q.group || q.id)
                            }
                            onClick={() => void playExam(q)}
                          >
                            <Volume2 size={17} />
                            {active.played.includes(q.group || q.id)
                              ? "已播放"
                              : "播放音檔"}
                          </button>
                        )}
                        {!strict && (
                          <label>
                            速度
                            <select
                              value={rate}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                setRate(n);
                                if (audio.current)
                                  audio.current.playbackRate = n;
                              }}
                            >
                              {[0.65, 0.8, 1, 1.15].map((n) => (
                                <option key={n} value={n}>
                                  {n}×
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                    )}
                    {q.audio && !strict && (
                      <label className="guess-toggle">
                        <input
                          type="checkbox"
                          checked={repeatAudio}
                          onChange={(e) => setRepeatAudio(e.target.checked)}
                        />
                        重複播放本題音檔
                      </label>
                    )}
                    {q.graphic && (
                      <figure className="exam-graphic">
                        <figcaption>參考圖表 · Graphic</figcaption>
                        <div lang="en">{q.graphic}</div>
                      </figure>
                    )}
                    {(q.topic || q.format) && (
                      <p className="question-tags">
                        {[q.topic, q.format, q.skill]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {q.passage && (
                      <div className="exam-passage" lang="en">
                        {q.passage}
                      </div>
                    )}
                    {(q.part > 2 || reveal) && (
                      <h2 className="exam-prompt" lang="en">
                        {q.prompt}
                      </h2>
                    )}
                    {q.part <= 2 && !reveal && (
                      <p className="exam-prompt">
                        聽完後選出最合適的{q.part === 1 ? "描述" : "回應"}。
                      </p>
                    )}
                    <div className="exam-options">
                      {q.options.map((option, i) => (
                        <button
                          key={i}
                          disabled={busy || !!active.finishedAt || reveal}
                          aria-pressed={currentAnswer?.choice === i}
                          className={
                            (currentAnswer?.choice === i ? "selected " : "") +
                            (reveal && i === q.correct ? "correct " : "") +
                            (reveal &&
                            currentAnswer?.choice === i &&
                            i !== q.correct
                              ? "incorrect"
                              : "")
                          }
                          onClick={() => void answer(i)}
                        >
                          <b>{String.fromCharCode(65 + i)}</b>
                          <span>
                            {q.part <= 2 && !reveal
                              ? `選項 ${String.fromCharCode(65 + i)}`
                              : option}
                          </span>
                          {reveal && i === q.correct && <Check size={20} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {isVocab && w && (
                  <>
                    <div className="spelling-prompt">
                      <span>
                        {w.category} · {w.pos}
                      </span>
                      {active.mode === "spelling" && <h2>{w.meaning}</h2>}
                      <button
                        className="secondary-btn"
                        onClick={() => speak(w.word)}
                      >
                        <Volume2 size={18} />
                        播放單字
                      </button>
                      <small>
                        {active.mode === "dictation"
                          ? "聆聽後輸入英文單字。"
                          : "根據中文提示輸入英文單字。"}
                      </small>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (typed.trim()) void answer(typed);
                      }}
                    >
                      <label className="sr-only" htmlFor="spell-answer">
                        英文答案
                      </label>
                      <input
                        id="spell-answer"
                        className="spell-input"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={
                          reveal ? String(currentAnswer?.choice ?? "") : typed
                        }
                        disabled={busy || reveal}
                        maxLength={100}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder="輸入英文…"
                      />
                      <button
                        className="primary-btn"
                        disabled={busy || reveal || !typed.trim()}
                      >
                        確認答案
                      </button>
                    </form>
                    {reveal && (
                      <div className="exam-explanation">
                        <strong>
                          {isCorrect(active, currentId)
                            ? "答對了"
                            : "再記住一次"}{" "}
                          · {w.word}
                        </strong>
                        <p>{w.meaning}</p>
                        <Phonetic text={w.ipa} />
                        <p>{w.example}</p>
                        <Phonetic text={w.exampleIpa} />
                        <p>{w.translation}</p>
                        <p>常見搭配：{w.phrase}</p>
                        <button
                          className="text-btn"
                          onClick={() => speak(w.example)}
                        >
                          朗讀例句
                        </button>
                      </div>
                    )}
                  </>
                )}
                {!active.finishedAt && (
                  <label className="guess-toggle">
                    <input
                      type="checkbox"
                      checked={currentAnswer?.guessed ?? guessed}
                      disabled={busy || reveal}
                      onChange={async (e) => {
                        const value = e.target.checked;
                        setGuessed(value);
                        if (
                          currentAnswer &&
                          canAnswer(active, index, Date.now())
                        )
                          await persist({
                            ...active,
                            answers: {
                              ...active.answers,
                              [currentId]: { ...currentAnswer, guessed: value },
                            },
                          });
                      }}
                    />
                    這題不確定，是用猜的
                  </label>
                )}
                {reveal && q && (
                  <div className="exam-explanation">
                    <span className="tiny-label">ANSWER & EXPLANATION</span>
                    <h3>
                      {currentAnswer
                        ? isCorrect(active, currentId)
                          ? "答對了"
                          : "這題需要再練習"
                        : "本題未作答"}{" "}
                      · 正解 {String.fromCharCode(65 + q.correct)}
                    </h3>
                    <p>{q.explanation}</p>
                    {q.translation && <p>中文重點：{q.translation}</p>}
                    {q.transcript && (
                      <div className="exam-passage">
                        <strong>聽力逐字稿</strong>
                        <p lang="en">{q.transcript}</p>
                      </div>
                    )}
                    <details>
                      <summary>查看句子與選項音標</summary>
                      <p>{q.prompt}</p>
                      {q.ipa && <Phonetic text={q.ipa} />}
                      <ol type="A">
                        {q.options.map((o, i) => (
                          <li key={o}>
                            {o}
                            <Phonetic text={q.optionIpa?.[i] ?? ""} />
                          </li>
                        ))}
                      </ol>
                      {q.passageIpa && <Phonetic text={q.passageIpa} />}
                      {q.graphicIpa && (
                        <>
                          <p>圖表音標</p>
                          <Phonetic text={q.graphicIpa} />
                        </>
                      )}
                      <small>
                        美式逐字讀音參考，不代表實際連音與句子重音。
                      </small>
                    </details>
                    {!strict && (
                      <details>
                        <summary>逐句精聽與跟讀</summary>
                        {(q.transcript || q.passage || q.prompt)
                          .split(/(?<=[.!?])\s+/)
                          .filter(Boolean)
                          .map((s, i) => (
                            <button
                              className="sentence-play"
                              key={i}
                              onClick={() => speak(s)}
                            >
                              <Volume2 size={15} />
                              <span>{s}</span>
                            </button>
                          ))}
                        <VoiceRecorder onMessage={setMessage} />
                      </details>
                    )}
                  </div>
                )}
                {reveal && (
                  <div className="exam-note-actions">
                    <button
                      className="secondary-btn"
                      disabled={busy}
                      onClick={() => void favorite(currentId)}
                    >
                      <Star
                        size={16}
                        fill={
                          cloud.notes.some(
                            (n) => n.id === currentId && n.favorite,
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                      收藏
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => editNote(currentId)}
                    >
                      <NotebookPen size={16} />
                      筆記
                    </button>
                  </div>
                )}
                {notesId === currentId && (
                  <div className="note-editor">
                    <label>
                      我的筆記
                      <textarea
                        value={noteText}
                        maxLength={2000}
                        onChange={(e) => {
                          setNoteText(e.target.value);
                          setNoteDirty(true);
                        }}
                      />
                    </label>
                    <button
                      className="primary-btn"
                      disabled={busy || !noteDirty}
                      onClick={() => void saveNote()}
                    >
                      儲存筆記
                    </button>
                    <small>
                      {noteText.length}/2000 ·{" "}
                      {noteDirty ? "尚未儲存" : "已同步"}
                    </small>
                  </div>
                )}
                <div className="exam-navigation">
                  <button
                    className="secondary-btn"
                    disabled={
                      busy ||
                      index === 0 ||
                      noteDirty ||
                      (!active.finishedAt && !canAnswer(active, index - 1, now))
                    }
                    onClick={() => void jump(index - 1)}
                  >
                    上一題
                  </button>
                  {index < active.ids.length - 1 ? (
                    <button
                      className="primary-btn"
                      disabled={
                        busy ||
                        noteDirty ||
                        (!active.finishedAt &&
                          !canAnswer(active, index + 1, now))
                      }
                      onClick={() => void jump(index + 1)}
                    >
                      下一題
                      <ArrowRight size={17} />
                    </button>
                  ) : !active.finishedAt ? (
                    <button
                      className="primary-btn"
                      disabled={busy || noteDirty || !!active.challenge || isCampaignAttempt(active)}
                      onClick={() => void finish()}
                    >
                      {active.challenge || isCampaignAttempt(active) ? "全部答完自動結算" : "完成並交卷"}
                    </button>
                  ) : (
                    <button
                      className="primary-btn"
                      onClick={leave}
                      disabled={noteDirty}
                    >
                      回到練習中心
                    </button>
                  )}
                </div>
              </article>
            </div>
            <aside className="exam-map">
              <h3>{active.finishedAt ? "答案總覽" : "作答進度"}</h3>
              <p>
                {Object.keys(active.answers).length} / {active.ids.length}{" "}
                已作答
              </p>
              {strict && (
                <small>
                  聽力 45 分鐘後自動切換閱讀 75
                  分鐘；切回背景也持續計時。音檔由你逐題啟動。
                </small>
              )}
              <div className="question-dots">
                {active.ids.map((id, i) => (
                  <button
                    key={id}
                    aria-label={`第 ${i + 1} 題${active.answers[id] ? " 已作答" : ""}`}
                    aria-current={i === index ? "step" : undefined}
                    className={
                      (i === index ? "current " : "") +
                      (active.finishedAt
                        ? isCorrect(active, id)
                          ? "right"
                          : "wrong"
                        : active.answers[id]
                          ? "answered"
                          : "")
                    }
                    disabled={
                      busy ||
                      noteDirty ||
                      (!active.finishedAt && !canAnswer(active, i, now))
                    }
                    onClick={() => void jump(i)}
                  >
                    {i + 1}
                    {active.answers[id]?.guessed ? "·" : ""}
                  </button>
                ))}
              </div>
              {!active.finishedAt && !active.challenge && !isCampaignAttempt(active) && (
                <button
                  className="secondary-btn full"
                  disabled={busy || noteDirty}
                  onClick={() => void finish()}
                >
                  提早交卷
                </button>
              )}
              <small>
                每次作答同步至帳號。返回中心可續做；限時測驗不會暫停。
              </small>
            </aside>
          </div>
        </>
      ) : (
        <>
          <div
            className="academy-tabs"
            role="tablist"
            aria-label="練習中心功能"
          >
            {tabs.map((t) => (
              <button
                role="tab"
                aria-selected={tab === t.id}
                key={t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => {
                  if (noteDirty) {
                    setMessage("請先儲存筆記。");
                    return;
                  }
                  setTab(t.id);
                  setPart(0);
                  setQuery("");
                  setSkill("");
                }}
              >
                <t.icon size={18} />
                {t.label}
                {t.id === "mistakes" && weak.length > 0 && <b>{weak.length}</b>}
              </button>
            ))}
          </div>
          {!!pending.length && (
            <div className="resume-panel">
              <div>
                <strong>接續上次練習</strong>
                <small>
                  已儲存的答案可跨裝置接續；限時測驗的時間持續計算。
                </small>
              </div>
              {pending.map((a) => (
                <button
                  key={a.id}
                  disabled={busy}
                  onClick={() => {
                    setActive(a);
                    setReviewIndex(0);
                  }}
                >
                  {a.title} · {Object.keys(a.answers).length}/{a.ids.length} 題{" "}
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          )}
          {tab === "campaign" && (
            <section className="campaign-room" aria-label="TOEIC 劇情戰役">
              <div className="campaign-hero">
                <div><span className="tiny-label">GLOBAL RESPONSE UNIT · 01</span><h2>全球商務危機應變行動</h2><p>航班、港口與跨國企業接連失去聯絡。加入專業小隊，運用英文線索逐站找出真相。</p></div>
                <div className="campaign-level"><strong>{campaignStages.filter((stage) => campaignStageResult(attempts, stage).best > 0).length}</strong><span>/ {campaignStages.length} 關通關</span></div>
              </div>
              <div className="campaign-grid">
                {campaignStages.map((stage, index) => {
                  const result = campaignStageResult(attempts, stage);
                  const previous = index === 0 ? null : campaignStages[index - 1];
                  const unlocked = !previous || campaignStageResult(attempts, previous).best > 0;
                  return <article className={`campaign-stage ${unlocked ? "" : "campaign-locked"}`} key={stage.id}>
                    <div className="campaign-stage-top"><span>CHAPTER {String(stage.chapter).padStart(2, "0")} · STAGE {stage.stage}</span><strong>{result.best ? "★".repeat(result.best) + "☆".repeat(3 - result.best) : "☆☆☆"}</strong></div>
                    <h3>{stage.title}</h3><h4>{stage.operation}</h4><p>{stage.briefing}</p>
                    <div className="campaign-meta"><span>Part {stage.part} · {partNames[stage.part]}</span><span>{stage.questions} 題</span></div>
                    <button className={unlocked ? "primary-btn" : "secondary-btn"} disabled={!unlocked || busy} onClick={() => {
                      const ids = selectPractice(stage.part, stage.questions);
                      void start("mini", ids, campaignTitle(stage));
                    }}>{!unlocked ? <><LockKeyhole size={15}/> 完成前一關解鎖</> : result.runs ? <>再次出勤 <ArrowRight size={16}/></> : <>開始任務 <ArrowRight size={16}/></>}</button>
                    {result.runs > 0 && <small className="campaign-record">已出勤 {result.runs} 次 · 最佳 {result.best ? `${result.best} 星` : "尚未通關"}</small>}
                  </article>;
                })}
              </div>
              <p className="campaign-tip">通過門檻 70%｜85% 得 2 星｜全對得 3 星。每一關都從現有原創 TOEIC 題庫抽題，可重玩刷新最佳星等。</p>
            </section>
          )}
          {tab === "practice" && (
            <>
              <div className="academy-hero">
                <div>
                  <span className="tiny-label">TODAY'S FOCUS</span>
                  <h2>
                    {recommendations.length
                      ? `從 Part ${recommendations[0].part} 再前進一步`
                      : "把認得的單字，變成答得出的題目。"}
                  </h2>
                  <p>
                    {recommendations.length
                      ? `這是目前正確率較低的題型（${recommendations[0].percent}%）。先練一回，再回頭檢查錯題。`
                      : "先做一回混合練習，累積各題型紀錄後，就能看到需要加強的方向。"}
                  </p>
                  <button
                    className="primary-btn"
                    disabled={busy}
                    onClick={() =>
                      void start(
                        "practice",
                        selectPractice(recommendations[0]?.part ?? 0, 20),
                        "今日重點練習",
                      )
                    }
                  >
                    開始今日練習
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="hero-number">
                  <strong>{examSummary.total.toLocaleString()}</strong>
                  <span>原創題型練習題</span>
                  <small>
                    {examSummary.practice.toLocaleString()} 練習＋
                    {mockSets.length} × 200 模考
                  </small>
                </div>
              </div>
              <section className="arcade-lobby" aria-labelledby="arcade-title">
                <div className="arcade-lobby-head">
                  <div>
                    <span className="tiny-label">TOICE ARCADE</span>
                    <h2 id="arcade-title">多益遊戲大廳</h2>
                    <p>用倒數、連擊和有限生命，挑戰你的專注力。</p>
                  </div>
                  <div className="arcade-trophy">
                    <Trophy size={21} />
                    <span>
                      已完成 <strong>{gameRuns}</strong> 場
                    </span>
                  </div>
                </div>
                <div className="arcade-game-grid">
                  {(["blitz", "survival", "boss"] as const).map((game) => {
                    const rule = gameRules[game];
                    const locked =
                      game === "survival"
                        ? gameRuns < 1
                        : game === "boss"
                          ? gameRuns < 3
                          : false;
                    const record = gameRecords[game];
                    const Icon =
                      game === "blitz"
                        ? Zap
                        : game === "survival"
                          ? Heart
                          : Shield;
                    const detail =
                      game === "blitz"
                        ? "90 秒答 10 題，答越快分數越高。"
                        : game === "survival"
                          ? "15 題、三顆愛心，錯三題立即結束。"
                          : "限時攻克弱點題，優先抽選你常錯的題型。";
                    return (
                      <article
                        className={`arcade-game-card game-${game} ${locked ? "game-locked" : ""}`}
                        key={game}
                      >
                        <div className="arcade-game-icon">
                          <Icon size={24} />
                          {locked && <span aria-label="尚未解鎖">🔒</span>}
                        </div>
                        <div className="arcade-game-title">
                          <h3>{rule.title}</h3>
                          <span>
                            {rule.questions} 題 · {fmt(rule.duration)}
                          </span>
                        </div>
                        <p>{detail}</p>
                        <div className="arcade-game-record">
                          <span>個人最高</span>
                          <strong>
                            {record.best.toLocaleString()}
                            <small> 分</small>
                          </strong>
                          <span>{record.clears} 次完成</span>
                        </div>
                        {locked ? (
                          <div className="arcade-unlock">
                            {game === "survival"
                              ? "完成一場挑戰解鎖"
                              : "完成三場挑戰解鎖"}
                          </div>
                        ) : (
                          <button
                            className="primary-btn"
                            disabled={busy}
                            onClick={() => startChallenge(game)}
                          >
                            開始挑戰 <ArrowRight size={16} />
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
                <div className="arcade-personal-board">
                  <Trophy size={17} />
                  <span>個人排行榜</span>
                  <strong>
                    {Math.max(
                      gameRecords.blitz.best,
                      gameRecords.survival.best,
                      gameRecords.boss.best,
                    ).toLocaleString()}{" "}
                    分
                  </strong>
                  <small>只和自己的最佳紀錄比較</small>
                </div>
                <div className="arcade-badges" aria-label="遊戲成就">
                  <strong>挑戰徽章</strong>
                  {arcadeBadges.map((badge) => (
                    <div
                      className={
                        badge.unlocked
                          ? "arcade-badge unlocked"
                          : "arcade-badge"
                      }
                      key={badge.title}
                      title={
                        badge.unlocked
                          ? badge.title
                          : `尚未解鎖：${badge.title}`
                      }
                    >
                      <span aria-hidden="true">{badge.icon}</span>
                      <small>{badge.title}</small>
                    </div>
                  ))}
                </div>
              </section>
              <div className="part-grid">
                {([1, 2, 3, 4, 5, 6, 7] as Part[]).map((p) => (
                  <button
                    className="part-card"
                    disabled={busy}
                    key={p}
                    onClick={() =>
                      void start(
                        "practice",
                        selectPractice(p, 20),
                        `Part ${p} ${partNames[p]}`,
                      )
                    }
                  >
                    <span className="part-number">P{p}</span>
                    <h3>{partNames[p]}</h3>
                    <p>
                      {
                        questions.filter(
                          (q) => q.part === p && q.pool === "practice",
                        ).length
                      }{" "}
                      題可練習
                    </p>
                    <span className="part-link">
                      開始練習 <ArrowRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="academy-panel">
                <h2>依弱點與情境挑選</h2>
                <p>
                  已接觸 {explored}／{examSummary.practice.toLocaleString()}{" "}
                  道練習題。篩選保留完整題組，約 20 題一回。
                </p>
                <div className="exam-filters">
                  <label>
                    題型
                    <select
                      value={part}
                      onChange={(e) => {
                        setPart(Number(e.target.value) as Part | 0);
                        setSkill("");
                        setTopic("");
                        setPreview(null);
                      }}
                    >
                      <option value={0}>全部題型</option>
                      {([1, 2, 3, 4, 5, 6, 7] as Part[]).map((p) => (
                        <option key={p} value={p}>
                          Part {p} · {partNames[p]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    知識點
                    <select
                      value={skill}
                      onChange={(e) => {
                        setSkill(e.target.value);
                        setPreview(null);
                      }}
                    >
                      <option value="">全部知識點</option>
                      {skills.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    情境
                    <select
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        setPreview(null);
                      }}
                    >
                      <option value="">全部情境（含原有題目）</option>
                      {topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="unseen-filter">
                    <input
                      type="checkbox"
                      checked={unseenOnly}
                      onChange={(e) => {
                        setUnseenOnly(e.target.checked);
                        setPreview(null);
                      }}
                    />
                    只選未接觸題組
                  </label>
                  <button
                    className="primary-btn"
                    disabled={busy || !eligibleGroups.length}
                    onClick={() =>
                      void start(
                        "practice",
                        selectPractice(part, 20, skill, Math.random, {
                          topic,
                          unseen: unseenOnly,
                          seenIds,
                        }),
                        skill || "自選題型練習",
                      )
                    }
                  >
                    建立練習
                  </button>
                </div>
                <p className="filter-count">
                  符合 {eligibleGroups.reduce((n, g) => n + g.length, 0)} 題／
                  {eligibleGroups.length}{" "}
                  個題組。未接觸會排除已開始測驗中的整組題目。
                </p>
                <button
                  className="text-btn"
                  disabled={!eligibleGroups.length}
                  onClick={() => {
                    const items = eligibleGroups
                      .flat()
                      .filter((q) => !skill || q.skill === skill);
                    setPreview(items[Math.floor(Math.random() * items.length)]);
                  }}
                >
                  看一題範例
                </button>
                {preview && (
                  <article className="question-preview" aria-label="題型範例">
                    <div className="academy-section-head">
                      <h3>
                        Part {preview.part} · {preview.skill}
                      </h3>
                      <button
                        className="text-btn"
                        onClick={() => setPreview(null)}
                      >
                        關閉範例
                      </button>
                    </div>
                    <small>範例預覽，不計入作答進度。</small>
                    {preview.image && (
                      <img
                        className="preview-scene"
                        src={preview.image}
                        alt="圖像描述練習示意圖"
                      />
                    )}
                    {preview.audio && (
                      <audio controls preload="none" src={preview.audio} />
                    )}
                    {preview.graphic && (
                      <figure className="exam-graphic">
                        <figcaption>參考圖表 · Graphic</figcaption>
                        <div lang="en">{preview.graphic}</div>
                      </figure>
                    )}
                    {preview.passage && (
                      <div className="exam-passage" lang="en">
                        {preview.passage}
                      </div>
                    )}
                    <p lang="en">
                      {preview.part === 2
                        ? "Listen and choose the best response."
                        : preview.prompt}
                    </p>
                    <ol type="A">
                      {preview.options.map((o, i) => (
                        <li key={i}>
                          {preview.part <= 2
                            ? `選項 ${String.fromCharCode(65 + i)}（請聽音檔）`
                            : o}
                        </li>
                      ))}
                    </ol>
                    <details>
                      <summary>查看範例答案、逐字稿與音標</summary>
                      <p>
                        答案：{String.fromCharCode(65 + preview.correct)} ·{" "}
                        {preview.explanation}
                      </p>
                      <p lang="en">{preview.prompt}</p>
                      <Phonetic text={preview.ipa || ""} />
                      <ol type="A">
                        {preview.options.map((o, i) => (
                          <li key={i}>
                            {o}
                            <Phonetic text={preview.optionIpa?.[i] || ""} />
                          </li>
                        ))}
                      </ol>
                      {preview.transcript && (
                        <div className="exam-passage" lang="en">
                          {preview.transcript}
                        </div>
                      )}
                      <Phonetic text={preview.passageIpa || ""} />
                      {preview.graphicIpa && (
                        <Phonetic text={preview.graphicIpa} />
                      )}
                    </details>
                  </article>
                )}
              </div>
              <div className="academy-panel bank-note">
                <h3>這次可以練什麼？</h3>
                <p>
                  間接應答、說話者意圖、數量與時間推論、圖表整合、句子銜接、句子插入、聊天訊息，以及雙篇／三篇交叉閱讀。
                </p>
                <p>
                  題數包含 60
                  個商務情境的聽力、段落填空與閱讀延伸練習；文法也有相同規則的不同例句。它們適合反覆建立能力，並不代表每題都有一篇全新文章。四份模考各自固定且題目分開。
                </p>
                <p>
                  題目為本站自編；官方範例僅用來核對題型，沒有搬入官方題庫。可搭配{" "}
                  <a
                    href="https://www.ets.org/toeic/test-takers/prepare.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ETS 官方準備資源
                  </a>{" "}
                  與{" "}
                  <a
                    href="https://www.iibc-global.org/english/toeic/test/lr/about/format.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    IIBC 題型與範例
                  </a>{" "}
                  練習。
                </p>
              </div>
              <div className="tip-grid">
                {grammarTips.map(([title, text, example]) => (
                  <article className="academy-panel" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <small lang="en">{example}</small>
                    <button className="text-btn" onClick={() => speak(example)}>
                      <Volume2 size={15} />
                      聽例句
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "mock" && (
            <>
              <div className="test-grid">
                <article className="academy-panel test-card">
                  <span className="test-label">QUICK CHECK</span>
                  <Timer size={30} />
                  <h2>限時小測驗</h2>
                  <p>
                    約 20 題，依完整題組可能略多。每題配置 72
                    秒，交卷後一次看解析。
                  </p>
                  <label>
                    範圍
                    <select
                      value={part}
                      onChange={(e) =>
                        setPart(Number(e.target.value) as Part | 0)
                      }
                    >
                      <option value={0}>混合題型</option>
                      {([1, 2, 3, 4, 5, 6, 7] as Part[]).map((p) => (
                        <option key={p} value={p}>
                          Part {p} · {partNames[p]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary-btn"
                    disabled={busy}
                    onClick={() =>
                      void start("mini", selectPractice(part, 20), "限時小測驗")
                    }
                  >
                    開始小測驗
                  </button>
                </article>
                <article className="academy-panel test-card full-mock">
                  <span className="test-label">
                    FULL LENGTH · SET {mockSet}
                  </span>
                  <Target size={30} />
                  <h2>200 題完整模考</h2>
                  <p>
                    聽力 100 題／45 分鐘，閱讀 100 題／75
                    分鐘。每份固定題組，重做會遇到相同題目。
                  </p>
                  <label>
                    選擇模考卷
                    <select
                      value={mockSet}
                      onChange={(e) => setMockSet(e.target.value)}
                    >
                      {mockSets.map((s) => {
                        const done = completed.filter(
                          (a) =>
                            a.mode === "mock" &&
                            (questionMap.get(a.ids[0])?.mockSet || "01") ===
                              s.id,
                        ).length;
                        return (
                          <option key={s.id} value={s.id}>
                            完整模考 {s.id} · {s.count} 題
                            {done ? ` · 已完成 ${done} 次` : " · 尚未完成"}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <div className="mock-parts">
                    {[6, 25, 39, 30, 30, 16, 54].map((n, i) => (
                      <span key={i}>
                        P{i + 1}
                        <b>{n}</b>
                      </span>
                    ))}
                  </div>
                  <button
                    className="primary-btn"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "開始後計時不暫停。聽力音檔由你逐題啟動，每题組一次；45 分鐘後切到閱讀。現在開始 120 分鐘模考？",
                        )
                      )
                        void start(
                          "mock",
                          mockIds(mockSet),
                          `完整模考 ${mockSet}`,
                        );
                    }}
                  >
                    開始完整模考
                  </button>
                </article>
              </div>
              <div className="academy-panel">
                <h3>開始前先知道</h3>
                <p>
                  這是本站自編的完整題數訓練卷，並非 ETS 官方試題。Part 1
                  使用示意圖，聽力使用固定美式合成語音，音檔由你逐題啟動；情境、篇幅及難度不等同正式測驗。模考隱藏翻譯、音標與解析，交卷後開放。
                </p>
                <p>
                  練習題與模考題分開保存。模考先熟悉節奏與答題策略，成績只呈現正確率，不宣稱官方分數。
                </p>
              </div>
            </>
          )}
          {tab === "mistakes" && (
            <>
              <div className="academy-section-head">
                <div>
                  <h2>把錯過的，真正學會。</h2>
                  <p>
                    {weak.length} 題待加強 ·{" "}
                    {weak.filter((x) => x.ready).length}{" "}
                    題已到複習時間。連續兩次答對且未猜答後移出錯題本。
                  </p>
                </div>
                <button
                  className="primary-btn"
                  disabled={busy || !filteredWeak.length}
                  onClick={() =>
                    void start(
                      "practice",
                      filteredWeak.slice(0, 20).map((x) => x.id),
                      "錯題複習",
                    )
                  }
                >
                  練習這些錯題
                </button>
              </div>
              <div className="exam-filters">
                <label>
                  搜尋
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="題目、知識點、解析"
                  />
                </label>
                <label>
                  題型
                  <select
                    value={part}
                    onChange={(e) =>
                      setPart(Number(e.target.value) as Part | 0)
                    }
                  >
                    <option value={0}>全部</option>
                    {([1, 2, 3, 4, 5, 6, 7] as Part[]).map((p) => (
                      <option key={p} value={p}>
                        Part {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="guess-toggle">
                  <input
                    type="checkbox"
                    checked={favoriteOnly}
                    onChange={(e) => setFavoriteOnly(e.target.checked)}
                  />
                  只看收藏
                </label>
              </div>
              {!filteredWeak.length ? (
                <div className="academy-empty">
                  <Check size={35} />
                  <h3>目前沒有符合的錯題</h3>
                  <p>完成練習後，答錯、未答與猜答題會出現在這裡。</p>
                </div>
              ) : (
                filteredWeak.slice(0, 100).map((x) => {
                  const q = questionMap.get(x.id)!;
                  return (
                    <div className="mistake-row" key={x.id}>
                      <div>
                        <span>
                          Part {q.part} · {q.skill}
                        </span>
                        <h3>{q.prompt}</h3>
                        <small>
                          待加強 {x.misses} 次 ·{" "}
                          {x.guessed ? "包含猜答 · " : ""}
                          {x.ready
                            ? "可以複習了"
                            : `下次：${new Date(x.due).toLocaleString("zh-TW")}`}
                        </small>
                      </div>
                      <button
                        className="secondary-btn"
                        disabled={busy}
                        onClick={() =>
                          void start("practice", [x.id], "單題複習")
                        }
                      >
                        重練
                      </button>
                    </div>
                  );
                })
              )}
              {filteredWeak.length > 100 && (
                <p>顯示前 100 題，可使用篩選縮小範圍。</p>
              )}
            </>
          )}
          {tab === "vocabulary" && (
            <>
              <div className="academy-panel">
                <h2>不只認得，也要拼得出、聽得懂。</h2>
                <p>
                  沿用你的 900
                  字單字庫，增加中文提示拼字與純聽寫。這些練習各自保留測驗紀錄，不會改動原本自評的複習間隔。
                </p>
                <div className="exam-filters">
                  <label>
                    情境
                    <select
                      value={wordCategory}
                      onChange={(e) => setWordCategory(e.target.value)}
                    >
                      <option>全部</option>
                      {[...new Set(words.map((w) => w.category))].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    範圍
                    <select
                      value={wordFilter}
                      onChange={(e) => setWordFilter(e.target.value)}
                    >
                      <option value="all">全部單字</option>
                      <option value="learned">已學單字</option>
                      <option value="favorite">收藏單字</option>
                      <option value="weak">曾忘記的單字</option>
                    </select>
                  </label>
                  <label>
                    裝置口音
                    <select
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                    >
                      <option value="en-US">美式英文</option>
                      <option value="en-GB">英式英文（需裝置支援）</option>
                    </select>
                  </label>
                  <label>
                    朗讀速度
                    <select
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    >
                      {[0.65, 0.8, 1, 1.15].map((n) => (
                        <option value={n} key={n}>
                          {n}×
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="button-row">
                  {(["spelling", "dictation"] as const).map((mode) => (
                    <button
                      key={mode}
                      className="primary-btn"
                      disabled={busy}
                      onClick={() => {
                        const eligible = words.filter(
                          (w) =>
                            (wordCategory === "全部" ||
                              w.category === wordCategory) &&
                            (wordFilter === "all" ||
                              (wordFilter === "learned" && state.cards[w.id]) ||
                              (wordFilter === "favorite" &&
                                state.favorites.includes(w.id)) ||
                              (wordFilter === "weak" &&
                                (state.cards[w.id]?.lapses ?? 0) > 0)),
                        );
                        void start(
                          mode,
                          shuffled(eligible)
                            .slice(0, 10)
                            .map((w) => w.id),
                          mode === "spelling" ? "單字拼字特訓" : "聽音拼字特訓",
                        );
                      }}
                    >
                      {mode === "spelling" ? (
                        <Keyboard size={18} />
                      ) : (
                        <Headphones size={18} />
                      )}
                      開始{mode === "spelling" ? "拼字" : "聽寫"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="academy-panel">
                <h3>搭配詞與個人筆記</h3>
                <label>
                  搜尋單字
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="英文、中文或常見搭配"
                  />
                </label>
                <div className="word-practice-grid">
                  {words
                    .filter(
                      (w) =>
                        query &&
                        `${w.word} ${w.meaning} ${w.phrase}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                    )
                    .slice(0, 12)
                    .map((w) => (
                      <article key={w.id}>
                        <h3>{w.word}</h3>
                        <Phonetic text={w.ipa} />
                        <p>{w.meaning}</p>
                        <strong>{w.phrase}</strong>
                        <p>{w.example}</p>
                        <Phonetic text={w.exampleIpa} />
                        <small>{w.translation}</small>
                        <div className="button-row">
                          <button
                            className="text-btn"
                            onClick={() => speak(w.example)}
                          >
                            聽例句
                          </button>
                          <button
                            className="text-btn"
                            onClick={() => editNote(w.id)}
                          >
                            我的筆記
                          </button>
                        </div>
                        {notesId === w.id && (
                          <NoteEditor
                            value={noteText}
                            dirty={noteDirty}
                            busy={busy}
                            onChange={(value) => {
                              setNoteText(value);
                              setNoteDirty(true);
                            }}
                            onSave={() => void saveNote()}
                          />
                        )}
                      </article>
                    ))}
                </div>
                {!query && <p>輸入一個想記住的字，看看它如何用在句子裡。</p>}
              </div>
            </>
          )}
          {tab === "report" && (
            <>
              <div className="academy-metrics">
                <article>
                  <span>完成測驗</span>
                  <strong>{completed.length}</strong>
                  <small>拼字與題型練習合計</small>
                </article>
                <article>
                  <span>累積作答</span>
                  <strong>
                    {completed.reduce(
                      (n, a) => n + Object.keys(a.answers).length,
                      0,
                    )}
                  </strong>
                  <small>不含尚未交卷的測驗</small>
                </article>
                <article>
                  <span>待加強題目</span>
                  <strong>{weak.length}</strong>
                  <small>錯題與猜答去除重複</small>
                </article>
              </div>
              <div className="academy-panel">
                <h2>各題型表現</h2>
                <p>未作答計入錯誤；平均秒數計算已作答題目的頁面停留時間。</p>
                {stats.map((s) => (
                  <div className="part-stat" key={s.part}>
                    <span>
                      P{s.part} {partNames[s.part]}
                    </span>
                    <div>
                      <i style={{ width: s.percent + "%" }} />
                    </div>
                    <strong>{s.total ? s.percent + "%" : "—"}</strong>
                    <small>
                      {s.correct}/{s.total} 題 · {s.seconds} 秒／題 · 猜答{" "}
                      {s.guessed}
                    </small>
                  </div>
                ))}
              </div>
              <div className="academy-panel">
                <h2>知識點弱項</h2>
                {(() => {
                  const map = new Map<string, { total: number; bad: number }>();
                  for (const a of completed)
                    for (const id of a.ids) {
                      const q = questionMap.get(id);
                      if (!q) continue;
                      const s = map.get(q.skill) || { total: 0, bad: 0 };
                      s.total++;
                      if (!isCorrect(a, id) || a.answers[id]?.guessed) s.bad++;
                      map.set(q.skill, s);
                    }
                  const list = [...map]
                    .filter(([, s]) => s.bad)
                    .sort(
                      (a, b) => b[1].bad / b[1].total - a[1].bad / a[1].total,
                    )
                    .slice(0, 8);
                  return list.length ? (
                    list.map(([label, s]) => (
                      <div className="report-row" key={label}>
                        <span>{label}</span>
                        <strong>
                          {s.bad} / {s.total} 題待加強
                        </strong>
                        <button
                          className="text-btn"
                          disabled={busy}
                          onClick={() =>
                            void start(
                              "practice",
                              selectPractice(0, 20, label),
                              label,
                            )
                          }
                        >
                          專項練習
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>完成測驗後，這裡會列出需要加強的知識點。</p>
                  );
                })()}
              </div>
              <div className="academy-panel">
                <h2>最近測驗紀錄</h2>
                {completed.slice(0, 30).map((a) => (
                  <button
                    className="history-row"
                    key={a.id}
                    onClick={() => {
                      setActive(a);
                      setReviewIndex(0);
                    }}
                  >
                    <span>
                      {a.title}
                      <small>
                        {new Date(a.finishedAt!).toLocaleString("zh-TW")}
                      </small>
                    </span>
                    <strong>{results(a).percent}%</strong>
                    <span>
                      {results(a).correct}/{a.ids.length} 題{" "}
                      <ArrowRight size={15} />
                    </span>
                  </button>
                ))}
                {!completed.length && (
                  <p>先完成一次練習，開始建立自己的進步紀錄。</p>
                )}
              </div>
            </>
          )}
          {tab === "collection" && (
            <section className="collection-room" aria-label="角色收藏館">
              <div className="collection-hero">
                <div
                  className={`collection-avatar-preview ${equippedFrame.id}`}
                >
                  {equippedAvatar.image ? <img src={equippedAvatar.image} alt={`${equippedAvatar.name}角色肖像`} /> : <span>{equippedAvatar.icon}</span>}
                </div>
                <div className="collection-hero-copy">
                  <span className="tiny-label">YOUR TOEIC CREW</span>
                  <h2>
                    {equippedAvatar.name} 與 {equippedCompanion.name}
                  </h2>
                  <p>
                    {equippedAvatar.description}收藏和裝備都會跟著你的帳號同步。
                  </p>
                  <div className="collection-summary-pills">
                    <span>
                      🎭{" "}
                      {
                        collectibles.filter(
                          (item) => item.slot === "avatar" && item.unlocked,
                        ).length
                      }{" "}
                      /{" "}
                      {
                        collectibles.filter((item) => item.slot === "avatar")
                          .length
                      }{" "}
                      角色
                    </span>
                    <span>
                      🧰{" "}
                      {
                        collectibles.filter(
                          (item) => item.slot === "companion" && item.unlocked,
                        ).length
                      }{" "}
                      /{" "}
                      {
                        collectibles.filter((item) => item.slot === "companion")
                          .length
                      }{" "}
                      裝備
                    </span>
                    <span>
                      🖼️{" "}
                      {
                        collectibles.filter(
                          (item) => item.slot === "frame" && item.unlocked,
                        ).length
                      }{" "}
                      /{" "}
                      {
                        collectibles.filter((item) => item.slot === "frame")
                          .length
                      }{" "}
                      外框
                    </span>
                  </div>
                </div>
              </div>
              <div className="collection-section-head">
                <div>
                  <span className="tiny-label">COLLECTION</span>
                  <h2>裝備與收藏</h2>
                </div>
                <span>
                  {collectibles.filter((item) => item.unlocked).length} /{" "}
                  {collectibles.length} 已解鎖
                </span>
              </div>
              <div
                className="collection-filters"
                role="tablist"
                aria-label="收藏種類"
              >
                {(
                  [
                    ["avatar", "角色"],
                    ["companion", "裝備"],
                    ["frame", "外框"],
                  ] as const
                ).map(([slot, label]) => (
                  <button
                    role="tab"
                    aria-selected={collectionSlot === slot}
                    className={collectionSlot === slot ? "active" : ""}
                    key={slot}
                    onClick={() => setCollectionSlot(slot)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="collectible-grid">
                {collectibles
                  .filter((item) => item.slot === collectionSlot)
                  .map((item) => {
                    const selected = selection[item.slot] === item.id;
                    return (
                      <button
                        className={`collectible-card ${item.unlocked ? "collectible-ready" : "collectible-locked"} ${selected ? "collectible-selected" : ""}`}
                        key={item.id}
                        disabled={busy || !item.unlocked}
                        onClick={() => void equipCollectible(item)}
                      >
                        <span className="collectible-art" aria-hidden="true">
                          {item.image ? <img src={item.image} alt="" /> : item.icon}
                          {!item.unlocked && (
                            <i>
                              <LockKeyhole size={16} />
                            </i>
                          )}
                        </span>
                        <span className="collectible-copy">
                          <strong>{item.name}</strong>
                          <small>{item.description}</small>
                          <em>
                            {item.unlocked
                              ? selected
                                ? "已裝備"
                                : "已解鎖 · 點選裝備"
                              : item.unlock}
                          </em>
                        </span>
                        {selected && (
                          <span
                            className="collectible-check"
                            aria-label="目前裝備"
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
              <p className="collection-tip">
                <Sparkles size={16} />{" "}
                完成單字練習、連續學習和遊戲挑戰，可逐步解鎖完整收藏。
              </p>
            </section>
          )}
          {tab === "notes" && (
            <>
              <div className="academy-section-head">
                <div>
                  <h2>留給下次的學習線索</h2>
                  <p>單字與考題的收藏、筆記都會隨帳號同步。</p>
                </div>
                <button
                  className="secondary-btn"
                  disabled={busy}
                  onClick={download}
                >
                  <Download size={16} />
                  匯出測驗與筆記
                </button>
              </div>
              <label>
                搜尋
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜尋筆記或題目"
                />
              </label>
              {cloud.notes
                .filter(
                  (n) =>
                    n.id !== collectionProfileId &&
                    (n.note || n.favorite) &&
                    `${n.note} ${questionMap.get(n.id)?.prompt ?? wordMap.get(n.id)?.word ?? ""}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((n) => (
                  <article className="academy-panel" key={n.id}>
                    <div className="academy-section-head">
                      <h3>
                        {wordMap.get(n.id)?.word ??
                          questionMap.get(n.id)?.prompt ??
                          n.id}
                      </h3>
                      <button
                        aria-label={n.favorite ? "取消收藏" : "收藏"}
                        className="icon-btn"
                        disabled={busy}
                        onClick={() => void favorite(n.id)}
                      >
                        <Star
                          fill={n.favorite ? "currentColor" : "none"}
                          size={20}
                        />
                      </button>
                    </div>
                    <p className="saved-note">{n.note || "尚未加入筆記。"}</p>
                    <div className="button-row">
                      <button
                        className="secondary-btn"
                        onClick={() => editNote(n.id)}
                      >
                        編輯筆記
                      </button>
                      {questionMap.has(n.id) && (
                        <button
                          className="secondary-btn"
                          disabled={busy || noteDirty}
                          onClick={() =>
                            void start("practice", [n.id], "收藏題目複習")
                          }
                        >
                          重練這題
                        </button>
                      )}
                    </div>
                    {notesId === n.id && (
                      <NoteEditor
                        value={noteText}
                        dirty={noteDirty}
                        busy={busy}
                        onChange={(value) => {
                          setNoteText(value);
                          setNoteDirty(true);
                        }}
                        onSave={() => void saveNote()}
                      />
                    )}
                  </article>
                ))}
              {!cloud.notes.some(
                (n) => n.id !== collectionProfileId && (n.note || n.favorite),
              ) && (
                <div className="academy-empty">
                  <NotebookPen size={35} />
                  <h3>把自己的理解留下來</h3>
                  <p>在題目解析或單字特訓中按「筆記」，寫下容易混淆的地方。</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

function NoteEditor({
  value,
  dirty,
  busy,
  onChange,
  onSave,
}: {
  value: string;
  dirty: boolean;
  busy: boolean;
  onChange: (s: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="note-editor">
      <label>
        我的筆記
        <textarea
          value={value}
          maxLength={2000}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <button
        className="primary-btn"
        disabled={busy || !dirty}
        onClick={onSave}
      >
        儲存筆記
      </button>
      <small>{dirty ? "尚未儲存" : "已同步"}</small>
    </div>
  );
}

function VoiceRecorder({ onMessage }: { onMessage: (s: string) => void }) {
  const [recording, setRecording] = useState(false),
    [url, setUrl] = useState("");
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function toggle() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        onMessage("此瀏覽器不支援錄音。你仍可播放逐句語音並自行跟讀。");
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      const r = new MediaRecorder(s);
      recorder.current = r;
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        s.getTracks().forEach((t) => t.stop());
        if (timer.current) clearTimeout(timer.current);
        if (alive.current) {
          setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
          setRecording(false);
        }
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => {
        if (r.state === "recording") r.stop();
      }, 60000);
    } catch {
      onMessage("未取得麥克風權限，請在瀏覽器設定允許後再試。");
    }
  }
  return (
    <div className="voice-recorder">
      <button className="secondary-btn" onClick={() => void toggle()}>
        {recording ? "停止錄音" : "錄下我的跟讀"}
      </button>
      <small>最長 60 秒，錄音只留在此頁，不上傳雲端、不自動評分。</small>
      {url && <audio controls src={url} />}
    </div>
  );
}
