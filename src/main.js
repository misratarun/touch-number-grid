import { createVoice } from "./voice.js";

// ---- Things to tune ---------------------------------------------------------

const SPEECH_RATE = 0.85;  // 1 is the device's normal speed
const PRESS_MS = 250;      // how long a touched button stays dark

// The three boards on the first page, in order.
const PAGES = [
  { id: "count", name: "Count", glyph: "1 2 3" },
  { id: "add",   name: "Add",   glyph: "+" },
  { id: "times", name: "Times", glyph: "×" },
];

const ONE  = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const MANY = ["", "ones", "twos", "threes", "fours", "fives", "sixes", "sevens", "eights", "nines", "tens"];

// What is spoken. Tables are said the way they are chanted: "3 eights are 24".
const SPEAK = {
  times: {
    pick: a => `table of ${a}`,                                   // touching a number on the left
    line: (a, b) => (a === 1 ? `1 ${ONE[b]} is ${b}` : `${a} ${MANY[b]} are ${a * b}`),
  },
  add: {
    pick: a => `${a}`,
    line: (a, b) => `${a} plus ${b} is ${a + b}`,
  },
};

// ---- Set-up -----------------------------------------------------------------

const app = document.getElementById("app");
const voice = createVoice(SPEECH_RATE);
let visit = 0;        // goes up each time the page changes, so late voices can't draw on a new page
let opening = false;  // true between touching a board's button and that board opening

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  if (tag === "button") node.type = "button";
  return node;
};

// A touched button darkens briefly, then goes back to normal.
app.addEventListener("pointerdown", e => {
  const b = e.target.closest("button");
  if (!b) return;
  b.classList.add("pressed");
  setTimeout(() => b.classList.remove("pressed"), PRESS_MS);
});
// No menus, no drag-scrolling, no double-tap zoom.
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
document.addEventListener("dblclick", e => e.preventDefault());

// ---- First page: three buttons ----------------------------------------------

function showHome() {
  visit++;
  opening = false;
  voice.stop();
  app.className = "home";
  app.replaceChildren(...PAGES.map(p => {
    const b = el("button", `door ${p.id}`, p.glyph);
    b.setAttribute("aria-label", p.name);
    b.addEventListener("click", async () => {
      if (opening) return;
      opening = true;
      const here = visit;
      // The board opens only after its name has been spoken (or 3 seconds, if the voice stalls).
      await Promise.race([voice.say(p.name), new Promise(r => setTimeout(r, 3000))]);
      if (here === visit) (p.id === "count" ? showCount : showTable)(p);
    });
    return b;
  }));
}

// The parts every board shares: back button and dots on one side, buttons on the other.
function frame(page, boardClass) {
  visit++;
  app.className = `board-page ${page.id}`;
  const back = el("button", "back");
  back.setAttribute("aria-label", "Back");
  back.innerHTML = `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  back.addEventListener("click", showHome);
  const dots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  dots.setAttribute("class", "dots");
  dots.setAttribute("viewBox", "0 0 105 105");
  dots.setAttribute("preserveAspectRatio", "xMidYMin meet");
  dots.setAttribute("aria-hidden", "true");
  const panel = el("div", "panel");
  panel.append(back, dots);
  const board = el("div", boardClass);
  app.replaceChildren(panel, board);
  return { here: visit, panel, dots, board };
}

// ---- Count: a square of 1 to 100 ----------------------------------------------

function showCount(page) {
  const { here, panel, dots, board } = frame(page, "board square");
  const words = el("div", "words");
  const wordsBox = el("div", "words-box");
  wordsBox.append(words);
  panel.insertBefore(wordsBox, dots);

  for (let n = 1; n <= 100; n++) {
    const b = el("button", "cell", n);
    b.addEventListener("click", () => voice.say(String(n), () => {
      if (here !== visit) return;
      board.querySelector(".current")?.classList.remove("current");
      b.classList.add("current");
      words.textContent = n;
      drawDots(dots, run([[n, "a"]]));
    }));
    board.append(b);
  }
}

// ---- Add and Times: one table at a time ---------------------------------------
// Numbers 1 to 10 down the left choose a table. Its ten lines are written out in
// order beside it, each with its answer. Touching a line says it and draws it.

function showTable(page) {
  const { here, dots, board } = frame(page, "board table");
  const times = page.id === "times";
  const speak = SPEAK[page.id];
  const answer = (a, b) => (times ? a * b : a + b);
  const picks = el("div", "picks"), lines = el("div", "lines");
  const pick = [], line = [];
  let table = 0; // the table whose lines are on screen

  function setTable(a) {
    pick[table]?.classList.remove("chosen");
    table = a;
    pick[a].classList.add("chosen");
    lines.querySelector(".current")?.classList.remove("current");
    for (let b = 1; b <= 10; b++) {
      line[b].textContent = `${a} ${page.glyph} ${b} = ${answer(a, b)}`;
      line[b].setAttribute("aria-label", speak.line(a, b));
    }
  }

  for (let n = 1; n <= 10; n++) {
    pick[n] = el("button", "pick", n);
    pick[n].setAttribute("aria-label", speak.pick(n));
    pick[n].addEventListener("click", () => voice.say(speak.pick(n), () => {
      if (here !== visit) return;
      setTable(n);
      drawDots(dots, []);
    }));
    picks.append(pick[n]);

    line[n] = el("button", "line");
    line[n].addEventListener("click", () => {
      const a = table; // the line he can see when he touches it
      voice.say(speak.line(a, n), () => {
        if (here !== visit) return;
        if (a !== table) setTable(a);
        lines.querySelector(".current")?.classList.remove("current");
        line[n].classList.add("current");
        drawDots(dots, times ? rows(a, n) : run([[a, "a"], [n, "b"]]));
      });
    });
    lines.append(line[n]);
  }
  board.append(picks, lines);
  setTable(1);
}

// ---- Dots ---------------------------------------------------------------------
// Counting and adding: dots run left to right in rows of ten, with a small gap
// after five so a row can be read at a glance. The second number of a sum has
// its own colour. Times: a block of a rows with b dots in each row.

const gap = i => 6 + i * 10 + (i >= 5 ? 3 : 0);

function run(groups) {
  const list = [];
  let i = 0;
  for (const [count, kind] of groups)
    for (let k = 0; k < count; k++, i++) list.push({ x: gap(i % 10), y: gap(Math.floor(i / 10)), kind });
  return list;
}

function rows(a, b) {
  const list = [];
  for (let r = 0; r < a; r++)
    for (let c = 0; c < b; c++) list.push({ x: 6 + c * 10, y: 6 + r * 10, kind: "a" });
  return list;
}

function drawDots(svg, list) {
  svg.innerHTML = list.map(d => `<circle class="dot-${d.kind}" cx="${d.x}" cy="${d.y}" r="3.9"/>`).join("");
}

showHome();
