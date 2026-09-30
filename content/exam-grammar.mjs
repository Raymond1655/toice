// Original contextual exercises. Each family has five independently written contexts.
// Correct option is first in source; the builder rotates options before publishing.
export const families = [
  [
    "詞性：名詞",
    "approval|approve|approved|approving",
    "所有格或形容詞後需要名詞 approval（核准），其他選项是動詞或分詞。",
    [
      "The renovation cannot begin without written _____.",
      "Please obtain the director's _____ before ordering equipment.",
      "Final _____ for the travel budget is still pending.",
      "The design team is waiting for official _____.",
      "Your supervisor's _____ is required for this expense.",
    ],
  ],
  [
    "詞性：副詞",
    "carefully|careful|care|carefulness",
    "修飾動作需要副詞 carefully（仔細地），形容詞或名詞不能直接修飾此動詞。",
    [
      "Please read the safety instructions _____ before using the machine.",
      "The accountant checked each receipt _____.",
      "All packages should be inspected _____ upon arrival.",
      "The committee considered every proposal _____.",
      "Handle these glass samples _____ during transport.",
    ],
  ],
  [
    "詞性：形容詞",
    "reliable|reliably|reliability|rely",
    "名詞前或連綴動詞後需要形容詞 reliable（可靠的）。",
    [
      "We need a _____ supplier for replacement parts.",
      "The new delivery service is both fast and _____.",
      "A _____ network is essential for remote work.",
      "Our office has used this _____ printer for years.",
      "The survey provides _____ information about customer needs.",
    ],
  ],
  [
    "時態：過去式",
    "completed|complete|completes|completing",
    "明確過去時間搭配過去式 completed；其他形式不能作此句過去時的主要動詞。",
    [
      "The technicians _____ the installation yesterday.",
      "Our team _____ the inventory count last Friday.",
      "The interns _____ their training two weeks ago.",
      "We _____ the inspection before lunch yesterday.",
      "The builders _____ the entrance last month.",
    ],
  ],
  [
    "主詞動詞一致",
    "includes|include|including|inclusion",
    "一般現在式中單數主詞搭配 includes；including 不能單獨當主要動詞。",
    [
      "The membership fee _____ access to the fitness center.",
      "Each package _____ a printed instruction manual.",
      "The standard room rate _____ breakfast for one guest.",
      "This subscription _____ a monthly industry report.",
      "The registration price _____ all workshop materials.",
    ],
  ],
  [
    "被動語態",
    "delivered|delivering|deliver|delivers",
    "物品是被送達，be 動詞後使用過去分詞 delivered。",
    [
      "The replacement parts will be _____ on Monday.",
      "Your order was _____ to the front desk.",
      "The brochures are _____ to local businesses every week.",
      "All invitations have been _____ to the guests.",
      "The equipment must be _____ before the training session.",
    ],
  ],
  [
    "不定詞",
    "attend|attending|attended|attendance",
    "plan / agree / decide / hope / ability 後的 to 是不定詞標記，接原形動詞。",
    [
      "Several managers plan to _____ the trade show.",
      "The director agreed to _____ the awards ceremony.",
      "We decided to _____ the morning seminar.",
      "All new employees hope to _____ the orientation.",
      "Please confirm your ability to _____ the briefing.",
    ],
  ],
  [
    "介系詞後動名詞",
    "submitting|submit|submitted|submits",
    "介系詞後若接動作，使用動名詞 submitting。",
    [
      "Check all figures before _____ the report.",
      "Thank you for _____ your application on time.",
      "You can request a refund by _____ this form.",
      "After _____ the proposal, keep a copy for your records.",
      "Please contact us if you need help with _____ your claim.",
    ],
  ],
  [
    "時間介系詞",
    "by|during|since|among",
    "by 表示不晚於截止時間；during 是期間，since 是起點，among 是在多者之間。",
    [
      "All expense reports must arrive _____ Friday afternoon.",
      "Please return the signed contract _____ noon tomorrow.",
      "Applications must be received _____ the end of June.",
      "The room must be ready _____ nine o'clock tomorrow.",
      "Send your meal preference _____ next Tuesday.",
    ],
  ],
  [
    "時間長度",
    "for|since|during|until",
    "for 後接一段時間；since 後接時間起點，until 表示直到。",
    [
      "The office has been closed _____ three days.",
      "Our team has worked on this project _____ six months.",
      "The warranty remains valid _____ two years.",
      "The consultant has advised us _____ several weeks.",
      "The road has been under repair _____ a month.",
    ],
  ],
  [
    "起點時間",
    "since|for|during|within",
    "完成式中 since 後接過去的時間起點。",
    [
      "The company has occupied this building _____ April.",
      "Our store has offered online delivery _____ last year.",
      "The manager has been abroad _____ Monday.",
      "This printer has worked well _____ its installation.",
      "We have used the new system _____ January.",
    ],
  ],
  [
    "讓步連接詞",
    "Although|Despite|Because of|During",
    "空格後是完整子句，需要 Although；despite 與 because of 後接名詞片語。",
    [
      "_____ the office was busy, the receptionist remained calm.",
      "_____ sales increased, the company kept its prices unchanged.",
      "_____ the weather was poor, the delivery arrived on time.",
      "_____ the hotel was full, the staff found another room nearby.",
      "_____ the software is complex, the guide is easy to follow.",
    ],
  ],
  [
    "讓步介系詞",
    "Despite|Although|Because|Unless",
    "despite 後可接名詞片語；although、because、unless 需要子句。",
    [
      "_____ the heavy rain, the outdoor event continued.",
      "_____ the delay, all guests reached the venue safely.",
      "_____ limited space, the office feels comfortable.",
      "_____ the high cost, the board approved the upgrade.",
      "_____ several reminders, the invoice remains unpaid.",
    ],
  ],
  [
    "原因連接詞",
    "because|despite|during|unless",
    "because 引導原因子句，說明前半句發生的原因。",
    [
      "The meeting was postponed _____ the speaker was ill.",
      "We ordered more chairs _____ registration exceeded expectations.",
      "The shop closed early _____ a water pipe had broken.",
      "The team hired an assistant _____ the workload had increased.",
      "Please use the side entrance _____ the lobby is being painted.",
    ],
  ],
  [
    "條件連接詞",
    "unless|although|because|whereas",
    "unless 表示除非，亦即 if ... not；依語意設定例外條件。",
    [
      "The order will be canceled _____ payment is received today.",
      "Visitors may not enter the laboratory _____ they wear safety glasses.",
      "The discount will not apply _____ you present a membership card.",
      "Your reservation will expire _____ you confirm it by noon.",
      "The machine will not start _____ the safety door is closed.",
    ],
  ],
  [
    "關係代名詞：人",
    "who|which|whose|what",
    "先行詞是人且關係子句缺主詞，使用 who；whose 後須接名詞。",
    [
      "Employees _____ work overnight receive an additional allowance.",
      "The consultant _____ designed our website will visit today.",
      "Customers _____ register online receive a confirmation email.",
      "The technician _____ repaired the elevator left a service report.",
      "Anyone _____ needs assistance should contact the front desk.",
    ],
  ],
  [
    "關係代名詞：所有格",
    "whose|who|which|whom",
    "空格後是名詞，需 whose 表達所屬關係。",
    [
      "Applicants _____ references are incomplete will be contacted.",
      "The employee _____ proposal was selected will lead the project.",
      "Customers _____ orders were delayed will receive a refund.",
      "The author _____ book won the award will speak tonight.",
      "Guests _____ luggage is missing should visit the service desk.",
    ],
  ],
  [
    "代名詞：所有格",
    "their|they|them|theirs",
    "名詞前需要所有格形容詞 their；theirs 不再接名詞。",
    [
      "Employees should update _____ emergency contact details.",
      "Participants must bring _____ registration tickets.",
      "All visitors are asked to display _____ identification badges.",
      "The suppliers submitted _____ quotations yesterday.",
      "Customers can track _____ orders on our website.",
    ],
  ],
  [
    "反身代名詞",
    "themselves|them|their|they",
    "主詞與受詞指同一群人，使用反身代名詞 themselves。",
    [
      "New staff members introduced _____ at the welcome meeting.",
      "The designers taught _____ to use the software.",
      "The guests served _____ at the breakfast buffet.",
      "The organizers congratulated _____ on a successful event.",
      "The technicians prepared _____ for a long inspection.",
    ],
  ],
  [
    "比較級",
    "more|most|much|many",
    "與 than 搭配的多音節形容詞使用 more + 形容詞。",
    [
      "The new ordering system is _____ convenient than the old one.",
      "This venue is _____ accessible than the previous location.",
      "The revised proposal is _____ detailed than the original.",
      "Our latest printer is _____ efficient than the older model.",
      "The afternoon flight is _____ expensive than the morning flight.",
    ],
  ],
  [
    "最高級",
    "most|more|much|many",
    "the + 多音節形容詞最高級使用 most；比較兩者才使用 more ... than。",
    [
      "This is the _____ popular item in our catalog.",
      "The committee selected the _____ suitable candidate.",
      "She gave the _____ informative presentation of the day.",
      "This route offers the _____ direct connection to the airport.",
      "We chose the _____ economical option available.",
    ],
  ],
  [
    "固定搭配：responsible",
    "for|of|to|with",
    "be responsible for 表示負責，for 後接負責的事項。",
    [
      "The assistant is responsible _____ arranging appointments.",
      "Our department is responsible _____ maintaining the website.",
      "The vendor is responsible _____ replacing damaged items.",
      "The supervisor is responsible _____ training new employees.",
      "The hotel is responsible _____ cleaning the meeting room.",
    ],
  ],
  [
    "固定搭配：interested",
    "in|on|at|by",
    "be interested in 表示對某事感興趣。",
    [
      "Several clients are interested _____ our new service.",
      "Anyone interested _____ the seminar should register today.",
      "The company is interested _____ expanding overseas.",
      "Are you interested _____ joining the volunteer group?",
      "Investors are interested _____ the latest sales figures.",
    ],
  ],
  [
    "固定搭配：comply",
    "with|to|for|about",
    "comply with 表示遵守規範或要求。",
    [
      "All contractors must comply _____ the safety regulations.",
      "The building must comply _____ local fire standards.",
      "Please comply _____ the instructions on the notice.",
      "Suppliers are expected to comply _____ our packaging policy.",
      "All applications must comply _____ the stated requirements.",
    ],
  ],
  [
    "固定搭配：look forward",
    "to|for|at|with",
    "look forward to 中的 to 是介系詞，後接名詞或動名詞。",
    [
      "We look forward _____ meeting you at the conference.",
      "The team looks forward _____ working with the new director.",
      "Our guests are looking forward _____ touring the factory.",
      "I look forward _____ receiving your reply.",
      "The staff look forward _____ celebrating the anniversary.",
    ],
  ],
  [
    "數量詞：可數複數",
    "Several|Much|Each|Every",
    "複數可數名詞搭配 several；each/every 後接單數，much 搭配不可數名詞。",
    [
      "_____ employees volunteered to help at the event.",
      "_____ packages arrived without shipping labels.",
      "_____ conference rooms are available this afternoon.",
      "_____ applicants have experience in customer service.",
      "_____ changes were made to the final schedule.",
    ],
  ],
  [
    "數量詞：不可數",
    "much|many|few|several",
    "information、time、space、equipment、progress 在此為不可數名詞，搭配 much。",
    [
      "We do not have _____ information about the new supplier.",
      "There is not _____ time left before the deadline.",
      "The small office does not have _____ space for storage.",
      "The new branch does not need _____ equipment.",
      "The team has not made _____ progress this week.",
    ],
  ],
  [
    "副詞位置與語意",
    "promptly|prompt|promptness|prompting",
    "修飾動詞使用 promptly，意為迅速地。",
    [
      "Please respond _____ to customer inquiries.",
      "All refund requests will be processed _____.",
      "The repair team arrived _____ after receiving the call.",
      "Employees should report safety problems _____.",
      "Our support staff handled the complaint _____.",
    ],
  ],
  [
    "詞性：名詞片語",
    "assistance|assist|assisting|assisted",
    "動詞的受詞或形容詞之後需名詞 assistance（協助）。",
    [
      "Please contact the help desk for technical _____.",
      "The receptionist offered immediate _____.",
      "We appreciate your _____ with the move.",
      "Customers requiring _____ should press the service button.",
      "The team provided valuable _____ during the inspection.",
    ],
  ],
  [
    "現在完成式",
    "has|have|having|to have",
    "主詞單數，且 since/until now 指持續至今，使用 has + 過去分詞。",
    [
      "The company _____ grown steadily since its founding.",
      "Our manager _____ worked here since March.",
      "The department _____ received ten applications so far.",
      "The store _____ served this neighborhood for years and is still open.",
      "The technician _____ already fixed the problem, so we can resume work.",
    ],
  ],
  [
    "介系詞：期間",
    "during|since|for|until",
    "during + 特定事件或期間，表示在該期間內。",
    [
      "Please silence your phone _____ the presentation.",
      "The restaurant was renovated _____ the summer break.",
      "Staff can ask questions _____ the training session.",
      "The parking lot will be closed _____ the annual festival.",
      "Visitors must remain seated _____ the safety demonstration.",
    ],
  ],
  [
    "介系詞：在…之間",
    "between|among|during|across",
    "between 用於明確兩者之間或 between ... and ... 結構。",
    [
      "The office is located _____ the bank and the pharmacy.",
      "Please call _____ nine and eleven in the morning.",
      "The agreement _____ the two companies was signed today.",
      "There is a clear difference _____ these two service plans.",
      "A walkway connects the area _____ the two buildings.",
    ],
  ],
  [
    "商務字彙：截止日",
    "deadline|discount|departure|direction",
    "deadline 是截止期限；其他選项分別是折扣、出發、方向。",
    [
      "The application _____ has been extended by one week.",
      "Please submit your report before the _____.",
      "We must meet the _____ for the grant proposal.",
      "The editor reminded writers of the approaching _____.",
      "The project _____ is printed at the top of the schedule.",
    ],
  ],
  [
    "商務字彙：收據",
    "receipt|recipe|reception|recession",
    "receipt 是收據，常用作付款與退貨證明；recipe 是食譜。",
    [
      "Keep your _____ as proof of payment.",
      "A _____ is required to obtain a refund.",
      "Please attach the original _____ to your expense claim.",
      "The cashier placed the _____ inside the shopping bag.",
      "The customer asked for a printed _____ after paying.",
    ],
  ],
  [
    "商務字彙：預約",
    "reservation|renovation|regulation|resignation",
    "reservation 是預約；renovation 是翻修，regulation 是規定，resignation 是辭職。",
    [
      "I would like to confirm my hotel _____.",
      "The restaurant requires a _____ for groups of six or more.",
      "Please provide your _____ number at check-in.",
      "You can cancel your _____ online before noon.",
      "A room _____ can be made through our website.",
    ],
  ],
  [
    "商務字彙：替換",
    "replace|repairing|replacement|replaces",
    "情態動詞或不定詞 to 後接原形 replace（替換）。",
    [
      "We need to _____ the damaged monitor.",
      "The supplier will _____ any defective parts.",
      "Please contact support to _____ a lost access card.",
      "The company plans to _____ its outdated computers.",
      "A technician can _____ the filter in a few minutes.",
    ],
  ],
  [
    "被動與副詞",
    "announced|announcing|announcement|announces",
    "be + 過去分詞 announced 表示被宣布；名詞不能構成被動語態。",
    [
      "The results will be _____ on our website tomorrow.",
      "The new policy was _____ at the staff meeting.",
      "All schedule changes are _____ by email.",
      "The award recipients have been _____ publicly.",
      "The opening date will be _____ after the inspection.",
    ],
  ],
  [
    "連接副詞",
    "However|Therefore|Similarly|For example",
    "前後內容相反，However 表示轉折；therefore 是因果，similarly 是相似。",
    [
      "The office is small. _____, it has excellent natural light.",
      "The product is expensive. _____, demand remains strong.",
      "The hotel was fully booked. _____, a room became available later.",
      "We expected a delay. _____, the shipment arrived early.",
      "The task was difficult. _____, the team finished it on time.",
    ],
  ],
  [
    "目的不定詞",
    "reduce|reducing|reduced|reduction",
    "in order to + 原形動詞表示目的，reduce 意為降低。",
    [
      "The company installed new lights in order to _____ energy costs.",
      "We changed the process in order to _____ waiting times.",
      "Staff will share vehicles in order to _____ travel expenses.",
      "The factory upgraded its equipment in order to _____ waste.",
      "The store added more cashiers in order to _____ long lines.",
    ],
  ],
  [
    "情態動詞",
    "must|must to|must be to|must have to",
    "情態動詞 must 直接接原形動詞，不加 to。",
    [
      "All visitors _____ sign in at reception.",
      "Applicants _____ provide two professional references.",
      "Employees _____ wear identification badges at work.",
      "Passengers _____ keep the emergency exits clear.",
      "Participants _____ arrive before the session begins.",
    ],
  ],
];
export const mockGrammar = `
The updated catalog will be available _____ next week.|starting|started|starts|start|分詞片語|starting next week 表示從下週開始。
Please direct all billing inquiries to the accounting _____.|department|depart|departmental|departmentally|詞性：名詞|accounting department 是會計部門，名詞作 to 的受詞。
The manager asked staff to work more _____.|efficiently|efficient|efficiency|efficiencies|詞性：副詞|修飾 work 需要副詞 efficiently。
Neither the printer nor the scanner _____ working today.|is|are|be|were|主詞動詞一致|neither ... nor ... 依最近主詞 scanner 使用單數 is。
The contract should be reviewed _____ it is signed.|before|despite|during|within|時間連接詞|完整子句前用 before，表示簽約前先審查。
Ms. Lee has been appointed _____ the new branch manager.|as|to|for|of|固定搭配|appoint someone as 表示任命為某職位。
The new model uses _____ electricity than the old one.|less|few|fewer|least|比較級|electricity 不可數，than 前使用 less。
The brochures are intended _____ potential investors.|for|by|with|at|固定搭配|be intended for 表示為某對象設計。
The team succeeded in _____ the problem.|solving|solve|solved|solution|介系詞後動名詞|in 後接 solving。
You may choose _____ the morning session or the afternoon session.|either|neither|both|each|對等連接詞|either ... or ... 表示二者擇一。
The receptionist will show _____ to the meeting room.|you|your|yours|yourself|代名詞|show 的受詞是 you。
The software update is available at no additional _____.|charge|charged|charging|charger|商務字彙|at no additional charge 表示不另收費。
All staff members are encouraged to _____ suggestions.|make|do|take|hold|固定搭配|make suggestions 表示提出建議。
The shipment was delayed _____ a customs inspection.|because of|because|although|unless|原因介系詞|名詞片語前使用 because of。
The factory is closed _____ further notice.|until|since|within|among|時間介系詞|until further notice 表示直到另行通知。
The presentation was so _____ that everyone took notes.|informative|information|inform|informatively|詞性：形容詞|so 後以形容詞描述 presentation。
Please ensure that all windows are _____ before leaving.|locked|locking|lock|locks|被動語態|窗戶被鎖上，使用 are locked。
This voucher is valid only at _____ stores.|participating|participate|participation|participates|分詞形容詞|participating stores 是參與活動的商店。
The editor requested a _____ of the first draft.|revision|revise|revised|revising|詞性：名詞|a 後需要可數名詞 revision。
The seminar was canceled due to a lack _____ interest.|of|for|with|to|固定搭配|a lack of 表示缺乏。
The building _____ we rented last year is being sold.|that|who|whose|what|關係代名詞|先行詞 building，關係子句缺受詞，使用 that。
The manager reminded us _____ the updated procedures.|to follow|following|followed|follow|不定詞|remind someone to do something。
The store offers free delivery on orders _____ fifty dollars.|over|along|into|toward|數量介系詞|over 表示超過金額門檻。
We would appreciate _____ your feedback by Friday.|receiving|receive|received|reception|動詞搭配|appreciate 後接動名詞 receiving。
The repairs took longer than _____.|expected|expect|expecting|expectation|省略子句|than expected 為 than was expected 的省略。
The candidate has _____ experience in international sales.|extensive|extensively|extend|extension|詞性：形容詞|extensive experience 表示豐富經驗。
_____ the training is optional, new employees are strongly encouraged to attend.|While|During|Despite|Because of|讓步連接詞|While 在此表示雖然，後接完整子句。
This room can accommodate _____ to fifty people.|up|out|away|off|固定搭配|up to 表示最多可達。
The consultant spoke _____ about the need for better communication.|clearly|clear|clarity|clearing|詞性：副詞|spoke 後用 clearly 修飾說話方式。
The proposal needs to be _____ before the board meeting.|revised|revising|revise|revision|被動語態|needs to be revised 表示需要被修訂。
`.trim();
