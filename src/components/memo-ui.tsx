import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconNote,
  IconPinSmall,
  IconPlus,
  IconSearch,
} from "./icons";
import type { MemoColor } from "@/lib/memo-utils";

// Tailwind가 클래스를 찾을 수 있게 전체 이름을 그대로 적는다.
const tileStyle: Record<MemoColor, string> = {
  blue: "bg-label-blue-soft text-label-blue",
  green: "bg-label-green-soft text-label-green",
  orange: "bg-label-orange-soft text-label-orange",
  pink: "bg-label-pink-soft text-label-pink",
};

const dotStyle: Record<MemoColor, string> = {
  blue: "bg-label-blue",
  green: "bg-label-green",
  orange: "bg-label-orange",
  pink: "bg-label-pink",
};

const colorName: Record<MemoColor, string> = {
  blue: "파랑",
  green: "초록",
  orange: "주황",
  pink: "분홍",
};

/** 화면 한 장. 모바일 폭(390px) 기준. */
export function Screen({
  top = 64,
  bottomPadding = false,
  children,
}: {
  top?: 48 | 64;
  /** 아래에 붙는 주 버튼이 없는 화면은 아래 여백을 준다. */
  bottomPadding?: boolean;
  children: ReactNode;
}) {
  const pt = top === 48 ? "pt-space-48" : "pt-space-64";
  const pb = bottomPadding ? "pb-space-34" : "";
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-space-16 px-space-16 ${pt} ${pb}`}
    >
      {children}
    </div>
  );
}

/** Chip: 분류 칩. 고른 칩은 selected. */
export function Chip({
  label,
  selected = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center rounded-full px-space-16 text-label-md whitespace-nowrap ${
        selected
          ? "bg-primary text-text-on-primary"
          : "bg-surface-card text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

/** Card/Header: 카드 머리글. pin은 고정 표시, action은 오른쪽 전체 보기. */
export function CardHeader({
  title,
  pin = false,
  actionHref,
}: {
  title: string;
  pin?: boolean;
  /** 있으면 오른쪽에 "전체 보기"가 붙는다. */
  actionHref?: string;
}) {
  return (
    <div className="flex h-10 items-center gap-space-4 pt-space-12 pr-space-16 pb-space-4 pl-space-20">
      {pin && <IconPinSmall className="size-4 text-primary" />}
      <p className="flex-1 text-label-md text-text-primary">{title}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="flex items-center gap-space-4 text-caption-md whitespace-nowrap text-text-muted"
        >
          전체 보기
          <IconChevronRight />
        </Link>
      )}
    </div>
  );
}

/** Memo/Item: 메모 목록의 한 줄. 미리보기는 1줄까지, 넘치면 말줄임. 누르면 상세로 이동. */
export function MemoItem({
  title,
  preview,
  date,
  color = "blue",
  href,
}: {
  title: string;
  preview: string;
  date: string;
  color?: MemoColor;
  href?: string;
}) {
  const className =
    "flex h-[72px] items-center gap-space-16 px-space-20 py-space-12";
  const body = (
    <>
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-sm ${tileStyle[color]}`}
      >
        <IconNote />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-space-4">
        <p className="truncate text-title-md text-text-primary">{title}</p>
        <p className="truncate text-body-sm text-text-secondary">{preview}</p>
      </div>
      <p className="text-caption-sm whitespace-nowrap text-text-muted">{date}</p>
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Memo Card: 흰 카드. 머리글과 메모 줄을 담는다. */
export function MemoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-xl bg-surface-card py-space-8">
      {children}
    </section>
  );
}

/** Section/Label: 날짜 묶음 머리글. 스크롤해도 위쪽에 붙어 있다. */
export function SectionLabel({ label }: { label: string }) {
  return (
    <h2 className="sticky top-0 z-10 flex h-[22px] items-start bg-surface-page px-space-8 text-caption-md text-text-muted">
      {label}
    </h2>
  );
}

