import { streak, type State } from "./learning";
import { gameStats } from "./gamification";
import { gameRunStats } from "./exam-games";
import type { Attempt } from "./exam-types";
import { results } from "./exam";

export const collectionProfileId = "__toice_collection_v1__";
export type CollectionSlot = "avatar" | "companion" | "frame";
export type CollectionSelection = Record<CollectionSlot, string>;
export type Collectible = {
  id: string;
  slot: CollectionSlot;
  name: string;
  icon: string;
  description: string;
  unlock: string;
  unlocked: boolean;
  image?: string;
};

export const defaultCollection: CollectionSelection = {
  avatar: "avatar-owl",
  companion: "pet-sparrow",
  frame: "frame-paper",
};
const allowedSelection: Record<CollectionSlot, string[]> = {
  avatar: ["avatar-owl", "avatar-panda", "avatar-fox", "avatar-dragon", "avatar-farah", "avatar-alex"],
  companion: ["pet-sparrow", "pet-slime", "pet-robot", "pet-phoenix"],
  frame: ["frame-paper", "frame-leaf", "frame-gold", "frame-trophy"],
};

export function collectionCatalog(
  state: State,
  attempts: Attempt[],
  now: number,
): Collectible[] {
  const vocabReviews = state.logs.filter((log) => log.kind === "review").length;
  const learned = Object.keys(state.cards).length;
  const days = streak(state, now);
  const finished = attempts.filter((attempt) => !!attempt.finishedAt);
  const gameClears = finished.filter((attempt) => !!attempt.challenge).length;
  const perfectBoss = finished.some(
    (attempt) =>
      attempt.challenge === "boss" &&
      attempt.ids.length === 12 &&
      Object.keys(attempt.answers).length === 12 &&
      gameRunStats(attempt).correct >= 9,
  );
  const level = gameStats(state, now).level;
  const mockClears = finished.some(
    (attempt) =>
      attempt.mode === "mock" &&
      attempt.ids.length === 200 &&
      Object.keys(attempt.answers).length === 200,
  );
  const campaignClears = finished.filter((attempt) => /^【戰役:C\d-S\d】/.test(attempt.title));
  const campaignPassed = (chapter: number) => campaignClears.some((attempt) => attempt.title.startsWith(`【戰役:C${chapter}-`) && results(attempt).percent >= 70);
  return [
    {
      id: "avatar-owl",
      slot: "avatar",
      name: "陳美雅 · 營運策略師",
      icon: "MC",
      image: "/characters/maya-chen.webp",
      description: "台灣營運策略師，擅長把混亂拆成可執行的計畫。",
      unlock: "一開始就可使用",
      unlocked: true,
    },
    {
      id: "avatar-panda",
      slot: "avatar",
      name: "Marcus Reed · 溝通教練",
      icon: "MR",
      image: "/characters/marcus-reed.webp",
      description: "資深溝通顧問，熟悉會議、簡報與跨部門協作。",
      unlock: "累積 30 次單字練習",
      unlocked: vocabReviews >= 30,
    },
    {
      id: "avatar-fox",
      slot: "avatar",
      name: "Priya Raman · 商務顧問",
      icon: "PR",
      image: "/characters/priya-raman.webp",
      description: "國際商務顧問，善於從合約細節找出關鍵資訊。",
      unlock: "連續學習 3 天",
      unlocked: days >= 3,
    },
    {
      id: "avatar-dragon",
      slot: "avatar",
      name: "Sofia Alvarez · 運輸規劃師",
      icon: "SA",
      image: "/characters/sofia-alvarez.webp",
      description: "物流與交通規劃專家，能在時限內排除路線問題。",
      unlock: "通過第 2 章戰役",
      unlocked: campaignPassed(2) || perfectBoss,
    },
    {
      id: "avatar-farah", slot: "avatar", name: "Farah El-Amin · 採購稽核師", icon: "FE",
      image: "/characters/farah-elamin.webp", description: "採購稽核師，專長核對報價、條款與供應商紀錄。",
      unlock: "通過第 4 章戰役", unlocked: campaignPassed(4),
    },
    {
      id: "avatar-alex", slot: "avatar", name: "Alex Santos · 資訊設計師", icon: "AS",
      image: "/characters/alex-santos.webp", description: "非二元資訊設計師，將複雜公告轉成清楚的行動線索。",
      unlock: "通過第 6 章戰役", unlocked: campaignPassed(6),
    },
    {
      id: "pet-sparrow",
      slot: "companion",
      name: "現場錄音筆",
      icon: "🎙️",
      description: "整理會議重點，強化聽力與關鍵字辨識。",
      unlock: "一開始就可使用",
      unlocked: true,
    },
    {
      id: "pet-slime",
      slot: "companion",
      name: "文件掃描器",
      icon: "▤",
      description: "快速比對公告、表單與多文件線索。",
      unlock: "學會 50 個單字",
      unlocked: learned >= 50,
    },
    {
      id: "pet-robot",
      slot: "companion",
      name: "資料終端",
      icon: "▣",
      description: "彙整限時訓練數據與考點紀錄。",
      unlock: "完成 5 場遊戲挑戰",
      unlocked: gameClears >= 5,
    },
    {
      id: "pet-phoenix",
      slot: "companion",
      name: "即時翻譯器",
      icon: "⇄",
      description: "切換語境理解商務用語與改寫表達。",
      unlock: "連續學習 7 天",
      unlocked: days >= 7,
    },
    {
      id: "frame-paper",
      slot: "frame",
      name: "晨讀紙框",
      icon: "📒",
      description: "簡潔的起跑紀念框。",
      unlock: "一開始就可使用",
      unlocked: true,
    },
    {
      id: "frame-leaf",
      slot: "frame",
      name: "常青邊框",
      icon: "🌿",
      description: "紀念持續回到書桌的自己。",
      unlock: "連續學習 3 天",
      unlocked: days >= 3,
    },
    {
      id: "frame-gold",
      slot: "frame",
      name: "金色榮耀框",
      icon: "🥇",
      description: "為穩定累積的努力加冕。",
      unlock: "達到第 6 級",
      unlocked: level >= 6,
    },
    {
      id: "frame-trophy",
      slot: "frame",
      name: "考場冠軍框",
      icon: "🏆",
      description: "完成一回完整模擬考的紀念。",
      unlock: "完成一回 200 題模考",
      unlocked: mockClears,
    },
  ];
}

export function readCollection(note: string | undefined): CollectionSelection {
  if (!note) return defaultCollection;
  try {
    const saved = JSON.parse(note) as Partial<CollectionSelection>;
    return {
      avatar:
        typeof saved.avatar === "string" &&
        allowedSelection.avatar.includes(saved.avatar)
          ? saved.avatar
          : defaultCollection.avatar,
      companion:
        typeof saved.companion === "string" &&
        allowedSelection.companion.includes(saved.companion)
          ? saved.companion
          : defaultCollection.companion,
      frame:
        typeof saved.frame === "string" &&
        allowedSelection.frame.includes(saved.frame)
          ? saved.frame
          : defaultCollection.frame,
    };
  } catch {
    return defaultCollection;
  }
}
