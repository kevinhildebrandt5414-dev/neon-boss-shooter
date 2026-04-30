// =====================================================
// NEON BOSS SHOOTER v1.2 FIXED BUILD
// Paste PART 1 + PART 2 + PART 3 + PART 4 together into game.js
// No <script> tags.
// =====================================================

(() => {
"use strict";

// ==========================
// PAGE SETUP
// ==========================
document.body.innerHTML = "";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#050714";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.userSelect = "none";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

const hint = document.createElement("div");
hint.style.position = "fixed";
hint.style.left = "0";
hint.style.right = "0";
hint.style.bottom = "8px";
hint.style.textAlign = "center";
hint.style.color = "#c7d4ff";
hint.style.fontSize = "13px";
hint.style.pointerEvents = "none";
hint.style.textShadow = "0 0 8px #000";
hint.textContent =
  "WASD/Arrows move • Click/Space shoot • Q/E weapon • Shift/X dash • 1/F ability • P/Esc pause • Enter start • M shop • C characters • A achievements • V corrupted";
document.body.appendChild(hint);

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

// ==========================
// SAVE DATA
// ==========================
const SAVE_KEY = "neonBossShooterV12Fixed";

let save = JSON.parse(localStorage.getItem(SAVE_KEY) || "null") || {
  coins: 0,
  costs: { damage: 10, fireRate: 10, health: 10, speed: 10 },
  upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0 },
  achievements: {},
  ownedCharacters: ["CORE"],
  selectedCharacter: "CORE",
  bestWave: 1,
  milestones: {},
  evolutionUnlocked: false,
  chaosUnlocked: false,
  corruptedUnlocked: false,
  corruptedMode: false
};

if (!save.costs) save.costs = { damage: 10, fireRate: 10, health: 10, speed: 10 };
if (!save.upgrades) save.upgrades = { damage: 0, fireRate: 0, health: 0, speed: 0 };
if (!save.achievements) save.achievements = {};
if (!save.ownedCharacters) save.ownedCharacters = ["CORE"];
if (!save.selectedCharacter) save.selectedCharacter = "CORE";
if (!save.bestWave) save.bestWave = 1;
if (!save.milestones) save.milestones = {};
if (save.evolutionUnlocked === undefined) save.evolutionUnlocked = false;
if (save.chaosUnlocked === undefined) save.chaosUnlocked = false;
if (save.corruptedUnlocked === undefined) save.corruptedUnlocked = false;
if (save.corruptedMode === undefined) save.corruptedMode = false;

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

// ==========================
// DATA
// ==========================
const UPGRADE_CAPS = {
  damage: 4,
  fireRate: 4,
  health: 4,
  speed: 4
};

const achievementList = {
  firstBlood: "First Blood - Defeat your first enemy",
  firstBoss: "Boss Slayer - Defeat your first boss",
  wave10: "Evolution Core - Reach wave 10",
  wave25: "The Ravager - Defeat wave 25",
  wave50: "The End Arrives - Reach wave 50",
  finalBoss: "Worldbreaker - Defeat the final boss",
  chaos: "Chaos Begins - Unlock chaos mode",
  corrupted: "Nightmare Signal - Unlock corrupted mode",
  firstShop: "Investor - Buy your first permanent upgrade",
  speedster: "Speedster - Buy 3 speed upgrades",
  rich: "Rich Core - Hold 50 permanent coins",
  firstCharacter: "New Hero - Buy your first character",
  voidUnlocked: "Void Opened - Unlock Void",
  overlordUnlocked: "Boss Reborn - Unlock Overlord",

  phantomUnlocked: "Phantom Trial - Reach wave 40 with Ghost",
  titanUnlocked: "Titan Trial - Defeat Worldbreaker with Tank",
  eclipseUnlocked: "Eclipse Trial - Reach chaos wave 60",
  apexUnlocked: "Apex Trial - Defeat Corrupted Worldbreaker"
};

const weaponData = {
  PISTOL:  { color: "#7dfcff", cooldown: 0.15, sound: 840 },
  SHOTGUN: { color: "#ffd36a", cooldown: 0.62, sound: 230 },
  BURST:   { color: "#a77dff", cooldown: 0.42, sound: 620 },
  LASER:   { color: "#ff5eec", cooldown: 0.12, sound: 980 },
  MINIGUN: { color: "#63ff8b", cooldown: 0.055, sound: 520 },
  RPG:     { color: "#ff9f43", cooldown: 0.95, sound: 150 },
  RAILGUN: { color: "#ffffff", cooldown: 1.45, sound: 1100 },
  FLAMER:  { color: "#ff4d2e", cooldown: 0.045, sound: 180 },
  SPARK:   { color: "#7dfcff", cooldown: 0.165, sound: 760 },
  ORBIT:   { color: "#b28cff", cooldown: 0.20, sound: 650 },
  NOVABURST: { color: "#ff2f88", cooldown: 0.35, sound: 920 }
};

const characterData = {
  CORE: {
    name: "Core", cost: 0, color: "#65b7ff", ring: "#7dfcff", startWeapon: "PISTOL",
    maxHp: 115, speed: 270, damage: 1.25, fireRateBonus: 0, armor: 0,
    passive: "Balanced starter.", manual: "Small heal.", abilityCooldown: 24,
    lockedText: ""
  },
  BLAZE: {
    name: "Blaze", cost: 125, color: "#ff6b3d", ring: "#ffde59", startWeapon: "FLAMER",
    maxHp: 100, speed: 260, damage: 1.5, fireRateBonus: 0.01, armor: 0,
    passive: "Close-range crowd clear.", manual: "Fire nova.", abilityCooldown: 20,
    lockedText: ""
  },
  VOLT: {
    name: "Volt", cost: 150, color: "#7dfcff", ring: "#ffffff", startWeapon: "SPARK",
    maxHp: 90, speed: 310, damage: 1.1, fireRateBonus: 0.04, armor: 0,
    passive: "Fast control core.", manual: "Slow time.", abilityCooldown: 24,
    lockedText: ""
  },
  TANK: {
    name: "Tank", cost: 175, color: "#6cff7a", ring: "#b6ffca", startWeapon: "RPG",
    maxHp: 175, speed: 225, damage: 1.18, fireRateBonus: 0, armor: 4,
    passive: "Safest long-run core.", manual: "Shield.", abilityCooldown: 25,
    lockedText: ""
  },
  GHOST: {
    name: "Ghost", cost: 250, color: "#b28cff", ring: "#ff5eec", startWeapon: "BURST",
    maxHp: 85, speed: 345, damage: 1.15, fireRateBonus: 0.015, armor: 0,
    passive: "Extreme movement.", manual: "Ghost mode.", abilityCooldown: 22,
    lockedText: ""
  },
  NOVA: {
    name: "Nova", cost: 250, color: "#ffffff", ring: "#ff5eec", startWeapon: "RAILGUN",
    maxHp: 100, speed: 255, damage: 1.7, fireRateBonus: 0, armor: 1,
    passive: "Glass cannon.", manual: "Overcharge.", abilityCooldown: 28,
    lockedText: ""
  },
  VOID: {
    name: "Void", cost: 0, color: "#2b114f", ring: "#b28cff", startWeapon: "ORBIT",
    maxHp: 120, speed: 295, damage: 1.35, fireRateBonus: 0.02, armor: 1,
    passive: "Wave 25 unlock. Control core.", manual: "Void push.", abilityCooldown: 24,
    lockedText: "Unlock: defeat wave 25 Ravager"
  },
  OVERLORD: {
    name: "Overlord", cost: 0, color: "#ff2f88", ring: "#ffde59", startWeapon: "RPG",
    maxHp: 145, speed: 265, damage: 1.6, fireRateBonus: 0.015, armor: 2,
    passive: "Wave 50 reward core.", manual: "Boss rage.", abilityCooldown: 30,
    lockedText: "Unlock: defeat Worldbreaker"
  },

  PHANTOM: {
    name: "Phantom", cost: 0, color: "#dac7ff", ring: "#8d6bff", startWeapon: "BURST",
    maxHp: 95, speed: 370, damage: 1.35, fireRateBonus: 0.02, armor: 0,
    passive: "Ghost trial reward. Fast and slippery.", manual: "Phase blink.", abilityCooldown: 20,
    lockedText: "Unlock: reach wave 40 with Ghost"
  },
  TITAN: {
    name: "Titan", cost: 0, color: "#8cff9f", ring: "#ffffff", startWeapon: "RPG",
    maxHp: 220, speed: 230, damage: 1.35, fireRateBonus: 0, armor: 7,
    passive: "Tank trial reward. Huge defense.", manual: "Fortress pulse.", abilityCooldown: 28,
    lockedText: "Unlock: defeat Worldbreaker with Tank"
  },
  ECLIPSE: {
    name: "Eclipse", cost: 0, color: "#ffde59", ring: "#2b114f", startWeapon: "LASER",
    maxHp: 130, speed: 310, damage: 1.45, fireRateBonus: 0.025, armor: 2,
    passive: "Chaos wave 60 reward.", manual: "Solar collapse.", abilityCooldown: 26,
    lockedText: "Unlock: reach chaos wave 60"
  },
  APEX: {
    name: "Apex", cost: 0, color: "#ffffff", ring: "#ff2f88", startWeapon: "NOVABURST",
    maxHp: 210, speed: 360, damage: 1.9, fireRateBonus: 0.035, armor: 5,
    passive: "Hardest reward. High everything.", manual: "Apex annihilation.", abilityCooldown: 30,
    lockedText: "Unlock: defeat Corrupted Worldbreaker"
  }
};

const bossNames = {
  CHARGER: "Ravager Scout",
  DASHLINE: "Blade Runner",
  BULLET_HELL: "Solar Core",
  TANK_BOSS: "Iron Titan",
  SPLITTER: "Crystal Splitter",
  SUMMONER: "Hive Monarch",
  SPIRAL: "Spiral Engine",
  SNIPER: "White Eye",
  PULSER: "Pulse Crown",
  MIRROR: "Shadow Clone",
  HYBRID: "Crowned Hybrid",
  RAVAGER_1: "Ravager: Dormant Form",
  RAVAGER_2: "Ravager: Awakened Form",
  FINAL: "Worldbreaker Ravager",
  PAST_BOSS: "Echo Boss",
  RAVAGER_ECHO: "Ravager Echo",
  RAVAGER_BURNING: "Burning Ravager",
  RAVAGER_VOID: "Void Ravager",
  RAVAGER_IRON: "Iron Ravager",
  RAVAGER_CROWNED: "Crowned Ravager"
};

const bossCycle = [
  "CHARGER", "DASHLINE", "BULLET_HELL", "TANK_BOSS", "SPLITTER",
  "SUMMONER", "SPIRAL", "SNIPER", "PULSER", "MIRROR", "HYBRID"
];

const ravagerEchoCycle = [
  "RAVAGER_ECHO", "RAVAGER_BURNING", "RAVAGER_VOID", "RAVAGER_IRON", "RAVAGER_CROWNED"
];

// ==========================
// STATE
// ==========================
let keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };
let audioCtx = null;

let state = "menu";
let wave = 1;
let bullets = [];
let enemies = [];
let particles = [];
let floatingTexts = [];
let stars = [];
let hazards = [];
let orbs = [];
let cutscene = null;
let lastTime = 0;
let screenShake = 0;
let bossWarningTimer = 0;
let pendingBossType = null;
let currentBossName = "";
let wave25Stage = 0;
let finalStarted = false;
let finalDownTimer = 0;
let godMode = false;
let runWasCorrupted = false;

for (let i = 0; i < 170; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 15 + 5,
    alpha: Math.random() * 0.6 + 0.2
  });
}

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 18,
  hp: 100,
  maxHp: 100,
  speed: 260,
  damage: 1.2,
  weaponIndex: 0,
  weapons: ["PISTOL"],
  lastShot: 0,
  bulletSpeed: 760,
  dashCooldown: 3.3,
  lastDash: -99,
  dashTimer: 0,
  dashDuration: 0.14,
  dashDistance: 190,
  dashDirX: 0,
  dashDirY: 0,
  invincible: 0,
  fireRateBonus: 0,
  pelletBonus: 0,
  armor: 0,
  abilityCooldown: 18,
  lastAbility: -999,
  shieldTimer: 0,
  slowTimeTimer: 0,
  ghostTimer: 0,
  overchargeTimer: 0,
  rageTimer: 0,
  critChance: 0,
  vampireCore: false,
  shieldBreaker: false,
  orbRunner: false,
  beamResist: false,
  killsSinceHeal: 0
};

// ==========================
// BASIC UTILS
// ==========================
function resetControls() {
  keys = {};
  mouse.down = false;
}

function unlockAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, duration, type, volume) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type || "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(volume || 0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function bossSfx(kind) {
  if (kind === "boss") {
    playSound(90, 0.22, "sawtooth", 0.08);
    setTimeout(() => playSound(55, 0.28, "sawtooth", 0.09), 180);
  }

  if (kind === "ravager") {
    playSound(60, 0.35, "sawtooth", 0.09);
    setTimeout(() => playSound(180, 0.12, "square", 0.06), 160);
    setTimeout(() => playSound(90, 0.28, "sawtooth", 0.08), 320);
  }

  if (kind === "worldbreaker") {
    playSound(45, 0.45, "sawtooth", 0.10);
    setTimeout(() => playSound(90, 0.25, "sawtooth", 0.08), 160);
    setTimeout(() => playSound(220, 0.18, "square", 0.07), 320);
    setTimeout(() => playSound(55, 0.45, "sawtooth", 0.10), 480);
  }

  if (kind === "beam") {
    playSound(320, 0.08, "triangle", 0.045);
    setTimeout(() => playSound(90, 0.12, "sawtooth", 0.06), 130);
  }

  if (kind === "final") {
    playSound(700, 0.06, "triangle", 0.045);
    setTimeout(() => playSound(180, 0.12, "sawtooth", 0.055), 120);
  }

  if (kind === "ability") {
    playSound(900, 0.08, "triangle", 0.05);
    setTimeout(() => playSound(500, 0.10, "sine", 0.04), 90);
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function floatingText(x, y, text, color, size) {
  floatingTexts.push({ x, y, text, color, size, life: 1.35 });
}

function burst(x, y, color, amount, power) {
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * power + 40;

    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r: Math.random() * 4 + 2,
      color,
      life: 0.5 + Math.random() * 0.45
    });
  }
}

