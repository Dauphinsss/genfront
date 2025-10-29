"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Loading } from "@/components/ui/loading";

export default function LoginCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    const fetchUser = async () => {
      if (!token) {
        router.push("/");
        return;
      }

      localStorage.setItem("pyson_token", token);

      try {
        const { data: user } = await axios.get(
          "http://localhost:4000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem("pyson_user", JSON.stringify(user));
 
        const { data: privileges } = await axios.get(
          "http://localhost:4000/privileges/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem("pyson_privileges", JSON.stringify(privileges));

      } catch (err) {
        console.error("Error en login:", err);
      } finally {
        router.push("/");
      }
    };

    fetchUser();
  }, [searchParams, router]);

  return <Loading fullScreen />;
}
