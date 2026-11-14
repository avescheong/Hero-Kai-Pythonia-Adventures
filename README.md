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

### 4. Interactive Realms, Soothing Music & Take-Home Keepsake Certificate
- **8 Storybook Characters (`Hero Kai`, `String`, `The Great Wizard`, `Grandma Looma`, `Outpost Blacksmith`, `Master Grimsby`, `The Bug King`, `Baby Praying Mantis`)**: Wide atmospheric showcase cards that jump straight to each character's debut chapter.
- **12 Interactive Realm Explorer Cards (`ENV_R00` – `ENV_R11`)**: Click any realm to preview its artwork, cast its **"✨ Test Realm Spell"** live in a safe sandbox, or launch its Beginner / Advance chapter.
- **Soothing Background Audio**: Gentle ambient music (`peaceful.mp3`) and soft spell chimes (`spell-chime.mp3`) designed to keep children calm, focused, and immersed.
- **Take-Home Spellkeeper Certificate (`960×540` PNG) + Jing Si Aphorisms (靜思語)**: At the Dawn Sanctuary finale, students type their name and a personal kindness takeaway, draw a bilingual **Jing Si Aphorism**, and download a high-resolution keepsake certificate illustrated with **Hero Kai**.

### 5. Kindness & Character First
Pythonia was written around three timeless character pillars—**Love Yourself**, **Love Others**, and **Love the Earth**—teaching kids that rushing carelessly creates glitches (*The Bug King*), while patience, care, and thoughtful logic build software that genuinely helps others.

---

## Story & Python Curriculum Map (13 Parts · 52 Scenes)

| Part | Chapter | Kingdom Realm | Python Spell & Syntax | Kindness Pillar |
| :--- | :--- | :--- | :--- | :--- |
| **Prologue** | The Glitch, the Gentle Heart & the Bug King | Virtual City & Entry Road (`ENV_R00`) | **The Kind Pause** — `# Pause first. Care for others before rushing.` | Love Others |
| **Ch. 1** | Breaking the Hush of Silent Village | Silent Village (`ENV_R01`) | **Spell 1 · VOICE** — `print("Hello!")` | Love Others |
| **Ch. 2** | Grandma Looma's Cottage & the Friendly Pup | Loom Forest & Weaver Cottage (`ENV_R02`) | **Spell 2 · WEAVE** — `print("Hello", "Pythonia!")` | Love Others |
| **Ch. 3** | The Iron Outpost & the Forged Sword | The Iron Outpost (`ENV_R03`) | **Spell 3 · FUSE** — `print("Iron" + "Sword")` | Love Others |
| **Ch. 4** | Whispering Forest & Naming String | Whispering Forest (`ENV_R04`) | **Spell 4 · LISTEN** — `name = input("What is your name? ")` | Love Yourself |
| **Ch. 5** | Cursed Riverbank & Spatial Pocket | Cursed Riverbank (`ENV_R05`) | **Spell 5 · VAULT** — `gold = 100` | Love Yourself |
| **Ch. 6** | Three Chests & the Wizard's Farewell | Three Chests & Farewell Tree (`ENV_R05A`) | **Spell 6 · MULTI-VAULT** — `hp, mana, gold = 100, 50, 10` | Love Yourself |
| **Ch. 7** | The Sleeping Dragon's Library | Sleeping Dragon's Library (`ENV_R06`) | **Spell 7 · WHISPER** — `# I am going inside the library.` | Love Yourself |
| **Ch. 8** | Four Spirits & Sunnybrook Village | Crystal Cave & Sunnybrook (`ENV_R07`) | **Spell 8 · SHAPESHIFT** — `print(type("Dragon"))` | Love the Earth |
| **Ch. 9** | Master Grimsby's Deep Dwarven Forge | Deep Dwarven Forge (`ENV_R08`) | **Spell 9 · FORGE** — `hp = 100 - 20` (`+ - * /`) | Love Yourself |
| **Ch. 10** | Twin Illusion Paths & Eye of Truth | Twin Illusion Paths (`ENV_R09`) | **Spell 10 · SIGHT** — `print(100 > 0)` (`> < ==`) | Love Yourself |
| **Ch. 11** | The Final Crossroads & Golden Colon Gates | The Final Crossroads (`ENV_R10`) | **Spell 11 · FATE** — `if / elif / else :` | Love Others |
| **Epilogue** | The Clash of Fates & Birth of the True Guardian | Citadel of Core & Dawn (`ENV_R11`) | **The Grand Weave** — All 11 Spells United | Love the Earth |

---

## Clean Website Structure

Pure static HTML / CSS / JavaScript — **no Node.js, no bundler, no backend database required**:

```text
Hero_Kai_Story_Website/
├── index.html                  # 5-act scrollytelling experience, 52-scene reader, Realm modal, Spellkeeper Certificate
├── scrollcraft.css             # Scrollytelling visual styles, responsive layout & reduced-motion support
├── scrollcraft.js              # Scroll-driven video scrubbing, pan rails, cue reveals & motion engine
├── .nojekyll                   # Ready for direct static hosting on GitHub Pages
├── chapters/
│   ├── chapter-01.html .. chapter-13.html          # Beginner chapter readers (4 scenes + spell box each)
│   └── chapter-01-advance.html .. -13-advance.html # Advance chapter readers (scroll-unfolding full story)
├── data/
│   ├── world.json              # Canonical story, cast, 12 realms, 52 scenes & 11 Python spells
│   └── jingsi_aphorisms.json   # Bilingual Jing Si Aphorisms (EN / 繁體中文) for the take-home certificate
└── assets/
    ├── scenes/                 # 52 illustrated WebP storybook panels (01_PRO_S01.webp .. 52_CH11_S04.webp)
    ├── cast/                   # 8 character portraits (used in chapters, codex & certificate)
    ├── audio/                  # peaceful.mp3 & spell-chime.mp3
    └── *.mp4 / *.webp / *.png  # Hero scrub clips, Citadel charge battle clip, posters & rail cards
```

---

## Local Preview & GitHub Pages Hosting

### Run Locally
Serve from any static HTTP server (recommended so `fetch("data/...")` and video range scrubbing work seamlessly in every browser):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

### Host on GitHub Pages
1. Open the repository **Settings → Pages** on GitHub.
2. Under **Build and deployment**, select **Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, and click **Save**.
3. Your interactive storybook will be live at `https://avescheong.github.io/Hero-Kai-Pythonia-Adventures/`.
