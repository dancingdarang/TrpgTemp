// ---------------------------------------------------------------
// 접근 코드 게이트: 정답을 맞혀야 인트로/본문이 나타남
// 주의: 이 코드는 브라우저에서 그대로 실행되므로 완전한 보안이
// 아닙니다. "링크를 우연히 들어온 사람"을 막는 용도입니다.
// 비밀번호를 바꾸려면 아래 ACCESS_CODE 값만 수정하면 됩니다.
// ---------------------------------------------------------------

const ACCESS_CODE = "overedge"; // ← 여기 원하는 비밀번호로 바꾸세요

const pwGate = document.getElementById("pw-gate");
const pwForm = document.getElementById("pw-form");
const pwInput = document.getElementById("pw-input");
const pwError = document.getElementById("pw-error");
const introEl = document.getElementById("intro");

// 이전에 맞혔던 적이 있으면 다시 묻지 않음 (이 브라우저에서만)
if (localStorage.getItem("overedge_unlocked") === "1") {
  unlock();
}

pwForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (pwInput.value === ACCESS_CODE) {
    localStorage.setItem("overedge_unlocked", "1");
    unlock();
  } else {
    pwError.hidden = false;
    pwInput.value = "";
    pwInput.focus();
  }
});

function unlock() {
  pwGate.hidden = true;
  introEl.hidden = false;
}
