import { Suspense } from "react";
import MemoScreen from "@/components/screens/memo-screen";

export default function Memo() {
  return (
    <Suspense>
      <MemoScreen />
    </Suspense>
  );
}
