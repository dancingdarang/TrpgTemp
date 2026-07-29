// ---------------------------------------------------------------
// OVER:EDGE — 더블 크로스 통합 DB
// data/ 폴더의 CSV 파일을 그대로 불러와 표시합니다.
// CSV를 엑셀 등으로 편집한 뒤 저장 → git push 하면 자동으로 반영됩니다.
// 새 분류를 추가하려면 CATEGORIES 배열에 한 줄만 추가하세요.
// ---------------------------------------------------------------

const CATEGORIES = [
  { id: "syndromes", label: "신드롬",       file: "data/syndromes.csv" },
  { id: "effects",   label: "이펙트",        file: "data/effects.csv" },
  { id: "items",     label: "장비/아이템",
    subcats: [
      { id: "general",     label: "일반",   file: "data/items.csv" },
      { id: "weapons",     label: "무기",   file: "data/weapons.csv" },
      { id: "armor",       label: "방어구", file: "data/armor.csv" },
      { id: "vehicles",    label: "비클",   file: "data/vehicles.csv" },
      { id: "connections", label: "커넥션", file: "data/connections.csv" },
    ]
  },
  { id: "works",     label: "워크스",        file: "data/works.csv" },
  { id: "areas",     label: "에어리어",      file: "data/areas.csv" },
  { id: "rules",     label: "규칙 정리",     file: "data/rules.csv" },
  { id: "characters",label: "캐릭터 열람",   file: "data/characters.csv" },
];

const state = {
  activeId: CATEGORIES[0].id,
  rows: [],
  headers: [],
  query: "",
  synFilter: null,
  itemSub: "general",
};

const tabNav = document.getElementById("tab-nav");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const dataTable = document.getElementById("data-table");
const entryList = document.getElementById("entry-list");
const chipFilter = document.getElementById("chip-filter");
const itemSubtabs = document.getElementById("item-subtabs");
const areaBanner = document.getElementById("area-banner");
const expandControls = document.getElementById("expand-controls");
const expandAllBtn = document.getElementById("expand-all-btn");
const collapseAllBtn = document.getElementById("collapse-all-btn");
const emptyState = document.getElementById("empty-state");
const statusLine = document.getElementById("status-line");
const recordCount = document.getElementById("record-count");
const searchInput = document.getElementById("search-input");

const STAT_KEYS = ["육체", "감각", "정신", "사회"];
const STAT_MAX = 3;

const EFFECT_STAT_KEYS = ["타이밍", "기능", "최대레벨", "난이도", "대상", "사정거리", "침식치", "제한"];

const CHAR_STAT_KEYS = ["등급", "신드롬", "워크스", "나이", "성별", "신장", "체중", "혈액형", "별자리"];
const CHAR_NARRATIVE_KEYS = ["출생", "경험", "해후", "각성", "충동", "욕망"];
const CHAR_IMAGE_BASE = "Image/Character/";
const AREA_IMAGE_BASE = "Image/Area/";

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
  const sub = cat.subcats ? (cat.subcats.find((s) => s.id === state.itemSub) || cat.subcats[0]) : null;
  if (sub) state.itemSub = sub.id;
  const file = sub ? sub.file : cat.file;

  buildItemSubtabs(cat);

  statusLine.textContent = "불러오는 중…";
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  emptyState.hidden = true;

  Papa.parse(file, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      state.rows = results.data;
      state.headers = results.meta.fields || [];
      buildChipFilter();
      render();
      statusLine.textContent = file;
    },
    error: () => {
      statusLine.textContent = `${file} 을(를) 불러오지 못했습니다.`;
      tableBody.innerHTML = "";
      recordCount.textContent = "0 FILES";
      emptyState.hidden = false;
    },
  });
}

