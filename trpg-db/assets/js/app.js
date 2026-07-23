// ---------------------------------------------------------------
// OVER:EDGE — 더블 크로스 통합 DB
// data/ 폴더의 CSV 파일을 그대로 불러와 표시합니다.
// CSV를 엑셀 등으로 편집한 뒤 저장 → git push 하면 자동으로 반영됩니다.
// 새 분류를 추가하려면 CATEGORIES 배열에 한 줄만 추가하세요.
// ---------------------------------------------------------------

const CATEGORIES = [
  { id: "syndromes", label: "신드롬",       file: "data/syndromes.csv" },
  { id: "effects",   label: "이펙트",        file: "data/effects.csv" },
  { id: "items",     label: "장비/아이템",   file: "data/items.csv" },
  { id: "npcs",      label: "이레귤러 도감", file: "data/npcs.csv" },
  { id: "rules",     label: "규칙 정리",     file: "data/rules.csv" },
];

const state = {
  activeId: CATEGORIES[0].id,
  rows: [],
  headers: [],
  query: "",
};

const tabNav = document.getElementById("tab-nav");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const dataTable = document.getElementById("data-table");
const entryList = document.getElementById("entry-list");
const emptyState = document.getElementById("empty-state");
const statusLine = document.getElementById("status-line");
const recordCount = document.getElementById("record-count");
const searchInput = document.getElementById("search-input");

const STAT_KEYS = ["육체", "감각", "정신", "사회"];
const STAT_MAX = 3;

function buildTabs() {
  tabNav.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (cat.id === state.activeId ? " active" : "");
    btn.textContent = cat.label;
    btn.dataset.id = cat.id;
    btn.addEventListener("click", () => switchCategory(cat.id));
    tabNav.appendChild(btn);
  });
}

function switchCategory(id) {
  if (id === state.activeId && state.rows.length) return;
  state.activeId = id;
  [...tabNav.children].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === id);
  });
  searchInput.value = "";
  state.query = "";
  loadCategory(id);
}

function loadCategory(id) {
  const cat = CATEGORIES.find((c) => c.id === id);
  statusLine.textContent = "불러오는 중…";
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  emptyState.hidden = true;

  Papa.parse(cat.file, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      state.rows = results.data;
      state.headers = results.meta.fields || [];
      render();
      statusLine.textContent = cat.file;
    },
    error: () => {
      statusLine.textContent = `${cat.file} 을(를) 불러오지 못했습니다.`;
      tableBody.innerHTML = "";
      recordCount.textContent = "0 FILES";
      emptyState.hidden = false;
    },
  });
}

function render() {
  const q = state.query.trim().toLowerCase();
  const filtered = q
    ? state.rows.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      )
    : state.rows;

  if (state.activeId === "syndromes") {
    renderSyndromeCards(filtered);
  } else {
    renderTable(filtered);
  }

  emptyState.hidden = filtered.length !== 0;
  recordCount.textContent = `${filtered.length} FILES`;
}

function renderTable(filtered) {
  dataTable.hidden = false;
  entryList.hidden = true;

  tableHead.innerHTML = "";
  const trh = document.createElement("tr");
  state.headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  tableHead.appendChild(trh);

  tableBody.innerHTML = "";
  filtered.forEach((row) => {
    const tr = document.createElement("tr");
    state.headers.forEach((h) => {
      const td = document.createElement("td");
      td.textContent = row[h] ?? "";
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function renderSyndromeCards(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  filtered.forEach((row) => {
    const card = document.createElement("article");
    card.className = "syn-card";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "syn-head";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <span class="syn-name">${row["이름"] ?? ""}</span>
      <span class="syn-hint">능력치 보기</span>
      <span class="syn-chevron" aria-hidden="true">▾</span>
    `;

    const body = document.createElement("div");
    body.className = "syn-body";

    const statGrid = document.createElement("div");
    statGrid.className = "stat-grid";
    STAT_KEYS.forEach((key) => {
      const raw = row[key] ?? "0";
      const value = Math.max(0, Math.min(STAT_MAX, parseInt(raw, 10) || 0));
      const pct = (value / STAT_MAX) * 100;
      const stat = document.createElement("div");
      stat.className = "stat";
      stat.innerHTML = `
        <div class="stat-top">
          <span class="stat-label">${key}</span>
          <span class="stat-value">${raw}</span>
        </div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
      `;
      statGrid.appendChild(stat);
    });

    const desc = document.createElement("p");
    desc.className = "syn-desc";
    desc.textContent = row["효과요약"] ?? "";

    body.appendChild(statGrid);
    body.appendChild(desc);

    head.addEventListener("click", () => {
      const isOpen = card.classList.toggle("open");
      head.setAttribute("aria-expanded", String(isOpen));
    });

    card.appendChild(head);
    card.appendChild(body);
    entryList.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

buildTabs();
loadCategory(state.activeId);
