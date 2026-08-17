document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const els = {
    testMode: $("testMode"),
    manualMode: $("manualMode"),
    modeTitle: $("modeTitle"),
    testText: $("testText"),
    typingInput: $("typingInput"),
    inputHint: $("inputHint"),
    startBtn: $("startBtn"),
    finishBtn: $("finishBtn"),
    resetBtn: $("resetBtn"),
    timer: $("timer"),
    wpm: $("wpm"),
    accuracy: $("accuracy"),
    words: $("words"),
    statusText: $("statusText"),
    statusDot: $("statusDot"),
    resultSection: $("resultSection"),
    resultWpm: $("resultWpm"),
    resultAccuracy: $("resultAccuracy"),
    resultTime: $("resultTime"),
    resultWords: $("resultWords")
  };

  let mode = "test";
  let running = false;
  let startTime = 0;
  let interval = null;
  let sourceText = "";

  const texts = [
    "The quick brown fox jumps over the lazy dog. Typing regularly helps students improve their speed, accuracy and overall keyboard skills.",
    "Practice makes typing faster and more accurate. Focus on correct finger placement, steady rhythm and fewer mistakes.",
    "The Internet of Things connects sensors, devices and systems to collect data and automate useful actions."
  ];

  function currentText() {
    return texts[Math.floor(Math.random() * texts.length)];
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function renderText() {
    if (mode === "manual") {
      els.testText.textContent = "Manual Practice — type anything from your notes.";
      els.inputHint.textContent = "Type from your own notes";
      return;
    }

    els.testText.textContent = sourceText;
    els.inputHint.textContent = "Type the text shown above";
  }

  function calculate() {
    if (!running) return;

    const typed = els.typingInput.value;
    const seconds = Math.max((Date.now() - startTime) / 1000, 0.01);
    const minutes = seconds / 60;

    const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const wpm = Math.round((typed.length / 5) / minutes);

    let correct = 0;
    let errors = 0;

    if (mode === "test") {
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === sourceText[i]) correct++;
        else errors++;
      }
    }

    const accuracy = mode === "manual"
      ? null
      : Math.round((correct / Math.max(typed.length, 1)) * 100);

    els.timer.textContent = formatTime(seconds);
    els.wpm.textContent = Number.isFinite(wpm) ? wpm : 0;
    els.words.textContent = words;
    els.accuracy.textContent = accuracy === null ? "—" : `${accuracy}%`;

    if (mode === "test" && typed.length > sourceText.length) {
      errors += typed.length - sourceText.length;
    }

    if (mode === "test" && typed.length >= sourceText.length) {
      finish();
    }
  }

  function start() {
    if (running) return;

    sourceText = mode === "test" ? currentText() : "";
    renderText();

    els.typingInput.value = "";
    els.typingInput.disabled = false;
    els.typingInput.focus();

    running = true;
    startTime = Date.now();

    els.startBtn.disabled = true;
    els.finishBtn.disabled = false;
    els.statusText.textContent = "Typing...";
    els.statusDot.classList.add("running");

    clearInterval(interval);
    interval = setInterval(calculate, 100);
    calculate();
  }

  function finish() {
    if (!running) return;

    const typed = els.typingInput.value;
    const seconds = Math.max((Date.now() - startTime) / 1000, 0.01);
    const minutes = seconds / 60;
    const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const wpm = Math.round((typed.length / 5) / minutes);

    let correct = 0;
    let errors = 0;

    if (mode === "test") {
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === sourceText[i]) correct++;
        else errors++;
      }
    }

    const accuracy = mode === "manual"
      ? null
      : Math.round((correct / Math.max(typed.length, 1)) * 100);

    running = false;
    clearInterval(interval);

    els.typingInput.disabled = true;
    els.startBtn.disabled = false;
    els.finishBtn.disabled = true;

    els.statusText.textContent = "Completed";
    els.statusDot.classList.remove("running");

    els.timer.textContent = formatTime(seconds);
    els.wpm.textContent = Number.isFinite(wpm) ? wpm : 0;
    els.words.textContent = words;
    els.accuracy.textContent = accuracy === null ? "—" : `${accuracy}%`;

    els.resultWpm.textContent = `${Number.isFinite(wpm) ? wpm : 0} WPM`;
    els.resultAccuracy.textContent = accuracy === null ? "—" : `${accuracy}%`;
    els.resultTime.textContent = formatTime(seconds);
    els.resultWords.textContent = words;

    els.resultSection.style.display = "block";
    els.resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function reset() {
    clearInterval(interval);
    running = false;

    if (mode === "test") {
      sourceText = currentText();
    }

    renderText();

    els.typingInput.value = "";
    els.typingInput.disabled = true;

    els.startBtn.disabled = false;
    els.finishBtn.disabled = true;

    els.statusText.textContent = "Ready";
    els.statusDot.classList.remove("running");

    els.timer.textContent = "00:00";
    els.wpm.textContent = "0";
    els.words.textContent = "0";
    els.accuracy.textContent = mode === "manual" ? "—" : "100%";

    els.resultSection.style.display = "none";
  }

  els.testMode.addEventListener("click", () => {
    if (running) return;
    mode = "test";
    els.testMode.classList.add("active");
    els.manualMode.classList.remove("active");
    els.modeTitle.textContent = "Typing Test";
    els.typingInput.placeholder = "Click Start and begin typing...";
    reset();
  });

  els.manualMode.addEventListener("click", () => {
    if (running) return;
    mode = "manual";
    els.manualMode.classList.add("active");
    els.testMode.classList.remove("active");
    els.modeTitle.textContent = "Manual Practice";
    els.typingInput.placeholder = "Type from your own notes...";
    reset();
  });

  els.startBtn.addEventListener("click", start);
  els.finishBtn.addEventListener("click", finish);
  els.resetBtn.addEventListener("click", reset);

  els.typingInput.addEventListener("input", calculate);

  els.typingInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab") e.preventDefault();
  });

  sourceText = currentText();
  reset();
});
