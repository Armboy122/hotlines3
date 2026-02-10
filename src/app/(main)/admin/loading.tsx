export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-gray-200 h-40 sm:h-48" />

      {/* Section skeletons */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="h-8 w-40 bg-gray-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2].map((card) => (
              <div key={card} className="h-40 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
