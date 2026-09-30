import fs from "node:fs";
import { families, mockGrammar } from "../content/exam-grammar.mjs";
import { responses, conversations, talks } from "../content/exam-listening.mjs";
import { completions, readings } from "../content/exam-reading.mjs";
import { expansion } from "./exam-expansion.mjs";

// Reuse the same checked CMU dictionary conversion as the existing vocabulary.
const source = fs.readFileSync(
  new URL("./build-vocabulary.mjs", import.meta.url),
  "utf8",
);
const ipaSource =
  source.slice(0, source.indexOf("const parts =")) +
  `
Object.assign(overrides, {promptness:'ˈprɑmptnəs',departmentally:'dɪˌpɑrtˈmɛntəli',informatively:'ɪnˈfɔrmətɪvli',noticeboard:'ˈnoʊtɪsˌbɔrd',mandatorily:'ˈmændəˌtɔrəli',quotable:'ˈkwoʊtəbəl',"participant's":'pɑrˈtɪsəpənts',"instructor's":'ɪnˈstrʌktərz',"nina's":'ˈninəz',"assistant's":'əˈsɪstənts',availably:'əˈveɪləbli',unaccepted:'ˌʌnəkˈsɛptɪd',placeholder:'ˈpleɪsˌhoʊldər',"venue's":'ˈvɛnjuz',washrooms:'ˈwɑʃˌrumz',shortlisted:'ˈʃɔrtˌlɪstɪd',compostable:'kəmˈpoʊstəbəl',roadworks:'ˈroʊdˌwɜrks',sailings:'ˈseɪlɪŋz',deactivation:'diˌæktəˈveɪʃən',stallholders:'ˈstɔlˌhoʊldərz',uneaten:'ʌnˈitən',digitization:'ˌdɪdʒətəˈzeɪʃən',remeasure:'riˈmɛʒər',"item's":'ˈaɪtəmz',"organizer's":'ˈɔrɡəˌnaɪzərz'});
export { pronounce, missing };\n`;
fs.writeFileSync(new URL("./exam-ipa.mjs", import.meta.url), ipaSource);
const { pronounce, missing } = await import("./exam-ipa.mjs");
const qs = [];
function add(part, pool, skill, prompt, options, explanation, extra = {}) {
  const id = `p${part}-${pool}-${String(qs.filter((q) => q.part === part && q.pool === pool).length + 1).padStart(3, "0")}`;
  const shift = qs.length % options.length;
  const rotated = options.slice(shift).concat(options.slice(0, shift));
  qs.push({
    id,
    part,
    pool,
    skill,
    prompt,
    options: rotated,
    correct: (options.length - shift) % options.length,
    explanation,
    ...extra,
  });
}
for (const [skill, opts, why, stems] of families)
  for (const stem of stems)
    add(5, "practice", skill, stem, opts.split("|"), why);
for (const row of mockGrammar.split("\n")) {
  const [stem, a, b, c, d, skill, why] = row.split("|");
  add(5, "mock", skill, stem, [a, b, c, d], why);
}
for (const [i, row] of responses.split("\n").entries()) {
  const [stem, a, b, c, skill, why] = row.split("|");
  add(2, i < 50 ? "practice" : "mock", skill, stem, [a, b, c], why, {
    transcript: stem,
    translation: why,
  });
}
for (const [part, sets, held] of [
  [3, conversations, 13],
  [4, talks, 10],
  [6, completions, 4],
  [7, readings, 15],
]) {
  for (const [i, [title, text, translation, rows]] of sets.entries()) {
    const pool = i < held ? "mock" : "practice",
      group = `group-${part}-${i + 1}`;
    for (const row of rows) {
      const [prompt, a, b, c, d, why] = row.split("~");
      add(
        part,
        pool,
        part === 6
          ? "篇章語法與銜接"
          : part === 7
            ? "閱讀細節與推論"
            : "聽力細節與推論",
        prompt,
        [a, b, c, d],
        why,
        {
          group,
          translation,
          ...(part < 5 ? { transcript: text } : { passage: text }),
        },
      );
    }
  }
}

