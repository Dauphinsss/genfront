"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

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

      // Guardamos el token en localStorage
      localStorage.setItem("pyson_token", token);

      try {
        // Llamamos al backend con axios
        const { data: user } = await axios.get(
          "http://localhost:4000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Guardamos usuario en localStorage
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
        router.push("/"); // Redirigimos siempre al home
      }
    };

    fetchUser();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold">Procesando login...</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Por favor espera mientras verificamos tus credenciales
          </p>
        </div>
      </div>
    </div>
  );
}
