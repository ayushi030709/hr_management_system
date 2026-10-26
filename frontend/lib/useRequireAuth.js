import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";

export function useRequireAuth() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/");
    }
  }, [ready, user, router]);

  return { user, ready };
}
