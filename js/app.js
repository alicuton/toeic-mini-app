/**
 * TOEIC Daily Personal Trainer — Mini App Client Logic (V3)
 * Full Synchronization:
 * - Load all 9 past lessons from lesson_log.json
 * - Load full Mistake Bank
 * - Lock Exam after Submit & Allow re-viewing recent results
 * - 100% unified Typography & Simple Master Brand Colors
 */

// Global State
let currentStudent = 'Nguyen Dinh Toan';
let currentQuestionIndex = 0;
let userAnswers = {}; // { questionId: 'A' | 'B' | 'C' | 'D' }
let isQuizSubmitted = false; // Khóa bài thi sau khi nộp
let lastQuizResults = null; // Lưu lại kết quả bài vừa làm để mở lại

// Sample Lesson 10 Questions Bank
const quizQuestions = [
  {
    id: 1,
    type: 'Review',
    section: '1. Review L09',
    text: 'Over the last three quarters, our sales team ------- the annual revenue target.',
    options: {
      A: 'exceeds',
      B: 'has exceeded',
      C: 'exceeded',
      D: 'was exceeding'
    },
    correctAnswer: 'B',
    explanation: 'Cụm dấu hiệu "Over the last three quarters" chỉ khoảng thời gian kéo dài tới hiện tại ➔ Bắt buộc dùng thì Hiện tại hoàn thành (has exceeded).'
  },
  {
    id: 2,
    type: 'Review',
    section: '1. Review L09',
    text: 'All employees are required to comply ------- the newly updated IT security guidelines.',
    options: {
      A: 'with',
      B: 'to',
      C: 'for',
      D: 'in'
    },
    correctAnswer: 'A',
    explanation: 'Collocation cốt lõi: "comply with" = tuân thủ theo quy định (tương tự abide by).'
  },
  {
    id: 3,
    type: 'Practice',
    section: '2. Practice Part 5',
    text: 'The IT department is responsible for ------- all hardware and network issues within 24 hours.',
    options: {
      A: 'troubleshoot',
      B: 'troubleshooting',
      C: 'troubleshoots',
      D: 'troubleshooter'
    },
    correctAnswer: 'B',
    explanation: 'Sau giới từ "for", động từ đi sau bắt buộc ở dạng V-ing (troubleshooting).'
  },
  {
    id: 4,
    type: 'Practice',
    section: '2. Practice Part 5',
    text: 'The conference room was unavailable because the projector was being ------- by technicians.',
    options: {
      A: 'repairing',
      B: 'repair',
      C: 'repaired',
      D: 'repairs'
    },
    correctAnswer: 'C',
    explanation: 'Cấu trúc Quá khứ tiếp diễn bị động: was being + V3/ed (was being repaired). Máy chiếu đang được sửa chữa.'
  },
  {
    id: 5,
    type: 'Listening',
    section: '3. Listening Audio',
    hasAudio: true,
    audioText: 'Where can I find the user manual for the new printer?',
    text: '🎧 [Audio Question] Nghe đoạn hội thoại và chọn phản hồi phù hợp nhất:',
    options: {
      A: 'Yes, it is very fast.',
      B: 'It is on the top shelf next to the copier.',
      C: 'Tomorrow afternoon at two.'
    },
    correctAnswer: 'B',
    explanation: 'Câu hỏi hỏi về địa điểm "Where...", câu trả lời chỉ vị trí "On the top shelf" là phương án duy nhất logic.'
  }
];

// Danh sách bài học cũ (Lesson 01 - 09) nạp sẵn
const historicalLessons = [
  { num: 1, date: '23/09/2026', title: 'Basic Grammar & Foundation', scoreToan: '19/19 (100%)', scoreHang: '19/19 (100%)' },
  { num: 2, date: '24/09/2026', title: 'Business Contracts & Agreements', scoreToan: '18/19 (94.7%)', scoreHang: '17/19 (89.5%)' },
  { num: 3, date: '25/09/2026', title: 'Office Operations & Communication', scoreToan: '19/19 (100%)', scoreHang: '18/19 (94.7%)' },
  { num: 4, date: '26/09/2026', title: 'Marketing & Product Launching', scoreToan: '19/19 (100%)', scoreHang: '18/19 (94.7%)' },
  { num: 5, date: '27/09/2026', title: 'Finance, Banking & Accounting', scoreToan: '19/19 (100%)', scoreHang: '19/19 (100%)' },
  { num: 6, date: '28/09/2026', title: 'Human Resources & Recruitment', scoreToan: '18/19 (94.7%)', scoreHang: '18/19 (94.7%)' },
  { num: 7, date: '29/09/2026', title: 'Customer Service & Relations', scoreToan: '19/19 (100%)', scoreHang: '17/19 (89.5%)' },
  { num: 8, date: '01/10/2026', title: 'Shipping & Logistics Operations', scoreToan: '19/19 (100%)', scoreHang: '18/19 (94.7%)' },
  { num: 9, date: '02/10/2026', title: 'Corporate Policies & Security', scoreToan: '19/19 (100%)', scoreHang: '18/19 (94.7%)' }
];

// Initialize and Auto-detect Student from Telegram WebApp
document.addEventListener('DOMContentLoaded', async () => {
  autoDetectTelegramUser();
  renderHistoryLessons(); // Render ngay lập tức không chờ fetch
  renderFullMistakeBank(); // Render ngay lập tức không chờ fetch
  loadCurrentQuestion();
  await loadArchivedData();
  renderHistoryLessons(); // Cập nhật lại sau khi có data chi tiết
  renderFullMistakeBank();
  fetchServerData();
});

