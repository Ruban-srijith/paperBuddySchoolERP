"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Auto-recover from ChunkLoadErrors by doing a full page reload
    // This happens when Vercel deploys a new build while user is on old version
    if (
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("Failed to fetch dynamically imported module")
    ) {
      console.warn("[ChunkLoadError] New deployment detected - reloading...");
      window.location.reload();
    }
  }, [error]);

  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("Loading chunk");

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "#f4f0e6",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        {isChunkError ? (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(244,240,230,0.2)",
                borderTop: "3px solid #e5c158",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#a3c9b0", fontSize: 14 }}>
              New version detected — reloading...
            </p>
          </>
        ) : (
          <>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "#f4f0e6",
              }}
            >
              Something went wrong
            </h2>
            <p style={{ color: "#a3c9b0", fontSize: 13, marginBottom: "1.5rem", wordBreak: "break-word" }}>
              {typeof error?.message === "string" ? error.message : "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.6rem 1.5rem",
                background: "#2b4c37",
                border: "1px solid rgba(229,193,88,0.4)",
                borderRadius: 9999,
                color: "#f4f0e6",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
