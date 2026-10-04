"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  CircleCheck,
  Clock3,
  ExternalLink,
  Headphones,
  LoaderCircle,
  NotebookPen,
  Play,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useLearningNotes } from "./use-learning-notes";
import "./short-videos.css";

type ShortVideo = {
  id: string;
  title: string;
  description: string;
  channel: string;
  channelUrl: string;
  published: string;
  category: string;
  thumbnail: string;
  url: string;
};

const filters = [
  "全部",
  "情境字彙",
  "實用片語",
  "聽力理解",
  "發音跟讀",
  "文法片語",
];
const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function ShortVideos({ userId }: { userId: string }) {
  const cloud = useLearningNotes(userId);
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("全部");
  const [savedOnly, setSavedOnly] = useState(false);
  const [playing, setPlaying] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  async function loadVideos() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/short-videos", { cache: "no-store" });
      if (!response.ok) throw new Error("暫時無法取得最新影片。");
      const data = (await response.json()) as {
        videos: ShortVideo[];
        updatedAt: string;
      };
      setVideos(data.videos);
      setUpdatedAt(data.updatedAt);
      if (!data.videos.length)
        setError("推薦頻道最近沒有新的 Shorts；稍後再回來看看。");
    } catch {
      setError("暫時無法連線到影片來源，請稍後重試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVideos();
  }, []);

  const allVideos = useMemo(() => {
    const saved = cloud.notes
      .filter((note) => note.id.startsWith("yt:") && note.favorite)
      .map((note) => {
        try {
          return JSON.parse(note.note) as ShortVideo;
        } catch {
          return videos.find((video) => video.id === note.id.slice(3)) ?? null;
        }
      })
      .filter((video): video is ShortVideo => !!video);
    return [
      ...new Map(
        [...videos, ...saved].map((video) => [video.id, video]),
      ).values(),
    ];
  }, [videos, cloud.notes]);
  const displayed = useMemo(
    () =>
      allVideos.filter((video) => {
        const categoryMatches = filter === "全部" || video.category === filter;
        const favorite = cloud.notes.some(
          (note) => note.id === `yt:${video.id}` && note.favorite,
        );
        return categoryMatches && (!savedOnly || favorite);
      }),
    [allVideos, filter, savedOnly, cloud.notes],
  );
  const todayKey = localDay(new Date());
  const completedToday = cloud.notes.filter((note) => {
    if (!note.id.startsWith("yt-watch:")) return false;
    try {
      return localDay(new Date(note.note)) === todayKey;
    } catch {
      return false;
    }
  }).length;

  async function toggleSaved(video: ShortVideo) {
    const id = `yt:${video.id}`;
    const existing = cloud.notes.find((note) => note.id === id);
    const saved = await cloud.annotate(
      id,
      existing?.favorite ? existing.note : JSON.stringify(video),
      !existing?.favorite,
    );
    setNotice(
      saved
        ? !existing?.favorite
          ? "已加入收藏"
          : "已取消收藏"
        : "收藏未同步，請稍後再試。",
    );
  }

  async function markStudied(video: ShortVideo) {
    const id = `yt-watch:${video.id}`;
    const saved = await cloud.annotate(id, new Date().toISOString(), false);
    setNotice(
      saved ? "已記錄今天完成這支影片" : "完成紀錄未同步，請稍後再試。",
    );
  }

  async function savePhrase(video: ShortVideo) {
    const phrase =
      drafts[video.id] ??
      cloud.notes.find((note) => note.id === `yt-note:${video.id}`)?.note ??
      "";
    if (!phrase.trim()) {
      setNotice("先寫下一個片語或例句，再儲存筆記。");
      return;
    }
    const saved = await cloud.annotate(
      `yt-note:${video.id}`,
      phrase.trim(),
      false,
    );
    setNotice(saved ? "片語筆記已同步至帳號" : "筆記未同步，請稍後再試。");
  }

  return (
    <section className="shorts-page" aria-label="每日英文短影音">
      <header className="shorts-hero">
        <div>
          <span className="tiny-label">TOICE · DAILY ENGLISH CLIPS</span>
          <h1>每天看一支，練出英文反應力。</h1>
          <p>
            精選英文教學頻道最新
            Shorts。先聽一次，再開字幕，記下一個今天會用的片語。
          </p>
          <div className="shorts-source">
            <span className="source-live" /> 來源：BBC Learning English、VOA
            Learning English
          </div>
        </div>
        <div className="shorts-hero-stat">
          <strong>{completedToday}</strong>
          <span>今天已完成影片</span>
        </div>
      </header>

      <div className="shorts-toolbar">
        <div>
          <span className="tiny-label">NEW EVERY DAY</span>
          <h2>最新英文短影音</h2>
        </div>
        <div className="shorts-toolbar-actions">
          {updatedAt && (
            <small>更新於 {new Date(updatedAt).toLocaleString("zh-TW")}</small>
          )}
          <button
            className="secondary-btn"
            onClick={() => {
              void loadVideos();
              void cloud.refresh();
            }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "shorts-spin" : ""} />{" "}
            更新
          </button>
        </div>
      </div>

      <div className="shorts-filters" aria-label="篩選影片">
        {filters.map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
        <button
          className={`shorts-saved-filter ${savedOnly ? "active" : ""}`}
          onClick={() => setSavedOnly((value) => !value)}
        >
          <Bookmark size={14} /> 我的收藏
        </button>
      </div>

      {(error || cloud.error || notice) && (
        <p className="shorts-notice" role="status">
          {error || cloud.error || notice}
        </p>
      )}
      {loading && !videos.length && (
        <div className="shorts-empty">
          <LoaderCircle className="shorts-spin" />
          <span>正在尋找最新英文 Shorts…</span>
        </div>
      )}
      {!loading && !displayed.length && (
        <div className="shorts-empty">
          <Headphones size={28} />
          <strong>
            {error
              ? "稍後再試"
              : savedOnly
                ? "還沒有收藏影片"
                : "這個分類暫時沒有新影片"}
          </strong>
          <span>
            {savedOnly
              ? "在影片卡片按書籤，就會出現在這裡。"
              : "更換分類或稍後重新整理。"}
          </span>
        </div>
      )}

      <div className="shorts-grid">
        {displayed.map((video, index) => {
          const favorite = cloud.notes.some(
            (note) => note.id === `yt:${video.id}` && note.favorite,
          );
          const watchNote = cloud.notes.find(
            (note) => note.id === `yt-watch:${video.id}`,
          );
          const watchedToday =
            !!watchNote && localDay(new Date(watchNote.note)) === todayKey;
          const phraseNote =
            cloud.notes.find((note) => note.id === `yt-note:${video.id}`)
              ?.note ?? "";
          const isPlaying = playing === video.id;
          return (
            <article
              className={`short-video-card ${index === 0 && !savedOnly ? "short-video-featured" : ""}`}
              key={video.id}
            >
              <div className="short-video-frame">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?playsinline=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <button
                    className="short-video-poster"
                    onClick={() => setPlaying(video.id)}
                    aria-label={`播放 ${video.title}`}
                  >
                    <img src={video.thumbnail} alt="" loading="lazy" />
                    <span className="short-video-play">
                      <Play size={22} fill="currentColor" />
                    </span>
                    <b>
                      {index === 0 && !savedOnly
                        ? "TODAY’S PICK"
                        : "LATEST SHORT"}
                    </b>
                  </button>
                )}
              </div>
              <div className="short-video-content">
                <div className="short-video-meta">
                  <span>{video.category}</span>
                  <time dateTime={video.published}>
                    <Clock3 size={12} />
                    {new Date(video.published).toLocaleDateString("zh-TW")}
                  </time>
                </div>
                <h3>{video.title}</h3>
                <a
                  className="short-video-channel"
                  href={video.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {video.channel}
                  <ExternalLink size={12} />
                </a>
                {video.description && (
                  <p className="short-video-description">{video.description}</p>
                )}
                {isPlaying && (
                  <div className="shorts-study-steps">
                    <strong>
                      <Volume2 size={15} /> 三步學會這支影片
                    </strong>
                    <span>
                      ① 先不看字幕聽一次　② 開英文字幕確認　③ 記下新片語並跟讀
                    </span>
                    <label>
                      <NotebookPen size={14} />
                      <textarea
                        maxLength={500}
                        value={drafts[video.id] ?? phraseNote}
                        onChange={(event) =>
                          setDrafts((old) => ({
                            ...old,
                            [video.id]: event.target.value,
                          }))
                        }
                        placeholder="記下片語、意思或自己的例句…"
                      />
                    </label>
                    <button
                      className="text-btn"
                      disabled={
                        cloud.saving || !(drafts[video.id] ?? phraseNote).trim()
                      }
                      onClick={() => void savePhrase(video)}
                    >
                      <Check size={14} /> 儲存片語筆記
                    </button>
                  </div>
                )}
                <div className="short-video-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setPlaying(isPlaying ? "" : video.id)}
                  >
                    {isPlaying ? (
                      "收起影片"
                    ) : (
                      <>
                        開始學習 <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                  <button
                    className={`video-icon-action ${favorite ? "saved" : ""}`}
                    onClick={() => void toggleSaved(video)}
                    disabled={cloud.saving}
                    aria-label={favorite ? "取消收藏" : "收藏影片"}
                  >
                    <Bookmark
                      size={17}
                      fill={favorite ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className={`video-icon-action ${watchedToday ? "saved" : ""}`}
                    onClick={() => void markStudied(video)}
                    disabled={cloud.saving}
                    aria-label="標記今天已學習"
                  >
                    {watchedToday ? (
                      <CircleCheck size={18} />
                    ) : (
                      <Check size={18} />
                    )}
                  </button>
                </div>
                {watchedToday && (
                  <small className="video-watched-label">已記錄今天完成</small>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="shorts-footer">
        <Sparkles size={15} />
        <span>
          影片由原頻道提供與播放；TOICE 只整理公開英文教學
          Shorts，不下載或重製影片。
        </span>
      </footer>
    </section>
  );
}
