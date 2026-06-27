export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F2F4F6] animate-pulse">
      <div className="bg-[#0D1B2A] h-40" />
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded-full w-full" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
