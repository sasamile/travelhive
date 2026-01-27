"use client";

import { useState, useEffect } from "react";
import { useTripStore, type DiscountCode } from "@/store/tripStore";
import { Plus, Trash2, Tag, User } from "lucide-react";
import { gsap } from "gsap";

export default function DiscountCodesAndPromoterSection() {
  const tripData = useTripStore((state) => state.tripData);
  const setDiscountCodes = useTripStore((state) => state.setDiscountCodes);
  const setPromoter = useTripStore((state) => state.setPromoter);

  const [discountCodes, setLocalDiscountCodes] = useState<DiscountCode[]>(
    tripData.discountCodes || []
  );
  const [promoterCode, setLocalPromoterCode] = useState(tripData.promoterCode || "");
  const [promoterName, setLocalPromoterName] = useState(tripData.promoterName || "");

  // Sincronizar con el store
  useEffect(() => {
    if (tripData.discountCodes) {
      setLocalDiscountCodes(tripData.discountCodes);
    }
    if (tripData.promoterCode !== undefined) {
      setLocalPromoterCode(tripData.promoterCode || "");
    }
    if (tripData.promoterName !== undefined) {
      setLocalPromoterName(tripData.promoterName || "");
    }
  }, [tripData.discountCodes, tripData.promoterCode, tripData.promoterName]);

  // Guardar cambios en el store
  useEffect(() => {
    setDiscountCodes(discountCodes);
  }, [discountCodes, setDiscountCodes]);

  useEffect(() => {
    setPromoter(promoterCode || undefined, promoterName || undefined);
  }, [promoterCode, promoterName, setPromoter]);

  const addDiscountCode = () => {
    const newCode: DiscountCode = {
      code: "",
      percentage: 0,
      maxUses: null,
      perUserLimit: null,
    };
    setLocalDiscountCodes([...discountCodes, newCode]);
  };

  const removeDiscountCode = (index: number) => {
    setLocalDiscountCodes(discountCodes.filter((_, i) => i !== index));
  };

  const updateDiscountCode = (index: number, field: keyof DiscountCode, value: any) => {
    const updated = [...discountCodes];
    updated[index] = { ...updated[index], [field]: value };
    setLocalDiscountCodes(updated);
  };

  return (
    <div className="space-y-6" data-section>
      {/* Códigos de Descuento */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-indigo-600" />
            <label className="text-sm font-semibold text-slate-700">
              Códigos de Descuento (Opcional)
            </label>
          </div>
          <button
            type="button"
            onClick={addDiscountCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="size-3.5" />
            Agregar Código
          </button>
        </div>

        {discountCodes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No hay códigos de descuento. Haz clic en "Agregar Código" para crear uno.
          </p>
        ) : (
          <div className="space-y-3">
            {discountCodes.map((code, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Código #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDiscountCode(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={code.code}
                      onChange={(e) =>
                        updateDiscountCode(index, "code", e.target.value.toUpperCase())
                      }
                      placeholder="Ej: SUMMER2024"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Porcentaje de Descuento (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={code.percentage || 0}
                      onChange={(e) =>
                        updateDiscountCode(
                          index,
                          "percentage",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="15"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Usos Máximos (Opcional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={code.maxUses || ""}
                      onChange={(e) =>
                        updateDiscountCode(
                          index,
                          "maxUses",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="Sin límite"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Límite por Usuario (Opcional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={code.perUserLimit || ""}
                      onChange={(e) =>
                        updateDiscountCode(
                          index,
                          "perUserLimit",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="Sin límite"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promoter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="size-4 text-indigo-600" />
          <label className="text-sm font-semibold text-slate-700">
            Promoter (Opcional)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Código del Promoter
            </label>
            <input
              type="text"
              value={promoterCode}
              onChange={(e) => setLocalPromoterCode(e.target.value.toUpperCase())}
              placeholder="Ej: INFLUENCER123"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre del Promoter
            </label>
            <input
              type="text"
              value={promoterName}
              onChange={(e) => setLocalPromoterName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {promoterCode && (
          <button
            type="button"
            onClick={() => {
              setLocalPromoterCode("");
              setLocalPromoterName("");
            }}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Eliminar promoter
          </button>
        )}
      </div>
    </div>
  );
}
