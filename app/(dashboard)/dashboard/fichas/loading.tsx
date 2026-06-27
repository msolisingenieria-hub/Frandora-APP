export default function FichasLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
