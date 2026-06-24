export default function AgendaLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden">
        <div className="flex border-b border-slate-100 p-1 gap-1">
          {[0,1,2,3].map(i => <div key={i} className="h-10 flex-1 bg-slate-50 rounded-xl animate-pulse" />)}
        </div>
        <div className="p-6 h-[calc(100vh-220px)] bg-slate-50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
