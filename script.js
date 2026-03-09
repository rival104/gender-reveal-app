/* ================================================
   GENDER REVEAL — APPLICATION LOGIC
   Handles: screen flow, quiz, countdown, confetti
   ================================================ */

// ==============================================
// 1. OLD WIVES' TALES QUIZ DATA
//    Each question has:
//      - text: the question displayed to the user
//      - yesTeam: "boy" or "girl" — which team gets
//        a point when the user answers YES
// ==============================================
const quizQuestions = [
  {
    text: "Are you craving salty or savory foods more than usual?",
    yesTeam: "boy"  // Salty cravings → Team Boy
  },
  {
    text: "Do you find yourself reaching for sweets and chocolate?",
    yesTeam: "girl" // Sweet tooth → Team Girl
  },
  {
    text: "Is the baby's heart rate under 140 BPM?",
    yesTeam: "boy"  // Under 140 → Boy
  },
  {
    text: "Has your skin been glowing during pregnancy?",
    yesTeam: "boy"  // Pregnancy glow → Boy
  },
  {
    text: "Have you been experiencing more breakouts or acne?",
    yesTeam: "girl" // Breakouts → Girl (she "steals your beauty")
  },
  {
    text: "Are you carrying the baby low?",
    yesTeam: "boy"  // Carrying low → Boy
  },
  {
    text: "Has your hair become thicker and more lustrous?",
    yesTeam: "boy"  // Thicker hair → Boy
  },
  {
    text: "Do you sleep mostly on your right side?",
    yesTeam: "girl" // Right side → Girl
  },
  {
    text: "Has the dad-to-be gained sympathy weight?",
    yesTeam: "girl" // Dad gains weight → Girl
  },
  {
    text: "Do you have cold feet (literally, always cold)?",
    yesTeam: "boy"  // Cold feet → Boy
  },
  {
    text: "Has morning sickness been really rough for you?",
    yesTeam: "girl" // Severe morning sickness → Girl
  },
  {
    text: "Do you find yourself clumsier than usual?",
    yesTeam: "boy"  // Clumsiness → Boy
  }
];

// ==============================================
// 2. FUNNY COUNTDOWN QUIPS
//    Shown one-per-second during the 10s countdown
// ==============================================
const countdownQuips = [
  "Consulting the stars… ✨",
  "Asking a Magic 8-Ball… 🎱",
  "Checking the Old Wives' group chat… 👵📱",
  "Flipping a very important coin… 🪙",
  "Cross-referencing with a fortune cookie… 🥠",
  "Double-checking with a ouija board… 👻",
  "Running it by the neighborhood cat… 🐈",
  "Summoning the stork hotline… 🦩",
  "Drumroll please… 🥁",
  "Here it comes…! 🎉"
];

// ==============================================
// 3. DOM REFERENCES
// ==============================================
const screens = {
  welcome:   document.getElementById("screen-welcome"),
  name:      document.getElementById("screen-name"),
  wifeCheck: document.getElementById("screen-wife-check"),
  notWife:   document.getElementById("screen-not-wife"),
  quiz:      document.getElementById("screen-quiz"),
  countdown: document.getElementById("screen-countdown"),
  reveal:    document.getElementById("screen-reveal")
};

// Buttons
const btnStart       = document.getElementById("btn-start");
const btnNameSubmit  = document.getElementById("btn-name-submit");
const btnWifeYes     = document.getElementById("btn-wife-yes");
const btnWifeNo      = document.getElementById("btn-wife-no");
const btnBackHome    = document.getElementById("btn-back-home");
const btnYes         = document.getElementById("btn-yes");
const btnNo          = document.getElementById("btn-no");
const btnRestart     = document.getElementById("btn-restart");

// Inputs & displays
const inputName       = document.getElementById("input-name");
const quizQuestionEl  = document.getElementById("quiz-question-text");
const progressFill    = document.getElementById("progress-fill");
const qCurrent        = document.getElementById("q-current");
const qTotal          = document.getElementById("q-total");
const meterIndicator  = document.getElementById("meter-indicator");
const countdownNumber = document.getElementById("countdown-number");
const countdownQuip   = document.getElementById("countdown-quip");
const ringProgress    = document.getElementById("ring-progress");
const revealResult    = document.getElementById("reveal-result");
const revealSubtitle  = document.getElementById("reveal-subtitle");
const revealVideo     = document.getElementById("reveal-video");
const confettiCanvas  = document.getElementById("confetti-canvas");

