// =====================================================
// NEON BOSS SHOOTER: PUBLIC EDITION
// Put this entire file inside game.js
// Requires index.html with: <script src="game.js"></script>
// =====================================================


// =====================================================
// SETUP
// =====================================================

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
  "WASD/Arrows move • Click/Space shoot • Q/E weapon • Shift/X dash • 1 ability • Enter start • M upgrades • C characters • A achievements";
document.body.appendChild(hint);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


// =====================================================
// SAVE DATA
// =====================================================

const SAVE_KEY = "neonBossShooterPublicV1";

let save =
  JSON.parse(localStorage.getItem(SAVE_KEY) || "null") || {
    coins: 0,
    costs: { damage: 10, fireRate: 10, health: 10, speed: 10 },
    upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0 },
    achievements: {},
    ownedCharacters: ["CORE"],
    selectedCharacter: "CORE",
    bestWave: 1,
    milestones: {},
    evolutionUnlocked: false,
    chaosUnlocked: false
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

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
saveGame();


// =====================================================
// INPUT / AUDIO
// =====================================================

let keys = {};
let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  down: false
};

function resetControls() {
  keys = {};
  mouse.down = false;
}

let audioCtx = null;

function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(freq, duration, type, volume) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume || 0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}


// =====================================================
// GAME DATA
// =====================================================

const achievementList = {
  firstBlood: "First Blood - Defeat your first enemy",
  firstBoss: "Boss Slayer - Defeat your first boss",
  wave10: "Evolution Core - Reach wave 10 and unlock weapon evolutions",
  wave25: "The Ravager - Survive wave 25",
  ravagerDead: "It Was Not Dead - Defeat Ravager's awakened form",
  wave50: "The End Arrives - Reach wave 50",
  finalBoss: "Worldbreaker - Defeat the final boss",
  chaos: "Chaos Begins - Unlock chaos mode",
  allWeapons: "Arsenal - Unlock every weapon in one run",
  firstShop: "Investor - Buy your first permanent upgrade",
  rich: "Rich Core - Hold 50 permanent coins",
  speedster: "Speedster - Buy 3 permanent speed upgrades",
  glassCannon: "Glass Cannon - Reach 3.0 damage in a run",
  rpgFound: "Boom Time - Unlock the RPG",
  firstCharacter: "New Hero - Buy your first character",
  voidUnlocked: "Void Opened - Unlock Void",
  overlordUnlocked: "Boss Reborn - Unlock Overlord"
};

const weaponData = {
  PISTOL: { color: "#7dfcff", cooldown: 0.15, sound: 840 },
  SHOTGUN: { color: "#ffd36a", cooldown: 0.62, sound: 230 },
  BURST: { color: "#a77dff", cooldown: 0.42, sound: 620 },
  LASER: { color: "#ff5eec", cooldown: 0.08, sound: 980 },
  MINIGUN: { color: "#63ff8b", cooldown: 0.055, sound: 520 },
  RPG: { color: "#ff9f43", cooldown: 0.95, sound: 150 },
  RAILGUN: { color: "#ffffff", cooldown: 0.82, sound: 1100 },
  FLAMER: { color: "#ff4d2e", cooldown: 0.045, sound: 180 },
  SPARK: { color: "#7dfcff", cooldown: 0.11, sound: 760 },
  ORBIT: { color: "#b28cff", cooldown: 0.2, sound: 650 }
};

