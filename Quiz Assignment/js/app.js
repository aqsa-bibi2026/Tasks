(() => {
  "use strict";

  const QUESTION_BANK = [
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1, explanation: "Mars looks reddish because iron minerals in its soil have oxidized, or rusted." },
    { q: "What does HTML stand for?", options: ["Hyper Trainer Marking Language", "High Text Machine Language", "HyperText Markup Language", "Hyperlink Text Management Language"], answer: 2, explanation: "HTML is the standard markup language used to structure content on web pages." },
    { q: "Which ocean is the largest on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], answer: 3, explanation: "The Pacific Ocean is the largest and deepest of Earth's five oceanic divisions." },
    { q: "Which language runs natively in a web browser?", options: ["JavaScript", "C++", "Python", "Java"], answer: 0, explanation: "JavaScript is the main programming language supported directly by modern browsers." },
    { q: "How many sides does a hexagon have?", options: ["Five", "Six", "Seven", "Eight"], answer: 1, explanation: "A hexagon is a polygon with six sides and six angles." },
    { q: "What is the chemical symbol for gold?", options: ["Ag", "Gd", "Au", "Go"], answer: 2, explanation: "Au comes from the Latin word aurum, meaning gold." },
    { q: "Which device is primarily used to route data between networks?", options: ["Monitor", "Keyboard", "Scanner", "Router"], answer: 3, explanation: "A router forwards data packets between different computer networks." },
    { q: "What is the capital city of Japan?", options: ["Kyoto", "Osaka", "Tokyo", "Nagoya"], answer: 2, explanation: "Tokyo is Japan's capital and one of the world's largest metropolitan areas." },
    { q: "Which CSS property changes the text color?", options: ["font-style", "color", "text-weight", "background"], answer: 1, explanation: "The CSS color property sets the foreground color of an element's text." },
    { q: "What is 12 × 8?", options: ["88", "92", "96", "108"], answer: 2, explanation: "12 multiplied by 8 equals 96." },
    { q: "Which part of a plant usually absorbs water from soil?", options: ["Flower", "Leaves", "Stem", "Roots"], answer: 3, explanation: "Roots absorb water and minerals from the soil and anchor the plant." },
    { q: "Which one is an example of renewable energy?", options: ["Solar power", "Coal", "Natural gas", "Petroleum"], answer: 0, explanation: "Solar power is replenished naturally by sunlight." }
  ];
  const SEGMENT_COLORS = ["#7867f5", "#28b990", "#f4b84c", "#e976a8", "#4d9bea", "#9b76e8", "#32b9b2", "#f18b61"];
  const QUIZ_LENGTH = 8;
  const QUIZ_SECONDS = 120;
  const $ = (id) => document.getElementById(id);
  const els = {
    themeToggle: $("themeToggle"), themeIcon: $("themeIcon"), quizCard: $("quizCard"), resultCard: $("resultCard"),
    timer: $("timer"), timerWrap: $("timerWrap"), progressText: $("progressText"), progressPercent: $("progressPercent"),
    segmentedProgress: $("segmentedProgress"), questionArea: $("questionArea"), questionNumber: $("questionNumber"),
    questionText: $("questionText"), answerGrid: $("answerGrid"), feedback: $("feedback"), nextBtn: $("nextBtn"),
    resultHeading: $("resultHeading"), resultSubtitle: $("resultSubtitle"), scoreValue: $("scoreValue"),
    scoreRing: $("scoreRing"), correctCount: $("correctCount"), wrongCount: $("wrongCount"), timeUsed: $("timeUsed"),
    answerReview: $("answerReview"), downloadBtn: $("downloadBtn"), restartBtn: $("restartBtn"), pdfNote: $("pdfNote")
  };
  let questions = [], currentIndex = 0, selectedIndex = null, answers = [], secondsLeft = QUIZ_SECONDS;
  let timerId = null, startedAt = 0, finishedAt = 0, completed = false;

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function formatTime(total) {
    const n = Math.max(0, Math.floor(total));
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  }
  function makeSegments() {
    els.segmentedProgress.innerHTML = "";
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      const segment = document.createElement("span");
      segment.className = "progress-segment";
      segment.style.setProperty("--segment-color", SEGMENT_COLORS[i]);
      segment.dataset.index = String(i);
      els.segmentedProgress.appendChild(segment);
    }
  }
  function updateProgress() {
    const shown = Math.min(currentIndex + 1, QUIZ_LENGTH);
    els.progressText.innerHTML = `QUESTION ${String(shown).padStart(2, "0")} <span class="muted">/ ${String(QUIZ_LENGTH).padStart(2, "0")}</span>`;
    els.progressPercent.textContent = `${Math.round((currentIndex / QUIZ_LENGTH) * 100)}% complete`;
    els.segmentedProgress.setAttribute("aria-valuemax", String(QUIZ_LENGTH));
    els.segmentedProgress.setAttribute("aria-valuenow", String(currentIndex + 1));
    [...els.segmentedProgress.children].forEach((segment, index) => {
      segment.classList.toggle("done", index < currentIndex);
      segment.classList.toggle("current", index === currentIndex);
    });
  }
  function renderQuestion() {
    selectedIndex = null;
    const question = questions[currentIndex];
    els.questionArea.classList.remove("question-enter");
    void els.questionArea.offsetWidth;
    els.questionArea.classList.add("question-enter");
    els.questionNumber.textContent = String(currentIndex + 1).padStart(2, "0");
    els.questionText.textContent = question.q;
    els.answerGrid.innerHTML = "";
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    els.nextBtn.disabled = true;
    els.nextBtn.innerHTML = currentIndex === QUIZ_LENGTH - 1 ? 'See my results <span>↗</span>' : 'Next question <span>→</span>';
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.setAttribute("aria-label", `${String.fromCharCode(65 + index)}: ${option}`);
      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement("span");
      label.className = "option-text";
      label.textContent = option;
      const state = document.createElement("span");
      state.className = "option-state";
      state.setAttribute("aria-hidden", "true");
      state.textContent = "✓";
      button.append(letter, label, state);
      button.addEventListener("click", () => chooseAnswer(index));
      els.answerGrid.appendChild(button);
    });
    updateProgress();
  }
  function chooseAnswer(index) {
    if (selectedIndex !== null || completed) return;
    selectedIndex = index;
    const question = questions[currentIndex];
    const correct = index === question.answer;
    answers[currentIndex] = { selected: index, correct };
    [...els.answerGrid.children].forEach((button, i) => {
      button.disabled = true;
      if (i === question.answer) {
        button.classList.add("correct");
        button.querySelector(".option-state").textContent = "✓";
      } else if (i === index) {
        button.classList.add("incorrect");
        button.querySelector(".option-state").textContent = "×";
      }
    });
    els.feedback.classList.add(correct ? "good" : "bad");
    els.feedback.textContent = correct ? `Correct! ${question.explanation}` : `Not quite. ${question.explanation}`;
    els.nextBtn.disabled = false;
    if (currentIndex < QUIZ_LENGTH - 1) {
      els.segmentedProgress.children[currentIndex].classList.add("done");
    }
  }
  function tick() {
    secondsLeft = Math.max(0, secondsLeft - 1);
    els.timer.textContent = formatTime(secondsLeft);
    els.timerWrap.classList.toggle("urgent", secondsLeft <= 15);
    if (secondsLeft <= 0) finishQuiz(true);
  }
  function finishQuiz(timeUp = false) {
    if (completed) return;
    completed = true;
    clearInterval(timerId);
    finishedAt = Date.now();
    els.quizCard.classList.add("d-none");
    els.resultCard.classList.remove("d-none");
    const correct = answers.filter((a) => a && a.correct).length;
    const attempted = answers.filter(Boolean).length;
    const score = Math.round((correct / QUIZ_LENGTH) * 100);
    const used = QUIZ_SECONDS - secondsLeft;
    els.resultHeading.textContent = score >= 88 ? "Outstanding work!" : score >= 63 ? "Nicely done!" : "Keep that curiosity!";
    els.resultSubtitle.textContent = timeUp ? "Time is up — your results are ready." : "Every round is a chance to learn something new.";
    els.scoreValue.textContent = `${score}%`;
    els.scoreRing.style.setProperty("--score-angle", `${score * 3.6}deg`);
    els.correctCount.textContent = String(correct);
    els.wrongCount.textContent = String(QUIZ_LENGTH - correct);
    els.timeUsed.textContent = formatTime(used);
    els.pdfNote.textContent = `${attempted} of ${QUIZ_LENGTH} questions answered${timeUp ? " · Time limit reached" : ""}. Download a copy of your report below.`;
    els.answerReview.innerHTML = "";
    questions.forEach((q, i) => {
      const record = answers[i];
      const item = document.createElement("div");
      item.className = "review-item";
      const title = document.createElement("div");
      title.className = "review-q";
      title.textContent = `${String(i + 1).padStart(2, "0")}. ${q.q}`;
      const detail = document.createElement("div");
      detail.className = "review-answer";
      detail.textContent = `Your answer: ${record ? q.options[record.selected] : "Not answered"} · Correct answer: ${q.options[q.answer]}`;
      const status = document.createElement("div");
      status.className = `review-status ${record && record.correct ? "ok" : "no"}`;
      status.textContent = record && record.correct ? "✓ CORRECT" : "× INCORRECT";
      item.append(title, detail, status);
      els.answerReview.appendChild(item);
    });
    els.resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function startQuiz() {
    clearInterval(timerId);
    questions = shuffle(QUESTION_BANK).slice(0, QUIZ_LENGTH).map((item) => {
      const options = item.options.map((text, oldIndex) => ({ text, oldIndex }));
      const shuffledOptions = shuffle(options);
      return { ...item, options: shuffledOptions.map((x) => x.text), answer: shuffledOptions.findIndex((x) => x.oldIndex === item.answer) };
    });
    currentIndex = 0;
    selectedIndex = null;
    answers = [];
    secondsLeft = QUIZ_SECONDS;
    completed = false;
    startedAt = Date.now();
    finishedAt = 0;
    els.timer.textContent = formatTime(secondsLeft);
    els.timerWrap.classList.remove("urgent");
    els.resultCard.classList.add("d-none");
    els.quizCard.classList.remove("d-none");
    makeSegments();
    renderQuestion();
    timerId = setInterval(tick, 1000);
  }
  function downloadPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      els.pdfNote.textContent = "PDF library did not load. Please check your internet connection and try again.";
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    let y = 20;
    doc.setFillColor(104, 87, 226);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("QuizMaster Pro", margin + 7, y + 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("PERSONAL QUIZ PERFORMANCE REPORT", margin + 7, y + 20);
    y += 39;
    const correct = answers.filter((a) => a && a.correct).length;
    const score = Math.round(correct / QUIZ_LENGTH * 100);
    doc.setTextColor(35, 35, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`Your score: ${score}%`, margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Correct: ${correct}/${QUIZ_LENGTH}    Incorrect: ${QUIZ_LENGTH - correct}/${QUIZ_LENGTH}    Time used: ${formatTime(QUIZ_SECONDS - secondsLeft)}`, margin, y);
    y += 12;
    doc.setDrawColor(225, 225, 239);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Answer review", margin, y);
    y += 8;
    questions.forEach((q, i) => {
      const record = answers[i];
      const questionLines = doc.splitTextToSize(`${i + 1}. ${q.q}`, pageWidth - margin * 2);
      const answerLines = doc.splitTextToSize(`Your answer: ${record ? q.options[record.selected] : "Not answered"} | Correct: ${q.options[q.answer]}`, pageWidth - margin * 2 - 3);
      const needed = questionLines.length * 5 + answerLines.length * 4.5 + 9;
      if (y + needed > 278) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 60);
      doc.text(questionLines, margin, y);
      y += questionLines.length * 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 98, 120);
      doc.text(answerLines, margin + 2, y);
      y += answerLines.length * 4.5 + 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(record && record.correct ? 28 : 215, record && record.correct ? 160 : 75, record && record.correct ? 118 : 104);
      doc.text(record && record.correct ? "CORRECT" : "INCORRECT", margin + 2, y);
      y += 7;
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 155);
    doc.text("Generated by QuizMaster Pro · Keep learning, one question at a time.", margin, 287);
    doc.save("QuizMaster-Pro-Results.pdf");
    els.pdfNote.textContent = "Your PDF report has been generated.";
  }
  els.nextBtn.addEventListener("click", () => {
    if (selectedIndex === null || completed) return;
    if (currentIndex === QUIZ_LENGTH - 1) { finishQuiz(false); return; }
    currentIndex++;
    renderQuestion();
  });
  els.restartBtn.addEventListener("click", () => { startQuiz(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  els.downloadBtn.addEventListener("click", downloadPDF);
  els.themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    els.themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    els.themeIcon.innerHTML = dark
      ? '<path d="M20.8 13A8.5 8.5 0 0 1 11 3.2 8.5 8.5 0 1 0 20.8 13Z"/>'
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>';
  });
  startQuiz();
})();