// ==============================================
// 4. STATE
// ==============================================
let currentQuestion = 0;    // Index of current quiz question
let boyScore = 0;           // Points for Team Boy
let girlScore = 0;          // Points for Team Girl
let userName = "";          // The user's name
let countdownInterval;      // Reference to countdown timer

// ==============================================
// 5. SCREEN NAVIGATION
//    Only one screen visible at a time
// ==============================================
function showScreen(screenKey) {
  // Fade out all screens
  Object.values(screens).forEach(s => s.classList.remove("active"));

  // Small delay so CSS transition plays
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      screens[screenKey].classList.add("active");
    });
  });
}

// ==============================================
// 6. FLOATING PARTICLES (decorative background)
// ==============================================
function createParticles() {
  const container = document.getElementById("particles");
  const colors = ["#e8729a", "#6aadcf", "#d4a853", "#c66dd8", "#68d391"];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    const size = Math.random() * 12 + 4;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = -(Math.random() * 20) + "%";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (Math.random() * 15 + 10) + "s";
    p.style.animationDelay = (Math.random() * 10) + "s";
    container.appendChild(p);
  }
}

// ==============================================
// 7. QUIZ LOGIC
// ==============================================

/** Reset quiz state and display the first question */
function startQuiz() {
  currentQuestion = 0;
  boyScore = 0;
  girlScore = 0;

  qTotal.textContent = quizQuestions.length;
  showQuestion();
  showScreen("quiz");
}

/** Render the current question and update progress */
function showQuestion() {
  const q = quizQuestions[currentQuestion];

  // Update question text with a fade
  quizQuestionEl.style.opacity = 0;
  setTimeout(() => {
    quizQuestionEl.textContent = q.text;
    quizQuestionEl.style.opacity = 1;
  }, 200);

  // Update progress indicators
  qCurrent.textContent = currentQuestion + 1;
  const pct = ((currentQuestion) / quizQuestions.length) * 100;
  progressFill.style.width = pct + "%";
}

/** Handle an answer (yes or no) */
function answerQuestion(answeredYes) {
  const q = quizQuestions[currentQuestion];

  // Determine which team gets the point
  if (answeredYes) {
    // "Yes" means the described trait is present → award to yesTeam
    if (q.yesTeam === "boy") boyScore++;
    else girlScore++;
  } else {
    // "No" means the opposite trait → award to the other team
    if (q.yesTeam === "boy") girlScore++;
    else boyScore++;
  }

  // Update the sliding meter (0% = full boy, 100% = full girl)
  const total = boyScore + girlScore;
  const girlPct = total === 0 ? 50 : (girlScore / total) * 100;
  meterIndicator.style.left = girlPct + "%";

  // Advance to next question or finish
  currentQuestion++;

  if (currentQuestion < quizQuestions.length) {
    showQuestion();
  } else {
    // Quiz complete — fill progress bar fully
    progressFill.style.width = "100%";
    // Transition to countdown after a brief pause
    setTimeout(() => startCountdown(), 800);
  }
}

// ==============================================
// 8. COUNTDOWN (10 seconds, with funny quips)
// ==============================================
function startCountdown() {
  showScreen("countdown");

  let remaining = 10;
  const circumference = 2 * Math.PI * 54; // r=54 from SVG circle

  // Reset ring
  ringProgress.style.strokeDasharray = circumference;
  ringProgress.style.strokeDashoffset = 0;

  // Display initial state
  countdownNumber.textContent = remaining;
  countdownQuip.textContent = countdownQuips[10 - remaining];

  countdownInterval = setInterval(() => {
    remaining--;

    if (remaining < 0) {
      clearInterval(countdownInterval);
      doReveal();
      return;
    }

    // Update number and quip
    countdownNumber.textContent = remaining;
    countdownQuip.textContent = countdownQuips[10 - remaining - 1] || "…";

    // Animate ring depletion
    const offset = circumference * ((10 - remaining) / 10);
    ringProgress.style.strokeDashoffset = offset;
  }, 1000);
}