const characterData = {
  CORE: {
    name: "Core",
    cost: 0,
    color: "#65b7ff",
    ring: "#7dfcff",
    startWeapon: "PISTOL",
    maxHp: 115,
    speed: 270,
    damage: 1.25,
    fireRateBonus: 0,
    armor: 0,
    passive: "Balanced stats.",
    manual: "Quick heal.",
    abilityCooldown: 18
  },

  BLAZE: {
    name: "Blaze",
    cost: 25,
    color: "#ff6b3d",
    ring: "#ffde59",
    startWeapon: "FLAMER",
    maxHp: 100,
    speed: 260,
    damage: 1.5,
    fireRateBonus: 0.01,
    armor: 0,
    passive: "High damage, lower health.",
    manual: "Fire nova explosion.",
    abilityCooldown: 20
  },

  VOLT: {
    name: "Volt",
    cost: 30,
    color: "#7dfcff",
    ring: "#ffffff",
    startWeapon: "SPARK",
    maxHp: 90,
    speed: 310,
    damage: 1.1,
    fireRateBonus: 0.04,
    armor: 0,
    passive: "Fast movement and fire rate.",
    manual: "Slow time briefly.",
    abilityCooldown: 24
  },

  TANK: {
    name: "Tank",
    cost: 35,
    color: "#6cff7a",
    ring: "#b6ffca",
    startWeapon: "RPG",
    maxHp: 175,
    speed: 225,
    damage: 1.18,
    fireRateBonus: 0,
    armor: 4,
    passive: "Huge HP and armor, slower speed.",
    manual: "Temporary shield.",
    abilityCooldown: 25
  },

  GHOST: {
    name: "Ghost",
    cost: 40,
    color: "#b28cff",
    ring: "#ff5eec",
    startWeapon: "BURST",
    maxHp: 85,
    speed: 345,
    damage: 1.15,
    fireRateBonus: 0.015,
    armor: 0,
    passive: "Extreme speed, lower HP.",
    manual: "Invincible ghost mode.",
    abilityCooldown: 22
  },

  NOVA: {
    name: "Nova",
    cost: 50,
    color: "#ffffff",
    ring: "#ff5eec",
    startWeapon: "RAILGUN",
    maxHp: 100,
    speed: 255,
    damage: 1.7,
    fireRateBonus: 0,
    armor: 1,
    passive: "Very high damage, slower weapon.",
    manual: "Overcharge damage boost.",
    abilityCooldown: 28
  },

  VOID: {
    name: "Void",
    cost: 0,
    color: "#2b114f",
    ring: "#b28cff",
    startWeapon: "ORBIT",
    maxHp: 120,
    speed: 295,
    damage: 1.35,
    fireRateBonus: 0.02,
    armor: 1,
    passive: "Unlocked at wave 25.",
    manual: "Void pull damages nearby enemies.",
    abilityCooldown: 24
  },

  OVERLORD: {
    name: "Overlord",
    cost: 0,
    color: "#ff2f88",
    ring: "#ffde59",
    startWeapon: "RPG",
    maxHp: 145,
    speed: 265,
    damage: 1.6,
    fireRateBonus: 0.015,
    armor: 2,
    passive: "Unlocked by beating the final boss.",
    manual: "Boss rage: damage + shield.",
    abilityCooldown: 30
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
  PAST_BOSS: "Echo Boss"
};

const bossCycle = [
  "CHARGER",
  "DASHLINE",
  "BULLET_HELL",
  "TANK_BOSS",
  "SPLITTER",
  "SUMMONER",
  "SPIRAL",
  "SNIPER",
  "PULSER",
  "MIRROR",
  "HYBRID"
];


// =====================================================
// STATE
// =====================================================

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
let enemiesKilledThisRun = 0;
let bossesKilledThisRun = 0;
let wave25Stage = 0;
let finalStarted = false;
let finalDownTimer = 0;

for (let i = 0; i < 160; i++) {
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
  dashCooldown: 1.1,
  lastDash: -99,
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
  rageTimer: 0
};


// =====================================================
// EVENTS
// =====================================================

window.addEventListener("keydown", function (e) {
  const k = e.key.toLowerCase();
  keys[k] = true;
  unlockAudio();

  if (k === "q") {
    player.weaponIndex--;
    if (player.weaponIndex < 0) player.weaponIndex = player.weapons.length - 1;
    playSound(420, 0.05, "square", 0.04);
  }

  if (k === "e") {
    player.weaponIndex++;
    if (player.weaponIndex >= player.weapons.length) player.weaponIndex = 0;
    playSound(520, 0.05, "square", 0.04);
  }

  if (k === "m" && state === "menu") openMainMenuShop();
  if (k === "c" && state === "menu") openCharacterShop();
  if (k === "a" && state === "menu") showAchievements();
  if (k === "1" && state === "playing") useCharacterAbility();

  if ((state === "menu" || state === "dead") && e.key === "Enter") {
    startGame();
  }

  if (state === "cutscene" && e.key === "Enter" && cutscene) {
    cutscene.timer = 999;
  }
});

window.addEventListener("keyup", function (e) {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", function () {
  mouse.down = true;
  unlockAudio();
});

canvas.addEventListener("mouseup", function () {
  mouse.down = false;
});

canvas.addEventListener("touchstart", function (e) {
  e.preventDefault();
  unlockAudio();
  mouse.down = true;
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
});

canvas.addEventListener("touchmove", function (e) {
  e.preventDefault();
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
});

canvas.addEventListener("touchend", function (e) {
  e.preventDefault();
  mouse.down = false;
});


// =====================================================
// ACHIEVEMENTS / SHOPS
// =====================================================

function unlockAchievement(id) {
  if (save.achievements[id]) return;

  save.achievements[id] = true;
  save.coins += 5;
  saveGame();

  floatingText(
    canvas.width / 2,
    canvas.height / 2 - 115,
    "ACHIEVEMENT: " + achievementList[id] + " (+5 coins)",
    "#ffde59",
    20
  );

  playSound(900, 0.18, "triangle", 0.07);
}

function showAchievements() {
  let msg = "ACHIEVEMENTS\n\n";

  for (const id in achievementList) {
    msg += (save.achievements[id] ? "✅ " : "⬜ ") + achievementList[id] + "\n";
  }

  msg += "\nUnlocked achievements give +5 permanent coins.";
  alert(msg);
  resetControls();
}

function openMainMenuShop() {
  let shopping = true;

  while (shopping) {
    let msg =
      "PERMANENT UPGRADE SHOP\n\n" +
      "Coins: " + save.coins + "\n\n" +
      "1. Damage +" + save.upgrades.damage + " — Cost: " + save.costs.damage + "\n" +
      "2. Fire Rate +" + save.upgrades.fireRate + " — Cost: " + save.costs.fireRate + "\n" +
      "3. Health +" + save.upgrades.health + " — Cost: " + save.costs.health + "\n" +
      "4. Speed +" + save.upgrades.speed + " — Cost: " + save.costs.speed + "\n" +
      "5. Leave Shop\n\n" +
      "Each category cost increases by 5 after buying.";

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

  alert(type + " upgraded permanently!");
  resetControls();
}

function openCharacterShop() {
  let msg = "CHARACTER SHOP\n\n";
  msg += "Coins: " + save.coins + "\n";
  msg += "Selected: " + characterData[save.selectedCharacter].name + "\n\n";

  const ids = Object.keys(characterData);

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const c = characterData[id];
    const owned = save.ownedCharacters.indexOf(id) !== -1;

    let locked = "";
    if (id === "VOID" && !owned) locked = " — WAVE 25 UNLOCK";
    if (id === "OVERLORD" && !owned) locked = " — FINAL BOSS UNLOCK";

    msg +=
      i + 1 + ". " +
      c.name +
      " — " +
      (owned ? "OWNED" : c.cost + " coins") +
      locked +
      "\n   Start Weapon: " + c.startWeapon +
      "\n   HP: " + c.maxHp +
      " | Speed: " + c.speed +
      " | Damage: " + c.damage +
      " | Armor: " + c.armor +
      "\n   Passive: " + c.passive +
      "\n   Ability [1]: " + c.manual +
      "\n\n";
  }

  msg += "Type a number to buy/select, or cancel.";

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

  if (id === "VOID") {
    alert("Void unlocks for free when you defeat the wave 25 Ravager.");
    resetControls();
    return;
  }

  if (id === "OVERLORD") {
    alert("Overlord unlocks for free when you defeat the final boss at wave 50.");
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


// =====================================================
// START GAME
// =====================================================

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
  enemiesKilledThisRun = 0;
  bossesKilledThisRun = 0;
  wave25Stage = 0;
  finalStarted = false;
  finalDownTimer = 0;
  resetControls();

  const char = characterData[save.selectedCharacter] || characterData.CORE;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.maxHp = char.maxHp + save.upgrades.health * 20;
  player.hp = player.maxHp;
  player.speed = char.speed + save.upgrades.speed * 20;
  player.damage = char.damage + save.upgrades.damage * 0.25;
  player.weaponIndex = 0;
  player.weapons = [char.startWeapon];
  player.lastShot = 0;
  player.bulletSpeed = 760;
  player.dashCooldown = 1.1;
  player.lastDash = -99;
  player.invincible = 0;
  player.fireRateBonus = char.fireRateBonus + save.upgrades.fireRate * 0.01;
  player.pelletBonus = 0;
  player.armor = char.armor;
  player.abilityCooldown = char.abilityCooldown;
  player.lastAbility = -999;
  player.shieldTimer = 0;
  player.slowTimeTimer = 0;
  player.ghostTimer = 0;
  player.overchargeTimer = 0;
  player.rageTimer = 0;

  spawnWave();
  playSound(260, 0.12, "sawtooth", 0.06);
}


// =====================================================
// CUTSCENES
// =====================================================

function startCutscene(lines, onFinish) {
  state = "cutscene";
  cutscene = {
    lines: lines,
    index: 0,
    timer: 0,
    onFinish: onFinish
  };
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

function drawCutscene() {
  if (!cutscene) return;

  const current = cutscene.lines[cutscene.index];
  const pulse = 1 + Math.sin(performance.now() / 120) * 0.04;

  ctx.fillStyle = "rgba(0,0,0,0.72)";
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

function startWave25Intro() {
  startCutscene(
    [
      { text: "WAVE 25", color: "#ffde59", size: 46, duration: 1.4 },
      { text: "A dead machine blocks the arena...", color: "#c7d4ff", duration: 2.1, kind: "ravager_dead" },
      { text: "The Ravager is dormant.", color: "#ffffff", duration: 2.0, kind: "ravager_dead" },
      { text: "Destroy it before it wakes.", color: "#ff5e3b", duration: 2.0, kind: "ravager_dead" }
    ],
    function () {
      spawnBoss("RAVAGER_1", false, false);
      currentBossName = bossNames.RAVAGER_1;
      floatingText(canvas.width / 2, 90, "RAVAGER: DORMANT FORM", "#ffde59", 30);
    }
  );
}

function startRavagerAwakening() {
  startCutscene(
    [
      { text: "TARGET NEUTRALIZED.", color: "#6cff7a", duration: 1.8, kind: "ravager_dead" },
      { text: "...", color: "#ffffff", duration: 1.4, kind: "ravager_dead" },
      { text: "ENERGY SIGNATURE DETECTED.", color: "#ffde59", duration: 2.0, kind: "ravager_awaken" },
      { text: "THE RAVAGER AWAKENS.", color: "#ff2f88", size: 42, duration: 2.2, kind: "ravager_awaken" }
    ],
    function () {
      spawnBoss("RAVAGER_2", false, false);
      currentBossName = bossNames.RAVAGER_2;
      floatingText(canvas.width / 2, 90, "RAVAGER: AWAKENED FORM", "#ff2f88", 34);
      screenShake = 15;
    }
  );
}

function startWave50Intro() {
  startCutscene(
    [
      { text: "WAVE 50", color: "#ffde59", size: 48, duration: 1.4 },
      { text: "The corpse from wave 25 begins to move.", color: "#c7d4ff", duration: 2.2, kind: "ravager_dead" },
      { text: "WARNING: FINAL EVOLUTION DETECTED.", color: "#ff5e3b", duration: 2.0, kind: "ravager_awaken" },
      { text: "IT WAS NEVER DEAD.", color: "#ff2f88", size: 42, duration: 2.2, kind: "ravager_awaken" },
      { text: "WORLDBREAKER RAVAGER", color: "#ff2f88", size: 46, duration: 2.4, kind: "final" },
      { text: "Use the fallen orbs to bring it down.", color: "#7dfcff", duration: 2.2, kind: "final" }
    ],
    function () {
      spawnBoss("FINAL", false, false);
      currentBossName = bossNames.FINAL;
      finalStarted = true;
      floatingText(canvas.width / 2, 90, "FINAL BOSS", "#ff2f88", 40);
      screenShake = 18;
    }
  );
}


// =====================================================
// WAVES / SPAWNING
// =====================================================

function applyMilestones() {
  if (wave >= 10 && !save.milestones.wave10) {
    save.milestones.wave10 = true;
    save.coins += 10;
    save.evolutionUnlocked = true;
    saveGame();

    unlockAchievement("wave10");

    alert("MILESTONE: WAVE 10!\n\n+10 permanent coins!\nWeapon evolutions unlocked!");
    resetControls();
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

  if (wave > 50 || save.chaosUnlocked) {
    startChaosWave();
    return;
  }

  if (wave % 4 === 0) {
    const bossIndex = Math.floor(wave / 4 - 1) % bossCycle.length;
    startBossWarning(bossCycle[bossIndex]);
    return;
  }

  const easyScale = wave < 25 ? 0.75 : 1.0;
  const count = Math.floor((5 + wave * 1.7) * easyScale);

  for (let i = 0; i < count; i++) spawnEnemy("normal");

  if (wave >= 4) {
    for (let i = 0; i < Math.floor(wave / 3); i++) spawnEnemy("fast");
  }

  if (wave >= 9) {
    for (let i = 0; i < Math.floor(wave / 6); i++) spawnEnemy("tank");
  }

  floatingText(canvas.width / 2, 90, "WAVE " + wave, "#7dfcff", 28);
}

function startChaosWave() {
  const bossIndex = Math.floor(wave - 51) % bossCycle.length;
  const type = bossCycle[bossIndex];

  spawnBoss(type, true, false);

  if (wave % 3 === 0) {
    spawnBoss(bossCycle[(bossIndex + 3) % bossCycle.length], true, true);
  }

  const count = 4 + Math.floor(wave / 5);

  for (let i = 0; i < count; i++) {
    spawnEnemy(i % 3 === 0 ? "fast" : "normal");
  }

  floatingText(canvas.width / 2, 90, "CHAOS WAVE " + wave, "#ff3b93", 30);
}

function startBossWarning(type) {
  state = "bossWarning";
  bossWarningTimer = type === "FINAL" ? 3.0 : 2.1;
  pendingBossType = type;
  currentBossName = bossNames[type] || "Boss";

  floatingText(canvas.width / 2, canvas.height / 2, currentBossName.toUpperCase(), "#ff3b93", 40);
  playSound(80, 0.35, "sawtooth", 0.08);
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
    playSound(90, 0.4, "sawtooth", 0.09);
  }

  screenShake *= 0.9;
}

function randomEdgePosition() {
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -70;
  } else if (side === 1) {
    x = canvas.width + 70;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + 70;
  } else {
    x = -70;
    y = Math.random() * canvas.height;
  }

  return { x, y };
}

function spawnEnemy(type) {
  const p = randomEdgePosition();

  let enemy = {
    x: p.x,
    y: p.y,
    r: 18,
    hp: 4 + wave * 0.75,
    maxHp: 4 + wave * 0.75,
    speed: 75 + wave * 3.5,
    damage: 9,
    type: type,
    boss: false,
    color: "#ff5e3b",
    hit: 0,
    spin: Math.random() * 10,
    timer: 0
  };

  if (type === "fast") {
    enemy.r = 13;
    enemy.hp = 2.5 + wave * 0.45;
    enemy.maxHp = enemy.hp;
    enemy.speed = 140 + wave * 5;
    enemy.damage = 11;
    enemy.color = "#ffde59";
  }

  if (type === "tank") {
    enemy.r = 25;
    enemy.hp = 8 + wave * 1.25;
    enemy.maxHp = enemy.hp;
    enemy.speed = 50 + wave * 1.6;
    enemy.damage = 16;
    enemy.color = "#ff7bba";
  }

  if (type === "mirror") {
    enemy.r = 15;
    enemy.hp = 4 + wave * 0.65;
    enemy.maxHp = enemy.hp;
    enemy.speed = 120 + wave * 2.5;
    enemy.damage = 12;
    enemy.color = "#b28cff";
  }

  enemies.push(enemy);
}

function spawnBoss(type, chaos, small) {
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
    hp *= 1.0;
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
    hp *= 1.0;
    color = "#b28cff";
  }

  if (type === "HYBRID") {
    hp *= 1.3;
    speed *= 1.0;
    damage += 4;
    color = "#ff3b93";
  }

  if (type === "RAVAGER_1") {
    hp = 520;
    speed = 35;
    damage = 18;
    r = 70;
    color = "#5b6478";
  }

  if (type === "RAVAGER_2") {
    hp = 850;
    speed = 78;
    damage = 28;
    r = 76;
    color = "#ff2f88";
  }

  if (type === "FINAL") {
    hp = 2400;
    speed = 0;
    damage = 35;
    r = 110;
    color = "#ff2f88";
  }

  if (type === "PAST_BOSS") {
    hp = 180 + wave * 8;
    speed = 75 + wave * 1.2;
    damage = 18;
    r = 40;
    color = "#b28cff";
  }

  if (chaos) {
    hp *= small ? 0.65 : 1.15;
    speed *= 1.08;
    damage += 4;
  }

  enemies.push({
    x: type === "FINAL" ? canvas.width / 2 : p.x,
    y: type === "FINAL" ? canvas.height * 0.22 : p.y,
    r: r,
    hp: hp,
    maxHp: hp,
    speed: speed,
    damage: damage,
    boss: true,
    bossType: type,
    chaos: chaos,
    smallBoss: small,
    type: "boss",
    color: color,
    hit: 0,
    shootTimer: 1.2,
    specialTimer: 2.2,
    chargeTimer: player.dashCooldown * 2,
    summonTimer: 3,
    orbTimer: 7,
    halfMapTimer: 5,
    spin: 0,
    phase: 1,
    splitDone: false,
    dashPause: 0,
    dashVx: 0,
    dashVy: 0,
    downed: false
  });
}


// =====================================================
// WEAPONS
// =====================================================

function getCurrentWeapon() {
  return player.weapons[player.weaponIndex];
}

function weaponEvolved() {
  return save.evolutionUnlocked;
}

function shoot(now) {
  const weaponName = getCurrentWeapon();
  const data = weaponData[weaponName];

  let cooldown = data.cooldown - player.fireRateBonus;
  cooldown = Math.max(0.035, cooldown);

  if (now - player.lastShot < cooldown) return;
  player.lastShot = now;

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  let damageBoost = player.overchargeTimer > 0 ? 1.7 : 1;
  if (player.rageTimer > 0) damageBoost *= 1.45;

  const evo = weaponEvolved();

  if (weaponName === "PISTOL") {
    createPlayerBullet(angle, player.damage * damageBoost, data.color, 5, 1.2, false);
    if (evo) createPlayerBullet(angle + 0.08, player.damage * 0.8 * damageBoost, data.color, 4, 1.1, false);
    playSound(data.sound, 0.04, "square", 0.035);
  }

  if (weaponName === "SHOTGUN") {
    const pellets = 8 + player.pelletBonus + (evo ? 3 : 0);

    for (let i = 0; i < pellets; i++) {
      const spread = (Math.random() - 0.5) * (evo ? 0.82 : 0.68);
      createPlayerBullet(angle + spread, player.damage * 0.75 * damageBoost, data.color, 4, 0.68, false);
    }

    burst(player.x, player.y, data.color, 15, 260);
    playSound(data.sound, 0.09, "sawtooth", 0.055);
    screenShake = Math.max(screenShake, 4);
  }

  if (weaponName === "BURST") {
    const shots = evo ? 5 : 3;

    for (let i = 0; i < shots; i++) {
      const spread = (i - Math.floor(shots / 2)) * 0.07;
      createPlayerBullet(angle + spread, player.damage * 0.9 * damageBoost, data.color, 5, 1.1, false);
    }

    playSound(data.sound, 0.055, "square", 0.04);
  }

  if (weaponName === "LASER") {
    createPlayerBullet(angle, player.damage * (evo ? 0.72 : 0.52) * damageBoost, data.color, 3.5, 1.65, true);
    bullets[bullets.length - 1].pierce = evo ? 8 : 2;
    playSound(data.sound, 0.025, "sine", 0.025);
  }

  if (weaponName === "MINIGUN") {
    const spread = (Math.random() - 0.5) * (evo ? 0.28 : 0.18);
    createPlayerBullet(angle + spread, player.damage * (evo ? 0.5 : 0.42) * damageBoost, data.color, 4, 1.05, false);
    if (evo) bullets[bullets.length - 1].burn = true;
    playSound(data.sound + Math.random() * 80, 0.025, "square", 0.022);
  }

  if (weaponName === "RPG") {
    createPlayerBullet(angle, player.damage * (evo ? 5.5 : 4.5) * damageBoost, data.color, 9, 1.8, false);
    bullets[bullets.length - 1].explosive = true;
    bullets[bullets.length - 1].explosionRadius = evo ? 135 : 95;
    playSound(data.sound, 0.12, "sawtooth", 0.07);
    screenShake = Math.max(screenShake, 6);
  }

  if (weaponName === "RAILGUN") {
    createPlayerBullet(angle, player.damage * (evo ? 6.5 : 5.2) * damageBoost, data.color, 6, 1.6, true);
    bullets[bullets.length - 1].vx *= 1.35;
    bullets[bullets.length - 1].vy *= 1.35;
    bullets[bullets.length - 1].pierce = evo ? 12 : 8;
    playSound(data.sound, 0.1, "triangle", 0.06);
    screenShake = Math.max(screenShake, 5);
  }

  if (weaponName === "FLAMER") {
    const spread = (Math.random() - 0.5) * (evo ? 0.75 : 0.55);
    createPlayerBullet(angle + spread, player.damage * (evo ? 0.35 : 0.28) * damageBoost, data.color, 6, evo ? 0.55 : 0.38, false);
    bullets[bullets.length - 1].burn = true;
    playSound(data.sound + Math.random() * 40, 0.02, "sawtooth", 0.018);
  }

  if (weaponName === "SPARK") {
    createPlayerBullet(angle, player.damage * (evo ? 0.95 : 0.75) * damageBoost, data.color, 4, 1.0, false);
    bullets[bullets.length - 1].chain = true;
    bullets[bullets.length - 1].chainCount = evo ? 5 : 2;
    playSound(data.sound, 0.035, "square", 0.028);
  }

  if (weaponName === "ORBIT") {
    const a1 = angle + Math.sin(now * 6) * 0.5;
    createPlayerBullet(a1, player.damage * 0.85 * damageBoost, data.color, 5, 1.2, true);
    bullets[bullets.length - 1].chain = evo;
    bullets[bullets.length - 1].chainCount = evo ? 3 : 0;
    playSound(data.sound, 0.04, "triangle", 0.028);
  }
}

function createPlayerBullet(angle, damage, color, size, life, pierce) {
  bullets.push({
    x: player.x + Math.cos(angle) * 28,
    y: player.y + Math.sin(angle) * 28,
    vx: Math.cos(angle) * player.bulletSpeed,
    vy: Math.sin(angle) * player.bulletSpeed,
    r: size,
    damage: damage,
    color: color,
    life: life,
    enemyBullet: false,
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
    x: x,
    y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: size,
    damage: damage,
    color: color || "#ff4f9f",
    life: 4,
    enemyBullet: true,
    pierce: 0,
    trail: []
  });
}


// =====================================================
// CHARACTER ABILITIES
// =====================================================

function useCharacterAbility() {
  const now = performance.now() / 1000;
  const charId = save.selectedCharacter;

  if (now - player.lastAbility < player.abilityCooldown) {
    floatingText(player.x, player.y - 45, "ABILITY NOT READY", "#ffffff", 16);
    return;
  }

  player.lastAbility = now;

  if (charId === "CORE") {
    player.hp = Math.min(player.maxHp, player.hp + 35);
    floatingText(player.x, player.y - 45, "CORE HEAL", "#7dfcff", 18);
    playSound(700, 0.12, "triangle", 0.06);
  }

  if (charId === "BLAZE") {
    burst(player.x, player.y, "#ff6b3d", 45, 420);

    for (const e of enemies) {
      if (distance(player, e) < 150 + e.r) {
        e.hp -= player.damage * 5;
        e.hit = 0.15;
      }
    }

    floatingText(player.x, player.y - 45, "BLAZE NOVA", "#ff6b3d", 18);
    screenShake = Math.max(screenShake, 12);
    playSound(120, 0.22, "sawtooth", 0.08);
  }

  if (charId === "VOLT") {
    player.slowTimeTimer = 4;
    floatingText(player.x, player.y - 45, "TIME SLOW", "#7dfcff", 18);
    playSound(950, 0.18, "sine", 0.06);
  }

  if (charId === "TANK") {
    player.shieldTimer = 5;
    floatingText(player.x, player.y - 45, "SHIELD ON", "#6cff7a", 18);
    playSound(300, 0.18, "triangle", 0.06);
  }

  if (charId === "GHOST") {
    player.ghostTimer = 3;
    player.invincible = 3;
    floatingText(player.x, player.y - 45, "GHOST MODE", "#b28cff", 18);
    playSound(500, 0.18, "sine", 0.06);
  }

  if (charId === "NOVA") {
    player.overchargeTimer = 5;
    floatingText(player.x, player.y - 45, "OVERCHARGE", "#ffffff", 18);
    playSound(1100, 0.18, "triangle", 0.07);
  }

  if (charId === "VOID") {
    burst(player.x, player.y, "#b28cff", 55, 300);

    for (const e of enemies) {
      if (distance(player, e) < 210 + e.r) {
        e.hp -= player.damage * 4.2;
        e.x += (player.x - e.x) * 0.12;
        e.y += (player.y - e.y) * 0.12;
        e.hit = 0.15;
      }
    }

    floatingText(player.x, player.y - 45, "VOID PULL", "#b28cff", 18);
    screenShake = Math.max(screenShake, 10);
    playSound(260, 0.24, "sawtooth", 0.07);
  }

  if (charId === "OVERLORD") {
    player.rageTimer = 6;
    player.shieldTimer = 6;
    floatingText(player.x, player.y - 45, "BOSS RAGE", "#ff2f88", 18);
    screenShake = Math.max(screenShake, 10);
    playSound(80, 0.3, "sawtooth", 0.09);
  }
}


// =====================================================
// UPDATE LOOP
// =====================================================

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

  if ((keys["shift"] || keys["x"]) && now - player.lastDash > player.dashCooldown) {
    player.lastDash = now;
    player.invincible = 0.25;
    speed *= 5.6;
    burst(player.x, player.y, "#6aa8ff", 30, 360);
    playSound(160, 0.08, "triangle", 0.06);
    screenShake = Math.max(screenShake, 5);
  }

  player.x += (mx / len) * speed * dt;
  player.y += (my / len) * speed * dt;

  player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
  player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

  player.invincible -= dt;

  if (mouse.down || keys[" "]) shoot(now);

  updateBullets(dt);
  updateEnemies(dt);
  updateHazards(dt);
  updateOrbs(dt);
  handleCollisions();
  cleanObjects(dt);

  if (player.damage >= 3) unlockAchievement("glassCannon");

  if (player.hp <= 0) {
    state = "dead";
    playSound(60, 0.4, "sawtooth", 0.08);
    screenShake = 12;

    if (wave > save.bestWave) {
      save.bestWave = wave;
      saveGame();
    }
  }

  if (enemies.length === 0 && state === "playing") {
    handleWaveClear();
  }

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

    if (save.ownedCharacters.indexOf("VOID") === -1) {
      save.ownedCharacters.push("VOID");
    }

    saveGame();
    unlockAchievement("wave25");
    unlockAchievement("voidUnlocked");
    unlockAchievement("ravagerDead");

    alert(
      "WAVE 25 CLEARED!\n\n" +
      "+15 permanent coins!\n" +
      "Secret character unlocked: VOID!\n\n" +
      "The Ravager falls silent... for now."
    );

    resetControls();
    bossClearReward(false);
    return;
  }

  if (wave === 50 && finalStarted) {
    save.chaosUnlocked = true;

    if (save.ownedCharacters.indexOf("OVERLORD") === -1) {
      save.ownedCharacters.push("OVERLORD");
    }

    save.coins += 100;
    saveGame();

    unlockAchievement("finalBoss");
    unlockAchievement("chaos");
    unlockAchievement("overlordUnlocked");

    alert(
      "FINAL BOSS DEFEATED!\n\n" +
      "CHAOS MODE UNLOCKED!\n" +
      "+100 permanent coins!\n" +
      "Secret character unlocked: OVERLORD!"
    );

    resetControls();
    bossClearReward(false);
    return;
  }

  if (wave % 4 === 0 || wave > 50 || save.chaosUnlocked) {
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
    } else {
      e.x += Math.cos(angle) * e.speed * dt * enemyTimeMult;
      e.y += Math.sin(angle) * e.speed * dt * enemyTimeMult;
    }

    e.hit -= dt;

    if (
      distance(e, player) < e.r + player.r &&
      player.invincible <= 0 &&
      player.ghostTimer <= 0
    ) {
      let realDamage = Math.max(2, e.damage - player.armor);

      if (player.shieldTimer > 0 || player.rageTimer > 0) realDamage *= 0.35;

      player.hp -= realDamage * dt;
    }
  }
}


