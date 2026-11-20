"use client";

import { useEffect } from "react";

/** 배포한 앱에서만 서비스 워커를 등록한다(개발 중에는 캐시가 헷갈리지 않게 건너뛴다). */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* 등록에 실패해도 앱은 그대로 쓸 수 있다 */
    });
  }, []);
  return null;
}
