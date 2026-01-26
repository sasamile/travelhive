"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";

import { Sidebar } from "@/components/customers/viajes/Sidebar";
import { TripsHeader } from "@/components/customers/viajes/TripsHeader";
import { TripsSearch } from "@/components/customers/viajes/TripsSearch";
import { UpcomingTripsSection } from "@/components/customers/viajes/UpcomingTripsSection";
import { PastTripsSection } from "@/components/customers/viajes/PastTripsSection";
import { pastTrips, upcomingTrips } from "@/components/customers/viajes/data";

function MyViajes() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const shouldVerify = params.get("payment") === "1";
    if (!shouldVerify) return;

    const bookingId =
      params.get("bookingId") || localStorage.getItem("th_last_booking_id");

    const verify = async () => {
      if (!bookingId) {
        toast.error("No se encontró la reserva para verificar el pago");
        router.replace("/customers/viajes");
        return;
      }

      try {
        toast.loading("Verificando pago...", { id: "verify-payment" });
        const res = await api.post(`/bookings/${bookingId}/verify-payment`);
        const status =
          res?.data?.status || res?.data?.data?.status || res?.data?.booking?.status;

        if (status === "CONFIRMED") {
          toast.success("Pago confirmado. Reserva activa.", { id: "verify-payment" });
        } else if (status === "PENDING") {
          toast("Pago pendiente. Puedes intentarlo de nuevo más tarde.", {
            id: "verify-payment",
            icon: "⏳" as any,
          });
        } else {
          toast.success("Pago verificado.", { id: "verify-payment" });
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudo verificar el pago",
          { id: "verify-payment" }
        );
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("th_last_booking_id");
          localStorage.removeItem("th_last_booking_created_at");
        }
        router.replace("/customers/viajes");
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#4a4a4a] dark:text-gray-200">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 max-w-5xl mx-auto px-10 py-12 ml-64     ">
          <TripsHeader />
          <TripsSearch />
          <UpcomingTripsSection trips={upcomingTrips} />
          <PastTripsSection trips={pastTrips} />
        </main>
      </div>
    </div>
  )
}

export default MyViajes