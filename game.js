(() => {
  "use strict";

  // =====================================================
  // HEDGEHOG HOLLOW - CLEAN BUILD
  // Part 1/3: engine, input, physics, combat, EXP, level data
  // =====================================================

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const objectiveEl = document.getElementById("objective");
  const storyEl = document.getElementById("story") || document.getElementById("storyText");
  const helpEl = document.getElementById("help");

  if (helpEl) {
    helpEl.textContent =
      "A/D or Arrows = Move • W/Space/Up = Jump • E = Talk/Pick Up • J/Left Click = Attack";
  }

  let W = innerWidth;
  let H = innerHeight;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  addEventListener("resize", resize);
  resize();

  function setObjective(text) {
    if (objectiveEl) objectiveEl.textContent = "Objective: " + text;
  }

  function setStory(text) {
    if (storyEl) storyEl.textContent = text || "";
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function approach(v, target, amount) {
    if (v < target) return Math.min(v + amount, target);
    if (v > target) return Math.max(v - amount, target);
    return target;
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
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

  const world = {
    width: 5600,
    height: 1750,
    gravity: 2200
  };

  const camera = {
    x: 0,
    y: 0,
    lookX: 0,
    lookY: 0
  };

  const keys = Object.create(null);

  const player = {
    x: 240,
    y: 1280,
    w: 60,
    h: 45,

    vx: 0,
    vy: 0,

    speed: 385,
    accel: 3600,
    friction: 3300,
    airAccel: 2400,
    airFriction: 760,

    jumpPower: 830,
    maxFall: 1500,

    facing: 1,
    onGround: false,
    wasOnGround: false,

    coyote: 0,
    jumpBuffer: 0,

    anim: 0,
    squash: 0,

    hp: 3,
    maxHp: 3,
    invincible: 0,

    hasStick: false,
    attackTimer: 0,
    attackCooldown: 0,
    attackHitDone: false,

    exp: 0,
    level: 1,
    expToNext: 20
  };

  const spawnPoint = {
    x: 240,
    y: 1280
  };

  const platforms = [
    { x: -200, y: 1370, w: 1500, h: 180 },

    { x: 1320, y: 1300, w: 460, h: 120 },
    { x: 1840, y: 1215, w: 430, h: 110 },
    { x: 2350, y: 1125, w: 460, h: 110 },
    { x: 2920, y: 1025, w: 470, h: 115 },
    { x: 3500, y: 925, w: 440, h: 115 },
    { x: 4050, y: 820, w: 490, h: 120 },
    { x: 4650, y: 700, w: 620, h: 130 },

    // safer little helper ledges
    { x: 1580, y: 1155, w: 170, h: 45 },
    { x: 2140, y: 1080, w: 170, h: 45 },
    { x: 3230, y: 970, w: 170, h: 45 }
  ];

  // IMPORTANT:
  // Spikes are static world objects. They do not use velocity.
  // They are drawn exactly where their hitbox is.
  const spikes = [
    { x: 1425, y: 1266, w: 95, h: 34 },
    { x: 2515, y: 1091, w: 110, h: 34 },
    { x: 3710, y: 891, w: 120, h: 34 },
    { x: 4870, y: 666, w: 145, h: 34 }
  ];

  const checkpoints = [
    { x: 1260, y: 1290, id: "Lower Path", active: false },
    { x: 3300, y: 920, id: "Mossy Root", active: false }
  ];

  const stickPickup = {
    x: 1545,
    y: 1125,
    taken: false
  };

  const elder = {
    x: 620,
    y: 1360
  };

  const enemies = [
    {
      type: "beetle",
      x: 2020,
      y: 1180,
      w: 52,
      h: 34,
      vx: 70,
      minX: 1890,
      maxX: 2200,
      hp: 2,
      maxHp: 2,
      exp: 8,
      alive: true,
      hitTimer: 0
    },
    {
      type: "porcupineScout",
      x: 3050,
      y: 990,
      w: 62,
      h: 42,
      vx: 85,
      minX: 2940,
      maxX: 3340,
      hp: 3,
      maxHp: 3,
      exp: 12,
      alive: true,
      hitTimer: 0
    },
    {
      type: "beetle",
      x: 4240,
      y: 780,
      w: 52,
      h: 34,
      vx: 80,
      minX: 4100,
      maxX: 4490,
      hp: 2,
      maxHp: 2,
      exp: 8,
      alive: true,
      hitTimer: 0
    }
  ];

  const particles = [];
  const floatingTexts = [];

  let elderTalked = false;
  let leftVillage = false;
  let scene2Started = false;
  let scene3Started = false;
  let sceneComplete = false;

  let dialogueActive = true;
  let dialogueSpeaker = "Narrator";
  let dialogueLines = [
    "Far below Thornback Mountain, Hedgehog Hollow wakes under the morning sky.",
    "Then the mountain shakes.",
    "A dark porcupine shadow appears at the peak.",
    "The elder calls for Sprig, the smallest hedgehog in the village."
  ];
  let dialogueIndex = 0;
  let dialogueAfter = null;

  function startDialogue(speaker, lines, after) {
    dialogueActive = true;
    dialogueSpeaker = speaker;
    dialogueLines = lines.slice();
    dialogueIndex = 0;
    dialogueAfter = after || null;
    setStory("");
  }

  function advanceDialogue() {
    if (!dialogueActive) return;

    dialogueIndex++;

    if (dialogueIndex >= dialogueLines.length) {
      dialogueActive = false;
      const after = dialogueAfter;
      dialogueAfter = null;
      if (after) after();
    }
  }

  function resetPlayer(reason) {
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
    player.squash = 0.18;
    player.invincible = 1.0;

    if (reason) setStory(reason);
    spawnDust(player.x, player.y + 4, 18, "#ead89a");
  }

  function damagePlayer(reason) {
    if (player.invincible > 0) return;

    player.hp--;
    player.invincible = 1.2;
    player.squash = 0.16;
    spawnDust(player.x, player.y + 4, 18, "#ffb0b0");

    if (player.hp <= 0) {
      player.hp = player.maxHp;
      resetPlayer(reason || "Sprig tumbles back to the last safe burrow.");
    } else if (reason) {
      setStory(reason);
    }
  }

  function addExp(amount, x, y) {
    player.exp += amount;
    floatingText(x, y, "+" + amount + " EXP", "#fff4a8");

    while (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      player.level++;
      player.expToNext = Math.floor(player.expToNext * 1.45 + 10);

      if (player.level % 2 === 0) {
        player.maxHp++;
        player.hp = player.maxHp;
        floatingText(player.x, player.y - 70, "LEVEL UP! Max HP +1", "#9dff9d");
      } else {
        player.speed += 15;
        floatingText(player.x, player.y - 70, "LEVEL UP! Speed +", "#9dff9d");
      }
    }
  }

  function floatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.2,
      vy: -42
    });
  }

  function spawnDust(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 45,
        y: y + Math.random() * 8,
        vx: (Math.random() - 0.5) * 175,
        vy: -40 - Math.random() * 120,
        r: 3 + Math.random() * 6,
        life: 0.35 + Math.random() * 0.25,
        max: 0.6,
        color: color || "#ead89a"
      });
    }
  }

  function spawnSlashParticles(x, y, facing) {
    for (let i = 0; i < 13; i++) {
      particles.push({
        x: x + facing * (28 + Math.random() * 38),
        y: y - 34 + (Math.random() - 0.5) * 40,
        vx: facing * (120 + Math.random() * 170),
        vy: -80 + Math.random() * 160,
        r: 3 + Math.random() * 5,
        life: 0.18 + Math.random() * 0.2,
        max: 0.38,
        color: "#ffe58a"
      });
    }
  }

  function getPlayerBox() {
    return {
      x: player.x - player.w / 2,
      y: player.y - player.h,
      w: player.w,
      h: player.h
    };
  }

  function getAttackBox() {
    const range = player.level >= 3 ? 92 : 78;

    return {
      x: player.facing > 0 ? player.x + 20 : player.x - range - 20,
      y: player.y - 70,
      w: range,
      h: 70
    };
  }

  function startAttack() {
    if (!player.hasStick) {
      setStory("Sprig needs something to defend himself with.");
      return;
    }

    if (player.attackCooldown > 0 || player.attackTimer > 0 || dialogueActive) return;

    player.attackTimer = 0.22;
    player.attackCooldown = 0.34;
    player.attackHitDone = false;

    spawnSlashParticles(player.x, player.y, player.facing);
  }

  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;

    if (dialogueActive && (k === "e" || e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      advanceDialogue();
      return;
    }

    if (k === "e") {
      handleInteract();
    }

    if (k === "j") {
      startAttack();
    }

    if (e.key === " " || e.key === "ArrowUp" || k === "w") {
      e.preventDefault();
      player.jumpBuffer = 0.14;
    }
  });

  addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  addEventListener("mousedown", (e) => {
    if (e.button === 0) startAttack();
  });

  function handleInteract() {
    if (dialogueActive) return;

    const elderDistance = Math.hypot(player.x - elder.x, player.y - elder.y);

    if (elderDistance < 150) {
      if (!elderTalked) {
        startDialogue("Elder Quillby", [
          "Sprig, you felt the mountain shake too, didn't you?",
          "That shadow is Thornback, the Dark Porcupine.",
          "His thorns are crawling down the mountain again.",
          "The big hedgehogs cannot fit through the old root paths.",
          "But you are small, quick, and braver than you know.",
          "Climb the mountain. Save Hedgehog Hollow."
        ], () => {
          elderTalked = true;
          setObjective("Begin climbing toward Thornback Mountain");
          setStory("The village watches as Sprig takes the first step upward.");
        });
      } else {
        startDialogue("Elder Quillby", [
          "The path begins to the right, little one.",
          "Find the fallen branch before facing Thornback's scouts.",
          "A brave hedgehog still needs a good stick."
        ]);
      }

      return;
    }

    const stickDistance = Math.hypot(player.x - stickPickup.x, player.y - stickPickup.y);

    if (!stickPickup.taken && stickDistance < 90) {
      stickPickup.taken = true;
      player.hasStick = true;
      setObjective("Defeat the thorn beetles and climb higher");
      setStory("Sprig found a sturdy stick! Press J or left click to attack.");
      floatingText(player.x, player.y - 70, "STICK GET!", "#fff4a8");
      return;
    }
  }

  function moveAndCollideX(dt) {
    player.x += player.vx * dt;

    const box = getPlayerBox();

    for (const p of platforms) {
      if (!rectsOverlap(box, p)) continue;

      if (player.vx > 0) player.x = p.x - player.w / 2;
      if (player.vx < 0) player.x = p.x + p.w + player.w / 2;

      player.vx = 0;
      break;
    }
  }

  function moveAndCollideY(dt) {
    player.y += player.vy * dt;
    player.onGround = false;

    const box = getPlayerBox();

    for (const p of platforms) {
      if (!rectsOverlap(box, p)) continue;

      if (player.vy > 0) {
        player.y = p.y;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = p.y + p.h + player.h;
        player.vy = 0;
      }

      break;
    }
  }
    function updatePlayer(dt) {
    player.wasOnGround = player.onGround;

    let input = 0;

    if (!dialogueActive) {
      if (keys.a || keys.arrowleft) input -= 1;
      if (keys.d || keys.arrowright) input += 1;
    }

    if (input !== 0) {
      const accel = player.onGround ? player.accel : player.airAccel;
      player.vx = approach(player.vx, input * player.speed, accel * dt);
      player.facing = input;
    } else {
      const friction = player.onGround ? player.friction : player.airFriction;
      player.vx = approach(player.vx, 0, friction * dt);
    }

    if (player.onGround) {
      player.coyote = 0.13;
    } else {
      player.coyote -= dt;
    }

    if (player.jumpBuffer > 0) {
      player.jumpBuffer -= dt;
    }

    if (!dialogueActive && player.jumpBuffer > 0 && player.coyote > 0) {
      player.vy = -player.jumpPower;
      player.jumpBuffer = 0;
      player.coyote = 0;
      player.onGround = false;
      player.squash = 0.14;
      spawnDust(player.x, player.y + 4, 12, "#fff0b0");
    }

    const jumpHeld = keys[" "] || keys.w || keys.arrowup;

    let gravity = world.gravity;

    if (player.vy < 0 && !jumpHeld) gravity *= 1.7;
    if (player.vy > 0) gravity *= 1.05;

    player.vy += gravity * dt;
    player.vy = clamp(player.vy, -1300, player.maxFall);

    moveAndCollideX(dt);

    const fallBefore = player.vy;
    moveAndCollideY(dt);

    if (!player.wasOnGround && player.onGround && fallBefore > 350) {
      player.squash = 0.16;
      spawnDust(player.x, player.y + 4, fallBefore > 850 ? 18 : 10, "#ead89a");
    }

    player.x = clamp(player.x, 20, world.width - 20);

    if (player.y > world.height + 250) {
      damagePlayer("Sprig tumbles back to the last safe burrow.");
    }

    player.invincible = Math.max(0, player.invincible - dt);
    player.squash = Math.max(0, player.squash - dt);
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.anim += dt;
  }

  function updateEnemies(dt) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      enemy.hitTimer = Math.max(0, enemy.hitTimer - dt);

      enemy.x += enemy.vx * dt;

      if (enemy.x < enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.vx);
      }

      if (enemy.x > enemy.maxX) {
        enemy.x = enemy.maxX;
        enemy.vx = -Math.abs(enemy.vx);
      }

      // Simple gravity for enemies so they stay on nearby platforms.
      enemy.y += 900 * dt;

      for (const p of platforms) {
        const box = {
          x: enemy.x - enemy.w / 2,
          y: enemy.y - enemy.h,
          w: enemy.w,
          h: enemy.h
        };

        if (rectsOverlap(box, p) && enemy.y <= p.y + 70) {
          enemy.y = p.y;
          break;
        }
      }

      const playerBox = getPlayerBox();
      const enemyBox = {
        x: enemy.x - enemy.w / 2,
        y: enemy.y - enemy.h,
        w: enemy.w,
        h: enemy.h
      };

      if (rectsOverlap(playerBox, enemyBox)) {
        damagePlayer("Ouch! Thornback's creatures are dangerous.");
        player.vx = enemy.x < player.x ? 260 : -260;
        player.vy = -360;
      }
    }
  }

  function updateCombat() {
    if (!player.hasStick) return;
    if (player.attackTimer <= 0) return;
    if (player.attackHitDone) return;

    // Hit in the middle of the swing, not instantly.
    if (player.attackTimer > 0.13) return;

    const attackBox = getAttackBox();

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const enemyBox = {
        x: enemy.x - enemy.w / 2,
        y: enemy.y - enemy.h,
        w: enemy.w,
        h: enemy.h
      };

      if (!rectsOverlap(attackBox, enemyBox)) continue;

      enemy.hp--;
      enemy.hitTimer = 0.18;
      enemy.vx += player.facing * 95;

      floatingText(enemy.x, enemy.y - 45, "-1", "#ffffff");
      spawnDust(enemy.x, enemy.y - enemy.h / 2, 10, "#ffe58a");

      if (enemy.hp <= 0) {
        enemy.alive = false;
        addExp(enemy.exp, enemy.x, enemy.y - 40);
        spawnDust(enemy.x, enemy.y - enemy.h / 2, 22, "#fff0b0");
      }
    }

    player.attackHitDone = true;
  }

  function updateHazards() {
    const box = getPlayerBox();

    for (const s of spikes) {
      if (rectsOverlap(box, s)) {
        damagePlayer("The purple thorns sting! Sprig is sent back.");
        return;
      }
    }
  }

  function updateCheckpoints() {
    for (const cp of checkpoints) {
      const d = Math.hypot(player.x - cp.x, player.y - cp.y);

      if (d < 80 && !cp.active) {
        for (const other of checkpoints) other.active = false;
        cp.active = true;

        spawnPoint.x = cp.x;
        spawnPoint.y = cp.y;
        setStory("Checkpoint reached: " + cp.id);
        floatingText(cp.x, cp.y - 80, "CHECKPOINT", "#fff4a8");
      }
    }
  }

  function updateStoryTriggers() {
    if (!elderTalked) return;

    if (!leftVillage && player.x > 1260) {
      leftVillage = true;
      scene2Started = true;
      setObjective("Find a stick on the lower mountain path");
      setStory("The village is far below now. Thornback Mountain waits above.");
    }

    if (!scene3Started && player.x > 3300) {
      scene3Started = true;
      setObjective("Climb through Mossy Root Rise");
      setStory("The path grows steeper. Thornback's scouts are watching.");
    }

    if (!sceneComplete && player.x > 5050) {
      sceneComplete = true;
      setObjective("Scene complete");
      setStory("Sprig reaches the Moss Gate. Beyond it, the first porcupine boss waits.");
      startDialogue("Narrator", [
        "Sprig looks back. Hedgehog Hollow is tiny below the clouds.",
        "His stick is scratched. His paws are dusty.",
        "Ahead, something rolls in the dark.",
        "The first of Thornback's commanders is close."
      ]);
    }
  }

  function updateStickPrompt() {
    if (stickPickup.taken || dialogueActive) return;

    const d = Math.hypot(player.x - stickPickup.x, player.y - stickPickup.y);

    if (d < 90) {
      setStory("Press E to pick up the sturdy stick.");
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 620 * dt;
      p.vx *= Math.pow(0.08, dt);

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const f = floatingTexts[i];

      f.life -= dt;
      f.y += f.vy * dt;

      if (f.life <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  function updateCamera(dt) {
    camera.lookX = lerp(
      camera.lookX,
      clamp(player.vx * 0.22, -125, 125),
      1 - Math.pow(0.00008, dt)
    );

    camera.lookY = lerp(
      camera.lookY,
      clamp(player.vy * 0.055, -70, 90),
      1 - Math.pow(0.00008, dt)
    );

    const targetX = clamp(player.x + camera.lookX - W * 0.42, 0, world.width - W);
    const targetY = clamp(player.y + camera.lookY - H * 0.60, 0, world.height - H);

    camera.x = lerp(camera.x, targetX, 1 - Math.pow(0.00005, dt));
    camera.y = lerp(camera.y, targetY, 1 - Math.pow(0.00005, dt));
  }

  // =====================================================
  // DRAWING: BACKGROUND / WORLD
  // =====================================================

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8fd8ff");
    g.addColorStop(0.52, "#bdeeff");
    g.addColorStop(1, "#f6d6a6");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const sx = W * 0.78;
    const sy = H * 0.18;

    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, 185);
    sun.addColorStop(0, "rgba(255,245,180,0.85)");
    sun.addColorStop(1, "rgba(255,245,180,0)");

    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(sx, sy, 185, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawClouds() {
    ctx.save();
    ctx.translate(-camera.x * 0.07, 0);

    ctx.fillStyle = "rgba(255,255,255,0.48)";

    for (let i = 0; i < 9; i++) {
      const x = 140 + i * 720;
      const y = 110 + (i % 3) * 55;

      ctx.beginPath();
      ctx.ellipse(x, y, 120, 32, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 75, y + 5, 105, 26, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 70, y + 8, 85, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawMountains() {
    ctx.save();
    ctx.translate(-camera.x * 0.1, -camera.y * 0.06);

    ctx.fillStyle = "#88c79c";
    ctx.beginPath();
    ctx.moveTo(-500, 1100);
    ctx.bezierCurveTo(400, 650, 900, 900, 1500, 620);
    ctx.bezierCurveTo(2300, 300, 3000, 720, 3700, 440);
    ctx.bezierCurveTo(4550, 90, 5200, 620, 6400, 330);
    ctx.lineTo(6400, 1900);
    ctx.lineTo(-500, 1900);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#668994";
    ctx.beginPath();
    ctx.moveTo(1900, 1650);
    ctx.lineTo(4050, 35);
    ctx.lineTo(6100, 1650);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(45,70,88,0.45)";
    ctx.beginPath();
    ctx.moveTo(4050, 35);
    ctx.lineTo(6100, 1650);
    ctx.lineTo(4380, 1650);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#eaffff";
    ctx.beginPath();
    ctx.moveTo(4050, 35);
    ctx.lineTo(3670, 390);
    ctx.lineTo(3865, 310);
    ctx.lineTo(4040, 470);
    ctx.lineTo(4230, 315);
    ctx.lineTo(4450, 410);
    ctx.closePath();
    ctx.fill();

    // Thornback silhouette at peak.
    ctx.save();
    ctx.translate(4050, 100);

    ctx.fillStyle = "#21122d";

    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18 - 10, -5);
      ctx.lineTo(i * 18 + 2, -82 - Math.abs(i) * 4);
      ctx.lineTo(i * 18 + 16, -5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.ellipse(0, 24, 80, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff5b68";
    ctx.beginPath();
    ctx.arc(-24, 10, 5, 0, Math.PI * 2);
    ctx.arc(24, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // Midground hill layer.
    ctx.save();
    ctx.translate(-camera.x * 0.25, -camera.y * 0.12);

    ctx.fillStyle = "#5fa96e";
    ctx.beginPath();
    ctx.moveTo(-400, 1230);
    ctx.bezierCurveTo(450, 920, 900, 1170, 1620, 900);
    ctx.bezierCurveTo(2450, 600, 3200, 1100, 4100, 760);
    ctx.bezierCurveTo(4850, 450, 5550, 880, 6400, 690);
    ctx.lineTo(6400, 1900);
    ctx.lineTo(-400, 1900);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawPlatform(p) {
    const x = p.x - camera.x;
    const y = p.y - camera.y;

    ctx.fillStyle = "#6d4b2e";
    roundRect(x, y, p.w, p.h, 24);
    ctx.fill();

    ctx.fillStyle = "#51a95a";
    roundRect(x, y - 8, p.w, 26, 16);
    ctx.fill();

    ctx.strokeStyle = "#82d96f";
    ctx.lineWidth = 2;

    for (let i = 0; i < p.w; i += 24) {
      ctx.beginPath();
      ctx.moveTo(x + i + 10, y - 6);
      ctx.lineTo(x + i + 16, y - 18 - ((i / 24) % 3) * 2);
      ctx.stroke();
    }
  }

  function drawSpikes() {
    for (const s of spikes) {
      const x = s.x - camera.x;
      const y = s.y - camera.y;

      // Draw exactly inside hitbox.
      ctx.fillStyle = "#5721a8";
      ctx.strokeStyle = "#d7a7ff";
      ctx.lineWidth = 2;

      const count = Math.max(3, Math.floor(s.w / 22));
      const step = s.w / count;

      for (let i = 0; i < count; i++) {
        const px = x + i * step;

        ctx.beginPath();
        ctx.moveTo(px, y + s.h);
        ctx.lineTo(px + step / 2, y);
        ctx.lineTo(px + step, y + s.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#d7a7ff";
      ctx.fillRect(x, y, s.w, s.h);
      ctx.restore();
    }
  }

  function drawCheckpoint(cp) {
    const x = cp.x - camera.x;
    const y = cp.y - camera.y;

    ctx.save();

    ctx.strokeStyle = "#6a4328";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 70);
    ctx.stroke();

    ctx.fillStyle = cp.active ? "#fff4a8" : "#b9f7ff";
    ctx.beginPath();
    ctx.moveTo(x, y - 70);
    ctx.lineTo(x + 58, y - 55);
    ctx.lineTo(x, y - 38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(cp.id, x + 26, y + 18);

    ctx.restore();
  }

  function drawStickPickup() {
    if (stickPickup.taken) return;

    const x = stickPickup.x - camera.x;
    const y = stickPickup.y - camera.y;

    ctx.save();
    ctx.translate(x, y + Math.sin(performance.now() * 0.004) * 3);

    ctx.strokeStyle = "#6a4328";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.quadraticCurveTo(-4, -14, 32, -4);
    ctx.stroke();

    ctx.fillStyle = "#fff4a8";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("STICK", 0, -24);

    ctx.restore();
  }
    // =====================================================
  // DRAWING: VILLAGE / NPCS
  // =====================================================

  function drawBurrow(x, y, label, color) {
    ctx.save();

    const g = ctx.createLinearGradient(x, y - 70, x, y + 90);
    g.addColorStop(0, "#6dc66b");
    g.addColorStop(1, "#4f9d54");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 150, y + 55);
    ctx.bezierCurveTo(x - 120, y - 45, x - 35, y - 78, x + 25, y - 62);
    ctx.bezierCurveTo(x + 105, y - 43, x + 145, y + 10, x + 155, y + 58);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#7b5434";
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 58, 68, 0, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = "#24160f";
    ctx.beginPath();
    ctx.ellipse(x, y + 33, 41, 52, 0, Math.PI, 0, false);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y + 33, 41, 52, 0, Math.PI, 0, false);
    ctx.stroke();

    ctx.fillStyle = "#8b5d37";
    roundRect(x - 44, y + 84, 88, 27, 8);
    ctx.fill();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 102);

    ctx.restore();
  }

  function drawTinyHedgehog(x, y, facing, color, name) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, 10, 25, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#2c1b14";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-10, 8);
    ctx.moveTo(8, -4);
    ctx.lineTo(10, 8);
    ctx.stroke();

    ctx.fillStyle = "#3d281f";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 8 - 5, -26);
      ctx.quadraticCurveTo(i * 8, -42, i * 8 + 6, -26);
      ctx.closePath();
      ctx.fill();
    }

    const g = ctx.createLinearGradient(0, -40, 0, 8);
    g.addColorStop(0, color);
    g.addColorStop(1, "#f0ae72");

    ctx.fillStyle = "#342118";
    ctx.beginPath();
    ctx.moveTo(-30, -4);
    ctx.quadraticCurveTo(-25, -40, 2, -43);
    ctx.quadraticCurveTo(30, -40, 40, -8);
    ctx.quadraticCurveTo(18, 12, -30, -4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-26, -5);
    ctx.quadraticCurveTo(-22, -35, 2, -38);
    ctx.quadraticCurveTo(26, -36, 35, -9);
    ctx.quadraticCurveTo(15, 8, -26, -5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffd0a0";
    ctx.beginPath();
    ctx.moveTo(22, -28);
    ctx.quadraticCurveTo(48, -23, 55, -14);
    ctx.quadraticCurveTo(45, -5, 23, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(25, -25, 3, 0, Math.PI * 2);
    ctx.arc(55, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "rgba(40,30,20,0.45)";
    roundRect(x - 34, y + 20, 68, 22, 9);
    ctx.fill();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y + 35);
  }

  function drawTreeHall(x, y) {
    ctx.save();

    ctx.fillStyle = "#5a341e";
    ctx.beginPath();
    ctx.ellipse(x - 60, y + 55, 90, 28, -0.15, 0, Math.PI * 2);
    ctx.ellipse(x + 58, y + 55, 90, 28, 0.15, 0, Math.PI * 2);
    ctx.fill();

    const trunk = ctx.createLinearGradient(x - 80, y - 230, x + 80, y + 95);
    trunk.addColorStop(0, "#865535");
    trunk.addColorStop(1, "#5a341e");

    ctx.fillStyle = trunk;
    roundRect(x - 82, y - 225, 164, 310, 58);
    ctx.fill();

    ctx.fillStyle = "#4c9c55";
    ctx.beginPath();
    ctx.arc(x - 112, y - 225, 92, 0, Math.PI * 2);
    ctx.arc(x - 22, y - 292, 125, 0, Math.PI * 2);
    ctx.arc(x + 98, y - 230, 100, 0, Math.PI * 2);
    ctx.arc(x + 35, y - 165, 120, 0, Math.PI * 2);
    ctx.arc(x - 92, y - 145, 83, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#60b965";
    ctx.beginPath();
    ctx.arc(x - 48, y - 270, 70, 0, Math.PI * 2);
    ctx.arc(x + 70, y - 205, 62, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#261811";
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 43, 68, 0, Math.PI, 0, false);
    ctx.fill();

    ctx.strokeStyle = "#e2b46c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 43, 68, 0, Math.PI, 0, false);
    ctx.stroke();

    ctx.fillStyle = "#ffe879";
    ctx.beginPath();
    ctx.arc(x - 38, y - 105, 12, 0, Math.PI * 2);
    ctx.arc(x + 42, y - 130, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8b5d37";
    roundRect(x - 70, y + 96, 140, 34, 9);
    ctx.fill();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TREE TOWN HALL", x, y + 119);

    ctx.restore();
  }

  function drawVillage() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.ellipse(560, 1348, 640, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawBurrow(140, 1320, "MIMI", "#ff9fb7");
    drawBurrow(830, 1334, "SHOP", "#ffd66b");
    drawBurrow(1035, 1338, "ELDER", "#9bdcff");
    drawTreeHall(520, 1368);

    ctx.strokeStyle = "#7d4b2b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(285, 1280);
    ctx.lineTo(285, 1352);
    ctx.moveTo(920, 1280);
    ctx.lineTo(920, 1352);
    ctx.stroke();

    ctx.strokeStyle = "#fff4a8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(285, 1288);
    ctx.quadraticCurveTo(600, 1222, 920, 1288);
    ctx.stroke();

    const colors = ["#ff8585", "#ffe778", "#8be77a", "#8bd9ff", "#c99bff"];
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const fx = 345 + i * 55;
      const fy = 1273 - Math.sin(i * 0.7) * 18;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 30, fy - 4);
      ctx.lineTo(fx + 15, fy + 29);
      ctx.closePath();
      ctx.fill();
    }

    drawTinyHedgehog(310, 1360, 1, "#b8764d", "Peb");
    drawTinyHedgehog(735, 1357, -1, "#a66dd8", "Mimi");
    drawTinyHedgehog(960, 1364, -1, "#c58c54", "Boro");
    drawTinyHedgehog(elder.x, elder.y, -1, "#d6a86a", "Quillby");

    ctx.restore();
  }

  // =====================================================
  // DRAWING: PLAYER / ENEMIES / EFFECTS
  // =====================================================

  function drawHedgehog() {
    const x = player.x - camera.x;
    const y = player.y - camera.y;

    const speed = Math.abs(player.vx);
    const moving = speed > 25;
    const airborne = !player.onGround;
    const t = player.anim;
    const walk = t * 13;

    const leg1 = moving && player.onGround ? Math.sin(walk) : 0;
    const leg2 = moving && player.onGround ? Math.sin(walk + Math.PI) : 0;

    const bob =
      (moving && player.onGround ? Math.sin(walk * 2) * 3 : 0) +
      (!moving && player.onGround ? Math.sin(t * 3) * 1.5 : 0);

    let sx = 1;
    let sy = 1;

    if (player.squash > 0) {
      sx = 1.12;
      sy = 0.88;
    } else if (airborne && player.vy < 0) {
      sx = 0.94;
      sy = 1.08;
    } else if (airborne) {
      sx = 1.04;
      sy = 0.97;
    }

    const hurtFlash = player.invincible > 0 && Math.floor(player.invincible * 18) % 2 === 0;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(player.facing, 1);

    ctx.globalAlpha = airborne ? 0.13 : 0.24;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, 11, airborne ? 27 : 39, airborne ? 6 : 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = hurtFlash ? 0.55 : 1;

    function leg(baseX, swing, front) {
      const footX = baseX + swing * 9;

      ctx.strokeStyle = front ? "#3a251c" : "#2c1b14";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(baseX, -18);
      ctx.quadraticCurveTo(baseX - swing * 4, -5, footX, 7);
      ctx.stroke();

      ctx.fillStyle = front ? "#3a251c" : "#2c1b14";
      ctx.beginPath();
      ctx.ellipse(footX + 4, 8, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    leg(-15, leg2, false);
    leg(18, leg1, false);

    ctx.save();
    ctx.scale(sx, sy);

    ctx.fillStyle = "#4a2f24";
    for (let i = -5; i <= 3; i++) {
      const bx = i * 10 - 2;
      const h = 17 + Math.max(0, 4 - Math.abs(i)) * 2;

      ctx.beginPath();
      ctx.moveTo(bx - 8, -32);
      ctx.quadraticCurveTo(bx - 3, -36 - h, bx + 8, -32);
      ctx.quadraticCurveTo(bx, -27, bx - 8, -32);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#3b251b";
    ctx.beginPath();
    ctx.moveTo(-48, -6);
    ctx.bezierCurveTo(-49, -37, -31, -61, 1, -63);
    ctx.bezierCurveTo(32, -64, 55, -43, 61, -14);
    ctx.bezierCurveTo(70, -7, 76, 0, 79, 7);
    ctx.bezierCurveTo(45, 18, -7, 18, -48, -6);
    ctx.closePath();
    ctx.fill();

    const body = ctx.createLinearGradient(0, -65, 0, 18);
    body.addColorStop(0, "#8b5b3d");
    body.addColorStop(0.5, "#b8774c");
    body.addColorStop(1, "#d28b58");

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-43, -7);
    ctx.bezierCurveTo(-44, -35, -28, -56, 2, -58);
    ctx.bezierCurveTo(31, -59, 50, -41, 57, -16);
    ctx.bezierCurveTo(64, -10, 70, -2, 73, 5);
    ctx.bezierCurveTo(41, 14, -5, 14, -43, -7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3b251b";
    ctx.beginPath();
    ctx.moveTo(31, -41);
    ctx.bezierCurveTo(59, -40, 81, -28, 88, -17);
    ctx.bezierCurveTo(82, -3, 58, 2, 32, -8);
    ctx.bezierCurveTo(23, -20, 23, -31, 31, -41);
    ctx.closePath();
    ctx.fill();

    const muzzle = ctx.createLinearGradient(30, -42, 85, 4);
    muzzle.addColorStop(0, "#e1a36b");
    muzzle.addColorStop(1, "#f0bd83");

    ctx.fillStyle = muzzle;
    ctx.beginPath();
    ctx.moveTo(33, -38);
    ctx.bezierCurveTo(57, -37, 76, -27, 82, -17);
    ctx.bezierCurveTo(75, -7, 56, -4, 34, -11);
    ctx.bezierCurveTo(27, -21, 27, -31, 33, -38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.ellipse(83, -18, 6.5, 5.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const blink = Math.sin(t * 2.1) > 0.965;

    if (blink) {
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(25, -34);
      ctx.quadraticCurveTo(31, -31, 37, -34);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.ellipse(31, -34, 6, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(33, -37, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#3b251b";
    ctx.beginPath();
    ctx.ellipse(-9, -52, 11, 13, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c88455";
    ctx.beginPath();
    ctx.ellipse(-8, -52, 6, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    leg(-12, leg1, true);
    leg(21, leg2, true);

    // Stick weapon on Sprig after pickup.
    if (player.hasStick) {
      ctx.save();
      ctx.strokeStyle = "#6a4328";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";

      let swing = 0;

      if (player.attackTimer > 0) {
        const p = 1 - player.attackTimer / 0.22;
        swing = -0.9 + p * 1.8;
      }

      ctx.rotate(swing);
      ctx.beginPath();
      ctx.moveTo(18, -36);
      ctx.lineTo(82, -48);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // Attack slash drawn in world-facing direction.
    if (player.attackTimer > 0) {
      const attackBox = getAttackBox();
      const ax = attackBox.x - camera.x;
      const ay = attackBox.y - camera.y;

      ctx.save();
      ctx.globalAlpha = player.attackTimer / 0.22;
      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";

      ctx.beginPath();

      if (player.facing > 0) {
        ctx.arc(ax + 20, ay + 42, 58, -0.85, 0.65);
      } else {
        ctx.arc(ax + attackBox.w - 20, ay + 42, 58, Math.PI - 0.65, Math.PI + 0.85);
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnemy(enemy) {
    if (!enemy.alive) return;

    const x = enemy.x - camera.x;
    const y = enemy.y - camera.y;
    const facing = enemy.vx >= 0 ? 1 : -1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    if (enemy.hitTimer > 0) {
      ctx.globalAlpha = 0.55;
    }

    ctx.globalAlpha *= 0.22;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, 8, enemy.w * 0.48, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = enemy.hitTimer > 0 ? 0.55 : 1;

    if (enemy.type === "porcupineScout") {
      ctx.fillStyle = "#26122f";

      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10 - 6, -30);
        ctx.lineTo(i * 10 + 2, -58 - Math.abs(i) * 4);
        ctx.lineTo(i * 10 + 10, -30);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "#4b2366";
      ctx.beginPath();
      ctx.ellipse(0, -18, 34, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#d1a8ff";
      ctx.beginPath();
      ctx.ellipse(26, -17, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ff5b68";
      ctx.beginPath();
      ctx.arc(24, -20, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#2f1838";

      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10 - 6, -24);
        ctx.lineTo(i * 10, -42);
        ctx.lineTo(i * 10 + 7, -24);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "#7b42a8";
      ctx.beginPath();
      ctx.ellipse(0, -14, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#22122d";
      ctx.beginPath();
      ctx.arc(20, -18, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // HP bar.
    ctx.scale(facing, 1);
    const hpW = 46;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(-hpW / 2, -enemy.h - 22, hpW, 6, 3);
    ctx.fill();

    ctx.fillStyle = "#ff6b6b";
    roundRect(-hpW / 2, -enemy.h - 22, hpW * (enemy.hp / enemy.maxHp), 6, 3);
    ctx.fill();

    ctx.restore();
  }

  function drawEnemies() {
    for (const enemy of enemies) {
      drawEnemy(enemy);
    }
  }

  function drawParticles() {
    ctx.save();

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max) * 0.75;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.ellipse(
        p.x - camera.x,
        p.y - camera.y,
        p.r,
        p.r * 0.65,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  function drawFloatingTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 18px Arial";

    for (const f of floatingTexts) {
      ctx.globalAlpha = Math.max(0, f.life / 1.2);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x - camera.x, f.y - camera.y);
    }

    ctx.restore();
  }

  // =====================================================
  // DRAWING: UI
  // =====================================================

  function drawDialogue() {
    if (!dialogueActive) return;

    const boxW = Math.min(860, W - 60);
    const boxH = 150;
    const boxX = W / 2 - boxW / 2;
    const boxY = H - boxH - 58;

    ctx.fillStyle = "rgba(38,27,34,0.90)";
    roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,238,170,0.85)";
    ctx.lineWidth = 3;
    roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.stroke();

    ctx.fillStyle = "#ffe680";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(dialogueSpeaker, boxX + 28, boxY + 34);

    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";

    const line = dialogueLines[dialogueIndex] || "";
    const words = line.split(" ");
    let current = "";
    let y = boxY + 74;

    for (let i = 0; i < words.length; i++) {
      const test = current + words[i] + " ";

      if (ctx.measureText(test).width > boxW - 56 && i > 0) {
        ctx.fillText(current, boxX + 28, y);
        current = words[i] + " ";
        y += 30;
      } else {
        current = test;
      }
    }

    ctx.fillText(current, boxX + 28, y);

    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.font = "15px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Press E", boxX + boxW - 28, boxY + boxH - 22);
  }

  function drawPrompt() {
    if (dialogueActive) return;

    let text = "";
    const elderDistance = Math.hypot(player.x - elder.x, player.y - elder.y);
    const stickDistance = Math.hypot(player.x - stickPickup.x, player.y - stickPickup.y);

    if (elderDistance < 150) {
      text = elderTalked ? "Press E to talk to Elder Quillby" : "Press E to speak with Elder Quillby";
    } else if (!stickPickup.taken && stickDistance < 90) {
      text = "Press E to pick up the stick";
    }

    if (!text) return;

    const boxW = 390;
    const boxH = 46;
    const boxX = W / 2 - boxW / 2;
    const boxY = H - 118;

    ctx.fillStyle = "rgba(30,24,28,0.72)";
    roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,230,128,0.8)";
    ctx.lineWidth = 2;
    roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.stroke();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, W / 2, boxY + 30);
  }

  function drawHUD() {
    ctx.save();

    // HP
    ctx.textAlign = "left";
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#fff4c7";
    ctx.fillText("HP", 20, 72);

    for (let i = 0; i < player.maxHp; i++) {
      ctx.fillStyle = i < player.hp ? "#ff6b7a" : "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.arc(65 + i * 24, 65, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Level / EXP
    const expX = 20;
    const expY = 90;
    const expW = 220;
    const expH = 14;
    const expPct = clamp(player.exp / player.expToNext, 0, 1);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(expX, expY, expW, expH, 7);
    ctx.fill();

    ctx.fillStyle = "#fff4a8";
    roundRect(expX, expY, expW * expPct, expH, 7);
    ctx.fill();

    ctx.fillStyle = "#fff4c7";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Lv " + player.level + "   EXP " + player.exp + "/" + player.expToNext, expX, expY + 32);

    // Weapon
    ctx.textAlign = "right";
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = player.hasStick ? "#fff4a8" : "rgba(255,255,255,0.55)";
    ctx.fillText(player.hasStick ? "Weapon: Stick" : "Weapon: None", W - 20, 38);

    ctx.restore();
  }

  // =====================================================
  // MAIN DRAW / LOOP
  // =====================================================

  function draw() {
    ctx.clearRect(0, 0, W, H);

    drawSky();
    drawClouds();
    drawMountains();
    drawVillage();

    for (const p of platforms) {
      drawPlatform(p);
    }

    drawSpikes();

    for (const cp of checkpoints) {
      drawCheckpoint(cp);
    }

    drawStickPickup();
    drawParticles();
    drawEnemies();
    drawHedgehog();
    drawFloatingTexts();

    // Soft vignette.
    const vignette = ctx.createRadialGradient(
      W / 2,
      H / 2,
      W * 0.25,
      W / 2,
      H / 2,
      W * 0.8
    );

    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.18)");

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    drawHUD();
    drawPrompt();
    drawDialogue();
  }

  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    updatePlayer(dt);
    updateEnemies(dt);
    updateCombat();
    updateHazards();
    updateCheckpoints();
    updateStoryTriggers();
    updateStickPrompt();
    updateParticles(dt);
    updateCamera(dt);

    draw();
    requestAnimationFrame(loop);
  }

  setObjective("Talk to Elder Quillby");
  setStory("Hedgehog Hollow rests far below Thornback Mountain...");

  requestAnimationFrame(loop);
})();
