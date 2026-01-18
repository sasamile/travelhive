"use client";

export default function TermsStep() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div>
          <h2 className="font-caveat text-4xl text-slate-900">Insurance & Policies</h2>
          <p className="text-sm text-slate-500">Define the safeguards and terms for this expedition.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-neutral-50 rounded-lg transition-colors">
            Reset
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
            Save Progress
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">📅</span>
              <h3 className="text-lg font-semibold text-slate-900">Cancellation Policy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Policy Type</label>
                <div className="relative group">
                  <select defaultValue="moderate" className="w-full h-10 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                    <option value="flexible">Flexible (100% refund up to 7 days)</option>
                    <option value="moderate">Moderate (50% refund up to 14 days)</option>
                    <option value="strict">Strict (No refund within 30 days)</option>
                    <option value="custom">Custom Policy</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-slate-600">
                    ⌄
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                <div className="flex gap-3">
                  <span className="text-indigo-600 text-lg">ℹ️</span>
                  <div>
                    <p className="text-xs font-semibold text-indigo-900 mb-1">Standard Recommendation</p>
                    <p className="text-[11px] text-indigo-700 leading-relaxed">
                      Most Chilean expeditions use 'Moderate' to secure local lodge bookings while remaining traveler-friendly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">⚖️</span>
              <h3 className="text-lg font-semibold text-slate-900">Terms & Conditions</h3>
            </div>
            <div className="space-y-2">
              <textarea
                className="w-full min-h-[200px] px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                placeholder="Detail your specific terms, age restrictions, or physical requirements..."
              ></textarea>
              <div className="flex justify-between items-center px-1">
                <p className="text-[11px] text-slate-400">Markdown supported</p>
                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700">Import Template</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">📎</span>
              <h3 className="text-lg font-semibold text-slate-900">Waivers & Health Requirements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-neutral-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-neutral-50/50 hover:bg-neutral-50 hover:border-indigo-200 transition-all cursor-pointer group">
                <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  📄
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">Liability Waiver</p>
                  <p className="text-xs text-slate-500 mt-1">Upload PDF (Max 5MB)</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-neutral-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-neutral-50/50 hover:bg-neutral-50 hover:border-indigo-200 transition-all cursor-pointer group">
                <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">Health Declaration</p>
                  <p className="text-xs text-slate-500 mt-1">Upload PDF (Max 5MB)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-neutral-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Attached Documents</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center">
                    📄
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Standard_Expedition_Waiver_v2.pdf</p>
                    <p className="text-[10px] text-slate-400">Uploaded 2 hours ago • 1.2 MB</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
