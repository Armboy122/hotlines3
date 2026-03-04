export default function MainLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium">กำลังโหลด...</p>
      </div>
    </div>
  )
}