function lockPlayerInBounds() {
  if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dashTimer = 0;
    return;
  }

  const oldX = player.x;
  const oldY = player.y;

  player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
  player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

  if (player.x !== oldX || player.y !== oldY) {
    player.dashTimer = 0;
  }
}

function unlockAchievement(id) {
  if (save.achievements[id]) return;

  save.achievements[id] = true;
  save.coins += 5;
  saveGame();

  floatingText(canvas.width / 2, canvas.height / 2 - 115, "ACHIEVEMENT: " + achievementList[id] + " (+5)", "#ffde59", 20);
  playSound(900, 0.18, "triangle", 0.07);
}

function unlockCharacter(id, achievementId) {
  if (!characterData[id]) return;

  if (save.ownedCharacters.indexOf(id) === -1) {
    save.ownedCharacters.push(id);
    saveGame();
    floatingText(canvas.width / 2, canvas.height / 2 - 80, "CHARACTER UNLOCKED: " + characterData[id].name, characterData[id].color, 24);
  }

  if (achievementId) unlockAchievement(achievementId);
}

function countBosses() {
  return enemies.filter(e => e.boss).length;
}
// ==========================
// TRAITS
// ==========================
function getCorruptionLevel() {
  if (!save.corruptedMode) return 0;
  return Math.max(1, Math.floor((wave - 1) / 5) + 1);
}

function getVoidLevel() {
  if (save.corruptedMode) return 0;
  if (wave <= 50) return 0;
  return 1;
}

function applyEnemyTraits(enemy) {
  const corruption = getCorruptionLevel();
  const voidLevel = getVoidLevel();

  enemy.corrupted = false;
  enemy.voided = false;

  if (voidLevel > 0) {
    enemy.voided = true;
    enemy.hp *= 1.1;
    enemy.maxHp *= 1.1;
    enemy.speed *= 1.08;
    enemy.damage *= 1.08;
    if (!enemy.boss) enemy.color = "#6b3cff";
  }

  if (corruption > 0) {
    enemy.corrupted = true;

    const hpMult = 1 + corruption * 0.18;
    const speedMult = 1 + corruption * 0.12;
    const damageMult = 1 + corruption * 0.12;

    enemy.hp *= hpMult;
    enemy.maxHp *= hpMult;
    enemy.speed *= speedMult;
    enemy.damage *= damageMult;
    enemy.color = enemy.boss ? "#b000ff" : "#c026ff";

    if (enemy.type === "shooter") {
      enemy.shootCooldown *= Math.max(0.45, 1 - corruption * 0.08);
      enemy.bulletSpeed *= 1 + corruption * 0.08;
    }
  }
}

// ==========================
// INPUT
// ==========================
addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  unlockAudio();

  if (e.key === "F1") {
    e.preventDefault();
    openDevConsole();
    return;
  }

  if (state === "paused") {
    if (k === "p" || k === "r" || e.key === "Escape") {
      state = "playing";
      resetControls();
      return;
    }

    if (k === "m") {
      panicResetToMenu(false);
      return;
    }

    return;
  }

  if (state === "playing" && (k === "p" || e.key === "Escape")) {
    state = "paused";
    resetControls();
    return;
  }

  if (state === "playing" && (k === "1" || k === "f" || e.key === "1" || e.code === "Digit1" || e.code === "Numpad1")) {
    e.preventDefault();
    useCharacterAbility();
    return;
  }

  if (k === "q" && state === "playing") {
    player.weaponIndex = (player.weaponIndex - 1 + player.weapons.length) % player.weapons.length;
    playSound(420, 0.05, "square", 0.04);
  }

  if (k === "e" && state === "playing") {
    player.weaponIndex = (player.weaponIndex + 1) % player.weapons.length;
    playSound(520, 0.05, "square", 0.04);
  }

  if (k === "m" && state === "menu") openMainMenuShop();
  if (k === "c" && state === "menu") openCharacterShop();
  if (k === "a" && state === "menu") showAchievements();

  if (k === "v" && state === "menu") {
    if (!save.corruptedUnlocked) {
      alert("Corrupted Mode unlocks after defeating Worldbreaker at wave 50.");
    } else {
      save.corruptedMode = !save.corruptedMode;
      saveGame();
      alert("Corrupted Mode: " + (save.corruptedMode ? "ON" : "OFF"));
    }
    resetControls();
  }

  if ((state === "menu" || state === "dead") && e.key === "Enter") startGame();

  if (state === "cutscene" && e.key === "Enter" && cutscene) {
    cutscene.timer = 999;
  }
});

addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", () => {
  mouse.down = true;
  unlockAudio();
});

canvas.addEventListener("mouseup", () => {
  mouse.down = false;
});

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  unlockAudio();
  mouse.down = true;
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  mouse.down = false;
});

// ==========================
// DEV CONSOLE
// ==========================
function openDevConsole() {
  const pw = prompt("...");
  resetControls();

  if (pw !== "Neondevshooterdoggoz") return;

  let cmd = prompt(
    "Input:\n\n" +
    "wave25\n" +
    "wave50\n" +
    "wave75\n" +
    "coins100\n" +
    "unlockall\n" +
    "god\n" +
    "panic\n" +
    "reset"
  );

  resetControls();
  if (!cmd) return;

  cmd = cmd.toLowerCase();

  if (cmd === "wave25") {
    startGame();
    wave = 25;
    save.milestones.wave25 = false;
    spawnWave();
  } else if (cmd === "wave50") {
    startGame();
    wave = 50;
    spawnWave();
  } else if (cmd === "wave75") {
    startGame();
    wave = 75;
    spawnWave();
  } else if (cmd === "coins100") {
    save.coins += 100;
    saveGame();
    alert("+100 coins");
  } else if (cmd === "unlockall") {
    save.ownedCharacters = Object.keys(characterData);
    save.evolutionUnlocked = true;
    save.chaosUnlocked = true;
    save.corruptedUnlocked = true;
    saveGame();
    alert("Unlocked all characters and modes.");
  } else if (cmd === "god") {
    godMode = !godMode;
    alert("God mode: " + godMode);
  } else if (cmd === "panic") {
    panicResetToMenu(true);
  } else if (cmd === "reset") {
    if (confirm("Reset full save?")) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  }
}

function panicResetToMenu(showAlert) {
  godMode = false;
  state = "menu";
  wave = 1;

  enemies = [];
  bullets = [];
  hazards = [];
  orbs = [];
  particles = [];
  floatingTexts = [];

  cutscene = null;
  bossWarningTimer = 0;
  pendingBossType = null;
  currentBossName = "";
  wave25Stage = 0;
  finalStarted = false;
  finalDownTimer = 0;
  screenShake = 0;

  player.hp = player.maxHp;
  player.invincible = 0;
  player.dashTimer = 0;
  player.shieldTimer = 0;
  player.slowTimeTimer = 0;
  player.ghostTimer = 0;
  player.overchargeTimer = 0;
  player.rageTimer = 0;

  resetControls();

  if (showAlert) alert("Panic reset complete.");
}

// ==========================
// MENU / SHOP
// ==========================
function showAchievements() {
  let msg = "ACHIEVEMENTS\n\n";

  for (const id in achievementList) {
    msg += (save.achievements[id] ? "✅ " : "⬜ ") + achievementList[id] + "\n";
  }

  msg += "\nAchievements give +5 permanent coins.";
  alert(msg);
  resetControls();
}

function openMainMenuShop() {
  let shopping = true;

  while (shopping) {
    let msg =
      "PERMANENT UPGRADE SHOP\n\n" +
      "Coins: " + save.coins + "\n\n" +
      "1. Damage " + save.upgrades.damage + "/" + UPGRADE_CAPS.damage + " — Cost: " + save.costs.damage + "\n" +
      "2. Fire Rate " + save.upgrades.fireRate + "/" + UPGRADE_CAPS.fireRate + " — Cost: " + save.costs.fireRate + "\n" +
      "3. Health " + save.upgrades.health + "/" + UPGRADE_CAPS.health + " — Cost: " + save.costs.health + "\n" +
      "4. Speed " + save.upgrades.speed + "/" + UPGRADE_CAPS.speed + " — Cost: " + save.costs.speed + "\n" +
      "5. Leave Shop\n\n" +
      "All permanent upgrades cap at 4.";

    const choice = prompt(msg);
    resetControls();

    if (choice === null || choice === "5") shopping = false;
    else if (choice === "1") buyPermanentUpgrade("damage");
    else if (choice === "2") buyPermanentUpgrade("fireRate");
    else if (choice === "3") buyPermanentUpgrade("health");
    else if (choice === "4") buyPermanentUpgrade("speed");
    else alert("Pick 1, 2, 3, 4, or 5.");
  }
}

function buyPermanentUpgrade(type) {
  if (save.upgrades[type] >= UPGRADE_CAPS[type]) {
    alert(type + " is already maxed.");
    resetControls();
    return;
  }

  const cost = save.costs[type];

  if (save.coins < cost) {
    alert("Not enough coins. You need " + cost + ".");
    resetControls();
    return;
  }

  save.coins -= cost;
  save.upgrades[type]++;
  save.costs[type] += 5;
  saveGame();

  unlockAchievement("firstShop");
  if (save.upgrades.speed >= 3) unlockAchievement("speedster");

  alert(type + " upgraded!");
  resetControls();
}

function openCharacterShop() {
  const ids = Object.keys(characterData);

  let msg = "CHARACTER SHOP\n\n";
  msg += "Coins: " + save.coins + "\n";
  msg += "Selected: " + characterData[save.selectedCharacter].name + "\n\n";

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const c = characterData[id];
    const owned = save.ownedCharacters.indexOf(id) !== -1;

    let status = owned ? "OWNED" : c.cost + " coins";
    if (!owned && c.cost === 0 && c.lockedText) status = c.lockedText;

    msg += (i + 1) + ". " + c.name + " | " + status +
      " | HP " + c.maxHp +
      " | SPD " + c.speed +
      " | DMG " + c.damage +
      " | Start: " + c.startWeapon + "\n";
  }

  msg += "\nType a number to buy/select.";

  const choice = prompt(msg);
  resetControls();

  if (choice === null) return;

  const index = Number(choice) - 1;
  if (index < 0 || index >= ids.length || Number.isNaN(index)) return;

  const id = ids[index];
  const c = characterData[id];
  const owned = save.ownedCharacters.indexOf(id) !== -1;

  if (owned) {
    save.selectedCharacter = id;
    saveGame();
    alert(c.name + " selected!");
    resetControls();
    return;
  }

  if (c.cost === 0 && c.lockedText) {
    alert(c.lockedText);
    resetControls();
    return;
  }

  if (save.coins < c.cost) {
    alert("Not enough coins.");
    resetControls();
    return;
  }

  save.coins -= c.cost;
  save.ownedCharacters.push(id);
  save.selectedCharacter = id;
  saveGame();

  unlockAchievement("firstCharacter");

  alert(c.name + " bought and selected!");
  resetControls();
}

// ==========================
// START / CUTSCENE
// ==========================
function startGame() {
  state = "playing";
  wave = 1;
  bullets = [];
  enemies = [];
  particles = [];
  floatingTexts = [];
  hazards = [];
  orbs = [];
  screenShake = 0;
  bossWarningTimer = 0;
  pendingBossType = null;
  currentBossName = "";
  wave25Stage = 0;
  finalStarted = false;
  finalDownTimer = 0;
  godMode = false;
  runWasCorrupted = save.corruptedMode;

  resetControls();

  const char = characterData[save.selectedCharacter] || characterData.CORE;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.maxHp = char.maxHp + save.upgrades.health * 15;
  player.hp = player.maxHp;
  player.speed = char.speed + save.upgrades.speed * 15;
  player.damage = char.damage * (1 + save.upgrades.damage * 0.075);
  player.weaponIndex = 0;
  player.weapons = [char.startWeapon];
  player.lastShot = 0;
  player.bulletSpeed = 760;
  player.dashCooldown = 3.3;
  player.lastDash = -99;
  player.dashTimer = 0;
  player.dashDuration = 0.14;
  player.dashDistance = 190;
  player.dashDirX = 0;
  player.dashDirY = 0;
  player.invincible = 0;
  player.fireRateBonus = char.fireRateBonus + save.upgrades.fireRate * 0.007;
  player.pelletBonus = 0;
  player.armor = char.armor;
  player.abilityCooldown = char.abilityCooldown;
  player.lastAbility = -999;
  player.shieldTimer = 0;
  player.slowTimeTimer = 0;
  player.ghostTimer = 0;
  player.overchargeTimer = 0;
  player.rageTimer = 0;
  player.critChance = 0;
  player.vampireCore = false;
  player.shieldBreaker = false;
  player.orbRunner = false;
  player.beamResist = false;
  player.killsSinceHeal = 0;

  spawnWave();
  playSound(260, 0.12, "sawtooth", 0.06);
}

function startCutscene(lines, onFinish) {
  state = "cutscene";
  cutscene = { lines, index: 0, timer: 0, onFinish };
  resetControls();
}

function updateCutscene(dt) {
  if (!cutscene) return;

  cutscene.timer += dt;

  const current = cutscene.lines[cutscene.index];
  const duration = current.duration || 2.2;

  if (cutscene.timer >= duration) {
    cutscene.timer = 0;
    cutscene.index++;

    if (cutscene.index >= cutscene.lines.length) {
      const finish = cutscene.onFinish;
      cutscene = null;
      state = "playing";
      if (finish) finish();
    }
  }
}

