import { useEffect, useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";
import type { Category, Memo, MemoColor } from "./memo-utils";

// 메모는 Supabase의 memos 표에 저장한다. 화면에는 마지막으로 받아 온 목록을 보여 준다.
// (작성 중인 임시 저장본만 이 브라우저에 둔다.)

type Row = {
  id: string;
  title: string;
  body: string;
  category: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

const toMemo = (r: Row): Memo => ({
  id: r.id,
  title: r.title,
  body: r.body,
  category: r.category as Category,
  color: r.color as MemoColor,
  pinned: r.pinned,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});

let memos: Memo[] | null = null;
let loadError: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

let inflight: Promise<void> | null = null;

/** Supabase에서 메모를 다시 받아 온다. 이미 받는 중이면 그걸 기다린다. */
export function refreshMemos(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await getSupabase()
        .from("memos")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      memos = (data as Row[]).map(toMemo);
      loadError = null;
    } catch (e) {
      loadError = e instanceof Error ? e.message : "메모를 불러오지 못했어요.";
    }
    emit();
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** 저장된 메모 전체. 받아 오기 전에는 null. 화면이 열릴 때와 다시 볼 때마다 새로 받아 온다. */
export function useMemos() {
  useEffect(() => {
    void refreshMemos();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshMemos();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);
  return useSyncExternalStore(subscribe, () => memos, () => null);
}

/** 메모를 받아 오지 못했을 때의 안내 문구(없으면 null). */
export function useMemoError() {
  return useSyncExternalStore(subscribe, () => loadError, () => null);
}

export function getMemo(id: string) {
  return memos?.find((m) => m.id === id);
}

export type MemoInput = Pick<Memo, "title" | "body" | "category" | "color">;

function fail(message: string, error: { message: string }): never {
  throw new Error(`${message} (${error.message})`);
}

export async function addMemo(input: MemoInput) {
  const { data, error } = await getSupabase()
    .from("memos")
    .insert(input)
    .select()
    .single();
  if (error) fail("메모를 저장하지 못했어요.", error);
  const memo = toMemo(data as Row);
  memos = [memo, ...(memos ?? [])];
  emit();
  return memo.id;
}

export async function updateMemo(id: string, patch: Partial<MemoInput>) {
  const { data, error } = await getSupabase()
    .from("memos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) fail("메모를 저장하지 못했어요.", error);
  const next = toMemo(data as Row);
  memos = (memos ?? []).map((m) => (m.id === id ? next : m));
  emit();
}

export async function removeMemo(id: string) {
  const { error } = await getSupabase().from("memos").delete().eq("id", id);
  if (error) fail("메모를 지우지 못했어요.", error);
  memos = (memos ?? []).filter((m) => m.id !== id);
  emit();
}

export async function togglePin(id: string) {
  const current = memos?.find((m) => m.id === id);
  if (!current) return;
  const pinned = !current.pinned;
  // 먼저 화면에 반영하고, 저장에 실패하면 되돌린다. 수정 시각은 건드리지 않는다.
  memos = (memos ?? []).map((m) => (m.id === id ? { ...m, pinned } : m));
  emit();
  const { error } = await getSupabase().from("memos").update({ pinned }).eq("id", id);
  if (error) {
    memos = (memos ?? []).map((m) => (m.id === id ? { ...m, pinned: !pinned } : m));
    emit();
    fail("고정을 바꾸지 못했어요.", error);
  }
}

// ----- 작성 중인 글 임시 저장(이 브라우저에만) -----

const DRAFT_PREFIX = "memo-app:draft:";

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
