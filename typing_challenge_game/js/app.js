(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const screens = ["homeScreen", "setupScreen", "gameScreen", "resultScreen"];
  const config = {
    easy:   { bubbles: { speed: 34, spawn: 1450, count: 5, miss: 6, duration: 75 }, magnet: { duration: 60, penalty: 1, targetDelay: 0 } },
    medium: { bubbles: { speed: 48, spawn: 1150, count: 6, miss: 5, duration: 60 }, magnet: { duration: 45, penalty: 2, targetDelay: 0 } },
    hard:   { bubbles: { speed: 66, spawn: 850, count: 7, miss: 4, duration: 45 }, magnet: { duration: 30, penalty: 3, targetDelay: 0 } }
  };
  const keySets = {
    home: ["A","S","D","F","J","K","L"],
    top: ["Q","W","E","R","T","Y","U","I"],
    all: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  };
  const rows = ["QWERTYUIOP".split(""), "ASDFGHJKL".split(""), ["Z","X","C","V","B","N","M"]];
  let mode = "bubbles", difficulty = "easy", game = null, rafId = null, spawnId = null, clockId = null;
  let lastFrame = 0, lastSpawn = 0, bubbleId = 0, soundOn = false, audioContext = null;

  function showScreen(id) {
    screens.forEach(name => $("#" + name).classList.toggle("active", name === id));
  }
  function stopLoops() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (spawnId !== null) clearInterval(spawnId);
    if (clockId !== null) clearInterval(clockId);
    rafId = spawnId = clockId = null;
  }
  function cleanGame() {
    stopLoops();
    window.removeEventListener("keydown", handleKeydown);
    if (feedbackTimeout !== null) clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
    const feedback = $("#feedbackToast");
    if (feedback) feedback.classList.remove("show");
    game = null;
  }
  function goHome() {
    cleanGame();
    showScreen("homeScreen");
  }
  function resetSession() {
    // Reset clears the active run and returns to its settings; Restart starts a fresh run immediately.
    cleanGame();
    showScreen("setupScreen");
    toast("Session reset. Review your settings and start again.");
  }
  function setup(modeName) {
    cleanGame();
    mode = modeName;
    difficulty = "easy";
    $$(".difficulty-option").forEach(el => el.classList.toggle("selected", el.dataset.difficulty === difficulty));
    const isBubbles = mode === "bubbles";
    $("#setupTitle").innerHTML = isBubbles ? "Bubbles<span>.</span>" : "KeyMagnet<span>.</span>";
    $("#setupDescription").textContent = isBubbles
      ? "Pop the letters before they float away. Every correct keypress earns points."
      : "Lock onto the target key and strike with precision. Train your accuracy and reaction time.";
    $("#setupTip").textContent = isBubbles
      ? "Keep your eyes moving and focus on the lowest bubbles first."
      : "Keep your fingers relaxed on the home row and watch the target.";
    $("#keySetField").classList.toggle("hidden", isBubbles);
    $("#rulesTitle").textContent = isBubbles ? "How to play" : "How to play";
    $("#rulesText").textContent = isBubbles
      ? "Press the matching letter on your physical keyboard. Wrong keys cost 2 points; missed bubbles count toward the miss limit."
      : "Press the highlighted target on your keyboard. Correct keys earn points; wrong keys reduce your score. Accuracy and average reaction time are tracked.";
    showScreen("setupScreen");
  }
  function updateDifficulty(value) {
    difficulty = value;
    $$(".difficulty-option").forEach(el => el.classList.toggle("selected", el.dataset.difficulty === value));
  }
  function statMarkup(label, value, id, suffix = "") {
    return `<div class="stat-box"><span>${label}</span><strong id="${id}">${value}${suffix}</strong></div>`;
  }
  function updateStats() {
    if (!game) return;
    if (mode === "bubbles") {
      $("#statsStrip").innerHTML =
        statMarkup("SCORE", game.score, "statScore") +
        statMarkup("TIME LEFT", game.timeLeft, "statTime", " <em>SEC</em>") +
        statMarkup("MISSES", `${game.misses}/${game.maxMisses}`, "statMisses") +
        statMarkup("POPPED", game.correct, "statCorrect");
    } else {
      $("#statsStrip").innerHTML =
        statMarkup("SCORE", game.score, "statScore") +
        statMarkup("TIME LEFT", game.timeLeft, "statTime", " <em>SEC</em>") +
        statMarkup("CORRECT", game.correct, "statCorrect") +
        statMarkup("INCORRECT", game.incorrect, "statIncorrect");
    }
  }
  function startGame() {
    cleanGame();
    const rules = config[difficulty][mode];
    game = {
      score: 0, correct: 0, incorrect: 0, misses: 0, maxMisses: mode === "bubbles" ? rules.miss : 0,
      timeLeft: mode === "bubbles" ? rules.duration : rules.duration,
      duration: rules.duration, running: true, paused: false, bubbles: [],
      startedAt: 0, responseTimes: [], targetStarted: 0, target: "", keySet: $("#keySetSelect").value,
      combo: 0, bestCombo: 0, totalResponses: 0, lastTick: Date.now()
    };
    $("#gameModeName").textContent = mode === "bubbles" ? "BUBBLES" : "KEYMAGNET";
    $("#gameDifficulty").textContent = difficulty.toUpperCase() + " MODE";
    $("#gameInstruction").textContent = mode === "bubbles"
      ? "Press the letter on your keyboard to pop its bubble."
      : "Find the highlighted key and press it on your physical keyboard.";
    $("#bottomHint").textContent = mode === "bubbles" ? `${game.maxMisses} misses allowed before game over.` : "Build your score before the timer runs out.";
    $("#bubbleLayer").innerHTML = "";
    $("#bubbleLayer").classList.toggle("hidden", mode !== "bubbles");
    $("#magnetStage").classList.toggle("hidden", mode !== "magnet");
    $("#fieldStatus").textContent = "● LIVE SESSION";
    $("#pausedOverlay").classList.add("hidden");
    $("#pauseGame").textContent = "Ⅱ Pause";
    updateStats();
    showScreen("gameScreen");
    window.addEventListener("keydown", handleKeydown);
    game.startedAt = performance.now();
    if (mode === "bubbles") startBubbles();
    else startMagnet();
    clockId = setInterval(tickClock, 1000);
  }
  function tickClock() {
    if (!game || !game.running || game.paused) return;
    game.timeLeft = Math.max(0, game.timeLeft - 1);
    const timeEl = $("#statTime");
    if (timeEl) timeEl.innerHTML = `${game.timeLeft} <em>SEC</em>`;
    if (game.timeLeft <= 0) endGame("time");
  }
  function startBubbles() {
    const rules = config[difficulty].bubbles;
    for (let i = 0; i < rules.count; i++) spawnBubble(true);
    lastFrame = performance.now();
    lastSpawn = lastFrame;
    function animate(now) {
      if (!game || !game.running) return;
      if (game.paused) { rafId = requestAnimationFrame(animate); return; }
      const delta = Math.min((now - lastFrame) / 1000, .05);
      lastFrame = now;
      const currentRules = config[difficulty].bubbles;
      game.bubbles.forEach(bubble => {
        bubble.y -= bubble.speed * delta;
        bubble.el.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`;
      });
      const missed = game.bubbles.filter(b => b.y < -65);
      missed.forEach(b => removeBubble(b, false));
      if (now - lastSpawn > currentRules.spawn && game.bubbles.length < currentRules.count + (game.score >= 100 ? 2 : 0)) {
        spawnBubble(false);
        lastSpawn = now;
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
  }
  function spawnBubble(initial) {
    if (!game) return;
    const layer = $("#bubbleLayer");
    const width = layer.clientWidth || 700;
    const height = layer.clientHeight || 430;
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const el = document.createElement("div");
    el.className = "game-bubble";
    el.textContent = letter;
    const x = 20 + Math.random() * Math.max(30, width - 78);
    const y = initial ? 30 + Math.random() * Math.max(80, height - 140) : height + 8;
    const speed = config[difficulty].bubbles.speed * (1 + Math.min(game.score / 300, .8));
    const bubble = { id: ++bubbleId, letter, x, y, speed, el };
    el.style.transform = `translate(${x}px, ${y}px)`;
    layer.appendChild(el);
    game.bubbles.push(bubble);
  }
  function removeBubble(bubble, popped) {
    if (!game) return;
    const index = game.bubbles.indexOf(bubble);
    if (index < 0) return;
    game.bubbles.splice(index, 1);
    if (popped) {
      bubble.el.classList.add("hit");
      setTimeout(() => bubble.el.remove(), 220);
    } else {
      bubble.el.remove();
      game.misses++;
      game.combo = 0;
      showFeedback("BUBBLE MISSED  −1 LIFE", false);
      playTone(150, .08);
      updateStats();
      if (game.misses >= game.maxMisses) endGame("misses");
    }
  }
  function startMagnet() {
    renderKeyboard();
    chooseTarget();
  }
  function renderKeyboard() {
    const container = $("#virtualKeyboard");
    container.innerHTML = "";
    const allowed = keySets[game.keySet];
    rows.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "virtual-row";
      row.filter(key => allowed.includes(key)).forEach(key => {
        const keyEl = document.createElement("span");
        keyEl.className = "virtual-key";
        keyEl.dataset.key = key;
        keyEl.textContent = key;
        rowEl.appendChild(keyEl);
      });
      if (rowEl.children.length) container.appendChild(rowEl);
    });
  }
  function chooseTarget() {
    if (!game || !game.running) return;
    const set = keySets[game.keySet];
    game.target = set[Math.floor(Math.random() * set.length)];
    game.targetStarted = performance.now();
    $("#targetKey").textContent = game.target;
    $$(".virtual-key").forEach(el => el.classList.toggle("active", el.dataset.key === game.target));
  }
  function handleKeydown(event) {
    if (!game || !game.running) return;
    if (event.key === "Escape") { endGame("quit"); return; }
    if (event.key.toLowerCase() === "p" && !event.repeat) { togglePause(); return; }
    if (game.paused || event.repeat) return;
    const key = event.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;
    if (mode === "bubbles") handleBubbleKey(key);
    else handleMagnetKey(key);
  }
  function handleBubbleKey(key) {
    const match = game.bubbles.filter(b => b.letter === key).sort((a,b) => b.y - a.y)[0];
    if (match) {
      removeBubble(match, true);
      game.score += 10;
      game.correct++;
      game.combo++;
      game.bestCombo = Math.max(game.bestCombo, game.combo);
      showFeedback("PERFECT HIT  +10", true);
      playTone(620, .07);
    } else {
      game.incorrect++;
      game.combo = 0;
      game.score = Math.max(0, game.score - 2);
      showFeedback("WRONG KEY  −2 POINTS", false);
      playTone(180, .09);
      const bubble = game.bubbles[0];
      if (bubble) { bubble.el.classList.remove("wrong"); void bubble.el.offsetWidth; bubble.el.classList.add("wrong"); }
    }
    updateStats();
  }
  function handleMagnetKey(key) {
    game.totalResponses++;
    if (key === game.target) {
      const elapsed = performance.now() - game.targetStarted;
      game.responseTimes.push(elapsed);
      game.correct++;
      game.score += Math.max(5, 15 - Math.floor(elapsed / 350));
      game.combo++;
      game.bestCombo = Math.max(game.bestCombo, game.combo);
      showFeedback(`LOCKED IN  +${Math.max(5, 15 - Math.floor(elapsed / 350))}`, true);
      playTone(650, .07);
      const keyEl = $(`.virtual-key[data-key="${key}"]`);
      if (keyEl) { keyEl.classList.add("pressed"); setTimeout(() => keyEl.classList.remove("pressed"), 130); }
      updateStats();
      chooseTarget();
    } else {
      game.incorrect++;
      game.combo = 0;
      const penalty = config[difficulty].magnet.penalty;
      game.score = Math.max(0, game.score - penalty);
      showFeedback(`NOT QUITE  −${penalty} POINT${penalty > 1 ? "S" : ""}`, false);
      playTone(170, .09);
      updateStats();
    }
  }
  let feedbackTimeout = null;
  function showFeedback(message, good) {
    const el = $("#feedbackToast");
    el.textContent = message;
    el.className = `feedback-toast show ${good ? "good" : "bad"}`;
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => el.classList.remove("show"), 750);
  }
  function togglePause() {
    if (!game || !game.running) return;
    game.paused = !game.paused;
    $("#pausedOverlay").classList.toggle("hidden", !game.paused);
    $("#pauseGame").textContent = game.paused ? "▶ Resume" : "Ⅱ Pause";
    $("#fieldStatus").textContent = game.paused ? "Ⅱ PAUSED" : "● LIVE SESSION";
    if (!game.paused && mode === "bubbles") lastFrame = performance.now();
  }
  function endGame(reason) {
    if (!game || !game.running) return;
    game.running = false;
    stopLoops();
    window.removeEventListener("keydown", handleKeydown);
    $("#fieldStatus").textContent = "■ SESSION ENDED";
    const avg = game.responseTimes.length
      ? (game.responseTimes.reduce((a,b) => a+b, 0) / game.responseTimes.length / 1000).toFixed(2) + "s"
      : "—";
    const accuracy = game.totalResponses ? Math.round(game.correct / game.totalResponses * 100) + "%" : (game.correct ? "100%" : "0%");
    const title = reason === "quit" ? "Session ended" : reason === "misses" ? "Bubbles escaped" : game.score >= (mode === "bubbles" ? 100 : 120) ? "Brilliant run" : "Nice effort";
    $("#resultTitle").innerHTML = `${title}<span>.</span>`;
    $("#resultKicker").textContent = reason === "quit" ? "SESSION STOPPED" : "SESSION COMPLETE";
    $("#resultMessage").textContent = reason === "misses"
      ? "Too many bubbles got away. Reset, refocus, and give it another shot."
      : reason === "time" ? "Time is up. Your performance is ready for review."
      : reason === "quit" ? "Your session has been safely stopped. You can jump back in anytime."
      : "Every session makes you sharper. Keep building that keyboard confidence.";
    $("#resultEmblem").textContent = reason === "misses" ? "↗" : "✦";
    $("#finalScore").textContent = game.score;
    const stats = mode === "bubbles"
      ? [["BUBBLES POPPED", game.correct], ["MISSES", `${game.misses}/${game.maxMisses}`], ["BEST STREAK", game.bestCombo]]
      : [["CORRECT", game.correct], ["INCORRECT", game.incorrect], ["AVG. RESPONSE", avg], ["ACCURACY", accuracy], ["BEST STREAK", game.bestCombo], ["KEY SET", game.keySet.toUpperCase()]];
    $("#resultStats").innerHTML = stats.map(([label,value]) => `<div class="result-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
    showScreen("resultScreen");
    playTone(440, .15);
  }
  function playTone(frequency, duration) {
    if (!soundOn) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Audio is optional; gameplay remains available. */ }
  }
  function toast(message) {
    const region = $("#toastRegion");
    region.innerHTML = `<div class="toast-message">${message}</div>`;
    setTimeout(() => region.innerHTML = "", 1800);
  }

  $$(".mode-launch").forEach(button => button.addEventListener("click", () => setup(button.dataset.mode)));
  $$(".difficulty-option").forEach(button => button.addEventListener("click", () => updateDifficulty(button.dataset.difficulty)));
  $("#backHome").addEventListener("click", goHome);
  $("#brandHome").addEventListener("click", event => { event.preventDefault(); goHome(); });
  $("#startGame").addEventListener("click", startGame);
  $("#restartGame").addEventListener("click", () => { if (game) startGame(); });
  $("#resetGame").addEventListener("click", resetSession);
  $("#quitGame").addEventListener("click", () => endGame("quit"));
  $("#pauseGame").addEventListener("click", togglePause);
  $("#resumeGame").addEventListener("click", togglePause);
  $("#playAgain").addEventListener("click", startGame);
  $("#chooseMode").addEventListener("click", goHome);
  $("#soundToggle").addEventListener("click", () => {
    soundOn = !soundOn;
    $("#soundToggle").style.color = soundOn ? "var(--cyan)" : "var(--muted)";
    $("#soundToggle").title = soundOn ? "Sound on" : "Sound off";
    toast(soundOn ? "Sound effects enabled" : "Sound effects muted");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && game && game.running && !game.paused) togglePause();
  });
  // Ensure an animation loop is never left running after leaving a screen.
  window.addEventListener("beforeunload", cleanGame);
})();