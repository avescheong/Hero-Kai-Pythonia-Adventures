# Hero Kai · Pythonia: The Eleven Spells of Kindness

**Teaching kids Python through an interactive, illustrated storybook adventure—so children fall in love with coding, problem-solving, and kindness.**

Instead of starting with dry syntax drills or intimidating textbooks, this website invites young learners to step into **Pythonia** alongside **11-year-old Hero Kai** and his loyal puppy **String**. Every Python concept is experienced as a **living magical spell** needed to help villagers, heal nature, outsmart glitches, and restore the Citadel of Core.

---

## Why This Website Is Special

### 1. Learning Python Through Story, Not Rote Memorization
Kids remember *why* a command matters when it saves a village or bonds a friend:
- `print("Hello!")` isn't just text on a black console—it is **Spell 1 (VOICE)** that breaks the enchanted hush of Silent Village so a child can greet their friends again.
- Comma weaving (`print("Hello", "Pythonia!")`) is **Spell 2 (WEAVE)** learned at Grandma Looma's rainbow silk loom, giving words breathing room.
- `input()` is **Spell 4 (LISTEN)**—asking with care and truly listening—through which Kai names his scruffy golden pup **String**.
- Variables (`=`), unpacking (`a, b, c = ...`), comments (`#`), data types (`type()`), math runes (`+ - * /`), comparisons (`> < ==`), and branching (`if / elif / else`) each solve a concrete story challenge across **12 illustrated realms (`ENV_R00` – `ENV_R11`)**.

### 2. Built for Every Young Reader (Beginner & Advance Modes)
- **52 Full-Color Illustrated Scenes** across **13 Chapters** (Prologue, Spells 1–11, Epilogue), viewable both in the 5-act interactive handscroll on `index.html` and in **26 dedicated chapter pages** (`chapters/chapter-01.html` – `chapter-13.html`).
- **🌱 Beginner Mode** (`chapter-XX.html`): Crisp, approachable picture-book narration paired with 4 scenes per chapter and interactive spell sandboxes.
- **📚 Advance Mode** (`chapter-XX-advance.html`): Full-screen scroll-unfolding story beats with rich, atmospheric narration from the complete saga—switchable live between Beginner and Advance on any chapter page.

### 3. Bilingual Family & Classroom Experience (`EN` / `繁體中文` / `雙語`)
Switch effortlessly between **English**, **Traditional Chinese (`繁體中文`)**, or **Bilingual Side-by-Side (`雙語`)** across the main scrollytelling world, interactive modals, and all 26 chapter readers.

### 4. Interactive Learning Hub (`hub.html`), 12 Lesson Sanctuaries & Story Cinema
- **Learning Hub (`hub.html`)**: Unified classroom and self-study portal featuring a **Live 12-Spell Python Console** (`01 VOICE` → `11 FINALE`), **12 Clickable Guardians & Mentors** with enlarged bilingual profile modals, **13 Unified Realm Cards** linking Story chapters and Interactive Sanctuaries, **Teacher Command Mode** (with a live 7-stage 120-minute Tzu Chi classroom timer and Colab/Advance story links), a **2-Minute Mindful Breathing Lantern**, and the **Spellkeeper Certificate Studio**.
- **12 Interactive Lesson Sanctuaries (`sanctuaries/Scroll_01_VOICE_Sanctuary.html` – `Scroll_11_EPILOGUE_Sanctuary.html`, 84 Levels Total)**: Self-contained Dual-Mode coding lessons featuring **Guided Rune Typing** (character-by-character typing with Anti-Paste Shield, live WPM/accuracy, and Detective Clue hints) and **Free-Cast Sandbox** (in-browser Python evaluator supporting `print()`, `input()`, variables, multi-assignment, `#` comments, types/casting, arithmetic, comparisons, and `if / elif / else`). Progress syncs automatically across `hub.html`, all 12 Sanctuaries, and the **12-Scroll Journey Map** via `localStorage` (`pythonia_journey_v1`).
- **Pythonia Animated Story Cinema**: Looping hero portal backdrop plus an in-page HD MP4 theater (`assets/animations/`) with all 5 animated story clips (`Prologue Vortex`, `Bug King Clash I & II`, `Happy Ending Finale`, and `Flower Bed Calm Rest`).
- **Dual-Experience Music & SFX**:
  - **Learning Hub & 12 Sanctuaries**: Plays *Spinning in Three* (`assets/audio/spinning-in-three.mp3`) with a synced `🎵 Music: ON/OFF` toggle (`pythonia_piano_on`) that automatically pauses during Story Cinema MP4 playback.
  - **Storybook & Chapter Readers (`index.html` & `chapters/`)**: Plays scroll-reactive ambient audio (`assets/audio/peaceful.mp3` or synthesized Crystal Harp) and soft spell chimes (`assets/audio/spell-chime.mp3`).