function buildItemSubtabs(cat) {
  if (!cat.subcats) {
    itemSubtabs.hidden = true;
    itemSubtabs.innerHTML = "";
    return;
  }
  itemSubtabs.hidden = false;
  itemSubtabs.innerHTML = "";
  cat.subcats.forEach((sub) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (sub.id === state.itemSub ? " active" : "");
    btn.textContent = sub.label;
    btn.addEventListener("click", () => {
      if (sub.id === state.itemSub) return;
      state.itemSub = sub.id;
      searchInput.value = "";
      state.query = "";
      loadCategory("items");
    });
    itemSubtabs.appendChild(btn);
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

  areaBanner.hidden = state.activeId !== "areas";

  if (state.activeId === "syndromes") {
    chipFilter.hidden = true;
    expandControls.hidden = true;
    renderSyndromeCards(filtered);
  } else if (state.activeId === "effects") {
    expandControls.hidden = true;
    renderEffectCards(filtered);
  } else if (state.activeId === "characters") {
    chipFilter.hidden = true;
    expandControls.hidden = true;
    renderCharacterCards(filtered);
  } else if (state.activeId === "items") {
    chipFilter.hidden = true;
    expandControls.hidden = true;
    renderItemCards(filtered);
  } else if (state.activeId === "rules") {
    chipFilter.hidden = true;
    expandControls.hidden = true;
    renderRuleGroups(filtered);
  } else {
    chipFilter.hidden = true;
    expandControls.hidden = true;
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

const HEADER_DISPLAY_OVERRIDES = {
  works: { 레벨1: "레벨", 레벨2: "레벨", 레벨3: "레벨", 레벨4: "레벨", 레벨5: "레벨" },
};

function renderTable(filtered) {
  dataTable.hidden = false;
  entryList.hidden = true;
  entryList.innerHTML = "";

  const labelOverrides = HEADER_DISPLAY_OVERRIDES[state.activeId] || {};

  tableHead.innerHTML = "";
  const trh = document.createElement("tr");
  state.headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = labelOverrides[h] || h;
    trh.appendChild(th);
  });
  tableHead.appendChild(trh);

  tableBody.innerHTML = "";
  filtered.forEach((row) => {
    const tr = document.createElement("tr");
    state.headers.forEach((h) => {
      const td = document.createElement("td");
      if (state.activeId === "areas" && h === "이미지") {
        const file = (row[h] || "").trim();
        if (file) {
          const img = document.createElement("img");
          img.src = AREA_IMAGE_BASE + file;
          img.alt = row["이름"] || "";
          img.className = "table-thumb";
          img.onerror = () => { td.textContent = "-"; };
          td.appendChild(img);
        } else {
          td.textContent = "-";
        }
      } else {
        td.textContent = row[h] ?? "";
      }
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

    if ((row["인용구"] || "").trim()) {
      const quote = document.createElement("blockquote");
      quote.className = "syn-quote";
      const q = document.createElement("p");
      q.textContent = row["인용구"];
      quote.appendChild(q);
      if ((row["출전"] || "").trim()) {
        const cite = document.createElement("cite");
        cite.textContent = `— ${row["출전"]}`;
        quote.appendChild(cite);
      }
      card.appendChild(quote);
    }

    if ((row["설명"] || "").trim()) {
      const lore = document.createElement("div");
      lore.className = "syn-lore";
      if ((row["설명제목"] || "").trim()) {
        const loreTitle = document.createElement("h3");
        loreTitle.className = "syn-lore-title";
        loreTitle.textContent = row["설명제목"];
        lore.appendChild(loreTitle);
      }
      const loreBody = document.createElement("p");
      loreBody.textContent = row["설명"];
      lore.appendChild(loreBody);
      card.appendChild(lore);
    }

    entryList.appendChild(card);
  });
}

function buildEffectDetail(row) {
  const detail = document.createElement("div");
  detail.className = "eff-detail-inner";
  detail.innerHTML = `
    <div class="eff-detail-head">
      <span class="eff-name">${escapeHtml(row["이름"])}</span>
      <span class="eff-syn-tag">${escapeHtml(row["신드롬"])}</span>
    </div>
    <p class="eff-summary">${escapeHtml(row["요약"])}</p>
  `;

  const statGrid = document.createElement("div");
  statGrid.className = "eff-stat-grid";
  EFFECT_STAT_KEYS.forEach((key) => {
    const box = document.createElement("div");
    box.className = "eff-stat" + (key === "타이밍" || key === "기능" ? " eff-stat-wide" : "");
    box.innerHTML = `
      <span class="eff-stat-label">${key}</span>
      <span class="eff-stat-value">${escapeHtml(row[key] || "-")}</span>
    `;
    statGrid.appendChild(box);
  });
  detail.appendChild(statGrid);

  const rules = document.createElement("p");
  rules.className = "eff-rules";
  rules.textContent = row["효과"] ?? "";
  detail.appendChild(rules);

  return detail;
}

function renderEffectCards(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  const split = document.createElement("div");
  split.className = "eff-split";

  const list = document.createElement("div");
  list.className = "eff-list";

  const detailPane = document.createElement("div");
  detailPane.className = "eff-detail";

  function selectRow(row, btn) {
    [...list.children].forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    detailPane.innerHTML = "";
    detailPane.appendChild(buildEffectDetail(row));
  }

  filtered.forEach((row, idx) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "eff-list-item";
    item.innerHTML = `
      <span class="eff-list-name">${escapeHtml(row["이름"])}</span>
      <span class="eff-list-tag">${escapeHtml(row["신드롬"])}</span>
    `;
    item.addEventListener("click", () => selectRow(row, item));
    list.appendChild(item);
    if (idx === 0) selectRow(row, item);
  });

  if (!filtered.length) {
    detailPane.innerHTML = `<p class="eff-detail-empty">왼쪽 목록에서 이펙트를 선택하세요.</p>`;
  }

  split.appendChild(list);
  split.appendChild(detailPane);
  entryList.appendChild(split);
}

function buildCharPortraitEl(row, className) {
  const wrap = document.createElement("div");
  wrap.className = className;
  const imgFile = (row["이미지"] || "").trim();
  if (imgFile) {
    const img = document.createElement("img");
    img.src = CHAR_IMAGE_BASE + imgFile;
    img.alt = row["이름"] || "";
    img.onerror = () => {
      wrap.classList.add(className + "-missing");
      wrap.innerHTML = `<span>NO IMAGE</span>`;
    };
    wrap.appendChild(img);
  } else {
    wrap.classList.add(className + "-missing");
    wrap.innerHTML = `<span>NO IMAGE</span>`;
  }
  return wrap;
}

function buildCharSheet(row) {
  const card = document.createElement("article");
  card.className = "char-card";

  const top = document.createElement("div");
  top.className = "char-top";

  const portraitWrap = buildCharPortraitEl(row, "char-portrait");

  const info = document.createElement("div");
  info.className = "char-info";

  const head = document.createElement("div");
  head.className = "char-head";
  head.innerHTML = `
    <span class="char-name">${escapeHtml(row["이름"])}</span>
    <span class="char-grade">${escapeHtml(row["등급"])}</span>
  `;

  const statPanel = document.createElement("div");
  statPanel.className = "char-panel char-stat-panel";

  const statGrid = document.createElement("div");
  statGrid.className = "char-stat-grid";
  CHAR_STAT_KEYS.forEach((key) => {
    const box = document.createElement("div");
    box.className = "char-stat";
    box.innerHTML = `
      <span class="char-stat-label">${key}</span>
      <span class="char-stat-value">${escapeHtml(row[key] || "-")}</span>
    `;
    statGrid.appendChild(box);
  });
  statPanel.appendChild(statGrid);

  info.appendChild(head);
  info.appendChild(statPanel);

  top.appendChild(portraitWrap);
  top.appendChild(info);

  const narrativePanel = document.createElement("div");
  narrativePanel.className = "char-panel char-narrative-panel";

  const narrative = document.createElement("div");
  narrative.className = "char-narrative";
  CHAR_NARRATIVE_KEYS.forEach((key) => {
    const value = (row[key] || "").trim();
    if (!value) return;
    const block = document.createElement("div");
    block.className = "char-block";
    block.innerHTML = `<span class="char-block-label">${key}</span>`;
    const p = document.createElement("p");
    p.textContent = value;
    block.appendChild(p);
    narrative.appendChild(block);
  });
  narrativePanel.appendChild(narrative);

  card.appendChild(top);
  card.appendChild(narrativePanel);
  return card;
}

const charModal = document.getElementById("char-modal");
const charModalBackdrop = document.getElementById("char-modal-backdrop");
const charModalClose = document.getElementById("char-modal-close");
const charModalContent = document.getElementById("char-modal-content");

function openCharModal(row) {
  charModalContent.innerHTML = "";
  charModalContent.appendChild(buildCharSheet(row));
  charModal.hidden = false;
  requestAnimationFrame(() => charModal.classList.add("char-modal-open"));
}

function closeCharModal() {
  charModal.classList.remove("char-modal-open");
  setTimeout(() => { charModal.hidden = true; }, 200);
}

charModalBackdrop.addEventListener("click", closeCharModal);
charModalClose.addEventListener("click", closeCharModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !charModal.hidden) closeCharModal();
});

