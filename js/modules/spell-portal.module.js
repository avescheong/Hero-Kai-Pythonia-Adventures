/* ============================================================================
 * js/modules/spell-portal.module.js  (v2.1 — Vol. 1 + Vol. 2 · 20-Seal Passport)
 * Live In-Comic Python Spell-Portal & Collectible 20-Seal Spell Passport!
 * ============================================================================ */
(function (global) {
  'use strict';

  const SPELL_CHALLENGES = {
    0: {
      prompt_en: 'Awaken the Whispering Forest portal! Tap the runes or type a greeting to enter Pythonia.',
      prompt_zh: '喚醒低語森林傳送門！點擊符文或輸入問候語踏入派森尼亞。',
      starter: 'print("Enter Pythonia!")',
      runes: ['print(', '"Enter Pythonia!"', ')'],
      validate(code) {
        const m = code.match(/print\s*\(\s*["'](.+?)["']\s*\)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Wrap your message in quotes inside print("...")!' };
        return { ok: true, output: `✨ Portal Awakened: ${m[1]}` };
      },
      lessonPath: 'chapters/chapter-01.html',
      sanctuaryPath: 'hub.html'
    },
    1: {
      prompt_en: 'Restore voice to the Silent Village! Cast Spell 01 (VOICE) with print("Hello, Pythonia!").',
      prompt_zh: '喚回寂靜之村的聲音！施展第一道咒語 print("Hello, Pythonia!")。',
      starter: 'print("Hello, Pythonia!")',
      runes: ['print(', '"Hello, Pythonia!"', ')'],
      validate(code) {
        const m = code.match(/print\s*\(\s*["'](.+?)["']\s*\)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Check that both quotation marks and parentheses are closed!' };
        return { ok: true, output: `🔊 Village Echoes: ${m[1]}` };
      },
      lessonPath: 'chapters/chapter-02.html',
      sanctuaryPath: 'sanctuaries/Scroll_01_VOICE_Sanctuary.html'
    },
    2: {
      prompt_en: "Weave two threads on Grandma Looma's loom using a comma inside print().",
      prompt_zh: '在露瑪奶奶的織布機上，用逗號編織兩段文字！',
      starter: 'print("Hello", "Pythonia!")',
      runes: ['print(', '"Hello"', ', ', '"Pythonia!"', ')'],
      validate(code) {
        const m = code.match(/print\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Put a comma between two quoted strings: print("Hello", "Pythonia!")' };
        return { ok: true, output: `🧵 Woven Thread: ${m[1]} ${m[2]}` };
      },
      lessonPath: 'chapters/chapter-03.html',
      sanctuaryPath: 'sanctuaries/Scroll_02_WEAVE_Sanctuary.html'
    },
    3: {
      prompt_en: 'Fuse the broken blade at the Iron Outpost using + string concatenation!',
      prompt_zh: '在鋼鐵前哨站使用加號 (+) 無縫熔合劍身！',
      starter: 'print("Iron" + "Sword")',
      runes: ['print(', '"Iron"', ' + ', '"Sword"', ')'],
      validate(code) {
        const m = code.match(/print\s*\(\s*["']([^"']+)["']\s*\+\s*["']([^"']+)["']\s*\)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Use the + sign between two quoted words: print("Iron" + "Sword")' };
        return { ok: true, output: `⚒️ Forged Without a Seam: ${m[1]}${m[2]}` };
      },
      lessonPath: 'chapters/chapter-04.html',
      sanctuaryPath: 'sanctuaries/Scroll_03_FUSE_Sanctuary.html'
    },
    4: {
      prompt_en: 'Open the Whispering Gate by listening with input() and storing the reply in name.',
      prompt_zh: '用 input() 傾聽旅人的名字並存入變數 name！',
      starter: 'name = input("Your name? ")',
      runes: ['name = ', 'input(', '"Your name? "', ')'],
      validate(code) {
        if (!/\w+\s*=\s*input\s*\(\s*["'].+?["']\s*\)/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Assign input("...") to a variable like name = input("Your name? ")' };
        }
        return { ok: true, output: '👂 Gate Listened: Welcome, Hero Kai & String!' };
      },
      lessonPath: 'chapters/chapter-05.html',
      sanctuaryPath: 'sanctuaries/Scroll_04_LISTEN_Sanctuary.html'
    },
    5: {
      prompt_en: 'Seal 50 gold coins safely inside the Golden Vault variable.',
      prompt_zh: '將 50 枚金幣安全封存進變數金庫 gold！',
      starter: 'gold = 50',
      runes: ['gold', ' = ', '50'],
      validate(code) {
        const m = code.match(/([a-zA-Z_]\w*)\s*=\s*(\d+)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Use name = number, e.g., gold = 50' };
        return { ok: true, output: `🏛️ Vault Sealed: ${m[1]} holds ${m[2]} safely!` };
      },
      lessonPath: 'chapters/chapter-06.html',
      sanctuaryPath: 'sanctuaries/Scroll_05_VAULT_Sanctuary.html'
    },
    6: {
      prompt_en: 'Protect HP, Mana, and Gold on one line with Multi-Vault assignment!',
      prompt_zh: '用一行多重賦值同時守護生命、魔力與金幣！',
      starter: 'hp, mana, gold = 100, 50, 10',
      runes: ['hp, mana, gold', ' = ', '100, 50, 10'],
      validate(code) {
        if (!/\w+\s*,\s*\w+\s*,\s*\w+\s*=\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Match 3 names on the left with 3 numbers on the right!' };
        }
        return { ok: true, output: '💎 Triple Vault Locked: HP=100 · MANA=50 · GOLD=10' };
      },
      lessonPath: 'chapters/chapter-07.html',
      sanctuaryPath: 'sanctuaries/Scroll_05A_MULTIVAULT_Sanctuary.html'
    },
    7: {
      prompt_en: 'Leave a quiet human note starting with # so the Sleeping Dragon stays peaceful.',
      prompt_zh: '用 # 寫下一句悄悄話註解，不吵醒沉睡巨龍！',
      starter: '# Walk softly past the dragon',
      runes: ['# ', 'Walk softly past the dragon'],
      validate(code) {
        if (!/^\s*#.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Start your line with the # symbol so Python skips it silently!' };
        }
        return { ok: true, output: '🐉 Shhh... Python skipped the comment. The dragon sleeps peacefully!' };
      },
      lessonPath: 'chapters/chapter-08.html',
      sanctuaryPath: 'sanctuaries/Scroll_06_WHISPER_Sanctuary.html'
    },
    8: {
      prompt_en: 'Reveal the spirit type inside Crystal Cave using type()!',
      prompt_zh: '在水晶洞窟使用 type() 辨識精靈的資料型態！',
      starter: 'type("String")',
      runes: ['type(', '"String"', ')'],
      validate(code) {
        const m = code.match(/type\s*\(\s*(.+?)\s*\)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Call type("String") or type(100)!' };
        const arg = m[1].trim();
        const inferred = /^["'].*["']$/.test(arg) ? "<class 'str'>" :
                         /^(True|False)$/.test(arg) ? "<class 'bool'>" :
                         /^\d+\.\d+$/.test(arg) ? "<class 'float'>" :
                         /^\d+$/.test(arg) ? "<class 'int'>" : "<class 'str'>";
        return { ok: true, output: `🔮 Crystal Spirit Revealed: ${inferred}` };
      },
      lessonPath: 'chapters/chapter-09.html',
      sanctuaryPath: 'sanctuaries/Scroll_07_SHAPESHIFT_Sanctuary.html'
    },
    9: {
      prompt_en: 'Rebalance armor energy in the Deep Dwarven Forge using arithmetic (+, -, *, /).',
      prompt_zh: '在矮人鍛造廠用數學運算子重鑄裝備能量！',
      starter: 'hp = 100 - 20',
      runes: ['hp = ', '100', ' - ', '20'],
      validate(code) {
        const m = code.match(/([a-zA-Z_]\w*)\s*=\s*(\d+)\s*([+\-*/])\s*(\d+)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Try hp = 100 - 20 (or +, *, /)' };
        const a = Number(m[2]), b = Number(m[4]);
        const res = m[3] === '+' ? a + b : m[3] === '-' ? a - b : m[3] === '*' ? a * b : b ? +(a / b).toFixed(2) : 0;
        return { ok: true, output: `🔥 Forge Balanced: ${m[1]} = ${res}` };
      },
      lessonPath: 'chapters/chapter-10.html',
      sanctuaryPath: 'sanctuaries/Scroll_08_FORGE_Sanctuary.html'
    },
    10: {
      prompt_en: 'See through the Twin Illusions with a comparison operator (>, <, ==, !=).',
      prompt_zh: '使用比較運算子 (>, <, ==, !=) 看穿雙重幻象！',
      starter: 'print(100 > 0)',
      runes: ['print(', '100', ' > ', '0', ')'],
      validate(code) {
        const m = code.match(/(\d+)\s*(==|!=|>=|<=|>|<)\s*(\d+)/);
        if (!m) return { ok: false, hint: 'Bug Detective Hint: Compare two numbers like print(100 > 0)' };
        const a = Number(m[1]), op = m[2], b = Number(m[3]);
        const ans = op === '>' ? a > b : op === '<' ? a < b : op === '==' ? a === b : op === '!=' ? a !== b : op === '>=' ? a >= b : a <= b;
        return { ok: true, output: `👁️ Eye of Sight Reveals: ${ans ? 'True' : 'False'}` };
      },
      lessonPath: 'chapters/chapter-11.html',
      sanctuaryPath: 'sanctuaries/Scroll_09_SIGHT_Sanctuary.html'
    },
    11: {
      prompt_en: 'Guide Kai at the Final Crossroads using an if condition with a colon (:)!',
      prompt_zh: '在最終十字路口使用 if 條件與冒號 (:) 做出選擇！',
      starter: 'if hp > 50: print("Open Gate!")',
      runes: ['if ', 'hp > 50', ': ', 'print("Open Gate!")'],
      validate(code) {
        if (!/if\s+.+:\s*.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Remember the colon (:) after the condition — if hp > 50: print("Open Gate!")' };
        }
        return { ok: true, output: '🚪 Crossroads Illuminated: Path of Kindness Opens!' };
      },
      lessonPath: 'chapters/chapter-12.html',
      sanctuaryPath: 'sanctuaries/Scroll_10_FATE_Sanctuary.html'
    },
    12: {
      prompt_en: 'Grand Finale! Cast the Guardian Oath to unite all Eleven Spells of Kindness.',
      prompt_zh: '終章！施展守護者誓言，匯聚十一道善良的咒語！',
      starter: 'print("Courage" + " + " + "Kindness")',
      runes: ['print(', '"Courage"', ' + ', '" + Kindness"', ')'],
      validate(code) {
        if (!/print\s*\(.+\)/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Speak your Guardian Oath inside print("...")!' };
        }
        return { ok: true, output: '👑 True Guardian Seal Awakened — Pythonia is Healed!' };
      },
      lessonPath: 'chapters/chapter-13.html',
      sanctuaryPath: 'sanctuaries/Scroll_11_EPILOGUE_Sanctuary.html'
    },
    // ---------------- VOLUME 2 SPELL PORTALS (EP13–EP19) ----------------
    13: {
      prompt_en: 'Name your baby red dragon Ember and clamp hunger so it never exceeds 100!',
      prompt_zh: '為紅龍寶寶取名 Ember，並用數值保護限制飢餓度不超過 100！',
      starter: 'pet_name = "Ember"; hunger = min(100, 50 + 20)',
      runes: ['pet_name = "Ember"; ', 'hunger = ', 'min(100, 50 + 20)'],
      validate(code) {
        if (!/[a-zA-Z_]\w*\s*=\s*["'].+?["']/.test(code) || !/(min\s*\(|>\s*100|if\s+hunger)/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Set pet_name = "Ember" and clamp hunger with min(100, ...) or if hunger > 100!' };
        }
        return { ok: true, output: '🐉 Ember blinks happily! Stats clamped safely at <= 100.' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    14: {
      prompt_en: 'Update Kai\'s Enchanted Piggy Bank balance using float decimals (+ reward, - potion)!',
      prompt_zh: '用浮點數小數更新魔法撲滿餘額（加上任務獎勵、扣除藥水花費）！',
      starter: 'balance = 10.0 + 5.0 - 3.5',
      runes: ['balance = ', '10.0 + 5.0', ' - 3.5'],
      validate(code) {
        const m = code.match(/[a-zA-Z_]\w*\s*=\s*(\d+\.\d+)\s*([+\-])\s*(\d+\.\d+)(?:\s*([+\-])\s*(\d+\.\d+))?/);
        if (!m) {
          return { ok: false, hint: 'Bug Detective Hint: Use float decimals like balance = 10.0 + 5.0 - 3.5' };
        }
        return { ok: true, output: '🐷 Piggy Bank Updated: Balance = $11.50 (Float precision locked!)' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    15: {
      prompt_en: 'Calculate Cosmic Scoops total price with multiplication and 10% tax (* 1.1)!',
      prompt_zh: '用乘法與 10% 稅率 (* 1.1) 幫星空雪酪餐車結帳！',
      starter: 'total = 3 * 2.5 * 1.1',
      runes: ['total = ', '3 * 2.5', ' * 1.1'],
      validate(code) {
        if (!/\w+\s*=\s*.+\*.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Multiply scoops by price and 1.1 tax, e.g., total = 3 * 2.5 * 1.1' };
        }
        return { ok: true, output: '🍨 Order Served! 3 Cosmic Scoops + 10% tax = $8.25' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    16: {
      prompt_en: 'Convert text from input() into a real integer using int(input(...)) for the Wizard\'s Arcade!',
      prompt_zh: '在魔法遊樂場使用 int(input(...)) 把文字紙捲轉成可計算的整數！',
      starter: 'ans = int(input("15 + 27 = ? "))',
      runes: ['ans = ', 'int(', 'input("15 + 27 = ? ")', ')'],
      validate(code) {
        if (!/\w+\s*=\s*(?:int|float)\s*\(\s*input\s*\(.+\)\s*\)/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Wrap input("...") inside int(...) so "42" becomes 42!' };
        }
        return { ok: true, output: '🕹️ High Score Unlocked! String "42" cast cleanly to int 42.' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    17: {
      prompt_en: 'Unchain Lock #2 of the Sealed Chamber using a Boolean and gate (no quotes around True/False)!',
      prompt_zh: '用布林邏輯閘 (and / or / not) 解開封印密室的第二道翡翠鎖！',
      starter: 'lock2 = has_key and knows_password',
      runes: ['lock2 = ', 'has_key', ' and ', 'knows_password'],
      validate(code) {
        if (!/\w+\s*=\s*.+\b(and|or|not)\b.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Combine two Boolean switches using and / or / not, e.g., lock2 = has_key and knows_password' };
        }
        return { ok: true, output: '🔐 True and True -> UNCHAINED! The Sealed Chamber opens!' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    18: {
      prompt_en: 'Test the boundary condition >= on Ember Peak (remember the colon and 4-space indent spirit)!',
      prompt_zh: '在餘燼峰用大於等於 (>=) 與冒號 (:) 檢查黃金寶藏階級！',
      starter: 'if treasure_points >= 50: rank = "Gold"',
      runes: ['if ', 'treasure_points >= 50', ': ', 'rank = "Gold"'],
      validate(code) {
        if (!/if\s+.+(>=|<=|>|<).+:\s*.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Use >= and a colon (:), e.g., if treasure_points >= 50: rank = "Gold"' };
        }
        return { ok: true, output: '⛰️ Boundary Check Passed! Wise Red Dragon nods: Rank = Gold.' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    },
    19: {
      prompt_en: 'Volume 2 Finale! Log suspect clues on one line using multiple assignment!',
      prompt_zh: '第二卷大結局！用一行多重賦值記錄嫌疑人線索，解開王冠失蹤之謎！',
      starter: 'name, size, alibi = "Sir Cedric", 9, True',
      runes: ['name, size, alibi = ', '"Sir Cedric"', ', 9, ', 'True'],
      validate(code) {
        if (!/\w+\s*,\s*\w+\s*,\s*\w+\s*=\s*.+,\s*.+,\s*.+/.test(code)) {
          return { ok: false, hint: 'Bug Detective Hint: Assign 3 values at once: name, size, alibi = "Sir Cedric", 9, True' };
        }
        return { ok: true, output: '👑 Case Solved Fairly! All 3 Detective Locks verified — Crown Restored!' };
      },
      lessonPath: 'hub.html',
      sanctuaryPath: 'hub.html'
    }
  };

  function launchParticleBurst(canvas) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 260;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const particles = Array.from({ length: 42 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      return {
        x: canvas.width * 0.5,
        y: canvas.height * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        r: 2.5 + Math.random() * 3.5,
        alpha: 1,
        color: Math.random() > 0.45 ? '#8cf0bd' : '#ffd285'
      };
    });

    let frame = 0;
    function step() {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= 0.02;
        if (p.alpha > 0) {
          ctx2d.globalAlpha = p.alpha;
          ctx2d.fillStyle = p.color;
          ctx2d.beginPath();
          ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx2d.fill();
        }
      });
      ctx2d.globalAlpha = 1;
      frame++;
      if (frame < 55) requestAnimationFrame(step);
      else ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(step);
  }

  function renderPassportPill(ctx) {
    const slot = document.getElementById('hub-passport-slot');
    if (!slot) return;
    const total = ctx.manifest.episodes.length;
    const count = ctx.store.getState().unlockedSeals.length;
    slot.innerHTML = `
      <button type="button" class="passport-pill" id="open-passport-btn">
        🏅 Spell Passport: ${count} / ${total} Seals
      </button>
    `;
    document.getElementById('open-passport-btn').addEventListener('click', () => openPassportModal(ctx));
  }

  function openPassportModal(ctx) {
    const total = ctx.manifest.episodes.length;
    const unlocked = new Set(ctx.store.getState().unlockedSeals);
    const cards = ctx.manifest.episodes.map((ep) => {
      const done = unlocked.has(ep.episode);
      return `
        <button type="button" class="passport-seal-card ${done ? 'is-unlocked' : ''}" data-passport-ep="${ep.episode}">
          <div class="passport-seal-icon">${ep.icon}</div>
          <div class="passport-seal-name">${ep.code} · ${ep.spellName}</div>
          <div class="passport-seal-code">${done ? '✓ SEALED' : ep.spellCode}</div>
        </button>
      `;
    }).join('');

    const backdrop = document.getElementById('comic-modal-backdrop');
    document.getElementById('comic-modal-title').textContent = `🏅 Kai's Collectible Spell Passport (${unlocked.size} / ${total})`;
    document.getElementById('comic-modal-body').innerHTML = `
      <p style="margin:0 0 8px;color:var(--sc-ink-soft);font-size:0.88rem;">
        Cast the Live Python Spell at the end of each comic episode (Vol. 1 &amp; Vol. 2) to stamp its Golden Seal! Tap any seal to jump directly to that episode.
      </p>
      <div class="passport-grid">${cards}</div>
    `;
    backdrop.hidden = false;

    document.querySelectorAll('[data-passport-ep]').forEach((b) => {
      b.addEventListener('click', () => {
        backdrop.hidden = true;
        ctx.bus.emit('reader:open', { episode: Number(b.getAttribute('data-passport-ep')) });
      });
    });
  }

  function renderSpellPortal(ctx, ep) {
    const slot = document.getElementById('reader-module-slot');
    if (!slot) return;

    const total = ctx.manifest.episodes.length;
    const challenge = SPELL_CHALLENGES[ep.episode] || SPELL_CHALLENGES[0];
    const st = ctx.store.getState();
    const isUnlocked = st.unlockedSeals.includes(ep.episode);
    const promptText = st.lang === 'zh-Hant' ? challenge.prompt_zh : challenge.prompt_en;
    const baseSite = (global.KAI_COMIC_CONFIG && global.KAI_COMIC_CONFIG.parentBaseUrl) || ctx.manifest.parentSiteUrl;
    const lessonUrl = `${baseSite}${challenge.lessonPath}`;
    const sanctuaryUrl = `${baseSite}${challenge.sanctuaryPath || 'hub.html'}`;
    const isVol2 = ep.volume === 2;

    slot.innerHTML = `
      <section class="spell-portal ${isUnlocked ? 'is-awakened' : ''}" id="live-spell-portal" aria-label="Interactive Python Spell Portal">
        <canvas class="spell-portal__canvas" id="spell-burst-canvas" aria-hidden="true"></canvas>
        <div class="spell-portal__head">
          <span class="spell-portal__badge ${isUnlocked ? 'spell-portal__badge--done' : ''}" id="spell-portal-status">
            ${isUnlocked ? `✓ SEAL AWAKENED · ${ep.spellName}` : `✨ LIVE IN-COMIC SPELL PORTAL · ${ep.spellName}`}
          </span>
          <button type="button" class="passport-pill" id="portal-passport-btn">
            🏅 ${st.unlockedSeals.length} / ${total} Seals
          </button>
        </div>
        <h2 class="spell-portal__title">${ep.icon} Cast ${ep.code}'s Python Spell Yourself</h2>
        <p class="spell-portal__prompt">${promptText}</p>

        <div class="spell-runes" aria-label="Tap runes to insert code">
          ${challenge.runes.map((r) => `<button type="button" class="rune-chip" data-rune='${r.replace(/'/g, '&#39;')}'>+ ${r}</button>`).join('')}
          <button type="button" class="rune-chip" id="spell-autofill-btn" style="border-color:var(--kc-gold);color:var(--kc-gold);">⚡ Fill Example</button>
        </div>

        <div class="spell-editor-wrap">
          <input type="text" class="spell-input" id="spell-code-input" value="${isUnlocked ? challenge.starter.replace(/"/g, '&quot;') : ''}" placeholder="${challenge.starter.replace(/"/g, '&quot;')}" aria-label="Type Python spell code" />
          <button type="button" class="btn-webtoon-primary" id="spell-cast-btn">✨ Cast Spell</button>
        </div>

        <div class="spell-output ${isUnlocked ? 'spell-output--ok' : ''}" id="spell-output-box" role="status">
          ${isUnlocked ? '✨ Golden Seal stamped into your Spell Passport! Experiment freely or jump to the Learning Hub.' : 'Tap the glowing runes above or type the spell, then click Cast Spell!'}
        </div>

        <div class="spell-portal__cta">
          <span style="font-size:0.8rem;color:var(--sc-ink-soft);">${isVol2 ? `Want more interactive Python quests after ${ep.code}?` : `Want the full interactive 52-scene sanctuary for ${ep.code}?`}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${isVol2 ? '' : `<a class="hud-btn" href="${lessonUrl}">📖 Read Story Chapter →</a>`}
            <a class="hud-btn hud-btn--primary" href="${sanctuaryUrl}">🏰 ${isVol2 ? 'Explore Learning Hub →' : 'Launch Interactive Sanctuary →'}</a>
          </div>
        </div>
      </section>
    `;

    const input = document.getElementById('spell-code-input');
    const outBox = document.getElementById('spell-output-box');
    const portal = document.getElementById('live-spell-portal');
    const burstCanvas = document.getElementById('spell-burst-canvas');

    slot.querySelectorAll('[data-rune]').forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = (input.value || '') + chip.getAttribute('data-rune');
        input.focus();
      });
    });

    document.getElementById('spell-autofill-btn').addEventListener('click', () => {
      input.value = challenge.starter;
      input.focus();
    });

    document.getElementById('portal-passport-btn').addEventListener('click', () => openPassportModal(ctx));

    function runSpell() {
      const code = (input.value || '').trim();
      if (!code) {
        outBox.className = 'spell-output spell-output--hint';
        outBox.textContent = 'Tap the rune chips or click "Fill Example" to cast your first spell!';
        return;
      }
      const res = challenge.validate(code);
      if (res.ok) {
        outBox.className = 'spell-output spell-output--ok';
        outBox.textContent = res.output;
        portal.classList.add('is-awakened');
        launchParticleBurst(burstCanvas);
        ctx.bus.emit('audio:chime', 'spell');
        const newlyUnlocked = ctx.store.unlockSeal(ep.episode);
        const totalSeals = ctx.store.getState().unlockedSeals.length;
        const badge = document.getElementById('spell-portal-status');
        if (badge) {
          badge.className = 'spell-portal__badge spell-portal__badge--done';
          badge.textContent = `✓ SEAL AWAKENED · ${ep.spellName}`;
        }
        const pbtn = document.getElementById('portal-passport-btn');
        if (pbtn) pbtn.textContent = `🏅 ${totalSeals} / ${total} Seals`;
        ctx.toast(newlyUnlocked ? `🏅 Golden Seal #${ep.episode} stamped! (${totalSeals}/${total})` : `✨ Spell cast! (${totalSeals}/${total} Seals)`);
      } else {
        outBox.className = 'spell-output spell-output--hint';
        outBox.textContent = res.hint;
      }
    }

    document.getElementById('spell-cast-btn').addEventListener('click', runSpell);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runSpell();
    });
  }

  global.KaiComic.registerModule({
    id: 'spell-portal',
    mount(ctx) {
      renderPassportPill(ctx);
      ctx.bus.on('hub:rendered', () => renderPassportPill(ctx));
      ctx.bus.on('episode:opened', ({ episode }) => renderSpellPortal(ctx, episode));
      ctx.bus.on('spell:open-passport', () => openPassportModal(ctx));
      ctx.bus.on('spell:jump-to-portal', () => {
        const el = document.getElementById('live-spell-portal');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  });
})(window);
