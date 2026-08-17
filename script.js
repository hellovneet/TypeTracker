document.addEventListener("DOMContentLoaded", () => {
  // TypeTrack standalone controller
  // This file is intentionally defensive so it works with the existing HTML.

  const find = (...ids) => {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  };

  const startBtn = find("startBtn", "startTest", "start-test");
  const finishBtn = find("finishBtn", "finishTest", "finish-test");
  const resetBtn = find("resetBtn", "reset", "resetBtn");
  const input = find("typingInput", "typingArea", "typing-area", "userInput", "textInput");
  const textBox = find("testText", "typingText", "paragraph", "textToType");
  const timerBox = find("timer", "time");
  const wpmBox = find("wpm");
  const accuracyBox = find("accuracy");
  const wordsBox = find("words", "wordCount");

  const testMode = find("testMode");
  const manualMode = find("manualMode");

  let mode = "test";
  let running = false;
  let startedAt = 0;
  let timer = null;
  let target = "";

  const samples = [
    "The quick brown fox jumps over the lazy dog. Typing regularly helps students improve their speed, accuracy and overall keyboard skills.",
    "Practice makes typing faster and more accurate. Focus on correct finger placement, steady rhythm and fewer mistakes.",
    "The Internet of Things connects sensors, devices and systems to collect data and automate useful actions."
  ];

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function getTyped() {
    return input ? input.value : "";
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" +
           String(sec % 60).padStart(2, "0");
  }

  function renderTarget() {
    if (!textBox) return;
    textBox.textContent = mode === "manual"
      ? "Manual Practice — type anything from your notes."
      : target;
  }

  function updateStats() {
    if (!running) return;

    const typed = getTyped();
    const seconds = Math.max((Date.now() - startedAt) / 1000, 0.01);
    const minutes = seconds / 60;
    const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const wpm = Math.round((typed.length / 5) / minutes);

    let accuracy = null;

    if (mode === "test") {
      let correct = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) correct++;
      }
      accuracy = Math.round((correct / Math.max(typed.length, 1)) * 100);
    }

    setText(timerBox, formatTime(seconds));
    setText(wpmBox, Number.isFinite(wpm) ? wpm : 0);
    setText(wordsBox, words);
    setText(accuracyBox, accuracy === null ? "—" : accuracy + "%");

    if (mode === "test" && typed.length >= target.length && target.length > 0) {
      finish();
    }
  }

  function start() {
    if (running) return;

    if (!input) {
      alert("Typing box was not found in the page.");
      return;
    }

    if (mode === "test") {
      target = samples[Math.floor(Math.random() * samples.length)];
      renderTarget();
    }

    input.value = "";
    input.disabled = false;
    input.focus();

    running = true;
    startedAt = Date.now();

    if (startBtn) startBtn.disabled = true;
    if (finishBtn) finishBtn.disabled = false;

    clearInterval(timer);
    timer = setInterval(updateStats, 100);
    updateStats();
  }

  function finish() {
    if (!running) return;

    const typed = getTyped();
    const seconds = Math.max((Date.now() - startedAt) / 1000, 0.01);
    const minutes = seconds / 60;
    const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const wpm = Math.round((typed.length / 5) / minutes);

    let accuracy = null;
    if (mode === "test") {
      let correct = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) correct++;
      }
      accuracy = Math.round((correct / Math.max(typed.length, 1)) * 100);
    }

    running = false;
    clearInterval(timer);

    if (input) input.disabled = true;
    if (startBtn) startBtn.disabled = false;
    if (finishBtn) finishBtn.disabled = true;

    setText(timerBox, formatTime(seconds));
    setText(wpmBox, Number.isFinite(wpm) ? wpm : 0);
    setText(wordsBox, words);
    setText(accuracyBox, accuracy === null ? "—" : accuracy + "%");
  }

  function reset() {
    clearInterval(timer);
    running = false;

    if (mode === "test") {
      target = samples[Math.floor(Math.random() * samples.length)];
    } else {
      target = "";
    }

    renderTarget();

    if (input) {
      input.value = "";
      input.disabled = true;
    }

    if (startBtn) startBtn.disabled = false;
    if (finishBtn) finishBtn.disabled = true;

    setText(timerBox, "00:00");
    setText(wpmBox, "0");
    setText(wordsBox, "0");
    setText(accuracyBox, mode === "test" ? "100%" : "—");
  }

  // Works with either ID-based or text-based buttons.
  if (startBtn) startBtn.addEventListener("click", start);
  if (finishBtn) finishBtn.addEventListener("click", finish);
  if (resetBtn) resetBtn.addEventListener("click", reset);

  if (input) input.addEventListener("input", updateStats);

  if (testMode) {
    testMode.addEventListener("click", () => {
      if (running) return;
      mode = "test";
      testMode.classList.add("active");
      if (manualMode) manualMode.classList.remove("active");
      reset();
    });
  }

  if (manualMode) {
    manualMode.addEventListener("click", () => {
      if (running) return;
      mode = "manual";
      manualMode.classList.add("active");
      if (testMode) testMode.classList.remove("active");
      reset();
    });
  }

  // Fallback: locate buttons by visible text if IDs are different.
  if (!startBtn || !finishBtn || !resetBtn) {
    document.querySelectorAll("button").forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (!startBtn && text.includes("start")) btn.addEventListener("click", start);
      if (!finishBtn && text.includes("finish")) btn.addEventListener("click", finish);
      if (!resetBtn && text.includes("reset")) btn.addEventListener("click", reset);
    });
  }

  reset();
});