function startWave25Intro() {
  startCutscene([
    { text: "WAVE 25", color: "#ffde59", size: 46, duration: 1.4 },
    { text: "A dead machine blocks the arena...", color: "#c7d4ff", duration: 2.1, kind: "ravager_dead" },
    { text: "The Ravager is dormant.", color: "#ffffff", duration: 2.0, kind: "ravager_dead" },
    { text: "Destroy it before it wakes.", color: "#ff5e3b", duration: 2.0, kind: "ravager_dead" }
  ], function () {
    spawnBoss("RAVAGER_1", false, false);
    currentBossName = bossNames.RAVAGER_1;
    floatingText(canvas.width / 2, 90, "RAVAGER: DORMANT FORM", "#ffde59", 30);
    bossSfx("ravager");
  });
}

function startRavagerAwakening() {
  startCutscene([
    { text: "TARGET NEUTRALIZED.", color: "#6cff7a", duration: 1.8, kind: "ravager_dead" },
    { text: "...", color: "#ffffff", duration: 1.4, kind: "ravager_dead" },
    { text: "ENERGY SIGNATURE DETECTED.", color: "#ffde59", duration: 2.0, kind: "ravager_awaken" },
    { text: "THE RAVAGER AWAKENS.", color: "#ff2f88", size: 42, duration: 2.2, kind: "ravager_awaken" }
  ], function () {
    spawnBoss("RAVAGER_2", false, false);
    currentBossName = bossNames.RAVAGER_2;
    floatingText(canvas.width / 2, 90, "RAVAGER: AWAKENED FORM", "#ff2f88", 34);
    screenShake = 15;
    bossSfx("ravager");
  });
}

function startWave50Intro() {
  startCutscene([
    { text: "WAVE 50", color: "#ffde59", size: 48, duration: 1.4 },
    { text: "The corpse from wave 25 begins to move.", color: "#c7d4ff", duration: 2.2, kind: "ravager_dead" },
    { text: "WARNING: FINAL EVOLUTION DETECTED.", color: "#ff5e3b", duration: 2.0, kind: "ravager_awaken" },
    { text: "IT WAS NEVER DEAD.", color: "#ff2f88", size: 42, duration: 2.2, kind: "ravager_awaken" },
    { text: "WORLDBREAKER RAVAGER", color: "#ff2f88", size: 46, duration: 2.4, kind: "final" },
    { text: "YOUR STORED POWER SHATTERS.", color: "#ffde59", duration: 2.0, kind: "final" },
    { text: "Use the fallen orbs to bring it down.", color: "#7dfcff", duration: 2.2, kind: "final" }
  ], function () {
    spawnBoss("FINAL", false, false);
    currentBossName = bossNames.FINAL;
    finalStarted = true;
    floatingText(canvas.width / 2, 90, "FINAL BOSS", "#ff2f88", 40);
    screenShake = 18;
    bossSfx("worldbreaker");
  });
}

function startFinalEndingCutscene() {
  bullets = [];
  hazards = [];
  orbs = [];
  particles = [];

  for (let i = 0; i < 180; i++) {
    burst(canvas.width / 2, canvas.height / 2 - 60, i % 2 ? "#ff2f88" : "#ffde59", 1, 720);
  }

  startCutscene([
    { text: "WORLDBREAKER RAVAGER DEFEATED", color: "#ffffff", size: 42, duration: 2.2, kind: "final_explode" },
    { text: "The core shattered...", color: "#7dfcff", duration: 2.1, kind: "final_explode" },
    { text: "For one second, the neon world went silent.", color: "#c7d4ff", duration: 2.4, kind: "dark" },
    { text: "But the silence did not last.", color: "#ff5e3b", duration: 2.2, kind: "dark" },
    { text: "Fragments of the Ravager scattered into every wave.", color: "#ffde59", duration: 2.8, kind: "final_explode" },
    { text: "CHAOS MODE UNLOCKED", color: "#ff2f88", size: 48, duration: 2.3, kind: "final_explode" },
    { text: "Corrupted Mode has awakened.", color: "#b000ff", duration: 2.4, kind: "final_explode" }
  ], function () {
    save.chaosUnlocked = true;
    save.corruptedUnlocked = true;

    unlockCharacter("OVERLORD", "overlordUnlocked");

    if (runWasCorrupted) {
      unlockCharacter("APEX", "apexUnlocked");
    }

    if (save.selectedCharacter === "TANK") {
      unlockCharacter("TITAN", "titanUnlocked");
    }

    save.coins += runWasCorrupted ? 175 : 100;
    saveGame();

    unlockAchievement("finalBoss");
    unlockAchievement("chaos");
    unlockAchievement("corrupted");

    alert(
      "FINAL BOSS DEFEATED!\n\n" +
      "Chaos Mode unlocked!\n" +
      "Corrupted Mode unlocked!\n" +
      "+100 coins!\n" +
      "Overlord unlocked!" +
      (runWasCorrupted ? "\n\nAPEX UNLOCKED for beating Corrupted Worldbreaker!" : "")
    );

    resetControls();
    wave++;
    state = "playing";
    spawnWave();
  });
}
// ==========================
// WAVES / SPAWNING
// ==========================
function applyMilestones() {
  if (wave >= 10 && !save.milestones.wave10) {
    save.milestones.wave10 = true;
    save.coins += 10;
    save.evolutionUnlocked = true;
    saveGame();

    unlockAchievement("wave10");

    alert("MILESTONE: WAVE 10!\n\n+10 coins!\nWeapon evolutions unlocked!");
    resetControls();
  }
}

function checkCharacterUnlockProgress() {
  if (save.selectedCharacter === "GHOST" && wave >= 40) {
    unlockCharacter("PHANTOM", "phantomUnlocked");
  }

  if (wave >= 60 && wave > 50) {
    unlockCharacter("ECLIPSE", "eclipseUnlocked");
  }
}

function spawnWave() {
  enemies = [];
  bullets = [];
  hazards = [];
  orbs = [];

  if (wave > save.bestWave) {
    save.bestWave = wave;
    saveGame();
  }

  checkCharacterUnlockProgress();
  applyMilestones();

  if (wave === 25 && !save.milestones.wave25) {
    startWave25Intro();
    return;
  }

  if (wave === 50 && !save.chaosUnlocked) {
    unlockAchievement("wave50");
    startWave50Intro();
    return;
  }

  // IMPORTANT FIX:
  // Chaos starts ONLY after wave 50.
  // It does NOT start on wave 1 just because chaosUnlocked is true.
  if (wave > 50) {
    startChaosWave();
    return;
  }

  if (wave % 4 === 0) {
    const bossIndex = Math.floor(wave / 4 - 1) % bossCycle.length;
    startBossWarning(bossCycle[bossIndex]);
    return;
  }

  const easyScale = wave < 25 ? 0.72 : 1.0;
  const count = Math.floor((5 + wave * 1.6) * easyScale);

  for (let i = 0; i < count; i++) spawnEnemy("normal");

  if (wave >= 4) {
    for (let i = 0; i < Math.floor(wave / 3); i++) spawnEnemy("fast");
  }

  if (wave >= 9) {
    for (let i = 0; i < Math.floor(wave / 6); i++) spawnEnemy("tank");
  }

  if (wave >= 5) {
    const shooterCount = Math.max(1, Math.floor(wave / 7));
    for (let i = 0; i < shooterCount; i++) spawnEnemy("shooter");
  }

  floatingText(canvas.width / 2, 90, "WAVE " + wave, "#7dfcff", 28);
}

function startWave75Troll() {
  spawnBoss("RAVAGER_CROWNED", true, false);
  spawnBoss("HYBRID", true, false);
  spawnBoss("SNIPER", true, false);

  for (let i = 0; i < 6; i++) spawnEnemy("shooter");
  for (let i = 0; i < 8; i++) spawnEnemy("fast");
  for (let i = 0; i < 4; i++) spawnEnemy("tank");

  hazards.push({
    type: "laneStrike",
    lanes: [1, 4, 6],
    timer: 0,
    warning: 0.85,
    duration: 0.32,
    damage: 42,
    color: "#ff1f4f"
  });

  floatingText(canvas.width / 2, 90, "WAVE 75: THE TROLL TRIAL", "#ffde59", 34);
  floatingText(canvas.width / 2, 130, "Three bosses. One mistake hurts.", "#ff2f88", 24);

  bossSfx("worldbreaker");
  screenShake = 16;
}

function startChaosWave() {
  if (wave <= 50) {
    console.warn("Blocked accidental Chaos Mode on wave " + wave);
    return;
  }

  if (wave === 75) {
    startWave75Troll();
    return;
  }

  const bossIndex = Math.floor(wave - 51) % bossCycle.length;
  const bossA = bossCycle[bossIndex];
  const bossB = bossCycle[(bossIndex + 4) % bossCycle.length];

  if (wave % 5 === 0) {
    const echoIndex = Math.floor((wave - 55) / 5) % ravagerEchoCycle.length;
    spawnBoss(ravagerEchoCycle[Math.max(0, echoIndex)], true, false);
    spawnBoss(bossB, true, false);
    floatingText(canvas.width / 2, 90, "RAVAGER ECHO WAVE " + wave, "#b28cff", 30);
  } else {
    spawnBoss(bossA, true, false);
    spawnBoss(bossB, true, false);
    floatingText(canvas.width / 2, 90, "CHAOS WAVE " + wave + " - DOUBLE BOSSES", "#ff3b93", 30);
  }

  const count = 4 + Math.floor(wave / 7);

  for (let i = 0; i < count; i++) {
    spawnEnemy(i % 3 === 0 ? "shooter" : i % 2 === 0 ? "fast" : "normal");
  }
}

function startBossWarning(type) {
  state = "bossWarning";
  bossWarningTimer = 2.1;
  pendingBossType = type;
  currentBossName = bossNames[type] || "Boss";

  floatingText(canvas.width / 2, canvas.height / 2, currentBossName.toUpperCase(), "#ff3b93", 40);
  bossSfx("boss");
  screenShake = 9;
}

function updateBossWarning(dt) {
  updateStars(dt);
  bossWarningTimer -= dt;

  for (const f of floatingTexts) {
    f.y -= 18 * dt;
    f.life -= dt * 0.25;
  }

  if (bossWarningTimer <= 0) {
    floatingTexts = [];
    state = "playing";
    spawnBoss(pendingBossType || "CHARGER", false, false);
    floatingText(canvas.width / 2, 90, currentBossName, "#ff3b93", 34);
    bossSfx("boss");
  }

  screenShake *= 0.9;
}

function randomEdgePosition() {
  const side = Math.floor(Math.random() * 4);

  if (side === 0) return { x: Math.random() * canvas.width, y: -70 };
  if (side === 1) return { x: canvas.width + 70, y: Math.random() * canvas.height };
  if (side === 2) return { x: Math.random() * canvas.width, y: canvas.height + 70 };

  return { x: -70, y: Math.random() * canvas.height };
}

function spawnEnemy(type) {
  const p = randomEdgePosition();

  let enemy = {
    x: p.x,
    y: p.y,
    r: 18,
    hp: (4 + wave * 0.75) * 1.25,
    maxHp: (4 + wave * 0.75) * 1.25,
    speed: 75 + wave * 3.5,
    damage: 9,
    type,
    boss: false,
    color: "#ff5e3b",
    hit: 0,
    spin: Math.random() * 10,
    timer: 0
  };

  if (type === "fast") {
    enemy.r = 13;
    enemy.hp = (2.5 + wave * 0.45) * 1.25;
    enemy.maxHp = enemy.hp;
    enemy.speed = 140 + wave * 5;
    enemy.damage = 11;
    enemy.color = "#ffde59";
  }

  if (type === "tank") {
    enemy.r = 25;
    enemy.hp = (8 + wave * 1.25) * 2;
    enemy.maxHp = enemy.hp;
    enemy.speed = 50 + wave * 1.6;
    enemy.damage = 16;
    enemy.color = "#ff7bba";
  }

  if (type === "shooter") {
    enemy.r = 16;
    enemy.hp = 3 + wave * 0.45;
    enemy.maxHp = enemy.hp;
    enemy.speed = 65 + wave * 2;
    enemy.damage = 9;
    enemy.color = "#7dfcff";
    enemy.shootTimer = 1.5 + Math.random();
    enemy.shootCooldown = 2.4;
    enemy.bulletSpeed = 210 + wave * 2;
  }

  if (type === "mirror") {
    enemy.r = 15;
    enemy.hp = 4 + wave * 0.65;
    enemy.maxHp = enemy.hp;
    enemy.speed = 120 + wave * 2.5;
    enemy.damage = 12;
    enemy.color = "#b28cff";
  }

  applyEnemyTraits(enemy);
  enemies.push(enemy);
}

