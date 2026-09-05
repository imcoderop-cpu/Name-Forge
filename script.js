// ===== NameForge — Gaming Username Generator =====

// Symbol sets used to decorate names (safe, widely-supported Unicode)
const PREFIX_SYMBOLS = ["ϟ", "࿐", "✦", "⚔", "彡", "☬", "★", "◆", "❖", "Ⓐ"];
const SUFFIX_SYMBOLS = ["ϟ", "࿐", "✦", "⚔", "彡", "☠", "★", "◆", "❖", "乂"];
const SEPARATORS = ["•", "×", "ㅤ", "-"];

// Unicode "stylish font" character maps
const FONT_MAPS = {
  circled: {
    a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",k:"ⓚ",l:"ⓛ",m:"ⓜ",
    n:"ⓝ",o:"ⓞ",p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",z:"ⓩ"
  },
  bold: {
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",
    n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇"
  },
  script: {
    a:"𝒶",b:"𝒷",c:"𝒸",d:"𝒹",e:"ℯ",f:"𝒻",g:"ℊ",h:"𝒽",i:"𝒾",j:"𝒿",k:"𝓀",l:"𝓁",m:"𝓂",
    n:"𝓃",o:"ℴ",p:"𝓅",q:"𝓆",r:"𝓇",s:"𝓈",t:"𝓉",u:"𝓊",v:"𝓋",w:"𝓌",x:"𝓍",y:"𝓎",z:"𝓏"
  },
  fullwidth: {
    a:"ａ",b:"ｂ",c:"ｃ",d:"ｄ",e:"ｅ",f:"ｆ",g:"ｇ",h:"ｈ",i:"ｉ",j:"ｊ",k:"ｋ",l:"ｌ",m:"ｍ",
    n:"ｎ",o:"ｏ",p:"ｐ",q:"ｑ",r:"ｒ",s:"ｓ",t:"ｔ",u:"ｕ",v:"ｖ",w:"ｗ",x:"ｘ",y:"ｙ",z:"ｚ"
  },
  gothic: {
    a:"𝔞",b:"𝔟",c:"𝔠",d:"𝔡",e:"𝔢",f:"𝔣",g:"𝔤",h:"𝔥",i:"𝔦",j:"𝔧",k:"𝔨",l:"𝔩",m:"𝔪",
    n:"𝔫",o:"𝔬",p:"𝔭",q:"𝔮",r:"𝔯",s:"𝔰",t:"𝔱",u:"𝔲",v:"𝔳",w:"𝔴",x:"𝔵",y:"𝔶",z:"𝔷"
  }
};

const CLEAN_SUFFIXES = ["X", "YT", "OP", "Pro", "Real", "Official", "Gaming", "TV"];
const CLEAN_PREFIXES = ["Mr", "Sir", "King", "The", "Dark", "Shadow"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toFontStyle(word, mapKey) {
  const map = FONT_MAPS[mapKey];
  return word
    .toLowerCase()
    .split("")
    .map(ch => map[ch] || ch)
    .join("");
}

function buildSymbolName(base) {
  const pre = pick(PREFIX_SYMBOLS);
  const suf = pick(SUFFIX_SYMBOLS);
  const sep = pick(SEPARATORS);
  return `${pre}${sep}${base}${sep}${suf}`;
}

function buildFontName(base) {
  const styleKeys = Object.keys(FONT_MAPS);
  const styled = toFontStyle(base, pick(styleKeys));
  // sometimes wrap with a light symbol accent
  if (Math.random() > 0.5) {
    return `${pick(["彡","✦","࿐"])}${styled}`;
  }
  return styled;
}

function buildCleanName(base) {
  const useSuffix = Math.random() > 0.4;
  if (useSuffix) {
    return `${base}${pick(CLEAN_SUFFIXES)}`;
  }
  return `${pick(CLEAN_PREFIXES)}${base}`;
}

const RESULTS_PER_BATCH = 4;

function generateBatch(base, style, count) {
  const results = [];
  const generators = {
    symbol: buildSymbolName,
    font: buildFontName,
    clean: buildCleanName,
  };

  if (style === "all") {
    const order = ["symbol", "font", "clean"];
    for (let i = 0; i < count; i++) {
      const key = order[i % order.length];
      results.push({ name: generators[key](base), style: key });
    }
  } else {
    for (let i = 0; i < count; i++) {
      results.push({ name: generators[style](base), style });
    }
  }
  return results;
}

// ===== DOM wiring =====
const input = document.getElementById("baseName");
const generateBtn = document.getElementById("generateBtn");
const regenBtn = document.getElementById("regenBtn");
const resultsWrap = document.getElementById("resultsWrap");
const resultsEl = document.getElementById("results");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const styleChips = document.querySelectorAll(".chip");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let currentStyle = "all";
let currentBase = "Player";

styleChips.forEach(chip => {
  chip.addEventListener("click", () => {
    styleChips.forEach(c => c.classList.remove("chip-active"));
    chip.classList.add("chip-active");
    currentStyle = chip.dataset.style;
    if (!resultsWrap.classList.contains("hidden")) {
      runGeneration();
    }
  });
});

function appendCards(names, startDelay) {
  names.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.style.animationDelay = `${(startDelay + idx) * 40}ms`;
    card.innerHTML = `
      <span class="result-name">${item.name}</span>
      <span class="result-copy-icon">Copy</span>
    `;
    card.addEventListener("click", () => copyToClipboard(item.name));
    resultsEl.appendChild(card);
  });
}

function runGeneration() {
  const raw = input.value.trim();
  currentBase = raw.length ? raw.replace(/\s+/g, "") : "Player";

  resultsEl.innerHTML = "";
  const names = generateBatch(currentBase, currentStyle, RESULTS_PER_BATCH);
  appendCards(names, 0);

  resultsWrap.classList.remove("hidden");
  emptyState.classList.add("hidden");
  loadMoreBtn.classList.remove("hidden");
}

function loadMore() {
  const existingCount = resultsEl.children.length;
  const names = generateBatch(currentBase, currentStyle, RESULTS_PER_BATCH);
  appendCards(names, existingCount);
}

loadMoreBtn.addEventListener("click", loadMore);

function copyToClipboard(text) {
  // Modern browser approach
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    // Fallback for older/non-secure contexts
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "-999999px";
  ta.style.left = "-999999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    showToast();
  } catch (err) {
    console.error("Copy failed:", err);
  }
  document.body.removeChild(ta);
}

let toastTimer;
function showToast() {
  clearTimeout(toastTimer);
  toast.style.opacity = "1";
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 1600);
}

generateBtn.addEventListener("click", runGeneration);
regenBtn.addEventListener("click", runGeneration);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runGeneration();
});
