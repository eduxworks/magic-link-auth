"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyToken() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage("Missing token or email");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-link", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const url = new URL(window.location.href);
        url.pathname = "/api/auth/verify-link";

        const verifyResponse = await fetch(
          `/api/auth/verify-link?token=${token}&email=${encodeURIComponent(email)}`
        );

        if (!verifyResponse.ok) {
          const data = await verifyResponse.json();
          throw new Error(data.error || "Token verification failed");
        }

        const data = await verifyResponse.json();

        localStorage.setItem("authToken", data.token);

        setStatus("success");
        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Verification failed"
        );
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying your link...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-green-600 dark:text-green-400 font-medium mb-2">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-3xl mb-2">✗</div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{message}</p>
            <a
              href="/login"
              className="inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