// =====================================================
// BOSS AI
// =====================================================

function updateBoss(e, dt, angle, mult) {
  e.phase = e.hp < e.maxHp * 0.5 ? 2 : 1;

  if (e.bossType === "FINAL") {
    updateFinalBoss(e, dt, angle, mult);
    return;
  }

  if (e.bossType === "RAVAGER_1") {
    updateRavagerDormant(e, dt, angle, mult);
    return;
  }

  if (e.bossType === "RAVAGER_2") {
    updateRavagerAwakened(e, dt, angle, mult);
    return;
  }

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

    const chargerSpeed = wave < 20 ? 1.05 : 1.25;

    e.x += Math.cos(angle) * bossSpeed * chargerSpeed * dt * mult;
    e.y += Math.sin(angle) * bossSpeed * chargerSpeed * dt * mult;
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
      hazards.push({
        type: "line",
        x: e.x,
        y: e.y,
        angle: angle,
        timer: 0,
        warning: 0.75,
        duration: 0.18,
        damage: 28,
        color: "#ffffff",
        width: 20
      });
      playSound(600, 0.08, "triangle", 0.05);
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

  if (e.shootTimer <= 0) {
    e.shootTimer = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = e.spin + (i * Math.PI * 2) / 6;
      createEnemyBullet(e.x, e.y, a, 210, 8, 15, "#5b6478");
    }
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = 4.0;
    createHalfMapHazard(Math.random() < 0.5 ? "left" : "right", "#ff9f43", 0.95, 18);
    floatingText(canvas.width / 2, 120, "MAP ATTACK", "#ff9f43", 24);
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
    e.shootTimer = e.phase === 2 ? 0.85 : 1.1;
    const shots = e.phase === 2 ? 12 : 9;

    for (let i = 0; i < shots; i++) {
      const a = e.spin + (i * Math.PI * 2) / shots;
      createEnemyBullet(e.x, e.y, a, e.phase === 2 ? 280 : 240, 8, 18, "#ff2f88");
    }
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = e.phase === 2 ? 3.2 : 4.2;
    const side = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    createHalfMapHazard(side, "#ff2f88", e.phase === 2 ? 0.75 : 0.95, 24);
    screenShake = Math.max(screenShake, 8);
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = 4.5;
    spawnEnemy("fast");
    spawnEnemy("normal");
  }
}

