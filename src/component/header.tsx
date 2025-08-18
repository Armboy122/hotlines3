import Image from "next/image";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-40 max-w-md mx-auto overflow-hidden">
      {/* Gradient Background with Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 py-4">
        {/* Logo/Icon */}
        <div className="flex items-center justify-center gap-3">
          <Image src="/logoHL.png" alt="My Image" width={50} height={40} />
          <div className="flex items-baseline">
            <h1 className="text-2xl font-black text-white">Hotline</h1>
            <span className="text-3xl text-yellow-400 font-bold">S3</span>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-6"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C240,60 480,0 720,32 C960,64 1200,0 1440,32 L1440,60 L0,60 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </div>
  );
}
