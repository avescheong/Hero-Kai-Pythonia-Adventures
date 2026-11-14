/**
 * js/core/i18n.js
 * Hero Kai · Pythonia: Bilingual UI Dictionary (EN / 繁體中文) & SVG Portrait Fallbacks
 *
 * Maintainer Guide:
 * - Add new static UI translation keys to both `UI.en` and `UI["zh-Hant"]`.
 * - Bind any HTML element to a key by adding `data-i18n="yourKey"` in `index.html`.
 */
(() => {
  "use strict";

      /* ---- UI Translations (EN & Traditional Chinese) ---------------------- */
      const UI = {
        en: {
          pageTitle: "Hero Kai · Pythonia: The Eleven Spells of Kindness",
          sealTitle: "Hero Kai Storybook",
          sealSub: "Pythonia · 52 Scenes",
          navToggle: "Chapters",
          navAct1: "Act I · The Emerald Glitch",
          navAct2: "Act II · Realms Trail",
          navReader: "52-Scene Storybook Reader",
          navChapters: "Beginner Chapters (1–13) ↗",
          navChaptersAdv: "Complete Advance Story (1–13) ↗",
          navCodex: "Cast & 11 Spells Codex",
          navAct4: "Act IV · Citadel Awakening",
          navAct5: "Act V · Spellkeeper Seal",
          map1: "Arrival",
          map2: "Realms",
          map3: "Story",
          map4: "Citadel",
          map5: "Dawn",
          musicReady: "Music: Scroll to Play",
          musicPlaying: "Music: Soothing On",
          musicOff: "Music: Off",
          heroEyebrow: "Prologue · Complete Bilingual Storybook",
          heroTitle: "Hero Kai & the Eleven Spells of Kindness",
          heroLead: "When Kai pauses mid-game to help a stuck classmate, an emerald portal carries him into Pythonia. Scroll to hear soothing music and read all 52 illustrated scenes!",
          heroCta: "Explore All 13 Chapters ↓",
          heroChapterBtn: "🌱 Start Ch 1 (Beginner) →",
          heroAdvanceBtn: "📚 Complete Story (Advance) →",
          beat2Eyebrow: "Chapter 01 · Silent Village",
          beat2Title: "One Kind Word Wakes the Village",
          beat2Lead: "Kai kneels to comfort a frightened child instead of drawing his sword, and his golden Spellbook glows with the very first spell: print(\"Hello!\").",
          railEyebrow: "Act II · Realms Across Pythonia",
          railTitle: "Follow Kai & String Through Every Realm",
          railLead: "Click any realm card below to jump straight into that chapter inside the Part-by-Part Storybook Reader.",
          card1Title: "Grandma Looma's Cottage",
          card1Desc: "Grandma Looma shows Kai how commas give words neat space, while a friendly golden pup sniffs his boots.",
          card2Title: "The Outpost Forge",
          card2Desc: "The horned Blacksmith teaches Kai to weld two broken halves into one solid IronSword with zero gaps.",
          card3Title: "Naming String Patiently",
          card3Desc: "Kai pauses quietly to listen for a reply, naming his loyal golden-tan puppy String.",
          card4Title: "Vaults & Silver-Leafed Tree",
          card4Desc: "Kai locks HP, Mana, and Gold in a single breath before the Great Wizard's emerald farewell.",
          card5Title: "Crystal Spirits & Sunnybrook",
          card5Desc: "Four crystal spirits rebuild storm-hit homes, and String gains a telepathic text ribbon.",
          card6Title: "Citadel of Core & Dawn",
          card6Desc: "With Dwarven armor and all 11 spells, Kai frees the Baby Praying Mantis Spell Guardian.",
          readerEyebrow: "Complete Illustrated Storybook · 52 Scenes",
          readerTitle: "Read Hero Kai's Adventure Scene by Scene",
          readerSub: "Flip through all 4 illustrated scenes in each chapter (52 pages total), open dedicated multi-page chapters, or read in English & Traditional Chinese!",
          modePaged: "Quick Preview (52 Pages)",
          modeSpread: "4-Scene Spread",
          modeAll: "All 13 Chapters",
          openChapterPage: "🌱 Open Ch 1 (Beginner) ↗",
          openAdvancePage: "📚 Open Ch 1 (Advance Full) ↗",
          prevPart: "← Previous Scene",
          nextPart: "Next Scene →",
          partProgress: (pIdx, sIdx, totalParts) => `Page ${pIdx * 4 + sIdx + 1} of 52 · Chapter ${pIdx + 1} / ${totalParts}`,
          spreadEyebrow: "The Three Pillars of Kindness",
          spreadTitle: "Every Spell Grows From a Gentle Heart",
          spreadP1: "From Silent Village to Master Grimsby's Dwarven Forge, every Python spell in Kai's journey teaches both clear thinking and kindness: Love Others, Love Yourself, and Love the Earth.",
          spreadP2: "Meet all eight characters of Pythonia below and explore the 12 canonical realms and 11 Ancient Spells.",
          codexEyebrow: "Interactive Codex",
          codexTitle: "Cast, Realms & Eleven Spells",
          filterAll: "All Values (13)",
          filterOthers: "Love Others",
          filterYourself: "Love Yourself",
          filterEarth: "Love the Earth",
          castHeading: "Storybook Characters (8 Cast)",
          realmsHeading: "Twelve Story Realms (ENV_R00 to ENV_R11)",
          spellsHeading: "Prologue, Eleven Ancient Spells & Epilogue",
          act4Eyebrow: "Act IV · Citadel of Core Finale",
          act4Title: "All Eleven Spells Shatter the Dark Shell",
          act4Lead: "With String dashing beside him and glowing == Sight eyes, Kai spots the flaw in the Bug King's armor and frees the tiny emerald Baby Praying Mantis Spell Guardian.",
          attuneEyebrow: "Epilogue Awakening",
          attuneTitle: "Choose Your Kindness Promise",
          attuneLead: "Pick a Kindness Pillar for your Spellkeeper Seal, then keep scrolling to watch the morning meadow bloom.",
          act5Eyebrow: "Act V · Dawn Sanctuary Finale",
          act5Title: "Stamp Your Spellkeeper Certificate",
          act5Lead: "Type your name and kindness takeaway, draw a Jing Si Aphorism to bring home, and download your 960x540 seal with Hero Kai!",
          sealBtn: "Download Seal (.png)",
          drawAphorismBtn: "🎲 Draw Random Jing Si Aphorism",
          aphorismTag: "Jing Si Aphorism · Wisdom to Bring Home",
          sealPlaceholder: "Enter your name",
          sealNotePlaceholder: "What kindness lesson did you learn from Kai?",
          certHeader: "PYTHONIA CITADEL OF CORE · STORYBOOK SEAL",
          certSub: (pillar) => `Certified Spellkeeper · Pillar: ${pillar}`,
          certFooter: "Kindness + Patience + Truth = Dawn Restored",
          attuneNotes: {
            "Love Others": "Voice, Weave, Fuse & Fate ready for your finale seal.",
            "Love Yourself": "Calm pause, careful typing, humility & clear sight ready for your seal.",
            "Love the Earth": "Living balance, gentle creatures & dawn healing ready for your seal."
          },
          pillarLabels: {
            "Love Others": "Love Others",
            "Love Yourself": "Love Yourself",
            "Love the Earth": "Love the Earth"
          }
        },
        "zh-Hant": {
          pageTitle: "小英雄凱 · 蟒蛇王國：十一道善良魔法繪本",
          sealTitle: "小英雄凱故事書",
          sealSub: "蟒蛇王國 · 全 52 幕繪本",
          navToggle: "章節目錄",
          navAct1: "第一幕 · 翠綠螢幕入口",
          navAct2: "第二幕 · 王國旅途巡禮",
          navReader: "全 52 幕故事繪本閱讀器",
          navChapters: "精簡入門章節網頁 (1–13) ↗",
          navChaptersAdv: "完整進階故事網頁 (1–13) ↗",
          navCodex: "人物介紹與十一善咒",
          navAct4: "第四幕 · 核心堡壘覺醒",
          navAct5: "第五幕 · 守咒人證書",
          map1: "初抵",
          map2: "王國",
          map3: "故事",
          map4: "堡壘",
          map5: "黎明",
          musicReady: "音樂：滑動自動播放",
          musicPlaying: "音樂：舒緩旋律播放中",
          musicOff: "音樂：已暫停",
          heroEyebrow: "序章 · 雙語互動故事繪本",
          heroTitle: "小英雄凱與十一道善良魔法",
          heroLead: "當凱在遊戲中停下來幫助卡關的同學時，一道翠綠光芒將他帶進了蟒蛇王國。滑動頁面聆聽舒緩音樂，一頁一頁翻閱全部 52 幅插畫！",
          heroCta: "先在下方預覽全 13 章 ↓",
          heroChapterBtn: "🌱 第 1 章・精簡入門故事 →",
          heroAdvanceBtn: "📚 第 1 章・完整進階故事 →",
          beat2Eyebrow: "第一章 · 靜默村莊",
          beat2Title: "一句溫柔的問候喚醒村莊",
          beat2Lead: "凱沒有拔劍，而是蹲下來安慰害怕的小女孩，古老咒語書隨即亮起第一道魔法：print(\"Hello!\")。",
          railEyebrow: "第二幕 · 蟒蛇王國的奇幻旅程",
          railTitle: "跟著凱與小黃狗 String 走過每一座城鎮",
          railLead: "點擊下方任何一張地圖卡片，就能直接跳轉到故事閱讀器裡閱讀那一章！",
          card1Title: "魯瑪奶奶的織布木屋",
          card1Desc: "魯瑪奶奶教凱用逗號為句子留出舒服空間，一隻友善的小黃狗也來聞他的靴子。",
          card2Title: "鋼鐵前哨鍛造爐",
          card2Desc: "戴雙角盔的鐵匠教凱用加號 + 無縫熔合斷裂的鐵劍，打造堅固的 IronSword。",
          card3Title: "靜心傾聽 · 為 String 取名",
          card3Desc: "凱停下來耐心傾聽森林精靈的回答，並為忠誠的小黃狗取名為 String。",
          card4Title: "三重寶箱與銀葉樹告別",
          card4Desc: "凱一口氣鎖好生命、魔力與金幣三個寶箱，在銀葉樹下向大法師道別。",
          card5Title: "水晶四精靈與晴溪村",
          card5Desc: "四位水晶精靈幫助修復暴風雨後的村莊，String 也獲得了心電感應絲帶。",
          card6Title: "核心堡壘與黎明破曉",
          card6Desc: "穿戴矮人鋼甲並合齊十一道善咒，凱擊碎黑殼釋放出小螳螂守護神。",
          readerEyebrow: "完整插畫繪本 · 52 幕故事巡禮",
          readerTitle: "一幕一幕翻閱小英雄凱的冒險繪本",
          readerSub: "每章皆含 4 幅精緻插畫（全書共 52 頁），支援獨立分章分頁閱讀，並可隨時切換英文、繁體中文或雙語對照！",
          modePaged: "快速預覽 (52 頁)",
          modeSpread: "單章 4 幕展開",
          modeAll: "瀏覽全 13 章",
          openChapterPage: "🌱 開啟第 1 章（精簡入門）↗",
          openAdvancePage: "📚 開啟第 1 章（完整進階）↗",
          prevPart: "← 上一頁",
          nextPart: "下一頁 →",
          partProgress: (pIdx, sIdx, totalParts) => `全書第 ${pIdx * 4 + sIdx + 1} / 52 頁 · 第 ${pIdx + 1} / ${totalParts} 章`,
          spreadEyebrow: "三大善念支柱",
          spreadTitle: "每一道魔法都源自善良的心",
          spreadP1: "從靜默村莊到深山矮人鍛造爐，凱學到的每一道 Python 咒語都結合了清楚思考與品德修養：愛人、愛己與愛地球。",
          spreadP2: "往下認識八位故事角色、十二個王國地區，以及完整的十一道善良咒語。",
          codexEyebrow: "互動故事百科",
          codexTitle: "主要角色、王國地圖與十一善咒",
          filterAll: "全部顯示 (13)",
          filterOthers: "愛人",
          filterYourself: "愛己",
          filterEarth: "愛地球",
          castHeading: "故事主要角色（共 8 位）",
          realmsHeading: "十二個王國場景（ENV_R00 至 ENV_R11）",
          spellsHeading: "序章、十一道善咒與終章總覽",
          act4Eyebrow: "第四幕 · 核心堡壘大決戰",
          act4Title: "十一善咒齊聚，破除黑暗外殼",
          act4Lead: "在 String 靈巧閃避與 == 真視之眼的幫助下，凱看穿蟲蟲魔王鎧甲上的破綻，解救了翠綠可愛的小螳螂守護神。",
          attuneEyebrow: "終章覺醒時刻",
          attuneTitle: "選擇你的善良承諾",
          attuneLead: "挑選一項你想帶回現實生活的善良支柱，繼續往下滑動迎接陽光綻放的早晨。",
          act5Eyebrow: "第五幕 · 黎明花海終章",
          act5Title: "印製專屬守咒人證書",
          act5Lead: "輸入你的名字與學到的善良心得，抽一句靜思語帶回家，立刻下載含小英雄凱插畫的 960x540 守咒人證書！",
          sealBtn: "下載紀念證書 (.png)",
          drawAphorismBtn: "🎲 抽取一句靜思語",
          aphorismTag: "靜思語錦囊 · 帶回家的溫暖智慧",
          sealPlaceholder: "請輸入你的名字",
          sealNotePlaceholder: "寫下你從凱身上學到的善良承諾（選填）",
          certHeader: "蟒蛇王國核心堡壘 · 故事繪本守咒人證書",
          certSub: (pillar) => `榮譽守咒人 · 善良信念：${pillar}`,
          certFooter: "善良 + 耐心 + 真實 = 讓世界重現曙光",
          attuneNotes: {
            "Love Others": "聲音、編織、熔合與命運之咒已準備就緒，將寫入你的證書。",
            "Love Yourself": "靜心停步、細心輸入、踏實勞動與真視之眼已準備就緒。",
            "Love the Earth": "萬物平衡、溫柔守護小生命與大地復甦之力已準備就緒。"
          },
          pillarLabels: {
            "Love Others": "愛人 · 關懷他人",
            "Love Yourself": "愛己 · 靜心自省",
            "Love the Earth": "愛地球 · 守護萬物"
          }
        }
      };

      /* ---- Inline SVG Portraits for Pending Raster Sheets (Grimsby & Guardian) */
      const INLINE_PORTRAITS = {
        "svg:grimsby": `<svg viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" fill="#231610"/><circle cx="40" cy="34" r="18" fill="#f3c5a2" stroke="#3e2b23" stroke-width="2"/><path d="M21 30 C22 14,58 14,59 30 C52 21,28 21,21 30Z" fill="#d85a28" stroke="#3e2b23" stroke-width="2"/><path d="M24 38 C22 56,30 68,36 72 L40 56 L44 72 C50 68,58 56,56 38Z" fill="#d85a28" stroke="#3e2b23" stroke-width="2"/><circle cx="34" cy="33" r="2.5" fill="#d4a23c"/><circle cx="46" cy="33" r="2.5" fill="#d4a23c"/><rect x="29" y="54" width="6" height="5" rx="2" fill="#ffd285"/><rect x="45" y="54" width="6" height="5" rx="2" fill="#ffd285"/></svg>`,
        "svg:guardian": `<svg viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" fill="#10251a"/><path d="M33 20 Q24 8 18 14 M47 20 Q56 8 62 14" fill="none" stroke="#8cf0bd" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="40" cy="34" rx="15" ry="12" fill="#2ecc71" stroke="#184d30" stroke-width="2"/><circle cx="33" cy="33" r="4.5" fill="#ffd285"/><circle cx="47" cy="33" r="4.5" fill="#ffd285"/><circle cx="33" cy="33" r="2" fill="#184d30"/><circle cx="47" cy="33" r="2" fill="#184d30"/><path d="M32 45 C28 56,28 66,40 68 C52 66,52 56,48 45Z" fill="#7be4a8" stroke="#184d30" stroke-width="2"/><circle cx="20" cy="24" r="2" fill="#ffd285"/><circle cx="62" cy="52" r="2.5" fill="#ffd285"/></svg>`
      };

      const renderPortraitMarkup = (portraitKey, altText) => {
        if (!portraitKey) return "";
        if (portraitKey.startsWith("svg:")) {
          return INLINE_PORTRAITS[portraitKey] || "";
        }
        return `<img src="${portraitKey}" alt="${altText}" loading="lazy" />`;
      };


  window.PythoniaI18n = {
    UI,
    INLINE_PORTRAITS,
    renderPortraitMarkup
  };
})();