function spawnBoss(type, chaos, small) {
  if (countBosses() >= 4 && type !== "FINAL") {
    return;
  }

  const p = randomEdgePosition();

  let hp = 65 + wave * 17;
  let speed = 70 + wave * 1.7;
  let damage = 22;
  let r = small ? 42 : 58;
  let color = "#ff2f88";

  if (type === "CHARGER") {
    hp *= 0.7;
    speed *= wave < 20 ? 1.0 : 1.35;
    color = "#ff5e3b";
  }

  if (type === "DASHLINE") {
    hp *= 0.85;
    speed *= 1.1;
    color = "#ff9f43";
  }

  if (type === "BULLET_HELL") {
    hp *= 0.8;
    speed *= 0.72;
    color = "#ffde59";
  }

  if (type === "TANK_BOSS") {
    hp *= 1.65;
    speed *= 0.55;
    damage += 6;
    color = "#ff7bba";
  }

  if (type === "SPLITTER") {
    hp *= 1.05;
    color = "#a77dff";
  }

  if (type === "SUMMONER") {
    hp *= 0.95;
    speed *= 0.75;
    color = "#6cff7a";
  }

  if (type === "SPIRAL") {
    color = "#7dfcff";
  }

  if (type === "SNIPER") {
    hp *= 0.85;
    speed *= 0.6;
    color = "#ffffff";
  }

  if (type === "PULSER") {
    hp *= 1.15;
    speed *= 0.75;
    color = "#ff9f43";
  }

  if (type === "MIRROR") {
    color = "#b28cff";
  }

  if (type === "HYBRID") {
    hp *= 1.3;
    damage += 4;
    color = "#ff3b93";
  }

  if (type === "RAVAGER_1") {
    hp = 520 * 1.5;
    speed = 0;
    damage = 18;
    r = 70;
    color = "#5b6478";
  }

  if (type === "RAVAGER_2") {
    hp = 900 * 1.5;
    speed = 86;
    damage = 30;
    r = 76;
    color = "#ff2f88";
  }

  if (type === "FINAL") {
    hp = 2800 * 1.25;
    speed = 0;
    damage = 42;
    r = 125;
    color = "#ff2f88";
  }

  if (type === "PAST_BOSS") {
    hp = 190 + wave * 8;
    speed = 80 + wave * 1.3;
    damage = 20;
    r = 40;
    color = "#b28cff";
  }

  if (type === "RAVAGER_ECHO") {
    hp = 650 + wave * 12;
    speed = 90;
    damage = 28;
    r = 62;
    color = "#b28cff";
  }

  if (type === "RAVAGER_BURNING") {
    hp = 700 + wave * 13;
    speed = 95;
    damage = 31;
    r = 64;
    color = "#ff5e3b";
  }

  if (type === "RAVAGER_VOID") {
    hp = 720 + wave * 13;
    speed = 88;
    damage = 32;
    r = 66;
    color = "#6b3cff";
  }

  if (type === "RAVAGER_IRON") {
    hp = 920 + wave * 15;
    speed = 70;
    damage = 34;
    r = 70;
    color = "#8cff9f";
  }

  if (type === "RAVAGER_CROWNED") {
    hp = 1000 + wave * 16;
    speed = 95;
    damage = 36;
    r = 72;
    color = "#ffde59";
  }

  if (chaos) {
    hp *= small ? 0.65 : 1.15;
    speed *= 1.08;
    damage += 4;
  }

  const boss = {
    x: type === "FINAL" || type === "RAVAGER_1" ? canvas.width / 2 : p.x,
    y: type === "FINAL" ? canvas.height * 0.22 : type === "RAVAGER_1" ? canvas.height / 2 : p.y,
    r,
    hp,
    maxHp: hp,
    speed,
    damage,
    boss: true,
    bossType: type,
    chaos,
    smallBoss: small,
    type: "boss",
    color,
    hit: 0,
    shootTimer: 1.2,
    specialTimer: 2.2,
    chargeTimer: player.dashCooldown * 2,
    summonTimer: 3,
    orbTimer: 6.5,
    quadrantTimer: 3.2,
    laneTimer: 2.6,
    eyeTimer: 1.12,
    swordTimer: 5.2,
    slashTimer: 7.2,
    spin: 0,
    phase: 1,
    splitDone: false,
    dashPause: 0,
    dashVx: 0,
    dashVy: 0,
    downed: false
  };

  applyEnemyTraits(boss);
  enemies.push(boss);
}

// ==========================
// WEAPONS
// ==========================
function getCurrentWeapon() {
  return player.weapons[player.weaponIndex];
}

function weaponEvolved() {
  return save.evolutionUnlocked;
}

function getBaseDamageForShot() {
  const finalBossActive = enemies.some(e => e.bossType === "FINAL");

  if (!finalBossActive) return player.damage;

  const char = characterData[save.selectedCharacter] || characterData.CORE;
  return char.damage;
}

function shouldCrit(weaponName) {
  let chance = player.critChance || 0;

  if (["MINIGUN", "FLAMER", "SPARK", "LASER"].includes(weaponName)) {
    chance *= 0.4;
  }

  return Math.random() < chance;
}

function shoot(now) {
  const weaponName = getCurrentWeapon();
  const data = weaponData[weaponName] || weaponData.PISTOL;

  let cooldown = Math.max(0.035, data.cooldown - player.fireRateBonus);

  if (now - player.lastShot < cooldown) return;

  player.lastShot = now;

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  let damageBoost = player.overchargeTimer > 0 ? 1.7 : 1;

  if (player.rageTimer > 0) damageBoost *= 1.45;

  const evo = weaponEvolved();
  const baseDmg = getBaseDamageForShot();
  const crit = shouldCrit(weaponName) ? 1.75 : 1;

  if (weaponName === "PISTOL") {
    createPlayerBullet(angle, (baseDmg * damageBoost * crit) * 0.75, data.color, 5, 1.2, false, weaponName);

    if (evo) {
      createPlayerBullet(angle + 0.08, (baseDmg * 0.8 * damageBoost) * 0.75, data.color, 4, 1.1, false, weaponName);
    }

    playSound(data.sound, 0.04, "square", 0.035);
  }

  if (weaponName === "SHOTGUN") {
    const pellets = 8 + player.pelletBonus + (evo ? 3 : 0);

    for (let i = 0; i < pellets; i++) {
      const spread = (Math.random() - 0.5) * (evo ? 0.82 : 0.68);
      createPlayerBullet(
        angle + spread,
        baseDmg * 0.75 * damageBoost * (shouldCrit(weaponName) ? 1.75 : 1),
        data.color,
        4,
        0.68,
        false,
        weaponName
      );
    }

    burst(player.x, player.y, data.color, 15, 260);
    playSound(data.sound, 0.09, "sawtooth", 0.055);
    screenShake = Math.max(screenShake, 4);
  }

  if (weaponName === "BURST") {
    const shots = evo ? 5 : 3;

    for (let i = 0; i < shots; i++) {
      const spread = (i - Math.floor(shots / 2)) * 0.07;
      createPlayerBullet(angle + spread, baseDmg * 0.9 * damageBoost * crit, data.color, 5, 1.1, false, weaponName);
    }

    playSound(data.sound, 0.055, "square", 0.04);
  }

  if (weaponName === "LASER") {
    createPlayerBullet(angle, baseDmg * (evo ? 0.72 : 0.52) * damageBoost * crit, data.color, 3.5, 1.65, true, weaponName);
    bullets[bullets.length - 1].pierce = evo ? 8 : 2;
    playSound(data.sound, 0.025, "sine", 0.025);
  }

  if (weaponName === "MINIGUN") {
    const spread = (Math.random() - 0.5) * (evo ? 0.28 : 0.18);
    createPlayerBullet(angle + spread, baseDmg * (evo ? 0.5 : 0.42) * damageBoost * crit, data.color, 4, 1.05, false, weaponName);

    if (evo) bullets[bullets.length - 1].burn = true;

    playSound(data.sound + Math.random() * 80, 0.025, "square", 0.022);
  }

  if (weaponName === "RPG") {
    createPlayerBullet(angle, baseDmg * (evo ? 6.6 : 5.5) * damageBoost * crit, data.color, 9, 1.8, false, weaponName);
    bullets[bullets.length - 1].explosive = true;
    bullets[bullets.length - 1].explosionRadius = evo ? 135 : 95;
    playSound(data.sound, 0.12, "sawtooth", 0.07);
    screenShake = Math.max(screenShake, 6);
  }

  if (weaponName === "RAILGUN") {
    createPlayerBullet(angle, baseDmg * (evo ? 4.1 : 3.2) * damageBoost * crit, data.color, 6, evo ? 0.95 : 0.75, true, weaponName);
    bullets[bullets.length - 1].vx *= 1.35;
    bullets[bullets.length - 1].vy *= 1.35;
    bullets[bullets.length - 1].pierce = evo ? 8 : 5;
    playSound(data.sound, 0.1, "triangle", 0.06);
    screenShake = Math.max(screenShake, 5);
  }

  if (weaponName === "FLAMER") {
    const spread = (Math.random() - 0.5) * (evo ? 0.75 : 0.55);
    createPlayerBullet(angle + spread, baseDmg * (evo ? 0.35 : 0.28) * damageBoost * crit, data.color, 6, evo ? 0.55 : 0.38, false, weaponName);
    bullets[bullets.length - 1].burn = true;
    playSound(data.sound + Math.random() * 40, 0.02, "sawtooth", 0.018);
  }

  if (weaponName === "SPARK") {
    createPlayerBullet(angle, baseDmg * (evo ? 0.95 : 0.75) * damageBoost * crit, data.color, 4, 1.0, false, weaponName);
    bullets[bullets.length - 1].chain = true;
    bullets[bullets.length - 1].chainCount = evo ? 5 : 2;
    playSound(data.sound, 0.035, "square", 0.028);
  }

  if (weaponName === "ORBIT") {
    const a1 = angle + Math.sin(now * 6) * 0.5;
    createPlayerBullet(a1, baseDmg * 0.68 * damageBoost * crit, data.color, 5, 1.2, true, weaponName);
    bullets[bullets.length - 1].chain = evo;
    bullets[bullets.length - 1].chainCount = evo ? 3 : 0;
    playSound(data.sound, 0.04, "triangle", 0.028);
  }

  if (weaponName === "NOVABURST") {
    const shots = evo ? 7 : 5;

    for (let i = 0; i < shots; i++) {
      const spread = (i - Math.floor(shots / 2)) * 0.09;
      createPlayerBullet(angle + spread, baseDmg * 1.35 * damageBoost * crit, data.color, 6, 1.2, true, weaponName);
      bullets[bullets.length - 1].pierce = evo ? 4 : 2;
    }

    playSound(data.sound, 0.08, "triangle", 0.05);
  }
}

function createPlayerBullet(angle, damage, color, size, life, pierce, weaponName) {
  bullets.push({
    x: player.x + Math.cos(angle) * 28,
    y: player.y + Math.sin(angle) * 28,
    vx: Math.cos(angle) * player.bulletSpeed,
    vy: Math.sin(angle) * player.bulletSpeed,
    r: size,
    damage,
    color,
    life,
    enemyBullet: false,
    weaponName: weaponName || "",
    pierce: pierce ? 2 : 0,
    explosive: false,
    explosionRadius: 0,
    burn: false,
    chain: false,
    chainCount: 2,
    trail: []
  });
}

function createEnemyBullet(x, y, angle, speed, size, damage, color) {
  bullets.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: size,
    damage,
    color: color || "#ff4f9f",
    life: 4,
    enemyBullet: true,
    pierce: 0,
    trail: []
  });
}

// ==========================
// ABILITIES
// ==========================
function useCharacterAbility() {
  const now = performance.now() / 1000;

  if (player.lastAbility === undefined || Number.isNaN(player.lastAbility)) {
    player.lastAbility = -999;
  }

  if (player.abilityCooldown === undefined || Number.isNaN(player.abilityCooldown)) {
    player.abilityCooldown = 20;
  }

  let charId = String(save.selectedCharacter || "CORE").toUpperCase();

  if (!characterData[charId]) {
    charId = "CORE";
    save.selectedCharacter = "CORE";
    saveGame();
  }

  if (now - player.lastAbility < player.abilityCooldown) {
    floatingText(player.x, player.y - 45, "ABILITY NOT READY", "#ffffff", 16);
    return;
  }

  player.lastAbility = now;
  bossSfx("ability");

  if (charId === "CORE") {
    player.hp = Math.min(player.maxHp, player.hp + 25 + player.maxHp * 0.05);
    floatingText(player.x, player.y - 45, "CORE HEAL", "#7dfcff", 18);
  }

  if (charId === "BLAZE") {
    abilityBlast(165, player.damage * 5.5, "#ff6b3d", true);
    floatingText(player.x, player.y - 45, "FIRE NOVA", "#ff6b3d", 18);
  }

  if (charId === "VOLT") {
    player.slowTimeTimer = 4.5;
    floatingText(player.x, player.y - 45, "TIME SLOW", "#7dfcff", 18);
  }

  if (charId === "TANK") {
    player.shieldTimer = 5.5;
    floatingText(player.x, player.y - 45, "SHIELD ON", "#6cff7a", 18);
  }

  if (charId === "GHOST") {
    player.ghostTimer = 3.2;
    player.invincible = 3.2;
    floatingText(player.x, player.y - 45, "GHOST MODE", "#b28cff", 18);
  }

  if (charId === "NOVA") {
    player.overchargeTimer = 5;
    floatingText(player.x, player.y - 45, "OVERCHARGE", "#ffffff", 18);
  }

  if (charId === "VOID") {
    abilityBlast(220, player.damage * 4.2, "#b28cff", false);
    pushEnemiesAway(260, 145);
    floatingText(player.x, player.y - 45, "VOID PUSH", "#b28cff", 18);
  }

  if (charId === "OVERLORD") {
    player.rageTimer = 6;
    player.shieldTimer = 6;
    abilityBlast(190, player.damage * 4.5, "#ff2f88", true);
    floatingText(player.x, player.y - 45, "BOSS RAGE", "#ff2f88", 18);
  }

  if (charId === "PHANTOM") {
    player.ghostTimer = 2.2;
    player.invincible = 2.2;
    dashTeleportTowardAim(240);
    abilityBlast(130, player.damage * 3.5, "#dac7ff", false);
    floatingText(player.x, player.y - 45, "PHASE BLINK", "#dac7ff", 18);
  }

  if (charId === "TITAN") {
    player.shieldTimer = 7;
    abilityBlast(230, player.damage * 5, "#8cff9f", true);
    pushEnemiesAway(260, 220);
    floatingText(player.x, player.y - 45, "FORTRESS PULSE", "#8cff9f", 18);
  }

  if (charId === "ECLIPSE") {
    player.overchargeTimer = 4;
    abilityBlast(280, player.damage * 6, "#ffde59", true);
    floatingText(player.x, player.y - 45, "SOLAR COLLAPSE", "#ffde59", 18);
  }

  if (charId === "APEX") {
    player.shieldTimer = 5;
    player.overchargeTimer = 5;
    player.rageTimer = 5;
    abilityBlast(360, player.damage * 9, "#ffffff", true);
    pushEnemiesAway(390, 260);
    floatingText(player.x, player.y - 45, "APEX ANNIHILATION", "#ffffff", 20);
  }

  screenShake = Math.max(screenShake, 12);
}

function abilityBlast(radius, damage, color, bossDamage) {
  burst(player.x, player.y, color, 65, 420);

  for (const e of enemies) {
    if (distance(player, e) < radius + e.r) {
      e.hp -= e.boss && !bossDamage ? damage * 0.45 : damage;
      e.hit = 0.2;
    }
  }
}