// State dữ liệu lưu trữ
let fullLessonsData = [
  {
    "lesson": 1,
    "date": "23/09/2026",
    "title": "General Business & Office Foundation",
    "grammar": {
      "concept": "Present Simple & Habitual Actions (Hiện tại đơn & Thói quen công sở)",
      "trap": "Bẫy chia động từ số ít/số nhiều theo chủ ngữ tập hợp (department, committee, board)."
    },
    "vocab": [
      {
        "word": "abide by",
        "type": "v",
        "meaning": "tuân thủ, làm theo",
        "example": "Both parties agreed to abide by the judge’s decision."
      },
      {
        "word": "agreement",
        "type": "n",
        "meaning": "hợp đồng, thỏa thuận",
        "example": "According to the agreement, the caterer will also supply the flowers."
      },
      {
        "word": "assurance",
        "type": "n",
        "meaning": "sự cam đoan, đảm bảo",
        "example": "The sales rep gave his assurance that the missing parts would be replaced."
      },
      {
        "word": "cancellation",
        "type": "n",
        "meaning": "sự hủy bỏ",
        "example": "Work on the project came to a halt with the cancellation of funding."
      },
      {
        "word": "determine",
        "type": "v",
        "meaning": "xác định, định đoạt",
        "example": "After reading the contract, I was still unable to determine if our company was liable."
      },
      {
        "word": "engage",
        "type": "v",
        "meaning": "tham gia, cam kết",
        "example": "Before engaging in a new business, it is valid to research that market."
      },
      {
        "word": "establish",
        "type": "v",
        "meaning": "thiết lập, thành lập",
        "example": "The merger has established a powerful new company in the computer industry."
      },
      {
        "word": "obligate",
        "type": "v",
        "meaning": "bắt buộc",
        "example": "The contractor was obligated by the contract to complete the work by April."
      },
      {
        "word": "party",
        "type": "n",
        "meaning": "bên tham gia (hợp đồng)",
        "example": "The parties agreed to a settlement in their contract dispute."
      },
      {
        "word": "provision",
        "type": "n",
        "meaning": "điều khoản (hợp đồng)",
        "example": "The contract contains a provision to deal with how payments are made."
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "The two parties were unable to reach an ------- on the terms of payment.",
        "chosen": "B",
        "correct": "B",
        "is_correct": true
      },
      {
        "id": 2,
        "text": "All employees are required to abide ------- company safety rules.",
        "chosen": "A",
        "correct": "A",
        "is_correct": true
      },
      {
        "id": 3,
        "text": "The warranty provides ------- that defective equipment will be replaced.",
        "chosen": "B",
        "correct": "B",
        "is_correct": true
      }
    ]
  },
  {
    "lesson": 2,
    "date": "24/09/2026",
    "title": "Business Contracts & Agreements",
    "grammar": {
      "concept": "Present Continuous vs. Present Simple (Hiện tại tiếp diễn vs Hiện tại đơn)",
      "trap": "Động từ chỉ trạng thái (stative verbs: belong, know, understand) KHÔNG chia tiếp diễn."
    },
    "vocab": [
      {
        "word": "resolve",
        "type": "v",
        "meaning": "giải quyết (vấn đề)",
        "example": "The mediator was able to resolve the problem to everyone’s satisfaction."
      },
      {
        "word": "specific",
        "type": "adj",
        "meaning": "cụ thể, chi tiết",
        "example": "The customer’s specific request was not readily available."
      },
      {
        "word": "attract",
        "type": "v",
        "meaning": "thu hút, hấp dẫn",
        "example": "The new advertising campaign attracted many new clients."
      },
      {
        "word": "compare",
        "type": "v",
        "meaning": "so sánh",
        "example": "The survey compared the prices of two similar computers."
      },
      {
        "word": "compete",
        "type": "v",
        "meaning": "cạnh tranh",
        "example": "We cannot compete with their rock-bottom prices."
      },
      {
        "word": "consume",
        "type": "v",
        "meaning": "tiêu thụ, tiêu dùng",
        "example": "The software consumes a lot of memory."
      },
      {
        "word": "convince",
        "type": "v",
        "meaning": "thuyết phục",
        "example": "He convinced us that the project was on schedule."
      },
      {
        "word": "currently",
        "type": "adv",
        "meaning": "hiện tại",
        "example": "Currently, the company is expanding its operations in Asia."
      },
      {
        "word": "fad",
        "type": "n",
        "meaning": "mốt nhất thời",
        "example": "The mini-dress was a fad that only lasted a season."
      },
      {
        "word": "inspiration",
        "type": "n",
        "meaning": "nguồn cảm hứng",
        "example": "His work is an inspiration to the entire marketing team."
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "The company is currently ------- into new international markets.",
        "chosen": "C",
        "correct": "C",
        "is_correct": true
      },
      {
        "id": 2,
        "text": "The firm ------- money this quarter due to supply chain disruption.",
        "chosen": "B",
        "correct": "C",
        "is_correct": false,
        "expl": "Cần thì tiếp diễn: is losing money (chỉ biến động tạm thời trong quý này)."
      }
    ]
  },
  {
    "lesson": 3,
    "date": "25/09/2026",
    "title": "Office Operations & Communication",
    "grammar": {
      "concept": "Compound Nouns & Word Forms (Danh từ ghép & Vị trí danh từ sau tính từ)",
      "trap": "Danh từ đứng đầu câu làm chủ ngữ cần chú ý mạo từ và tính từ bổ nghĩa."
    },
    "vocab": [
      {
        "word": "market",
        "type": "v",
        "meaning": "tiếp thị, đưa ra thị trường",
        "example": "The company markets its products aggressively online."
      },
      {
        "word": "persuasion",
        "type": "n",
        "meaning": "sự thuyết phục",
        "example": "It took a lot of persuasion to get the board to approve the budget."
      },
      {
        "word": "productive",
        "type": "adj",
        "meaning": "năng suất, hiệu quả",
        "example": "The morning meeting was highly productive."
      },
      {
        "word": "satisfaction",
        "type": "n",
        "meaning": "sự hài lòng, thỏa mãn",
        "example": "Customer satisfaction is our top priority."
      },
      {
        "word": "characteristic",
        "type": "adj",
        "meaning": "đặc trưng, tiêu biểu",
        "example": "Patience is a key characteristic of a great manager."
      },
      {
        "word": "consequence",
        "type": "n",
        "meaning": "hậu quả, hệ quả",
        "example": "As a consequence of the strike, production ceased."
      },
      {
        "word": "consider",
        "type": "v",
        "meaning": "cân nhắc, xem xét",
        "example": "We are considering an external consultant."
      },
      {
        "word": "cover",
        "type": "v",
        "meaning": "bao trả, bảo hiểm",
        "example": "The policy covers medical and travel expenses."
      },
      {
        "word": "expiration",
        "type": "n",
        "meaning": "sự hết hạn",
        "example": "Check the expiration date on the software license."
      },
      {
        "word": "frequently",
        "type": "adv",
        "meaning": "thường xuyên",
        "example": "Appliances frequently come with a one-year warranty."
      }
    ],
    "questions": [
      {
        "id": 7,
        "text": "Our department is currently ------- a new policy for remote work.",
        "chosen": "C",
        "correct": "B",
        "is_correct": false,
        "expl": "Hành động tạm thời diễn ra thời gian này dùng is considering."
      },
      {
        "id": 14,
        "text": "Please check the ------- date stamped on the package.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Danh từ ghép chuẩn: expiration date (ngày hết hạn)."
      }
    ]
  },
  {
    "lesson": 4,
    "date": "26/09/2026",
    "title": "Marketing & Product Launching",
    "grammar": {
      "concept": "Gerunds after Prepositions (Danh động từ V-ing sau giới từ)",
      "trap": "Sau giới từ (of, for, in, about, with) động từ LUÔN ở dạng V-ing."
    },
    "vocab": [
      {
        "word": "imply",
        "type": "v",
        "meaning": "ngụ ý, ám chỉ",
        "example": "The memo implied that changes would be made soon."
      },
      {
        "word": "promise",
        "type": "n",
        "meaning": "lời hứa, triển vọng",
        "example": "The research shows great promise."
      },
      {
        "word": "protect",
        "type": "v",
        "meaning": "bảo vệ",
        "example": "A patent protects the company against unauthorized copying."
      },
      {
        "word": "reputation",
        "type": "n",
        "meaning": "danh tiếng, uy tín",
        "example": "The firm has built a solid reputation for quality."
      },
      {
        "word": "require",
        "type": "v",
        "meaning": "yêu cầu, đòi hỏi",
        "example": "The law requires companies to file financial statements."
      },
      {
        "word": "variety",
        "type": "n",
        "meaning": "sự đa dạng",
        "example": "The store carries a variety of electronic goods."
      },
      {
        "word": "address",
        "type": "v",
        "meaning": "giải quyết (vấn đề)",
        "example": "The CEO will address shareholder concerns tomorrow."
      },
      {
        "word": "avoid",
        "type": "v",
        "meaning": "tránh",
        "example": "Careful planning will help avoid costly errors."
      },
      {
        "word": "demonstrate",
        "type": "v",
        "meaning": "chứng minh, minh họa",
        "example": "The test demonstrated that the device is waterproof."
      },
      {
        "word": "develop",
        "type": "v",
        "meaning": "phát triển",
        "example": "They are developing a new marketing strategy."
      }
    ],
    "questions": [
      {
        "id": 7,
        "text": "The marketing team is ------- the new packaging this week.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Hành động đang diễn ra trong tuần này dùng is evaluating."
      },
      {
        "id": 9,
        "text": "This trademark ------- to our subsidiary in Singapore.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Động từ belong chỉ sở hữu, không dùng tiếp diễn ➔ belongs to."
      }
    ]
  },
  {
    "lesson": 5,
    "date": "27/09/2026",
    "title": "Finance, Banking & Accounting",
    "grammar": {
      "concept": "Modal Verbs (Động từ khiếm khuyết: must, should, can, will)",
      "trap": "Sau modal verb bắt buộc là Bare Infinitive (Động từ nguyên mẫu không to)."
    },
    "vocab": [
      {
        "word": "evaluate",
        "type": "v",
        "meaning": "đánh giá",
        "example": "Managers must evaluate employee performance yearly."
      },
      {
        "word": "gather",
        "type": "v",
        "meaning": "thu thập, tập hợp",
        "example": "We gathered data from thousands of users."
      },
      {
        "word": "offer",
        "type": "n",
        "meaning": "lời đề nghị, chào hàng",
        "example": "The company accepted an attractive takeover offer."
      },
      {
        "word": "primarily",
        "type": "adv",
        "meaning": "chủ yếu là",
        "example": "The report is primarily concerned with domestic sales."
      },
      {
        "word": "risk",
        "type": "n",
        "meaning": "rủi ro",
        "example": "Investing abroad carries high financial risk."
      },
      {
        "word": "strategy",
        "type": "n",
        "meaning": "chiến lược",
        "example": "Our long-term strategy focuses on sustainability."
      },
      {
        "word": "strong",
        "type": "adj",
        "meaning": "mạnh mẽ, kiên cố",
        "example": "The company posted strong quarterly profits."
      },
      {
        "word": "substitute",
        "type": "v",
        "meaning": "thay thế",
        "example": "You can substitute olive oil for butter in the recipe."
      },
      {
        "word": "accommodate",
        "type": "v",
        "meaning": "đáp ứng, chứa được",
        "example": "The auditorium can accommodate up to 500 guests."
      },
      {
        "word": "arrangement",
        "type": "n",
        "meaning": "sự sắp xếp, thỏa thuận",
        "example": "We made special arrangements for travel."
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "All department heads must ------- their annual budgets by Friday.",
        "chosen": "A",
        "correct": "A",
        "is_correct": true
      },
      {
        "id": 2,
        "text": "The firm will accommodate ------- requests whenever possible.",
        "chosen": "B",
        "correct": "B",
        "is_correct": true
      }
    ]
  },
  {
    "lesson": 6,
    "date": "28/09/2026",
    "title": "Human Resources & Recruitment",
    "grammar": {
      "concept": "Past Continuous with While/When (Quá khứ tiếp diễn với While/When)",
      "trap": "Hành động đang xảy ra (chia quá khứ tiếp diễn) thì hành động khác xen vào (quá khứ đơn)."
    },
    "vocab": [
      {
        "word": "association",
        "type": "n",
        "meaning": "hiệp hội, sự liên kết",
        "example": "She is a member of the American Bar Association."
      },
      {
        "word": "attend",
        "type": "v",
        "meaning": "tham dự",
        "example": "Over 200 managers attended the annual conference."
      },
      {
        "word": "get in touch",
        "type": "phrase",
        "meaning": "liên lạc",
        "example": "Please get in touch with our HR department."
      },
      {
        "word": "hold",
        "type": "v",
        "meaning": "tổ chức, nắm giữ",
        "example": "The seminar will be held on the third floor."
      },
      {
        "word": "location",
        "type": "n",
        "meaning": "địa điểm",
        "example": "The company is seeking a prime location downtown."
      },
      {
        "word": "overcrowded",
        "type": "adj",
        "meaning": "quá đông đúc",
        "example": "The trade show floor was extremely overcrowded."
      },
      {
        "word": "register",
        "type": "v",
        "meaning": "đăng ký",
        "example": "Participants must register before October 15."
      },
      {
        "word": "select",
        "type": "v",
        "meaning": "lựa chọn",
        "example": "The committee selected three final candidates."
      },
      {
        "word": "session",
        "type": "n",
        "meaning": "phiên họp, buổi làm việc",
        "example": "The morning training session begins at 9:00 AM."
      },
      {
        "word": "take part in",
        "type": "phrase",
        "meaning": "tham gia vào",
        "example": "All employees are invited to take part in the charity run."
      }
    ],
    "questions": [
      {
        "id": 13,
        "text": "While the director ------- the presentation, the power went out.",
        "chosen": "B",
        "correct": "C",
        "is_correct": false,
        "expl": "Hành động đang diễn ra trong quá khứ dùng was giving."
      },
      {
        "id": 16,
        "text": "When the auditor arrived, the team ------- the financial statements.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Hành động đang diễn ra dùng were reviewing."
      }
    ]
  },
  {
    "lesson": 7,
    "date": "29/09/2026",
    "title": "Customer Service & Relations",
    "grammar": {
      "concept": "Subject-Verb Agreement (Sự hòa hợp Chủ ngữ và Động từ)",
      "trap": "Chủ ngữ danh từ số ít (The office, The system) động từ to-be quá khứ là was, không dùng were."
    },
    "vocab": [
      {
        "word": "allocate",
        "type": "v",
        "meaning": "cấp phát, phân bổ",
        "example": "The board allocated  to customer service technology."
      },
      {
        "word": "capacity",
        "type": "n",
        "meaning": "sức chứa, công suất",
        "example": "The server has reached its storage capacity."
      },
      {
        "word": "durable",
        "type": "adj",
        "meaning": "bền bỉ, lâu bền",
        "example": "The new office furniture is stylish and durable."
      },
      {
        "word": "initiative",
        "type": "n",
        "meaning": "sáng kiến",
        "example": "She took the initiative to improve customer onboarding."
      },
      {
        "word": "physically",
        "type": "adv",
        "meaning": "về mặt thể chất/vật lý",
        "example": "The backup servers are physically isolated."
      },
      {
        "word": "provider",
        "type": "n",
        "meaning": "nhà cung cấp",
        "example": "We switched to a more reliable internet provider."
      },
      {
        "word": "recur",
        "type": "v",
        "meaning": "tái diễn, lặp lại",
        "example": "Software bugs must not recur in production."
      },
      {
        "word": "reduction",
        "type": "n",
        "meaning": "sự cắt giảm",
        "example": "The new process resulted in a 30% reduction in errors."
      },
      {
        "word": "stay on top of",
        "type": "phrase",
        "meaning": "nắm bắt kịp thời",
        "example": "Support agents must stay on top of open tickets."
      },
      {
        "word": "stock",
        "type": "n",
        "meaning": "hàng tồn kho, cổ phần",
        "example": "Replacement parts are kept in stock at all times."
      }
    ],
    "questions": [
      {
        "id": 2,
        "text": "The regional office ------- closed yesterday for renovations.",
        "chosen": "B",
        "correct": "A",
        "is_correct": false,
        "expl": "The regional office là danh từ số ít ➔ was closed."
      }
    ]
  },
  {
    "lesson": 8,
    "date": "01/10/2026",
    "title": "Shipping & Logistics Operations",
    "grammar": {
      "concept": "Present Simple for Habitual Truths (Hiện tại đơn chỉ sự thật hiển nhiên)",
      "trap": "Chủ ngữ ngôi thứ 3 số ít động từ thêm s/es (The container holds, không dùng is holding)."
    },
    "vocab": [
      {
        "word": "appreciate",
        "type": "v",
        "meaning": "đánh giá cao, cảm kích",
        "example": "We appreciate your prompt response to our inquiry."
      },
      {
        "word": "bring in",
        "type": "phrase",
        "meaning": "mang lại (lợi nhuận), tuyển dụng",
        "example": "The new campaign brought in thousands of new customers."
      },
      {
        "word": "casual",
        "type": "adj",
        "meaning": "bình thường, không trang trọng",
        "example": "The company maintains a business-casual dress code."
      },
      {
        "word": "code",
        "type": "n",
        "meaning": "quy tắc, quy chuẩn",
        "example": "Employees must adhere to the professional code of conduct."
      },
      {
        "word": "expose",
        "type": "v",
        "meaning": "tiếp xúc, phơi bày",
        "example": "The conference exposed our team to cutting-edge tools."
      },
      {
        "word": "glimpse",
        "type": "n",
        "meaning": "cái nhìn thoáng qua",
        "example": "The keynote gave a glimpse into the future of AI."
      },
      {
        "word": "made of",
        "type": "phrase",
        "meaning": "được làm từ",
        "example": "The packaging is made of 100% recycled paper."
      },
      {
        "word": "out of",
        "type": "phrase",
        "meaning": "hết (hàng)",
        "example": "We are currently out of stock for this printer model."
      },
      {
        "word": "outdated",
        "type": "adj",
        "meaning": "lỗi thời, lạc hậu",
        "example": "The company replaced its outdated billing software."
      },
      {
        "word": "practice",
        "type": "n",
        "meaning": "thực hành, thông lệ",
        "example": "It is standard business practice to sign an NDA."
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "All warehouse personnel ------- wear protective gear at all times.",
        "chosen": "D",
        "correct": "B",
        "is_correct": false,
        "expl": "Sau modal verb must là động từ nguyên mẫu bare infinitive (must wear)."
      },
      {
        "id": 4,
        "text": "Each standard shipping container ------- up to 20 metric tons.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Sự thật công suất dùng hiện tại đơn ngôi thứ 3: holds."
      }
    ]
  },
  {
    "lesson": 9,
    "date": "02/10/2026",
    "title": "Corporate Policies & Security",
    "grammar": {
      "concept": "Present Perfect with Number of Completed Items (Hiện tại hoàn thành chỉ số lượng)",
      "trap": "Khi nói về số lượng kết quả đã hoàn thành tính đến nay (written 5 reports) ➔ Dùng thì hoàn thành, không dùng tiếp diễn."
    },
    "vocab": [
      {
        "word": "reinforce",
        "type": "v",
        "meaning": "củng cố, tăng cường",
        "example": "The seminar reinforced the importance of cybersecurity."
      },
      {
        "word": "verbally",
        "type": "adv",
        "meaning": "bằng lời nói",
        "example": "The agreement was verbally confirmed before signing."
      },
      {
        "word": "device",
        "type": "n",
        "meaning": "thiết bị",
        "example": "Employees may connect personal devices to the guest Wi-Fi."
      },
      {
        "word": "facilitate",
        "type": "v",
        "meaning": "tạo điều kiện thuận lợi",
        "example": "The new intranet facilitates internal communication."
      },
      {
        "word": "network",
        "type": "n",
        "meaning": "mạng lưới, hệ thống mạng",
        "example": "A secure network is critical for corporate data."
      },
      {
        "word": "popularity",
        "type": "n",
        "meaning": "sự phổ biến",
        "example": "Cloud services have gained immense popularity."
      },
      {
        "word": "process",
        "type": "n",
        "meaning": "quy trình, tiến trình",
        "example": "The onboarding process takes about three days."
      },
      {
        "word": "replace",
        "type": "v",
        "meaning": "thay thế",
        "example": "We replaced the old servers with high-speed SSDs."
      },
      {
        "word": "revolution",
        "type": "n",
        "meaning": "cuộc cách mạng",
        "example": "AI is driving a revolution in office productivity."
      },
      {
        "word": "sharp",
        "type": "adj",
        "meaning": "sắc bén, đột ngột",
        "example": "The company reported a sharp increase in quarterly revenue."
      }
    ],
    "questions": [
      {
        "id": 14,
        "text": "So far this month, our technical team ------- over fifty support tickets.",
        "chosen": "A",
        "correct": "B",
        "is_correct": false,
        "expl": "Có cụm so far this month chỉ số lượng kết quả hoàn thành ➔ has resolved."
      }
    ]
  }
];
let fullMistakesData = [
  {
    "lesson": 3,
    "date": "2026-09-25",
    "student": "Le Hang",
    "question": 7,
    "selected": "D",
    "correct": "B",
    "concept": "present_continuous_temporary_action",
    "explanation": "Lỗi bẫy: present continuous temporary action"
  },
  {
    "lesson": 3,
    "date": "2026-09-25",
    "student": "Le Hang",
    "question": 12,
    "selected": "A",
    "correct": "B",
    "concept": "noun_after_adjective_subject_position",
    "explanation": "Lỗi bẫy: noun after adjective subject position"
  },
  {
    "lesson": 3,
    "date": "2026-09-25",
    "student": "Le Hang",
    "question": 14,
    "selected": "A",
    "correct": "B",
    "concept": "compound_noun_expiration_date",
    "explanation": "Lỗi bẫy: compound noun expiration date"
  },
  {
    "lesson": 3,
    "date": "2026-09-25",
    "student": "Nguyen Dinh Toan",
    "question": 7,
    "selected": "C",
    "correct": "B",
    "concept": "present_continuous_temporary_action",
    "explanation": "Lỗi bẫy: present continuous temporary action"
  },
  {
    "lesson": 3,
    "date": "2026-09-25",
    "student": "Nguyen Dinh Toan",
    "question": 12,
    "selected": "C",
    "correct": "B",
    "concept": "noun_after_adjective_subject_position",
    "explanation": "Lỗi bẫy: noun after adjective subject position"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Nguyen Dinh Toan",
    "question": 7,
    "selected": "A",
    "correct": "B",
    "concept": "present_continuous_with_temporary_or_now",
    "explanation": "Lỗi bẫy: present continuous with temporary or now"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Nguyen Dinh Toan",
    "question": 8,
    "selected": "B",
    "correct": "A",
    "concept": "gerund_after_preposition_or_verb_pattern",
    "explanation": "Lỗi bẫy: gerund after preposition or verb pattern"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Nguyen Dinh Toan",
    "question": 9,
    "selected": "A",
    "correct": "B",
    "concept": "stative_verb_belong_no_continuous",
    "explanation": "Lỗi bẫy: stative verb belong no continuous"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Nguyen Dinh Toan",
    "question": 11,
    "selected": "A",
    "correct": "B",
    "concept": "word_form_characteristic_noun",
    "explanation": "Lỗi bẫy: word form characteristic noun"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Le Hang",
    "question": 6,
    "selected": "A",
    "correct": "B",
    "concept": "consider_in_continuous_meaning_weighing_options",
    "explanation": "Lỗi bẫy: consider in continuous meaning weighing options"
  },
  {
    "lesson": 4,
    "date": "2026-09-26",
    "student": "Le Hang",
    "question": 14,
    "selected": "C",
    "correct": "B",
    "concept": "present_continuous_temporary_this_month",
    "explanation": "Lỗi bẫy: present continuous temporary this month"
  },
  {
    "lesson": 6,
    "date": "2026-09-28",
    "student": "Le Hang",
    "question": 13,
    "selected": "B",
    "correct": "C",
    "concept": "past_continuous_with_while",
    "explanation": "Lỗi bẫy: past continuous with while"
  },
  {
    "lesson": 6,
    "date": "2026-09-28",
    "student": "Le Hang",
    "question": 16,
    "selected": "A",
    "correct": "B",
    "concept": "past_continuous_with_while",
    "explanation": "Lỗi bẫy: past continuous with while"
  },
  {
    "lesson": 6,
    "date": "2026-09-28",
    "student": "Nguyen Dinh Toan",
    "question": 12,
    "selected": "B",
    "correct": "A",
    "concept": "must_plus_base_verb",
    "explanation": "Lỗi bẫy: must plus base verb"
  },
  {
    "lesson": 6,
    "date": "2026-09-28",
    "student": "Nguyen Dinh Toan",
    "question": 16,
    "selected": "A",
    "correct": "B",
    "concept": "past_continuous_with_while",
    "explanation": "Lỗi bẫy: past continuous with while"
  },
  {
    "lesson": 7,
    "date": "2026-09-29",
    "student": "Nguyen Dinh Toan",
    "question": 2,
    "selected": "B",
    "correct": "A",
    "concept": "subject_verb_agreement_was_with_singular_office",
    "explanation": "Lỗi bẫy: subject verb agreement was with singular office"
  },
  {
    "lesson": 7,
    "date": "2026-09-29",
    "student": "Le Hang",
    "question": 4,
    "selected": "D",
    "correct": "B",
    "concept": "present_simple_habitual_holds_vs_past_plural",
    "explanation": "Lỗi bẫy: present simple habitual holds vs past plural"
  },
  {
    "lesson": 8,
    "date": "2026-10-01",
    "student": "Nguyen Dinh Toan",
    "question": 1,
    "selected": "D",
    "correct": "B",
    "concept": "modal_verb_must_plus_bare_infinitive",
    "explanation": "Lỗi bẫy: modal verb must plus bare infinitive"
  },
  {
    "lesson": 8,
    "date": "2026-10-01",
    "student": "Nguyen Dinh Toan",
    "question": 4,
    "selected": "A",
    "correct": "B",
    "concept": "present_simple_habitual_holds_vs_continuous",
    "explanation": "Lỗi bẫy: present simple habitual holds vs continuous"
  },
  {
    "lesson": 8,
    "date": "2026-10-01",
    "student": "Nguyen Dinh Toan",
    "question": 8,
    "selected": "B",
    "correct": "C",
    "concept": "office_equipment_vocab_capacity_or_durable",
    "explanation": "Lỗi bẫy: office equipment vocab capacity or durable"
  },
  {
    "lesson": 9,
    "date": "2026-10-02",
    "student": "Nguyen Dinh Toan",
    "question": 14,
    "selected": "A",
    "correct": "B",
    "concept": "present_perfect_result_number_of_items_finished",
    "explanation": "Lỗi bẫy: present perfect result number of items finished"
  }
];