function renderCharacterCards(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  const roster = document.createElement("div");
  roster.className = "char-roster";

  filtered.forEach((row) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "char-roster-btn";

    const thumb = buildCharPortraitEl(row, "char-roster-thumb");
    const name = document.createElement("span");
    name.className = "char-roster-name";
    name.textContent = row["이름"] || "";

    btn.appendChild(thumb);
    btn.appendChild(name);
    btn.addEventListener("click", () => openCharModal(row));

    roster.appendChild(btn);
  });

  entryList.appendChild(roster);
}

function renderItemCards(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "item-grid";

  const nameKey = state.headers[0];
  const descKey = state.headers.includes("해설") ? "해설" : null;
  const priceKeys = state.headers.filter((h) => h === "구입가" || h === "상비화" || h === "휴대치");
  const metaKeys = state.headers.filter((h) => h === "종별" || h === "기능");
  const chipKeys = state.headers.filter(
    (h) => h !== nameKey && h !== descKey && !priceKeys.includes(h) && !metaKeys.includes(h)
  );

  filtered.forEach((row) => {
    const card = document.createElement("article");
    card.className = "item-card";

    const head = document.createElement("div");
    head.className = "item-card-head";

    const titleBox = document.createElement("div");
    titleBox.className = "item-title-box";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = row[nameKey] || "";
    titleBox.appendChild(name);

    const metaVals = metaKeys.map((k) => row[k]).filter((v) => v && v.trim());
    if (metaVals.length) {
      const meta = document.createElement("span");
      meta.className = "item-meta";
      meta.textContent = metaVals.join(" · ");
      titleBox.appendChild(meta);
    }

    head.appendChild(titleBox);

    if (priceKeys.length) {
      const price = document.createElement("div");
      price.className = "item-price";
      price.innerHTML = priceKeys
        .map(
          (k) => `
            <span class="item-price-item">
              <span class="item-price-label">${escapeHtml(k)}</span>
              <span class="item-price-value">${escapeHtml(row[k] || "-")}</span>
            </span>
          `
        )
        .join('<span class="item-price-sep">/</span>');
      head.appendChild(price);
    }

    card.appendChild(head);

    const chips = document.createElement("div");
    chips.className = "item-chips";
    chipKeys.forEach((key) => {
      const val = row[key];
      if (val === undefined || val === "") return;
      const chip = document.createElement("span");
      chip.className = "item-chip";
      chip.innerHTML = `
        <span class="item-chip-label">${escapeHtml(key)}</span>
        <span class="item-chip-value">${escapeHtml(val)}</span>
      `;
      chips.appendChild(chip);
    });
    card.appendChild(chips);

    if (descKey && (row[descKey] || "").trim()) {
      const desc = document.createElement("p");
      desc.className = "item-desc";
      desc.textContent = row[descKey];
      card.appendChild(desc);
    }

    grid.appendChild(card);
  });

  entryList.appendChild(grid);
}