// Code-native illustrations for visual-description training; deliberately labeled, not passed off as exam photos.
const scenes = [
  [
    "The tables are arranged in rows.",
    "桌子排列成數排。",
    '<g fill="#a77d53">' +
      [0, 1, 2]
        .map((y) =>
          [0, 1, 2]
            .map(
              (x) =>
                `<rect x="${65 + x * 130}" y="${80 + y * 90}" width="95" height="42" rx="4"/><path d="M${75 + x * 130} ${122 + y * 90}v24m75-24v24" stroke="#566373" stroke-width="7"/>`,
            )
            .join(""),
        )
        .join("") +
      "</g>",
    "People are moving a piano.",
    "A worker is painting the ceiling.",
    "The tables are covered with dishes.",
  ],
  [
    "A bicycle is leaning against a wall.",
    "腳踏車靠在牆上。",
    '<path d="M20 230H460M20 90H460M20 160H460" stroke="#cbd5df" stroke-width="3"/><g fill="none" stroke="#355579" stroke-width="9"><circle cx="140" cy="260" r="55"/><circle cx="350" cy="260" r="55"/><path d="M140 260l75-100 55 100H140m75-100 135 100-40-145h35m-140 40h40"/></g>',
    "A cyclist is crossing a bridge.",
    "Several cars are parked in a garage.",
    "A man is repairing an engine.",
  ],
  [
    "Boxes are stacked on shelves.",
    "箱子堆放在層架上。",
    '<path d="M75 55v290m330-290v290M75 155h330M75 260h330" stroke="#596579" stroke-width="12"/>' +
      [0, 1]
        .map((y) =>
          [0, 1, 2]
            .map(
              (x) =>
                `<rect x="${92 + x * 100}" y="${83 + y * 105}" width="78" height="65" fill="#d7ad76"/><path d="M${131 + x * 100} ${83 + y * 105}v65" stroke="#f5e5c9" stroke-width="9"/>`,
            )
            .join(""),
        )
        .join(""),
    "Workers are loading a truck.",
    "The shelves are being removed.",
    "A woman is opening a window.",
  ],
  [
    "Several boats are tied beside a dock.",
    "幾艘船繫在碼頭旁。",
    '<rect y="100" width="480" height="280" fill="#a7d6df"/><path d="M0 150h480M0 230h480M0 310h480" stroke="#d3eef2" stroke-width="5"/><rect x="15" y="30" width="450" height="65" fill="#b69269"/>' +
      [0, 1, 2]
        .map(
          (i) =>
            `<path d="M${70 + i * 135} 170l35 120 35-120Z" fill="#fff" stroke="#4c6a7c" stroke-width="4"/><path d="M${105 + i * 135} 170V65" stroke="#766454" stroke-width="3"/>`,
        )
        .join(""),
    "Passengers are boarding a bus.",
    "A ship is sailing under a bridge.",
    "The dock is crowded with people.",
  ],
  [
    "An umbrella is open above a table.",
    "陽傘撐開在桌子上方。",
    '<path d="M90 145Q240-45 390 145Z" fill="#e7a66d"/><path d="M240 140v195" stroke="#66726d" stroke-width="10"/><ellipse cx="240" cy="265" rx="115" ry="30" fill="#7a9c78"/><path d="M170 280v65m140-65v65" stroke="#557553" stroke-width="10"/>',
    "A server is carrying a tray.",
    "The chairs are stacked on a table.",
    "A window is being closed.",
  ],
  [
    "Suitcases are standing beside a bench.",
    "行李箱直立放在長椅旁。",
    '<rect x="40" y="150" width="225" height="70" rx="5" fill="#829fba"/><rect x="40" y="230" width="225" height="24" fill="#4e6a83"/><path d="M65 250v65m175-65v65" stroke="#4e6a83" stroke-width="10"/>' +
      [0, 1]
        .map(
          (i) =>
            `<rect x="${310 + i * 80}" y="${210 - i * 30}" width="60" height="105" rx="10" fill="${i ? "#d29663" : "#5c8784"}"/><path d="M${327 + i * 80} ${210 - i * 30}v-35h26v35" fill="none" stroke="#53606b" stroke-width="5"/>`,
        )
        .join(""),
    "Travelers are entering an airplane.",
    "A suitcase is lying open on the floor.",
    "A man is sitting on a bench.",
  ],
];
fs.mkdirSync("public/exam-scenes", { recursive: true });
const practiceScenes = [
  [
    "Books are standing on a shelf.",
    "書直立放在架上。",
    '<rect x="40" y="285" width="400" height="20" fill="#896f55"/>' +
      [0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            `<rect x="${70 + i * 55}" y="${110 + (i % 2) * 25}" width="40" height="${175 - (i % 2) * 25}" fill="${["#75979b", "#b0b990", "#c29479"][i % 3]}"/>`,
        )
        .join(""),
    "A woman is reading a newspaper.",
    "Books are scattered on the floor.",
    "A worker is building a desk.",
  ],
  [
    "Potted plants are beside a window.",
    "盆栽在窗旁。",
    '<rect x="70" y="25" width="340" height="190" fill="#c5e3eb" stroke="#8eabb7" stroke-width="12"/><path d="M240 25v190" stroke="#8eabb7" stroke-width="9"/>' +
      [0, 1, 2]
        .map(
          (i) =>
            `<path d="M${120 + i * 120} 275v-85" stroke="#739464" stroke-width="10"/><ellipse cx="${100 + i * 120}" cy="215" rx="32" ry="18" fill="#87aa79"/><ellipse cx="${138 + i * 120}" cy="190" rx="29" ry="18" fill="#688e61"/><path d="M${85 + i * 120} 265h70l-12 65h-46Z" fill="#c18d69"/>`,
        )
        .join(""),
    "A gardener is watering a lawn.",
    "The windows are being washed.",
    "Flowers are lying on a road.",
  ],
  [
    "A laptop is open on a desk.",
    "筆電打開放在桌上。",
    '<rect x="35" y="240" width="410" height="35" rx="8" fill="#b48d65"/><path d="M70 275v65m340-65v65" stroke="#82674f" stroke-width="12"/><rect x="160" y="90" width="190" height="135" rx="8" fill="#536d8e"/><rect x="175" y="103" width="160" height="105" fill="#c4dfee"/><path d="M135 242h235l-20-20H155Z" fill="#8194ae"/>',
    "A technician is holding a tablet.",
    "The computer is inside a bag.",
    "A person is moving a chair.",
  ],
  [
    "Several cups are on a tray.",
    "幾個杯子放在托盤上。",
    '<ellipse cx="240" cy="260" rx="195" ry="65" fill="#9db3be"/>' +
      [0, 1, 2]
        .map(
          (i) =>
            `<rect x="${95 + i * 100}" y="155" width="62" height="92" rx="14" fill="#faf8ee"/><ellipse cx="${126 + i * 100}" cy="155" rx="31" ry="10" fill="#b0b7b8"/><path d="M${157 + i * 100} 180q35 0 0 40" fill="none" stroke="#faf8ee" stroke-width="10"/>`,
        )
        .join(""),
    "A waiter is pouring tea.",
    "Dishes are being washed.",
    "The table is covered with papers.",
  ],
  [
    "A bus is parked beside a sign.",
    "公車停在標誌旁。",
    '<rect x="25" y="135" width="310" height="145" rx="18" fill="#709697"/><rect x="45" y="152" width="185" height="62" fill="#d1e7ed"/><path d="M100 152v62m65-62v62" stroke="#709697" stroke-width="9"/><rect x="250" y="153" width="60" height="105" fill="#d1e7ed"/><circle cx="85" cy="282" r="25" fill="#4a5669"/><circle cx="280" cy="282" r="25" fill="#4a5669"/><path d="M400 100v215" stroke="#73849a" stroke-width="8"/><rect x="370" y="60" width="60" height="70" rx="10" fill="#a9bdd6"/>',
    "Passengers are crossing the street.",
    "A driver is changing a tire.",
    "Two trains are passing each other.",
  ],
  [
    "A staircase leads to a closed door.",
    "樓梯通往關閉的門。",
    '<rect x="160" y="30" width="160" height="150" fill="#8bafa6"/><circle cx="295" cy="112" r="6" fill="#f8dc9a"/><path d="M90 325h300v-35H365v-35H340v-35H315v-35H165v35H140v35H115v35H90Z" fill="#c4ccd4" stroke="#8292a5" stroke-width="4"/>',
    "People are waiting in a line.",
    "A worker is opening a gate.",
    "An elevator is full of passengers.",
  ],
];
for (const [i, [correct, translation, svg, ...wrong]] of scenes.entries()) {
  fs.writeFileSync(
    `public/exam-scenes/${i + 1}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#eef2f5"/>${svg}</svg>`,
  );
  for (const pool of ["practice", "mock"]) {
    const scene =
      pool === "mock"
        ? [correct, translation, svg, ...wrong]
        : practiceScenes[i];
    const filename = pool === "mock" ? `${i + 1}` : `practice-${i + 1}`;
    if (pool === "practice")
      fs.writeFileSync(
        `public/exam-scenes/${filename}.svg`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#eef2f5"/>${scene[2]}</svg>`,
      );
    add(
      1,
      pool,
      "圖像中的動作與位置",
      "Choose the statement that best describes the illustration.",
      [scene[0], ...scene.slice(3)],
      scene[1],
      { image: `/exam-scenes/${filename}.svg`, translation: scene[1] },
    );
  }
}
qs.push(...expansion().questions);
const ipa = (s, expanded = false) => {
  const text = s.replaceAll("’", "'");
  return [...text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)]
    .map((match) => {
      const w = match[0],
        before = text.slice(0, match.index),
        after = text.slice(match.index + w.length);
      if (
        expanded &&
        w === "A" &&
        (/\b(?:Workshop|Desk|Route|Gate|Room|Section|Option|Group)\s*$/i.test(
          before,
        ) ||
          /^\s*[:—–-]/.test(after))
      )
        return "eɪ";
      if (
        expanded &&
        w.toLowerCase() === "live" &&
        /^\s+(?:class|session|training|online|rather|instead|video|broadcast|demonstration)\b/i.test(
          after,
        )
      )
        return "laɪv";
      return pronounce(w, s) || `[${w}]`;
    })
    .join(" ");
};
const audio = [];
const seen = new Set();
for (const q of qs) {
  const expanded = q.id.startsWith("v2-");
  q.ipa = ipa(q.prompt, expanded);
  q.optionIpa = q.options.map((s) => ipa(s, expanded));
  if (q.passage || q.transcript)
    q.passageIpa = ipa(q.passage || q.transcript, expanded);
  if (q.graphic) q.graphicIpa = ipa(q.graphic, expanded);
  if (q.part < 5) {
    const id = q.group || q.id;
    q.audio = `/audio/exams/${id}.${id.startsWith("v2-") ? "mp3" : "wav"}`;
    if (!seen.has(id)) {
      seen.add(id);
      const text =
        q.part <= 2
          ? (q.part === 2 ? q.prompt + ". " : "") +
            q.options
              .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
              .join(" ")
          : q.transcript.replace(/\b[A-Z]: /g, "");
      audio.push({ id, text });
    }
  }
}
const output = JSON.stringify(qs);
if (missing.size) throw Error("Missing IPA: " + [...missing].join(", "));
const dest = "lib/exam-bank.json";
if (process.argv.includes("--check")) {
  if (fs.readFileSync(dest, "utf8") !== output)
    throw Error("Exam bank is stale");
} else fs.writeFileSync(dest, output);
fs.writeFileSync("content/exam-audio.json", JSON.stringify(audio, null, 2));
const summary = {
  total: qs.length,
  practice: qs.filter((q) => q.pool === "practice").length,
  mocks: ["01", "02", "03", "04"].map((id) => ({
    id,
    count: qs.filter((q) => q.pool === "mock" && (q.mockSet || "01") === id)
      .length,
  })),
};
const summaryOutput = JSON.stringify(summary, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (fs.readFileSync("lib/exam-summary.json", "utf8") !== summaryOutput)
    throw Error("Exam summary is stale");
} else fs.writeFileSync("lib/exam-summary.json", summaryOutput);
console.log(
  JSON.stringify({
    questions: qs.length,
    practice: qs.filter((q) => q.pool === "practice").length,
    mock: qs.filter((q) => q.pool === "mock").length,
    parts: Object.fromEntries(
      [1, 2, 3, 4, 5, 6, 7].map((p) => [
        p,
        qs.filter((q) => q.part === p).length,
      ]),
    ),
    audio: audio.length,
    missing: [...missing],
  }),
);