function updateFinalBoss(e, dt, angle, mult) {
  e.x = canvas.width / 2 + Math.sin(performance.now() / 900) * 120;
  e.y = canvas.height * 0.2 + Math.cos(performance.now() / 1100) * 30;

  e.phase = e.hp < e.maxHp * 0.65 ? 2 : 1;
  if (e.hp < e.maxHp * 0.32) e.phase = 3;

  e.shootTimer -= dt * mult;
  e.specialTimer -= dt * mult;
  e.summonTimer -= dt * mult;
  e.orbTimer -= dt * mult;
  e.halfMapTimer -= dt * mult;

  if (finalDownTimer > 0) {
    finalDownTimer -= dt;
    e.y = canvas.height * 0.45;
    e.downed = true;
    return;
  }

  e.downed = false;

  if (e.shootTimer <= 0) {
    e.shootTimer = e.phase === 3 ? 0.58 : e.phase === 2 ? 0.78 : 1.0;
    const shots = e.phase === 3 ? 18 : e.phase === 2 ? 15 : 12;

    for (let i = 0; i < shots; i++) {
      const a = e.spin + (i * Math.PI * 2) / shots;
      createEnemyBullet(e.x, e.y, a, e.phase === 3 ? 315 : 275, 8, 22, "#ff2f88");
    }

    e.spin += 0.35;
  }

  if (e.halfMapTimer <= 0) {
    e.halfMapTimer = e.phase === 3 ? 2.8 : e.phase === 2 ? 3.8 : 4.8;
    const side = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    createHalfMapHazard(side, "#ff2f88", e.phase === 3 ? 0.55 : 0.75, 38);
    floatingText(canvas.width / 2, 115, "HALF-MAP WIPE", "#ff2f88", 24);
    screenShake = Math.max(screenShake, 10);
  }

  if (e.specialTimer <= 0) {
    e.specialTimer = e.phase === 3 ? 4.0 : 5.5;
    createRingHazard(e.x, e.y, 60, 520, 28, "#ffde59");
  }

  if (e.summonTimer <= 0) {
    e.summonTimer = e.phase === 3 ? 5.0 : 7.0;
    spawnBoss("PAST_BOSS", true, true);
    if (e.phase >= 2) spawnEnemy("tank");
    if (e.phase >= 3) spawnBoss("PAST_BOSS", true, true);
    floatingText(e.x, e.y + 90, "PAST BOSSES RETURN", "#b28cff", 18);
  }

  if (e.orbTimer <= 0) {
    e.orbTimer = e.phase === 3 ? 7.5 : 9.5;
    spawnFinalOrb();
  }
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

function createHalfMapHazard(side, color, warning, damage) {
  hazards.push({
    type: "half",
    side: side,
    timer: 0,
    warning: warning,
    duration: 0.35,
    damage: damage,
    color: color
  });
}

function createRingHazard(x, y, startR, maxR, damage, color) {
  hazards.push({
    type: "ring",
    x: x,
    y: y,
    r: startR,
    maxR: maxR,
    timer: 0,
    warning: 0.2,
    duration: 1.6,
    damage: damage,
    color: color
  });
}

function updateHazards(dt) {
  for (const h of hazards) {
    h.timer += dt;

    if (h.type === "ring") {
      h.r += (h.maxR / h.duration) * dt;

      const d = Math.abs(distance(player, h) - h.r);
      if (d < 12 && h.timer > h.warning && player.invincible <= 0 && player.ghostTimer <= 0) {
        hurtPlayer(h.damage);
        player.invincible = 0.25;
      }
    }

    if (h.type === "half" && h.timer > h.warning && h.timer < h.warning + h.duration) {
      let hit = false;

      if (h.side === "left" && player.x < canvas.width / 2) hit = true;
      if (h.side === "right" && player.x > canvas.width / 2) hit = true;
      if (h.side === "top" && player.y < canvas.height / 2) hit = true;
      if (h.side === "bottom" && player.y > canvas.height / 2) hit = true;

      if (hit && player.invincible <= 0 && player.ghostTimer <= 0) {
        hurtPlayer(h.damage);
        player.invincible = 0.35;
      }
    }

    if (h.type === "line" && h.timer > h.warning && h.timer < h.warning + h.duration) {
      const px = player.x - h.x;
      const py = player.y - h.y;
      const perpendicular = Math.abs(Math.sin(h.angle) * px - Math.cos(h.angle) * py);

      if (perpendicular < h.width && player.invincible <= 0 && player.ghostTimer <= 0) {
        hurtPlayer(h.damage);
        player.invincible = 0.28;
      }
    }
  }

  hazards = hazards.filter(function (h) {
    if (h.type === "ring") return h.timer < h.duration;
    return h.timer < h.warning + h.duration;
  });
}

function updateOrbs(dt) {
  for (const o of orbs) {
    o.timer -= dt;

    if (distance(o, player) < o.r + player.r) {
      o.timer = -1;
      hitFinalBossWithOrb(o);
    }
  }

  orbs = orbs.filter(function (o) {
    return o.timer > 0;
  });
}

function hitFinalBossWithOrb(o) {
  const boss = getFinalBoss();
  if (!boss) return;

  boss.hp -= boss.maxHp * 0.25;
  boss.hit = 0.4;
  finalDownTimer = 4.2;

  burst(boss.x, boss.y, "#7dfcff", 100, 520);
  floatingText(canvas.width / 2, canvas.height / 2, "BOSS DOWNED - ATTACK NOW", "#7dfcff", 32);
  screenShake = 20;
  playSound(80, 0.45, "sawtooth", 0.09);
}

function getFinalBoss() {
  for (const e of enemies) {
    if (e.boss && e.bossType === "FINAL") return e;
  }
  return null;
}

function hurtPlayer(amount) {
  let realDamage = Math.max(2, amount - player.armor);
  if (player.shieldTimer > 0 || player.rageTimer > 0) realDamage *= 0.35;
  player.hp -= realDamage;
  burst(player.x, player.y, "#ff4f9f", 14, 180);
  playSound(80, 0.08, "sawtooth", 0.07);
}


// =====================================================
// COLLISIONS / CLEANUP / REWARDS
// =====================================================

function handleCollisions() {
  for (const b of bullets) {
    if (b.enemyBullet) {
      if (
        distance(b, player) < b.r + player.r &&
        player.invincible <= 0 &&
        player.ghostTimer <= 0
      ) {
        hurtPlayer(b.damage);
        b.life = -1;
        player.invincible = 0.18;
        screenShake = Math.max(screenShake, 7);
      }

      continue;
    }

    for (const e of enemies) {
      if (e.bossType === "FINAL" && !e.downed) {
        if (distance(b, e) < b.r + e.r) {
          e.hp -= b.damage * 0.12;
          b.life = -1;
          burst(b.x, b.y, "#ff2f88", 3, 80);
          break;
        }
      } else if (distance(b, e) < b.r + e.r) {
        e.hp -= b.damage;
        e.hit = 0.08;

        if (b.explosive) {
          burst(b.x, b.y, "#ff9f43", 35, 320);
          screenShake = Math.max(screenShake, 10);

          for (const other of enemies) {
            if (other !== e && distance(b, other) < b.explosionRadius + other.r) {
              other.hp -= b.damage * 0.65;
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
              other.hp -= b.damage * 0.55;
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

  enemies = enemies.filter(function (e) {
    if (e.hp <= 0) {
      burst(
        e.x,
        e.y,
        e.boss ? "#ff2f88" : e.color,
        e.boss ? 80 : 24,
        e.boss ? 460 : 240
      );

      playSound(
        e.boss ? 55 : 110,
        e.boss ? 0.35 : 0.11,
        "sawtooth",
        e.boss ? 0.09 : 0.035
      );

      screenShake = Math.max(screenShake, e.boss ? 14 : 4);

      if (!e.boss) {
        enemiesKilledThisRun++;
        unlockAchievement("firstBlood");
      }

      return false;
    }

    return true;
  });
}

function cleanObjects(dt) {
  bullets = bullets.filter(function (b) {
    return (
      b.life > 0 &&
      b.x > -160 &&
      b.x < canvas.width + 160 &&
      b.y > -160 &&
      b.y < canvas.height + 160
    );
  });

  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt;
  }

  particles = particles.filter(function (p) {
    return p.life > 0;
  });

  for (const f of floatingTexts) {
    f.y -= 42 * dt;
    f.life -= dt;
  }

  floatingTexts = floatingTexts.filter(function (f) {
    return f.life > 0;
  });
}

function chooseWaveBuff() {
  const buffs = [
    { name: "+Damage", color: "#ff5eec", apply: function () { player.damage += 0.16; } },
    { name: "+Speed", color: "#9f7dff", apply: function () { player.speed += 12; } },
    {
      name: "+Max HP",
      color: "#6cff7a",
      apply: function () {
        player.maxHp += 8;
        player.hp = Math.min(player.maxHp, player.hp + 12);
      }
    },
    { name: "+Fire Rate", color: "#7dfcff", apply: function () { player.fireRateBonus += 0.006; } },
    { name: "+Bullet Speed", color: "#ffd36a", apply: function () { player.bulletSpeed += 22; } },
    { name: "+Armor", color: "#ffffff", apply: function () { player.armor += 0.35; } }
  ];

  let choices = [];

  while (choices.length < 3) {
    const b = buffs[Math.floor(Math.random() * buffs.length)];
    if (choices.indexOf(b) === -1) choices.push(b);
  }

  let msg = "WAVE CLEAR!\n\nChoose 1 free run buff:\n\n";

  for (let i = 0; i < choices.length; i++) {
    msg += i + 1 + ". " + choices[i].name + "\n";
  }

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

  bossesKilledThisRun++;
  unlockAchievement("firstBoss");

  if (save.coins >= 50) unlockAchievement("rich");

  floatingText(
    canvas.width / 2,
    canvas.height / 2 + 60,
    "FULL HEAL + COINS",
    "#6cff7a",
    22
  );

  if (showChoice) giveFreeBossUpgrade();

  wave++;
  state = "playing";
  spawnWave();
}

function giveFreeBossUpgrade() {
  state = "reward";

  const locked = Object.keys(weaponData).filter(function (w) {
    return player.weapons.indexOf(w) === -1;
  });

  const choices = [];

  if (locked.length > 0) {
    while (choices.length < Math.min(2, locked.length)) {
      const w = locked[Math.floor(Math.random() * locked.length)];
      if (choices.indexOf(w) === -1) choices.push(w);
    }
  }

  choices.push("RUN DAMAGE");
  choices.push("RUN FIRE RATE");
  choices.push("RUN HEALTH");
  choices.push("RUN SPEED");

  const shown = choices.slice(0, 3);

  let msg =
    "BOSS DEFEATED!\n\n" +
    "Permanent coins earned!\n" +
    "Full HP restored!\n\n" +
    "Choose ONE FREE run upgrade:\n\n";

  for (let i = 0; i < shown.length; i++) {
    msg += i + 1 + ". " + shown[i] + "\n";
  }

  msg += "\nThis upgrade is only for this run.\nType 1, 2, or 3.";

  let pick = prompt(msg);
  resetControls();

  let index = Number(pick) - 1;
  if (index < 0 || index >= shown.length || Number.isNaN(index)) index = 0;

  const reward = shown[index];

  if (weaponData[reward]) {
    player.weapons.push(reward);
    player.weaponIndex = player.weapons.length - 1;

    floatingText(
      canvas.width / 2,
      canvas.height / 2,
      "NEW RUN WEAPON: " + reward,
      weaponData[reward].color,
      30
    );

    if (reward === "RPG") unlockAchievement("rpgFound");

    let ownedAll = true;
    for (const w in weaponData) {
      if (player.weapons.indexOf(w) === -1) ownedAll = false;
    }

    if (ownedAll) unlockAchievement("allWeapons");
  } else if (reward === "RUN DAMAGE") {
    player.damage += 0.8;
    floatingText(canvas.width / 2, canvas.height / 2, "FREE RUN UPGRADE: DAMAGE", "#ff5eec", 28);
  } else if (reward === "RUN FIRE RATE") {
    player.fireRateBonus += 0.02;
    floatingText(canvas.width / 2, canvas.height / 2, "FREE RUN UPGRADE: FIRE RATE", "#7dfcff", 28);
  } else if (reward === "RUN HEALTH") {
    player.maxHp += 35;
    player.hp = player.maxHp;
    floatingText(canvas.width / 2, canvas.height / 2, "FREE RUN UPGRADE: HEALTH", "#6cff7a", 28);
  } else if (reward === "RUN SPEED") {
    player.speed += 45;
    floatingText(canvas.width / 2, canvas.height / 2, "FREE RUN UPGRADE: SPEED", "#9f7dff", 28);
  }

  playSound(740, 0.16, "triangle", 0.07);
}


// =====================================================
// DRAWING HELPERS
// =====================================================

function burst(x, y, color, amount, power) {
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * power + 40;

    particles.push({
      x: x,
      y: y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r: Math.random() * 4 + 2,
      color: color,
      life: 0.5 + Math.random() * 0.45
    });
  }
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

function floatingText(x, y, text, color, size) {
  floatingTexts.push({
    x: x,
    y: y,
    text: text,
    color: color,
    size: size,
    life: 1.35
  });
}

function getBoss() {
  for (const e of enemies) {
    if (e.boss) return e;
  }
  return null;
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


// =====================================================
// DRAW
// =====================================================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  if (screenShake > 0.2) {
    ctx.translate(
      (Math.random() - 0.5) * screenShake,
      (Math.random() - 0.5) * screenShake
    );
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

  bg.addColorStop(0, wave >= 50 ? "#28051f" : "#121a38");
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
  ctx.strokeStyle = "rgba(130,160,255,0.07)";
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
    if (h.type === "half") {
      let active = h.timer > h.warning;

      ctx.globalAlpha = active ? 0.45 : 0.18;
      ctx.fillStyle = h.color;

      if (h.side === "left") ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
      if (h.side === "right") ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
      if (h.side === "top") ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
      if (h.side === "bottom") ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

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
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);
      ctx.globalAlpha = h.timer > h.warning ? 0.75 : 0.28;
      ctx.fillStyle = h.color;
      ctx.fillRect(0, -h.width / 2, canvas.width * 2, h.width);
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

    ctx.shadowBlur = e.boss ? 30 : 15;
    ctx.shadowColor = e.color;
    ctx.fillStyle = e.hit > 0 ? "#ffffff" : e.color;

    if (e.boss) drawBossShape(e);
    else drawEnemyShape(e);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#101421";
    ctx.fillRect(-e.r, -e.r - 14, e.r * 2, 5);

    ctx.fillStyle = e.boss ? "#ff66aa" : "#67ff81";
    ctx.fillRect(
      -e.r,
      -e.r - 14,
      e.r * 2 * Math.max(0, e.hp / e.maxHp),
      5
    );

    ctx.restore();
  }
}

function drawEnemyShape(e) {
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
  if (e.bossType === "FINAL") {
    drawFinalFlowerBoss(0, 0, e.downed ? 0.75 : 1, e.color);
    return;
  }

  if (e.bossType === "RAVAGER_1") {
    drawRavagerCorpse(0, 0, 0.9);
    return;
  }

  if (e.bossType === "RAVAGER_2") {
    drawRavagerAwakenedShape(0, 0, e.r, e.color);
    return;
  }

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

  if (e.bossType === "SUMMONER") {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = e.spin + (i * Math.PI * 2) / 4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * e.r * 1.25, Math.sin(a) * e.r * 1.25, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (e.bossType === "PULSER") {
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 1.25 + Math.sin(performance.now() / 120) * 8, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  ctx.rotate(e.spin);
  ctx.beginPath();
  const points = e.phase === 2 ? 14 : 10;
  for (let i = 0; i < points; i++) {
    const a = (i * Math.PI * 2) / points;
    const r = i % 2 === 0 ? e.r : e.r * 0.55;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
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

function drawFinalFlowerBoss(x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const t = performance.now() / 700;

  ctx.fillStyle = color;
  ctx.shadowBlur = 35;
  ctx.shadowColor = color;

  for (let i = 0; i < 10; i++) {
    const a = t + (i * Math.PI * 2) / 10;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -85, 28, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#200014";
  ctx.beginPath();
  ctx.arc(0, 0, 66, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffde59";
  for (let i = 0; i < 5; i++) {
    const a = t * 1.5 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 28, Math.sin(a) * 28, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawPlayer() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const weaponName = getCurrentWeapon();
  const weaponColor = weaponData[weaponName].color;
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

  ctx.textAlign = "left";
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";

  ctx.fillText("Wave: " + wave + (wave > 50 || save.chaosUnlocked ? " CHAOS" : ""), 14, 25);
  ctx.fillText("Character: " + char.name, 14, 47);
  ctx.fillText("HP: " + Math.ceil(player.hp) + " / " + player.maxHp, 14, 69);
  ctx.fillText(
    "Weapon: " + weaponName + " (" + (player.weaponIndex + 1) + "/" + player.weapons.length + ")",
    14,
    91
  );
  ctx.fillText("Damage: " + player.damage.toFixed(2), 14, 113);
  ctx.fillText("Permanent Coins: " + save.coins, 14, 135);

  ctx.fillStyle = "#101421";
  ctx.fillRect(14, 150, 230, 16);

  ctx.fillStyle = "#57ff85";
  ctx.fillRect(14, 150, 230 * Math.max(0, player.hp / player.maxHp), 16);

  ctx.strokeStyle = "white";
  ctx.strokeRect(14, 150, 230, 16);

  const dashReady = Date.now() / 1000 - player.lastDash > player.dashCooldown;
  ctx.fillStyle = dashReady ? "#7dfcff" : "#37466f";
  ctx.fillText("Dash: " + (dashReady ? "READY" : "COOLDOWN"), 14, 188);

  ctx.fillStyle = abilityReady ? "#ffde59" : "#6b7280";
  ctx.fillText("Ability [1]: " + (abilityReady ? "READY" : "COOLDOWN"), 14, 210);

  ctx.fillStyle = save.evolutionUnlocked ? "#ffde59" : "#6b7280";
  ctx.font = "13px Arial";
  ctx.fillText("Weapon Evolution: " + (save.evolutionUnlocked ? "ON" : "LOCKED"), 14, 232);
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
  ctx.shadowColor = "#ff3b93";
  ctx.fillText(bossNames[boss.bossType] || "BOSS", canvas.width / 2, y - 5);
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
    ctx.fillText("Final boss takes heavy damage only when downed by an orb", canvas.width / 2, y + 43);
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

function drawMenu() {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const unlocked = Object.keys(save.achievements).length;
  const total = Object.keys(achievementList).length;
  const char = characterData[save.selectedCharacter] || characterData.CORE;

  ctx.textAlign = "center";
  ctx.shadowBlur = 22;
  ctx.shadowColor = "#7dfcff";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.fillText("NEON BOSS SHOOTER", canvas.width / 2, canvas.height / 2 - 230);

  ctx.shadowBlur = 0;
  ctx.font = "20px Arial";
  ctx.fillStyle = "#cfe7ff";
  ctx.fillText("Public Edition • Wave 25 Ravager • Wave 50 Final Boss", canvas.width / 2, canvas.height / 2 - 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Press ENTER to start", canvas.width / 2, canvas.height / 2 - 115);
  ctx.fillText("Press M for upgrade shop", canvas.width / 2, canvas.height / 2 - 80);
  ctx.fillText("Press C for character shop", canvas.width / 2, canvas.height / 2 - 45);
  ctx.fillText("Press A for achievements", canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "16px Arial";
  ctx.fillStyle = "#b9c8ff";
  ctx.fillText("Selected Character: " + char.name + " — Starts with " + char.startWeapon, canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillText("Passive: " + char.passive, canvas.width / 2, canvas.height / 2 + 66);
  ctx.fillText("Ability: " + char.manual, canvas.width / 2, canvas.height / 2 + 92);
  ctx.fillText("Permanent Coins: " + save.coins + " | Best Wave: " + save.bestWave, canvas.width / 2, canvas.height / 2 + 122);
  ctx.fillText(
    "Damage " +
      save.upgrades.damage +
      " | Fire Rate " +
      save.upgrades.fireRate +
      " | Health " +
      save.upgrades.health +
      " | Speed " +
      save.upgrades.speed,
    canvas.width / 2,
    canvas.height / 2 + 150
  );
  ctx.fillText("Achievements: " + unlocked + " / " + total, canvas.width / 2, canvas.height / 2 + 178);
  ctx.fillText("Wave 10: Evolutions • Wave 25: Void • Wave 50: Overlord + Chaos", canvas.width / 2, canvas.height / 2 + 206);
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
  ctx.fillText("Permanent Coins: " + save.coins, canvas.width / 2, canvas.height / 2 + 40);

  ctx.font = "bold 24px Arial";
  ctx.fillText("Press ENTER to restart", canvas.width / 2, canvas.height / 2 + 95);
}


// =====================================================
// MAIN LOOP
// =====================================================

function loop(t) {
  const now = t / 1000;
  const dt = Math.min(0.033, now - lastTime || 0);
  lastTime = now;

  if (state === "playing") update(dt, now);
  else if (state === "bossWarning") updateBossWarning(dt);
  else if (state === "cutscene") {
    updateStars(dt);
    updateCutscene(dt);
  } else {
    updateStars(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