- **Take-Home Spellkeeper Certificate (`960×540` PNG) + Jing Si Aphorisms (靜思語)**: Students enter their name and kindness takeaway, draw a bilingual **Jing Si Aphorism**, and download a high-resolution keepsake certificate illustrated with **Hero Kai**.

### 5. Kindness & Character First
Pythonia was written around three timeless character pillars—**Love Yourself**, **Love Others**, and **Love the Earth**—teaching kids that rushing carelessly creates glitches (*The Bug King*), while patience, care, and thoughtful logic build software that genuinely helps others.

---

## Story, Curriculum & Sanctuary Crosswalk (13 Parts · 52 Scenes · 12 Sanctuaries)

| Part | Chapter Page | Kingdom Realm | Interactive Sanctuary (`sanctuaries/`) | Python Spell & Syntax | Kindness Pillar |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Prologue** | `chapter-01.html` — The Glitch, the Gentle Heart & the Bug King | Virtual City & Entry Road (`ENV_R00`) | *(Hub Warmup / Orientation)* | **The Kind Pause** — `# Pause first. Care for others before rushing.` | Love Others |
| **Ch. 1** | `chapter-02.html` — Breaking the Hush of Silent Village | Silent Village (`ENV_R01`) | `Scroll_01_VOICE_Sanctuary.html` | **Spell 1 · VOICE** — `print("Hello!")` | Love Others |
| **Ch. 2** | `chapter-03.html` — Grandma Looma's Cottage & the Friendly Pup | Loom Forest & Weaver Cottage (`ENV_R02`) | `Scroll_02_WEAVE_Sanctuary.html` | **Spell 2 · WEAVE** — `print("Hello", "Pythonia!")` | Love Others |
| **Ch. 3** | `chapter-04.html` — The Iron Outpost & the Forged Sword | The Iron Outpost (`ENV_R03`) | `Scroll_03_FUSE_Sanctuary.html` | **Spell 3 · FUSE** — `print("Iron" + "Sword")` | Love Others |
| **Ch. 4** | `chapter-05.html` — Whispering Forest & Naming String | Whispering Forest (`ENV_R04`) | `Scroll_04_LISTEN_Sanctuary.html` | **Spell 4 · LISTEN** — `name = input("What is your name? ")` | Love Yourself |
| **Ch. 5** | `chapter-06.html` — Cursed Riverbank & Spatial Pocket | Cursed Riverbank (`ENV_R05`) | `Scroll_05_VAULT_Sanctuary.html` | **Spell 5 · VAULT** — `gold = 100` | Love Yourself |
| **Ch. 6** | `chapter-07.html` — Three Chests & the Wizard's Farewell | Three Chests & Farewell Tree (`ENV_R05A`) | `Scroll_05A_MULTIVAULT_Sanctuary.html` | **Spell 6 · MULTI-VAULT** — `hp, mana, gold = 100, 50, 10` | Love Yourself |
| **Ch. 7** | `chapter-08.html` — The Sleeping Dragon's Library | Sleeping Dragon's Library (`ENV_R06`) | `Scroll_06_WHISPER_Sanctuary.html` | **Spell 7 · WHISPER** — `# I am going inside the library.` | Love Yourself |
| **Ch. 8** | `chapter-09.html` — Four Spirits & Sunnybrook Village | Crystal Cave & Sunnybrook (`ENV_R07`) | `Scroll_07_SHAPESHIFT_Sanctuary.html` | **Spell 8 · SHAPESHIFT** — `print(type("Dragon"))` | Love the Earth |
| **Ch. 9** | `chapter-10.html` — Master Grimsby's Deep Dwarven Forge | Deep Dwarven Forge (`ENV_R08`) | `Scroll_08_FORGE_Sanctuary.html` | **Spell 9 · FORGE** — `hp = 100 - 20` (`+ - * /`) | Love Yourself |
| **Ch. 10** | `chapter-11.html` — Twin Illusion Paths & Eye of Truth | Twin Illusion Paths (`ENV_R09`) | `Scroll_09_SIGHT_Sanctuary.html` | **Spell 10 · SIGHT** — `print(100 > 0)` (`> < ==`) | Love Yourself |
| **Ch. 11** | `chapter-12.html` — The Final Crossroads & Golden Colon Gates | The Final Crossroads (`ENV_R10`) | `Scroll_10_FATE_Sanctuary.html` | **Spell 11 · FATE** — `if / elif / else :` | Love Others |
| **Epilogue** | `chapter-13.html` — The Clash of Fates & Birth of the True Guardian | Citadel of Core & Dawn (`ENV_R11`) | `Scroll_11_EPILOGUE_Sanctuary.html` | **The Grand Weave** — All 11 Spells United | Love the Earth |