function renderRuleGroups(filtered) {
  dataTable.hidden = true;
  entryList.hidden = false;
  entryList.innerHTML = "";

  const groups = new Map();
  filtered.forEach((row) => {
    const groupName = (row["그룹"] || "").trim() || row["항목"];
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push(row);
  });

  groups.forEach((items, groupName) => {
    const isMulti = items.length > 1 || (items[0]["그룹"] || "").trim();
    const group = document.createElement("article");
    group.className = "rule-group";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "rule-group-head";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <span class="rule-group-name">${escapeHtml(groupName)}</span>
      <span class="rule-group-count">${items.length}개 항목</span>
      <span class="rule-group-chevron" aria-hidden="true">▾</span>
    `;

    const body = document.createElement("div");
    body.className = "rule-group-body";
    const bodyInner = document.createElement("div");
    bodyInner.className = "rule-group-body-inner";

    items.forEach((row) => {
      const item = document.createElement("div");
      item.className = "rule-item";
      if (isMulti) {
        const title = document.createElement("h4");
        title.className = "rule-item-title";
        title.textContent = row["항목"];
        item.appendChild(title);
      }
      if ((row["설명"] || "").trim()) {
        const p = document.createElement("p");
        p.className = "rule-item-desc";
        p.textContent = row["설명"];
        item.appendChild(p);
      }
      if ((row["회복"] || "").trim()) {
        const rec = document.createElement("p");
        rec.className = "rule-item-recovery";
        rec.innerHTML = `<span class="rule-item-recovery-label">회복</span> ${escapeHtml(row["회복"])}`;
        item.appendChild(rec);
      }
      if ((row["페이지"] || "").trim()) {
        const page = document.createElement("span");
        page.className = "rule-item-page";
        page.textContent = `p.${row["페이지"]}`;
        item.appendChild(page);
      }
      bodyInner.appendChild(item);
    });

    body.appendChild(bodyInner);

    head.addEventListener("click", () => {
      const isOpen = group.classList.toggle("open");
      head.setAttribute("aria-expanded", String(isOpen));
    });

    group.appendChild(head);
    group.appendChild(body);
    entryList.appendChild(group);
  });
}

searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

expandAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".eff-card").forEach((card) => {
    card.classList.add("open");
    card.querySelector(".eff-head")?.setAttribute("aria-expanded", "true");
  });
});

collapseAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".eff-card").forEach((card) => {
    card.classList.remove("open");
    card.querySelector(".eff-head")?.setAttribute("aria-expanded", "false");
  });
});

buildTabs();
loadCategory(state.activeId);
