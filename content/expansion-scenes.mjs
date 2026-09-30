// Authored vector illustrations, not photographs. Each scene has its own four statements.
const rect = (x, y, w, h, color = "#819caf") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${color}"/>`;
const line = (d, color = "#53677a", w = 7) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (x, y, r, c = "#668c87") =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const table =
  rect(95, 220, 290, 22, "#b28b68") + line("M120 240v90M360 240v90");
const plant = (x, y) =>
  rect(x - 20, y, 40, 40, "#bb9674") +
  line(`M${x} ${y}v-70`, "#66855e", 5) +
  circle(x - 13, y - 35, 18, "#87ab75") +
  circle(x + 14, y - 55, 18, "#87ab75");
const person = (x, y, arms = "") =>
  circle(x, y, 19, "#ba9478") +
  line(`M${x} ${y + 26}v65m0 0-28 65m28-65 28 65`, "#496f91", 14) +
  line(arms || `M${x} ${y + 35}l-30 35m30-35 30 35`, "#496f91", 10);
const box = (x, y) =>
  rect(x, y, 65, 60, "#c9a575") + line(`M${x + 32} ${y}v60`, "#ead8b8", 6);
const shelf = line("M90 70v240M390 70v240M90 140h300M90 235h300");
const wheel = (x, y) => circle(x, y, 18, "#4b5d6d");
export const expansionScenes = [
  [
    "Two lamps are attached to a wall.",
    "兩盞燈固定在牆上。",
    line("M130 80v100M350 80v100") +
      rect(90, 80, 80, 45, "#dbbd82") +
      rect(310, 80, 80, 45, "#dbbd82"),
    "A worker is changing a light bulb.",
    "Lamps are lying on the floor.",
    "A doorway is being painted.",
  ],
  [
    "Traffic cones are arranged along the road.",
    "交通錐沿路排列。",
    rect(0, 240, 480, 120, "#88919d") +
      [60, 170, 280, 390]
        .map((x) => `<path d="M${x} 265l25-90 25 90Z" fill="#d99962"/>`)
        .join(""),
    "Vehicles are waiting at a crossing.",
    "A driver is holding a traffic sign.",
    "The cones are stacked inside a truck.",
  ],
  [
    "A basket is under a table.",
    "籃子放在桌子下方。",
    table +
      rect(190, 265, 100, 55, "#c5a57e") +
      line("M210 270v-25q30-35 60 0v25", "#9f825e", 5),
    "A basket is resting on a chair.",
    "People are setting a table.",
    "A table is covered with flowers.",
  ],
  [
    "Tools are hanging above a workbench.",
    "工具懸掛在工作檯上方。",
    table +
      line("M110 80h250M150 85v90M220 85v90M300 85v90") +
      rect(130, 105, 40, 15) +
      line("M200 140h40M280 165l40-30"),
    "A worker is holding a hammer.",
    "Tools are packed in a closed case.",
    "A bench is being carried outside.",
  ],
  [
    "A ladder is leaning against a tree.",
    "梯子靠在樹旁。",
    rect(290, 80, 30, 230, "#9d826c") +
      circle(305, 85, 70, "#83a581") +
      line(
        "M160 315l90-225m-40 225 90-225M178 270h48M196 225h48M214 180h48M232 135h48",
      ),
    "A man is cutting down a tree.",
    "A ladder is lying across a path.",
    "Several workers are planting trees.",
  ],
  [
    "Solar panels are installed on a roof.",
    "太陽能板安裝在屋頂上。",
    rect(90, 185, 300, 140, "#c9d1cd") +
      '<path d="M55 190L240 65l185 125Z" fill="#7d8e9b"/>' +
      rect(155, 140, 160, 45, "#4b7696") +
      line("M195 140v45M235 140v45M275 140v45", "#b9dbe1", 3),
    "Workers are replacing roof tiles.",
    "Panels are stacked beside a building.",
    "A roof is covered with snow.",
  ],
  [
    "Books are lying open on a table.",
    "書本攤開放在桌上。",
    table +
      '<path d="M135 150l75 20 75-20v65l-75 15-75-15Z" fill="#faf8ed" stroke="#6d8195" stroke-width="3"/>' +
      line("M210 170v60", "#6d8195", 3),
    "Books are sealed inside boxes.",
    "A reader is turning a page.",
    "A table has been folded against the wall.",
  ],
  [
    "Luggage is on a conveyor belt.",
    "行李放在輸送帶上。",
    rect(30, 235, 420, 55, "#84949f") +
      line("M50 250h380", "#d4dee2", 10) +
      rect(100, 140, 75, 95, "#769d97") +
      rect(295, 160, 95, 75, "#bd937b") +
      line("M125 140v-20h25v20M325 160v-20h30v20"),
    "Passengers are opening their suitcases.",
    "Bags are inside an overhead compartment.",
    "A belt is being repaired.",
  ],
  [
    "Benches face a garden path.",
    "長椅面向花園步道。",
    rect(185, 0, 110, 360, "#d4c7af") +
      rect(35, 100, 110, 35) +
      rect(335, 190, 110, 35) +
      line("M45 135v45M135 135v45M345 225v45M435 225v45") +
      plant(70, 260) +
      plant(400, 70),
    "People are sitting around a table.",
    "A path is blocked by a vehicle.",
    "Workers are digging a hole.",
  ],
  [
    "Coats are hanging on a rack.",
    "外套掛在衣架上。",
    line("M80 315V80h320v235") +
      [130, 240, 350]
        .map(
          (x) =>
            `<path d="M${x} 90l-30 25-20 65 25 10 10-30v110h60V160l10 30 25-10-20-65-30-25Z" fill="#${x === 240 ? "b29580" : "819fa6"}"/>`,
        )
        .join(""),
    "A customer is trying on a jacket.",
    "Clothes are being folded on a counter.",
    "The rack is empty.",
  ],
  [
    "Plates are stacked inside a cabinet.",
    "盤子疊放在櫃子裡。",
    rect(65, 55, 350, 270, "#bdab96") +
      rect(85, 75, 310, 220, "#e5ded0") +
      line("M85 190h310") +
      [0, 1, 2, 3]
        .map(
          (i) =>
            rect(140, 165 - i * 12, 95, 8, "#fafafa") +
            rect(265, 280 - i * 12, 90, 8, "#fafafa"),
        )
        .join(""),
    "A server is washing dishes.",
    "Plates are arranged around a table.",
    "The cabinet is being moved.",
  ],
  [
    "A bridge crosses a narrow pond.",
    "橋橫跨狹長的池塘。",
    rect(160, 0, 150, 360, "#a5cdd6") +
      rect(55, 155, 370, 80, "#b59977") +
      line(
        "M60 155h360M60 235h360M80 140v110M160 140v110M240 140v110M320 140v110M400 140v110",
        "#826d56",
        5,
      ),
    "A boat is passing under a bridge.",
    "A worker is fishing from a dock.",
    "A road is covered with parked cars.",
  ],
  [
    "A person is pushing a cart with boxes.",
    "一個人推著載有箱子的推車。",
    person(90, 100, "M90 140l60 25") +
      line("M150 165h30v110h190") +
      rect(180, 255, 185, 15) +
      box(205, 195) +
      box(280, 195) +
      wheel(205, 295) +
      wheel(345, 295),
    "A worker is lifting a box above the head.",
    "Boxes are being loaded onto an airplane.",
    "A cart is standing empty.",
  ],
  [
    "A person is reading a document at a desk.",
    "一個人在桌前閱讀文件。",
    table +
      person(230, 105, "M230 140l-45 40m45-40 45 40") +
      rect(170, 170, 120, 45, "#faf9ef"),
    "A person is reaching for a ceiling light.",
    "Several people are carrying a desk.",
    "Documents are being thrown away.",
  ],
  [
    "A person is cleaning a window.",
    "一個人正在擦窗戶。",
    rect(225, 35, 185, 220, "#b6dae4") +
      line("M225 140h185M318 35v220", "#879eaa", 5) +
      person(160, 125, "M160 155l85-55m-85 55-30 45") +
      rect(235, 85, 40, 25, "#e5cc8e"),
    "A person is opening a suitcase.",
    "A window is covered by a curtain.",
    "Workers are replacing a door.",
  ],
  [
    "A person is watering a potted plant.",
    "一個人在澆盆栽。",
    person(120, 110, "M120 145l75 20m-75-20-25 35") +
      rect(175, 155, 50, 35, "#7f9fa5") +
      line("M220 160l35 15", "#7f9fa5", 9) +
      line("M253 183l25 18m-15-20 25 15", "#99c5d9", 3) +
      plant(310, 250),
    "A gardener is cutting the grass.",
    "A person is moving a tree.",
    "Water is being poured into a glass.",
  ],
  [
    "A handrail runs beside a staircase.",
    "扶手沿樓梯延伸。",
    '<path d="M80 320h320V100H350v55h-70v55h-70v55h-65v55Z" fill="#bcc8ce"/>' +
      line("M100 230l270-190M140 205v60M220 150v60M300 95v60", "#627f8e", 8),
    "People are climbing a ladder.",
    "A staircase is covered with boxes.",
    "A worker is opening a railing.",
  ],
  [
    "A bicycle is secured to a metal rack.",
    "腳踏車固定在金屬停車架旁。",
    line("M110 305V90h260v215", "#a0acb5", 12) +
      line(
        "M100 260l90-100 75 100H100m90-100 155 100-45-140h35",
        "#527586",
        7,
      ) +
      `<circle cx="100" cy="260" r="50" fill="none" stroke="#4a626f" stroke-width="8"/><circle cx="345" cy="260" r="50" fill="none" stroke="#4a626f" stroke-width="8"/>` +
      line("M190 165q-70-40-80 0", "#c5a25e", 7),
    "A cyclist is riding uphill.",
    "Bicycles are hanging from a ceiling.",
    "A mechanic is changing a wheel.",
  ],
  [
    "A fence surrounds a construction area.",
    "圍籬圍住施工區。",
    rect(45, 170, 390, 120, "#cdb28b") +
      line(
        "M45 170h390M45 280h390M70 165v130M140 165v130M210 165v130M280 165v130M350 165v130M420 165v130",
        "#728799",
        6,
      ) +
      rect(150, 85, 135, 80, "#bbc5cd"),
    "Pedestrians are walking through a gate.",
    "Workers are painting a fence.",
    "A fence has fallen onto a car.",
  ],
  [
    "Plants are arranged on the steps.",
    "盆栽排列在階梯上。",
    '<path d="M30 325h420V140H320v60H220v60H120v65Z" fill="#c7cfd1"/>' +
      plant(170, 220) +
      plant(270, 160) +
      plant(370, 100),
    "A person is carrying flowers upstairs.",
    "Plants are suspended from the ceiling.",
    "Steps are being swept.",
  ],
  [
    "Two people are standing at a counter.",
    "兩個人站在櫃檯前。",
    person(140, 90) + person(310, 90) + rect(60, 230, 370, 105, "#a2b5b9"),
    "People are seated around a desk.",
    "A counter is being installed.",
    "Customers are lying on benches.",
  ],
  [
    "The doors of an empty cabinet are open.",
    "空櫃子的門打開著。",
    rect(140, 60, 200, 255, "#bca58b") +
      rect(155, 75, 170, 220, "#e9dfcd") +
      line("M155 175h170") +
      '<path d="M140 60L60 85v220l80 10M340 60l80 25v220l-80 10" fill="#c7b298" stroke="#8c7964" stroke-width="4"/>',
    "A cabinet is filled with plates.",
    "A person is closing a drawer.",
    "The cabinet doors are locked.",
  ],
  [
    "Crates are stacked on the back of a truck.",
    "箱子堆在貨車後方的平台上。",
    rect(55, 125, 120, 130, "#7ea0a1") +
      rect(70, 140, 90, 50, "#c2dde2") +
      rect(175, 240, 235, 20, "#677f90") +
      box(200, 180) +
      box(280, 180) +
      box(240, 120) +
      wheel(115, 275) +
      wheel(360, 275),
    "Workers are unloading a ship.",
    "A truck is carrying passengers.",
    "The truck bed is empty.",
  ],
  [
    "Cables run from a computer across the desk.",
    "電腦的線材延伸至桌面。",
    table +
      rect(180, 90, 160, 110, "#58798e") +
      rect(193, 103, 134, 84, "#c3dce5") +
      line(
        "M260 200v20M340 190q80 10 60 45M185 190q-70 20-90 40",
        "#5b6578",
        4,
      ),
    "A computer is inside a suitcase.",
    "A person is typing on a keyboard.",
    "A desk is covered with plates.",
  ],
  [
    "Paddles are hanging vertically on a wall.",
    "船槳垂直掛在牆上。",
    [120, 240, 360]
      .map(
        (x) =>
          line(`M${x} 60v175`, "#a28c72", 12) +
          rect(x - 25, 220, 50, 90, "#b49b77"),
      )
      .join(""),
    "People are rowing a boat.",
    "Paddles are floating in a pool.",
    "A worker is building a shelf.",
  ],
  [
    "Glasses are lined up on a counter.",
    "玻璃杯在櫃檯上排成一列。",
    rect(30, 250, 420, 70, "#a58f76") +
      [90, 190, 290, 390]
        .map(
          (x) =>
            `<path d="M${x - 25} 120h50l-8 110h-34Z" fill="#d6e8eb" stroke="#819ea8" stroke-width="3"/>`,
        )
        .join(""),
    "A server is filling a cup.",
    "Glasses are hanging under a shelf.",
    "Bottles are scattered on the floor.",
  ],
  [
    "A person is placing a parcel on a scale.",
    "一個人將包裹放在秤上。",
    person(135, 90, "M135 130l100 20") +
      table +
      rect(260, 185, 95, 35) +
      box(270, 125),
    "A person is sweeping a floor.",
    "A scale is inside a closed box.",
    "Parcels are being delivered by bicycle.",
  ],
  [
    "A sign hangs above a doorway.",
    "標誌懸掛在門口上方。",
    rect(160, 100, 160, 235, "#9db6ac") +
      line("M180 20v45M300 20v45") +
      rect(140, 45, 200, 40, "#7b95ab") +
      circle(300, 225, 6, "#ebd29e"),
    "A man is painting a sign.",
    "A doorway is blocked by furniture.",
    "A sign is lying on the steps.",
  ],
  [
    "A screen is lowered in front of chairs.",
    "投影幕放下在椅子前方。",
    rect(90, 25, 300, 160, "#faf9ed") +
      line("M80 25h320") +
      [100, 210, 320]
        .map(
          (x) =>
            rect(x, 235, 60, 55) +
            line(`M${x} 300h60M${x + 5} 300v30M${x + 55} 300v30`),
        )
        .join(""),
    "An audience is leaving a room.",
    "Chairs are stacked behind a curtain.",
    "A screen is rolled up completely.",
  ],
  [
    "A folded umbrella stands in a container.",
    "收起的雨傘直立放在容器中。",
    rect(170, 230, 140, 100, "#91aaa7") +
      line("M230 70q30-30 30 10v160", "#5b7389", 8) +
      '<path d="M220 105l-10 135h65l-10-135Z" fill="#b98f7d"/>',
    "An umbrella is open over a table.",
    "A person is walking in the rain.",
    "A container is lying on its side.",
  ],
];