function pushEnemiesAway(radius, force) {
  for (const e of enemies) {
    const d = distance(player, e);

    if (d < radius + e.r && d > 0) {
      const dx = (e.x - player.x) / d;
      const dy = (e.y - player.y) / d;

      e.x += dx * force;
      e.y += dy * force;
    }
  }
}

function dashTeleportTowardAim(dist) {
  const aim = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  player.x += Math.cos(aim) * dist;
  player.y += Math.sin(aim) * dist;
  lockPlayerInBounds();
}
// ==========================
// UPDATE
// ==========================
function update(dt, now) {
  updateStars(dt);

  player.slowTimeTimer -= dt;
  player.shieldTimer -= dt;
  player.ghostTimer -= dt;
  player.overchargeTimer -= dt;
  player.rageTimer -= dt;

  let mx = 0;
  let my = 0;

  if (keys["w"] || keys["arrowup"]) my--;
  if (keys["s"] || keys["arrowdown"]) my++;
  if (keys["a"] || keys["arrowleft"]) mx--;
  if (keys["d"] || keys["arrowright"]) mx++;

  const len = Math.hypot(mx, my) || 1;
  let speed = player.speed;

  if (player.orbRunner && orbs.length > 0) speed *= 1.25;

  if ((keys["shift"] || keys["x"]) && now - player.lastDash > player.dashCooldown) {
    player.lastDash = now;
    player.invincible = 0.3;
    player.dashTimer = player.dashDuration;

    player.dashDirX = mx / len;
    player.dashDirY = my / len;

    if (mx === 0 && my === 0) {
      const aim = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      player.dashDirX = Math.cos(aim);
      player.dashDirY = Math.sin(aim);
    }

    burst(player.x, player.y, "#6aa8ff", 30, 360);
    playSound(160, 0.08, "triangle", 0.06);
    screenShake = Math.max(screenShake, 5);
  }

  if (player.dashTimer > 0) {
    const dashStep = player.dashDistance * (dt / player.dashDuration);

    player.x += player.dashDirX * dashStep;
    player.y += player.dashDirY * dashStep;
    player.dashTimer -= dt;
  } else {
    player.x += (mx / len) * speed * dt;
    player.y += (my / len) * speed * dt;
  }

  lockPlayerInBounds();

  player.invincible -= dt;

  if (mouse.down || keys[" "]) shoot(now);

  lockPlayerInBounds();

  updateBullets(dt);
  updateEnemies(dt);
  updateHazards(dt);
  updateOrbs(dt);
  handleCollisions();
  cleanObjects(dt);
  lockPlayerInBounds();

  if (godMode) player.hp = player.maxHp;

  if (player.hp <= 0) {
    state = "dead";
    playSound(60, 0.4, "sawtooth", 0.08);
    screenShake = 12;

    if (wave > save.bestWave) {
      save.bestWave = wave;
      saveGame();
    }
  }

  if (enemies.length === 0 && state === "playing") handleWaveClear();

  screenShake *= 0.88;
}

function handleWaveClear() {
  if (wave === 25 && wave25Stage === 0) {
    wave25Stage = 1;
    startRavagerAwakening();
    return;
  }

  if (wave === 25 && wave25Stage === 1) {
    wave25Stage = 2;
    save.milestones.wave25 = true;
    save.coins += 15;

    unlockCharacter("VOID", "voidUnlocked");
    saveGame();

    unlockAchievement("wave25");

    alert("WAVE 25 CLEARED!\n\n+15 coins!\nSecret character unlocked: VOID!");
    resetControls();

    bossClearReward(false);
    return;
  }

  if (wave === 50 && finalStarted) {
    startFinalEndingCutscene();
    return;
  }

  if (wave % 4 === 0 || wave > 50) {
    bossClearReward(true);
  } else {
    chooseWaveBuff();
    wave++;
    spawnWave();
  }
}

function updateStars(dt) {
  for (const s of stars) {
    s.y += s.speed * dt;

    if (s.y > canvas.height) {
      s.y = -10;
      s.x = Math.random() * canvas.width;
    }
  }
}

function updateBullets(dt) {
  for (const b of bullets) {
    b.trail.push({ x: b.x, y: b.y });

    if (b.trail.length > 5) b.trail.shift();

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
  }
}

function updateEnemies(dt) {
  let enemyTimeMult = player.slowTimeTimer > 0 ? 0.45 : 1;

  for (const e of enemies) {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);

    e.spin += dt * 3 * enemyTimeMult;
    e.timer += dt * enemyTimeMult;

    if (e.boss) {
      updateBoss(e, dt, angle, enemyTimeMult);
    } else if (e.type === "shooter") {
      const d = distance(e, player);

      if (d < 260) {
        e.x -= Math.cos(angle) * e.speed * 0.55 * dt * enemyTimeMult;
        e.y -= Math.sin(angle) * e.speed * 0.55 * dt * enemyTimeMult;
      } else if (d > 420) {
        e.x += Math.cos(angle) * e.speed * 0.65 * dt * enemyTimeMult;
        e.y += Math.sin(angle) * e.speed * 0.65 * dt * enemyTimeMult;
      }

      e.shootTimer -= dt * enemyTimeMult;

      if (e.shootTimer <= 0) {
        e.shootTimer = e.shootCooldown || 2.4;
        createEnemyBullet(
          e.x,
          e.y,
          angle,
          e.bulletSpeed || 220,
          6,
          e.damage,
          e.corrupted ? "#c026ff" : e.voided ? "#6b3cff" : "#7dfcff"
        );
      }
    } else {
      e.x += Math.cos(angle) * e.speed * dt * enemyTimeMult;
      e.y += Math.sin(angle) * e.speed * dt * enemyTimeMult;
    }

    e.hit -= dt;

    if (distance(e, player) < e.r + player.r && player.invincible <= 0 && player.ghostTimer <= 0) {
      let realDamage = Math.max(2, e.damage - player.armor);

      if (player.shieldTimer > 0 || player.rageTimer > 0) realDamage *= 0.35;

      if (!godMode) player.hp -= realDamage * dt;
    }
  }
}

// ==========================
// BOSS AI
// ==========================
function updateBoss(e, dt, angle, mult) {
  e.phase = e.hp < e.maxHp * 0.5 ? 2 : 1;

  if (e.corrupted) mult *= 1.25 + getCorruptionLevel() * 0.05;
  if (e.voided) mult *= 1.1;

  if (e.bossType === "FINAL") return updateFinalBoss(e, dt, angle, mult);
  if (e.bossType === "RAVAGER_1") return updateRavagerDormant(e, dt, angle, mult);
  if (e.bossType === "RAVAGER_2") return updateRavagerAwakened(e, dt, angle, mult);
  if (isRavagerEcho(e.bossType)) return updateRavagerEcho(e, dt, angle, mult);

  let bossSpeed = e.speed * 1.04;
  if (e.phase === 2) bossSpeed *= 1.12;

  if (e.bossType === "CHARGER") {
    if (wave >= 20) {
      e.chargeTimer -= dt * mult;

      if (e.chargeTimer <= 0) {
        e.chargeTimer = player.dashCooldown * 2;
        e.x += Math.cos(angle) * 55;
        e.y += Math.sin(angle) * 55;
        burst(e.x, e.y, e.color, 14, 220);
      }
    }

    e.x += Math.cos(angle) * bossSpeed * (wave < 20 ? 1.05 : 1.25) * dt * mult;
    e.y += Math.sin(angle) * bossSpeed * (wave < 20 ? 1.05 : 1.25) * dt * mult;
  } else if (e.bossType === "DASHLINE") {
    updateDashlineBoss(e, dt, angle, mult);
  } else if (e.bossType === "SNIPER") {
    e.x += Math.cos(angle) * bossSpeed * 0.35 * dt * mult;
    e.y += Math.sin(angle) * bossSpeed * 0.35 * dt * mult;
  } else {
    e.x += Math.cos(angle) * bossSpeed * dt * mult;
    e.y += Math.sin(angle) * bossSpeed * dt * mult;
  }

  e.shootTimer -= dt * mult;
  e.specialTimer -= dt * mult;
  e.summonTimer -= dt * mult;

  if (e.bossType === "BULLET_HELL" || e.bossType === "SPIRAL" || e.bossType === "HYBRID") {
    if (e.shootTimer <= 0) {
      e.shootTimer = e.phase === 2 ? 0.95 : 1.25;
      const shots = e.phase === 2 ? 10 : 7;
      const speed = e.phase === 2 ? 270 : 230;

      for (let i = 0; i < shots; i++) {
        const a = e.spin + (i * Math.PI * 2) / shots;
        createEnemyBullet(e.x, e.y, a, speed, 8, 18, e.color);
      }

      playSound(120, 0.12, "sawtooth", 0.05);
    }
  } else if (e.bossType === "SNIPER") {
    if (e.shootTimer <= 0) {
      e.shootTimer = e.phase === 2 ? 0.9 : 1.4;
      createLineHazard(e.x, e.y, angle, "#ffffff", 0.75, 0.18, 28, 20);
      bossSfx("beam");
    }
  } else {
    if (e.shootTimer <= 0) {
      e.shootTimer = e.phase === 2 ? 1.15 : 1.35;
      const shots = e.phase === 2 ? 8 : 6;
      const speed = e.phase === 2 ? 255 : 220;

      for (let i = 0; i < shots; i++) {
        const a = e.spin + (i * Math.PI * 2) / shots;
        createEnemyBullet(e.x, e.y, a, speed, 8, 18, e.color);
      }

      playSound(120, 0.12, "sawtooth", 0.05);
    }
  }

  if (e.bossType === "SUMMONER" && e.summonTimer <= 0) {
    e.summonTimer = 3.2;
    spawnEnemy("fast");
    spawnEnemy("normal");
    floatingText(e.x, e.y - 70, "SUMMON", "#6cff7a", 16);
  }

  if (e.bossType === "MIRROR" && e.summonTimer <= 0) {
    e.summonTimer = 4.2;
    spawnEnemy("mirror");
    floatingText(e.x, e.y - 70, "MIRROR", "#b28cff", 16);
  }

  if (e.bossType === "PULSER" && e.specialTimer <= 0) {
    e.specialTimer = 3.5;
    createRingHazard(e.x, e.y, 40, 330, 16, "#ff9f43");
    screenShake = Math.max(screenShake, 7);
  }

  if (e.bossType === "TANK_BOSS" && e.specialTimer <= 0) {
    e.specialTimer = 4.0;
    createRingHazard(e.x, e.y, 50, 280, 20, "#ff7bba");
    spawnEnemy("tank");
  }

  if (e.bossType === "SPLITTER" && e.hp < e.maxHp * 0.5 && !e.splitDone) {
    e.splitDone = true;
    spawnBoss("PAST_BOSS", false, true);
    spawnBoss("PAST_BOSS", false, true);
    floatingText(e.x, e.y - 80, "SPLIT", "#a77dff", 22);
  }
}

function isRavagerEcho(type) {
  return (
    type === "RAVAGER_ECHO" ||
    type === "RAVAGER_BURNING" ||
    type === "RAVAGER_VOID" ||
    type === "RAVAGER_IRON" ||
    type === "RAVAGER_CROWNED"
  );
}

function updateDashlineBoss(e, dt, angle, mult) {
  if (e.dashPause <= 0) {
    e.dashPause = 1.0;
    e.dashVx = Math.cos(angle) * e.speed * 3.8;
    e.dashVy = Math.sin(angle) * e.speed * 3.8;
    floatingText(e.x, e.y - 70, "DASH", "#ff9f43", 16);
  }

  e.dashPause -= dt * mult;

  if (e.dashPause > 0.45) {
    e.x += e.dashVx * dt * mult;
    e.y += e.dashVy * dt * mult;
  }

  e.x = Math.max(e.r, Math.min(canvas.width - e.r, e.x));
  e.y = Math.max(e.r, Math.min(canvas.height - e.r, e.y));
}

function updateRavagerDormant(e, dt, angle, mult) {
  e.spin += dt * 0.5;
  e.specialTimer -= dt * mult;
  e.shootTimer -= dt * mult;
  e.summonTimer -= dt * mult;

  e.x += (canvas.width / 2 - e.x) * 0.08;
  e.y += (canvas.height / 2 - e.y) * 0.08;

  if (e.shootTimer <= 0) {
    e.shootTimer = 1.45;

    for (let i = 0; i < 6; i++) {
      const a = e.spin + (i * Math.PI * 2) / 6;
      createEnemyBullet(e.x, e.y, a, 220, 8, 15, "#5b6478");
    }
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = 3.1;
    createQuadrantBeam(randomQuadrant(), "#ff9f43", 0.85, 18);
    floatingText(canvas.width / 2, 120, "FALLING BEAM", "#ff9f43", 24);
    bossSfx("beam");
    screenShake = Math.max(screenShake, 6);
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = 3.4;
    spawnEnemy("fast");
    spawnEnemy("normal");
    spawnEnemy("shooter");
  }
}

function updateRavagerAwakened(e, dt, angle, mult) {
  e.spin += dt * 2.2;
  e.shootTimer -= dt * mult;
  e.specialTimer -= dt * mult;
  e.summonTimer -= dt * mult;

  let speed = e.speed * (e.phase === 2 ? 1.18 : 1.0);
  e.x += Math.cos(angle) * speed * dt * mult;
  e.y += Math.sin(angle) * speed * dt * mult;

  if (e.shootTimer <= 0) {
    e.shootTimer = e.phase === 2 ? 0.78 : 1.0;
    const shots = e.phase === 2 ? 12 : 9;

    for (let i = 0; i < shots; i++) {
      const a = e.spin + (i * Math.PI * 2) / shots;
      createEnemyBullet(e.x, e.y, a, e.phase === 2 ? 285 : 245, 8, 18, "#ff2f88");
    }
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = e.phase === 2 ? 2.35 : 2.8;
    createQuadrantBeam(randomQuadrant(), "#ff2f88", e.phase === 2 ? 0.62 : 0.75, 26);
    bossSfx("beam");
    screenShake = Math.max(screenShake, 8);
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = e.phase === 2 ? 2.6 : 3.1;
    spawnEnemy("fast");
    spawnEnemy("fast");
    spawnEnemy("normal");
    spawnEnemy("shooter");
  }
}

