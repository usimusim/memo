import { Suspense } from "react";
import WriteScreen from "@/components/screens/write-screen";

export default function Write() {
  return (
    <Suspense>
      <WriteScreen />
    </Suspense>
  );
}
