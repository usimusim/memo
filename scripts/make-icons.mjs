// PWA 아이콘 만들기: node scripts/make-icons.mjs
// 파란 바탕(color/primary)에 흰색 메모 아이콘. 가장자리가 잘려도(마스크) 아이콘이 남도록 가운데 60%에 그린다.
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import { writeFileSync } from "node:fs";

const PRIMARY = "#3182f6"; // color/primary
const ON_PRIMARY = "#ffffff"; // text/on-primary

async function make(size, file) {
  const icon = Math.round(size * 0.6);
  const res = new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          background: PRIMARY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: {
          type: "svg",
          props: {
            width: icon,
            height: icon,
            viewBox: "0 0 22 22",
            fill: "none",
            children: [
              {
                type: "path",
                props: {
                  d: "M6.41667 3.66667H12.8333L16.5 7.33333V18.3333H6.41667V3.66667Z",
                  stroke: ON_PRIMARY,
                  strokeWidth: 1.6,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                },
              },
              {
                type: "path",
                props: {
                  d: "M12.8333 3.66667V7.33333H16.5M9.16667 11H13.75M9.16667 14.6667H13.75",
                  stroke: ON_PRIMARY,
                  strokeWidth: 1.6,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                },
              },
            ],
          },
        },
      },
    },
    { width: size, height: size },
  );
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log("made", file, size);
}

await make(192, "public/icons/icon-192.png");
await make(512, "public/icons/icon-512.png");
await make(180, "src/app/apple-icon.png");
await make(512, "src/app/icon.png");
