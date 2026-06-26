import { AnalyticsView } from "@/components/dashboard/analytics/AnalyticsView";

export const dynamic = "force-dynamic";

export default function ReportesPage() {
  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <AnalyticsView />
      </div>
    </div>
  );
}
