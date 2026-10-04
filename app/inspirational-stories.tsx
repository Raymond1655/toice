"use client";

import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  Headphones,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Phonetic } from "./phonetic";
import { inspirationalStories } from "@/lib/inspirational-stories";
import { useLearningNotes } from "./use-learning-notes";
import "./inspirational-stories.css";

const dayIndex = () => {
  const now = new Date();
  const day = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000,
  );
  return day % inspirationalStories.length;
};

export default function InspirationalStories({ userId }: { userId: string }) {
  const cloud = useLearningNotes(userId);
  const [storyIndex, setStoryIndex] = useState(dayIndex);
  const [showTranslation, setShowTranslation] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const story = inspirationalStories[storyIndex];
  const progressId = `story:finished:${story.id}`;
  const noteId = `story:note:${story.id}`;
  const finished = cloud.notes.some(
    (item) => item.id === progressId && item.favorite,
  );
  const savedNote = cloud.notes.find((item) => item.id === noteId)?.note ?? "";
  const correctCount = useMemo(
    () =>
      answers.reduce(
        (sum, answer, index) =>
          sum + (answer === story.questions[index]?.answer ? 1 : 0),
        0,
      ),
    [answers, story.questions],
  );

  function selectStory(index: number) {
    setStoryIndex(index);
    setAnswers([]);
    setChecked(false);
    setNote("");
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  async function saveProgress() {
    await cloud.annotate(progressId, new Date().toISOString(), true);
  }

  async function saveNote() {
    await cloud.annotate(noteId, note, false);
  }

  return (
    <div className="story-page">
      <header className="story-hero">
        <div className="story-hero-copy">
          <span className="story-eyebrow">
            <Lightbulb size={15} /> ENGLISH FOR YOUR NEXT CHAPTER
          </span>
          <h1>勵志故事學英文</h1>
          <p>
            每天讀一段真實生活感的英文故事，逐句理解、累積多益字彙，再用小測驗確認自己真的學會。
          </p>
          <div className="story-hero-meta">
            <span>
              <BookOpenCheck size={16} /> 3 篇原創雙語故事
            </span>
            <span>
              <Headphones size={16} /> 逐句朗讀與音標
            </span>
          </div>
        </div>
        <div className="story-hero-mark" aria-hidden="true">
          ONE
          <br />
          STEP
          <br />
          <span>FORWARD</span>
        </div>
      </header>

      <section className="story-shelf" aria-label="選擇一篇故事">
        <div className="story-section-heading">
          <div>
            <span className="story-kicker">YOUR DAILY STORY</span>
            <h2>選一篇開始</h2>
          </div>
          <span className="story-daily-label">今日推薦</span>
        </div>
        <div className="story-tabs">
          {inspirationalStories.map((item, index) => (
            <button
              key={item.id}
              className={`story-tab ${index === storyIndex ? "selected" : ""}`}
              onClick={() => selectStory(index)}
            >
              <span className="story-tab-number">0{index + 1}</span>
              <span className="story-tab-copy">
                <strong>{item.title}</strong>
                <small>
                  {item.level} · 約 {item.minutes} 分鐘
                </small>
              </span>
              {cloud.notes.some(
                (n) => n.id === `story:finished:${item.id}` && n.favorite,
              ) && <CircleCheck size={17} className="story-tab-check" />}
              {index === storyIndex && <ChevronRight size={17} />}
            </button>
          ))}
        </div>
      </section>

      <article className="story-article">
        <div className="story-article-head">
          <div>
            <span className="story-kicker">
              {story.level} <i>·</i> {story.minutes} MIN READ
            </span>
            <h2>{story.title}</h2>
            <p>{story.subtitle}</p>
          </div>
          {finished && (
            <span className="story-finished-pill">
              <Check size={15} /> 已完成
            </span>
          )}
        </div>

        {story.referenceVideo && (
          <section className="story-video-block">
            <div className="story-subhead">
              <div>
                <span className="story-kicker">WATCH & LISTEN</span>
                <h3>主題影片</h3>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${story.referenceVideo}`}
                target="_blank"
                rel="noreferrer"
              >
                在 YouTube 開啟 <ExternalLink size={14} />
              </a>
            </div>
            <div className="story-video-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${story.referenceVideo}?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=en`}
                title={story.referenceTitle ?? "English motivational video"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="story-caption-help">
              <Headphones size={18} />
              <p>
                <strong>字幕翻譯提示</strong>
                <br />
                播放後開啟「CC」英文字幕；再按設定 ⚙ → 字幕 → 自動翻譯 →
                中文（繁體）。影片原字幕由 YouTube
                提供；下方雙語逐句稿是配合主題的原創練習故事。
              </p>
            </div>
          </section>
        )}

        <section className="story-reading">
          <div className="story-subhead">
            <div>
              <span className="story-kicker">READ & REPEAT</span>
              <h3>逐句字幕</h3>
            </div>
            <button
              className="story-translation-toggle"
              onClick={() => setShowTranslation((value) => !value)}
            >
              {showTranslation ? "隱藏翻譯" : "顯示翻譯"}
            </button>
          </div>
          <ol className="story-lines">
            {story.lines.map((line, index) => (
              <li key={`${story.id}-${index}`}>
                <span className="story-line-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="story-line-copy">
                  <p>{line.en}</p>
                  {showTranslation && <span>{line.zh}</span>}
                </div>
                <button
                  className="story-speak"
                  onClick={() => speak(line.en)}
                  aria-label={`朗讀第 ${index + 1} 句`}
                  title="朗讀英文"
                >
                  <Volume2 size={17} />
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className="story-vocabulary">
          <div className="story-subhead">
            <div>
              <span className="story-kicker">TOEIC WORD BANK</span>
              <h3>重點單字與片語</h3>
            </div>
            <span className="story-word-count">{story.words.length} WORDS</span>
          </div>
          <div className="story-word-grid">
            {story.words.map((word) => (
              <article className="story-word-card" key={word.word}>
                <div className="story-word-title">
                  <div>
                    <h4>{word.word}</h4>
                    <Phonetic text={word.ipa} />
                  </div>
                  <button
                    className="story-speak"
                    onClick={() => speak(word.word)}
                    aria-label={`朗讀 ${word.word}`}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <span className="story-word-part">{word.part}</span>
                <p className="story-word-meaning">{word.meaning}</p>
                <div className="story-word-example">
                  <p>{word.example}</p>
                  <small>{word.translation}</small>
                  <button onClick={() => speak(word.example)}>
                    <Volume2 size={14} /> 聽例句
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="story-quiz">
          <div className="story-subhead">
            <div>
              <span className="story-kicker">CHECK YOUR UNDERSTANDING</span>
              <h3>理解挑戰</h3>
            </div>
            <span className="story-word-count">
              {story.questions.length} QUESTIONS
            </span>
          </div>
          {story.questions.map((item, questionIndex) => (
            <fieldset
              className="story-question"
              key={`${story.id}-q${questionIndex}`}
            >
              <legend>
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                {item.question}
              </legend>
              <div className="story-options">
                {item.options.map((option, optionIndex) => {
                  const selected = answers[questionIndex] === optionIndex;
                  const correct = checked && optionIndex === item.answer;
                  const incorrect =
                    checked && selected && optionIndex !== item.answer;
                  return (
                    <button
                      key={option}
                      className={`story-option ${selected ? "chosen" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`}
                      onClick={() => {
                        if (!checked)
                          setAnswers((old) => {
                            const next = [...old];
                            next[questionIndex] = optionIndex;
                            return next;
                          });
                      }}
                      disabled={checked}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                      {correct && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
              {checked && (
                <p className="story-explanation">{item.explanation}</p>
              )}
            </fieldset>
          ))}
          <div className="story-quiz-actions">
            {checked ? (
              <>
                <strong className="story-score">
                  答對 {correctCount} / {story.questions.length} 題
                </strong>
                <button
                  className="story-secondary-btn"
                  onClick={() => {
                    setAnswers([]);
                    setChecked(false);
                  }}
                >
                  <RotateCcw size={16} /> 再挑戰一次
                </button>
              </>
            ) : (
              <button
                className="story-primary-btn"
                disabled={answers.length < story.questions.length}
                onClick={() => setChecked(true)}
              >
                查看挑戰結果 <ChevronRight size={17} />
              </button>
            )}
          </div>
        </section>

        <section className="story-reflection">
          <div>
            <span className="story-kicker">MAKE IT YOURS</span>
            <h3>寫下今天的一步</h3>
            <p>用一句話記錄你想帶走的想法，會同步保存到帳號。</p>
          </div>
          <textarea
            value={note || savedNote}
            onChange={(event) => setNote(event.target.value)}
            maxLength={2000}
            placeholder="例如：今天先完成最重要的一件事，再安排休息。"
          />
          <button
            className="story-secondary-btn"
            disabled={cloud.saving || (!note && savedNote.length === 0)}
            onClick={() => void saveNote()}
          >
            {cloud.saving ? (
              <LoaderCircle className="story-spin" size={16} />
            ) : (
              <Check size={16} />
            )}{" "}
            {savedNote && !note ? "已保存想法" : "保存想法"}
          </button>
        </section>
        <div className="story-complete-row">
          <span>
            {cloud.error ||
              (cloud.saving
                ? "正在同步故事紀錄…"
                : "故事完成、筆記與想法會同步到你的帳號。")}
          </span>
          <button
            className="story-primary-btn"
            disabled={cloud.saving || finished}
            onClick={() => void saveProgress()}
          >
            {finished ? (
              <>
                <Check size={16} /> 已完成閱讀
              </>
            ) : (
              <>
                完成今日閱讀 <ChevronRight size={17} />
              </>
            )}
          </button>
        </div>
      </article>
    </div>
  );
}
