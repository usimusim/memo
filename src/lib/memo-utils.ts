export const CATEGORIES = ["업무", "개인", "아이디어"] as const;
export type Category = (typeof CATEGORIES)[number];

export const COLORS = ["blue", "green", "orange", "pink"] as const;
export type MemoColor = (typeof COLORS)[number];

export type Memo = {
  id: string;
  title: string;
  /** 서식이 있는 본문(HTML). p, h2, h3, ul, li, strong만 쓴다. */
  body: string;
  category: Category;
  color: MemoColor;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

const DAY = 86_400_000;

export function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayDiff(t: number, now = Date.now()) {
  return Math.round((startOfDay(now) - startOfDay(t)) / DAY);
}

/** 목록 오른쪽 날짜: 오늘 / 어제 / 10월 28일 */
export function shortDate(t: number) {
  const n = dayDiff(t);
  if (n <= 0) return "오늘";
  if (n === 1) return "어제";
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 상세 화면 날짜: 10월 30일 오후 2:40 */
export function longDate(t: number) {
  const d = new Date(t);
  const h = d.getHours();
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${period} ${h12}:${mm}`;
}

/** 홈 위쪽 날짜: 10월 30일 금요일 */
export function todayLabel() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

/** 날짜 묶음 이름: 오늘 / 어제 / 이번 주 / 이전 */
export function sectionOf(t: number) {
  const n = dayDiff(t);
  if (n <= 0) return "오늘";
  if (n === 1) return "어제";
  if (n <= 7) return "이번 주";
  return "이전";
}

const ALLOWED: Record<string, string> = {
  P: "p",
  DIV: "p",
  H2: "h2",
  H3: "h3",
  UL: "ul",
  LI: "li",
  STRONG: "strong",
  B: "strong",
  BR: "br",
};

function escapeText(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 허용한 태그만 남긴다. 브라우저에서만 부른다. */
export function sanitizeHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (n: Node): string => {
    if (n.nodeType === Node.TEXT_NODE) return escapeText(n.textContent ?? "");
    if (n.nodeType !== Node.ELEMENT_NODE) return "";
    const el = n as Element;
    const tag = ALLOWED[el.tagName];
    const inner = Array.from(el.childNodes).map(walk).join("");
    if (!tag) return inner;
    if (tag === "br") return "<br>";
    return `<${tag}>${inner}</${tag}>`;
  };
  return (
    Array.from(doc.body.childNodes)
      .map(walk)
      .join("")
      // 엔터를 여러 번 눌러 생긴 빈 줄은 저장하지 않는다.
      .replace(/<p>(<br>)?<\/p>/g, "")
  );
}

/** 목록 미리보기: 본문 첫 문단(또는 첫 목록) 글자 */
export function previewOf(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const first = doc.querySelector("p, li");
  const text = (first?.textContent ?? doc.body.textContent ?? "").trim();
  return text || "내용 없음";
}

/** 검색·공유에 쓰는 글자만 */
export function plainText(html: string) {
  const doc = new DOMParser().parseFromString(
    html.replace(/<\/(p|h2|h3|li)>/g, "\n"),
    "text/html",
  );
  return (doc.body.textContent ?? "").trim();
}
