"use client";

import { Globe } from "lucide-react";


function CustomersFooter() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm font-medium text-gray-500 md:flex-row md:px-12">
        <div className="flex flex-wrap items-center gap-6">
          <span>© 2024 Viajes Premium Inc.</span>
          <a className="hover:underline" href="#">
            Privacidad
          </a>
          <a className="hover:underline" href="#">
            Términos
          </a>
          <a className="hover:underline" href="#">
            Mapa del sitio
          </a>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 hover:underline">
            <Globe className="text-base" />
            Español (ES)
          </button>
          <button className="flex items-center gap-2 hover:underline">
            € EUR
          </button>
        </div>
      </div>
    </footer>
  );
}

export default CustomersFooter;
