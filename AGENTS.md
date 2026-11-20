# 디자인 토큰

## 색

| 변수 | 값 |
|---|---|
| `color/primary` | `#3182f6` |
| `surface/page` | `#f2f4f6` |
| `surface/card` | `#ffffff` |
| `text/primary` | `#191f28` |
| `text/secondary` | `#4e5968` |
| `text/muted` | `#8b95a1` |
| `text/on-primary` | `#ffffff` |
| `border/default` | `#e5e8eb` |
| `label/blue` | `#3182f6` |
| `label/blue-soft` | `#e8f3ff` |
| `label/green` | `#12a150` |
| `label/green-soft` | `#e3f8ec` |
| `label/orange` | `#f76808` |
| `label/orange-soft` | `#fff1e5` |
| `label/pink` | `#e5397a` |
| `label/pink-soft` | `#ffeaf1` |

## 간격

| 변수 | 값 |
|---|---|
| `space/4` | 4px |
| `space/8` | 8px |
| `space/12` | 12px |
| `space/16` | 16px |
| `space/20` | 20px |
| `space/24` | 24px |
| `space/34` | 34px |
| `space/48` | 48px |
| `space/64` | 64px |

## 모서리

| 변수 | 값 |
|---|---|
| `radius/sm` | 12px |
| `radius/md` | 16px |
| `radius/lg` | 20px |
| `radius/xl` | 24px |
| `radius/full` | 999px |

## 텍스트 스타일 (Noto Sans KR)

| 스타일 | 굵기 | 크기 | 줄 높이 | 자간 |
|---|---|---|---|---|
| `heading/xl` | Bold | 28px | 38px | -0.8px |
| `heading/lg` | Bold | 26px | 36px | -0.8px |
| `title/lg` | Bold | 20px | 28px | -0.4px |
| `title/md` | Bold | 17px | 24px | -0.3px |
| `label/md` | Bold | 15px | 22px | -0.2px |
| `body/md` | Regular | 16px | 28px | -0.2px |
| `body/sm` | Regular | 14px | 20px | -0.1px |
| `caption/md` | Medium | 15px | 22px | -0.2px |
| `caption/sm` | Medium | 13px | 18px | 0 |
| `button/md` | Bold | 17px | 24px | -0.2px |

# 디자인 규칙

- 위 디자인 토큰에 없는 색·간격·모서리 값은 쓰지 않는다. 새 값이 필요하면 먼저 물어본다.
- 같은 모양의 UI는 기존 컴포넌트를 재사용한다.
- 한글은 Noto Sans KR로 쓰고, 단어 중간에서 줄을 바꾸지 않는다.
- 코드에서는 디자인 토큰 이름만 쓰고, 아이콘 색은 글자색을 따른다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
