document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // Elements that ACTUALLY exist in the current index.html
  const testMode = $("testMode");
  const manualMode = $("manualMode");
  const modeTitle = $("modeTitle");
  const testText = $("testText");
  const typingInput = $("typingInput");
  const inputHint = $("inputHint");
  const startBtn = $("startBtn");
  const finishBtn = $("finishBtn");
  const resetBtn = $("resetBtn");
  const timer = $("timer");
  const wpm = $("wpm");
  const accuracy = $("accuracy");
  const words = $("words");
  const resultSection = $("resultSection");
  const resultWpm = $("resultWpm");
  const resultAccuracy = $("resultAccuracy");
  const resultTime = $("resultTime");
  const resultWords = $("resultWords");
  const statusText = $("statusText");
  const statusDot = $("statusDot");

  let mode = "test";
  let running = false;
  let startTime = 0;
  let interval = null;
  let sourceText = "";

  const texts = [
    "The quick brown fox jumps over the lazy dog. Typing regularly helps students improve their speed, accuracy and overall keyboard skills.",
    "Typing regularly helps students improve their speed, accuracy and confidence. Practice every day and focus on correct finger placement, steady rhythm and fewer mistakes.",
    "The Internet of Things connects sensors, devices and systems to collect data and automate useful actions. IoT projects often combine microcontrollers, networks and real world sensors.",
    "Programming is the process of giving clear instructions to a computer. Good code is readable, logical and tested carefully. Small improvements in practice can lead to stronger problem solving skills."
  ];

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" +
           String(seconds % 60).padStart(2, "0");
  }

  function chooseText() {
    return texts[Math.floor(Math.random() * texts.length)];
  }

  function setModeText() {
    if (mode === "manual") {
      testText.textContent = "Manual Practice — type anything from your own notes, book or study material.";
      inputHint.textContent = "Type from your own notes";
    } else {
      testText.textContent = sourceText;
      inputHint.textContent = "Click Start and begin typing";
    }
  }

  function calculate() {
    if (!running) return null;

    const typed = typingInput.value;
    const seconds = Math.max((Date.now() - startTime) / 1000, 0.01);
    const minutes = seconds / 60;

    const speed = Math.round((typed.length / 5) / minutes);
    const wordCount = typed.trim() ? typed.trim().split(/\s+/).length : 0;

    let correct = 0;
    let errors = 0;

    if (mode === "test") {
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === sourceText[i]) correct++;
        else errors++;
      }
    }

    const acc = mode === "manual"
      ? "—"
      : Math.round((correct / Math.max(typed.length, 1)) * 100);

    timer.textContent = formatTime(seconds);
    wpm.textContent = Number.isFinite(speed) ? speed : 0;
    words.textContent = wordCount;
    accuracy.textContent = acc === "—" ? "—" : acc + "%";

    return {
      speed: Number.isFinite(speed) ? speed : 0,
      accuracy: acc,
      words: wordCount,
      seconds,
      errors
    };
  }

  function start() {
    if (running) return;

    // Test gets a fresh paragraph when Start is pressed.
    if (mode === "test") {
      sourceText = chooseText();
      setModeText();
    }

    typingInput.value = "";
    typingInput.disabled = false;
    typingInput.focus();

    running = true;
    startTime = Date.now();

    startBtn.disabled = true;
    finishBtn.disabled = false;
    statusText.textContent = "Typing...";
    statusDot.classList.add("running");

    clearInterval(interval);
    interval = setInterval(() => {
      const result = calculate();

      // In test mode, automatically finish after the full paragraph is typed.
      if (
        mode === "test" &&
        result &&
        typingInput.value.length >= sourceText.length
      ) {
        finish();
      }
    }, 100);

    calculate();
  }

  function finish() {
    if (!running) return;

    const result = calculate();
    if (!result) return;

    running = false;
    clearInterval(interval);
    interval = null;

    typingInput.disabled = true;
    startBtn.disabled = false;
    finishBtn.disabled = true;

    statusText.textContent = "Completed";
    statusDot.classList.remove("running");

    resultSection.style.display = "block";
    resultWpm.textContent = result.speed + " WPM";
    resultAccuracy.textContent =
      result.accuracy === "—" ? "—" : result.accuracy + "%";
    resultTime.textContent = formatTime(result.seconds);
    resultWords.textContent = result.words;

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function reset() {
    clearInterval(interval);
    interval = null;
    running = false;

    if (mode === "test") {
      sourceText = chooseText();
    } else {
      sourceText = "";
    }

    setModeText();

    typingInput.value = "";
    typingInput.disabled = true;

    startBtn.disabled = false;
    finishBtn.disabled = true;

    statusText.textContent = "Ready";
    statusDot.classList.remove("running");

    timer.textContent = "00:00";
    wpm.textContent = "0";
    words.textContent = "0";
    accuracy.textContent = mode === "manual" ? "—" : "100%";

    resultSection.style.display = "none";
  }

  // Mode buttons
  testMode.addEventListener("click", () => {
    if (running) return;

    mode = "test";
    testMode.classList.add("active");
    manualMode.classList.remove("active");
    modeTitle.textContent = "Typing Test";
    typingInput.placeholder = "Click Start and begin typing...";
    reset();
  });

  manualMode.addEventListener("click", () => {
    if (running) return;

    mode = "manual";
    manualMode.classList.add("active");
    testMode.classList.remove("active");
    modeTitle.textContent = "Manual Practice";
    typingInput.placeholder = "Type from your own notes...";
    reset();
  });

  // Main controls
  startBtn.addEventListener("click", start);
  finishBtn.addEventListener("click", finish);
  resetBtn.addEventListener("click", reset);

  // Live calculation while typing
  typingInput.addEventListener("input", () => {
    if (running) calculate();
  });

  // Prevent Tab from moving away during a session
  typingInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") event.preventDefault();
  });

  // Initial state
  reset();
});
