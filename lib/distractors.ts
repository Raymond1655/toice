import { words } from "./vocabulary.ts";

const starterDistractors: Record<string, string[]> = Object.fromEntries(
  `
applicant|shipment|invoice|warehouse
recruit|postpone|attach|resign
qualification|luggage|shipment|departure
candidate|budget|equipment|receipt
supervisor|warranty|invoice|destination
promotion|luggage|warehouse|itinerary
resign|deliver|reimburse|attach
salary|itinerary|luggage|orientation
orientation|equipment|salary|luggage
colleague|inventory|warranty|revenue
evaluate|board|resign|apologize
attend|reimburse|notify|resign
agenda|salary|luggage|warehouse
postpone|reimburse|board|resign
deadline|supplier|luggage|profit
confirm|board|resign|apologize
annual|defective|complimentary|valid
notify|board|resign|purchase
submit|apologize|resign|reimburse
attach|resign|board|apologize
available|annual|defective|complimentary
arrange|apologize|resign|reimburse
equipment|departure|candidate|vacancy
procedure|salary|revenue|luggage
reservation|equipment|luggage|maintenance
itinerary|supervisor|salary|warehouse
departure|salary|equipment|invoice
destination|salary|luggage|policy
accommodation|revenue|profit|candidate
complimentary|defective|annual|accessible
luggage|revenue|policy|vacancy
delay|supplier|salary|qualification
board|reimburse|resign|apologize
shuttle|warranty|salary|invoice
vacancy|applicant|revenue|itinerary
valid|annual|defective|accessible
supplier|luggage|salary|maintenance
shipment|revenue|salary|qualification
inventory|departure|colleague|candidate
purchase|resign|reimburse|apologize
warehouse|salary|policy|receipt
quantity|supervisor|colleague|applicant
deliver|resign|apologize|recruit
receipt|salary|destination|procedure
defective|annual|accessible|convenient
warranty|applicant|luggage|departure
refund|colleague|itinerary|warehouse
distribute|resign|reimburse|apologize
reimburse|postpone|board|resign
invoice|warehouse|colleague|destination
budget|colleague|itinerary|supervisor
revenue|luggage|colleague|applicant
expense|supervisor|applicant|warehouse
estimate|colleague|luggage|departure
contract|luggage|warehouse|supervisor
negotiate|board|resign|apologize
discount|warehouse|colleague|equipment
deposit|supervisor|luggage|warehouse
profit|supervisor|luggage|applicant
approve|board|resign|reimburse
maintenance|salary|colleague|invoice
renovation|salary|colleague|invoice
inquiry|luggage|warehouse|departure
resolve|recruit|board|resign
convenient|annual|defective|valid
facility|salary|colleague|invoice
inspect|resign|apologize|reimburse
replace|recruit|resign|reimburse
accessible|annual|complimentary|valid
apologize|board|attach|resign
assistance|departure|revenue|inventory
policy|colleague|applicant|warehouse
`
    .trim()
    .split("\n")
    .map((row) => {
      const [id, ...options] = row.split("|");
      return [id, options];
    }),
);

// Meaning questions use unrelated topics, avoiding ambiguous cloze synonyms.
const contrastGroups = [
  ["passport", "luggage", "departure", "itinerary"],
  ["salary", "invoice", "budget", "revenue"],
  ["helmet", "clinic", "nurse", "injury"],
  ["dessert", "beverage", "napkin", "recipe"],
  ["keyboard", "battery", "password", "database"],
];
const verbChoices = [
  "resign",
  "reimburse",
  "board",
  "attach",
  "disinfect",
  "demolish",
  "memorize",
  "negotiate",
];
const adjectiveChoices = [
  "defective",
  "annual",
  "complimentary",
  "vacant",
  "spicy",
  "wireless",
  "organic",
  "confidential",
];
const adverbChoices = [
  "overseas",
  "frequently",
  "immediately",
  "approximately",
  "respectively",
  "occasionally",
];
const lookup = new Map(words.map((word) => [word.id, word]));
const relatedTopics = [
  ["財務與商務", "合約與企業管理", "行銷與銷售"],
  ["差旅與住宿", "交通與運輸", "活動與休閒"],
  ["職場與人事", "會議與辦公", "教育與學習"],
  ["服務與設施", "房地產與建築", "製造與品質", "採購與物流"],
];
function topicsOverlap(a: string, b: string) {
  return (
    a === b ||
    relatedTopics.some((group) => group.includes(a) && group.includes(b))
  );
}
function meaningOptions(
  word: (typeof words)[number],
  index: number,
): [string, string[]] {
  const ids =
    word.pos === "v."
      ? verbChoices
      : word.pos === "adj."
        ? adjectiveChoices
        : word.pos === "adv."
          ? adverbChoices
          : contrastGroups.map((group) => group[index % group.length]);
  const candidates = [
    ...ids.slice(index % ids.length),
    ...ids.slice(0, index % ids.length),
  ];
  const selected: string[] = [];
  const meanings = new Set([word.meaning]);
  for (const id of candidates) {
    const option = lookup.get(id)!;
    if (id === word.id || meanings.has(option.meaning)) continue;
    if (word.id === "abroad" && id === "overseas") continue;
    if (word.pos !== "adv." && topicsOverlap(option.category, word.category))
      continue;
    const own = word.meaning.split("；");
    const other = option.meaning.split("；");
    if (own.some((a) => other.some((b) => a.includes(b) || b.includes(a))))
      continue;
    selected.push(id);
    meanings.add(option.meaning);
    if (selected.length === 3) break;
  }
  if (selected.length !== 3)
    throw new Error(`Insufficient meaning choices: ${word.id}`);
  return [word.id, selected];
}
export const distractors: Record<string, string[]> = {
  ...starterDistractors,
  ...Object.fromEntries(
    words.filter((word) => word.quizType === "meaning").map(meaningOptions),
  ),
};
