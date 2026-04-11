(function () {
  const SUPPORTED = ["en", "zh", "ko", "th"];
  const LANG_PATH_MAP = {
    en: "en-us",
    zh: "zh-tw",
    ko: "ko-kr",
    th: "th-th"
  };
  const LANG_QUERY_KEY = "lang";
  const PATH_LANG_MAP = {
    "en-us": "en",
    "zh-tw": "zh",
    "ko-kr": "ko",
    "th-th": "th"
  };
  let SITE_BASE_PATH = "";
  const ORIGINAL_TEXT = new WeakMap();
  let ORIGINAL_PAGE_TITLE = "";
  let PAGE_LOADER = null;

  const MONTH_MAP = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12
  };

  const TITLE_PREFIX_MAP = {
    en: {
      Home: "Home",
      About: "About",
      Research: "Research",
      Experience: "Experience",
      Work: "Work",
      CV: "CV",
      "Page Updating": "Page Updating"
    },
    zh: {
      Home: "首頁",
      About: "關於",
      Research: "研究",
      Experience: "經歷",
      Work: "工作",
      CV: "履歷",
      "Page Updating": "頁面更新中"
    },
    ko: {
      Home: "홈",
      About: "소개",
      Research: "연구",
      Experience: "경험",
      Work: "직무",
      CV: "이력서",
      "Page Updating": "페이지 업데이트 중"
    },
    th: {
      Home: "หน้าหลัก",
      About: "เกี่ยวกับ",
      Research: "งานวิจัย",
      Experience: "ประสบการณ์",
      Work: "งาน",
      CV: "เรซูเม่",
      "Page Updating": "หน้ากำลังอัปเดต"
    }
  };

  const MOJIBAKE_MAP = {
    "â†": "←",
    "â†": "←",
    "Â©": "©",
    "â€”": "—",
    "â€“": "–",
    "é™³åµŠå‡±": "陳嵊凱"
  };

  const STATIC_TEXT_MAP = {
    en: {},
    zh: {
      "Back to Research": "返回研究頁",
      "â† Back to Research": "← 返回研究頁",
      "â† Back to Research": "← 返回研究頁",
      "Mentor": "指導者",
      "Advisor": "指導教授",
      "Team": "團隊",
      "Abstract": "摘要",
      "Project Page": "專案頁面",
      "Internship": "實習",
      "Competition": "競賽",
      "Master Research": "碩士研究",
      "Undergraduate Capstone": "大學專題",
      "Back to Homepage": "返回首頁",
      "â† Back to Homepage": "← 返回首頁",
      "Division of Virtual-Real Integration": "虛實整合與數位孿生組",
      "Journal Papers": "期刊論文",
      "Conference Papers": "研討會論文",
      "Page Under Construction": "頁面建置中",
      "Proof of Published": "發表證明",
      "Paper":"論文",
      "Code":"程式碼",
      "PPT":"簡報",
      "Competition Proof": "競賽證明",
      "Capstone Report": "專題報告",
      "Certification of Complete": "結訓證明",
      "Certification": "證照",
      "Intern Proof (EN)": "實習證明（英文）",
      "Intern Proof (CH)": "實習證明（中文）",
      "Research Fields and Skills": "研究領域與技能",
      "Core Domain": "核心領域",
      "Applied Domain": "應用領域",
      "Emerging Track": "發展方向",
      "Scope": "研究範疇",
      "Toolkit": "技術工具",
      "Human Side": "軟實力面向",
      "Communication": "溝通能力",
      "Research Areas": "研究領域",
      "Technical Skills": "技術技能",
      "Soft Skills": "軟實力",
      "Language Skills": "語言能力",
      "Visual SLAM": "視覺 SLAM",
      "Digital IC Design": "數位 IC 設計",
      "Artificial Intelligence": "人工智慧",
      "Robotics": "機器人",
      "IC Design (Learning)": "IC 設計（學習中）",
      "Deep Learning": "深度學習",
      "Visual Recognition": "視覺辨識",
      "Agentic AI": "代理式 AI",
      "Explainable AI": "可解釋 AI",
      "LLMs": "大型語言模型",
      "SLMs": "小型語言模型",
      "Robotic Manipulation": "機器人操作",
      "Motion Planning": "運動規劃",
      "Digital Twin": "數位孿生",
      "Edge Computing": "邊緣運算",
      "RISC-V Architecture": "RISC-V 架構",
      "Edge AI": "邊緣 AI",
      "Leadership": "領導力",
      "Project Management": "專案管理",
      "Cross-cultural Collaboration": "跨文化協作",
      "Technical Writing": "技術寫作",
      "Mandarin": "中文",
      "English": "英文",
      "Korean": "韓文",
      "Thai": "泰文",
      "GPA:": "GPA：",
      "and":"和",
      "M.Sc. in Electrical Engineering": "電機工程碩士",
      "B.Sc. in Electrical Engineering": "電機工程學士",
      "After-Class Activities Experience": "課外活動經歷",
      "Robotics (EEB593)":"機器人學（EEB593）",
      "Robot Operating System (EEB335/ME382)":"機器人作業系統（EEB335/ME382）",
      "Robotic Navigation and Exploration (AI504)":"機器導航與探索（AI504）",
      "Introduction to Computer Vision and Image Processing (EEB215)":"電腦視覺與影像處理概論（EEB215）",
      "Introduction to Computer Science (EI105/EEB108)":"計算機概論（EI105/EEB108）",
      "Data Structures (EI219)":"資料結構（EI219）",
      "Fundamental Computer Programming-C (CP119)":"基礎程式設計-C（CP119）",
      "Digital System Design with Lab (EEB318)":"數位系統設計與實驗（EEB318）",
      "Fundamental Computer Programming-Python (CP109)":"基礎程式設計-Python（CP109）",
      "Laboratory Management & Education Research Assistant": "實驗室管理與教育研究助理",
      "Graduate Mentor": "研究生導師",
      "Teaching Assistant": "教學助理",
      "Member of Preparatory Committee for 2024 ROC Nationwide Celebration of Youth Day": "2024 年全國青年節籌備委員",
      "Proof of Member":"委員證明",
      "China Youth Corps":"救國團",
      "Chairman of Student Council": "學生議會議長",
      "Proof of Chairman":"議長證明書",
      "Executive Secretary of Student Executive Center": "學生行政中心執行秘書",
      "Proof of Carde": "幹部證明書",
      "International Volunteer": "國際志工",
      "Tutor of Digital Multiple Language Project": "數位多語計畫課輔老師",
      "Proof of Participating":"計畫參與證明",
      "2023 Google Digital Talent Program": "2023 Google 數位人才計畫",
      "Certification of Completion": "結業證書",
      "2023 TalentNXT Program": "2023 TalentNXT 計畫",
      "Sayling Wen Cultural & Educational Foundation": "溫世仁文教基金會",
      "20th Seed Talent Program Graduation Certification": "第 20 屆種子人才培育計畫結業認證",
      "STP":"種子人才培育計畫",
      "DIF Machine Fundamental Course":"DIF機台基礎",
      "TSMC Semiconductor Curriculum":"台積電半導體學程",
      "Project Developer & Paper Author": "專案開發與論文作者",
      "Project Developer & Paper Revise": "專案開發與論文修訂",
      "Paper Co-Author": "論文共同作者",
      "Paper Co-Author (Responsible for Related Work)": "論文共同作者（負責相關工作）",
      "Hardware & ROS System Assemble": "硬體與 ROS 系統整合",
      "ROS Code Developer & Image Model Building": "ROS 程式開發與影像模型建置",
      "Assemble & Writing Report": "系統組裝與報告撰寫",
      "Assemble & Writing Paper": "系統組裝與論文撰寫",
      "Code Developer & Writing Paper": "程式開發與論文撰寫",
      "Physics Calculating & Writing Paper": "物理計算與論文撰寫",
      "Team Leader & Project Assembler (AWS & Frontend)": "隊長與專案整合（AWS 與前端）",
      "Frontend Design (Chatbot Webpage)": "前端設計（聊天機器人網頁）",
      "Assistant of Android Studio Development": "Android Studio 開發協助",
      "Assistant of AI-Glasses": "AI 眼鏡開發協助",
      "Presenter": "簡報者",
      "Award": "獎項",
      "Learn the skills of Google Cloud.": "學習 Google Cloud 相關技能。",
      "Learn the skills of business thinking.": "學習商業思維相關技能。",
      "Learn the skills of being sales, product manager and manufactory.": "學習業務、產品經理與製造領域相關技能。",
      "Learn how to communicate and corporate with others.": "學習如何與他人溝通與合作。",
      "Participating in related work.": "參與相關工作。",
      "Complete the project of Bafang Yunji and Taiwan Care Charity Foundation CSR Project.": "完成八方雲集與台灣照顧公益基金會 CSR 專案。",
      "Outstanding Graduate Award": "傑出畢業生獎",
      "Young College Elite of 2023": "112年大專優秀青年",
      "Third Place of 2022 YZU Maker Competition Robot Fighting": "112年元智大學創客競賽機器人格鬥組第三名",
      "This page is currently being updated with new content. Please check back soon!": "此頁面正在更新內容，敬請稍後再訪！",
      "Analyzed government AI policies and corporate digital transformation cases using the KPMG Connected Enterprise framework.": "使用 KPMG Connected Enterprise 架構分析政府 AI 政策與企業數位轉型案例。",
      "Applied Trusted AI frameworks (LIT, SHAP) to financial data and corporate XAI cases.": "將可信任 AI 框架（LIT、SHAP）應用於金融資料與企業 XAI 案例。",
      "Developed AI agent for remote computer control with AR glasses streaming via RTSP.": "開發可透過 RTSP 串流與 AR 眼鏡進行遠端電腦控制的 AI 代理。",
      "Trained UR10 robotic arm models for singularity-aware motion planning.": "訓練 UR10 機械手臂模型以進行奇異點感知運動規劃。",
      "Research Assistant": "研究助理",
      "Assisting with the project of medical system using AI technologies.": "協助以 AI 技術開發醫療系統相關專案。",
      "Exploring and doing research on new topic of IC Design, AI, and Robotics.": "探索並研究 IC 設計、AI 與機器人等新興主題。",
      "Managed IT infrastructure, social media, and provided technical support in Thai.": "管理 IT 基礎設施與社群媒體，並提供泰語技術支援。",
      "Focus on technical improvement for new process application and system hardware development.": "聚焦新製程導入與系統硬體開發之技術改善。",
      "Publications: Conference paper accepted at TANET 2025 and NCS 2025.": "發表：論文已被 TANET 2025 與 NCS 2025 接收。",
      "Assisted advisor in lab hardware management, competition organization, and coordination of research on robotics education.": "協助指導教授進行實驗室硬體管理、競賽籌辦與機器人教育研究協調。",
      "Supervised two undergraduate projects on robotic arm modeling and digital twin applications.": "指導兩項大學部專題，主題為機械手臂建模與數位孿生應用。",
      "Prepared three submissions to IEEE Transactions on Education.": "完成三篇投稿至 IEEE Transactions on Education。",
      "Resulted in publications at ICCE-TW 2025 and ICCR 2025": "成果發表於 ICCE-TW 2025 與 ICCR 2025。",
      "Supported data analysis, course design, and academic writing for studies on learning outcomes and scaffolding strategies.": "支援學習成效與鷹架策略研究之資料分析、課程設計與學術寫作。",
      "Assisting of holding youth day event.": "協助籌辦青年節活動。",
      "Promoting the event.": "推廣活動執行。",
      "Teaching English and holding events with Chinese cultures.": "教授英語並舉辦中華文化活動。",
      "Teaching coding and IT skills.": "教授程式設計與資訊技能。",
      "Making 14 weeks tutoring plans.": "制定 14 週課輔計畫。",
      "Teaching English to kids in remote areas.": "為偏鄉孩童教授英語。",
      "Manage student council and being the chair in each meeting.": "管理學生會並主持各項會議。",
      "Supervising the student executive center and review the budget of whole association.": "督導學生行政中心並審核全會預算。",
      "Assisting president of managing whole association.": "協助會長管理整體學生自治組織。",
      "Reviewing the procedure of holding events.": "檢視活動舉辦流程。",
      "Responsible for manufacture equipment improvements.": "負責製造設備改善。",
      "Assist to benchmark and formalize production tool roadmap.": "協助標竿分析與制定生產工具藍圖。",
      "Repaired machines and designed factory fixtures.": "維修設備並設計工廠治具。",
      "Yuan Ze University": "元智大學",
      "Yuan Ze University, Taiwan": "元智大學，臺灣",
      "Yuan Ze University Student Association": "元智大學學生會",
      "Ministry of Education in Taiwan and Yuan Ze University": "教育部與元智大學",
      "Incoming Equipment Engineer":"未來新進設備工程師",
      "ETC":"蝕刻工程部",
      "National Center for High-Performance Computing": "國家高速網路與計算中心",
      "KPMG Taiwan | T Ambassador Program": "KPMG 台灣｜T 大使計畫",
      "TSMC": "台灣積體電路製造股份有限公司 (台積電)",
      "Summer Intern": "暑期實習生",
      "National Center for High-Performance Computing, Taiwan": "國家高速網路與計算中心（臺灣）",
      "Ta Chou Industry, Thailand": "大洲工業有限公司  (泰國)",
      "Division of Management": "管理部",
      "Ta Thong Chinese School, Thailand": "滿星疊大同中學，泰國",
      "Proof of Volunteer":"志工證明",
      "T Ambassador Program": "T 大使計畫",
      "Intern Consultant":"顧問實習生",
      "Jyh-Hong Wu": "吳志泓 研究員",
      "Hsiu-Mei Chou": "周秀美 副研究員",
      "Po-Chiang Lin": "林柏江 助理教授",
      "Huang-Chia Shih": "施皇嘉 教授",
      "Sheng-Kai Chen": "陳嵊凱",
      "Yi-Ling Tsai": "蔡倚菱",
      "Chun-Chih Chang": "張鈞植",
      "Yan-Chen Chen": "陳彥蓁",
      "Jie-Yu Chao": "趙婕宇",
      "Jr-Yu Chang": "張值毓",
      "Po-Lien Wu": "吳柏蓮",
      "Tzu-Yu Liu": "劉姿妤",
      "Yan-Di Liu": "劉彥狄",
      "Yu-Ting Chou": "周裕庭",
      "Ching-Yao Lin": "林敬堯 博士",
      "Yen-Ting Lin": "林彥廷",
      "Taiwan": "臺灣",
      "Innovative Technology Lab": "創新科技實驗室",
      "Human-Computer Interaction Multimedia Lab": "人機互動多媒體實驗室",
      "Division of Virtual-Real Integration and Digital Twins": "虛實整合與數位孿生組",
      "Digital Transformation Group, Division of Consulting": "顧問部門數位轉型組",
      "Lab:": "實驗室："
    },
    ko: {
      "Back to Research": "연구로 돌아가기",
      "â† Back to Research": "← 연구로 돌아가기",
      "â† Back to Research": "← 연구로 돌아가기",
      "Mentor": "멘토",
      "Advisor": "지도교수",
      "Team": "팀",
      "Abstract": "초록",
      "Project Page": "프로젝트 페이지",
      "Internship": "인턴십",
      "Competition": "대회",
      "and":"그리고",
      "Master Research": "석사 연구",
      "Undergraduate Capstone": "학부 캡스톤",
      "Back to Homepage": "홈으로 돌아가기",
      "â† Back to Homepage": "← 홈으로 돌아가기",
      "Journal Papers": "저널 논문",
      "Conference Papers": "학회 논문",
      "Page Under Construction": "페이지 준비 중",
      "Proof of Published": "게재 증빙",
      "Competition Proof": "대회 증빙",
      "Capstone Report": "캡스톤 보고서",
      "Certification of Complete": "수료 증명",
      "Certification": "자격증",
      "Intern Proof (EN)": "인턴 증명 (영문)",
      "Intern Proof (CH)": "인턴 증명 (중문)",
      "Research Fields and Skills": "연구 분야 및 역량",
      "Core Domain": "핵심 분야",
      "Applied Domain": "응용 분야",
      "Emerging Track": "확장 분야",
      "Scope": "연구 범위",
      "Toolkit": "기술 도구",
      "Human Side": "소프트 역량",
      "Communication": "커뮤니케이션",
      "Research Areas": "연구 분야",
      "Technical Skills": "기술 역량",
      "Soft Skills": "소프트 스킬",
      "Language Skills": "언어 능력",
      "Visual SLAM": "비주얼 SLAM",
      "Digital IC Design": "디지털 IC 설계",
      "Artificial Intelligence": "인공지능",
      "Robotics": "로보틱스",
      "IC Design (Learning)": "IC 설계 (학습 중)",
      "Deep Learning": "딥러닝",
      "Visual Recognition": "시각 인식",
      "Agentic AI": "에이전틱 AI",
      "Explainable AI": "설명 가능한 AI",
      "LLMs": "대규모 언어 모델",
      "SLMs": "소형 언어 모델",
      "Robotic Manipulation": "로봇 조작",
      "Motion Planning": "동작 계획",
      "Digital Twin": "디지털 트윈",
      "Edge Computing": "엣지 컴퓨팅",
      "RISC-V Architecture": "RISC-V 아키텍처",
      "Edge AI": "엣지 AI",
      "Leadership": "리더십",
      "Project Management": "프로젝트 관리",
      "Cross-cultural Collaboration": "다문화 협업",
      "Technical Writing": "기술 문서 작성",
      "Mandarin": "중국어",
      "English": "영어",
      "Korean": "한국어",
      "Thai": "태국어",
      "GPA:": "평점:",
      "M.Sc. in Electrical Engineering": "전기공학 석사",
      "B.Sc. in Electrical Engineering": "전기공학 학사",
      "After-Class Activities Experience": "비교과 활동 경험",
      "Laboratory Management & Education Research Assistant": "연구실 운영 및 교육연구 조교",
      "Graduate Mentor": "대학원 멘토",
      "Teaching Assistant": "조교",
      "Member of Preparatory Committee for 2024 ROC Nationwide Celebration of Youth Day": "2024년 중화민국 전국 청년절 준비위원",
      "Chairman of Student Council": "학생회장",
      "Executive Secretary of Student Executive Center": "학생행정센터 집행비서",
      "International Volunteer": "국제 봉사단원",
      "Tutor of Digital Multiple Language Project": "디지털 다중언어 프로젝트 튜터",
      "Ministry of Education in Taiwan and": "대만 교육부 및",
      "2023 Google Digital Talent Program": "2023 Google 디지털 인재 프로그램",
      "2023 TalentNXT Program": "2023 TalentNXT 프로그램",
      "20th Seed Talent Program Graduation Certification": "제20기 Seed Talent 프로그램 수료 인증",
      "Incoming Equipment Engineer": "입사 예정 장비 엔지니어",
      "Summer Intern": "하계 인턴",
      "Intern Consultant": "인턴 컨설턴트",
      "Project Developer & Paper Author": "프로젝트 개발 및 논문 저자",
      "Project Developer & Paper Revise": "프로젝트 개발 및 논문 수정",
      "Paper Co-Author": "논문 공동저자",
      "Paper Co-Author (Responsible for Related Work)": "논문 공동저자 (관련 연구 담당)",
      "Hardware & ROS System Assemble": "하드웨어 및 ROS 시스템 조립",
      "ROS Code Developer & Image Model Building": "ROS 코드 개발 및 영상 모델 구축",
      "Assemble & Writing Report": "조립 및 보고서 작성",
      "Assemble & Writing Paper": "조립 및 논문 작성",
      "Code Developer & Writing Paper": "코드 개발 및 논문 작성",
      "Physics Calculating & Writing Paper": "물리 계산 및 논문 작성",
      "Team Leader & Project Assembler (AWS & Frontend)": "팀장 및 프로젝트 통합 (AWS/프론트엔드)",
      "Frontend Design (Chatbot Webpage)": "프론트엔드 디자인 (챗봇 웹페이지)",
      "Assistant of Android Studio Development": "Android Studio 개발 보조",
      "Assistant of AI-Glasses": "AI 안경 개발 보조",
      "Presenter": "발표자",
      "Paper":"논문",
      "Award": "수상",
      "Proof of Member":"회원 증명",
      "Proof of Volunteer":"자원봉사 증명서",
      "Proof of Participating":"참여 증명",
      "Proof of Chairman":"의장 증명",
      "Proof of Carde": "비서실장 증명",
      "Learn the skills of Google Cloud.": "Google Cloud 관련 기술을 학습함.",
      "Learn the skills of business thinking.": "비즈니스 사고 역량을 학습함.",
      "Learn the skills of being sales, product manager and manufactory.": "영업, 제품 관리자, 제조 분야 관련 역량을 학습함.",
      "Learn how to communicate and corporate with others.": "타인과 소통하고 협업하는 방법을 학습함.",
      "Participating in related work.": "관련 업무에 참여함.",
      "Complete the project of Bafang Yunji and Taiwan Care Charity Foundation CSR Project.": "Bafang Yunji 및 Taiwan Care Charity Foundation CSR 프로젝트를 완료함.",
      "Outstanding Graduate Award": "Outstanding Graduate Award",
      "Third Place of 2022 YZU Maker Competition Robot Fighting":"Third Place of 2022 YZU Maker Competition Robot Fighting",
      "This page is currently being updated with new content. Please check back soon!": "이 페이지는 현재 새 콘텐츠로 업데이트 중입니다. 곧 다시 확인해 주세요!",
      "Analyzed government AI policies and corporate digital transformation cases using the KPMG Connected Enterprise framework.": "KPMG Connected Enterprise 프레임워크를 활용해 정부 AI 정책과 기업 디지털 전환 사례를 분석함.",
      "Applied Trusted AI frameworks (LIT, SHAP) to financial data and corporate XAI cases.": "금융 데이터와 기업 XAI 사례에 Trusted AI 프레임워크(LIT, SHAP)를 적용함.",
      "Developed AI agent for remote computer control with AR glasses streaming via RTSP.": "RTSP 기반 AR 안경 스트리밍으로 원격 PC 제어를 수행하는 AI 에이전트를 개발함.",
      "Trained UR10 robotic arm models for singularity-aware motion planning.": "특이점 인식 모션 플래닝을 위한 UR10 로봇암 모델을 학습함.",
      "Research Assistant": "연구 조교",
      "Code":"소스 코드",
      "PPT":"슬라이드쇼",
      "Assisting with the project of medical system using AI technologies.": "AI 기술을 활용한 의료 시스템 프로젝트를 지원함.",
      "Exploring and doing research on new topic of IC Design, AI, and Robotics.": "IC 설계, AI, 로보틱스의 새로운 주제를 탐색하고 연구함.",
      "Managed IT infrastructure, social media, and provided technical support in Thai.": "IT 인프라와 소셜 미디어를 관리하고 태국어 기술 지원을 제공함.",
      "Focus on technical improvement for new process application and system hardware development.": "신공정 적용 및 시스템 하드웨어 개발의 기술 개선에 집중함.",
      "Publications: Conference paper accepted at TANET 2025 and NCS 2025.": "논문: TANET 2025 및 NCS 2025 학회 논문 채택.",
      "Assisted advisor in lab hardware management, competition organization, and coordination of research on robotics education.": "지도교수의 실험실 하드웨어 관리, 대회 운영, 로보틱스 교육 연구 조정 업무를 지원함.",
      "Supervised two undergraduate projects on robotic arm modeling and digital twin applications.": "로봇암 모델링 및 디지털 트윈 응용 관련 학부 프로젝트 2건을 지도함.",
      "Prepared three submissions to IEEE Transactions on Education.": "IEEE Transactions on Education에 3편을 투고 준비함.",
      "Resulted in publications at ICCE-TW 2025 and ICCR 2025": "ICCE-TW 2025 및 ICCR 2025 발표 성과로 이어짐.",
      "Supported data analysis, course design, and academic writing for studies on learning outcomes and scaffolding strategies.": "학습 성과 및 스캐폴딩 전략 연구를 위한 데이터 분석, 수업 설계, 학술 작성 업무를 지원함.",
      "Assisting of holding youth day event.": "청년의 날 행사 운영을 지원함.",
      "Promoting the event.": "행사 홍보를 수행함.",
      "Teaching English and holding events with Chinese cultures.": "영어를 가르치고 중국 문화 관련 행사를 진행함.",
      "Teaching coding and IT skills.": "코딩 및 IT 기술을 교육함.",
      "Making 14 weeks tutoring plans.": "14주 튜터링 계획을 수립함.",
      "Teaching English to kids in remote areas.": "원격 지역 아동에게 영어를 교육함.",
      "Manage student council and being the chair in each meeting.": "학생회를 운영하고 각 회의를 주재함.",
      "Supervising the student executive center and review the budget of whole association.": "학생집행센터를 감독하고 전체 학생자치회 예산을 검토함.",
      "Assisting president of managing whole association.": "회장을 보좌해 학생자치회 전반을 운영함.",
      "Reviewing the procedure of holding events.": "행사 운영 절차를 검토함.",
      "Responsible for manufacture equipment improvements.": "제조 장비 개선을 담당함.",
      "Assist to benchmark and formalize production tool roadmap.": "벤치마킹 및 생산 도구 로드맵 수립 지원.",
      "Repaired machines and designed factory fixtures.": "장비 수리 및 공장 지그 설계 수행.",
      "TSMC": "TSMC",
      "ETC": "ETC",
      "National Center for High-Performance Computing, Taiwan": "National Center for High-Performance Computing, 대만",
      "Division of Management": "경영 부문",
      "KPMG Taiwan | T Ambassador Program": "KPMG 대만 | T Ambassador Program",
      "Division of Virtual-Real Integration and Digital Twins": "가상-현실 통합 및 디지털 트윈 부문",
      "Digital Transformation Group, Division of Consulting": "컨설팅본부 디지털 전환 그룹",
      "Yuan Ze University, Taiwan": "원제대학교, 대만",
      "Innovative Technology Lab": "혁신기술연구실",
      "Human-Computer Interaction Multimedia Lab": "인간-컴퓨터 상호작용 멀티미디어 연구실",
      "Taiwan": "대만",
      "Thailand": "태국",
      "Lab:": "연구실:"
    },
    th: {
      "Back to Research": "กลับไปหน้าวิจัย",
      "â† Back to Research": "← กลับไปหน้าวิจัย",
      "â† Back to Research": "← กลับไปหน้าวิจัย",
      "Mentor": "ที่ปรึกษา",
      "Advisor": "อาจารย์ที่ปรึกษา",
      "Team": "ทีม",
      "Abstract": "บทคัดย่อ",
      "Project Page": "หน้าโครงการ",
      "Internship": "ฝึกงาน",
      "Competition": "การแข่งขัน",
      "Master Research": "วิจัยระดับปริญญาโท",
      "Undergraduate Capstone": "โครงงานปริญญาตรี",
      "Back to Homepage": "กลับไปหน้าแรก",
      "â† Back to Homepage": "← กลับไปหน้าแรก",
      "Journal Papers": "บทความวารสาร",
      "Conference Papers": "บทความประชุมวิชาการ",
      "Page Under Construction": "หน้ากำลังก่อสร้าง",
      "Proof of Published": "หลักฐานการตีพิมพ์",
      "Competition Proof": "หลักฐานการแข่งขัน",
      "Capstone Report": "รายงานโปรเจกต์จบ",
      "Certification of Complete": "ใบรับรองการจบหลักสูตร",
      "and":"และ",
      "Proof of Member":"หลักฐานการเป็นสมาชิก",
      "Proof of Volunteer":"หลักฐานการเป็นอาสาสมัคร",
      "Proof of Participating":"หลักฐานการเข้าร่วม",
      "Proof of Chairman":"หลักฐานการประชุมสภา",
      "Proof of Carde": "หลักฐานการจดแจ้ง",
      "Certification": "ใบรับรอง",
      "Intern Proof (EN)": "เอกสารฝึกงาน (อังกฤษ)",
      "Intern Proof (CH)": "เอกสารฝึกงาน (จีน)",
      "Research Fields and Skills": "สาขาวิจัยและทักษะ",
      "Core Domain": "โดเมนหลัก",
      "Applied Domain": "โดเมนประยุกต์",
      "Emerging Track": "เส้นทางที่กำลังพัฒนา",
      "Scope": "ขอบเขต",
      "Toolkit": "ชุดเครื่องมือ",
      "Human Side": "ทักษะด้านมนุษยสัมพันธ์",
      "Communication": "การสื่อสาร",
      "Research Areas": "หัวข้อวิจัย",
      "Technical Skills": "ทักษะทางเทคนิค",
      "Soft Skills": "ทักษะด้านอ่อน",
      "Language Skills": "ทักษะภาษา",
      "Visual SLAM": "วิชวล SLAM",
      "Digital IC Design": "การออกแบบดิจิทัล IC",
      "Artificial Intelligence": "ปัญญาประดิษฐ์",
      "Robotics": "หุ่นยนต์",
      "Paper":"บทความวิจัย",
      "IC Design (Learning)": "การออกแบบ IC (กำลังเรียนรู้)",
      "Deep Learning": "การเรียนรู้เชิงลึก",
      "Visual Recognition": "การรู้จำภาพ",
      "Agentic AI": "AI แบบเอเจนต์",
      "Explainable AI": "AI ที่อธิบายได้",
      "LLMs": "โมเดลภาษาขนาดใหญ่",
      "SLMs": "โมเดลภาษาขนาดเล็ก",
      "Robotic Manipulation": "การควบคุมหุ่นยนต์",
      "Motion Planning": "การวางแผนการเคลื่อนที่",
      "Digital Twin": "ดิจิทัลทวิน",
      "Edge Computing": "เอดจ์คอมพิวติ้ง",
      "RISC-V Architecture": "สถาปัตยกรรม RISC-V",
      "Edge AI": "เอดจ์ AI",
      "Leadership": "ภาวะผู้นำ",
      "Project Management": "การบริหารโครงการ",
      "Cross-cultural Collaboration": "ความร่วมมือข้ามวัฒนธรรม",
      "Technical Writing": "การเขียนเชิงเทคนิค",
      "Mandarin": "ภาษาจีนกลาง",
      "English": "ภาษาอังกฤษ",
      "Korean": "ภาษาเกาหลี",
      "Thai": "ภาษาไทย",
      "GPA:": "เกรดเฉลี่ย:",
      "M.Sc. in Electrical Engineering": "วิศวกรรมไฟฟ้า (ปริญญาโท)",
      "B.Sc. in Electrical Engineering": "วิศวกรรมไฟฟ้า (ปริญญาตรี)",
      "After-Class Activities Experience": "ประสบการณ์กิจกรรมนอกชั้นเรียน",
      "Laboratory Management & Education Research Assistant": "ผู้ช่วยวิจัยด้านการจัดการห้องปฏิบัติการและการศึกษา",
      "Graduate Mentor": "พี่เลี้ยงบัณฑิตศึกษา",
      "Teaching Assistant": "ผู้ช่วยสอน",
      "Member of Preparatory Committee for 2024 ROC Nationwide Celebration of Youth Day": "กรรมการเตรียมงานวันเยาวชนแห่งชาติ ROC ปี 2024",
      "Chairman of Student Council": "ประธานสภานักศึกษา",
      "Executive Secretary of Student Executive Center": "เลขานุการบริหารศูนย์บริหารนักศึกษา",
      "International Volunteer": "อาสาสมัครนานาชาติ",
      "Tutor of Digital Multiple Language Project": "ติวเตอร์โครงการดิจิทัลพหุภาษา",
      "Ministry of Education in Taiwan and": "กระทรวงศึกษาธิการ และ",
      "2023 Google Digital Talent Program": "โครงการ Google Digital Talent ปี 2023",
      "2023 TalentNXT Program": "โครงการ TalentNXT ปี 2023",
      "20th Seed Talent Program Graduation Certification": "ใบรับรองจบหลักสูตร Seed Talent รุ่นที่ 20",
      "Incoming Equipment Engineer": "ว่าที่วิศวกรอุปกรณ์",
      "Summer Intern": "นักศึกษาฝึกงานภาคฤดูร้อน",
      "Intern Consultant": "ที่ปรึกษาฝึกงาน",
      "Project Developer & Paper Author": "ผู้พัฒนาโครงการและผู้เขียนบทความ",
      "Project Developer & Paper Revise": "ผู้พัฒนาโครงการและปรับแก้บทความ",
      "Paper Co-Author": "ผู้เขียนร่วม",
      "Paper Co-Author (Responsible for Related Work)": "ผู้เขียนร่วม (รับผิดชอบงานที่เกี่ยวข้อง)",
      "Hardware & ROS System Assemble": "ประกอบฮาร์ดแวร์และระบบ ROS",
      "ROS Code Developer & Image Model Building": "พัฒนาโค้ด ROS และสร้างโมเดลภาพ",
      "Assemble & Writing Report": "ประกอบระบบและเขียนรายงาน",
      "Assemble & Writing Paper": "ประกอบระบบและเขียนบทความ",
      "Code Developer & Writing Paper": "พัฒนาโค้ดและเขียนบทความ",
      "Physics Calculating & Writing Paper": "คำนวณฟิสิกส์และเขียนบทความ",
      "Team Leader & Project Assembler (AWS & Frontend)": "หัวหน้าทีมและผู้รวมโครงการ (AWS และ Frontend)",
      "Frontend Design (Chatbot Webpage)": "ออกแบบส่วนหน้า (หน้าเว็บแชตบอต)",
      "Assistant of Android Studio Development": "ผู้ช่วยพัฒนา Android Studio",
      "Assistant of AI-Glasses": "ผู้ช่วยพัฒนาแว่น AI",
      "Presenter": "ผู้นำเสนอ",
      "Award": "รางวัล",
      "Code":"รหัสต้นทาง",
      "PPT":" สไลด์",
      "Learn the skills of Google Cloud.": "เรียนรู้ทักษะด้าน Google Cloud",
      "Learn the skills of business thinking.": "เรียนรู้ทักษะการคิดเชิงธุรกิจ",
      "Learn the skills of being sales, product manager and manufactory.": "เรียนรู้ทักษะด้านการขาย ผู้จัดการผลิตภัณฑ์ และการผลิต",
      "Learn how to communicate and corporate with others.": "เรียนรู้การสื่อสารและทำงานร่วมกับผู้อื่น",
      "Participating in related work.": "มีส่วนร่วมในงานที่เกี่ยวข้อง",
      "Complete the project of Bafang Yunji and Taiwan Care Charity Foundation CSR Project.": "ดำเนินโครงการ Bafang Yunji และ Taiwan Care Charity Foundation CSR จนสำเร็จ",
      "Outstanding Graduate Award": "Outstanding Graduate Award",
      "Third Place of 2022 YZU Maker Competition Robot Fighting":"Third Place of 2022 YZU Maker Competition Robot Fighting",
      "This page is currently being updated with new content. Please check back soon!": "หน้านี้กำลังอัปเดตเนื้อหาใหม่ โปรดกลับมาตรวจสอบอีกครั้งเร็ว ๆ นี้!",
      "Analyzed government AI policies and corporate digital transformation cases using the KPMG Connected Enterprise framework.": "วิเคราะห์นโยบาย AI ภาครัฐและกรณีการเปลี่ยนผ่านสู่ดิจิทัลขององค์กรด้วยกรอบ KPMG Connected Enterprise",
      "Applied Trusted AI frameworks (LIT, SHAP) to financial data and corporate XAI cases.": "ประยุกต์ใช้เฟรมเวิร์ก Trusted AI (LIT, SHAP) กับข้อมูลการเงินและกรณี XAI ขององค์กร",
      "Developed AI agent for remote computer control with AR glasses streaming via RTSP.": "พัฒนา AI agent สำหรับควบคุมคอมพิวเตอร์ระยะไกลผ่านการสตรีม RTSP บนแว่น AR",
      "Trained UR10 robotic arm models for singularity-aware motion planning.": "ฝึกโมเดลแขนกล UR10 เพื่อวางแผนการเคลื่อนไหวที่คำนึงถึง singularity",
      "Research Assistant": "ผู้ช่วยวิจัย",
      "Assisting with the project of medical system using AI technologies.": "สนับสนุนโครงการพัฒนาระบบการแพทย์โดยใช้เทคโนโลยี AI",
      "Exploring and doing research on new topic of IC Design, AI, and Robotics.": "สำรวจและวิจัยหัวข้อใหม่ด้านการออกแบบ IC, AI และหุ่นยนต์",
      "Managed IT infrastructure, social media, and provided technical support in Thai.": "ดูแลโครงสร้างพื้นฐาน IT โซเชียลมีเดีย และให้การสนับสนุนทางเทคนิคภาษาไทย",
      "Focus on technical improvement for new process application and system hardware development.": "มุ่งเน้นการปรับปรุงเทคนิคสำหรับการประยุกต์ใช้กระบวนการใหม่และการพัฒนาฮาร์ดแวร์ระบบ",
      "Publications: Conference paper accepted at TANET 2025 and NCS 2025.": "ผลงานตีพิมพ์: บทความได้รับการตอบรับใน TANET 2025 และ NCS 2025",
      "Assisted advisor in lab hardware management, competition organization, and coordination of research on robotics education.": "สนับสนุนอาจารย์ที่ปรึกษาในการจัดการฮาร์ดแวร์ห้องปฏิบัติการ การจัดการแข่งขัน และการประสานงานงานวิจัยด้านการศึกษาหุ่นยนต์",
      "Supervised two undergraduate projects on robotic arm modeling and digital twin applications.": "ดูแลโครงงานระดับปริญญาตรี 2 โครงการด้านการสร้างแบบจำลองแขนกลและการประยุกต์ใช้ดิจิทัลทวิน",
      "Prepared three submissions to IEEE Transactions on Education.": "จัดเตรียมบทความส่ง 3 ฉบับไปยัง IEEE Transactions on Education",
      "Resulted in publications at ICCE-TW 2025 and ICCR 2025": "นำไปสู่การตีพิมพ์ใน ICCE-TW 2025 และ ICCR 2025",
      "Supported data analysis, course design, and academic writing for studies on learning outcomes and scaffolding strategies.": "สนับสนุนการวิเคราะห์ข้อมูล การออกแบบรายวิชา และการเขียนเชิงวิชาการสำหรับงานวิจัยด้านผลลัพธ์การเรียนรู้และกลยุทธ์การค้ำจุนการเรียนรู้",
      "Assisting of holding youth day event.": "ช่วยจัดกิจกรรมวันเยาวชน",
      "Promoting the event.": "ประชาสัมพันธ์กิจกรรม",
      "Teaching English and holding events with Chinese cultures.": "สอนภาษาอังกฤษและจัดกิจกรรมวัฒนธรรมจีน",
      "Teaching coding and IT skills.": "สอนการเขียนโค้ดและทักษะด้านไอที",
      "Making 14 weeks tutoring plans.": "จัดทำแผนการสอนพิเศษ 14 สัปดาห์",
      "Teaching English to kids in remote areas.": "สอนภาษาอังกฤษให้เด็กในพื้นที่ห่างไกล",
      "Manage student council and being the chair in each meeting.": "บริหารสภานักศึกษาและทำหน้าที่ประธานในการประชุมแต่ละครั้ง",
      "Supervising the student executive center and review the budget of whole association.": "กำกับศูนย์บริหารนักศึกษาและทบทวนงบประมาณของสมาคมทั้งหมด",
      "Assisting president of managing whole association.": "ช่วยประธานในการบริหารสมาคมทั้งหมด",
      "Reviewing the procedure of holding events.": "ทบทวนขั้นตอนการจัดกิจกรรม",
      "Responsible for manufacture equipment improvements.": "รับผิดชอบการปรับปรุงอุปกรณ์การผลิต",
      "Assist to benchmark and formalize production tool roadmap.": "ช่วยทำ benchmarking และจัดทำแผนเครื่องมือการผลิต",
      "Repaired machines and designed factory fixtures.": "ซ่อมเครื่องจักรและออกแบบฟิกซ์เจอร์โรงงาน",
      "TSMC": "TSMC",
      "ETC": "ETC",
      "National Center for High-Performance Computing, Taiwan": "National Center for High-Performance Computing, ไต้หวัน",
      "Division of Management": "ฝ่ายบริหาร",
      "KPMG Taiwan | T Ambassador Program": "KPMG ไต้หวัน | T Ambassador Program",
      "Division of Virtual-Real Integration and Digital Twins": "แผนกบูรณาการเสมือนจริงและดิจิทัลทวิน",
      "Digital Transformation Group, Division of Consulting": "กลุ่มดิจิทัลทรานส์ฟอร์เมชัน ฝ่ายที่ปรึกษา",
      "Ta Chou Industry": "บริษัท ต้าโจว อินดัสทรี",
      "Ta Chou Industry, Thailand": "บริษัท ต้าโจว อินดัสทรี, ประเทศไทย",
      "Ta Thong Chinese School": "โรงเรียนจีนต้าถงวิทยาคม",
      "Ta Thong Chinese School, Thailand": "โรงเรียนจีนต้าถงวิทยาคม, ประเทศไทย",
      "Yuan Ze University, Taiwan": "มหาวิทยาลัยหยวนจื้อ, ไต้หวัน",
      "Innovative Technology Lab": "ห้องปฏิบัติการเทคโนโลยีนวัตกรรม",
      "Human-Computer Interaction Multimedia Lab": "ห้องปฏิบัติการปฏิสัมพันธ์มนุษย์-คอมพิวเตอร์และมัลติมีเดีย",
      "Taiwan": "ไต้หวัน",
      "Thailand": "ประเทศไทย",
      "Lab:": "ห้องปฏิบัติการ:"
    }
  };

  const CHINESE_ONLY_STATIC_KEYS = new Set([
    "Robotics (EEB593)",
    "Robot Operating System (EEB335/ME382)",
    "Robotic Navigation and Exploration (AI504)",
    "Introduction to Computer Vision and Image Processing (EEB215)",
    "Introduction to Computer Science (EI105/EEB108)",
    "Data Structures (EI219)",
    "Fundamental Computer Programming-C (CP119)",
    "Digital System Design with Lab (EEB318)",
    "Fundamental Computer Programming-Python (CP109)"
  ]);

  const DICT = {
    en: {
      "lang.menu": "EN",
      "index.name.bold": "Kyle Chen",
      "index.name.sub": "Sheng-Kai Chen",
      "index.name.alt": "진승개、เฉิน เซิงไค、陳嵊凱",
      "nav.about": "About",
      "nav.research": "Research",
      "nav.experience": "Experience",
      "nav.work": "Work",
      "nav.cv": "CV",
      "project.back": "← Back to Research",

      "index.exp": "Work Experience",
      "index.tsmc.position": "Incoming Equipment Engineer",
      "index.tsmc.company": "TSMC",
      "index.tsmc.division": "ETC",
      "index.tsmc.type": "Full-Time",
      "index.yzu.position": "Research Assistant",
      "index.yzu.company": "Yuan Ze University",
      "index.yzu.division": "AI Medical System Project",
      "index.yzu.type": "Part-Time",
      "index.nchc.position": "Summer Intern",
      "index.nchc.company": "National Center for High-Performance Computing, Taiwan",
      "index.nchc.division": "Division of Virtual-Real Integration and Digital Twins",
      "index.current": "Present",
      "index.present": "Start From 4/29",
      "index.past": "Past",
      "index.intro.title": "Exploring New Ideas and Bringing Them to Practical Application",
      "index.intro.body": "My name is Kyle, and I am a researcher which focuses on Visual SLAM, robotic manipulation, explainable AI systems, and digital IC design. Also, I will work in the semiconductor industry in the future.",
      "index.chip.robotics": "Robotics",
      "index.chip.ai": "AI",
      "index.chip.ic": "Digital IC Design",
      "index.quote": "Have courage to do everything, or it will never come true. Try my best to achieve more.",

      "about.eyebrow": "About",
      "about.title": "Who I am",
      "about.lead": "I'm a graduate student at Yuan Ze University pursuing a M.Sc. in Electrical Engineering. My research focuses on building intelligent, transparent, and safety-aware robotic systems that integrate visual perception, motion planning, and explainable AI.",
      "about.edu": "Education",
      "about.interests": "Research Interests",

      "research.eyebrow": "Research",
      "research.title": "Work and publications",
      "research.lead": "My research focuses on visual SLAM, robotic manipulation, and explainable AI systems. Below are my current projects and recent publications.",
      "research.projects": "Research Projects",
      "research.pubs": "Selected Publications",
      "research.journal": "Journal Papers",
      "research.conference": "Conference Papers",
      "research.proj.ai_glasses.title": "AI-Glasses Embedded with Agentic AI System",
      "research.proj.ai_glasses.body": "Building AI-Glasses embedded with an agentic AI system to enhance user interaction and experience through advanced perception and decision-making capabilities.",
      "research.proj.ur_arm.title": "Robotic Arm Motion Planning Avoiding Singularity",
      "research.proj.ur_arm.body": "Developed motion planning algorithms for robotic arms to avoid singularity issues, enhancing stability and precision in complex tasks. Implemented solutions leveraging advanced kinematics and real-time obstacle detection.",
      "research.proj.aws_hack.title": "Stainless Steel International Standards AI Assistant System",
      "research.proj.aws_hack.body": "An AWS-based intelligent system designed to assist technical personnel at Walsin Lihwa Corporation with questions related to international standards for stainless steel. The system leverages AI technologies to provide professional standard queries, standard comparisons, and document analysis services, automatically adjusting response complexity based on user expertise.",
      "research.proj.explain_arm.title": "Explainable System for Inverse Kinematics",
      "research.proj.explain_arm.body": "Proposed explainable IK framework integrating SHAP and InterpretML. Designed Improved IKNet and Focused IKNet with balanced feature attribution and enhanced obstacle-avoidance stability.",
      "research.proj.iknet.title": "iKnet Model Improvements for Low Computing Resource Environments",
      "research.proj.iknet.body": "Rebuild iKnet models to optimize performance in environments with limited computing resources, focusing on efficiency and accuracy improvements.",
      "research.proj.ggcnn.title": "GGCNN Model Improvements for Low Computing Resource Environments",
      "research.proj.ggcnn.body": "Rebuild GGCNN models to optimize performance in environments with limited computing resources, focusing on efficiency and accuracy improvements.",
      "research.proj.pcr_orb.title": "Enhanced ORB-SLAM3 with Point-Cloud Refinement",
      "research.proj.pcr_orb.body": "Integrated YOLOv8-based dynamic filtering and CUDA-accelerated point cloud refinement. Achieved 25.9% reduction in ATE RMSE and 30.4% improvement in trajectory accuracy on KITTI dataset.",
      "research.proj.golf.title": "Golf Swing Phenomena Analysis",
      "research.proj.golf.body": "Developed computer vision system for club and posture tracking using OpenCV, YOLO, and MediaPipe. Applied Lagrangian mechanics to model swing dynamics.",
      "research.proj.auto_mobile.title": "Omni-bearing Autonomous Mobile Manipulator",
      "research.proj.auto_mobile.body": "Built autonomous mobile robot integrating LiDAR, depth camera, and robotic arm under ROS2. Implemented SLAM navigation and vision-based elevator control.",
      "project.ai_glasses.abstract": "This research presents an AI glasses system integrating real-time voice processing, dual-agent orchestration, and cross-network streaming. Agent 01 performs speech recognition and device control, while Agent 02 handles language reasoning and response generation. The system improves interaction quality and demonstrates practical deployment for daily assistive use.",
      "project.auto_mobile.abstract": "This project develops an autonomous mobile manipulator by combining ROS-based localization, mapping, and navigation with robotic arm operation. The platform integrates LiDAR, depth sensing, and vision modules to execute indoor tasks such as elevator button detection and pressing. The result validates safe and reliable autonomy for real-world service scenarios.",
      "project.aws_hack.abstract": "This work builds an AWS-based AI assistant for stainless-steel international standards. The system supports standard lookup, cross-standard comparison, and document analysis, and adapts response depth to different user expertise levels. It improves the efficiency and consistency of technical decision-making in industrial workflows.",
      "project.explain_arm.abstract": "This study proposes an explainable inverse-kinematics workflow that combines SHAP and InterpretML with neural IK models. Improved IKNet and Focused IKNet are designed to balance inference speed, accuracy, and feature-level interpretability. The framework supports responsible AI requirements while maintaining robust obstacle-avoidance behavior.",
      "project.ggcnn.abstract": "This project compresses GGCNN for resource-constrained robotic grasping via knowledge distillation. Two lightweight student models are developed to reduce model size and inference time while preserving grasp quality. Results show strong real-time performance gains with minimal accuracy loss, making deployment on edge devices practical.",
      "project.golf.abstract": "This research analyzes golf swing phenomena with computer vision and mechanics-based modeling. OpenCV, YOLO, and MediaPipe are used to track posture, club, and clubhead movement across swing phases. A Lagrangian dynamics framework is then applied to explain motion patterns and support training feedback.",
      "project.iknet.abstract": "This study improves IKNet for embedded inverse-kinematics applications under limited compute resources. Two variants, Improved IKNet and Focused IKNet, are evaluated against the original model on CPU and GPU settings. The proposed models deliver better memory efficiency and inference speed while maintaining competitive accuracy.",
      "project.pcr_orb.abstract": "This work presents PCR-ORB, an enhanced ORB-SLAM3 framework for dynamic environments. It integrates YOLOv8-based dynamic-object filtering and point-cloud refinement to improve tracking and map consistency. Experiments report notable gains in trajectory accuracy and reduced localization error on benchmark datasets.",
      "project.ur_arm.abstract": "This research addresses UR10 singularity avoidance by combining fuzzy safety logic with learning-based motion planning. The system detects high-risk kinematic regions and adjusts trajectories to preserve stability and control quality. Experimental results show safer and smoother arm operation in complex manipulation tasks.",

      "exp.eyebrow": "Experience",
      "exp.title": "Academic and Other Experience",
      "exp.lead": "My professional journey spans research, mentoring, and leadership in academia and industry.",
      "exp.academic": "Academic Experience",
      "exp.afterclass": "After-Class Activities Experience",
      "exp.talent": "Talent Program",
      "exp.award": "Award",
      "exp.cert": "Certification",

      "work.eyebrow": "Work",
      "work.title": "Work Experience",
      "work.lead": "This page highlights my industry experience including full-time and internship responsibilities.",
      "work.full": "Work Experience",
      "work.intern": "Internship Experience",
      "work.tsmc.date": "Apr 2026 - (Start From 4/29)",
      "work.tsmc.type": "Full-Time",
      "work.yzu.date": "Jan 2026 -",
      "work.yzu.type": "Part-Time",
      "work.yzu.company": "Yuan Ze University",

      "cv.eyebrow": "CV",
      "cv.title": "Get the full story",
      "cv.lead": "View my comprehensive curriculum vitae for detailed information about my education, research, publications, and professional experience.",
      "cv.en": "View CV (English)",
      "cv.zh": "View CV (Chinese)",

      "footer.designed": "Designed by Kyle Chen",
      "footer.rights": "All Rights Reserved"
    },
    zh: {
      "lang.menu": "中文",
      "index.name.bold": "陳嵊凱",
      "index.name.sub": "Sheng-Kai Chen (Kyle Chen)",
      "index.name.alt": "진승개、เฉิน เซิงไค",
      "nav.about": "關於",
      "nav.research": "研究",
      "nav.experience": "經歷",
      "nav.work": "工作",
      "nav.cv": "履歷",
      "project.back": "← 返回研究頁",

      "index.exp": "工作經驗",
      "index.tsmc.position": "未來新進設備工程師",
      "index.tsmc.company": "台灣積體電路製造股份有限公司 (台積電)",
      "index.tsmc.division": "蝕刻工程部",
      "index.tsmc.type": "全職",
      "index.yzu.position": "研究助理",
      "index.yzu.company": "元智大學",
      "index.yzu.division": "AI 醫療系統專案",
      "index.yzu.type": "兼職",
      "index.nchc.position": "暑期實習生",
      "index.nchc.company": "國家高速網路與計算中心（臺灣）",
      "index.nchc.division": "虛實整合與數位孿生組",
      "index.current": "至今",
      "index.present": "4/29 起",
      "index.past": "過往",
      "index.intro.title": "探索新想法並落實於實務應用",
      "index.intro.body": "我是嵊凱，研究重點為 Visual SLAM、機器人操作、可解釋 AI 系統與數位 IC 設計，未來也將投入半導體產業。",
      "index.chip.robotics": "機器人",
      "index.chip.ai": "AI",
      "index.chip.ic": "數位 IC 設計",
      "index.quote": "要有勇氣去做每件事，否則永遠不會實現；盡全力做到更好。",

      "about.eyebrow": "關於",
      "about.title": "關於我",
      "about.lead": "我目前就讀元智大學電機工程碩士班。研究聚焦於建構智慧、透明且安全導向的機器人系統，整合視覺感知、運動規劃與可解釋 AI。",
      "about.edu": "學歷",
      "about.interests": "研究興趣",

      "research.eyebrow": "研究",
      "research.title": "作品與發表",
      "research.lead": "我的研究主軸為 Visual SLAM、機器人操作與可解釋 AI 系統。以下為目前研究專案與近期發表。",
      "research.projects": "研究專案",
      "research.pubs": "論文發表",
      "research.journal": "期刊論文",
      "research.conference": "研討會論文",
      "research.proj.ai_glasses.title": "嵌入代理式 AI 系統的智慧眼鏡",
      "research.proj.ai_glasses.body": "建置嵌入代理式 AI 系統的智慧眼鏡，透過進階感知與決策能力提升互動體驗。",
      "research.proj.ur_arm.title": "機械手臂避奇異點運動規劃",
      "research.proj.ur_arm.body": "開發機械手臂運動規劃演算法以避免奇異點問題，提升複雜任務下的穩定性與精準度，並結合進階運動學與即時障礙偵測。",
      "research.proj.aws_hack.title": "不鏽鋼國際標準 AI 助理系統",
      "research.proj.aws_hack.body": "以 AWS 為基礎打造智慧系統，協助華新麗華技術人員處理不鏽鋼國際標準相關問題，提供專業查詢、標準比對與文件分析，並依使用者程度自動調整回應。",
      "research.proj.explain_arm.title": "可解釋逆向運動學系統",
      "research.proj.explain_arm.body": "提出整合 SHAP 與 InterpretML 的可解釋 IK 架構，設計 Improved IKNet 與 Focused IKNet，在特徵歸因與避障穩定性間取得平衡。",
      "research.proj.iknet.title": "低資源環境之 iKnet 模型優化",
      "research.proj.iknet.body": "重建 iKnet 模型以優化低運算資源環境下的效能，聚焦效率與準確度提升。",
      "research.proj.ggcnn.title": "低資源環境之 GGCNN 模型優化",
      "research.proj.ggcnn.body": "重建 GGCNN 模型以優化低運算資源環境下的效能，聚焦效率與準確度提升。",
      "research.proj.pcr_orb.title": "強化 ORB-SLAM3 與點雲精煉",
      "research.proj.pcr_orb.body": "整合 YOLOv8 動態物件過濾與 CUDA 加速點雲精煉，在 KITTI 資料集達成 ATE RMSE 下降 25.9% 與軌跡精度提升 30.4%。",
      "research.proj.golf.title": "高爾夫揮桿現象分析",
      "research.proj.golf.body": "使用 OpenCV、YOLO 與 MediaPipe 開發球桿與姿態追蹤系統，並以拉格朗日力學建立揮桿動態模型。",
      "research.proj.auto_mobile.title": "全向自主移動機械手臂",
      "research.proj.auto_mobile.body": "在 ROS2 下整合 LiDAR、深度相機與機械手臂，建置自主移動機器人並實作 SLAM 導航與視覺電梯按鍵控制。",
      "project.ai_glasses.abstract": "本研究提出一套整合即時語音處理、雙代理協作與跨網路串流的智慧眼鏡系統。Agent 01 負責語音辨識與裝置控制，Agent 02 負責語言推理與回應生成。系統提升人機互動品質，並驗證其在日常輔助情境中的落地可行性。",
      "project.auto_mobile.abstract": "本專案建置一台自主移動機械手臂平台，整合 ROS 定位、建圖、導航與機械手臂控制。系統融合 LiDAR、深度感測與視覺模組，可執行電梯按鍵辨識與按壓等室內任務。成果驗證其於真實服務場域中的安全性與可靠性。",
      "project.aws_hack.abstract": "本研究打造一套以 AWS 為基礎的不鏽鋼國際標準 AI 助理系統。系統支援標準查詢、跨標準比較與文件分析，並可依使用者專業程度調整回覆深度。可有效提升產業流程中的技術判讀效率與一致性。",
      "project.explain_arm.abstract": "本研究提出結合 SHAP 與 InterpretML 的可解釋逆向運動學流程。透過 Improved IKNet 與 Focused IKNet，在推論速度、準確度與特徵可解釋性間取得平衡。此框架在維持避障穩定性的同時，更符合負責任 AI 的透明性需求。",
      "project.ggcnn.abstract": "本研究以知識蒸餾方法壓縮 GGCNN，使其可部署於低資源抓取場景。提出兩種輕量學生模型，在維持抓取品質下顯著降低模型大小與推論時間。實驗顯示可在邊緣裝置上達成更佳即時效能。",
      "project.golf.abstract": "本研究結合電腦視覺與力學模型分析高爾夫揮桿現象。透過 OpenCV、YOLO 與 MediaPipe 追蹤姿態、球桿與桿頭在各揮桿階段的變化，並以拉格朗日動力學解釋其運動規律。可作為訓練回饋與技術優化依據。",
      "project.iknet.abstract": "本研究針對嵌入式逆向運動學應用，優化 IKNet 在低運算資源環境下的效能。提出 Improved IKNet 與 Focused IKNet，並於 CPU/GPU 條件下與原始模型比較。結果顯示在維持準確度下，記憶體效率與推論速度皆明顯提升。",
      "project.pcr_orb.abstract": "本研究提出 PCR-ORB，以強化 ORB-SLAM3 在動態場景中的定位與建圖能力。方法整合 YOLOv8 動態物件過濾與點雲精煉，提升追蹤穩定度與地圖一致性。實驗在基準資料集上顯示軌跡精度提升與定位誤差下降。",
      "project.ur_arm.abstract": "本研究結合模糊安全邏輯與學習式運動規劃，解決 UR10 在奇異點附近的控制風險。系統可偵測高風險運動學區域並調整軌跡，以維持操作穩定與控制品質。實驗結果顯示於複雜操作任務中可達到更安全且平順的運動表現。",

      "exp.eyebrow": "經歷",
      "exp.title": "學術與其他經歷",
      "exp.lead": "我的經歷橫跨研究、指導與學研產領域的領導實務。",
      "exp.academic": "學術經歷",
      "exp.afterclass": "課外活動經歷",
      "exp.talent": "人才培訓計畫",
      "exp.award": "獎項",
      "exp.cert": "證照",

      "work.eyebrow": "工作",
      "work.title": "工作經驗",
      "work.lead": "本頁整理我的產業經驗，包含正職與實習職務內容。",
      "work.full": "工作經驗",
      "work.intern": "實習經驗",
      "work.tsmc.date": "民國115年4月 -（4/29 起）",
      "work.tsmc.type": "全職",
      "work.yzu.date": "民國115年1月 -",
      "work.yzu.type": "兼職",
      "work.yzu.company": "元智大學",

      "cv.eyebrow": "履歷",
      "cv.title": "完整履歷",
      "cv.lead": "查看我的完整履歷，了解教育背景、研究、發表與工作經驗。",
      "cv.en": "查看英文履歷",
      "cv.zh": "查看中文履歷",

      "footer.designed": "網頁由Kyle Chen設計",
      "footer.rights": "版權所有"
    },
    ko: {
      "lang.menu": "한국어",
      "index.name.bold": "진승개",
      "index.name.sub": "Sheng-Kai Chen (Kyle Chen)",
      "index.name.alt": "陳嵊凱、เฉิน เซิงไค",
      "nav.about": "소개",
      "nav.research": "연구",
      "nav.experience": "경험",
      "nav.work": "직무",
      "nav.cv": "이력서",
      "project.back": "← 연구로 돌아가기",

      "index.exp": "직무 경험",
      "index.tsmc.position": "입사 예정 장비 엔지니어",
      "index.tsmc.company": "TSMC",
      "index.tsmc.division": "ETC",
      "index.tsmc.type": "정규직",
      "index.yzu.position": "연구 조교",
      "index.yzu.company": "Yuan Ze University",
      "index.yzu.division": "AI 의료 시스템 프로젝트",
      "index.yzu.type": "파트타임",
      "index.nchc.position": "하계 인턴",
      "index.nchc.company": "National Center for High-Performance Computing, 대만",
      "index.nchc.division": "가상-현실 통합 및 디지털 트윈 부문",
      "index.current": "현재",
      "index.present": "4/29부터 시작",
      "index.past": "과거",
      "index.intro.title": "새로운 아이디어를 탐구하고 실무에 적용",
      "index.intro.body": "저는 진승개이며 Visual SLAM, 로봇 매니퓰레이션, 설명 가능한 AI 시스템, 디지털 IC 설계를 연구합니다. 앞으로 반도체 산업에서 일할 예정입니다.",
      "index.chip.robotics": "로보틱스",
      "index.chip.ai": "AI",
      "index.chip.ic": "디지털 IC 설계",
      "index.quote": "노력은 배신하지 않아요. 그런데 노력을 사랑하지 않으면 배신당할 수도 있어요.",

      "about.eyebrow": "소개",
      "about.title": "나는 누구인가",
      "about.lead": "저는 Yuan Ze University에서 전기공학 석사 과정을 밟고 있는 대학원생입니다. 시각 인지, 모션 플래닝, 설명 가능한 AI를 통합한 지능적이고 투명하며 안전한 로봇 시스템을 연구합니다.",
      "about.edu": "학력",
      "about.interests": "연구 관심 분야",

      "research.eyebrow": "연구",
      "research.title": "작업 및 출판",
      "research.lead": "제 연구는 Visual SLAM, 로봇 매니퓰레이션, 설명 가능한 AI 시스템에 집중되어 있습니다. 아래는 현재 프로젝트와 최근 논문입니다.",
      "research.projects": "연구 프로젝트",
      "research.pubs": "주요 출판물",
      "research.journal": "저널 논문",
      "research.conference": "학회 논문",
      "research.proj.ai_glasses.title": "에이전틱 AI 시스템 탑재 AI 안경",
      "research.proj.ai_glasses.body": "고급 인지 및 의사결정 기능을 통해 사용자 상호작용과 경험을 향상시키는 에이전틱 AI 시스템 탑재 AI 안경을 개발했습니다.",
      "research.proj.ur_arm.title": "특이점 회피 로봇팔 모션 플래닝",
      "research.proj.ur_arm.body": "특이점 문제를 회피하기 위한 로봇팔 모션 플래닝 알고리즘을 개발해 복잡 작업에서의 안정성과 정밀도를 향상시켰고, 고급 기구학과 실시간 장애물 감지를 통합했습니다.",
      "research.proj.aws_hack.title": "스테인리스 국제표준 AI 어시스턴트 시스템",
      "research.proj.aws_hack.body": "Walsin Lihwa 기술 인력이 스테인리스 국제표준 관련 질의를 처리할 수 있도록 AWS 기반 지능형 시스템을 구축했습니다. 전문 질의, 표준 비교, 문서 분석을 제공하며 사용자 숙련도에 맞춰 응답 난이도를 조절합니다.",
      "research.proj.explain_arm.title": "역기구학 설명가능 시스템",
      "research.proj.explain_arm.body": "SHAP과 InterpretML을 통합한 설명가능 IK 프레임워크를 제안하고, Improved IKNet 및 Focused IKNet을 설계해 특성 기여도와 장애물 회피 안정성을 향상시켰습니다.",
      "research.proj.iknet.title": "저자원 환경용 iKnet 모델 개선",
      "research.proj.iknet.body": "제한된 연산 자원 환경에서 성능을 최적화하기 위해 iKnet 모델을 재구성하여 효율성과 정확도를 개선했습니다.",
      "research.proj.ggcnn.title": "저자원 환경용 GGCNN 모델 개선",
      "research.proj.ggcnn.body": "제한된 연산 자원 환경에서 성능을 최적화하기 위해 GGCNN 모델을 재구성하여 효율성과 정확도를 개선했습니다.",
      "research.proj.pcr_orb.title": "포인트클라우드 정제를 결합한 ORB-SLAM3 고도화",
      "research.proj.pcr_orb.body": "YOLOv8 기반 동적 객체 필터링과 CUDA 가속 포인트클라우드 정제를 통합해 KITTI 데이터셋에서 ATE RMSE 25.9% 감소 및 궤적 정확도 30.4% 향상을 달성했습니다.",
      "research.proj.golf.title": "골프 스윙 현상 분석",
      "research.proj.golf.body": "OpenCV, YOLO, MediaPipe를 활용해 클럽 및 자세 추적 비전 시스템을 개발하고, 라그랑지안 역학으로 스윙 동역학을 모델링했습니다.",
      "research.proj.auto_mobile.title": "전방향 자율 이동 매니퓰레이터",
      "research.proj.auto_mobile.body": "ROS2 기반으로 LiDAR, 깊이 카메라, 로봇팔을 통합한 자율 이동 로봇을 구축하고 SLAM 내비게이션 및 비전 기반 엘리베이터 제어를 구현했습니다.",
      "project.ai_glasses.abstract": "본 연구는 실시간 음성 처리, 이중 에이전트 협업, 네트워크 간 스트리밍을 통합한 AI 안경 시스템을 제시합니다. Agent 01은 음성 인식 및 장치 제어를 담당하고, Agent 02는 언어 추론과 응답 생성을 담당합니다. 제안 시스템은 상호작용 품질을 높이고 일상 보조 환경에서의 실사용 가능성을 입증합니다.",
      "project.auto_mobile.abstract": "본 프로젝트는 ROS 기반 위치추정·맵핑·내비게이션과 로봇팔 제어를 결합한 자율 이동 매니퓰레이터를 개발합니다. LiDAR, 깊이 센서, 비전 모듈을 통합하여 엘리베이터 버튼 인식 및 조작 같은 실내 작업을 수행합니다. 결과적으로 실제 서비스 환경에서 안전하고 신뢰할 수 있는 자율 동작을 검증했습니다.",
      "project.aws_hack.abstract": "본 연구는 스테인리스 국제 표준 질의를 위한 AWS 기반 AI 어시스턴트를 구축합니다. 시스템은 표준 검색, 표준 간 비교, 문서 분석을 지원하며 사용자 숙련도에 맞춰 응답 깊이를 조절합니다. 이를 통해 산업 현장의 기술 의사결정 효율성과 일관성을 향상시킵니다.",
      "project.explain_arm.abstract": "본 연구는 SHAP과 InterpretML을 결합한 설명가능 역기구학 워크플로를 제안합니다. Improved IKNet과 Focused IKNet을 통해 추론 속도, 정확도, 특성 수준의 해석 가능성을 균형 있게 확보합니다. 프레임워크는 장애물 회피 안정성을 유지하면서 책임 있는 AI 요구사항을 충족합니다.",
      "project.ggcnn.abstract": "본 프로젝트는 지식 증류를 통해 저자원 로봇 그리핑 환경에 맞게 GGCNN을 경량화합니다. 두 개의 학생 모델을 설계해 모델 크기와 추론 시간을 크게 줄이면서도 그리핑 품질을 유지합니다. 실험 결과는 정확도 손실을 최소화한 실시간 성능 향상을 보여줍니다.",
      "project.golf.abstract": "본 연구는 컴퓨터 비전과 역학 모델을 결합해 골프 스윙 현상을 분석합니다. OpenCV, YOLO, MediaPipe로 스윙 단계별 자세·클럽·헤드 움직임을 추적하고, 라그랑지안 동역학으로 운동 패턴을 해석합니다. 결과는 훈련 피드백과 기술 개선에 활용될 수 있습니다.",
      "project.iknet.abstract": "본 연구는 제한된 연산 자원 환경의 임베디드 역기구학 응용을 위해 IKNet을 개선합니다. Improved IKNet과 Focused IKNet을 제안하고 CPU/GPU 환경에서 기존 모델과 비교 평가했습니다. 제안 모델은 경쟁력 있는 정확도를 유지하면서 메모리 효율과 추론 속도를 향상시켰습니다.",
      "project.pcr_orb.abstract": "본 연구는 동적 환경을 위한 ORB-SLAM3 확장 프레임워크인 PCR-ORB를 제시합니다. YOLOv8 기반 동적 객체 필터링과 포인트클라우드 정제를 통합해 추적 안정성과 맵 일관성을 개선합니다. 벤치마크 실험에서 궤적 정확도 향상과 위치 오차 감소를 확인했습니다.",
      "project.ur_arm.abstract": "본 연구는 퍼지 안전 로직과 학습 기반 경로 계획을 결합해 UR10의 특이점 회피를 다룹니다. 시스템은 고위험 기구학 구간을 감지하고 궤적을 조정해 안정적인 제어 품질을 유지합니다. 실험 결과 복잡한 조작 작업에서 더 안전하고 부드러운 동작을 달성했습니다.",

      "exp.eyebrow": "경험",
      "exp.title": "학술 및 기타 경험",
      "exp.lead": "저의 여정은 학계와 산업에서의 연구, 멘토링, 리더십을 포함합니다.",
      "exp.academic": "학술 경험",
      "exp.afterclass": "비교과 활동 경험",
      "exp.talent": "인재 프로그램",
      "exp.award": "수상",
      "exp.cert": "자격증",

      "work.eyebrow": "직무",
      "work.title": "직무 경험",
      "work.lead": "이 페이지는 정규직과 인턴십을 포함한 산업 경험을 소개합니다.",
      "work.full": "직무 경험",
      "work.intern": "인턴십 경험",
      "work.tsmc.date": "2026년 4월 - (4/29부터 시작)",
      "work.tsmc.type": "정규직",
      "work.yzu.date": "2026년 1월 -",
      "work.yzu.type": "파트타임",
      "work.yzu.company": "Yuan Ze University",

      "cv.eyebrow": "이력서",
      "cv.title": "전체 스토리",
      "cv.lead": "학력, 연구, 논문, 경력 정보를 담은 전체 이력서를 확인하세요.",
      "cv.en": "CV 보기 (영문)",
      "cv.zh": "CV 보기 (중문)",

      "footer.designed": "디자인: Kyle Chen",
      "footer.rights": "모든 권리 보유"
    },
    th: {
      "lang.menu": "ไทย",
      "index.name.bold": "เฉิน เซิงไค",
      "index.name.sub": "Sheng-Kai Chen (Kyle Chen)",
      "index.name.alt": "陳嵊凱、진승개",
      "nav.about": "เกี่ยวกับ",
      "nav.research": "งานวิจัย",
      "nav.experience": "ประสบการณ์",
      "nav.work": "งาน",
      "nav.cv": "เรซูเม่",
      "project.back": "← กลับไปหน้าวิจัย",

      "index.exp": "ประสบการณ์การทำงาน",
      "index.tsmc.position": "ว่าที่วิศวกรอุปกรณ์",
      "index.tsmc.company": "TSMC",
      "index.tsmc.division": "ETC",
      "index.tsmc.type": "เต็มเวลา",
      "index.yzu.position": "ผู้ช่วยวิจัย",
      "index.yzu.company": "Yuan Ze University",
      "index.yzu.division": "โครงการระบบการแพทย์ด้วย AI",
      "index.yzu.type": "พาร์ตไทม์",
      "index.nchc.position": "นักศึกษาฝึกงานภาคฤดูร้อน",
      "index.nchc.company": "National Center for High-Performance Computing, ไต้หวัน",
      "index.nchc.division": "แผนกบูรณาการเสมือนจริงและดิจิทัลทวิน",
      "index.current": "ปัจจุบัน",
      "index.present": "เริ่มตั้งแต่ 4/29",
      "index.past": "อดีต",
      "index.intro.title": "สำรวจแนวคิดใหม่และประยุกต์ใช้จริง",
      "index.intro.body": "ผมชื่อ เฉิน เซิงไค โดยมุ่งเน้นงานวิจัยด้าน Visual SLAM, หุ่นยนต์, Explainable AI และ Digital IC Design และมีแผนทำงานในอุตสาหกรรมเซมิคอนดักเตอร์ในอนาคต",
      "index.chip.robotics": "หุ่นยนต์",
      "index.chip.ai": "AI",
      "index.chip.ic": "การออกแบบดิจิทัล IC",
      "index.quote": "ความสำเร็จมันอยู่ไม่ไกล อยู่ที่ว่าจะก้าวต่อไปหรือหยุดอยู่ที่เดิม",

      "about.eyebrow": "เกี่ยวกับ",
      "about.title": "ฉันคือใคร",
      "about.lead": "ฉันเป็นนักศึกษาระดับบัณฑิตศึกษาที่มหาวิทยาลัยหยวนจื้อ กำลังศึกษาระดับปริญญาโทสาขาวิศวกรรมไฟฟ้า งานวิจัยของฉันมุ่งเน้นการสร้างระบบหุ่นยนต์อัจฉริยะ โปร่งใส และคำนึงถึงความปลอดภัย โดยผสานการรับรู้ภาพ การวางแผนการเคลื่อนที่ และ Explainable AI",
      "about.edu": "การศึกษา",
      "about.interests": "ความสนใจด้านวิจัย",

      "research.eyebrow": "งานวิจัย",
      "research.title": "ผลงานและสิ่งตีพิมพ์",
      "research.lead": "งานวิจัยของผมมุ่งเน้น Visual SLAM, หุ่นยนต์ และ Explainable AI ด้านล่างคือโครงการปัจจุบันและผลงานตีพิมพ์ล่าสุด",
      "research.projects": "โครงการวิจัย",
      "research.pubs": "ผลงานตีพิมพ์เด่น",
      "research.journal": "บทความวารสาร",
      "research.conference": "บทความประชุมวิชาการ",
      "research.proj.ai_glasses.title": "แว่นตา AI ที่ฝังระบบ Agentic AI",
      "research.proj.ai_glasses.body": "พัฒนาแว่นตา AI ที่ฝังระบบ Agentic AI เพื่อยกระดับการโต้ตอบและประสบการณ์ผู้ใช้ด้วยความสามารถด้านการรับรู้และการตัดสินใจขั้นสูง",
      "research.proj.ur_arm.title": "การวางแผนการเคลื่อนที่แขนกลเพื่อหลีกเลี่ยงภาวะซิงกูลาริตี",
      "research.proj.ur_arm.body": "พัฒนาอัลกอริทึมการวางแผนการเคลื่อนที่สำหรับแขนกลเพื่อหลีกเลี่ยงปัญหาซิงกูลาริตี เพิ่มความเสถียรและความแม่นยำในงานซับซ้อน โดยผสานคิเนเมติกส์ขั้นสูงและการตรวจจับสิ่งกีดขวางแบบเรียลไทม์",
      "research.proj.aws_hack.title": "ระบบผู้ช่วย AI มาตรฐานสากลสเตนเลส",
      "research.proj.aws_hack.body": "ระบบอัจฉริยะบน AWS เพื่อช่วยบุคลากรด้านเทคนิคของ Walsin Lihwa ในการตอบคำถามเกี่ยวกับมาตรฐานสากลของสเตนเลส โดยรองรับการค้นหามาตรฐาน การเปรียบเทียบ และการวิเคราะห์เอกสาร พร้อมปรับระดับคำตอบตามความเชี่ยวชาญของผู้ใช้",
      "research.proj.explain_arm.title": "ระบบอธิบายผลได้สำหรับ Inverse Kinematics",
      "research.proj.explain_arm.body": "นำเสนอกรอบงาน IK แบบอธิบายผลได้ที่ผสาน SHAP และ InterpretML พร้อมออกแบบ Improved IKNet และ Focused IKNet ให้สมดุลระหว่างการอธิบายคุณลักษณะและเสถียรภาพการหลบหลีกสิ่งกีดขวาง",
      "research.proj.iknet.title": "ปรับปรุงโมเดล iKnet สำหรับสภาพแวดล้อมทรัพยากรต่ำ",
      "research.proj.iknet.body": "ปรับโครงสร้างโมเดล iKnet เพื่อเพิ่มประสิทธิภาพในสภาพแวดล้อมที่มีทรัพยากรคอมพิวต์จำกัด โดยเน้นทั้งความเร็วและความแม่นยำ",
      "research.proj.ggcnn.title": "ปรับปรุงโมเดล GGCNN สำหรับสภาพแวดล้อมทรัพยากรต่ำ",
      "research.proj.ggcnn.body": "ปรับโครงสร้างโมเดล GGCNN เพื่อเพิ่มประสิทธิภาพในสภาพแวดล้อมที่มีทรัพยากรคอมพิวต์จำกัด โดยเน้นทั้งความเร็วและความแม่นยำ",
      "research.proj.pcr_orb.title": "ยกระดับ ORB-SLAM3 ด้วยการปรับแต่งพอยต์คลาวด์",
      "research.proj.pcr_orb.body": "ผสานการกรองวัตถุเคลื่อนไหวด้วย YOLOv8 และการปรับแต่งพอยต์คลาวด์แบบเร่งด้วย CUDA ทำให้ ATE RMSE ลดลง 25.9% และความแม่นยำเส้นทางดีขึ้น 30.4% บนชุดข้อมูล KITTI",
      "research.proj.golf.title": "การวิเคราะห์ปรากฏการณ์วงสวิงกอล์ฟ",
      "research.proj.golf.body": "พัฒนาระบบคอมพิวเตอร์วิทัศน์สำหรับติดตามไม้กอล์ฟและท่าทางด้วย OpenCV, YOLO และ MediaPipe และประยุกต์กลศาสตร์ลากร็องจ์เพื่อสร้างแบบจำลองพลวัตการสวิง",
      "research.proj.auto_mobile.title": "หุ่นยนต์เคลื่อนที่อัตโนมัติพร้อมแขนกลแบบออมนิ",
      "research.proj.auto_mobile.body": "สร้างหุ่นยนต์เคลื่อนที่อัตโนมัติที่บูรณาการ LiDAR กล้องความลึก และแขนกลบน ROS2 พร้อมพัฒนา SLAM navigation และการกดปุ่มลิฟต์ด้วยวิชัน",
      "project.ai_glasses.abstract": "งานวิจัยนี้นำเสนอระบบแว่นตา AI ที่ผสานการประมวลผลเสียงแบบเรียลไทม์ สถาปัตยกรรมเอเจนต์สองตัว และการสตรีมข้ามเครือข่าย โดย Agent 01 ทำหน้าที่รู้จำเสียงและควบคุมอุปกรณ์ ส่วน Agent 02 ทำหน้าที่วิเคราะห์ภาษาและสร้างคำตอบ ระบบช่วยยกระดับคุณภาพการโต้ตอบและแสดงศักยภาพการใช้งานจริงในชีวิตประจำวัน",
      "project.auto_mobile.abstract": "โครงการนี้พัฒนาหุ่นยนต์เคลื่อนที่อัตโนมัติพร้อมแขนกล โดยผสานการระบุตำแหน่ง สร้างแผนที่ และนำทางบน ROS เข้ากับการควบคุมแขนกล แพลตฟอร์มรวม LiDAR เซ็นเซอร์ความลึก และโมดูลวิชันเพื่อทำงานในอาคาร เช่น ตรวจจับและกดปุ่มลิฟต์ ผลลัพธ์ยืนยันความปลอดภัยและความน่าเชื่อถือในการใช้งานจริง",
      "project.aws_hack.abstract": "งานนี้สร้างผู้ช่วย AI บน AWS สำหรับมาตรฐานสากลของสเตนเลส ระบบรองรับการค้นหามาตรฐาน การเปรียบเทียบข้ามมาตรฐาน และการวิเคราะห์เอกสาร พร้อมปรับระดับความลึกของคำตอบตามความเชี่ยวชาญของผู้ใช้ ช่วยเพิ่มประสิทธิภาพและความสม่ำเสมอในการตัดสินใจเชิงเทคนิคในงานอุตสาหกรรม",
      "project.explain_arm.abstract": "งานวิจัยนี้เสนอเวิร์กโฟลว์ Inverse Kinematics ที่อธิบายผลได้ โดยผสาน SHAP และ InterpretML เข้ากับโมเดล IK เชิงประสาท พร้อมออกแบบ Improved IKNet และ Focused IKNet ให้สมดุลระหว่างความเร็ว ความแม่นยำ และความสามารถในการอธิบายเชิงคุณลักษณะ กรอบงานนี้สอดคล้องกับแนวทาง Responsible AI และยังคงเสถียรภาพในการหลบหลีกสิ่งกีดขวาง",
      "project.ggcnn.abstract": "โครงการนี้บีบอัด GGCNN สำหรับงานหยิบจับของหุ่นยนต์ในอุปกรณ์ทรัพยากรจำกัดด้วยเทคนิค knowledge distillation ออกแบบโมเดลนักเรียนแบบเบาสองแบบเพื่อลดขนาดโมเดลและเวลาอนุมาน โดยยังรักษาคุณภาพการหยิบจับได้ดี ผลการทดลองแสดงการเพิ่มประสิทธิภาพแบบเรียลไทม์อย่างชัดเจนพร้อมการสูญเสียความแม่นยำเพียงเล็กน้อย",
      "project.golf.abstract": "งานวิจัยนี้วิเคราะห์ปรากฏการณ์วงสวิงกอล์ฟด้วยคอมพิวเตอร์วิทัศน์ร่วมกับแบบจำลองเชิงกลศาสตร์ ใช้ OpenCV, YOLO และ MediaPipe เพื่อติดตามท่าทาง การเคลื่อนที่ของไม้ และหัวไม้ในแต่ละช่วงของสวิง จากนั้นใช้กรอบพลวัตแบบลากร็องจ์เพื่ออธิบายรูปแบบการเคลื่อนที่ ผลลัพธ์สามารถนำไปใช้เป็นฟีดแบ็กการฝึกซ้อมได้",
      "project.iknet.abstract": "งานศึกษานี้ปรับปรุง IKNet สำหรับงาน Inverse Kinematics บนอุปกรณ์ฝังตัวที่มีทรัพยากรคอมพิวต์จำกัด โดยเสนอ Improved IKNet และ Focused IKNet และประเมินเทียบกับโมเดลดั้งเดิมทั้งบน CPU และ GPU ผลลัพธ์ชี้ว่าโมเดลที่เสนอให้ประสิทธิภาพด้านหน่วยความจำและความเร็วอนุมานดีขึ้น ขณะยังคงความแม่นยำในระดับแข่งขันได้",
      "project.pcr_orb.abstract": "งานนี้นำเสนอ PCR-ORB ซึ่งเป็นกรอบ ORB-SLAM3 ที่ปรับปรุงสำหรับสภาพแวดล้อมแบบไดนามิก โดยผสานการกรองวัตถุเคลื่อนไหวด้วย YOLOv8 และการปรับแต่งพอยต์คลาวด์เพื่อเพิ่มเสถียรภาพการติดตามและความสอดคล้องของแผนที่ การทดลองบนชุดข้อมูลมาตรฐานแสดงการเพิ่มความแม่นยำของเส้นทางและลดความคลาดเคลื่อนในการระบุตำแหน่ง",
      "project.ur_arm.abstract": "งานวิจัยนี้จัดการปัญหาการหลีกเลี่ยงซิงกูลาริตีของ UR10 โดยผสานตรรกะความปลอดภัยแบบฟัซซีกับการวางแผนการเคลื่อนที่เชิงการเรียนรู้ ระบบสามารถตรวจจับช่วงคิเนเมติกส์ที่มีความเสี่ยงสูงและปรับวิถีเพื่อรักษาเสถียรภาพและคุณภาพการควบคุม ผลการทดลองแสดงการเคลื่อนที่ที่ปลอดภัยและนุ่มนวลขึ้นในงานหยิบจับที่ซับซ้อน",

      "exp.eyebrow": "ประสบการณ์",
      "exp.title": "ประสบการณ์ด้านวิชาการและอื่น ๆ",
      "exp.lead": "เส้นทางของผมครอบคลุมงานวิจัย การให้คำปรึกษา และภาวะผู้นำทั้งในสถาบันการศึกษาและอุตสาหกรรม",
      "exp.academic": "ประสบการณ์ทางวิชาการ",
      "exp.afterclass": "ประสบการณ์กิจกรรมนอกชั้นเรียน",
      "exp.talent": "โครงการพัฒนาศักยภาพ",
      "exp.award": "รางวัล",
      "exp.cert": "ใบรับรอง",

      "work.eyebrow": "งาน",
      "work.title": "ประสบการณ์การทำงาน",
      "work.lead": "หน้านี้สรุปประสบการณ์ในอุตสาหกรรมของผม ทั้งงานประจำและงานฝึกงาน",
      "work.full": "ประสบการณ์การทำงาน",
      "work.intern": "ประสบการณ์ฝึกงาน",
      "work.tsmc.date": "เมษายน พ.ศ. 2569 - (เริ่มตั้งแต่ 4/29)",
      "work.tsmc.type": "เต็มเวลา",
      "work.yzu.date": "มกราคม พ.ศ. 2569 -",
      "work.yzu.type": "พาร์ตไทม์",
      "work.yzu.company": "Yuan Ze University",

      "cv.eyebrow": "เรซูเม่",
      "cv.title": "ดูข้อมูลทั้งหมด",
      "cv.lead": "ดูเรซูเม่ฉบับเต็มสำหรับรายละเอียดด้านการศึกษา งานวิจัย สิ่งตีพิมพ์ และประสบการณ์วิชาชีพ",
      "cv.en": "ดู CV (อังกฤษ)",
      "cv.zh": "ดู CV (จีน)",

      "footer.designed": "ออกแบบโดย Kyle Chen",
      "footer.rights": "สงวนลิขสิทธิ์"
    }
  };

  function t(lang, key) {
    const locale = DICT[lang] || DICT.en;
    return locale[key] || DICT.en[key] || "";
  }

  function normalizeMojibake(text) {
    let out = text;
    for (const [bad, good] of Object.entries(MOJIBAKE_MAP)) {
      if (out.includes(bad)) {
        out = out.split(bad).join(good);
      }
    }
    return out;
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeSpaces(text) {
    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toMonthNumber(monthText) {
    if (!monthText) return 0;
    const key = monthText.trim().toLowerCase().replace(/\./g, "");
    return MONTH_MAP[key] || 0;
  }

  function formatYear(year, lang) {
    const y = Number(year);
    if (!Number.isFinite(y)) return String(year);

    if (lang === "zh") {
      return new Intl.DateTimeFormat("zh-TW-u-ca-roc", { year: "numeric" }).format(new Date(Date.UTC(y, 0, 1)));
    }
    if (lang === "ko") {
      return new Intl.DateTimeFormat("ko-KR", { year: "numeric" }).format(new Date(Date.UTC(y, 0, 1)));
    }
    if (lang === "th") {
      return "พ.ศ. " + String(y + 543);
    }
    return String(y);
  }

  function formatMonthYear(year, month, lang) {
    const y = Number(year);
    const m = Number(month);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return String(year) + "-" + String(month);
    }

    const date = new Date(Date.UTC(y, m - 1, 1));
    if (lang === "zh") {
      return new Intl.DateTimeFormat("zh-TW-u-ca-roc", { year: "numeric", month: "long" }).format(date);
    }
    if (lang === "ko") {
      return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(date);
    }
    if (lang === "th") {
      const monthName = new Intl.DateTimeFormat("th-TH", { month: "long" }).format(date);
      return monthName + " พ.ศ. " + String(y + 543);
    }
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(date);
  }

  function rangeWord(lang) {
    if (lang === "zh") return " 至 ";
    if (lang === "ko") return " ~ ";
    if (lang === "th") return " ถึง ";
    return " - ";
  }

  function presentWord(lang) {
    if (lang === "zh") return "至今";
    if (lang === "ko") return "현재";
    if (lang === "th") return "ปัจจุบัน";
    return "Present";
  }

  function localizeDates(text, lang) {
    if (lang === "en" || !text) return text;

    let out = text;

    // Year-range + dot label, e.g. "2024-2025 · Master Research"
    out = out.replace(
      /\b(19\d{2}|20\d{2})\s*(?:-|–|—|â€”|â€“)\s*(19\d{2}|20\d{2})\s*·\s*([^\n]+)/g,
      (_m, y1, y2, label) => {
        const localizedRange = formatYear(Number(y1), lang) + rangeWord(lang) + formatYear(Number(y2), lang);
        return localizedRange + " · " + label;
      }
    );

    // Year + dot label, e.g. "2025 · Internship"
    out = out.replace(/\b(19\d{2}|20\d{2})\s*·\s*([^\n]+)/g, (_m, y, label) => {
      return formatYear(Number(y), lang) + " · " + label;
    });

    // Month Year - Month Year / Month Year -
    out = out.replace(
      /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{4})\s*(?:-|–|—|â€”|â€“)\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{4}))?/g,
      (_m, m1, y1, m2, y2) => {
        const mm1 = toMonthNumber(m1);
        if (!mm1) return _m;
        const start = formatMonthYear(Number(y1), mm1, lang);

        if (!m2 || !y2) {
          return start + rangeWord(lang) + presentWord(lang);
        }

        const mm2 = toMonthNumber(m2);
        if (!mm2) return _m;
        const end = formatMonthYear(Number(y2), mm2, lang);
        return start + rangeWord(lang) + end;
      }
    );

    // Standalone Month Year
    out = out.replace(
      /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{4})\b/g,
      (_m, mon, yr) => {
        const mm = toMonthNumber(mon);
        if (!mm) return _m;
        return formatMonthYear(Number(yr), mm, lang);
      }
    );

    // Year range
    out = out.replace(/\b(19\d{2}|20\d{2})\s*(?:-|–|—|â€”|â€“)\s*(19\d{2}|20\d{2})\b/g, (_m, y1, y2) => {
      return formatYear(Number(y1), lang) + rangeWord(lang) + formatYear(Number(y2), lang);
    });

    return out;
  }

  function setTextByKey(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = t(lang, key);
      if (text) {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const text = t(lang, key);
      if (text) {
        el.setAttribute("title", text);
      }
    });

    const footer = document.querySelector("[data-i18n-footer]");
    if (footer) {
      const year = formatYear(new Date().getFullYear(), lang);
      footer.textContent = "© " + year + " " + t(lang, "footer.designed") + "  " + t(lang, "footer.rights");
    }
  }

  function applyStaticTextMap(lang) {
    const map = STATIC_TEXT_MAP[lang] || {};
    if (!document.body) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest("[data-i18n-skip]")) continue;
      // Do not let static fallback replacements override explicit key-based translations.
      if (parent.closest("[data-i18n], [data-i18n-footer]")) continue;

      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;

      if (!ORIGINAL_TEXT.has(node)) {
        ORIGINAL_TEXT.set(node, node.nodeValue);
      }

      const base = ORIGINAL_TEXT.get(node) || "";
      if (!base.trim()) continue;

      const exact = base.trim();
      const normalizedExact = normalizeSpaces(exact);
      let updated = normalizeMojibake(base);

      if (lang !== "zh" && CHINESE_ONLY_STATIC_KEYS.has(normalizedExact)) {
        node.nodeValue = localizeDates(updated, lang);
        continue;
      }

      if (map[exact]) {
        updated = updated.replace(exact, map[exact]);
      } else if (normalizedExact && map[normalizedExact]) {
        updated = updated.replace(exact, map[normalizedExact]);
      } else {
        const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
        for (const [from, to] of entries) {
          if (!from) continue;
          const shouldDoSubstringReplace = from.length >= 5 || /\s|[()\-:&]/.test(from);
          if (!shouldDoSubstringReplace) continue;

          if (updated.includes(from)) {
            const pattern = new RegExp(escapeRegExp(from), "g");
            updated = updated.replace(pattern, to);
          } else if (from.includes(" ")) {
            // Handle text nodes that contain non-breaking spaces or irregular whitespace.
            const flexiblePattern = new RegExp(
              escapeRegExp(from).replace(/\s+/g, "(?:\\s|\\u00A0)+"),
              "g"
            );
            updated = updated.replace(flexiblePattern, to);
          }
        }
      }

      updated = localizeDates(updated, lang);

      node.nodeValue = updated;
    }
  }

  function applyDocumentTitleMap(lang) {
    if (!ORIGINAL_PAGE_TITLE) return;

    const parts = ORIGINAL_PAGE_TITLE.split("|");
    if (parts.length < 2) {
      document.title = ORIGINAL_PAGE_TITLE;
      return;
    }

    const left = parts[0].trim();
    const right = parts.slice(1).join("|").trim();
    const prefixMap = TITLE_PREFIX_MAP[lang] || TITLE_PREFIX_MAP.en;
    const translatedLeft = prefixMap[left] || left;
    document.title = translatedLeft + " | " + right;
  }

  function syncEllipsisTitles() {
    document.querySelectorAll(".exp-role-title").forEach((el) => {
      const text = (el.textContent || "").trim();
      if (text) {
        el.setAttribute("title", text);
      }
    });
  }

  function buildMenu(currentLang) {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    const MENU_CONFIG = {
      en: { label: "English", flag: "https://flagcdn.com/20x15/us.png", alt: "US" },
      zh: { label: "繁體中文", flag: "https://flagcdn.com/20x15/tw.png", alt: "Taiwan" },
      ko: { label: "한국어", flag: "https://flagcdn.com/20x15/kr.png", alt: "Korea" },
      th: { label: "ไทย", flag: "https://flagcdn.com/20x15/th.png", alt: "Thailand" }
    };

    let wrapper = nav.querySelector(".lang-menu");

    function placeLanguageMenu() {
      const navLinks = nav.querySelector(".nav__links");
      const toggle = nav.querySelector(".toggle-wrapper");
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      if (isMobile && navLinks) {
        if (wrapper.parentElement !== navLinks) {
          navLinks.appendChild(wrapper);
        }
        return;
      }

      if (toggle) {
        if (wrapper.parentElement !== nav || wrapper.nextElementSibling !== toggle) {
          nav.insertBefore(wrapper, toggle);
        }
      } else if (wrapper.parentElement !== nav) {
        nav.appendChild(wrapper);
      }
    }

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "lang-menu";
      wrapper.setAttribute("data-i18n-skip", "");
      const optionHtml = Object.keys(MENU_CONFIG)
        .map((lang) => {
          const item = MENU_CONFIG[lang];
          return (
            '<button type="button" class="lang-option" data-lang="' +
            lang +
            '">' +
            '<img class="lang-flag" src="' +
            item.flag +
            '" alt="' +
            item.alt +
            ' flag" />' +
            '<span>' +
            item.label +
            "</span></button>"
          );
        })
        .join("");

      wrapper.innerHTML =
        '<details class="lang-picker">' +
        '<summary id="langSummary" aria-label="Language"></summary>' +
        '<div class="lang-options" role="listbox">' +
        optionHtml +
        "</div></details>";

      placeLanguageMenu();
    }

    // Keep language labels stable (do not translate menu item text).
    wrapper.setAttribute("data-i18n-skip", "");
    placeLanguageMenu();

    if (!nav.dataset.langMenuResizeBound) {
      window.addEventListener("resize", placeLanguageMenu);
      nav.dataset.langMenuResizeBound = "1";
    }

    const picker = wrapper.querySelector(".lang-picker");
    const summary = wrapper.querySelector("#langSummary");
    const setSummary = (lang) => {
      const item = MENU_CONFIG[lang] || MENU_CONFIG.en;
      if (!summary) return;
      summary.innerHTML =
        '<span class="lang-summary-content">' +
        '<img class="lang-flag" src="' +
        item.flag +
        '" alt="' +
        item.alt +
        ' flag" />' +
        '<span>' +
        item.label +
        "</span></span>";
    };

    const updateLangOptionState = (activeLang) => {
      wrapper.querySelectorAll(".lang-option").forEach((btn) => {
        const lang = btn.getAttribute("data-lang") || "en";
        const isCurrent = lang === activeLang;
        btn.disabled = isCurrent;
        btn.classList.toggle("is-current", isCurrent);
        btn.setAttribute("aria-current", isCurrent ? "true" : "false");
      });
    };

    setSummary(currentLang);
    updateLangOptionState(currentLang);

    wrapper.querySelectorAll(".lang-option").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (this.disabled) return;
        const next = this.getAttribute("data-lang") || "en";
        setSummary(next);
        updateLangOptionState(next);
        if (picker) picker.removeAttribute("open");
        runWithLoader(() => applyLanguage(next));
      });
    });
  }

  function getInitialLanguage() {
    const fromPath = getLanguageFromPath(window.location.pathname);
    if (fromPath && SUPPORTED.includes(fromPath)) return fromPath;

    const fromQuery = getLanguageFromQuery(window.location.search);
    if (fromQuery && SUPPORTED.includes(fromQuery)) return fromQuery;
    return "en";
  }

  function getLanguageFromQuery(search) {
    const params = new URLSearchParams(search || "");
    const value = (params.get(LANG_QUERY_KEY) || "").toLowerCase().trim();
    if (!value) return "";
    if (SUPPORTED.includes(value)) return value;
    return PATH_LANG_MAP[value] || "";
  }

  function detectSiteBasePath() {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    let matchedPath = "";

    scripts.forEach((script) => {
      const src = script.getAttribute("src") || "";
      if (!/i18n\.js(?:\?.*)?$/i.test(src)) return;
      try {
        const resolved = new URL(src, window.location.href);
        matchedPath = resolved.pathname;
      } catch (_err) {
        // ignore invalid script URLs
      }
    });

    if (!matchedPath) return "";
    const base = matchedPath.replace(/\/i18n\.js$/i, "");
    return base === "/" ? "" : base;
  }

  function stripSiteBasePath(pathname) {
    const path = String(pathname || "/");
    if (!SITE_BASE_PATH) return path;

    const lowerPath = path.toLowerCase();
    const lowerBase = SITE_BASE_PATH.toLowerCase();
    if (lowerPath === lowerBase) return "/";
    if (lowerPath.startsWith(lowerBase + "/")) {
      const rest = path.slice(SITE_BASE_PATH.length);
      return rest || "/";
    }
    return path;
  }

  function getPathParts(pathname) {
    const withLeading = String(pathname || "/").startsWith("/") ? String(pathname || "/") : "/" + String(pathname || "/");
    const relative = stripSiteBasePath(withLeading);
    const match = relative.match(/^\/(en-us|zh-tw|ko-kr|th-th)(?=\/|$)/i);
    const langSegment = match ? match[1].toLowerCase() : "";
    const lang = PATH_LANG_MAP[langSegment] || "";
    const relativeNoLang = match ? (relative.slice(match[0].length) || "/") : (relative || "/");
    return {
      lang,
      relativeNoLang: relativeNoLang.startsWith("/") ? relativeNoLang : "/" + relativeNoLang
    };
  }

  function getLanguageFromPath(pathname) {
    return getPathParts(pathname).lang;
  }

  function stripLanguagePrefix(pathname) {
    return getPathParts(pathname).relativeNoLang;
  }

  function updateAddressForLanguage(lang) {
    if (!window.history || !window.history.replaceState) return;

    const segment = LANG_PATH_MAP[lang] || LANG_PATH_MAP.en;
    const parts = getPathParts(window.location.pathname);
    const nextPath = (SITE_BASE_PATH || "") + (parts.relativeNoLang === "/" ? "" : parts.relativeNoLang);
    const params = new URLSearchParams(window.location.search || "");
    params.set(LANG_QUERY_KEY, segment);
    const query = params.toString();
    const nextUrl = nextPath + (query ? "?" + query : "") + window.location.hash;
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;

    if (nextUrl !== currentUrl) {
      try {
        window.history.replaceState(null, "", nextUrl);
      } catch (_err) {
        // In some local file contexts, path rewrite is restricted.
      }
    }
  }

  function normalizeInternalLinks() {
    const origin = window.location.origin;
    const pagePath = stripLanguagePrefix(window.location.pathname);
    const baseUrl = new URL((SITE_BASE_PATH || "") + (pagePath.startsWith("/") ? pagePath : "/" + pagePath), origin);

    document.querySelectorAll("a[href]").forEach((link) => {
      const rawHref = (link.getAttribute("href") || "").trim();
      if (!rawHref) return;
      if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(rawHref)) return;

      try {
        const resolved = new URL(rawHref, baseUrl.href);
        if (resolved.origin !== origin) return;

        const relative = stripLanguagePrefix(stripSiteBasePath(resolved.pathname));
        const normalizedPath = (SITE_BASE_PATH || "") + (relative === "/" ? "" : relative);
        link.setAttribute("href", normalizedPath + resolved.search + resolved.hash);
      } catch (_err) {
        // ignore invalid href
      }
    });
  }

  function applyLanguageToInternalLinks(lang) {
    const origin = window.location.origin;
    const segment = LANG_PATH_MAP[lang] || LANG_PATH_MAP.en;
    const pagePath = stripLanguagePrefix(window.location.pathname);
    const baseUrl = new URL((SITE_BASE_PATH || "") + (pagePath.startsWith("/") ? pagePath : "/" + pagePath), origin);

    document.querySelectorAll("a[href]").forEach((link) => {
      const rawHref = (link.getAttribute("href") || "").trim();
      if (!rawHref) return;
      if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(rawHref)) return;

      try {
        const resolved = new URL(rawHref, baseUrl.href);
        if (resolved.origin !== origin) return;

        const relative = stripLanguagePrefix(stripSiteBasePath(resolved.pathname));
        const localizedPath = (SITE_BASE_PATH || "") + (relative === "/" ? "" : relative);
        const params = new URLSearchParams(resolved.search || "");
        params.set(LANG_QUERY_KEY, segment);
        const query = params.toString();
        link.setAttribute("href", localizedPath + (query ? "?" + query : "") + resolved.hash);
      } catch (_err) {
        // ignore invalid href
      }
    });
  }

  function ensurePageLoaderStyles() {
    if (document.getElementById("pageLoaderStyle")) return;

    const style = document.createElement("style");
    style.id = "pageLoaderStyle";
    style.textContent =
      ".page-loader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(7,11,17,.62);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);" +
      "opacity:0;visibility:hidden;pointer-events:none;transition:opacity .22s ease,visibility .22s ease;}" +
      ".page-loader.is-active{opacity:1;visibility:visible;}" +
      ".page-loader__spinner{width:46px;height:46px;border-radius:999px;border:3px solid rgba(255,255,255,.25);" +
      "border-top-color:#7ef0c1;animation:pageLoaderSpin .9s linear infinite;" +
      "box-shadow:0 0 18px rgba(126,240,193,.35);}" +
      "@keyframes pageLoaderSpin{to{transform:rotate(360deg);}}";
    document.head.appendChild(style);
  }

  function ensurePageLoader() {
    if (PAGE_LOADER && document.body.contains(PAGE_LOADER)) return PAGE_LOADER;

    PAGE_LOADER = document.querySelector(".page-loader");
    if (PAGE_LOADER) return PAGE_LOADER;

    const loader = document.createElement("div");
    loader.className = "page-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<span class="page-loader__spinner"></span>';
    document.body.appendChild(loader);
    PAGE_LOADER = loader;
    return loader;
  }

  function showPageLoader() {
    const loader = ensurePageLoader();
    if (!loader) return;
    requestAnimationFrame(() => {
      loader.classList.add("is-active");
    });
  }

  function hidePageLoader() {
    if (!PAGE_LOADER) return;
    PAGE_LOADER.classList.remove("is-active");
  }

  function runWithLoader(task, minDuration) {
    const minimum = Number.isFinite(minDuration) ? Math.max(0, minDuration) : 260;
    const start = Date.now();
    showPageLoader();
    try {
      task();
    } finally {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minimum - elapsed);
      window.setTimeout(hidePageLoader, wait);
    }
  }

  function bindPageTransitionLoader() {
    if (document.body.dataset.pageLoaderBound === "1") return;
    document.body.dataset.pageLoaderBound = "1";

    document.addEventListener(
      "click",
      (event) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const link = target.closest("a[href]");
        if (!link) return;

        if (link.hasAttribute("download")) return;
        const targetAttr = (link.getAttribute("target") || "").toLowerCase();
        if (targetAttr && targetAttr !== "_self") return;

        const rawHref = (link.getAttribute("href") || "").trim();
        if (!rawHref) return;
        if (/^(#|mailto:|tel:|javascript:)/i.test(rawHref)) return;

        try {
          const nextUrl = new URL(rawHref, window.location.href);
          if (nextUrl.origin !== window.location.origin) return;

          const currentNoHash = window.location.pathname + window.location.search;
          const nextNoHash = nextUrl.pathname + nextUrl.search;
          if (currentNoHash === nextNoHash) return;

          showPageLoader();
        } catch (_err) {
          // ignore invalid href
        }
      },
      true
    );

    window.addEventListener("beforeunload", showPageLoader);
    window.addEventListener("pageshow", hidePageLoader);
  }

  function applyLanguage(lang) {
    const chosen = SUPPORTED.includes(lang) ? lang : "en";
    document.documentElement.setAttribute("lang", chosen === "zh" ? "zh-Hant" : chosen);
    setTextByKey(chosen);
    applyStaticTextMap(chosen);
    applyDocumentTitleMap(chosen);
    syncEllipsisTitles();
    updateAddressForLanguage(chosen);
    applyLanguageToInternalLinks(chosen);
  }

  function init() {
    ORIGINAL_PAGE_TITLE = document.title || "";
    ensurePageLoaderStyles();
    ensurePageLoader();
    bindPageTransitionLoader();
    runWithLoader(() => {
      SITE_BASE_PATH = detectSiteBasePath();
      normalizeInternalLinks();
      const lang = getInitialLanguage();
      buildMenu(lang);
      applyLanguage(lang);
    }, 320);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
