import React from "react";

export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />

      {/* Decorative floating orbs */}
      <div className="orb-green top-20 right-20 animation-delay-0" />
      <div className="orb-blue bottom-20 left-20 animation-delay-1000" />
      <div className="orb-yellow top-1/2 right-1/3 animation-delay-2000" />
      <div className="orb-purple bottom-1/3 right-1/4 animation-delay-3000" />
    </div>
  );
}
