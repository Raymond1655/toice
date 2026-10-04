import type { Attempt, Part } from "./exam-types";
import { results } from "./exam";

export type CampaignStage = {
  id: string;
  chapter: number;
  stage: number;
  title: string;
  operation: string;
  briefing: string;
  part: Part;
  questions: number;
  focus: string;
};

const chapters = [
  { title: "失聯航班", operation: "恢復航班聯絡", focus: "機場廣播與旅客應對", parts: [1, 2, 3] },
  { title: "港口封鎖", operation: "重新排定貨運", focus: "物流時程與路線變更", parts: [4, 5, 7] },
  { title: "併購風暴", operation: "確認交易條款", focus: "商務合約與企業公告", parts: [5, 6, 7] },
  { title: "飯店危機", operation: "安置國際代表團", focus: "旅宿服務與客訴處理", parts: [2, 3, 7] },
  { title: "供應鏈追蹤", operation: "找回關鍵零件", focus: "採購郵件與多文件比對", parts: [3, 5, 7] },
  { title: "董事會倒數", operation: "完成全球簡報", focus: "跨部門決策與綜合閱讀", parts: [1, 4, 6] },
] as const;

export const campaignStages: CampaignStage[] = chapters.flatMap((chapter, index) =>
  chapter.parts.map((part, stageIndex) => ({
    id: `C${index + 1}-S${stageIndex + 1}`,
    chapter: index + 1,
    stage: stageIndex + 1,
    title: chapter.title,
    operation: chapter.operation,
    briefing: `任務簡報：${chapter.focus}。在限時情境中辨認語意、定位細節並完成 ${chapter.operation}。`,
    part: part as Part,
    questions: stageIndex === 2 ? 10 : 8,
    focus: chapter.focus,
  })),
);

export function campaignTitle(stage: CampaignStage) {
  return `【戰役:${stage.id}】${stage.title} · ${stage.operation}`;
}

export function campaignStageResult(attempts: Attempt[], stage: CampaignStage) {
  const runs = attempts.filter((attempt) => attempt.title.startsWith(`【戰役:${stage.id}】`) && attempt.finishedAt);
  const best = runs.reduce((value, attempt) => Math.max(value, starsFor(attempt)), 0);
  return { runs: runs.length, best };
}

export function starsFor(attempt: Attempt) {
  const percent = results(attempt).percent;
  return percent >= 100 ? 3 : percent >= 85 ? 2 : percent >= 70 ? 1 : 0;
}