/** Input/Search: 검색 칸. 입력하는 즉시 목록을 거른다. */
export function InputSearch({
  value,
  onChange,
  placeholder = "제목이나 내용으로 찾기",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex h-12 items-center gap-space-8 rounded-md bg-surface-card px-space-16 text-text-muted">
      <IconSearch />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body-md text-text-primary outline-none placeholder:text-text-muted"
      />
    </label>
  );
}

/** Button/Text(정렬): 누르면 고르는 메뉴를 연다. */
export function SortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-space-4 text-caption-md whitespace-nowrap text-text-muted"
    >
      {label}
      <IconChevronDown />
    </button>
  );
}

/** 작은 메뉴(정렬, 더보기). 바깥을 누르면 닫는다. */
export function Menu({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="fixed inset-0 z-20 cursor-default"
      />
      <div
        role="menu"
        className="absolute top-full right-0 z-30 mt-space-4 flex min-w-32 flex-col overflow-hidden rounded-md border border-border-default bg-surface-card py-space-4"
      >
        {children}
      </div>
    </>
  );
}

export function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`px-space-16 py-space-12 text-left text-label-md whitespace-nowrap ${
        danger ? "text-label-pink" : "text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}

/** Button/Primary: 화면의 주 버튼. 아래쪽에 가로로 꽉 차게 두고, 스크롤돼도 붙어 있다. */
export function PrimaryButton({
  label,
  href,
  onClick,
  icon = false,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: boolean;
}) {
  const className =
    "flex h-14 w-full items-center justify-center gap-space-8 rounded-md bg-primary px-space-24 text-button-md text-text-on-primary";
  const content = (
    <>
      {icon && <IconPlus />}
      {label}
    </>
  );
  return (
    <div className="sticky bottom-0 bg-surface-page pb-space-34">
      {href ? (
        <Link href={href} className={className}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={className}>
          {content}
        </button>
      )}
    </div>
  );
}

/** Button/Secondary: 목록 끝의 더 보기처럼 약한 동작에 쓰는 보조 버튼. */
export function SecondaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full items-center justify-center rounded-md bg-surface-card px-space-24 text-label-md text-primary"
    >
      {label}
    </button>
  );
}

/** Badge: 메모의 분류 배지. 색은 메모의 색 라벨을 따른다. */
export function Badge({ label, color }: { label: string; color: MemoColor }) {
  return (
    <span
      className={`flex h-[26px] items-center rounded-full px-space-8 text-caption-sm whitespace-nowrap ${tileStyle[color]}`}
    >
      {label}
    </span>
  );
}

/** Button/Icon: 40×40 누르는 영역 가운데에 아이콘을 둔다. */
export function IconButton({
  label,
  href,
  onClick,
  active = false,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  /** 켜진 상태(예: 고정됨)는 파란색 */
  active?: boolean;
  children: ReactNode;
}) {
  const className = `flex size-10 items-center justify-center rounded-sm ${
    active ? "text-primary" : "text-text-primary"
  }`;
  return href ? (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  ) : (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}

/** Button/Format: 서식 버튼. 커서가 있는 글자의 서식은 active로 보인다. */
export function FormatButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      // 글자 선택이 풀리지 않게 한다
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-9 items-center justify-center rounded-sm px-space-12 text-label-md whitespace-nowrap ${
        active ? "bg-label-blue-soft text-primary" : "text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

/** Label/Dot: 색 라벨 고르기. 고른 색은 바깥에 파란 테두리가 생긴다. */
export function LabelDot({
  color,
  selected,
  onClick,
}: {
  color: MemoColor;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${colorName[color]} 라벨`}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-full border-2 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <span className={`size-[22px] rounded-full ${dotStyle[color]}`} />
    </button>
  );
}

/** 잠깐 보였다 사라지는 안내 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-space-48 left-1/2 z-40 -translate-x-1/2 rounded-md bg-text-primary px-space-16 py-space-12 text-label-md whitespace-nowrap text-text-on-primary"
    >
      {message}
    </div>
  );
}
