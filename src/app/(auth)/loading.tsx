export default function AuthLoading() {
  return (
    <div className="app-smart-gradient min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-sky-100" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium">กำลังโหลด...</p>
      </div>
    </div>
  )
}
