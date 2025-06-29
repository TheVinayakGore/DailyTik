"use client";

export default function LoadingSpinner() {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
