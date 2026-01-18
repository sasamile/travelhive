"use client";

import { categoryItems } from "@/components/customers/data";
import {
  Castle,
  Grape,
  Leaf,
  Mountain,
  Palmtree,
  Waves,
} from "lucide-react";

const categoryIcons = {
  castle: Castle,
  waves: Waves,
  mountain: Mountain,
  grape: Grape,
  palm: Palmtree,
  spa: Leaf,
};

function CategoriesScroller() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {categoryItems.map((item) => {
        const Icon = categoryIcons[item.icon as keyof typeof categoryIcons] ?? Leaf;
        return (
          <button 
            key={item.label}
            className="group flex min-w-[100px] flex-col items-center gap-2"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-transparent bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all group-hover:border-primary dark:bg-gray-800">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoriesScroller;
