import React from "react";

export default function LoadingSpinner({
  size = "md",
  text = "Carregando...",
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-green-600`}
      ></div>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
}
