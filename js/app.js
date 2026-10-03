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
let fullLessonsData = [];
let fullMistakesData = [];

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
