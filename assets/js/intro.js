// ---------------------------------------------------------------
// 인트로 시퀀스: 보안 파일 접속 연출 + 인장 클릭 시 본문 진입
// ---------------------------------------------------------------

const BOOT_LINES = [
  "SYSTEM://OVER-EDGE ARCHIVE",
  "암호화 파일 인덱스 로드 중...",
  "생체 반응 스캔...",
  "보안 등급 대조 중...",
  "열람 권한 확인 완료",
];

const introEl = document.getElementById("intro");
const logEl = document.getElementById("intro-log");
const hintEl = document.getElementById("intro-hint");
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
    await typeLine(line, 180);
  }
  hintEl.textContent = "인장을 클릭해 파일 시스템에 접속하십시오";
  sealBtn.focus();
}

function enterSite() {
  sealBtn.classList.add("seal-activated");
  sealBtn.disabled = true;
  hintEl.textContent = "접속 중...";

  setTimeout(() => {
    introEl.classList.add("intro-hidden");
    appRoot.removeAttribute("aria-hidden");
    appRoot.classList.add("app-visible");
  }, 550);
}

sealBtn.addEventListener("click", enterSite);
sealBtn.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    enterSite();
  }
});

runBootSequence();