function updateRavagerEcho(e, dt, angle, mult) {
  e.spin += dt * 2;
  e.shootTimer -= dt * mult;
  e.specialTimer -= dt * mult;
  e.summonTimer -= dt * mult;

  let speed = e.speed * (e.phase === 2 ? 1.15 : 1.0);
  e.x += Math.cos(angle) * speed * dt * mult;
  e.y += Math.sin(angle) * speed * dt * mult;

  if (e.shootTimer <= 0) {
    e.shootTimer = e.phase === 2 ? 0.7 : 0.95;
    const shots = e.phase === 2 ? 12 : 8;

    for (let i = 0; i < shots; i++) {
      const a = e.spin + (i * Math.PI * 2) / shots;
      createEnemyBullet(e.x, e.y, a, 260, 8, 20, e.color);
    }
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = e.phase === 2 ? 2.0 : 2.6;
    const q1 = randomQuadrant();
    createQuadrantBeam(q1, e.color, 0.58, 28);
    bossSfx("beam");

    if (e.bossType === "RAVAGER_CROWNED" || e.phase === 2) {
      let q2 = randomQuadrant();
      while (q2 === q1) q2 = randomQuadrant();
      createQuadrantBeam(q2, e.color, 0.7, 24);
    }
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = 3.0;
    spawnEnemy(e.bossType === "RAVAGER_IRON" ? "tank" : "fast");
    spawnEnemy("normal");
    spawnEnemy("shooter");
  }
}

function updateFinalBoss(e, dt, angle, mult) {
  if (e.corrupted) mult *= 1.35 + getCorruptionLevel() * 0.08;
  if (e.voided) mult *= 1.15;

  e.x = canvas.width / 2 + Math.sin(performance.now() / 650) * 145;
  e.y = canvas.height * 0.2 + Math.cos(performance.now() / 800) * 45;

  e.phase = e.hp < e.maxHp * 0.66 ? 2 : 1;
  if (e.hp < e.maxHp * 0.33) e.phase = 3;

  e.shootTimer -= dt * mult;
  e.specialTimer -= dt * mult;
  e.summonTimer -= dt * mult;
  e.orbTimer -= dt * mult;
  e.laneTimer -= dt * mult;
  e.eyeTimer -= dt * mult;
  e.swordTimer -= dt * mult;
  e.slashTimer -= dt * mult;

  if (finalDownTimer > 0) {
    finalDownTimer -= dt;
    e.y = canvas.height * 0.45;
    e.downed = true;
    return;
  }

  e.downed = false;

  if (e.shootTimer <= 0) {
    e.shootTimer = e.phase === 3 ? 0.48 : e.phase === 2 ? 0.68 : 0.9;
    const shots = e.phase === 3 ? 20 : e.phase === 2 ? 16 : 12;

    for (let i = 0; i < shots; i++) {
      const a = e.spin + (i * Math.PI * 2) / shots;
      createEnemyBullet(e.x, e.y, a, e.phase === 3 ? 330 : 285, 8, 24, i % 2 === 0 ? "#ff2f88" : "#ffde59");
    }

    e.spin += 0.45;
  }

  if (e.laneTimer <= 0) {
    e.laneTimer = e.phase === 3 ? 1.15 : e.phase === 2 ? 1.45 : 1.75;
    createLaneStrike(e.phase === 3 ? 0.53 : e.phase === 2 ? 0.65 : 0.78, 50);
    bossSfx("final");
  }

  if (e.eyeTimer <= 0) {
    e.eyeTimer = e.phase === 3 ? 0.82 : e.phase === 2 ? 0.95 : 1.12;
    createLineHazard(e.x, e.y, angle, "#ffffff", e.phase === 3 ? 0.42 : 0.52, 0.16, 40, 34);
    bossSfx("beam");
  }

  if (e.swordTimer <= 0) {
    e.swordTimer = e.phase === 3 ? 2.9 : 4.2;
    createSwordRain(e.phase === 3 ? 11 : 7, e.phase === 3 ? 0.45 : 0.65, 34);
    bossSfx("final");
  }

  if (e.slashTimer <= 0) {
    e.slashTimer = e.phase === 3 ? 5.2 : 7.0;
    createDiagonalSlash(Math.random() < 0.5 ? "slashA" : "slashB", "#ff2f88", 0.72, 38);
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = e.phase === 3 ? 3.4 : 4.6;
    createRingHazard(e.x, e.y, 60, 540, 30, "#ffde59");
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = e.phase === 3 ? 4.2 : 5.8;

    if (countBosses() < 4) spawnBoss("PAST_BOSS", true, true);
    spawnEnemy("shooter");
    spawnEnemy("tank");

    if (e.phase >= 2 && countBosses() < 4) spawnBoss("PAST_BOSS", true, true);

    if (e.phase >= 3) {
      spawnEnemy("fast");
      spawnEnemy("shooter");
    }

    floatingText(e.x, e.y + 105, "PAST BOSSES RETURN", "#b28cff", 18);
  }

  if (e.orbTimer <= 0) {
    e.orbTimer = e.phase === 3 ? 7.2 : 8.5;
    spawnFinalOrb();
  }
}

// ==========================
// HAZARDS / ORBS
// ==========================
function randomQuadrant() {
  const qs = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  return qs[Math.floor(Math.random() * qs.length)];
}

function createQuadrantBeam(quadrant, color, warning, damage) {
  hazards.push({
    type: "quadrantBeam",
    quadrant,
    timer: 0,
    warning,
    duration: 0.45,
    damage,
    color
  });
}

function createLaneStrike(warning, damage) {
  let lanes = [0, 1, 2, 3, 4, 5, 6, 7];

  for (let i = lanes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = lanes[i];
    lanes[i] = lanes[j];
    lanes[j] = temp;
  }

  hazards.push({
    type: "laneStrike",
    lanes: lanes.slice(0, 3),
    timer: 0,
    warning,
    duration: 0.32,
    damage,
    color: "#ff1f4f"
  });
}

function createRingHazard(x, y, startR, maxR, damage, color) {
  hazards.push({
    type: "ring",
    x,
    y,
    r: startR,
    maxR,
    timer: 0,
    warning: 0.2,
    duration: 1.6,
    damage,
    color
  });
}

function createLineHazard(x, y, angle, color, warning, duration, damage, width) {
  hazards.push({
    type: "line",
    x,
    y,
    angle,
    timer: 0,
    warning,
    duration,
    damage,
    color,
    width
  });
}

function createSwordRain(count, warning, damage) {
  for (let i = 0; i < count; i++) {
    const x = 70 + Math.random() * (canvas.width - 140);

    hazards.push({
      type: "sword",
      x,
      y: -80,
      timer: 0,
      warning,
      duration: 0.5,
      damage,
      color: i % 2 ? "#ffffff" : "#ff2f88",
      width: 22 + Math.random() * 16
    });
  }
}

function createDiagonalSlash(kind, color, warning, damage) {
  hazards.push({
    type: "diagonal",
    kind,
    timer: 0,
    warning,
    duration: 0.25,
    damage,
    color,
    width: 38
  });
}

function pointInQuadrant(x, y, q) {
  if (q === "topLeft") return x < canvas.width / 2 && y < canvas.height / 2;
  if (q === "topRight") return x >= canvas.width / 2 && y < canvas.height / 2;
  if (q === "bottomLeft") return x < canvas.width / 2 && y >= canvas.height / 2;
  if (q === "bottomRight") return x >= canvas.width / 2 && y >= canvas.height / 2;
  return false;
}

function getQuadrantRect(q) {
  const w = canvas.width / 2;
  const h = canvas.height / 2;

  if (q === "topLeft") return { x: 0, y: 0, w, h };
  if (q === "topRight") return { x: w, y: 0, w, h };
  if (q === "bottomLeft") return { x: 0, y: h, w, h };

  return { x: w, y: h, w, h };
}

function updateHazards(dt) {
  for (const h of hazards) {
    h.timer += dt;

    if (h.type === "ring") {
      h.r += (h.maxR / h.duration) * dt;
      const d = Math.abs(distance(player, h) - h.r);

      if (d < 12 && h.timer > h.warning && canHitPlayer()) {
        hurtPlayer(h.damage, "ring");
      }
    }

    if (h.type === "quadrantBeam") {
      const active = h.timer > h.warning && h.timer < h.warning + h.duration;

      if (active && pointInQuadrant(player.x, player.y, h.quadrant) && canHitPlayer()) {
        hurtPlayer(h.damage, "beam");
      }
    }

    if (h.type === "laneStrike") {
      const active = h.timer > h.warning && h.timer < h.warning + h.duration;
      const laneHeight = canvas.height / 8;
      const playerLane = Math.floor(player.y / laneHeight);

      if (active && h.lanes.includes(playerLane) && canHitPlayer()) {
        hurtPlayer(h.damage, "lane");
      }
    }

    if (h.type === "line") {
      const active = h.timer > h.warning && h.timer < h.warning + h.duration;

      if (active) {
        const px = player.x - h.x;
        const py = player.y - h.y;
        const perpendicular = Math.abs(Math.sin(h.angle) * px - Math.cos(h.angle) * py);

        if (perpendicular < h.width && canHitPlayer()) {
          hurtPlayer(h.damage, "line");
        }
      }
    }

    if (h.type === "sword") {
      const active = h.timer > h.warning && h.timer < h.warning + h.duration;

      if (active) {
        const sx = h.x;
        const sy = ((h.timer - h.warning) / h.duration) * (canvas.height + 160) - 80;

        if (Math.abs(player.x - sx) < h.width && Math.abs(player.y - sy) < 80 && canHitPlayer()) {
          hurtPlayer(h.damage, "sword");
        }
      }
    }

    if (h.type === "diagonal") {
      const active = h.timer > h.warning && h.timer < h.warning + h.duration;

      if (active) {
        const diagonalValue = h.kind === "slashA" ? player.y - player.x : player.y - (canvas.height - player.x);

        if (Math.abs(diagonalValue) < 50 && canHitPlayer()) {
          hurtPlayer(h.damage, "slash");
        }
      }
    }
  }

  hazards = hazards.filter(h => {
    if (h.type === "ring") return h.timer < h.duration;
    return h.timer < h.warning + h.duration;
  });
}

function canHitPlayer() {
  return player.invincible <= 0 && player.ghostTimer <= 0 && !godMode;
}

function spawnFinalOrb() {
  orbs.push({
    x: 100 + Math.random() * (canvas.width - 200),
    y: 150 + Math.random() * (canvas.height - 300),
    r: 20,
    timer: 9,
    color: "#7dfcff"
  });

  floatingText(canvas.width / 2, 145, "POWER ORB DROPPED - RUN TO IT", "#7dfcff", 24);
  playSound(900, 0.18, "triangle", 0.07);
}

function updateOrbs(dt) {
  for (const o of orbs) {
    o.timer -= dt;

    if (distance(o, player) < o.r + player.r) {
      o.timer = -1;
      hitFinalBossWithOrb();
    }
  }

  orbs = orbs.filter(o => o.timer > 0);
}

function hitFinalBossWithOrb() {
  const boss = enemies.find(e => e.bossType === "FINAL");

  if (!boss) return;

  boss.hit = 0.4;
  finalDownTimer = 4.2;
  burst(boss.x, boss.y, "#7dfcff", 100, 520);
  floatingText(canvas.width / 2, canvas.height / 2, "BOSS DOWNED - ATTACK NOW", "#7dfcff", 32);
  screenShake = 20;
  playSound(80, 0.45, "sawtooth", 0.09);
}

function hurtPlayer(amount, source) {
  let realDamage = Math.max(2, amount - player.armor);

  if (source === "beam" && player.beamResist) realDamage *= 0.9;
  if (player.shieldTimer > 0 || player.rageTimer > 0) realDamage *= 0.35;

  if (!godMode) player.hp -= realDamage;

  burst(player.x, player.y, "#ff4f9f", 14, 180);
  playSound(80, 0.08, "sawtooth", 0.07);
  player.invincible = 0.25;
}

// ==========================
// COLLISIONS / REWARDS
// ==========================
function handleCollisions() {
  for (const b of bullets) {
    if (b.enemyBullet) {
      if (distance(b, player) < b.r + player.r && canHitPlayer()) {
        hurtPlayer(b.damage, "bullet");
        b.life = -1;
        player.invincible = 0.18;
        screenShake = Math.max(screenShake, 7);
      }

      continue;
    }

    for (const e of enemies) {
      if (e.bossType === "FINAL" && !e.downed) {
        if (distance(b, e) < b.r + e.r) {
          b.life = -1;
          burst(b.x, b.y, "#ff2f88", 3, 80);
          floatingText(b.x, b.y, "SHIELDED", "#ff2f88", 12);
          break;
        }
      } else if (distance(b, e) < b.r + e.r) {
        let damage = b.damage;

        if (e.boss) {
          if (b.weaponName === "RAILGUN") damage *= 1 / 4;
          if (b.weaponName === "LASER") damage *= 1 / 5;
          if (b.weaponName === "SPARK") damage *= 1 / 5;
        }

        if (player.shieldBreaker && e.boss) damage *= 1.2;

        e.hp -= damage;
        e.hit = 0.08;

        if (b.explosive) {
          burst(b.x, b.y, "#ff9f43", 35, 320);
          screenShake = Math.max(screenShake, 10);

          for (const other of enemies) {
            if (other !== e && distance(b, other) < b.explosionRadius + other.r) {
              other.hp -= damage * 0.65;
              other.hit = 0.1;
            }
          }
        }

        if (b.burn) e.hp -= player.damage * 0.12;

        if (b.chain) {
          let chained = 0;
          const maxChain = b.chainCount || 2;

          for (const other of enemies) {
            if (other !== e && chained < maxChain && distance(e, other) < 140 + other.r) {
              let chainDamage = damage * 0.55;
              if (other.boss) chainDamage *= 0.2;
              other.hp -= chainDamage;
              other.hit = 0.1;
              burst(other.x, other.y, "#7dfcff", 8, 150);
              chained++;
            }
          }
        }

        burst(b.x, b.y, e.boss ? "#ff4f9f" : e.color, 5, 125);
        playSound(e.boss ? 180 : 420, 0.03, "square", 0.018);

        if (b.pierce > 0) b.pierce--;
        else b.life = -1;

        break;
      }
    }
  }

  enemies = enemies.filter(e => {
    if (e.hp <= 0) {
      burst(e.x, e.y, e.boss ? "#ff2f88" : e.color, e.boss ? 80 : 24, e.boss ? 460 : 240);
      playSound(e.boss ? 55 : 110, e.boss ? 0.35 : 0.11, "sawtooth", e.boss ? 0.09 : 0.035);
      screenShake = Math.max(screenShake, e.boss ? 14 : 4);

      if (!e.boss) {
        unlockAchievement("firstBlood");

        if (player.vampireCore) {
          player.killsSinceHeal++;

          if (player.killsSinceHeal >= 3) {
            player.killsSinceHeal = 0;
            player.hp = Math.min(player.maxHp, player.hp + 1);
          }
        }
      } else if (player.vampireCore) {
        player.hp = Math.min(player.maxHp, player.hp + 10);
      }

      return false;
    }

    return true;
  });
}

