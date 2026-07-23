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
  synFilter: null,
};

const tabNav = document.getElementById("tab-nav");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const dataTable = document.getElementById("data-table");
const entryList = document.getElementById("entry-list");
const chipFilter = document.getElementById("chip-filter");
const emptyState = document.getElementById("empty-state");
const statusLine = document.getElementById("status-line");
const recordCount = document.getElementById("record-count");
const searchInput = document.getElementById("search-input");

const STAT_KEYS = ["육체", "감각", "정신", "사회"];
const STAT_MAX = 3;

const EFFECT_STAT_KEYS = ["최대레벨", "타이밍", "기능", "난이도", "대상", "사정거리", "침식치", "제한"];

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
  state.synFilter = null;
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
      buildChipFilter();
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
  let filtered = q
    ? state.rows.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      )
    : state.rows;

  if (state.activeId === "effects" && state.synFilter) {
    filtered = filtered.filter((row) => row["신드롬"] === state.synFilter);
  }

  if (state.activeId === "syndromes") {
    chipFilter.hidden = true;
    renderSyndromeCards(filtered);
  } else if (state.activeId === "effects") {
    renderEffectCards(filtered);
  } else {
    chipFilter.hidden = true;
    renderTable(filtered);
  }

  emptyState.hidden = filtered.length !== 0;
  recordCount.textContent = `${filtered.length} FILES`;
}

function buildChipFilter() {
  if (state.activeId !== "effects") {
    chipFilter.hidden = true;
    chipFilter.innerHTML = "";
    return;
  }
  const names = [...new Set(state.rows.map((r) => r["신드롬"]).filter(Boolean))];
  chipFilter.innerHTML = "";
  chipFilter.hidden = names.length === 0;

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "chip" + (state.synFilter === null ? " active" : "");
  allBtn.textContent = "전체";
  allBtn.addEventListener("click", () => {
    state.synFilter = null;
    updateChipActive();
    render();
  });
  chipFilter.appendChild(allBtn);

  names.forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (state.synFilter === name ? " active" : "");
    btn.textContent = name;
    btn.dataset.name = name;
    btn.addEventListener("click", () => {
      state.synFilter = state.synFilter === name ? null : name;
      updateChipActive();
      render();
    });
    chipFilter.appendChild(btn);
  });
}

function updateChipActive() {
  [...chipFilter.children].forEach((btn) => {
    const isAll = !btn.dataset.name;
    btn.classList.toggle("active", isAll ? state.synFilter === null : btn.dataset.name === state.synFilter);
  });
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

    const head = document.createElement("div");
    head.className = "syn-head";
    head.innerHTML = `<span class="syn-name">${escapeHtml(row["이름"])}</span>`;

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

    card.appendChild(head);
    card.appendChild(statGrid);
    card.appendChild(desc);
    entryList.appendChild(card);
  });
}

function renderEffectCards(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  filtered.forEach((row) => {
    const card = document.createElement("article");
    card.className = "eff-card";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "eff-head";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <div class="eff-head-top">
        <span class="eff-name">${escapeHtml(row["이름"])}</span>
        <span class="eff-syn-tag">${escapeHtml(row["신드롬"])}</span>
      </div>
      <p class="eff-summary">${escapeHtml(row["요약"])}</p>
    `;

    const body = document.createElement("div");
    body.className = "eff-body";

    const bodyInner = document.createElement("div");
    bodyInner.className = "eff-body-inner";

    const statGrid = document.createElement("div");
    statGrid.className = "eff-stat-grid";
    EFFECT_STAT_KEYS.forEach((key) => {
      const box = document.createElement("div");
      box.className = "eff-stat";
      box.innerHTML = `
        <span class="eff-stat-label">${key}</span>
        <span class="eff-stat-value">${escapeHtml(row[key] || "-")}</span>
      `;
      statGrid.appendChild(box);
    });

    const rules = document.createElement("p");
    rules.className = "eff-rules";
    rules.textContent = row["효과"] ?? "";

    bodyInner.appendChild(statGrid);
    bodyInner.appendChild(rules);
    body.appendChild(bodyInner);

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
