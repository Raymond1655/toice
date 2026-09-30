import fs from "node:fs";
import { expansionScenes } from "../content/expansion-scenes.mjs";
import { advanced } from "../content/expansion-advanced.mjs";

function rows(name, columns) {
  return fs
    .readFileSync(`content/expansion-${name}.tsv`, "utf8")
    .trim()
    .split(/\r?\n/)
    .filter((x) => x && !x.startsWith("#"))
    .map((x, i) => {
      const cells = x.split("|");
      if (cells.length !== columns)
        throw Error(
          `${name}:${i + 1}: expected ${columns} columns, got ${cells.length}`,
        );
      return cells;
    });
}
export function expansion() {
  const questions = [];
  const add = (
    id,
    part,
    pool,
    skill,
    prompt,
    options,
    explanation,
    extra = {},
  ) => {
    // Fixed per-ID shuffle keeps answers stable as the bank grows.
    let seed = [...id].reduce(
      (n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0,
      2166136261,
    );
    const indices = options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    questions.push({
      id: `v2-${id}`,
      part,
      pool,
      skill,
      prompt,
      options: indices.map((i) => options[i]),
      correct: indices.indexOf(0),
      explanation,
      ...extra,
    });
  };
  const responses = rows("responses", 6);
  if (responses.length !== 150)
    throw Error(`Expected 150 responses: ${responses.length}`);
  responses.forEach(([prompt, answer, b, c, skill, explanation], i) => {
    const mock =
      i % 2 ? String(2 + Math.floor(i / 50)).padStart(2, "0") : undefined;
    add(
      `response-${i + 1}`,
      2,
      mock ? "mock" : "practice",
      skill,
      prompt,
      [answer, b, c],
      explanation,
      {
        transcript: prompt,
        translation: explanation,
        topic: "職場溝通",
        ...(mock ? { mockSet: mock } : {}),
      },
    );
  });
  rows("grammar", 10).forEach(([opts, skill, why, ...stems], i) => {
    stems.forEach((stem, j) => {
      const mock = j >= 4 ? String(j - 2).padStart(2, "0") : undefined;
      add(
        `grammar-${i + 1}-${j + 1}`,
        5,
        mock ? "mock" : "practice",
        skill,
        stem,
        opts.split("/"),
        why,
        { topic: "職場文法", ...(mock ? { mockSet: mock } : {}) },
      );
    });
  });
  const practice = rows("practice", 9),
    mocks = rows("mocks", 9);
  if (practice.length !== 60 || mocks.length !== 126)
    throw Error("Scenario counts changed unexpectedly");
  const formats = [
    "Email",
    "Staff notice",
    "Service update",
    "Member bulletin",
    "Internal message",
    "Customer information",
  ];
  function scenario(s, i, part, mockSet, source) {
    const [
      title,
      topic,
      audience,
      announcement,
      reason,
      action,
      condition,
      followup,
      inference,
    ] = s;
    const pool = mockSet ? "mock" : "practice";
    const group = `v2-${mockSet ? `m${mockSet}` : "practice"}-p${part}-${i + 1}`;
    const extra = { group, topic, ...(mockSet ? { mockSet } : {}) };
    // Distractors come from different authored situations; the correct answer is always grounded in this text.
    const choices = (column, answer = s[column]) => [
      answer,
      ...[1, 7, 19].map((n) => source[(i + n) % source.length][column]),
    ];
    const evidence = (zh, text) => `${zh} 文中依據：「${text}」`;
    const base = `${formats[i % formats.length]}: ${title}\nFor: ${audience}\n\n${announcement} ${reason}\n\n${action} ${condition}\n\n${followup}`;
    const facts = [
      [
        "主旨與目的",
        "What is the main subject of this message?",
        choices(3),
        evidence("主旨由開頭的公告內容判斷。", announcement),
      ],
      [
        "原因與細節",
        "Why is this arrangement being made?",
        choices(4),
        evidence("原因直接說明了安排背後的需求。", reason),
      ],
      [
        "下一步行動",
        "What are the recipients asked to do?",
        choices(5),
        evidence("要求採取的行動出現在指示句。", action),
      ],
      [
        "條件與限制",
        "Which condition is stated in the message?",
        choices(6),
        evidence("應留意適用條件，不能自行擴大規則。", condition),
      ],
      [
        "情境推論",
        "What can reasonably be inferred from the information?",
        choices(8),
        evidence(
          "整合安排與限制後，可推得：" + inference,
          `${announcement} ${condition}`,
        ),
      ],
      [
        "後續安排",
        "What will happen next?",
        choices(7),
        evidence("後續安排在最後一段。", followup),
      ],
    ];
    if (part === 3 || part === 4) {
      const dialogues = [
        `A: Have you seen the update for ${audience}?\nB: Yes. ${announcement}\nA: Why is that happening?\nB: ${reason}\nA: What do we need to tell people?\nB: ${action} ${condition}\nA: And what happens after that?\nB: ${followup}`,
        `A: I need to brief the team about ${title.toLowerCase()}. What has been decided?\nB: ${announcement} ${reason}\nA: Is there anything people need to do?\nB: ${action}\nA: We should also mention the restrictions.\nB: That's right. ${condition} ${followup}`,
        `A: I'm preparing the message for ${audience}. Can you check the details?\nB: Certainly. ${announcement}\nA: We should explain the reason.\nB: ${reason}\nA: I'll include these instructions: ${action}\nB: Good. Please also add this: ${condition} ${followup}`,
      ];
      extra.transcript =
        part === 3
          ? dialogues[i % dialogues.length]
          : `Good morning, everyone. This is an update for ${audience}. ${announcement} ${reason} Please keep the following instructions in mind. ${action} ${condition} Finally, ${followup[0].toLowerCase() + followup.slice(1)} Thank you for your attention.`;
      extra.translation = `情境：${topic}／${title}。聽力依序包含新安排、原因、應採取的行動、限制及後續處理；各題解析標示英文依據。`;
      let selected =
        part === 3
          ? [facts[1], facts[2], facts[4]]
          : [facts[0], facts[3], facts[5]];
      if (i % 4 === 0) {
        const department = [
          "Visitor services",
          "Operations",
          "Client support",
          "Administration",
        ][i % 4];
        const route = ["Desk A", "Desk B", "Desk C", "Desk D"];
        const n = (Math.floor(i / 4) + part) % 4;
        extra.graphic = `INFORMATION DESKS\n${route.map((x, j) => `${x} — ${["Visitor services", "Operations", "Client support", "Administration"][(j - n + 4) % 4]}`).join("\n")}`;
        // department is Visitor services for i divisible by four; its desk is n.
        extra.transcript += `\n${part === 3 ? "A: " : ""}For questions about this update, please contact ${department}. The information desk chart shows where to go.`;
        selected = [
          selected[0],
          selected[1],
          [
            "圖表整合",
            "Look at the graphic. Which desk should a listener visit with a question about this update?",
            [route[n], ...route.filter((x) => x !== route[n])],
            `聽力指定 ${department}；對照圖表可找到 ${route[n]}，需要結合兩種資訊。`,
          ],
        ];
      }
      selected.forEach(([skill, prompt, opts, why], j) =>
        add(`${group}-q${j + 1}`, part, pool, skill, prompt, opts, why, extra),
      );
    } else if (part === 6) {
      const openings = [
        [
          `This information is intended ------- [1] ${audience}. Please read it ------- [2].`,
          ["for", "with", "at", "from"],
          ["carefully", "careful", "care", "caring"],
          "be intended for 表示對象；read 是動詞，需要副詞 carefully 修飾。",
        ],
        [
          `The following details have ------- [1] confirmed. They are ------- [2] for ${audience}.`,
          ["been", "being", "be", "is"],
          ["important", "importance", "importantly", "import"],
          "have been confirmed 是完成式被動；are 後接形容詞 important。",
        ],
        [
          `We would like ------- [1] share an update with ${audience}. Please review the information before ------- [2] your plans.`,
          ["to", "for", "at", "by"],
          ["finalizing", "finalize", "finalized", "finalizes"],
          "would like to 接原形動詞；介系詞 before 後接動名詞 finalizing。",
        ],
        [
          `An update for ${audience} is now ------- [1]. Please read ------- [2] before making arrangements.`,
          ["available", "availability", "availably", "avail"],
          ["it", "its", "itself", "they"],
          "is 後接形容詞 available；read 的受詞 it 指單數的 update。",
        ],
      ];
      const [intro, opts1, opts2, why] = openings[i % openings.length];
      extra.passage = `${formats[i % formats.length]}: ${title}\n\n${intro}\n\n${announcement} ------- [3]\n\n${action} ${condition}\n\n------- [4]`;
      extra.translation = `情境：${topic}／${title}。第 1、2 格練習篇章文法，第 3 格連接原因，第 4 格補入後續安排。`;
      [
        ["篇章文法", "Choose the best word for blank [1].", opts1, why],
        ["篇章文法", "Choose the best word for blank [2].", opts2, why],
        [
          "句子銜接",
          "Choose the sentence for blank [3] that explains the reason for the announcement.",
          choices(4),
          evidence(
            "前句說明新安排，此處接合理的原因。",
            `${announcement} ${reason}`,
          ),
        ],
        [
          "句子銜接",
          "Choose the sentence that best completes blank [4].",
          choices(7),
          evidence(
            "段落末尾應接與本情境相關的後續處理。",
            `${action} ${followup}`,
          ),
        ],
      ].forEach(([skill, prompt, opts, explanation], j) =>
        add(
          `${group}-q${j + 1}`,
          part,
          pool,
          skill,
          prompt,
          opts,
          explanation,
          extra,
        ),
      );
    } else {
      const readingIndex = mockSet ? i - 27 : i;
      const multi = mockSet ? readingIndex >= 10 : i % 3 !== 0;
      const triple = multi && i % 2 === 0;
      extra.format = multi ? (triple ? "三篇閱讀" : "雙篇閱讀") : "單篇閱讀";
      extra.passage = multi
        ? `DOCUMENT 1 — ${formats[i % formats.length]}\nSubject: ${title}\nFor: ${audience}\n\n${announcement} ${reason}\n\nDOCUMENT 2 — Team message\nPlease use the following instructions when responding to the update.\n${action} ${condition}${triple ? "\n\nDOCUMENT 3 — Follow-up note\n" : "\n"}${followup}`
        : base;
      extra.translation = `情境：${topic}／${title}。${multi ? "交叉閱讀公告與團隊訊息，留意各文件的用途。" : "閱讀公告的安排、原因及要求。"}推論題須整合細節，不只尋找相同單字。`;
      const count =
        mockSet && !multi ? [2, 2, 2, 3, 3, 3, 3, 3, 4, 4][readingIndex] : 5;
      const selected = multi
        ? [
            facts[0],
            facts[1],
            facts[2],
            facts[3],
            [
              "跨文件推論",
              "What is suggested by the documents when read together?",
              facts[4][2],
              facts[4][3],
            ],
          ]
        : facts.slice(0, count);
      selected.forEach(([skill, prompt, opts, why], j) =>
        add(`${group}-q${j + 1}`, part, pool, skill, prompt, opts, why, extra),
      );
    }
  }
  practice.forEach((s, i) => {
    scenario(s, i, i % 2 ? 3 : 4, undefined, practice);
    scenario(s, i, 6, undefined, practice);
    scenario(s, i, 7, undefined, practice);
  });
  for (let k = 0; k < 3; k++) {
    const source = mocks.slice(k * 42, (k + 1) * 42);
    source.forEach((s, i) => {
      // These two slots use the separately authored intent/inference conversations below.
      if (i !== 0 && i !== 13)
        scenario(
          s,
          i,
          i < 13 ? 3 : i < 23 ? 4 : i < 27 ? 6 : 7,
          String(k + 2).padStart(2, "0"),
          source,
        );
    });
  }
  expansionScenes.forEach(([correct, translation, svg, ...wrong], i) => {
    const image = `/exam-scenes/v2-${i + 1}.svg`;
    fs.writeFileSync(
      `public${image}`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#eef2f5"/>${svg}</svg>`,
    );
    const mockSet =
      i >= 12
        ? String(2 + Math.floor((i - 12) / 6)).padStart(2, "0")
        : undefined;
    add(
      `scene-${i + 1}`,
      1,
      mockSet ? "mock" : "practice",
      "圖像中的動作與位置",
      "Choose the statement that best describes the illustration.",
      [correct, ...wrong],
      translation,
      {
        image,
        translation,
        topic: "圖像觀察",
        ...(mockSet ? { mockSet } : {}),
      },
    );
  });
  advanced.forEach(({ rows, ...set }, i) => {
    const group = `v2-advanced-${i + 1}`;
    rows.forEach(([skill, prompt, a, b, c, d, why], j) =>
      add(
        `advanced-${i + 1}-${j + 1}`,
        set.part,
        set.mockSet ? "mock" : "practice",
        skill,
        prompt,
        [a, b, c, d],
        why,
        {
          ...set,
          group,
          translation: `情境：${set.topic}。請搭配逐題解析理解證據、句意與推論。`,
        },
      ),
    );
  });
  return { questions, add };
}
