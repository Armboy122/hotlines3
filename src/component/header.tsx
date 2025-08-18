import Image from "next/image";

export default function Header() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background with Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 ">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-30 h-22  ">
            <Image src="/logoHL.png" alt="My Image" width={800} height={500} />
          </div>
          <h1 className="text-4xl font-black text-white mb-12 tracking-tight">
            Hotline<span className="text-yellow-300">S3</span>
          </h1>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,120 480,0 720,64 C960,128 1200,0 1440,64 L1440,120 L0,120 Z"
            fill="white"
            fillOpacity="0.1"
          />
          <path
            d="M0,80 C240,100 480,60 720,80 C960,100 1200,60 1440,80 L1440,120 L0,120 Z"
            fill="white"
            fillOpacity="0.15"
          />
          <path
            d="M0,96 C240,108 480,84 720,96 C960,108 1200,84 1440,96 L1440,120 L0,120 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </div>
  );
}
