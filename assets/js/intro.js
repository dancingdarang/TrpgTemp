// ---------------------------------------------------------------
// 인트로 시퀀스: 터미널 로그 연출 + 버튼 클릭 시 본문 진입
// ---------------------------------------------------------------

const BOOT_LINES = [
  "INCOMING CONNECTION DETECTED...",
  "RESOLVING ARCHIVE SIGNATURE...",
  "EXTERNAL USER IDENTIFIED: OVER:EDGE_ARCHIVE",
  "LOADING INDEX... [ SYNDROMES / EFFECTS / ITEMS ]",
  "SYSTEM LOCK BYPASSED...",
  "READY.",
];

const introEl = document.getElementById("intro");
const logEl = document.getElementById("intro-log");
const sealBtn = document.getElementById("seal-btn");
const appRoot = document.getElementById("app-root");

function typeLine(text, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const line = document.createElement("span");
      line.className = "log-line";
      logEl.appendChild(line);
      let i = 0;
      const timer = setInterval(() => {
        line.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, 14);
    }, delay);
  });
}

async function runBootSequence() {
  for (const line of BOOT_LINES) {
    await typeLine(line, 150);
  }
  sealBtn.disabled = false;
  sealBtn.focus();
}

function enterSite() {
  if (sealBtn.disabled) return;
  sealBtn.disabled = true;
  sealBtn.textContent = "ACCESSING...";
  sealBtn.classList.add("term-btn-active");

  setTimeout(() => {
    introEl.classList.add("intro-hidden");
    appRoot.removeAttribute("aria-hidden");
    appRoot.classList.add("app-visible");
  }, 700);
}

sealBtn.disabled = true;
sealBtn.addEventListener("click", enterSite);

runBootSequence();