// Load Full Archived Lessons and Mistakes from local JSON files
async function loadArchivedData() {
  try {
    const resL = await fetch('data/full_lessons_archive.json');
    if (resL.ok) {
      fullLessonsData = await resL.json();
    }
  } catch (e) {
    console.warn('Cannot load full_lessons_archive.json directly, fallback available');
  }

  try {
    const resM = await fetch('data/mistakes_full.json');
    if (resM.ok) {
      fullMistakesData = await resM.json();
    }
  } catch (e) {
    console.warn('Cannot load mistakes_full.json directly, fallback available');
  }
}

// Render Toàn bộ Mistake Bank Flashcards lọc theo học viên hiện tại
function renderFullMistakeBank() {
  const container = document.getElementById('flashcardsContainer');
  if (!container) return;
  container.innerHTML = '';

  const mistakes = fullMistakesData.filter(m => m.student === currentStudent);
  const countEl = document.getElementById('dashMistakeCount');
  if (countEl) countEl.innerText = `${mistakes.length} lỗi`;

  if (mistakes.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-6 rounded-3xl border border-[#E8E0D5] text-center space-y-2">
        <span class="text-3xl">🎉</span>
        <p class="text-sm font-bold text-[#1C1917]">Tuyệt vời! Không có lỗi sai tồn đọng</p>
        <p class="text-xs text-[#78716C]">Bạn đã làm chủ toàn bộ các câu hỏi từ các bài học trước.</p>
      </div>
    `;
    return;
  }

  mistakes.forEach(m => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-xs cursor-pointer hover:border-[#F5A623] transition-all space-y-3';
    card.onclick = () => card.querySelector('.fc-back').classList.toggle('hidden');

    card.innerHTML = `
      <div class="flex items-center justify-between text-xs font-bold">
        <span class="text-[#D4891A] bg-[#FDF3E0] px-2.5 py-0.5 rounded-md">Lesson ${m.lesson} • Câu ${m.question}</span>
        <span class="text-[11px] text-[#78716C]">Chạm để lật 🔄</span>
      </div>
      <p class="text-sm font-bold text-[#1C1917] leading-snug">
        Khái niệm bẫy thi: <span class="text-rose-600">${m.concept ? m.concept.replace(/_/g, ' ') : 'TOEIC Trap'}</span>
      </p>
      <div class="fc-back hidden pt-3 border-t border-[#E8E0D5] text-xs space-y-1.5 text-[#1C1917]">
        <div class="flex space-x-3 text-[11px] font-mono pb-1">
          <span>Bạn chọn: <b class="text-rose-600">${m.selected || '-'}</b></span>
          <span>Đáp án đúng: <b class="text-emerald-700">${m.correct || '-'}</b></span>
        </div>
        <p><b class="text-emerald-700">Giải thích cốt lõi:</b> ${m.explanation}</p>
        <p class="text-[#D4891A] font-medium italic">💡 Cần lưu ý khi gặp lại dạng câu này trong đề thi!</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectStudentDemo(name) {
  currentStudent = name;
  updateStudentUI();
  toggleStudentModal();
  renderHistoryLessons();
  renderFullMistakeBank();
}

// Fetch live data from backend server if running
async function fetchServerData() {
  try {
    const res = await fetch('http://localhost:18990/api/lesson/current');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        document.getElementById('headerSubtitle').innerText = `Target 650+ • Lesson ${data.next_lesson_number}`;
        document.getElementById('dashMistakeCount').innerText = `${data.mistake_bank_count} lỗi`;
      }
    }
  } catch (e) {
    // Chạy offline tĩnh bình thường
  }
}

// Render Historical Lessons List & Detail Modal
function renderHistoryLessons() {
  const container = document.getElementById('historyLessonsContainer');
  if (!container) return;
  container.innerHTML = '';

  historicalLessons.forEach(l => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4.5 rounded-3xl border border-[#E8E0D5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#F5A623] transition-all';
    card.onclick = () => openHistoryDetail(l.num);

    card.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-extrabold text-[#D4891A] bg-[#FDF3E0] px-2.5 py-0.5 rounded-md">Lesson ${l.num < 10 ? '0' + l.num : l.num}</span>
          <span class="text-xs text-[#78716C] font-semibold">${l.date}</span>
        </div>
        <h4 class="text-sm font-bold text-[#1C1917] leading-tight pt-0.5">${l.title}</h4>
        <p class="text-xs text-[#78716C]">Điểm số: <b class="text-emerald-700 font-bold">${currentStudent === 'Nguyen Dinh Toan' ? l.scoreToan : l.scoreHang}</b></p>
      </div>
      <div class="pl-3 flex-shrink-0">
        <span class="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#FDF3E0] text-[#D4891A] border border-[#E8E0D5] rounded-xl text-xs font-bold transition-all block">
          Xem ➔
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

function openHistoryDetail(lessonNum) {
  const lesson = historicalLessons.find(item => item.num === lessonNum);
  if (!lesson) return;

  const fullData = fullLessonsData.find(item => item.lesson === lessonNum);

  document.getElementById('histModalLessonBadge').innerText = `Lesson ${lesson.num < 10 ? '0' + lesson.num : lesson.num}`;
  document.getElementById('histModalTitle').innerText = lesson.title;
  document.getElementById('histModalDate').innerText = `Ngày học: ${lesson.date}`;

  // 1. Render Tab 1: 10 Từ vựng đầy đủ
  const vocabContainer = document.getElementById('histContentVocab');
  if (vocabContainer) {
    vocabContainer.innerHTML = '';
    const vocabs = fullData ? fullData.vocab : [];
    if (vocabs.length > 0) {
      vocabs.forEach(v => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5] flex items-center justify-between';
        item.innerHTML = `
          <div class="pr-2 space-y-0.5">
            <div class="flex items-center space-x-1.5">
              <span class="text-sm font-extrabold text-[#1C1917]">${v.word}</span>
              <span class="text-[10px] text-[#78716C] bg-white px-1.5 py-0.5 rounded border border-[#E8E0D5]">${v.type}</span>
            </div>
            <p class="text-xs text-[#D4891A] font-bold">${v.meaning}</p>
            <p class="text-[11px] text-[#78716C] italic">"${v.example}"</p>
          </div>
          <button onclick="speakWord('${v.word}')" class="p-2 bg-[#FDF3E0] text-[#D4891A] rounded-xl text-base flex-shrink-0">🔊</button>
        `;
        vocabContainer.appendChild(item);
      });
    } else {
      vocabContainer.innerHTML = '<p class="text-xs text-[#78716C] p-2">Đang nạp kho từ vựng...</p>';
    }
  }

  // 2. Render Tab 2: Ngữ pháp đầy đủ
  if (fullData && fullData.grammar) {
    document.getElementById('histGrammarTitle').innerText = fullData.grammar.concept || 'Ngữ pháp trọng tâm';
    document.getElementById('histGrammarDesc').innerText = 'Chủ điểm ngữ pháp cốt lõi thường xuyên xuất hiện trong Part 5 & 6 đề thi TOEIC.';
    document.getElementById('histGrammarTrap').innerText = fullData.grammar.trap || 'Cẩn thận các bẫy chia thì và thể bị động.';
  }

  // 3. Render Tab 3: Bài làm cũ & Câu sai
  const practiceContainer = document.getElementById('histContentPractice');
  if (practiceContainer) {
    practiceContainer.innerHTML = '';
    const questions = fullData ? fullData.questions : [];
    if (questions.length > 0) {
      questions.forEach((q, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5] space-y-1.5';
        qCard.innerHTML = `
          <div class="flex justify-between items-center text-xs font-bold">
            <span class="text-[#1C1917]">Câu ${idx + 1}</span>
            <span class="${q.is_correct ? 'text-emerald-700 bg-emerald-100/70' : 'text-rose-700 bg-rose-100/70'} px-2 py-0.5 rounded-full text-[10px]">
              ${q.is_correct ? 'ĐÚNG ✅' : 'SAI ❌'}
            </span>
          </div>
          <p class="text-xs text-[#1C1917] leading-relaxed">${q.text}</p>
          <div class="text-[11px] font-mono flex space-x-3 text-[#78716C]">
            <span>Bạn chọn: <b class="${q.is_correct ? 'text-emerald-700' : 'text-rose-600'}">${q.chosen}</b></span>
            <span>Đáp án: <b class="text-emerald-700">${q.correct}</b></span>
          </div>
          ${q.expl ? `<p class="text-[11px] text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200">⚠️ ${q.expl}</p>` : ''}
        `;
        practiceContainer.appendChild(qCard);
      });
    } else {
      practiceContainer.innerHTML = '<p class="text-xs text-[#78716C] p-2">Đạt kết quả tối đa, không có câu sai.</p>';
    }
  }

  // Mở tab Vocab mặc định
  switchHistTab('vocab');

  const modal = document.getElementById('modalHistoryDetail');
  if (modal) modal.classList.remove('hidden');
}

function switchHistTab(tab) {
  const tabs = ['vocab', 'grammar', 'practice'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabHist${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`histContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (t === tab) {
      if (btn) btn.className = 'flex-1 py-2.5 text-center border-b-2 border-[#F5A623] text-[#D4891A] font-extrabold';
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.className = 'flex-1 py-2.5 text-center text-[#78716C] hover:text-[#1C1917] border-b-2 border-transparent font-bold';
      if (content) content.classList.add('hidden');
    }
  });
}

function closeHistoryModal() {
  const modal = document.getElementById('modalHistoryDetail');
  if (modal) modal.classList.add('hidden');
}

// View Navigation Logic
function showView(viewId) {
  const views = ['viewDashboard', 'viewStudy', 'viewQuiz', 'viewResult', 'viewMistakeBank', 'viewHistory'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === viewId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  const navMap = {
    viewDashboard: 'navDash',
    viewStudy: 'navStudy',
    viewQuiz: 'navQuiz',
    viewHistory: 'navHistory',
    viewMistakeBank: 'navMistake'
  };

  Object.values(navMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.remove('text-[#F5A623]');
      btn.classList.add('text-[#78716C]');
    }
  });

  const activeNavId = navMap[viewId];
  if (activeNavId) {
    const activeBtn = document.getElementById(activeNavId);
    if (activeBtn) {
      activeBtn.classList.remove('text-[#78716C]');
      activeBtn.classList.add('text-[#F5A623]');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Study Tabs Navigation
function switchStudyTab(tab) {
  const tabs = ['review', 'vocab', 'grammar'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabStudy${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`studyContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (t === tab) {
      btn.className = 'flex-1 py-3 text-center border-b-2 border-[#F5A623] text-[#D4891A] font-extrabold';
      content.classList.remove('hidden');
    } else {
      btn.className = 'flex-1 py-3 text-center text-[#78716C] hover:text-[#1C1917] border-b-2 border-transparent font-bold';
      content.classList.add('hidden');
    }
  });
}

function startLessonStudy() {
  showView('viewStudy');
  switchStudyTab('review');
}

function startQuizDirectly() {
  currentQuestionIndex = 0;
  if (!isQuizSubmitted) {
    userAnswers = {};
  }
  showView('viewQuiz');
  loadCurrentQuestion();
}

// Web Speech API Pronunciation (Tối ưu cho Safari iOS)
function speakWord(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.volume = 1;
    // Bắt buộc gọi trực tiếp theo user gesture
    window.speechSynthesis.speak(utterance);
  } else {
    // Fallback audio Google Translate TTS
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(word)}`;
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.log('Audio playback prevented:', e));
  }
}

// Quiz Flow Implementation
function loadCurrentQuestion() {
  const q = quizQuestions[currentQuestionIndex];
  if (!q) return;

  // Header info
  document.getElementById('quizQuestionIndex').innerText = `Câu ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
  document.getElementById('quizSectionName').innerText = q.section;
  const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.getElementById('quizProgressBar').style.width = `${progressPercent}%`;

  // Question text
  document.getElementById('quizQuestionText').innerText = q.text;

  // Audio Box Visibility
  const audioBox = document.getElementById('quizAudioContainer');
  if (q.hasAudio) {
    audioBox.classList.remove('hidden');
  } else {
    audioBox.classList.add('hidden');
  }

  // Render Options
  const container = document.getElementById('quizOptionsContainer');
  container.innerHTML = '';

  const chosen = userAnswers[q.id];

  Object.entries(q.options).forEach(([letter, text]) => {
    const isSelected = chosen === letter;
    const btn = document.createElement('button');
    
    // Nếu đã submit ➔ Khóa không cho đổi đáp án
    if (!isQuizSubmitted) {
      btn.onclick = () => selectOption(letter);
    } else {
      btn.disabled = true;
    }

    btn.className = `w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between text-sm transition-all ${
      isSelected
        ? 'border-[#F5A623] bg-[#FDF3E0] text-[#1C1917] font-extrabold shadow-xs'
        : 'border-[#E8E0D5] bg-white hover:bg-[#FAF7F2] text-[#1C1917] font-semibold'
    } ${isQuizSubmitted ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`;

    btn.innerHTML = `
      <span class="flex items-center space-x-3.5">
        <span class="w-7 h-7 rounded-full ${isSelected ? 'bg-[#F5A623] text-white' : 'bg-[#FAF7F2] border border-[#E8E0D5] text-[#78716C]'} font-extrabold flex items-center justify-center text-xs flex-shrink-0">${letter}</span>
        <span class="leading-snug">${text}</span>
      </span>
      ${isSelected ? '<span class="text-[#D4891A] font-extrabold text-base">✓</span>' : ''}
    `;
    container.appendChild(btn);
  });

  // Prev / Next / Submit buttons logic
  const btnPrev = document.getElementById('btnPrevQuestion');
  const btnNext = document.getElementById('btnNextQuestion');
  const btnSubmit = document.getElementById('btnSubmitQuiz');

  btnPrev.disabled = currentQuestionIndex === 0;

  if (currentQuestionIndex === quizQuestions.length - 1) {
    btnNext.classList.add('hidden');
    if (!isQuizSubmitted) {
      btnSubmit.classList.remove('hidden');
    } else {
      btnSubmit.classList.add('hidden');
    }
  } else {
    btnNext.classList.remove('hidden');
    btnSubmit.classList.add('hidden');
  }
}

function selectOption(letter) {
  if (isQuizSubmitted) return; // Khóa sau khi nộp
  const q = quizQuestions[currentQuestionIndex];
  userAnswers[q.id] = letter;
  loadCurrentQuestion();
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadCurrentQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    loadCurrentQuestion();
  }
}