// ==============================================
// 9. FINAL REVEAL
// ==============================================
function doReveal() {
  // Determine result
  const isBoy = false; // boyScore >= girlScore;
  const gender = boyScore >= girlScore ? "boy" : "girl";

  // Update reveal card content
  if (isBoy) {
    revealResult.textContent = "🩵 It's a Boy! 🩵";
    revealResult.className = "reveal-result boy";
    document.body.style.background = "linear-gradient(160deg, #e8f4fa 0%, #d0eaf8 100%)";
  } else {
    revealResult.textContent = "🩷 It's a Girl! 🩷";
    revealResult.className = "reveal-result girl";
    document.body.style.background = "linear-gradient(160deg, #fdf0f4 0%, #f8d0e0 100%)";
  }

  revealSubtitle.textContent = `The Old Wives predicted ${gender} for ${userName || "you"}!`;

  // Show screen and launch confetti
  showScreen("reveal");

  setTimeout(() => {
    launchConfetti(gender);
  }, 300);
}

// ==============================================
// 10. CONFETTI ENGINE (canvas-based)
// ==============================================
function launchConfetti(gender) {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");

  // Size canvas to window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Color palettes per gender
  const palettes = {
    boy:  ["#6aadcf", "#4a9bbf", "#8ac4de", "#d4a853", "#fff", "#a8d8ea"],
    girl: ["#e8729a", "#d45d88", "#f4a6c4", "#d4a853", "#fff", "#f9c6d9"]
  };
  const colors = palettes[gender] || palettes.girl;

  // Create confetti particles
  const pieces = [];
  const PIECE_COUNT = 200;

  for (let i = 0; i < PIECE_COUNT; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,  // Start above screen
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      opacity: 1
    });
  }

  let frame = 0;
  const MAX_FRAMES = 300; // ~5 seconds at 60fps

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fade out near the end
    const fadeStart = MAX_FRAMES - 60;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;         // Gravity
      p.rotation += p.rotSpeed;

      // Fade
      if (frame > fadeStart) {
        p.opacity = Math.max(0, 1 - (frame - fadeStart) / 60);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

// ==============================================
// 11. RESET — go back to beginning
// ==============================================
function resetApp() {
  currentQuestion = 0;
  boyScore = 0;
  girlScore = 0;
  userName = "";
  inputName.value = "";
  meterIndicator.style.left = "50%";
  progressFill.style.width = "0%";
  document.body.style.background = "";
  clearInterval(countdownInterval);

  // Clear confetti
  const ctx = confettiCanvas.getContext("2d");
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  // Hide video if playing
  revealVideo.pause();
  revealVideo.classList.remove("playing");

  showScreen("welcome");
}

// ==============================================
// 12. EVENT LISTENERS
// ==============================================

// Welcome → Name screen
btnStart.addEventListener("click", () => {
  showScreen("name");
  // Auto-focus the input after transition
  setTimeout(() => inputName.focus(), 600);
});

// Name submit → check if name is "umm"
btnNameSubmit.addEventListener("click", () => {
  userName = inputName.value.trim();

  if (!userName) {
    inputName.style.borderColor = "#fc8181";
    inputName.setAttribute("placeholder", "Please enter your name!");
    return;
  }

  // Reset border style
  inputName.style.borderColor = "";

  // Special flow: if the name is "umm" (case-insensitive), ask wife check
  // Check if name is umma or maleha
  if (userName.toLowerCase() === "umma" || userName.toLowerCase() === "maleha") {
    showScreen("wifeCheck");
  } else {
    // For any other name, go straight to the quiz
    showScreen("notWife")
  }
});

// Allow Enter key to submit name
inputName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnNameSubmit.click();
});

// Wife check: Yes → quiz, No → rejection screen
btnWifeYes.addEventListener("click", () => startQuiz());
btnWifeNo.addEventListener("click", () => showScreen("notWife"));

// Not-wife screen: back to start
btnBackHome.addEventListener("click", () => resetApp());

// Quiz answer buttons
btnYes.addEventListener("click", () => answerQuestion(true));
btnNo.addEventListener("click", () => answerQuestion(false));

// Restart
btnRestart.addEventListener("click", () => resetApp());

// ==============================================
// 13. INITIALIZATION
// ==============================================
createParticles();

// Handle window resize for confetti canvas
window.addEventListener("resize", () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});
