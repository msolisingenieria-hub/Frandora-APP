export default function EquipoLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-28 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-40 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 w-36 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[0,1,2].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}