function toggleQuizAudio() {
  const q = quizQuestions[currentQuestionIndex];
  if (q && q.audioText) {
    speakWord(q.audioText);
  }
}

// Submit Quiz and Lock Answers
function submitQuiz() {
  isQuizSubmitted = true; // KHÓA ĐÁP ÁN

  let reviewScore = 0;
  let reviewTotal = 0;
  let practiceScore = 0;
  let practiceTotal = 0;

  quizQuestions.forEach(q => {
    const isCorrect = userAnswers[q.id] === q.correctAnswer;
    if (q.type === 'Review') {
      reviewTotal++;
      if (isCorrect) reviewScore++;
    } else {
      practiceTotal++;
      if (isCorrect) practiceScore++;
    }
  });

  const totalScore = reviewScore + practiceScore;
  const totalQuestions = reviewTotal + practiceTotal;
  const overallAccuracy = ((totalScore / totalQuestions) * 100).toFixed(1);

  lastQuizResults = {
    reviewScore,
    reviewTotal,
    practiceScore,
    practiceTotal,
    totalScore,
    totalQuestions,
    overallAccuracy,
    answers: { ...userAnswers }
  };

  // Cập nhật thẻ trên Dashboard để sau này mở lại bất cứ lúc nào
  const cardRecent = document.getElementById('cardRecentResult');
  if (cardRecent) cardRecent.classList.remove('hidden');

  // Update Score Card UI
  document.getElementById('resScoreReview').innerText = `${reviewScore}/${reviewTotal} • ${reviewTotal > 0 ? ((reviewScore/reviewTotal)*100).toFixed(1) : 0}%`;
  document.getElementById('resScorePractice').innerText = `${practiceScore}/${practiceTotal} • ${practiceTotal > 0 ? ((practiceScore/practiceTotal)*100).toFixed(1) : 0}%`;
  document.getElementById('resScoreTotal').innerText = `${totalScore}/${totalQuestions} • ${overallAccuracy}%`;

  // Render Breakdown: Bảng dạng cột chuẩn ChatGPT kèm giải thích tại dòng nếu SAI
  const listContainer = document.getElementById('resultAnswersList');
  listContainer.innerHTML = '';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'bg-white rounded-3xl border border-[#E8E0D5] shadow-xs overflow-hidden';

  let tableRowsHtml = '';

  quizQuestions.forEach((q, idx) => {
    const userPick = userAnswers[q.id] || '-';
    const isCorrect = userPick === q.correctAnswer;

    tableRowsHtml += `
      <div class="border-b border-[#E8E0D5] last:border-b-0">
        <!-- Dòng kết quả dạng cột -->
        <div class="px-4 py-3.5 flex items-center justify-between text-xs font-semibold ${isCorrect ? 'bg-white' : 'bg-rose-50/40'}">
          <div class="w-2/5 pr-2">
            <span class="font-bold text-[#1C1917] block">Câu ${idx + 1}</span>
            <span class="text-[10px] text-[#78716C] block truncate">${q.section}</span>
          </div>
          <div class="w-1/5 text-center">
            <span class="text-[11px] text-[#78716C] block text-[9px] uppercase">Chọn</span>
            <span class="font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'} text-sm">${userPick}</span>
          </div>
          <div class="w-1/5 text-center">
            <span class="text-[11px] text-[#78716C] block text-[9px] uppercase">Đáp án</span>
            <span class="font-bold text-emerald-700 text-sm">${q.correctAnswer}</span>
          </div>
          <div class="w-1/5 text-right flex justify-end">
            <span class="${isCorrect ? 'text-emerald-700 bg-emerald-100/60' : 'text-rose-700 bg-rose-100/80'} px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center space-x-1">
              <span>${isCorrect ? '✅ Đúng' : '❌ Sai'}</span>
            </span>
          </div>
        </div>

        <!-- Nếu câu SAI: Giải thích ngữ pháp & bẫy thi ngay tại dòng đó -->
        ${!isCorrect ? `
          <div class="px-4 py-3 bg-[#FAF7F2] border-t border-dashed border-[#E8E0D5] text-xs space-y-1.5">
            <p class="text-xs text-[#1C1917] font-medium leading-relaxed italic">"${q.text}"</p>
            <div class="p-2.5 bg-white rounded-xl border border-rose-200/70 text-[11px] text-[#1C1917] space-y-1">
              <p class="font-bold text-rose-700">⚠️ Giải thích cốt lõi & bẫy thi:</p>
              <p class="text-[#78716C] leading-relaxed">${q.explanation}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  tableWrapper.innerHTML = `
    <!-- Header của bảng -->
    <div class="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#E8E0D5] flex items-center justify-between text-[11px] font-extrabold text-[#78716C] uppercase tracking-wider">
      <span class="w-2/5">Câu hỏi</span>
      <span class="w-1/5 text-center">Bạn chọn</span>
      <span class="w-1/5 text-center">Đáp án</span>
      <span class="w-1/5 text-right">Kết quả</span>
    </div>
    ${tableRowsHtml}
  `;

  listContainer.appendChild(tableWrapper);

  // Show Result View
  showView('viewResult');
}
