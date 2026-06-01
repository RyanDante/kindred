export default function AdminFeedback() {
  return (
    <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 select-none">
      
      {/* Title Block & Item Count Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-[#1E3A8A] tracking-tight">
          User Insights
        </h2>
        
        {/* Custom Purple Count Pill Element */}
        <div className="bg-purple-50 border border-purple-100 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase text-purple-600">
          0 Items
        </div>
      </div>

      {/* Empty State Presentation Layout Context */}
      <div className="flex-1 min-h-[400px] flex items-center justify-center py-20 text-center">
        <p className="text-slate-400 font-medium italic text-sm tracking-wide">
          No feedback received yet.
        </p>
      </div>

    </main>
  );
}