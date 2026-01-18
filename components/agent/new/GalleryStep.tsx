"use client";

import { Plus, Grid3x3, List, Star, Trash2, Download, Paperclip } from "lucide-react";

export default function GalleryStep() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <h2 className="font-caveat text-4xl text-slate-900">Media Gallery</h2>
        <p className="text-sm text-slate-500 mt-1">Manage photos and trip documents for your clients.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
        <div className="mb-12">
          <div className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
            <div className="size-16 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Upload Photos</h3>
            <p className="text-sm text-slate-500 mt-1">
              Drag and drop images, or <span className="text-indigo-600 font-medium">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-4">JPG, PNG, WEBP (Max. 10MB per file)</p>
          </div>
        </div>
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Trip Photos <span className="text-sm font-normal text-slate-400 ml-2">(12 photos)</span>
            </h3>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <Grid3x3 className="size-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <List className="size-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-100 ring-4 ring-indigo-500/10 shadow-lg">
              <img
                alt="Gallery"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt4KjPiv3tmVE6vtuBynqB-CdIXK-nvyoQhqBlsX0UFaGkqVkupL4WYw4OCFHyXG9DCu9Jd_bsPc3Mw567N6JmOMdjV5UoxKIW7trLakB6_5dT1aiOfTDhcY8RyvepWCsAVmlUYpRshv1ldGdLZLpMKLgl6-JgzzlR5lKJR655kLQ0bvE-Gkqbot5PYMVE0GrHzI-vGTSjLb7TH_AmPkIspR8bJWLhWvXU0FWCZ9-2jr7p62AD3lIXtEdDwtlgTnITa_HIo4y6CW0"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded shadow-sm">Cover Photo</span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-600 shadow-sm hover:text-indigo-600">
                  ✏️
                </button>
                <button className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-xl transition-all">
                <img
                  alt="Gallery"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={`https://lh3.googleusercontent.com/aida-public/AB6AXuB01IwgiiuWIrlSg1M_wfSPOOSRq8RgcJdDfBEq2bVaUIrixAMTbGgGJvy8kIkKzEFstpUfUcj_sz67e7gdOWq_RD8gEVhHnf7ki2YT9XS-5_wCt7fHiW0uq4hN72ch8GGq-K3ys9_Woy4a6mEPqopVVxr3G69qlPbmnr0w7JjZrJWA8Q0oAw5NuCFuhu2cA-WFD9y0_WvxQjbc8Eoyf5-Rz8DV47trpYo6QH6rQazdMOP8kkvyc3kNTnNK2HjksS1cvb_FbNqk8k4`}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-600 shadow-sm hover:text-indigo-600">
                    <Star className="size-4" />
                  </button>
                  <button className="size-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-12 border-t border-neutral-100 mb-20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Document Uploads</h3>
              <p className="text-sm text-slate-500">Attach brochures, packing lists, or waivers.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
              <Paperclip className="size-4" />
              Upload PDF
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:border-indigo-100 hover:bg-neutral-50/50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-red-50 flex items-center justify-center">
                  📄
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Packing_List_Patagonia.pdf</h4>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">1.2 MB • Updated 2 days ago</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-900">
                  <Download className="size-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:border-indigo-100 hover:bg-neutral-50/50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  📄
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Trip_Brochure_v2.pdf</h4>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">4.8 MB • Updated 5 hours ago</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-900">
                  <Download className="size-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
