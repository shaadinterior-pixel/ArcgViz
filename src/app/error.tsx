"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);

    // If the error is a ChunkLoadError (happens when a user navigates right after a new deployment), auto-reload the page
    if (error.name === "ChunkLoadError" || error.message.includes("Failed to load chunk")) {
      const isReloaded = sessionStorage.getItem("chunk_error_reloaded");
      if (!isReloaded) {
        sessionStorage.setItem("chunk_error_reloaded", "true");
        window.location.reload();
      }
    } else {
      // Clear the reload flag if a different error occurs so chunk errors can be caught again later
      sessionStorage.removeItem("chunk_error_reloaded");
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFCFB] px-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E2EDE8] shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-black text-[#111111] mb-3">Update Available</h2>
        <p className="text-zinc-500 mb-8 font-medium">
          We recently published a new version of the platform. Please refresh the page to load the latest updates.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-[#24B86C] text-white hover:bg-[#1E995A] shadow-md w-full sm:w-auto"
          >
            Refresh Page
          </Button>
          <Button 
            variant="outline" 
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