function cleanObjects(dt) {
  bullets = bullets.filter(b => {
    return b.life > 0 && b.x > -160 && b.x < canvas.width + 160 && b.y > -160 && b.y < canvas.height + 160;
  });

  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt;
  }

  particles = particles.filter(p => p.life > 0);

  for (const f of floatingTexts) {
    f.y -= 42 * dt;
    f.life -= dt;
  }

  floatingTexts = floatingTexts.filter(f => f.life > 0);
}

function chooseWaveBuff() {
  const buffs = [
    { name: "+Damage", color: "#ff5eec", apply: () => { player.damage += 0.14; } },
    { name: "+Speed", color: "#9f7dff", apply: () => { player.speed += 12; } },
    { name: "+Max HP", color: "#6cff7a", apply: () => { player.maxHp += 8; player.hp = Math.min(player.maxHp, player.hp + 12); } },
    { name: "+Fire Rate", color: "#7dfcff", apply: () => { player.fireRateBonus += 0.006; } },
    { name: "+Bullet Speed", color: "#ffd36a", apply: () => { player.bulletSpeed += 22; } },
    { name: "+Armor", color: "#ffffff", apply: () => { player.armor += 0.35; } },
    { name: "Crit Core", color: "#ffde59", apply: () => { player.critChance = Math.min(0.10, player.critChance + 0.02); } },
    { name: "Vampire Core", color: "#ff4f9f", apply: () => { player.vampireCore = true; } },
    { name: "Shield Breaker", color: "#ff9f43", apply: () => { player.shieldBreaker = true; } },
    { name: "Orb Runner", color: "#7dfcff", apply: () => { player.orbRunner = true; } },
    { name: "Beam Guard", color: "#b28cff", apply: () => { player.beamResist = true; } }
  ];

  let choices = [];

  while (choices.length < 3) {
    const b = buffs[Math.floor(Math.random() * buffs.length)];
    if (!choices.includes(b)) choices.push(b);
  }

  let msg = "WAVE CLEAR!\n\nChoose 1 free run buff:\n\n";

  choices.forEach((b, i) => {
    msg += (i + 1) + ". " + b.name + "\n";
  });

  msg += "\nType 1, 2, or 3.";

  const pick = prompt(msg);
  resetControls();

  let index = Number(pick) - 1;

  if (index < 0 || index >= choices.length || Number.isNaN(index)) index = 0;

  const buff = choices[index];
  buff.apply();

  floatingText(canvas.width / 2, canvas.height / 2, "WAVE CLEAR: " + buff.name, buff.color, 24);
  playSound(600, 0.09, "triangle", 0.05);
}

function bossClearReward(showChoice) {
  player.hp = player.maxHp;
  save.coins += wave === 50 ? 50 : 10;
  saveGame();

  unlockAchievement("firstBoss");

  if (save.coins >= 50) unlockAchievement("rich");

  floatingText(canvas.width / 2, canvas.height / 2 + 60, "FULL HEAL + COINS", "#6cff7a", 22);

  if (showChoice) giveFreeBossUpgrade();

  wave++;
  state = "playing";
  spawnWave();
}

function giveFreeBossUpgrade() {
  state = "reward";

  const locked = Object.keys(weaponData).filter(w => player.weapons.indexOf(w) === -1);
  const choices = [];

  if (locked.length > 0) {
    while (choices.length < Math.min(2, locked.length)) {
      const w = locked[Math.floor(Math.random() * locked.length)];

      if (!choices.includes(w)) choices.push(w);
    }
  }

  choices.push("RUN DAMAGE", "RUN FIRE RATE", "RUN HEALTH", "RUN SPEED", "CRIT CORE", "VAMPIRE CORE", "SHIELD BREAKER", "ORB RUNNER");

  const shown = choices.slice(0, 3);

  let msg = "BOSS DEFEATED!\n\nPermanent coins earned!\nFull HP restored!\n\nChoose ONE FREE run upgrade:\n\n";

  shown.forEach((r, i) => {
    msg += (i + 1) + ". " + r + "\n";
  });

  msg += "\nType 1, 2, or 3.";

  let pick = prompt(msg);
  resetControls();

  let index = Number(pick) - 1;

  if (index < 0 || index >= shown.length || Number.isNaN(index)) index = 0;

  const reward = shown[index];

  if (weaponData[reward]) {
    player.weapons.push(reward);
    player.weaponIndex = player.weapons.length - 1;
    floatingText(canvas.width / 2, canvas.height / 2, "NEW RUN WEAPON: " + reward, weaponData[reward].color, 30);
  } else if (reward === "RUN DAMAGE") {
    player.damage += 0.65;
  } else if (reward === "RUN FIRE RATE") {
    player.fireRateBonus += 0.018;
  } else if (reward === "RUN HEALTH") {
    player.maxHp += 32;
    player.hp = player.maxHp;
  } else if (reward === "RUN SPEED") {
    player.speed += 42;
  } else if (reward === "CRIT CORE") {
    player.critChance = Math.min(0.10, player.critChance + 0.03);
  } else if (reward === "VAMPIRE CORE") {
    player.vampireCore = true;
  } else if (reward === "SHIELD BREAKER") {
    player.shieldBreaker = true;
  } else if (reward === "ORB RUNNER") {
    player.orbRunner = true;
  }

  floatingText(canvas.width / 2, canvas.height / 2, "FREE RUN UPGRADE: " + reward, "#ffde59", 28);
  playSound(740, 0.16, "triangle", 0.07);
}

// ==========================
// DRAWING
// ==========================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  if (screenShake > 0.2) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  }

  drawBackground();
  drawHazards();
  drawOrbs();
  drawParticles();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawCrosshair();
  drawUI();
  drawBossHealthBar();
  drawFloatingTexts();

  ctx.restore();

  if (state === "menu") drawMenu();
  if (state === "dead") drawGameOver();
  if (state === "paused") drawPauseMenu();
  if (state === "bossWarning") drawBossWarningOverlay();
  if (state === "cutscene") drawCutscene();
}

