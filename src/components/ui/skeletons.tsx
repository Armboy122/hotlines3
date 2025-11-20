import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FormSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 animate-pulse">
      <Card className="card-glass overflow-hidden border-emerald-100/50">
        <CardHeader className="bg-gray-100 h-24 relative overflow-hidden">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8 space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-100 rounded-xl" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
