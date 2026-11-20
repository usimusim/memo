"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "../icons";
import { refreshMemos, useMemoError, useMemos } from "@/lib/memo-store";
import {
  CATEGORIES,
  plainText,
  previewOf,
  sectionOf,
  shortDate,
  type Category,
  type Memo,
} from "@/lib/memo-utils";
import {
  Chip,
  IconButton,
  InputSearch,
  LoadError,
  MemoCard,
  MemoItem,
  Menu,
  MenuItem,
  Screen,
  SecondaryButton,
  SectionLabel,
  SortButton,
} from "../memo-ui";

type Filter = "전체" | Category;
type Sort = "최신순" | "오래된순";
const FILTERS: Filter[] = ["전체", ...CATEGORIES];
const PAGE = 20;

export default function AllScreen() {
  const router = useRouter();
  const memos = useMemos();
  const error = useMemoError();
  const [filter, setFilter] = useState<Filter>("전체");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  if (!memos) {
    return (
      <Screen top={48} bottomPadding>
        {error ? <LoadError message={error} onRetry={refreshMemos} /> : null}
      </Screen>
    );
  }

  const q = query.trim().toLowerCase();
  const matched = memos
    .filter((m) => filter === "전체" || m.category === filter)
    .filter(
      (m) =>
        !q ||
        m.title.toLowerCase().includes(q) ||
        plainText(m.body).toLowerCase().includes(q),
    )
    .sort((a, b) =>
      sort === "최신순" ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt,
    );
  const shown = matched.slice(0, limit);
  const remaining = matched.length - shown.length;

  // 날짜 묶음별로 나눈다(보이는 순서 그대로).
  const sections: { label: string; items: Memo[] }[] = [];
  for (const m of shown) {
    const label = sectionOf(m.updatedAt);
    const last = sections[sections.length - 1];
    if (last && last.label === label) last.items.push(m);
    else sections.push({ label, items: [m] });
  }

  const reset = (fn: () => void) => {
    fn();
    setLimit(PAGE);
  };

  return (
    <Screen top={48} bottomPadding>
      <nav className="relative flex items-center">
        <IconButton label="뒤로가기" onClick={() => router.back()}>
          <IconChevronLeft />
        </IconButton>
        <div className="flex flex-1 items-baseline gap-space-8 px-space-4 whitespace-nowrap">
          <h1 className="text-title-lg text-text-primary">전체 메모</h1>
          <span className="text-caption-md text-text-muted">{matched.length}</span>
        </div>
        <SortButton label={sort} onClick={() => setSortOpen((v) => !v)} />
        <Menu open={sortOpen} onClose={() => setSortOpen(false)}>
          {(["최신순", "오래된순"] as Sort[]).map((s) => (
            <MenuItem
              key={s}
              label={s}
              onClick={() => {
                setSort(s);
                setSortOpen(false);
              }}
            />
          ))}
        </Menu>
      </nav>

      <InputSearch value={query} onChange={(v) => reset(() => setQuery(v))} />

      <div className="flex gap-space-8 overflow-x-auto px-space-4">
        {FILTERS.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={filter === label}
            onClick={() => reset(() => setFilter(label))}
          />
        ))}
      </div>

      <main className="flex flex-col gap-space-20">
        {matched.length === 0 ? (
          <p className="py-space-48 text-center text-body-md text-text-muted">
            찾는 메모가 없어요
          </p>
        ) : (
          sections.map((s) => (
            <section key={s.label} className="flex flex-col gap-space-8">
              <SectionLabel label={s.label} />
              <MemoCard>
                {s.items.map((m) => (
                  <MemoItem
                    key={m.id}
                    title={m.title}
                    preview={previewOf(m.body)}
                    date={shortDate(m.updatedAt)}
                    color={m.color}
                    href={`/memo?id=${m.id}`}
                  />
                ))}
              </MemoCard>
            </section>
          ))
        )}
      </main>

      {remaining > 0 && (
        <SecondaryButton
          label={`메모 ${Math.min(PAGE, remaining)}개 더 보기`}
          onClick={() => setLimit((l) => l + PAGE)}
        />
      )}
    </Screen>
  );
}
