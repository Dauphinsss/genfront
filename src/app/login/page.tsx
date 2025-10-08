
import { Suspense } from "react";
import LoginCallback from "./LoginCallback";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginCallback />
    </Suspense>
  );
}
