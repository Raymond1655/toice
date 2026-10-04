export type StoryWord = {
  word: string;
  ipa: string;
  part: string;
  meaning: string;
  example: string;
  translation: string;
};
export type StoryLine = { en: string; zh: string };
export type StoryQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type InspirationalStory = {
  id: string;
  title: string;
  subtitle: string;
  level: "TOEIC 400–550" | "TOEIC 500–650" | "TOEIC 600–700";
  minutes: number;
  lines: StoryLine[];
  words: StoryWord[];
  questions: StoryQuestion[];
  referenceVideo?: string;
  referenceTitle?: string;
  referenceChannel?: string;
};

export const inspirationalStories: InspirationalStory[] = [
  {
    id: "stress-and-recovery",
    title: "The Strength to Pause",
    subtitle: "壓力不會消失，但你可以學會恢復。",
    level: "TOEIC 400–550",
    minutes: 3,
    referenceVideo: "FAk9ZOVWL7M",
    referenceTitle: "壓力與成長：學會休息，重新出發",
    referenceChannel: "流暢英語學習 Smooth English Learning",
    lines: [
      {
        en: "Sara opened her laptop and saw thirty unread messages.",
        zh: "Sara 打開筆電，看見三十則未讀訊息。",
      },
      {
        en: "A tight deadline made her feel overwhelmed.",
        zh: "緊迫的期限讓她感到不知所措。",
      },
      {
        en: "She believed that taking a break meant falling behind.",
        zh: "她原以為休息就代表落後。",
      },
      {
        en: "Her mentor offered a different view: recovery is part of good work.",
        zh: "導師提出不同看法：恢復精神也是做好工作的部分。",
      },
      {
        en: "Sara chose one important task instead of trying to solve everything.",
        zh: "Sara 不再試著一次解決所有事，而是選出一項重要任務。",
      },
      {
        en: "She finished the report, asked one clear question, and took a short walk.",
        zh: "她完成報告、問了一個明確的問題，接著出去走了一小段路。",
      },
      {
        en: "The next morning, she returned with a clearer mind and a steadier plan.",
        zh: "隔天早上，她帶著更清楚的思緒和更穩定的計畫回到工作崗位。",
      },
      {
        en: "The deadline was still real, but it no longer controlled every thought.",
        zh: "期限依然存在，但它不再占據她所有的思緒。",
      },
      {
        en: "Progress did not mean working without stopping.",
        zh: "進步不代表不停地工作。",
      },
      {
        en: "It meant knowing when to focus, ask for help, and recover.",
        zh: "進步代表知道何時專注、尋求協助，以及恢復精神。",
      },
    ],
    words: [
      {
        word: "deadline",
        ipa: "ˈdɛdˌlaɪn",
        part: "noun",
        meaning: "期限；截止日期",
        example: "The deadline for the report is Friday.",
        translation: "這份報告的期限是星期五。",
      },
      {
        word: "overwhelmed",
        ipa: "ˌoʊvərˈwɛlmd",
        part: "adjective",
        meaning: "不知所措的；難以承受的",
        example: "She felt overwhelmed by the amount of work.",
        translation: "她覺得工作量大到難以承受。",
      },
      {
        word: "recovery",
        ipa: "rɪˈkʌvəri",
        part: "noun",
        meaning: "恢復；復原",
        example: "Rest is important for recovery.",
        translation: "休息對恢復很重要。",
      },
      {
        word: "focus",
        ipa: "ˈfoʊkəs",
        part: "verb / noun",
        meaning: "專注；焦點",
        example: "Please focus on the most urgent task.",
        translation: "請先專注於最緊急的工作。",
      },
      {
        word: "steady",
        ipa: "ˈstɛdi",
        part: "adjective",
        meaning: "穩定的；持續的",
        example: "The team made steady progress.",
        translation: "團隊持續穩定地進步。",
      },
      {
        word: "fall behind",
        ipa: "fɔl bɪˈhaɪnd",
        part: "phrase",
        meaning: "落後；進度落後",
        example: "We cannot afford to fall behind schedule.",
        translation: "我們不能讓進度落後。",
      },
    ],
    questions: [
      {
        question: "What did Sara do after finishing the report?",
        options: [
          "She took a short walk.",
          "She sent thirty messages.",
          "She canceled the deadline.",
        ],
        answer: 0,
        explanation: "第六句提到她完成報告後出去走了一小段路。",
      },
      {
        question: "What did her mentor say about recovery?",
        options: [
          "It should wait until the project ends.",
          "It is part of doing good work.",
          "It makes deadlines less important.",
        ],
        answer: 1,
        explanation: "導師認為恢復精神是做好工作的部分。",
      },
      {
        question: "What is the story's main idea?",
        options: [
          "Never accept a difficult task.",
          "Work faster whenever you feel pressure.",
          "Focus, ask for help, and make time to recover.",
        ],
        answer: 2,
        explanation: "最後一句總結故事：專注、求助，也要恢復精神。",
      },
    ],
  },
  {
    id: "one-more-interview",
    title: "One More Interview",
    subtitle: "一次拒絕，不會決定你的終點。",
    level: "TOEIC 500–650",
    minutes: 3,
    lines: [
      {
        en: "After her third job interview, Lina received another rejection email.",
        zh: "第三次面試後，Lina 又收到一封婉拒信。",
      },
      {
        en: "For a moment, she wanted to stop applying.",
        zh: "有那麼一刻，她想放棄投履歷。",
      },
      {
        en: "Then she reviewed her notes and found one answer she could improve.",
        zh: "接著她重新看自己的筆記，發現有一個回答可以再改進。",
      },
      {
        en: "She practiced that answer with a friend and asked for honest feedback.",
        zh: "她和朋友練習那個回答，並請對方坦白給她建議。",
      },
      {
        en: "The next interview was still difficult, but she felt more prepared.",
        zh: "下一次面試仍然不容易，但她覺得準備得更充分。",
      },
      {
        en: "The manager noticed how clearly she explained her past projects.",
        zh: "主管注意到她能清楚說明自己過去的專案。",
      },
      {
        en: "A week later, Lina received an offer—not because she was perfect, but because she kept learning.",
        zh: "一週後，Lina 收到錄取通知——不是因為她完美無缺，而是因為她持續學習。",
      },
      {
        en: "Every attempt had given her something useful to bring to the next one.",
        zh: "每一次嘗試，都讓她帶著有用的經驗走向下一次機會。",
      },
    ],
    words: [
      {
        word: "rejection",
        ipa: "rɪˈdʒɛkʃən",
        part: "noun",
        meaning: "拒絕；婉拒",
        example: "We received a rejection notice yesterday.",
        translation: "我們昨天收到婉拒通知。",
      },
      {
        word: "review",
        ipa: "rɪˈvju",
        part: "verb / noun",
        meaning: "檢視；複習；審查",
        example: "Please review your answers before submitting.",
        translation: "送出前請檢查你的答案。",
      },
      {
        word: "feedback",
        ipa: "ˈfidˌbæk",
        part: "noun",
        meaning: "回饋；意見",
        example: "The supervisor gave useful feedback.",
        translation: "主管給了實用的回饋。",
      },
      {
        word: "prepared",
        ipa: "prɪˈpɛrd",
        part: "adjective",
        meaning: "準備好的；有備而來的",
        example: "All applicants should arrive prepared.",
        translation: "所有應徵者都應做好準備再到場。",
      },
      {
        word: "attempt",
        ipa: "əˈtɛmpt",
        part: "noun / verb",
        meaning: "嘗試；試圖",
        example: "Her first attempt was not successful.",
        translation: "她第一次嘗試並未成功。",
      },
    ],
    questions: [
      {
        question: "What did Lina improve before her next interview?",
        options: [
          "One answer",
          "Her resume photo",
          "The interviewer's schedule",
        ],
        answer: 0,
        explanation: "她在筆記中找到一個可以改善的回答。",
      },
      {
        question: "Why did Lina receive an offer?",
        options: [
          "She had never made a mistake.",
          "She kept learning from each attempt.",
          "Her friend applied for her.",
        ],
        answer: 1,
        explanation: "她持續學習，把每次嘗試變成經驗。",
      },
      {
        question: "What does feedback mean in the story?",
        options: [
          "Advice about how she can improve",
          "A final job contract",
          "A list of interview dates",
        ],
        answer: 0,
        explanation: "朋友提供建議，幫助她改善回答。",
      },
    ],
  },
  {
    id: "the-quiet-teammate",
    title: "The Quiet Teammate",
    subtitle: "團隊最需要的能力，不一定最顯眼。",
    level: "TOEIC 600–700",
    minutes: 3,
    lines: [
      {
        en: "When the presentation file disappeared, everyone began to panic.",
        zh: "簡報檔案消失時，所有人都開始慌張。",
      },
      {
        en: "Noah, the quietest person on the team, asked when the file had last been saved.",
        zh: "團隊裡最安靜的 Noah 問大家上次存檔是什麼時候。",
      },
      {
        en: "He checked the shared folder and found an earlier version.",
        zh: "他檢查共用資料夾，找到一個較早的版本。",
      },
      {
        en: "The slides were not perfect, but the key figures were still there.",
        zh: "投影片雖然不完美，但重要數字都還在。",
      },
      {
        en: "While others rebuilt the design, Noah confirmed the figures with the finance team.",
        zh: "其他人重新整理設計時，Noah 向財務團隊確認數字。",
      },
      {
        en: "The group finished on time because each person handled a clear part.",
        zh: "每個人都負責明確的部分，因此團隊準時完成。",
      },
      {
        en: "After the meeting, the manager thanked Noah for staying calm and organized.",
        zh: "會議結束後，主管感謝 Noah 保持冷靜、有條理。",
      },
      {
        en: "Noah realized that leadership can begin with one useful question.",
        zh: "Noah 發現，領導力可以從一個有幫助的問題開始。",
      },
    ],
    words: [
      {
        word: "shared",
        ipa: "ʃɛrd",
        part: "adjective",
        meaning: "共用的；共同的",
        example: "Save the document in the shared folder.",
        translation: "請把文件存到共用資料夾。",
      },
      {
        word: "version",
        ipa: "ˈvɜrʒən",
        part: "noun",
        meaning: "版本；說法",
        example: "Please use the latest version of the file.",
        translation: "請使用這份檔案的最新版。",
      },
      {
        word: "figure",
        ipa: "ˈfɪɡjər",
        part: "noun",
        meaning: "數字；數據；人物",
        example: "The sales figures increased in June.",
        translation: "六月的銷售數據增加了。",
      },
      {
        word: "organized",
        ipa: "ˈɔrɡəˌnaɪzd",
        part: "adjective",
        meaning: "有條理的；有組織的",
        example: "She keeps organized records of each order.",
        translation: "她有條理地保存每筆訂單紀錄。",
      },
      {
        word: "on time",
        ipa: "ɑn taɪm",
        part: "phrase",
        meaning: "準時；按時",
        example: "The presentation began on time.",
        translation: "簡報準時開始。",
      },
    ],
    questions: [
      {
        question: "Where did Noah find an earlier file?",
        options: [
          "In the shared folder",
          "In a printed brochure",
          "In the manager's email",
        ],
        answer: 0,
        explanation: "他在共用資料夾找到較早的版本。",
      },
      {
        question: "Why did the group finish on time?",
        options: [
          "They canceled the meeting.",
          "Everyone handled a clear part.",
          "The file was already perfect.",
        ],
        answer: 1,
        explanation: "每個人負責明確的部分，因此準時完成。",
      },
      {
        question: "What did Noah learn about leadership?",
        options: [
          "It can start with a useful question.",
          "It requires speaking the most.",
          "It means doing everyone's work.",
        ],
        answer: 0,
        explanation: "故事最後提到，領導力可以從有幫助的問題開始。",
      },
    ],
  },
];
