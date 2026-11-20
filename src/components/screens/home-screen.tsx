"use client";

import { useState } from "react";
import { useMemos } from "@/lib/memo-store";
import {
  CATEGORIES,
  previewOf,
  shortDate,
  todayLabel,
  type Category,
  type Memo,
} from "@/lib/memo-utils";
import {
  CardHeader,
  Chip,
  MemoCard,
  MemoItem,
  PrimaryButton,
  Screen,
} from "../memo-ui";

type Filter = "전체" | Category;
const FILTERS: Filter[] = ["전체", ...CATEGORIES];

function Row({ memo }: { memo: Memo }) {
  return (
    <MemoItem
      title={memo.title}
      preview={previewOf(memo.body)}
      date={shortDate(memo.updatedAt)}
      color={memo.color}
      href={`/memo?id=${memo.id}`}
    />
  );
}

export default function HomeScreen() {
  const memos = useMemos();
  const [filter, setFilter] = useState<Filter>("전체");

  if (!memos) return <Screen top={64}>{null}</Screen>;

  const visible = memos
    .filter((m) => filter === "전체" || m.category === filter)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const pinned = visible.filter((m) => m.pinned);
  const recent = visible.filter((m) => !m.pinned).slice(0, 3);

  return (
    <Screen top={64}>
      <main className="flex flex-1 flex-col gap-space-16">
        <header className="flex flex-col gap-space-8 px-space-8">
          <p className="text-caption-md text-text-muted">{todayLabel()}</p>
          <h1 className="text-heading-xl text-text-primary">
            오늘까지 메모를
            <br />
            <span className="text-primary">{memos.length}개</span> 남겼어요
          </h1>
        </header>

        <div className="flex gap-space-8 overflow-x-auto px-space-4">
          {FILTERS.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={filter === label}
              onClick={() => setFilter(label)}
            />
          ))}
        </div>

        {pinned.length > 0 && (
          <MemoCard>
            <CardHeader title="고정한 메모" pin />
            {pinned.map((m) => (
              <Row key={m.id} memo={m} />
            ))}
          </MemoCard>
        )}

        <MemoCard>
          <CardHeader title="최근 메모" actionHref="/all" />
          {recent.length > 0 ? (
            recent.map((m) => <Row key={m.id} memo={m} />)
          ) : (
            <p className="px-space-20 py-space-16 text-body-md text-text-muted">
              {memos.length === 0
                ? "아직 메모가 없어요. 첫 메모를 써 보세요."
                : "이 분류에는 메모가 없어요."}
            </p>
          )}
        </MemoCard>
      </main>

      <PrimaryButton label="새 메모 쓰기" href="/write" icon />
    </Screen>
  );
}
