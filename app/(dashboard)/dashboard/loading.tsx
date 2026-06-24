export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-3 w-40 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0,1].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}
