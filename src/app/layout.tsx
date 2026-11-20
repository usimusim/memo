import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import ServiceWorker from "@/components/service-worker";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "메모",
  description: "간단하게 쓰고 모아 보는 메모 앱",
  applicationName: "메모",
  // iOS 홈 화면에 추가했을 때 앱처럼 열리고 이름이 '메모'로 보인다.
  appleWebApp: { capable: true, title: "메모", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f4f6", // surface/page
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
