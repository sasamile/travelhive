"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, MapPin, Image as ImageIcon, X, Upload, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface ItineraryStepProps {
  tripId?: string;
}

interface Activity {
  type: string;
  title: string;
  description?: string;
  time?: string;
  imageData?: string; // Base64 en lugar de URL
  latitude?: number;
  longitude?: number;
  poiId?: string;
}

interface Day {
  day: number;
  title: string;
  subtitle?: string;
  activities: Activity[];
  order: number;
}

const STORAGE_KEY_ITINERARY = "trip_itinerary_draft";

export default function ItineraryStep({ tripId }: ItineraryStepProps) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const [days, setDays] = useState<Day[]>([]);
  const [saving, setSaving] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null); // Para editar actividad existente
  const [tempActivity, setTempActivity] = useState<Partial<Activity>>({
    type: "activity",
    title: "",
    description: "",
    time: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar itinerario guardado del localStorage
  useEffect(() => {
    if (!tripId) {
      // Cargar del localStorage
      const stored = localStorage.getItem(STORAGE_KEY_ITINERARY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Solo establecer si es un array válido y no está vacío
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDays(parsed);
          } else {
            // Si está vacío o no es válido, asegurar que days esté vacío
            setDays([]);
          }
        } catch (error) {
          console.error("Error al cargar itinerario del localStorage:", error);
          setDays([]);
        }
      } else {
        // Si no hay nada guardado, asegurar que days esté vacío
        setDays([]);
      }
    } else {
      // Cargar del localStorage con tripId
      const stored = localStorage.getItem(`${STORAGE_KEY_ITINERARY}_${tripId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Solo establecer si es un array válido y no está vacío
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDays(parsed);
          } else {
            // Si está vacío o no es válido, asegurar que days esté vacío
            setDays([]);
          }
        } catch (error) {
          console.error("Error al cargar itinerario:", error);
          setDays([]);
        }
      } else {
        // Si no hay nada guardado, asegurar que days esté vacío
        setDays([]);
      }
    }
  }, [tripId]);

  // Guardar en localStorage automáticamente - SIEMPRE guardar cuando hay días
  useEffect(() => {
    // Solo guardar si hay días para evitar guardar arrays vacíos
    if (days.length > 0) {
      const keyWithTripId = tripId ? `${STORAGE_KEY_ITINERARY}_${tripId}` : null;
      const keyBase = STORAGE_KEY_ITINERARY;
      
      // Guardar siempre en ambas claves para asegurar persistencia
      if (keyWithTripId) {
        localStorage.setItem(keyWithTripId, JSON.stringify(days));
      }
      localStorage.setItem(keyBase, JSON.stringify(days));
    }
  }, [days, tripId]);

  // Cleanup: guardar antes de desmontar el componente si hay días
  useEffect(() => {
    return () => {
      // Guardar una última vez antes de desmontar solo si hay días
      if (days.length > 0) {
        const keyWithTripId = tripId ? `${STORAGE_KEY_ITINERARY}_${tripId}` : null;
        const keyBase = STORAGE_KEY_ITINERARY;
        
        if (keyWithTripId) {
          localStorage.setItem(keyWithTripId, JSON.stringify(days));
        }
        localStorage.setItem(keyBase, JSON.stringify(days));
      }
    };
  }, [days, tripId]);

  const addDay = () => {
    const newDay: Day = {
      day: days.length + 1,
      title: "",
      subtitle: "",
      activities: [],
      order: days.length + 1,
    };
    const updatedDays = [...days, newDay];
    setDays(updatedDays);
    
    // Guardar inmediatamente en localStorage
    const keyWithTripId = tripId ? `${STORAGE_KEY_ITINERARY}_${tripId}` : null;
    const keyBase = STORAGE_KEY_ITINERARY;
    if (keyWithTripId) {
      localStorage.setItem(keyWithTripId, JSON.stringify(updatedDays));
    }
    localStorage.setItem(keyBase, JSON.stringify(updatedDays));
  };

  // Función helper para guardar en localStorage
  const saveToLocalStorage = (daysToSave: Day[]) => {
    const keyWithTripId = tripId ? `${STORAGE_KEY_ITINERARY}_${tripId}` : null;
    const keyBase = STORAGE_KEY_ITINERARY;
    if (keyWithTripId) {
      localStorage.setItem(keyWithTripId, JSON.stringify(daysToSave));
    }
    localStorage.setItem(keyBase, JSON.stringify(daysToSave));
    
    // Disparar evento personalizado para notificar al componente padre
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("itineraryUpdated"));
    }
  };

  const removeDay = (dayIndex: number) => {
    const updatedDays = days
      .filter((_, idx) => idx !== dayIndex)
      .map((d, idx) => ({ ...d, day: idx + 1, order: idx + 1 }));
    setDays(updatedDays);
    
    // Guardar inmediatamente en localStorage
    if (updatedDays.length > 0) {
      saveToLocalStorage(updatedDays);
    } else {
      // Si no hay días, eliminar del localStorage
      const keyWithTripId = tripId ? `${STORAGE_KEY_ITINERARY}_${tripId}` : null;
      const keyBase = STORAGE_KEY_ITINERARY;
      if (keyWithTripId) {
        localStorage.removeItem(keyWithTripId);
      }
      localStorage.removeItem(keyBase);
    }
  };

  const updateDay = (dayIndex: number, field: keyof Day, value: any) => {
    const updatedDays = days.map((d, idx) => (idx === dayIndex ? { ...d, [field]: value } : d));
    setDays(updatedDays);
    
    // Guardar inmediatamente en localStorage
    saveToLocalStorage(updatedDays);
  };

  const openActivityModal = (dayIndex: number, activityIndex?: number) => {
    setCurrentDayIndex(dayIndex);
    
    if (activityIndex !== undefined) {
      // Modo edición: cargar datos de la actividad existente
      const activity = days[dayIndex].activities[activityIndex];
      setEditingActivityIndex(activityIndex);
      setTempActivity({
        type: activity.type,
        title: activity.title,
        description: activity.description || "",
        time: activity.time || "",
        imageData: activity.imageData,
        latitude: activity.latitude,
        longitude: activity.longitude,
        poiId: activity.poiId,
      });
    } else {
      // Modo creación: actividad nueva
      setEditingActivityIndex(null);
      setTempActivity({
        type: "activity",
        title: "",
        description: "",
        time: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    
    setShowActivityModal(true);
  };

  const closeActivityModal = () => {
    setShowActivityModal(false);
    setCurrentDayIndex(null);
    setEditingActivityIndex(null);
    setTempActivity({
      type: "activity",
      title: "",
      description: "",
      time: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTempActivity({ ...tempActivity, imageData: base64String });
    };
    reader.onerror = () => {
      toast.error("Error al cargar la imagen");
    };
    reader.readAsDataURL(file);
  };

  const saveActivity = () => {
    if (currentDayIndex === null) return;

    const activityData: Activity = {
      type: tempActivity.type || "activity",
      title: tempActivity.title || "",
      description: tempActivity.description || "",
      time: tempActivity.time || "",
      imageData: tempActivity.imageData,
      latitude: tempActivity.latitude,
      longitude: tempActivity.longitude,
      poiId: tempActivity.poiId,
    };

    const updatedDays = [...days];
    
    if (editingActivityIndex !== null) {
      // Actualizar actividad existente
      updatedDays[currentDayIndex].activities[editingActivityIndex] = activityData;
      setDays(updatedDays);
      // Guardar inmediatamente en localStorage
      saveToLocalStorage(updatedDays);
      closeActivityModal();
      toast.success("Actividad actualizada");
    } else {
      // Agregar nueva actividad
      updatedDays[currentDayIndex].activities.push(activityData);
      setDays(updatedDays);
      // Guardar inmediatamente en localStorage
      saveToLocalStorage(updatedDays);
      closeActivityModal();
      toast.success("Actividad agregada");
    }
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].activities.splice(activityIndex, 1);
    setDays(updatedDays);
    // Guardar inmediatamente en localStorage
    saveToLocalStorage(updatedDays);
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: any
  ) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].activities[activityIndex] = {
      ...updatedDays[dayIndex].activities[activityIndex],
      [field]: value,
    };
    setDays(updatedDays);
    // Guardar inmediatamente en localStorage
    saveToLocalStorage(updatedDays);
  };


  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-100 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div>
          <h2 className="text-3xl font-caveat font-bold tracking-tight text-slate-900">
            Planificación del Viaje
          </h2>
          <p className="text-sm text-slate-500">
            Organiza cada día del viaje con actividades y detalles
          </p>
        </div>
        <button
          onClick={addDay}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors"
        >
          <Plus className="size-4" />
          Agregar Día
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto p-8 relative ${days.length > 0 ? 'itinerary-line' : ''}`}>
        {days.length > 0 && (
          <style jsx>{`
            .itinerary-line::before {
              content: '';
              position: absolute;
              left: 20px;
              top: 60px;
              bottom: 0;
              width: 1px;
              background: #e2e8f0;
            }
          `}</style>
        )}
        
        {days.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="size-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
              <Tag className="size-10 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-caveat font-semibold text-slate-700 mb-2">Comienza a planificar tu viaje</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              Agrega días a tu itinerario para organizar las actividades y experiencias de tu viaje.
            </p>
            <button
              onClick={addDay}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              Agregar Primer Día
            </button>
          </div>
        ) : (
          days.map((day, dayIndex) => (
          <div key={dayIndex} className="relative mb-16 pl-14">
            <div className="absolute left-0 top-0 size-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shadow-sm">
              <span className="font-caveat text-xl font-bold text-indigo-600">
                {String(day.day).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(dayIndex, "title", e.target.value)}
                      placeholder="Título del día (ej: Llegada a Bogotá)"
                      className="font-caveat text-3xl text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full placeholder:text-slate-300"
                    />
                    <input
                      type="text"
                      value={day.subtitle || ""}
                      onChange={(e) => updateDay(dayIndex, "subtitle", e.target.value)}
                      placeholder="Subtítulo (ej: Gateway to Colombia)"
                      className="text-sm font-medium text-slate-400 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    onClick={() => removeDay(dayIndex)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    title="Eliminar día"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {day.activities.map((activity, activityIndex) => (
                  <div
                    key={activityIndex}
                    className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex gap-4">
                      {activity.imageData && (
                        <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-neutral-50">
                          <img
                            alt={activity.title || "Actividad"}
                            className="w-full h-full object-cover"
                            src={activity.imageData}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col gap-3">
                        {/* Tipo y botones de acción en la misma línea */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase tracking-tight">
                            {activity.type === "activity" ? "Actividad" :
                             activity.type === "accommodation" ? "Alojamiento" :
                             activity.type === "transport" ? "Transporte" :
                             activity.type === "meal" ? "Comida" :
                             activity.type === "poi" ? "Punto de Interés" : activity.type}
                          </span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openActivityModal(dayIndex, activityIndex)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => removeActivity(dayIndex, activityIndex)}
                              className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors px-2 py-1"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Título - solo lectura */}
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">
                            {activity.title || "Sin título"}
                          </h4>
                        </div>

                        {/* Descripción - solo lectura */}
                        {activity.description && (
                          <div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {activity.description}
                            </p>
                          </div>
                        )}

                        {/* Coordenadas si existen */}
                        {activity.latitude && activity.longitude && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <MapPin className="size-3.5 text-slate-400" />
                            <span className="text-xs text-slate-400 font-mono">
                              {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              <button
                onClick={() => openActivityModal(dayIndex)}
                className="w-full py-4 border-2 border-dashed border-neutral-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-indigo-100 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all text-sm font-medium"
              >
                <Plus className="size-4" />
                Agregar actividad al Día {String(day.day).padStart(2, "0")}
              </button>
            </div>
          </div>
          ))
        )}
      </div>
      
      {/* Modal para agregar actividad */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop con blur */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeActivityModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {editingActivityIndex !== null ? "Editar Actividad" : "Agregar Actividad"}
              </h3>
              <button
                onClick={closeActivityModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Actividad
                </label>
                <select
                  value={tempActivity.type || "activity"}
                  onChange={(e) => setTempActivity({ ...tempActivity, type: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="activity">Actividad</option>
                  <option value="accommodation">Alojamiento</option>
                  <option value="transport">Transporte</option>
                  <option value="meal">Comida</option>
                  <option value="poi">Punto de Interés</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={tempActivity.title || ""}
                  onChange={(e) => setTempActivity({ ...tempActivity, title: e.target.value })}
                  placeholder="Título de la actividad"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={tempActivity.description || ""}
                  onChange={(e) => setTempActivity({ ...tempActivity, description: e.target.value })}
                  placeholder="Descripción de la actividad..."
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagen (opcional, máx. 5MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm text-slate-600 hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="size-4" />
                    {tempActivity.imageData ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  {tempActivity.imageData && (
                    <div className="flex-1 relative">
                      <img
                        src={tempActivity.imageData}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeActivityModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveActivity}
                disabled={!tempActivity.title}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingActivityIndex !== null ? "Guardar Cambios" : "Agregar Actividad"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
