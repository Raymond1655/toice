import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dictionaryText = fs.readFileSync(
  path.join(root, "content/pronunciation/cmudict.dict"),
  "utf8",
);
const dictionary = new Map(
  dictionaryText
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [word, ...phones] = line.split(" ");
      return [word, phones.filter((phone) => /^[A-Z]+[012]?$/.test(phone))];
    }),
);
const phones = {
  AA: "ɑ",
  AE: "æ",
  AH: "ʌ",
  AO: "ɔ",
  AW: "aʊ",
  AY: "aɪ",
  B: "b",
  CH: "tʃ",
  D: "d",
  DH: "ð",
  EH: "ɛ",
  ER: "ɜr",
  EY: "eɪ",
  F: "f",
  G: "ɡ",
  HH: "h",
  IH: "ɪ",
  IY: "i",
  JH: "dʒ",
  K: "k",
  L: "l",
  M: "m",
  N: "n",
  NG: "ŋ",
  OW: "oʊ",
  OY: "ɔɪ",
  P: "p",
  R: "r",
  S: "s",
  SH: "ʃ",
  T: "t",
  TH: "θ",
  UH: "ʊ",
  UW: "u",
  V: "v",
  W: "w",
  Y: "j",
  Z: "z",
  ZH: "ʒ",
};
// Legal English onsets place stress before the syllable, rather than its vowel.
const onsets = new Set([
  "P R",
  "B R",
  "T R",
  "D R",
  "K R",
  "G R",
  "F R",
  "TH R",
  "SH R",
  "P L",
  "B L",
  "K L",
  "G L",
  "F L",
  "S L",
  "S M",
  "S N",
  "S P",
  "S T",
  "S K",
  "T W",
  "D W",
  "K W",
  "G W",
  "S W",
  "TH W",
  "P Y",
  "B Y",
  "F Y",
  "V Y",
  "K Y",
  "G Y",
  "M Y",
  "HH Y",
  "S P R",
  "S T R",
  "S K R",
  "S P L",
  "S K W",
]);
function convert(sequence) {
  const vowelPositions = sequence.flatMap((phone, i) =>
    /[012]$/.test(phone) ? [i] : [],
  );
  const stresses = new Map();
  if (vowelPositions.length > 1) {
    for (let i = 0; i < vowelPositions.length; i++) {
      const position = vowelPositions[i];
      const stress = sequence[position].slice(-1);
      if (stress === "0") continue;
      let start = i === 0 ? 0 : position;
      if (i > 0) {
        const previous = vowelPositions[i - 1];
        for (let candidate = previous + 1; candidate < position; candidate++) {
          const cluster = sequence.slice(candidate, position);
          if (
            (cluster.length === 1 && cluster[0] !== "NG") ||
            onsets.has(cluster.join(" "))
          ) {
            start = candidate;
            break;
          }
        }
      }
      stresses.set(start, stress === "1" ? "ˈ" : "ˌ");
    }
  }
  return sequence
    .map((phone, i) => {
      const base = phone.replace(/[012]$/, "");
      const value =
        phone === "AH0" ? "ə" : phone === "ER0" ? "ər" : phones[base];
      if (!value) throw new Error(`Unknown CMU phone: ${phone}`);
      return (stresses.get(i) ?? "") + value;
    })
    .join("");
}
// Meaning/part-of-speech overrides and common reduced function words.
const overrides = {
  resume: "ˈrɛzəmeɪ",
  minutes: "ˈmɪnɪts",
  coordinate: "koʊˈɔrdəneɪt",
  transfer: "trænsˈfɜr",
  upgrade: "ʌpˈɡreɪd",
  permit: "ˈpɜrmɪt",
  graduate: "ˈɡrædʒueɪt",
  appropriate: "əˈproʊpriət",
  survey: "ˈsɜrveɪ",
  defect: "ˈdifɛkt",
  increase: "ɪnˈkris",
  decrease: "dɪˈkris",
  update: "ˈʌpdeɪt",
  document: "ˈdɑkjəmənt",
  concert: "ˈkɑnsərt",
  concrete: "ˈkɑŋkrit",
  segment: "ˈsɛɡmənt",
  record: "ˈrɛkərd",
  wind: "wɪnd",
  reuse: "ˌriˈjuz",
  close: "kloʊz",
  read: "rid",
  use: "juz",
  buffet: "bəˈfeɪ",
  entree: "ˈɑntreɪ",
  cafe: "kæˈfeɪ",
  router: "ˈraʊtər",
  route: "rut",
  research: "ˈrisɜrtʃ",
  intern: "ˈɪntɜrn",
  produce: "prəˈdus",
  export: "ɪkˈspɔrt",
  present: "prɪˈzɛnt",
  live: "lɪv",
  lead: "lid",
  the: "ðə",
  a: "ə",
  an: "ən",
  to: "tə",
  for: "fər",
  and: "ənd",
  of: "əv",
  your: "jər",
  can: "kən",
  must: "məst",
  our: "aʊr",
  webinar: "ˈwɛbəˌnɑr",
  reservationist: "ˌrɛzərˈveɪʃənɪst",
  barcode: "ˈbɑrkoʊd",
  preheat: "ˌpriˈhit",
  whiteboard: "ˈwaɪtbɔrd",
  conduct: "kənˈdʌkt",
};
const missing = new Set();
function pronounce(word, sentence = "") {
  const lower = word.toLowerCase();
  if (lower === "live" && /live entertainment/i.test(sentence)) return "laɪv";
  if (lower === "record" && /^Record /i.test(sentence)) return "rɪˈkɔrd";
  if (lower === "use" && /before use/i.test(sentence)) return "jus";
  if (lower === "permit" && /driving permit/i.test(sentence)) return "ˈpɜrmɪt";
  if (overrides[lower]) return overrides[lower];
  const sequence = dictionary.get(lower);
  if (sequence?.length) return convert(sequence);
  missing.add(lower);
  return "";
}

Object.assign(overrides, {promptness:'ˈprɑmptnəs',departmentally:'dɪˌpɑrtˈmɛntəli',informatively:'ɪnˈfɔrmətɪvli',noticeboard:'ˈnoʊtɪsˌbɔrd',mandatorily:'ˈmændəˌtɔrəli',quotable:'ˈkwoʊtəbəl',"participant's":'pɑrˈtɪsəpənts',"instructor's":'ɪnˈstrʌktərz',"nina's":'ˈninəz'});
export { pronounce, missing };
