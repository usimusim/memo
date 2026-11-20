"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconChevronLeft } from "../icons";
import {
  addMemo,
  clearDraft,
  getMemo,
  loadDraft,
  refreshMemos,
  saveDraft,
  updateMemo,
  useMemoError,
  useMemos,
  type Draft,
} from "@/lib/memo-store";
import {
  CATEGORIES,
  COLORS,
  sanitizeHtml,
  type Category,
  type MemoColor,
} from "@/lib/memo-utils";
import {
  Chip,
  FormatButton,
  IconButton,
  LabelDot,
  LoadError,
  PrimaryButton,
  Screen,
} from "../memo-ui";

type Active = { bold: boolean; h2: boolean; h3: boolean; list: boolean };
const NONE: Active = { bold: false, h2: false, h3: false, list: false };

export default function WriteScreen() {
  const id = useSearchParams().get("id");
  const memos = useMemos();
  const loadError = useMemoError();
  if (!memos) {
    return (
      <Screen top={48}>
        {loadError ? <LoadError message={loadError} onRetry={refreshMemos} /> : null}
      </Screen>
    );
  }

  const existing = id ? getMemo(id) : undefined;
  if (id && !existing) {
    return (
      <Screen top={48}>
        <nav>
          <IconButton label="뒤로가기" href="/">
            <IconChevronLeft />
          </IconButton>
        </nav>
        <p className="py-space-64 text-center text-body-md text-text-muted">
          수정할 메모를 찾을 수 없어요.
        </p>
      </Screen>
    );
  }

  // 저장하다 만 글이 있으면 그걸로 이어서 쓴다.
  const draft = loadDraft(id ?? "new");
  const initial: Draft = draft ?? {
    title: existing?.title ?? "",
    body: existing?.body ?? "",
    category: existing?.category ?? "개인",
    color: existing?.color ?? "blue",
  };
  return (
    <WriteForm key={id ?? "new"} id={id} initial={initial} hasDraft={!!draft} />
  );
}

function WriteForm({
  id,
  initial,
  hasDraft,
}: {
  id: string | null;
  initial: Draft;
  hasDraft: boolean;
}) {
  const router = useRouter();
  const draftKey = id ?? "new";

  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState<Category>(initial.category);
  const [color, setColor] = useState<MemoColor>(initial.color);
  const [status, setStatus] = useState(hasDraft ? "자동 저장됨" : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<Active>(NONE);

  // 처음 한 번: 본문을 편집기에 넣고, 엔터가 div가 아니라 p로 나뉘게 한다.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(initial.body);
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, [initial.body]);

  // 커서가 있는 글자의 서식을 읽어 서식 막대에 보여 준다.
  useEffect(() => {
    const onSelection = () => {
      const ed = editorRef.current;
      const sel = document.getSelection();
      if (!ed || !sel || !sel.anchorNode || !ed.contains(sel.anchorNode)) return;
      const block = String(document.queryCommandValue("formatBlock")).toLowerCase();
      setActive({
        // 제목·소제목은 원래 굵어서, 따로 굵게 한 글자만 B로 보인다.
        bold:
          document.queryCommandState("bold") && block !== "h2" && block !== "h3",
        h2: block === "h2",
        h3: block === "h3",
        list: document.queryCommandState("insertUnorderedList"),
      });
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  const currentDraft = useCallback(
    (): Draft => ({
      title,
      body: sanitizeHtml(editorRef.current?.innerHTML ?? ""),
      category,
      color,
    }),
    [title, category, color],
  );

  // 입력이 멈추면 임시 저장한다.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleAutosave = useCallback(() => {
    setStatus("저장 중…");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveDraft(draftKey, currentDraft());
      setStatus("자동 저장됨");
    }, 500);
  }, [draftKey, currentDraft]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const pickCategory = (c: Category) => {
    setCategory(c);
    scheduleAutosave();
  };
  const pickColor = (c: MemoColor) => {
    setColor(c);
    scheduleAutosave();
  };

  const format = (cmd: "bold" | "h2" | "h3" | "list") => {
    editorRef.current?.focus();
    if (cmd === "bold") document.execCommand("bold");
    else if (cmd === "list") document.execCommand("insertUnorderedList");
    else {
      const block = String(document.queryCommandValue("formatBlock")).toLowerCase();
      document.execCommand("formatBlock", false, block === cmd ? "p" : cmd);
    }
    scheduleAutosave();
  };

  const save = async () => {
    if (saving) return;
    if (!title.trim()) {
      setError("제목을 입력해 주세요");
      return;
    }
    const input = { ...currentDraft(), title: title.trim() };
    setSaving(true);
    setError("");
    try {
      let target = id;
      if (id) await updateMemo(id, input);
      else target = await addMemo(input);
      if (timer.current) clearTimeout(timer.current);
      clearDraft(draftKey);
      router.replace(`/memo?id=${target}`);
    } catch (e) {
      // 저장에 실패해도 쓴 글은 그대로 남는다.
      setError(e instanceof Error ? e.message : "메모를 저장하지 못했어요.");
      setSaving(false);
    }
  };

  return (
    <Screen top={48}>
      <nav className="flex items-center justify-between">
        <IconButton label="뒤로가기" onClick={() => router.back()}>
          <IconChevronLeft />
        </IconButton>
        <p className="text-caption-sm text-text-muted" aria-live="polite">
          {status}
        </p>
      </nav>

      <main className="flex flex-1 flex-col gap-space-12">
        <label className="flex flex-col gap-space-4 rounded-lg border-2 border-transparent bg-surface-card px-space-20 py-space-16 focus-within:border-primary">
          <span className="text-caption-sm text-text-muted">제목</span>
          <input
            value={title}
            maxLength={60}
            placeholder="제목을 입력하세요"
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
              scheduleAutosave();
            }}
            className="bg-transparent text-title-md text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>
        {error && (
          <p role="alert" className="px-space-8 text-caption-sm text-label-pink">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-space-12 px-space-8 py-space-4">
          <div className="flex items-center gap-space-8">
            <span className="text-caption-sm whitespace-nowrap text-text-muted">분류</span>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onClick={() => pickCategory(c)} />
            ))}
          </div>
          <div className="flex items-center gap-space-8">
            <span className="text-caption-sm whitespace-nowrap text-text-muted">색</span>
            {COLORS.map((c) => (
              <LabelDot key={c} color={c} selected={color === c} onClick={() => pickColor(c)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border-2 border-transparent bg-surface-card focus-within:border-primary">
          <div className="flex h-[52px] items-center gap-space-4 px-space-12">
            <FormatButton label="B" active={active.bold} onClick={() => format("bold")} />
            <FormatButton label="제목" active={active.h2} onClick={() => format("h2")} />
            <FormatButton label="소제목" active={active.h3} onClick={() => format("h3")} />
            <FormatButton label="목록" active={active.list} onClick={() => format("list")} />
          </div>
          <div className="h-px bg-border-default" />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            aria-label="본문"
            data-placeholder="내용을 입력하세요"
            onInput={scheduleAutosave}
            className="memo-body memo-editor min-h-48 px-space-20 py-space-16 outline-none"
          />
        </div>
      </main>

      <PrimaryButton label={saving ? "저장 중…" : "저장하기"} onClick={save} />
    </Screen>
  );
}
