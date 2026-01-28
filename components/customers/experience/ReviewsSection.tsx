"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Edit2, Trash2, Send, X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Image from "next/image";

type Review = {
  id: string;
  idTrip: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type ReviewsData = {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      [key: string]: number;
    };
  };
};

type ReviewsSectionProps = {
  tripId: string;
  onReviewsUpdate?: () => void;
};

export function ReviewsSection({ tripId, onReviewsUpdate }: ReviewsSectionProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  
  // Usar useRef para el callback para evitar recargas innecesarias
  const onReviewsUpdateRef = useRef(onReviewsUpdate);
  useEffect(() => {
    onReviewsUpdateRef.current = onReviewsUpdate;
  }, [onReviewsUpdate]);

  // Función para cargar reseñas
  const loadReviews = useCallback(async (silent = false) => {
    if (!tripId) return;
    
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await api.get(`/reviews/trips/${tripId}?page=1&limit=20`);
      
      // Solo actualizar si los datos realmente cambiaron
      setReviewsData(prevData => {
        const newData = response.data;
        // Comparar si realmente hay cambios
        if (prevData && 
            prevData.stats?.totalReviews === newData.stats?.totalReviews &&
            prevData.stats?.averageRating === newData.stats?.averageRating &&
            prevData.reviews.length === newData.reviews.length) {
          // Verificar si las reseñas son las mismas
          const reviewsChanged = prevData.reviews.some((prevReview, index) => {
            const newReview = newData.reviews[index];
            return !newReview || prevReview.id !== newReview.id || 
                   prevReview.updatedAt !== newReview.updatedAt;
          });
          
          if (!reviewsChanged) {
            return prevData; // No hay cambios, mantener el estado anterior
          }
        }
        
        return newData;
      });
      
      // Notificar al componente padre solo si no es una carga silenciosa
      if (!silent && onReviewsUpdateRef.current) {
        onReviewsUpdateRef.current();
      }
    } catch (err: any) {
      console.error("Error al cargar reseñas:", err);
      if (!silent && err.response?.status !== 404) {
        toast.error("No se pudieron cargar las reseñas");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [tripId]);

  // Cargar reseñas inicialmente
  useEffect(() => {
    loadReviews(false);
  }, [tripId]); // Solo dependemos de tripId

  // Polling para actualizar cuando otros usuarios comenten (cada 30 segundos)
  useEffect(() => {
    if (!tripId) return;
    
    const intervalId = setInterval(() => {
      // Solo hacer polling si no hay formulario abierto y no está cargando
      if (!showForm && !loading && !submitting) {
        loadReviews(true); // Carga silenciosa
      }
    }, 30000); // 30 segundos

    return () => clearInterval(intervalId);
  }, [tripId, showForm, loading, submitting, loadReviews]);

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("La calificación debe estar entre 1 y 5 estrellas");
      return;
    }

    try {
      setSubmitting(true);

      if (editingReview) {
        // Actualizar reseña existente
        const response = await api.put(`/reviews/${editingReview.id}`, {
          rating,
          comment: comment.trim() || null,
        });
        
        toast.success("Reseña actualizada exitosamente");
        
        // Recargar reseñas para obtener estadísticas actualizadas
        await loadReviews(false);
        
        setEditingReview(null);
      } else {
        // Crear nueva reseña
        const response = await api.post(`/reviews/trips/${tripId}`, {
          rating,
          comment: comment.trim() || null,
        });
        
        toast.success("Reseña creada exitosamente");
        
        // Recargar reseñas para obtener estadísticas actualizadas
        await loadReviews(false);
      }

      setShowForm(false);
      setComment("");
      setRating(5);
      setHoveredStar(0);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "No se pudo guardar la reseña";
      toast.error(errorMessage);
      
      // Si es error 409, significa que ya existe una reseña
      if (err.response?.status === 409) {
        // Intentar cargar la reseña existente para editarla
        // Esto requeriría un endpoint adicional o modificar el endpoint de listado
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu reseña?")) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Reseña eliminada exitosamente");
      
      // Recargar reseñas para obtener estadísticas actualizadas
      await loadReviews(false);
      
      setUserReview(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "No se pudo eliminar la reseña");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (value: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            className={`transition-colors ${
              interactive ? "cursor-pointer hover:scale-110" : ""
            }`}
            disabled={!interactive}
          >
            <Star
              className={`size-5 ${
                star <= (interactive ? hoveredStar || rating : value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mt-20 pt-16 border-t border-gray-100 dark:border-gray-800">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const stats = reviewsData?.stats || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
  };

  const reviews = reviewsData?.reviews || [];
  const averageRating = stats.averageRating || 0;
  const totalReviews = stats.totalReviews || 0;

  return (
    <section className="mt-20 pt-16 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <Star className="size-7 text-primary fill-primary" />
          <h2 className="text-3xl font-extrabold">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} · {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
          </h2>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingReview(null);
              setRating(5);
              setComment("");
            }}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Formulario de reseña */}
      {showForm && (
        <div className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {editingReview ? "Editar reseña" : "Escribir reseña"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingReview(null);
                setComment("");
                setRating(5);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="size-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Calificación</label>
              {renderStars(rating, true, setRating)}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Comentario (opcional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting || rating < 1 || rating > 5}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="size-4" />
                {submitting ? "Guardando..." : editingReview ? "Actualizar" : "Publicar"}
              </button>
              {editingReview && (
                <button
                  onClick={() => handleDeleteReview(editingReview.id)}
                  className="px-6 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && " · Editado"}
                      </p>
                    </div>
                    
                    <div className="shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Aún no hay reseñas para este viaje
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Sé el primero en compartir tu experiencia
          </p>
        </div>
      )}
    </section>
  );
}
