import { streak, type State } from "./learning";
import { gameStats } from "./gamification";
import { gameRunStats } from "./exam-games";
import type { Attempt } from "./exam-types";

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
};

export const defaultCollection: CollectionSelection = {
  avatar: "avatar-owl",
  companion: "pet-sparrow",
  frame: "frame-paper",
};
const allowedSelection: Record<CollectionSlot, string[]> = {
  avatar: ["avatar-owl", "avatar-panda", "avatar-fox", "avatar-dragon"],
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
  return [
    {
      id: "avatar-owl",
      slot: "avatar",
      name: "起跑貓頭鷹",
      icon: "🦉",
      description: "你的第一位衝刺隊友。",
      unlock: "一開始就可使用",
      unlocked: true,
    },
    {
      id: "avatar-panda",
      slot: "avatar",
      name: "單字熊貓",
      icon: "🐼",
      description: "最喜歡把生字收進收藏冊。",
      unlock: "累積 30 次單字練習",
      unlocked: vocabReviews >= 30,
    },
    {
      id: "avatar-fox",
      slot: "avatar",
      name: "連勝狐狸",
      icon: "🦊",
      description: "連續學習，耳朵越來越靈。",
      unlock: "連續學習 3 天",
      unlocked: days >= 3,
    },
    {
      id: "avatar-dragon",
      slot: "avatar",
      name: "首領小龍",
      icon: "🐉",
      description: "擊敗弱點首領後加入隊伍。",
      unlock: "首領戰答對至少 9 題",
      unlocked: perfectBoss,
    },
    {
      id: "pet-sparrow",
      slot: "companion",
      name: "晨光麻雀",
      icon: "🐦",
      description: "每天開始練習時陪你報到。",
      unlock: "一開始就可使用",
      unlocked: true,
    },
    {
      id: "pet-slime",
      slot: "companion",
      name: "咖啡史萊姆",
      icon: "☕",
      description: "吸收新單字後會閃閃發亮。",
      unlock: "學會 50 個單字",
      unlocked: learned >= 50,
    },
    {
      id: "pet-robot",
      slot: "companion",
      name: "答題機器人",
      icon: "🤖",
      description: "喜歡挑戰限時關卡。",
      unlock: "完成 5 場遊戲挑戰",
      unlocked: gameClears >= 5,
    },
    {
      id: "pet-phoenix",
      slot: "companion",
      name: "七日鳳凰",
      icon: "🔥",
      description: "連續練習後從火光中現身。",
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
