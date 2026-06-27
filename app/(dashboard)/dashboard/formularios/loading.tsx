export default function FormulariosLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-10 w-40 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
