"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconChevronLeft, IconMore, IconPin, IconShare } from "../icons";
import { removeMemo, togglePin, useMemos } from "@/lib/memo-store";
import { longDate, plainText, sanitizeHtml } from "@/lib/memo-utils";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  PrimaryButton,
  Screen,
  Toast,
} from "../memo-ui";

export default function MemoScreen() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const memos = useMemos();
  const memo = memos?.find((m) => m.id === id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const html = useMemo(() => (memo ? sanitizeHtml(memo.body) : ""), [memo]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!memos) return <Screen top={48}>{null}</Screen>;

  if (!memo) {
    return (
      <Screen top={48}>
        <nav>
          <IconButton label="뒤로가기" href="/">
            <IconChevronLeft />
          </IconButton>
        </nav>
        <p className="py-space-64 text-center text-body-md text-text-muted">
          메모를 찾을 수 없어요.{" "}
          <Link href="/" className="text-primary">
            홈으로
          </Link>
        </p>
      </Screen>
    );
  }

  const share = async () => {
    const text = `${memo.title}\n\n${plainText(memo.body)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: memo.title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast("메모를 복사했어요");
    } catch {
      // 공유 창을 닫은 경우는 알리지 않는다.
    }
  };

  const remove = () => {
    setMenuOpen(false);
    if (window.confirm("이 메모를 삭제할까요? 되돌릴 수 없어요.")) {
      removeMemo(memo.id);
      router.replace("/");
    }
  };

  const pin = () => {
    togglePin(memo.id);
    setToast(memo.pinned ? "고정을 풀었어요" : "메모를 고정했어요");
  };

  return (
    <Screen top={48}>
      <nav className="flex items-center justify-between">
        <IconButton label="뒤로가기" onClick={() => router.back()}>
          <IconChevronLeft />
        </IconButton>
        <div className="relative flex">
          <IconButton
            label={memo.pinned ? "고정 해제" : "고정"}
            active={memo.pinned}
            onClick={pin}
          >
            <IconPin />
          </IconButton>
          <IconButton label="공유" onClick={share}>
            <IconShare />
          </IconButton>
          <IconButton label="더보기" onClick={() => setMenuOpen((v) => !v)}>
            <IconMore />
          </IconButton>
          <Menu open={menuOpen} onClose={() => setMenuOpen(false)}>
            <MenuItem
              label="수정"
              onClick={() => router.push(`/write?id=${memo.id}`)}
            />
            <MenuItem
              label={memo.pinned ? "고정 해제" : "고정"}
              onClick={() => {
                setMenuOpen(false);
                pin();
              }}
            />
            <MenuItem label="삭제" danger onClick={remove} />
          </Menu>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        <article className="flex flex-col gap-space-12 rounded-xl bg-surface-card px-space-20 py-space-24">
          <div className="flex items-center gap-space-8">
            <Badge label={memo.category} color={memo.color} />
            <p className="text-caption-sm text-text-muted">
              {longDate(memo.updatedAt)}
            </p>
          </div>
          <h1 className="text-heading-lg break-words text-text-primary">
            {memo.title}
          </h1>
          <hr className="h-px border-0 bg-border-default" />
          <div
            className="memo-body"
            // 저장 전·표시 전에 허용한 태그만 남긴다(sanitizeHtml).
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>

      <PrimaryButton label="수정하기" href={`/write?id=${memo.id}`} />
      <Toast message={toast} />
    </Screen>
  );
}
