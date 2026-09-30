// Hand-authored exercises for skills that cannot be created by extracting a single fact.
// Each question row: skill, prompt, correct answer, three distractors, explanation.
export const advanced = [
  {
    part: 3,
    mockSet: "02",
    topic: "活動與餐飲",
    transcript: `A: The caterer needs our final guest count today. We have eighty registrations, but the hall only has seventy chairs.
B: The neighboring office offered to lend us some. They said we could collect them after four.
A: That solves the seating problem, but our van is being serviced.
B: My car can carry four at a time. If you come with me, we can make several trips.
A: Thanks. I'll ask the caterer for eighty meals and remind the office that we need ten chairs.`,
    rows: [
      [
        "主旨與目的",
        "What are the speakers preparing for?",
        "An event with a catered meal",
        "A vehicle maintenance course",
        "An office relocation",
        "A furniture sale",
        "餐點人數與座位安排共同指向供餐活動。",
      ],
      [
        "說話者意圖",
        'Why does the first speaker say, "Our van is being serviced"?',
        "To point out a transportation problem",
        "To request a repair estimate",
        "To recommend a nearby mechanic",
        "To explain why guests are late",
        "借椅子後提到貨車維修，是指出搬運工具不足。",
      ],
      [
        "數量推論",
        "What will the speakers most likely do after four?",
        "Make several trips to collect ten chairs",
        "Cancel ten meal orders",
        "Pick up eighty new chairs",
        "Drive the repaired van to the caterer",
        "需要八十減七十共十張椅子，而汽車一次載四張，因此需多趟搬運。",
      ],
    ],
  },
  {
    part: 3,
    mockSet: "03",
    topic: "採購與生產",
    transcript: `A: The customer approved the blue fabric sample, so I was about to release the order.
B: Wait. Did they sign the approval form?
A: They told me on the phone that the color was perfect.
B: We learned our lesson with the restaurant order last month. A verbal agreement isn't enough when we cut custom fabric.
A: I understand. I'll email the form and keep the order on hold.
B: Please do. Once it comes back signed, we can confirm the production date.`,
    rows: [
      [
        "細節辨識",
        "How did the customer communicate a color preference?",
        "By telephone",
        "By returning a signed form",
        "By visiting the factory",
        "By mailing a fabric roll",
        "第一位說話者明確提到電話上的確認。",
      ],
      [
        "說話者意圖",
        'What does the second speaker imply by saying, "We learned our lesson"?',
        "A previous order caused a problem",
        "A training course has ended",
        "The customer has changed industries",
        "The restaurant has closed",
        "接著強調口頭同意不夠，暗示上次訂單曾因類似狀況出問題。",
      ],
      [
        "流程順序",
        "What must happen before a production date is confirmed?",
        "A signed form must be returned",
        "The customer must collect the fabric",
        "The restaurant must place another order",
        "A different color must be selected",
        "結尾說明收到已簽表單後，才確認生產日期。",
      ],
    ],
  },
  {
    part: 3,
    mockSet: "04",
    topic: "科技與設備",
    transcript: `A: The demonstration tablet keeps losing its connection. Can we borrow the tablet from reception?
B: Reception needs it for guest check-in until noon. But I have a recording of the demonstration on my laptop.
A: The clients arrive at eleven, and the demonstration room has a screen.
B: Then we could show the recording first and answer questions afterward.
A: That's a relief. I'll bring the cable. We should still report the connection problem to technical support.`,
    rows: [
      [
        "問題辨識",
        "What problem are the speakers discussing?",
        "An unreliable connection on a tablet",
        "A missing guest registration",
        "A broken projection screen",
        "An incorrect client arrival time",
        "開頭指出展示用平板連線不穩。",
      ],
      [
        "時間推論",
        "Why is borrowing the reception tablet unsuitable?",
        "It is needed there when the clients arrive",
        "It has already been sent for repair",
        "It does not support video playback",
        "It must be returned before eleven",
        "櫃檯平板用到十二點，客戶十一點抵達，時間不合。",
      ],
      [
        "說話者意圖",
        'What does the first speaker mean by "That’s a relief"?',
        "An alternative presentation method is available",
        "The technical problem has been repaired",
        "The client visit has been canceled",
        "The reception tablet is now free",
        "鬆一口氣是因為能改播放影片，並不表示設備已修好。",
      ],
    ],
  },
  {
    part: 4,
    mockSet: "02",
    topic: "交通與服務",
    transcript: `Attention, passengers. The lift between the ticket hall and platform two is temporarily out of service. If you require a route without stairs, use the passage beside the ticket office. It leads to the lift serving platform three. A level bridge then connects platforms three and two. Please allow an additional five minutes for this route. A staff member in a green jacket will remain near the ticket office to assist you. Repairs are expected to finish this afternoon, but we will announce when the lift is safe to use.`,
    rows: [
      [
        "問題辨識",
        "Why is this announcement being made?",
        "To explain an alternative accessible route",
        "To announce that all trains are canceled",
        "To advertise a new ticket office",
        "To direct passengers to replacement buses",
        "二號月台電梯故障，公告替代的無階梯路線。",
      ],
      [
        "流程順序",
        "What should passengers using the alternative route do after reaching platform three?",
        "Cross a level bridge",
        "Return to the ticket hall",
        "Wait for a replacement bus",
        "Use the stairs to platform two",
        "三號月台與二號月台間以平坦的橋連接。",
      ],
      [
        "條件與限制",
        "What should passengers wait for before using the repaired lift?",
        "An announcement that it is safe",
        "The arrival of the next train",
        "A new ticket from the office",
        "The departure of all staff members",
        "預計下午修好不等於已開放，需等安全使用公告。",
      ],
    ],
  },
  {
    part: 4,
    mockSet: "03",
    topic: "圖書與教育",
    transcript: `Thank you for volunteering at our book donation day. Please do not place every donated book directly on the display tables. Books with missing pages should go in the red box for recycling. Books in good condition that are suitable for children belong on the low shelves. Other usable books go on the long tables. We want visitors to find appropriate books without sorting through damaged copies. If you are unsure about an item's condition, leave it on the desk beside me. I will check those items during the break.`,
    rows: [
      [
        "對象判斷",
        "Who is the speaker addressing?",
        "Volunteers sorting donated books",
        "Authors attending a book launch",
        "Customers buying new textbooks",
        "Staff installing library shelves",
        "開頭感謝志工參與捐書活動，後續為分類工作指示。",
      ],
      [
        "流程與分類",
        "Where should a usable children’s book be placed?",
        "On the low shelves",
        "In the red recycling box",
        "On the long tables",
        "In a storage room",
        "狀況良好的兒童書放在低矮書架上。",
      ],
      [
        "說話者意圖",
        "Why does the speaker mention the desk nearby?",
        "To identify a place for items needing inspection",
        "To ask someone to move the furniture",
        "To display books by a visiting author",
        "To offer a place for visitors to eat",
        "不確定書況時放在該桌，供講者休息時檢查。",
      ],
    ],
  },
  {
    part: 4,
    mockSet: "04",
    topic: "工作與培訓",
    transcript: `Before today's equipment training begins, please look at the symbols on your name badges. Participants with a circle will start with the safety demonstration in the workshop. Those with a square will begin with the maintenance discussion in the classroom. After forty minutes, the groups will switch rooms, so everyone will attend both sessions. There is no need to change groups just because you prefer one topic. Keep your badge visible because instructors will record attendance at each session. Certificates will be issued only after attendance at both sessions is confirmed.`,
    graphic:
      "BADGE ASSIGNMENTS\nCircle — New operators\nSquare — Team supervisors",
    rows: [
      [
        "圖表整合",
        "Look at the graphic. Where should team supervisors go first?",
        "To the classroom",
        "To the workshop",
        "To the certificate desk",
        "To the reception area",
        "圖表中主管是方形標誌；獨白說方形組先去教室。",
      ],
      [
        "說話者意圖",
        "Why does the speaker say there is no need to change groups?",
        "Both groups will study both topics",
        "All participants have identical jobs",
        "The classroom is already full",
        "Badges cannot be replaced",
        "四十分鐘後交換教室，每組都會上兩個主題。",
      ],
      [
        "條件與限制",
        "What is required to receive a certificate?",
        "Confirmed attendance at both sessions",
        "A separate application fee",
        "Previous operating experience",
        "A recommendation from a supervisor",
        "需確認兩堂皆出席才發證書。",
      ],
    ],
  },
  {
    part: 3,
    topic: "飯店服務",
    transcript: `A: I booked a room with a desk, but the room I received only has a small bedside table. I need to work this evening.
B: I'm sorry. We have a suitable room on the sixth floor, but it won't be ready until three.
A: My online meeting starts at two.
B: You can use our quiet meeting room until the new room is ready. There's no charge, and I'll bring the access card.
A: That would work. I'll leave my suitcase here for now.`,
    rows: [
      [
        "問題辨識",
        "What is missing from the guest’s room?",
        "A work desk",
        "A bedside table",
        "An access card",
        "A suitcase",
        "旅客表示房間只有床邊小桌，缺少工作桌。",
      ],
      [
        "時間推論",
        "Why does the employee offer a meeting room?",
        "The guest needs a workspace before the replacement room is ready",
        "The hotel cannot provide any overnight rooms",
        "The guest requested space for a large party",
        "The guest’s reservation starts tomorrow",
        "會議兩點開始，新房三點才好，需臨時工作空間。",
      ],
      [
        "說話者意圖",
        'What does the guest mean by "That would work"?',
        "The proposed solution is acceptable",
        "The bedside table has been repaired",
        "The online meeting has ended",
        "The guest works for the hotel",
        "接受免費會議室作為等待期間的替代方案。",
      ],
    ],
  },
  {
    part: 3,
    topic: "行銷與設計",
    transcript: `A: The brochure looks good on screen, but the address is very hard to read on this printed copy.
B: We used the smallest font allowed by the template. I could remove the decorative border to make more room.
A: Please do. Customers need to find us, not admire the border.
B: I'll enlarge the address and print another sample before sending the file to the printer.
A: Thanks. The order hasn't been released yet, so we still have time.`,
    rows: [
      [
        "問題辨識",
        "What concerns the first speaker?",
        "The address is difficult to read in print",
        "The office address is incorrect",
        "The brochure uses the wrong language",
        "The printer has missed the deadline",
        "問題在印刷版地址字體太小，不是地址內容錯誤。",
      ],
      [
        "說話者意圖",
        "What does the first speaker imply about the border?",
        "Readability is more important than decoration",
        "It should be printed in a brighter color",
        "Customers specifically requested it",
        "It contains essential contact details",
        "找得到地址比欣賞邊框重要，強調實用性優先。",
      ],
      [
        "下一步行動",
        "What will the second speaker do next?",
        "Revise the layout and print another sample",
        "Release the current order immediately",
        "Change the company’s office location",
        "Ask customers to read the digital version",
        "將移除裝飾、放大地址並再次印樣。",
      ],
    ],
  },
  {
    part: 4,
    topic: "零售與退貨",
    transcript: `This message is for customers returning rented cameras. Please leave the memory card in the camera until our staff have checked that your images were transferred successfully. After that check, you may remove the card and take it with you. The camera battery and charging cable must be returned with the equipment. If the shop is closed, do not use the ordinary parcel drop box. Instead, call the number on the entrance door to arrange a secure return. Rental charges stop at the agreed return appointment, even if a staff member arrives a few minutes late.`,
    rows: [
      [
        "流程順序",
        "When may a customer remove the memory card?",
        "After staff confirm that the images were transferred",
        "Before entering the shop",
        "Only after the card is erased",
        "When a new rental begins",
        "需等店員确认照片已成功移轉後才可取出記憶卡。",
      ],
      [
        "條件與限制",
        "What should a customer do when the shop is closed?",
        "Call the number on the door",
        "Leave the camera in the parcel box",
        "Keep the camera until the next rental period",
        "Mail the memory card separately",
        "關店時須打門口電話安排安全歸還，不能投一般包裹箱。",
      ],
      [
        "說話者意圖",
        "Why does the speaker mention staff arriving late?",
        "To reassure customers about rental charges",
        "To discourage customers from making appointments",
        "To explain why the shop is closing permanently",
        "To request that customers return damaged items",
        "強調費用依約定時間停止計算，讓顧客不必擔心店員遲到多收費。",
      ],
    ],
  },
  {
    part: 7,
    topic: "辦公室與協作",
    format: "句子插入",
    passage: `Staff notice — Quiet rooms
[1] The two small rooms beside reception are now available for calls requiring privacy. Each booking may last up to thirty minutes.
[2] Both rooms contain a desk and a power outlet. This makes them suitable for video interviews as well as telephone calls.
[3] Reservations must be entered in the shared calendar. A booking without the employee's name will be removed.
[4] At the end of each call, please take your belongings and close the door quietly.`,
    rows: [
      [
        "主旨與目的",
        "What is the purpose of the notice?",
        "To explain how to use private call rooms",
        "To advertise vacant office space",
        "To announce a change in reception hours",
        "To invite staff to a telephone sales course",
        "全文介紹可預約通話空間及使用規則。",
      ],
      [
        "條件與限制",
        "What is the maximum length of a booking?",
        "Thirty minutes",
        "One hour",
        "Two hours",
        "A full afternoon",
        "Each booking may last up to thirty minutes 指每次上限三十分鐘。",
      ],
      [
        "句子插入",
        'Where does this sentence best belong? "Each one also has a reliable wireless connection."',
        "Immediately before [3]",
        "Immediately before [1]",
        "Immediately before [2]",
        "Immediately before [4]",
        "each one 指兩間房間，also 增補第二段設備資訊；放在設備段末、第三段預約規則之前最連貫。",
      ],
      [
        "字義辨識",
        'In the notice, "removed" is closest in meaning to:',
        "Deleted",
        "Transported",
        "Repaired",
        "Expanded",
        "沒有姓名的預約會從行事曆刪除，不是搬動實體物品。",
      ],
      [
        "情境推論",
        "What should an employee check after making a reservation?",
        "That their name appears in the calendar entry",
        "That reception has collected a payment",
        "That the room contains a printer",
        "That another employee will attend the call",
        "無姓名的預約會被刪除，所以要確認有登記姓名。",
      ],
    ],
  },
  {
    part: 7,
    topic: "採購物流",
    format: "三篇閱讀",
    passage: `DOCUMENT 1 — Supplier email
We can deliver the replacement shelves on Thursday or Friday. Installation takes one full day. The storage room must be empty before our team arrives. Please confirm your preferred day by Tuesday.

DOCUMENT 2 — Internal message
We have hired temporary storage space, but the key will not be available until Wednesday afternoon. Moving the stock will take most of Thursday. The shop can continue operating while the work is done.

DOCUMENT 3 — Reply to the supplier
Please use the later of the two dates you offered. Our stock will be moved out the day before. Enter through the rear service door; the front entrance will remain open to customers.`,
    rows: [
      [
        "跨文件推論",
        "On which day will the shelves be installed?",
        "Friday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "供應商提供週四或週五，店方選較晚的一天，即週五。",
      ],
      [
        "原因與細節",
        "Why is the earlier installation date unsuitable?",
        "Stock will still be moved out that day",
        "The supplier is closed that day",
        "The shop must close for a staff event",
        "The new shelves cannot fit through the door",
        "內部訊息指出週四大部分時間在搬貨，房間尚未清空。",
      ],
      [
        "流程順序",
        "What must happen before the installers arrive?",
        "The storage room must be emptied",
        "All customers must leave the shop",
        "The old stock must be sold",
        "The front entrance must be removed",
        "供應商要求施工前清空儲藏室。",
      ],
      [
        "字義辨識",
        'In the reply, "offered" is closest in meaning to:',
        "Proposed",
        "Purchased",
        "Donated",
        "Prevented",
        "此處 offered dates 表示提出可選日期。",
      ],
      [
        "跨文件細節",
        "Which statement is supported by the messages?",
        "Customers may use the shop during the work",
        "The shop will close until Saturday",
        "Installers should enter through the front door",
        "The temporary storage key is available on Tuesday",
        "內部訊息說仍可營業，回覆亦說前門持續對客人開放。",
      ],
    ],
  },
  {
    part: 7,
    topic: "課程與培訓",
    format: "圖表與郵件",
    graphic:
      "WORKSHOP OPTIONS\nA — Tuesday morning — In person — Beginner\nB — Tuesday evening — Online — Beginner\nC — Thursday evening — In person — Advanced\nD — Saturday morning — Online — Advanced",
    passage: `Email from a participant
I would like to attend a beginner photography workshop. I work during the day and cannot travel to the studio on weekdays. I have my own camera, but I have never used its manual settings. Please recommend a suitable session.

Reply from the coordinator
There is still space in the session that meets both your schedule and travel requirements. For this session, please test your camera and internet connection in advance. A recording will be available for seven days afterward. The recording does not include the individual feedback at the end of the live class.`,
    rows: [
      [
        "圖表整合",
        "Which workshop best meets the participant’s needs?",
        "Workshop B",
        "Workshop A",
        "Workshop C",
        "Workshop D",
        "需初學、晚上、線上；圖表只有 B 同時符合。",
      ],
      [
        "原因與細節",
        "Why does the participant need an evening session?",
        "They work during the day",
        "Their camera is being repaired",
        "Morning classes are all full",
        "They teach at the studio in the afternoon",
        "信件明說白天工作。",
      ],
      [
        "下一步行動",
        "What should the participant do before the session?",
        "Test equipment and the internet connection",
        "Buy an advanced camera",
        "Visit the studio for an interview",
        "Watch all previous recordings",
        "回覆要求預先測試相機與網路。",
      ],
      [
        "條件與限制",
        "What is unavailable in the recording?",
        "Individual feedback",
        "Basic camera instructions",
        "The session introduction",
        "Examples shown during the lesson",
        "錄影不包含直播課末的個別回饋。",
      ],
      [
        "情境推論",
        "Why might the participant prefer to attend live rather than only watch later?",
        "To receive feedback on their own work",
        "To avoid using an internet connection",
        "To attend without a camera",
        "To receive permanent access to the recording",
        "需綜合錄影限制，直播才有個別回饋機會。",
      ],
    ],
  },
  {
    part: 7,
    topic: "社區與環境",
    format: "句子插入",
    passage: `Community update — Tool library
[1] The community center will begin lending gardening tools next month. Members may borrow up to three items at a time.
[2] Every returned tool will be checked by a trained volunteer. Any item needing repair will be removed from circulation until it is safe to use.
[3] The system is designed to reduce the number of rarely used tools stored in individual homes. Shared equipment also makes gardening more affordable for new members.
[4] Borrowers must complete a short safety introduction before making their first reservation. Sessions are offered every Saturday morning.`,
    rows: [
      [
        "主旨與目的",
        "What service is being introduced?",
        "A lending service for gardening tools",
        "A garden waste collection service",
        "A course for professional mechanics",
        "A shop selling repaired furniture",
        "中心將推出園藝工具借用服務。",
      ],
      [
        "句子插入",
        'Where does this sentence best belong? "These checks help prevent damaged equipment from reaching the next borrower."',
        "Immediately before [3]",
        "Immediately before [1]",
        "Immediately before [2]",
        "Immediately before [4]",
        "These checks 指前段志工檢查，接於檢查與維修段落後、第三段效益前最連貫。",
      ],
      [
        "字義辨識",
        'In this article, "circulation" refers to:',
        "Availability for people to borrow",
        "Movement of blood",
        "Distribution of a newspaper",
        "Travel around the neighborhood",
        "從借用服務的上下文判斷，是將工具暫停外借。",
      ],
      [
        "條件與限制",
        "What must a new borrower do first?",
        "Attend a safety introduction",
        "Donate three tools",
        "Pay for a repair course",
        "Purchase a storage cabinet",
        "首次預約前必須完成安全簡介課程。",
      ],
      [
        "情境推論",
        "Which person would especially benefit from the service?",
        "Someone who needs a tool only occasionally",
        "Someone who wants to keep rented tools permanently",
        "Someone who cannot attend any safety session",
        "Someone who wants to borrow unlimited items",
        "共享能减少家中閒置工具，適合偶爾才需使用的人。",
      ],
    ],
  },
  {
    part: 7,
    topic: "餐旅與活動",
    format: "雙篇閱讀",
    passage: `Hotel policy — Meeting packages
Our standard meeting package includes a room, a screen, water, and one coffee break. Lunch may be added for an extra charge. Final meal numbers are due three working days before the event. Reductions after that deadline cannot be refunded, but we can prepare unused meals for collection if requested before lunch service begins.

Message from an organizer — Event day, eight in the morning
Two participants have called in sick, so we now expect eighteen people instead of twenty. We submitted our lunch count last week. Please prepare the two extra lunches for our evening volunteers. They will collect them at the end of the afternoon. Keep the coffee arrangement unchanged.`,
    rows: [
      [
        "跨文件推論",
        "Why does the organizer request packaged lunches?",
        "The meal count can no longer be reduced for a refund",
        "The meeting room has no dining area",
        "All twenty participants will arrive late",
        "Lunch is free for volunteers",
        "人數早已確認且今天才減少，超過可退款期限，所以改打包。",
      ],
      [
        "細節辨識",
        "What is included in the standard package?",
        "One coffee break",
        "Lunch for every participant",
        "Evening entertainment",
        "Transportation to the hotel",
        "標準方案含會議室、螢幕、水與一次咖啡休息。",
      ],
      [
        "數量推論",
        "How many lunches will be collected for volunteers?",
        "Two",
        "Eighteen",
        "Twenty",
        "Three",
        "原二十人減少為十八人，兩份餐點留給志工。",
      ],
      [
        "條件與限制",
        "When must a request to package unused meals be made?",
        "Before lunch service begins",
        "Before the meeting room is booked",
        "After the volunteers arrive",
        "Three weeks before the event",
        "政策要求午餐服務開始前提出打包需求。",
      ],
      [
        "字義辨識",
        'In the organizer’s message, "unchanged" means:',
        "Kept as previously arranged",
        "Removed from the booking",
        "Charged at a higher rate",
        "Moved to the evening",
        "咖啡安排维持原訂，不随人數調整。",
      ],
    ],
  },
  {
    part: 7,
    topic: "工作與排程",
    format: "聊天訊息",
    passage: `Team chat — Product photographs
09:10 — Mia: The photographer can come on Wednesday morning. Are the display samples ready?
09:13 — Leo: The blue and green samples are ready. The white one failed the final inspection, so a replacement is being made.
09:16 — Mia: We need all three colors in the same lighting. Can the replacement be finished by Wednesday?
09:20 — Leo: Production says Thursday is the earliest. The photographer is also free Friday morning.
09:24 — Mia: Let's take that slot. Please keep the approved samples covered until then.
09:27 — Leo: I'll confirm the new appointment and label the faulty sample so it isn't used by mistake.`,
    rows: [
      [
        "時間推論",
        "When will the photographs most likely be taken?",
        "Friday morning",
        "Wednesday morning",
        "Wednesday afternoon",
        "Thursday morning",
        "替換品最早週四完成，攝影師週五早有空，Mia 接受該時段。",
      ],
      [
        "原因與細節",
        "Why is a new white sample needed?",
        "The current one did not pass inspection",
        "The photographer requested a different shade",
        "The first one has already been sold",
        "The white model was missing from the order",
        "白色樣品未通過最終檢查。",
      ],
      [
        "指涉辨識",
        'What does Mia refer to by "that slot"?',
        "The Friday morning appointment",
        "The Wednesday production shift",
        "The display space for the green sample",
        "A gap in the inspection report",
        "that slot 指前一句攝影師週五早上有空的時段。",
      ],
      [
        "下一步行動",
        "What will Leo do with the faulty sample?",
        "Label it to prevent accidental use",
        "Send it to the photographer",
        "Place it with approved stock",
        "Sell it at a discount",
        "末則訊息說明標記瑕疵品，避免誤用。",
      ],
      [
        "情境推論",
        "What is important to Mia about the photographs?",
        "All three colors should be photographed under consistent lighting",
        "Only the newest sample should appear",
        "Each color should be shown in a different setting",
        "The photographs must be finished before Thursday",
        "Mia 要求三色在同樣光線下拍攝，因此願意改期。",
      ],
    ],
  },
];
