import { useState } from "react";
import { Phonetic } from "./phonetic";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  Cloud,
  Download,
  Flame,
  Headphones,
  ListChecks,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Volume2,
  X,
} from "lucide-react";
import { categories, words } from "@/lib/vocabulary";
import { dateKey, daysLeft, streak, type Grade } from "@/lib/learning";
import type { Shared } from "./page";
const findWord = (id: string) => words.find((w) => w.id === id)!;
export function Dashboard({
  state,
  now,
  speak,
  favorite,
  showWord,
  startStudy,
  startQuiz,
  openSettings,
}: Shared & { openSettings: () => void }) {
  const today = state.logs.filter((l) => dateKey(l.at) === dateKey(now)),
    learned = Object.keys(state.cards).length;
  const reviewed = new Set(
    today.filter((l) => l.kind === "review").map((l) => l.wordId),
  ).size;
  const quizToday = today.filter((l) => l.kind === "quiz").length;
  const due = words.filter((w) => state.cards[w.id]?.due <= now).length;
  const newToday = Object.values(state.cards).filter(
    (p) => dateKey(p.firstSeen) === dateKey(now),
  ).length;
  const allQuiz = state.logs.filter((l) => l.kind === "quiz");
  const accuracy = allQuiz.length
    ? Math.round(
        (allQuiz.filter((l) => l.correct).length / allQuiz.length) * 100,
      )
    : 0;
  const remaining = daysLeft(state.settings.examDate, now);
  const dailyTotal = Math.min(
    state.settings.dailyNew,
    words.length - learned + newToday,
  );
  const dailyPercent = Math.round(
    (((dailyTotal ? Math.min(1, newToday / dailyTotal) : 1) +
      Math.min(1, quizToday / 10)) /
      2) *
      100,
  );
  const elapsed = daysLeft(dateKey(now), state.startedAt);
  const phase = elapsed < 14 ? 0 : elapsed < 35 ? 1 : elapsed < 49 ? 2 : 3;
  const phases = ["打好基礎", "累積實力", "加速練習", "考前衝刺"];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">LET’S MAKE PROGRESS</div>
          <h1>每天一點，離目標更近。</h1>
          <p>先複習，再前進。今天也為自己累積一點實力。</p>
        </div>
        <button className="date-chip" onClick={openSettings}>
          <CalendarDays size={17} />
          {state.settings.examDate.replaceAll("-", " / ")}
        </button>
      </div>
      <div className="overview-grid">
        <section className="sprint-card">
          <div className="sprint-copy">
            <span className="light-tag">
              <span />
              60 天多益衝刺計畫
            </span>
            <h2>
              下一站，<em>{state.settings.target}</em> 分。
            </h2>
            <p>把大目標，變成每天做得到的小任務。</p>
            <button className="white-btn" onClick={startStudy}>
              開始今日學習 <ArrowRight size={18} />
            </button>
            <div className="sprint-meta">
              <span>起點 400 分</span>
              <span className="mobile-countdown">距考試 {remaining} 天</span>
              <span>目前階段：{phases[phase]}</span>
            </div>
          </div>
          <div className="countdown">
            <div className="countdown-circle">
              <span>距離考試還有</span>
              <strong>{remaining}</strong>
              <span>天</span>
            </div>
            <span className="countdown-note">每一天，都算數。</span>
          </div>
        </section>
        <section className="daily-card">
          <div className="section-head">
            <h2>今日完成度</h2>
            <span className="tiny-label">DAILY GOAL</span>
          </div>
          <div
            className="daily-ring"
            style={{
              background: `conic-gradient(var(--blue) ${dailyPercent * 3.6}deg, #edf0f7 0)`,
            }}
          >
            <div>
              <strong>
                {dailyPercent}
                <small>%</small>
              </strong>
              <span>
                {dailyPercent === 100 ? "今天做得很好！" : "保持自己的節奏"}
              </span>
            </div>
          </div>
          <div className="daily-bottom">
            <span>
              <i className="dot blue" />
              新字 {newToday} / {dailyTotal}
            </span>
            <span>
              <i className="dot lime" />
              測驗 {Math.min(quizToday, 10)} / 10
            </span>
          </div>
        </section>
      </div>
      <div className="stats-row">
        <Stat
          icon={<BookOpen />}
          label="已學單字"
          value={learned}
          unit={"/ " + words.length}
          note="一字一句，慢慢累積"
        />
        <Stat
          icon={<RotateCcw />}
          label="待複習"
          value={due}
          unit="個單字"
          note={due ? "記憶需要再見一面" : "目前沒有到期單字"}
        />
        <Stat
          icon={<CheckCheck />}
          label="今日已複習"
          value={reviewed}
          unit="個單字"
          note="主動回想，留下記憶"
        />
        <Stat
          icon={<Target />}
          label="測驗正確率"
          value={allQuiz.length ? accuracy : "—"}
          unit={allQuiz.length ? "%" : ""}
          note={allQuiz.length ? "依實際測驗作答計算" : "完成第一次測驗後顯示"}
        />
      </div>
      <div className="lower-grid">
        <section className="panel tasks-panel">
          <div className="section-head">
            <h2>
              今天，從這裡開始 <span className="muted-badge">2 項任務</span>
            </h2>
          </div>
          <button className="task-row" onClick={startStudy}>
            <div className="task-icon purple">
              <BookOpen size={24} />
            </div>
            <div className="task-copy">
              <h3>
                單字複習與新字 <span className="task-tag">先做這個</span>
              </h3>
              <p>
                {due} 個待複習 · 今天還可學 {Math.max(0, dailyTotal - newToday)}{" "}
                個新字
              </p>
            </div>
            <span className="task-go">
              開始背字 <ArrowRight size={17} />
            </span>
          </button>
          <button className="task-row" onClick={startQuiz}>
            <div className="task-icon peach">
              <ListChecks size={24} />
            </div>
            <div className="task-copy">
              <h3>
                單字情境小測驗{" "}
                {quizToday >= 10 && <Check size={17} className="green-text" />}
              </h3>
              <p>10 道題目，把單字放回句子裡</p>
            </div>
            <span className="task-go">
              開始測驗 <ArrowRight size={17} />
            </span>
          </button>
          <div className="tip">
            <Sparkles size={17} />
            <p>先試著回想意思，再翻開答案，記憶會更深刻。</p>
          </div>
        </section>
        <section className="word-pick">
          <div className="section-head">
            <span className="eyebrow">WORD SPOTLIGHT</span>
            <button
              className={
                "icon-btn " +
                (state.favorites.includes("reimburse") ? "starred" : "")
              }
              aria-label="收藏精選單字"
              aria-pressed={state.favorites.includes("reimburse")}
              onClick={() => favorite("reimburse")}
            >
              <Star size={19} />
            </button>
          </div>
          <span className="word-category">財務與商務</span>
          <div className="pick-title">
            <h2>reimburse</h2>
            <button
              className="audio-btn"
              aria-label="播放 reimburse 發音"
              onClick={() => speak("reimburse")}
            >
              <Volume2 size={20} />
            </button>
          </div>
          <p>
            <span className="pos">v.</span> 報銷；償還
          </p>
          <Phonetic text={findWord("reimburse").ipa} />
          <div className="pick-example">
            The company will reimburse you for travel expenses.
          </div>
          <Phonetic text={findWord("reimburse").exampleIpa} />
          <button
            className="text-btn"
            onClick={() => showWord(findWord("reimburse"))}
          >
            看看用法 <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
      <section className="roadmap">
        <div className="section-head">
          <h2>你的 60 天路線圖</h2>
          <span className="tiny-label">一步一步，走到目標</span>
        </div>
        <div className="phase-grid">
          {phases.map((name, i) => (
            <div
              className={"phase " + (i === phase ? "current" : "")}
              key={name}
            >
              <div className="phase-top">
                <span>0{i + 1}</span>
                {i === phase && <b>目前階段</b>}
              </div>
              <h3>{name}</h3>
              <p>
                {
                  [
                    "第 1–14 天 · 基礎字彙與句型",
                    "第 15–35 天 · 商務情境與搭配",
                    "第 36–49 天 · 弱點與限時練習",
                    "第 50–60 天 · 複習與模擬考",
                  ][i]
                }
              </p>
            </div>
          ))}
        </div>
        <p className="roadmap-note">
          本版提供單字、填空與詞義練習；聽力、閱讀題組和完整模擬考需搭配其他教材。
        </p>
      </section>
    </>
  );
}
export function Study({
  state,
  now,
  queue,
  index,
  flipped,
  flip,
  grade,
  sessionDone,
  exit,
  speak,
  favorite,
  startQuiz,
  startStudy,
}: Shared & {
  queue: string[];
  index: number;
  flipped: boolean;
  flip: () => void;
  grade: (g: Grade) => void;
  sessionDone: number;
  exit: () => void;
}) {
  const word = queue[index] ? findWord(queue[index]) : null;
  const newToday = Object.values(state.cards).filter(
    (p) => dateKey(p.firstSeen) === dateKey(now),
  ).length;
  return (
    <>
      <PageTitle
        eyebrow="BUILD YOUR VOCABULARY"
        title="讓單字，留在記憶裡。"
        subtitle="先想一想，再翻面。誠實評估熟悉度，安排下一次相遇。"
      />
      <div className="study-layout">
        <section className="study-main">
          <div className="study-top">
            <span>
              {queue.length ? Math.min(index + 1, queue.length) : 0} /{" "}
              {queue.length} 張
            </span>
            <button className="text-btn" onClick={exit}>
              <X size={16} />
              結束本次
            </button>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: (queue.length ? (index / queue.length) * 100 : 0) + "%",
              }}
            />
          </div>
          {word ? (
            <>
              <div className={"flashcard " + (flipped ? "revealed" : "")}>
                <div className="flashcard-top">
                  <span className="word-category">{word.category}</span>
                  <button
                    className={
                      "icon-btn " +
                      (state.favorites.includes(word.id) ? "starred" : "")
                    }
                    aria-label="收藏單字"
                    aria-pressed={state.favorites.includes(word.id)}
                    onClick={() => favorite(word.id)}
                  >
                    <Star size={21} />
                  </button>
                </div>
                <div className="flashcard-word">
                  <span className="tiny-label">
                    {state.cards[word.id] ? "複習單字" : "新單字"}
                  </span>
                  <h2>{word.word}</h2>
                  <Phonetic text={word.ipa} />
                  <button
                    className="audio-btn"
                    onClick={() => speak(word.word)}
                    aria-label="播放單字發音"
                  >
                    <Volume2 size={23} />
                  </button>
                </div>
                {flipped ? (
                  <div className="answer-content">
                    <p className="meaning">
                      <span>{word.pos}</span> {word.meaning}
                    </p>
                    <div className="example">
                      <p>{word.example}</p>
                      <Phonetic text={word.exampleIpa} />
                      <small>{word.translation}</small>
                      <button
                        className="text-btn"
                        onClick={() => speak(word.example)}
                      >
                        <Volume2 size={16} />
                        朗讀例句
                      </button>
                    </div>
                    <div className="phrase">
                      <span>常見搭配</span>
                      <strong>{word.phrase}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="recall">
                    <p>這個單字是什麼意思？</p>
                    <button className="primary-btn" onClick={flip}>
                      翻開答案 <RotateCcw size={17} />
                    </button>
                    <small>也可以按空白鍵翻面</small>
                  </div>
                )}
              </div>
              {flipped && (
                <div className="grade-buttons">
                  <button onClick={() => grade("again")}>
                    <span>
                      <b>1</b> 忘記了
                    </span>
                    <small>10 分鐘後再見</small>
                  </button>
                  <button onClick={() => grade("hard")}>
                    <span>
                      <b>2</b> 有點印象
                    </span>
                    <small>明天再複習</small>
                  </button>
                  <button onClick={() => grade("good")}>
                    <span>
                      <b>3</b> 記得
                    </span>
                    <small>
                      {state.cards[word.id]?.interval
                        ? Math.min(
                            60,
                            Math.max(
                              3,
                              Math.round(state.cards[word.id].interval * 2.3),
                            ),
                          )
                        : 1}{" "}
                      天後再複習
                    </small>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="completion panel">
              <div className="success-icon">
                <CheckCheck size={36} />
              </div>
              <h2>{sessionDone ? "這一輪，完成了！" : "目前的任務都完成了"}</h2>
              <p>
                {sessionDone
                  ? "這次完成 " +
                    sessionDone +
                    " 張單字卡。忘記的字會在 10 分鐘後回來。"
                  : "到期單字會自動回到這裡，新字額度每天更新。"}
              </p>
              <button className="primary-btn" onClick={startQuiz}>
                用小測驗驗證記憶 <ArrowRight size={18} />
              </button>
              <button className="text-btn" onClick={startStudy}>
                重新檢查待複習
              </button>
            </div>
          )}
        </section>
        <aside className="study-aside panel">
          <span className="eyebrow">A LITTLE, EVERY DAY</span>
          <h3>記住，比看過更重要。</h3>
          <p>不用急著翻面，給自己幾秒鐘回想。忘記也沒關係，下次會更熟悉。</p>
          <div className="aside-stat">
            <span>本次已完成</span>
            <strong>
              {sessionDone}
              <small> 張</small>
            </strong>
          </div>
          <div className="aside-stat">
            <span>今日新字</span>
            <strong>
              {newToday}
              <small> / {state.settings.dailyNew}</small>
            </strong>
          </div>
          <div className="tip">
            <Headphones size={20} />
            <p>按下喇叭，連發音一起記。語音由裝置提供。</p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Stat({
  icon,
  label,
  value,
  unit,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  note: string;
}) {
  return (
    <section className="stat">
      <div className="stat-label">
        <span>{label}</span>
        {icon}
      </div>
      <div className="stat-number">
        {value}
        <span>{unit}</span>
      </div>
      <p>{note}</p>
    </section>
  );
}
function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export function Quiz({
  quiz,
  qi,
  options,
  answer,
  score,
  finished,
  choose,
  next,
  startStudy,
  startQuiz,
}: Shared & {
  quiz: string[];
  qi: number;
  options: string[];
  answer: string | null;
  score: number;
  finished: boolean;
  choose: (id: string) => void;
  next: () => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="PUT WORDS INTO CONTEXT"
        title="記得意思，也懂得運用。"
        subtitle="每次 10 題填空或語境詞義題，優先練習曾答錯與學過的單字。"
      />
      {finished ? (
        <section className="completion panel quiz-panel">
          <div className="success-icon">
            <Target size={38} />
          </div>
          <span className="eyebrow">PRACTICE COMPLETE</span>
          <h2>完成今天的一次練習。</h2>
          <div className="result-score">
            {score}
            <span> / {quiz.length}</span>
          </div>
          <p>
            {score === quiz.length
              ? "全部答對！之後再複習，確認自己真的記得。"
              : "答錯的單字已安排 10 分鐘後複習。下一次會更進步。"}
          </p>
          <div className="button-row">
            <button className="primary-btn" onClick={startQuiz}>
              再練一回 <RotateCcw size={17} />
            </button>
            <button className="secondary-btn" onClick={startStudy}>
              回到單字卡
            </button>
          </div>
        </section>
      ) : quiz[qi] ? (
        <section className="panel quiz-panel">
          <div className="section-head">
            <span className="word-category">{findWord(quiz[qi]).category}</span>
            <span className="tiny-label">
              QUESTION {qi + 1} / {quiz.length}
            </span>
          </div>
          <div className="progress-track">
            <span style={{ width: (qi / quiz.length) * 100 + "%" }} />
          </div>
          <p className="question-label">
            {findWord(quiz[qi]).quizType === "meaning"
              ? `選出「${findWord(quiz[qi]).word}」在下列句子中的意思`
              : "選出最適合填入空格的單字"}
          </p>
          <h2 className="question">{findWord(quiz[qi]).question}</h2>
          <div className="quiz-options">
            {options.map((id, i) => (
              <button
                key={id}
                disabled={answer !== null}
                className={
                  answer !== null
                    ? id === quiz[qi]
                      ? "correct"
                      : id === answer
                        ? "incorrect"
                        : ""
                    : ""
                }
                onClick={() => choose(id)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {findWord(quiz[qi]).quizType === "meaning"
                  ? findWord(id).meaning
                  : id}
                {answer !== null && id === quiz[qi] && <Check size={20} />}
              </button>
            ))}
          </div>
          {answer !== null && (
            <div
              className={
                "feedback " + (answer === quiz[qi] ? "right" : "wrong")
              }
              role="status"
            >
              <h3>
                {answer === quiz[qi]
                  ? "答對了！"
                  : "再記一次，下次就更熟悉了。"}
              </h3>
              <p>
                <strong>{findWord(quiz[qi]).word}</strong> ·{" "}
                {findWord(quiz[qi]).meaning}
              </p>
              <p>{findWord(quiz[qi]).explanation}</p>
              <Phonetic text={findWord(quiz[qi]).ipa} />
              <p>{findWord(quiz[qi]).example}</p>
              <Phonetic text={findWord(quiz[qi]).exampleIpa} />
              <small>{findWord(quiz[qi]).translation}</small>
              <button className="primary-btn" onClick={next}>
                {qi + 1 === quiz.length ? "查看結果" : "下一題"}
                <ArrowRight size={17} />
              </button>
            </div>
          )}
          <p className="quiz-footnote">
            練習題為本站自編，非官方試題；結果不換算多益分數。
          </p>
        </section>
      ) : (
        <button className="primary-btn" onClick={startQuiz}>
          開始測驗
        </button>
      )}
    </>
  );
}
export function Library({ state, favorite, speak, showWord }: Shared) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("全部情境"),
    [onlyFavorites, setOnlyFavorites] = useState(false),
    [page, setPage] = useState(1);
  const filtered = words.filter(
    (w) =>
      (category === "全部情境" || w.category === category) &&
      (!onlyFavorites || state.favorites.includes(w.id)) &&
      [w.word, w.meaning, w.phrase].some((t) =>
        t.toLowerCase().includes(search.toLowerCase().trim()),
      ),
  );
  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleWords = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <>
      <PageTitle
        eyebrow="YOUR WORD COLLECTION"
        title="把每個單字，變成自己的。"
        subtitle={`${words.length} 個核心單字 · ${categories.length} 個學習情境 · 收藏你的重點字`}
      />
      <div className="library-toolbar">
        <label className="search-box">
          <Search size={19} />
          <input
            aria-label="搜尋單字"
            placeholder="搜尋英文、中文或搭配詞…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="選擇單字情境"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {["全部情境", ...categories].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className={"secondary-btn " + (onlyFavorites ? "selected" : "")}
          aria-pressed={onlyFavorites}
          onClick={() => {
            setOnlyFavorites(!onlyFavorites);
            setPage(1);
          }}
        >
          <Star size={17} />
          我的收藏 ({state.favorites.length})
        </button>
      </div>
      <div className="library-info">
        <span aria-live="polite">
          共 {filtered.length} 個單字
          {filtered.length > 0 &&
            ` · 顯示 ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)}`}
        </span>
        <span>點選單字查看例句與搭配</span>
      </div>
      <div className="word-grid">
        {visibleWords.map((w) => (
          <article className="word-tile" key={w.id}>
            <div className="section-head">
              <span className="word-category">{w.category}</span>
              <button
                className={
                  "icon-btn " +
                  (state.favorites.includes(w.id) ? "starred" : "")
                }
                aria-label={"收藏 " + w.word}
                aria-pressed={state.favorites.includes(w.id)}
                onClick={() => favorite(w.id)}
              >
                <Star size={18} />
              </button>
            </div>
            <button className="word-open" onClick={() => showWord(w)}>
              <h3>{w.word}</h3>
              <Phonetic text={w.ipa} />
              <p>
                <span>{w.pos}</span> {w.meaning}
              </p>
            </button>
            <div className="tile-bottom">
              <span
                className={state.cards[w.id] ? "learned-label" : "new-label"}
              >
                {state.cards[w.id]
                  ? state.cards[w.id].interval >= 7
                    ? "穩定複習中"
                    : "已開始學習"
                  : "還沒學過"}
              </span>
              <button
                className="icon-btn"
                aria-label={"朗讀 " + w.word}
                onClick={() => speak(w.word)}
              >
                <Volume2 size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {pageCount > 1 && (
        <nav className="library-pagination" aria-label="單字庫分頁">
          <button
            className="secondary-btn"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            上一頁
          </button>
          <span aria-live="polite">
            第 {currentPage} / {pageCount} 頁
          </span>
          <button
            className="secondary-btn"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            下一頁
          </button>
        </nav>
      )}
      <p className="pronunciation-note">
        美式音標供跟讀參考；整句音標以逐字讀音呈現，實際朗讀可能有連音與弱讀。發音資料：
        <a href="/licenses/cmudict.txt" target="_blank" rel="noreferrer">
          CMUdict
        </a>
        。
      </p>
      {!filtered.length && (
        <div className="empty panel">
          <Search size={30} />
          <h3>沒有符合的單字</h3>
          <p>試著更換搜尋條件，或到單字卡收藏想加強的字。</p>
        </div>
      )}
    </>
  );
}
export function Progress({
  state,
  now,
  startStudy,
  showWord,
  exportBackup,
}: Shared & { exportBackup: () => void }) {
  const allQuiz = state.logs.filter((l) => l.kind === "quiz"),
    learned = Object.keys(state.cards).length;
  const accuracy = allQuiz.length
    ? Math.round(
        (allQuiz.filter((l) => l.correct).length / allQuiz.length) * 100,
      )
    : 0;
  const mastered = Object.values(state.cards).filter(
    (p) => p.interval >= 7,
  ).length;
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 6 + i);
    return {
      label: i === 6 ? "今天" : d.getMonth() + 1 + "/" + d.getDate(),
      count: state.logs.filter((l) => dateKey(l.at) === dateKey(d.getTime()))
        .length,
    };
  });
  const weak = words
    .filter((w) => (state.cards[w.id]?.lapses ?? 0) > 0)
    .sort((a, b) => state.cards[b.id].lapses - state.cards[a.id].lapses)
    .slice(0, 8);
  return (
    <>
      <PageTitle
        eyebrow="SMALL STEPS. REAL PROGRESS."
        title="看見自己的累積。"
        subtitle="每一次回想、每一道練習，都會留下足跡。"
      />
      <div className="stats-row">
        <Stat
          icon={<BookOpen />}
          label="已學單字"
          value={learned}
          unit={"/ " + words.length}
          note="至少練習過一次"
        />
        <Stat
          icon={<ShieldCheck />}
          label="穩定複習"
          value={mastered}
          unit="個單字"
          note="目前複習間隔達 7 天以上"
        />
        <Stat
          icon={<Target />}
          label="測驗正確率"
          value={allQuiz.length ? accuracy : "—"}
          unit={allQuiz.length ? "%" : ""}
          note={"累計 " + allQuiz.length + " 次作答"}
        />
        <Stat
          icon={<Flame />}
          label="連續學習"
          value={streak(state, now)}
          unit="天"
          note="每天一點，維持節奏"
        />
      </div>
      <div className="progress-grid">
        <section className="panel">
          <div className="section-head">
            <h2>最近 7 天的練習</h2>
            <span className="tiny-label">作答與複習次數</span>
          </div>
          <div className="week-chart">
            {week.map((day, i) => (
              <div className="chart-column" key={i}>
                <span>{day.count}</span>
                <div className="bar-zone">
                  <div
                    style={{
                      height: day.count
                        ? Math.max(
                            6,
                            (day.count /
                              Math.max(30, ...week.map((x) => x.count))) *
                              100,
                          ) + "%"
                        : "3px",
                    }}
                    className={i === 6 ? "today-bar" : ""}
                  />
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <h2>情境學習進度</h2>
            <span className="tiny-label">已學 / 總數</span>
          </div>
          <div className="category-progress">
            {categories.map((c) => {
              const list = words.filter((w) => w.category === c),
                n = list.filter((w) => state.cards[w.id]).length;
              return (
                <div key={c}>
                  <div>
                    <span>{c}</span>
                    <strong>
                      {n} / {list.length}
                    </strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: (n / list.length) * 100 + "%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="panel weak-panel">
        <div className="section-head">
          <h2>值得再看一次的單字</h2>
          <button className="text-btn" onClick={startStudy}>
            前往複習 <ArrowRight size={16} />
          </button>
        </div>
        {weak.length ? (
          <div className="weak-list">
            {weak.map((w) => (
              <button key={w.id} onClick={() => showWord(w)}>
                <strong>{w.word}</strong>
                <span>{w.meaning}</span>
                <small>需加強 {state.cards[w.id].lapses} 次</small>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-copy">
            目前沒有需加強的紀錄。開始背字或測驗後，這裡會整理你還不熟悉的單字。
          </p>
        )}
      </section>
      <div className="backup-banner">
        <Cloud size={23} />
        <div>
          <strong>學習紀錄保存在你的帳號</strong>
          <p>換裝置登入即可接續。離開前請確認上方顯示「已同步」。</p>
        </div>
        <button className="secondary-btn" onClick={exportBackup}>
          <Download size={17} />
          匯出備份
        </button>
      </div>
    </>
  );
}
