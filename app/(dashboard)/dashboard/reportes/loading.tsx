export default function ReportesLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}
