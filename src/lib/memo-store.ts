import { useSyncExternalStore } from "react";
import { startOfDay, type Category, type Memo, type MemoColor } from "./memo-utils";

const KEY = "memo-app:memos:v1";
const DRAFT_PREFIX = "memo-app:draft:";
const DAY = 86_400_000;

const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cacheVal: Memo[] | null = null;
let memoryOnly: Memo[] | null = null; // localStorage를 못 쓸 때

function seed(): Memo[] {
  const now = Date.now();
  const today = startOfDay(now);
  // 오늘 메모는 지금보다 앞선 시각으로 맞춘다(최신순이 시안과 같도록).
  const at = (daysAgo: number, hour: number, k: number) =>
    daysAgo === 0
      ? Math.min(today + hour * 3_600_000, now - k * 60_000)
      : today - daysAgo * DAY + hour * 3_600_000;
  const m = (
    id: string,
    title: string,
    category: Category,
    color: MemoColor,
    pinned: boolean,
    t: number,
    body: string,
  ): Memo => ({
    id,
    title,
    body,
    category,
    color,
    pinned,
    createdAt: t,
    updatedAt: t,
  });
  return [
    m("seed-1", "디자인 리뷰 회의록", "업무", "blue", true, at(0, 9, 5),
      "<p>검수 기준과 다음 할 일 정리</p><h2>회의 요약</h2><p>시안 검수 기준을 팀 규칙으로 정리했다. <strong>목표는 AI가 그대로 구현할 수 있는 시안</strong>이다.</p><h3>결정한 것</h3><ul><li>묶음은 오토레이아웃, 늘어날 것은 Fill</li><li>색과 간격은 변수로 연결</li><li>시안은 프레임 링크로 넘기기</li></ul><h3>다음 할 일</h3><p>금요일까지 각자 맡은 화면을 채점해 온다.</p>"),
    m("seed-2", "주말 등산 준비", "개인", "green", true, at(1, 20, 0),
      "<p>물 두 병, 간식, 바람막이 챙기기</p><h2>준비물</h2><ul><li>물 두 병</li><li>간식과 바람막이</li><li>보조 배터리</li></ul><h3>출발</h3><p><strong>토요일 오전 7시</strong>에 집 앞에서 출발한다.</p>"),
    m("seed-3", "장보기 목록", "개인", "pink", false, at(0, 8, 20),
      "<ul><li>우유, 계란, 사과, 커피 원두</li><li>세제</li></ul>"),
    m("seed-4", "앱 아이콘 아이디어", "아이디어", "orange", false, at(0, 7, 40),
      "<p>메모지 모서리가 접힌 모양</p><h2>아이콘 콘셉트</h2><p><strong>접힌 모서리 하나</strong>로 메모 앱임을 알린다.<br>작은 크기에서도 또렷하게 보이게 만든다.</p><h3>후보</h3><ul><li>메모지 모서리가 접힌 모양</li><li>연필 끝과 종이 한 장</li><li>말풍선 속 체크 표시</li></ul><h3>색상 방향</h3><p>기본은 <strong>파란색 바탕에 흰 선</strong>으로 간다.<br>라벨 색은 아이콘 안에서 쓰지 않는다.</p><h3>다음 할 일</h3><ul><li>후보 세 개를 작은 크기로 비교</li><li>팀에 투표 요청하기</li></ul>"),
    m("seed-5", "읽을 책", "개인", "green", false, at(1, 11, 0),
      "<ul><li>디자인 시스템 책 두 권</li></ul>"),
    m("seed-6", "온보딩 화면 개선", "업무", "blue", false, at(3, 15, 0),
      "<p>첫 화면 문구는 짧게, 버튼은 하나만</p>"),
    m("seed-7", "브랜드 색 후보", "아이디어", "orange", false, at(4, 10, 0),
      "<p>파랑, 초록, 주황 세 가지 비교</p>"),
  ];
}

function read(): Memo[] {
  try {
    let raw = localStorage.getItem(KEY);
    if (raw === null) {
      raw = JSON.stringify(seed());
      localStorage.setItem(KEY, raw);
    }
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      try {
        cacheVal = JSON.parse(raw) as Memo[];
      } catch {
        cacheVal = [];
      }
    }
    return cacheVal!;
  } catch {
    memoryOnly ??= seed();
    return memoryOnly;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function write(next: Memo[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    memoryOnly = next;
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** 저장된 메모 전체. 서버·첫 화면에서는 null. */
export function useMemos() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function getMemo(id: string) {
  return read().find((m) => m.id === id);
}

export type MemoInput = Pick<Memo, "title" | "body" | "category" | "color">;

export function addMemo(input: MemoInput) {
  const now = Date.now();
  const memo: Memo = {
    ...input,
    id: crypto.randomUUID(),
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  write([memo, ...read()]);
  return memo.id;
}

export function updateMemo(id: string, patch: Partial<MemoInput>) {
  write(
    read().map((m) => (m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m)),
  );
}

export function removeMemo(id: string) {
  write(read().filter((m) => m.id !== id));
}

export function togglePin(id: string) {
  // 고정만 바꾸고 수정 시각은 건드리지 않는다.
  write(read().map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
}

export type Draft = MemoInput;

export function loadDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: Draft) {
  try {
    localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(draft));
  } catch {
    /* 저장 공간이 없으면 임시 저장만 건너뛴다 */
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key);
  } catch {
    /* 무시 */
  }
}