---

## Clean Website Structure

Pure static HTML / CSS / JavaScript — **no Node.js, no bundler, no backend database required**:

```text
Hero_Kai_Story_Website/
├── index.html                      # Storybook Home (5-act handscroll, 52-scene reader, Codex & Certificate)
├── hub.html                        # Learning Hub (Hero Spell Console, 12 NPC Cards, 12 Sanctuaries, Cinema, Teacher Mode)
├── netlify.toml                    # Netlify static publish & cache headers for /assets/* and /sanctuaries/*
├── scrollcraft.css                 # Scrollytelling visual styles, responsive layout & reduced-motion support
├── scrollcraft.js                  # Scroll-driven video scrubbing, pan rails, cue reveals & motion engine
├── MODULAR_ARCHITECTURE_PLAN.md    # Modular CSS/JS architecture & maintenance reference
├── .nojekyll                       # Clean static hosting compatibility
├── css/
│   └── 01-tokens-base.css .. 06-responsive.css     # Standalone domain-scoped stylesheets
├── js/
│   ├── main.js                                     # Application bootstrapper
│   ├── core/                                       # Bilingual i18n dictionary, app state store & module registry
│   ├── data/                                       # Offline file:// safe fallbacks (world & Jing Si)
│   └── modules/                                    # Audio, scrollmap, Citadel VFX, reader, codex & PNG seal exporter
├── chapters/
│   ├── chapter-01.html .. chapter-13.html          # Beginner chapter readers (4 scenes + spell box + Sanctuary CTA)
│   └── chapter-01-advance.html .. -13-advance.html # Advance chapter readers (scroll-unfolding full story + Sanctuary CTA)
├── sanctuaries/
│   └── Scroll_01_VOICE_Sanctuary.html .. Scroll_11_EPILOGUE_Sanctuary.html # 12 Dual-Mode interactive Python sanctuaries
├── data/
│   ├── world.json                  # Canonical story, cast, 12 realms, 52 scenes & 11 Python spells
│   └── jingsi_aphorisms.json       # Bilingual Jing Si Aphorisms (EN / 繁體中文) for the take-home certificate
└── assets/
    ├── scenes/                     # 52 illustrated WebP storybook panels (01_PRO_S01.webp .. 52_CH11_S04.webp)
    ├── cast/                       # 8 character portraits (used in chapters, codex & certificate)
    ├── hub/                        # 16 cohesive painterly NPC portraits, exercise covers & spellbook banner
    ├── animations/                 # 5 Full HD MP4 story clips (Hero Vortex backdrop & Story Cinema modal)
    ├── audio/                      # spinning-in-three.mp3 (Hub & Sanctuaries), peaceful.mp3 (Storybook) & spell-chime.mp3
    └── *.mp4 / *.webp / *.png      # Hero scrub clips, Citadel charge battle clip, posters & rail cards
```

---

## Local Preview & Netlify Hosting (Option B)

### Run Locally
Serve from any static HTTP server (recommended so `fetch("data/...")`, same-origin `localStorage` progress sync, and video scrubbing work seamlessly in every browser):

```bash
python -m http.server 8080
```

Then open:
- Storybook Home: `http://localhost:8080/index.html`
- Learning Hub: `http://localhost:8080/hub.html`

### Live Deployment on Netlify
Connected to `Hero-Kai-Pythonia-Adventures` and published at `https://kaipy.netlify.app/`:
- Storybook Home: `https://kaipy.netlify.app/`
- Learning Hub: `https://kaipy.netlify.app/hub.html`
- Interactive Sanctuaries: `https://kaipy.netlify.app/sanctuaries/Scroll_01_VOICE_Sanctuary.html` .. `Scroll_11_EPILOGUE_Sanctuary.html`