function drawBackground() {
  const bg = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    80,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width
  );

  bg.addColorStop(0, save.corruptedMode ? "#2b0035" : (wave >= 50 ? "#28051f" : "#121a38"));
  bg.addColorStop(0.55, "#080d22");
  bg.addColorStop(1, "#03050d");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of stars) {
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  ctx.strokeStyle = save.corruptedMode ? "rgba(255,60,255,0.08)" : "rgba(130,160,255,0.07)";
  ctx.lineWidth = 1;

  const size = 52;

  for (let x = 0; x < canvas.width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawHazards() {
  for (const h of hazards) {
    if (h.type === "quadrantBeam") {
      const rect = getQuadrantRect(h.quadrant);
      const active = h.timer > h.warning;

      ctx.globalAlpha = active ? 0.42 : 0.18;
      ctx.fillStyle = h.color;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

      ctx.globalAlpha = active ? 0.85 : 0.35;
      ctx.fillStyle = "#ffffff";

      const beamCount = 8;

      for (let i = 0; i < beamCount; i++) {
        const bx = rect.x + (i + 0.5) * (rect.w / beamCount);
        const fall = active ? rect.h : (h.timer / h.warning) * rect.h;
        ctx.fillRect(bx - 7, rect.y, 14, fall);
      }

      ctx.globalAlpha = 1;
    }

    if (h.type === "laneStrike") {
      const active = h.timer > h.warning;
      const laneHeight = canvas.height / 8;

      for (const lane of h.lanes) {
        ctx.globalAlpha = active ? 0.65 : 0.18;
        ctx.fillStyle = active ? "#ff002f" : "#ff1f4f";
        ctx.fillRect(0, lane * laneHeight, canvas.width, laneHeight);
      }

      ctx.globalAlpha = 1;
    }

    if (h.type === "ring") {
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (h.type === "line") {
      const active = h.timer > h.warning;

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);

      ctx.globalAlpha = active ? 0.82 : 0.25;
      ctx.fillStyle = h.color;
      ctx.fillRect(0, -h.width / 2, canvas.width * 2, h.width);

      ctx.globalAlpha = active ? 0.95 : 0.35;
      ctx.fillStyle = active ? "#ffffff" : "#ff4f9f";
      ctx.fillRect(0, -h.width / 8, canvas.width * 2, h.width / 4);

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    if (h.type === "sword") {
      const active = h.timer > h.warning;
      const sy = active ? ((h.timer - h.warning) / h.duration) * (canvas.height + 160) - 80 : -80;

      ctx.globalAlpha = active ? 0.95 : 0.35;
      ctx.fillStyle = h.color;
      ctx.fillRect(h.x - h.width / 2, active ? sy : 0, h.width, active ? 160 : canvas.height);
      ctx.globalAlpha = 1;
    }

    if (h.type === "diagonal") {
      ctx.save();
      ctx.globalAlpha = h.timer > h.warning ? 0.8 : 0.25;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = h.width;
      ctx.beginPath();

      if (h.kind === "slashA") {
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, canvas.height);
      } else {
        ctx.moveTo(canvas.width, 0);
        ctx.lineTo(0, canvas.height);
      }

      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }
}

function drawOrbs() {
  for (const o of orbs) {
    ctx.shadowBlur = 25;
    ctx.shadowColor = o.color;
    ctx.fillStyle = o.color;

    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r + Math.sin(performance.now() / 100) * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r + 9, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 1.7);
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function drawBullets() {
  for (const b of bullets) {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.r * 0.7;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();

    for (let i = 0; i < b.trail.length; i++) {
      const t = b.trail[i];

      if (i === 0) ctx.moveTo(t.x, t.y);
      else ctx.lineTo(t.x, t.y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 14;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function drawEnemies() {
  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);

    ctx.shadowBlur = e.corrupted ? 36 : e.boss ? 30 : 15;
    ctx.shadowColor = e.corrupted ? "#ff00ff" : e.color;
    ctx.fillStyle = e.hit > 0 ? "#ffffff" : e.color;

    if (e.boss) drawBossShape(e);
    else drawEnemyShape(e);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#101421";
    ctx.fillRect(-e.r, -e.r - 14, e.r * 2, 5);

    ctx.fillStyle = e.boss ? "#ff66aa" : "#67ff81";
    ctx.fillRect(-e.r, -e.r - 14, e.r * 2 * Math.max(0, e.hp / e.maxHp), 5);

    ctx.restore();
  }
}

function drawEnemyShape(e) {
  if (e.type === "shooter") {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = e.corrupted ? "#ffffff" : "#111827";
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = e.corrupted ? "#ff2f88" : e.voided ? "#6b3cff" : "#7dfcff";
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    return;
  }

  if (e.type === "fast") {
    ctx.rotate(e.spin);
    ctx.beginPath();
    ctx.moveTo(0, -e.r);
    ctx.lineTo(e.r, e.r);
    ctx.lineTo(-e.r, e.r);
    ctx.closePath();
    ctx.fill();
  } else if (e.type === "tank") {
    ctx.rotate(e.spin * 0.4);
    roundRect(-e.r, -e.r, e.r * 2, e.r * 2, 4);
    ctx.fill();

    ctx.fillStyle = "#2b0b22";
    ctx.fillRect(-e.r * 0.45, -e.r * 0.45, e.r * 0.9, e.r * 0.9);
  } else {
    ctx.rotate(e.spin * 0.5);
    roundRect(-e.r, -e.r, e.r * 2, e.r * 2, 7);
    ctx.fill();
  }
}

function drawBossShape(e) {
  if (e.bossType === "FINAL") return drawFinalFlowerBoss(0, 0, e.downed ? 0.78 : 1.15, e.color);
  if (e.bossType === "RAVAGER_1") return drawRavagerCorpse(0, 0, 0.9);
  if (e.bossType === "RAVAGER_2") return drawRavagerAwakenedShape(0, 0, e.r, e.color);
  if (isRavagerEcho(e.bossType)) return drawRavagerEchoShape(0, 0, e.r, e.color, e.bossType);

  if (e.bossType === "CHARGER") {
    ctx.rotate(Math.atan2(player.y - e.y, player.x - e.x));
    ctx.beginPath();
    ctx.moveTo(e.r * 1.35, 0);
    ctx.lineTo(-e.r, -e.r * 0.75);
    ctx.lineTo(-e.r * 0.55, 0);
    ctx.lineTo(-e.r, e.r * 0.75);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (e.bossType === "DASHLINE") {
    ctx.rotate(Math.atan2(e.dashVy || 1, e.dashVx || 1));
    ctx.beginPath();
    ctx.moveTo(e.r * 1.5, 0);
    ctx.lineTo(-e.r * 1.2, -e.r * 0.35);
    ctx.lineTo(-e.r * 0.5, 0);
    ctx.lineTo(-e.r * 1.2, e.r * 0.35);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (e.bossType === "TANK_BOSS") {
    roundRect(-e.r, -e.r, e.r * 2, e.r * 2, 8);
    ctx.fill();

    ctx.fillStyle = "#220014";
    ctx.fillRect(-e.r * 0.6, -e.r * 0.6, e.r * 1.2, e.r * 1.2);
    return;
  }

  if (e.bossType === "SNIPER") {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, -8, e.r * 1.5, 16);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    return;
  }

  if (e.bossType === "SPLITTER") {
    ctx.rotate(e.spin);
    ctx.beginPath();
    ctx.moveTo(0, -e.r);
    ctx.lineTo(e.r * 0.8, 0);
    ctx.lineTo(0, e.r);
    ctx.lineTo(-e.r * 0.8, 0);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.rotate(e.spin);
  ctx.beginPath();

  const points = e.phase === 2 ? 14 : 10;

  for (let i = 0; i < points; i++) {
    const a = (i * Math.PI * 2) / points;
    const rr = i % 2 === 0 ? e.r : e.r * 0.55;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
}

function drawRavagerCorpse(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#5b6478";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#5b6478";

  ctx.beginPath();
  ctx.moveTo(-90, 20);
  ctx.lineTo(-40, -45);
  ctx.lineTo(30, -35);
  ctx.lineTo(95, 25);
  ctx.lineTo(35, 55);
  ctx.lineTo(-70, 50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1d2233";
  ctx.fillRect(-45, -10, 90, 20);

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawRavagerAwakenedShape(x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(performance.now() / 700);

  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const rr = i % 2 === 0 ? r * 1.25 : r * 0.55;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffde59";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRavagerEchoShape(x, y, r, color, type) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(performance.now() / 600);
  ctx.fillStyle = color;

  const spikes = type === "RAVAGER_CROWNED" ? 16 : 12;

  ctx.beginPath();

  for (let i = 0; i < spikes; i++) {
    const a = (i * Math.PI * 2) / spikes;
    const rr = i % 2 === 0 ? r * 1.2 : r * 0.6;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = type === "RAVAGER_VOID" ? "#ffffff" : "#ffde59";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  if (type === "RAVAGER_CROWNED") {
    ctx.fillStyle = "#ffde59";
    ctx.fillRect(-r * 0.45, -r * 1.25, r * 0.9, r * 0.22);
  }

  ctx.restore();
}

function drawFinalFlowerBoss(x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const t = performance.now() / 420;
  const flicker = Math.sin(performance.now() / 45) > 0 ? color : "#ffffff";

  ctx.fillStyle = flicker;
  ctx.shadowBlur = 40;
  ctx.shadowColor = flicker;

  for (let i = 0; i < 12; i++) {
    const a = t + (i * Math.PI * 2) / 12;

    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -95, 30, 105, Math.sin(t + i) * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#200014";
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffde59";

  for (let i = 0; i < 7; i++) {
    const a = t * 1.7 + (i * Math.PI * 2) / 7;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 33, Math.sin(a) * 33, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, 15 + Math.sin(performance.now() / 60) * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawPlayer() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const weaponName = getCurrentWeapon();
  const weaponColor = (weaponData[weaponName] || weaponData.PISTOL).color;
  const char = characterData[save.selectedCharacter] || characterData.CORE;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle);

  if (player.invincible > 0 || player.ghostTimer > 0) {
    ctx.globalAlpha = 0.55 + Math.sin(Date.now() / 30) * 0.3;
  }

  ctx.shadowBlur = 25;
  ctx.shadowColor = char.color;

  const gradient = ctx.createRadialGradient(0, 0, 3, 0, 0, player.r);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.35, char.color);
  gradient.addColorStop(1, "#111827");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = char.ring;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, player.r + 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = weaponColor;
  roundRect(10, -5, weaponName === "SHOTGUN" || weaponName === "RPG" ? 36 : 28, 10, 4);
  ctx.fill();

  if (player.shieldTimer > 0 || player.rageTimer > 0) {
    ctx.strokeStyle = player.rageTimer > 0 ? "#ff2f88" : "#6cff7a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, player.r + 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCrosshair() {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mouse.x - 10, mouse.y);
  ctx.lineTo(mouse.x + 10, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - 10);
  ctx.lineTo(mouse.x, mouse.y + 10);
  ctx.stroke();
}

function drawUI() {
  const weaponName = getCurrentWeapon();
  const char = characterData[save.selectedCharacter] || characterData.CORE;
  const now = performance.now() / 1000;
  const abilityReady = now - player.lastAbility >= player.abilityCooldown;
  const dashReady = now - player.lastDash > player.dashCooldown;

  ctx.textAlign = "left";
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";

  ctx.fillText("Wave: " + wave + (wave > 50 ? " CHAOS" : "") + (save.corruptedMode ? " CORRUPTED" : ""), 14, 25);
  ctx.fillText("Character: " + char.name, 14, 47);
  ctx.fillText("HP: " + Math.ceil(player.hp) + " / " + player.maxHp, 14, 69);
  ctx.fillText("Weapon: " + weaponName + " (" + (player.weaponIndex + 1) + "/" + player.weapons.length + ")", 14, 91);
  ctx.fillText("Damage: " + player.damage.toFixed(2), 14, 113);
  ctx.fillText("Coins: " + save.coins, 14, 135);

  ctx.fillStyle = "#101421";
  ctx.fillRect(14, 150, 230, 16);

  ctx.fillStyle = "#57ff85";
  ctx.fillRect(14, 150, 230 * Math.max(0, player.hp / player.maxHp), 16);

  ctx.strokeStyle = "white";
  ctx.strokeRect(14, 150, 230, 16);

  ctx.fillStyle = dashReady ? "#7dfcff" : "#37466f";
  ctx.fillText("Dash: " + (dashReady ? "READY" : "COOLDOWN"), 14, 188);

  ctx.fillStyle = abilityReady ? "#ffde59" : "#6b7280";
  ctx.fillText("Ability [1/F]: " + (abilityReady ? "READY" : "COOLDOWN"), 14, 210);

  ctx.fillStyle = save.evolutionUnlocked ? "#ffde59" : "#6b7280";
  ctx.font = "13px Arial";
  ctx.fillText("Evolution: " + (save.evolutionUnlocked ? "ON" : "LOCKED") + " | Crit: " + Math.round(player.critChance * 100) + "%", 14, 232);
}

function getBoss() {
  return enemies.find(e => e.boss);
}

function drawBossHealthBar() {
  const boss = getBoss();

  if (!boss) return;

  const barWidth = Math.min(canvas.width * 0.65, 720);
  const barHeight = 22;
  const x = canvas.width / 2 - barWidth / 2;
  const y = 22;

  ctx.textAlign = "center";
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 10;
  ctx.shadowColor = boss.corrupted ? "#ff00ff" : "#ff3b93";

  ctx.fillText((boss.corrupted ? "CORRUPTED " : boss.voided ? "VOID " : "") + (bossNames[boss.bossType] || "BOSS"), canvas.width / 2, y - 5);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#130716";
  roundRect(x, y, barWidth, barHeight, 8);
  ctx.fill();

  ctx.fillStyle = boss.phase === 2 ? "#ffde59" : boss.color;
  roundRect(x, y, barWidth * Math.max(0, boss.hp / boss.maxHp), barHeight, 8);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  roundRect(x, y, barWidth, barHeight, 8);
  ctx.stroke();

  if (boss.bossType === "FINAL" && !boss.downed) {
    ctx.font = "13px Arial";
    ctx.fillStyle = "#c7d4ff";
    ctx.fillText("SHIELDED: collect the orb to knock it down", canvas.width / 2, y + 43);
  }
}

function drawFloatingTexts() {
  ctx.textAlign = "center";

  for (const f of floatingTexts) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = "bold " + f.size + "px Arial";
    ctx.shadowBlur = 12;
    ctx.shadowColor = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function drawBossWarningOverlay() {
  ctx.fillStyle = "rgba(60,0,30,0.24)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pulse = 1 + Math.sin(Date.now() / 90) * 0.08;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2 - 35);
  ctx.scale(pulse, pulse);

  ctx.textAlign = "center";
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#ff3b93";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial";
  ctx.fillText(currentBossName.toUpperCase(), 0, 0);

  ctx.shadowBlur = 0;
  ctx.font = "20px Arial";
  ctx.fillStyle = "#ffd0e5";
  ctx.fillText("Get ready...", 0, 42);

  ctx.restore();
}

function burstVisual(x, y, color, amount) {
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = color;

  for (let i = 0; i < amount; i++) {
    const a = (i / amount) * Math.PI * 2;
    const r = 70 + Math.sin(performance.now() / 120 + i) * 20;

    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawCutscene() {
  if (!cutscene) return;

  const current = cutscene.lines[cutscene.index];
  const pulse = 1 + Math.sin(performance.now() / 120) * 0.04;

  ctx.fillStyle = "rgba(0,0,0,0.74)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (current.kind === "ravager_dead") {
    drawRavagerCorpse(canvas.width / 2, canvas.height / 2 + 70, 1);
  }

  if (current.kind === "ravager_awaken") {
    drawRavagerCorpse(canvas.width / 2, canvas.height / 2 + 70, pulse);
    burstVisual(canvas.width / 2, canvas.height / 2 + 70, "#ff2f88", 18);
  }

  if (current.kind === "final") {
    drawFinalFlowerBoss(canvas.width / 2, canvas.height / 2 - 80, 1.1 * pulse, "#ff2f88");
  }

  if (current.kind === "final_explode") {
    drawFinalFlowerBoss(canvas.width / 2, canvas.height / 2 - 50, 1.2 * pulse, "#ffffff");
    burstVisual(canvas.width / 2, canvas.height / 2 - 50, "#ff2f88", 35);
    burstVisual(canvas.width / 2, canvas.height / 2 - 50, "#ffde59", 25);
  }

  ctx.textAlign = "center";
  ctx.shadowBlur = 22;
  ctx.shadowColor = current.color || "#ff3b93";
  ctx.fillStyle = current.color || "#ffffff";
  ctx.font = "bold " + (current.size || 34) + "px Arial";
  ctx.fillText(current.text, canvas.width / 2, canvas.height / 2 - 150);
  ctx.shadowBlur = 0;

  ctx.font = "16px Arial";
  ctx.fillStyle = "#c7d4ff";
  ctx.fillText("Press ENTER to skip line", canvas.width / 2, canvas.height - 60);
}

function drawMenu() {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const unlocked = Object.keys(save.achievements).length;
  const total = Object.keys(achievementList).length;
  const char = characterData[save.selectedCharacter] || characterData.CORE;

  ctx.textAlign = "center";
  ctx.shadowBlur = 22;
  ctx.shadowColor = save.corruptedMode ? "#ff00ff" : "#7dfcff";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.fillText("NEON BOSS SHOOTER", canvas.width / 2, canvas.height / 2 - 240);

  ctx.shadowBlur = 0;
  ctx.font = "20px Arial";
  ctx.fillStyle = "#cfe7ff";
  ctx.fillText("v1.2 Fixed Build • Ravager Story • Chaos • Corrupted Mode", canvas.width / 2, canvas.height / 2 - 190);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Press ENTER to start", canvas.width / 2, canvas.height / 2 - 125);
  ctx.fillText("Press M for upgrade shop", canvas.width / 2, canvas.height / 2 - 90);
  ctx.fillText("Press C for character shop", canvas.width / 2, canvas.height / 2 - 55);
  ctx.fillText("Press A for achievements", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "16px Arial";
  ctx.fillStyle = "#b9c8ff";
  ctx.fillText("Selected: " + char.name + " — Starts with " + char.startWeapon, canvas.width / 2, canvas.height / 2 + 35);
  ctx.fillText("Coins: " + save.coins + " | Best Wave: " + save.bestWave, canvas.width / 2, canvas.height / 2 + 65);

  ctx.fillText(
    "Damage " + save.upgrades.damage + "/" + UPGRADE_CAPS.damage +
    " | Fire Rate " + save.upgrades.fireRate + "/" + UPGRADE_CAPS.fireRate +
    " | Health " + save.upgrades.health + "/" + UPGRADE_CAPS.health +
    " | Speed " + save.upgrades.speed + "/" + UPGRADE_CAPS.speed,
    canvas.width / 2,
    canvas.height / 2 + 95
  );

  ctx.fillText("Achievements: " + unlocked + " / " + total, canvas.width / 2, canvas.height / 2 + 125);
  ctx.fillText("Hard unlocks: Phantom • Titan • Eclipse • Apex", canvas.width / 2, canvas.height / 2 + 153);

  ctx.fillStyle = save.corruptedMode ? "#ff2f88" : "#6b7280";
  ctx.fillText(
    save.corruptedUnlocked
      ? "Press V: Corrupted Mode " + (save.corruptedMode ? "ON" : "OFF")
      : "Corrupted Mode: Locked until Worldbreaker is defeated",
    canvas.width / 2,
    canvas.height / 2 + 183
  );
}

function drawPauseMenu() {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#7dfcff";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 90);
  ctx.shadowBlur = 0;

  ctx.font = "24px Arial";
  ctx.fillStyle = "#c7d4ff";
  ctx.fillText("Press R, P, or ESC to resume", canvas.width / 2, canvas.height / 2 - 25);
  ctx.fillText("Press M to return to main menu", canvas.width / 2, canvas.height / 2 + 20);

  ctx.font = "15px Arial";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Current run progress will be lost if you return to the menu.", canvas.width / 2, canvas.height / 2 + 70);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff3b93";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 90);
  ctx.shadowBlur = 0;

  ctx.font = "22px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("You reached wave " + wave, canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText("Best Wave: " + save.bestWave, canvas.width / 2, canvas.height / 2 + 5);
  ctx.fillText("Coins: " + save.coins, canvas.width / 2, canvas.height / 2 + 40);

  ctx.font = "bold 24px Arial";
  ctx.fillText("Press ENTER to restart", canvas.width / 2, canvas.height / 2 + 95);
}

// ==========================
// MAIN LOOP
// ==========================
function loop(t) {
  const now = t / 1000;
  const dt = Math.min(0.033, now - lastTime || 0);
  lastTime = now;

  if (state === "playing") {
    update(dt, now);
  } else if (state === "bossWarning") {
    updateBossWarning(dt);
  } else if (state === "cutscene") {
    updateStars(dt);
    updateCutscene(dt);
  } else {
    updateStars(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

})();
