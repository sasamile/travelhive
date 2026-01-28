"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle2, XCircle, Calendar, MapPin, Users, User, Mail, Phone, AlertTriangle, Loader2, QrCode, Camera, Keyboard, LogOut } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QRData {
  valid: boolean;
  data?: {
    qr: {
      id: string;
      qrCode: string;
      isClaimed: boolean;
      claimedAt: string | null;
      createdAt: string;
    };
    booking: {
      idBooking: string;
      status: string;
      dateBuy: string;
      totalBuy: number;
      currency: string;
      totalPersons: number;
      bookingItems: Array<{
        itemType: string;
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
    trip: {
      idTrip: string;
      title: string;
      description: string;
      coverImage: string;
      category: string;
      city: {
        idCity: string;
        nameCity: string;
      };
      agency?: {
        idAgency: string;
        nameAgency: string;
      };
      host?: {
        id: string;
        name: string;
        image: string;
      };
    };
    expedition: {
      idExpedition: string;
      startDate: string;
      endDate: string;
      capacityTotal: number;
      capacityAvailable: number;
    };
    owner: {
      id: string;
      name: string;
      email: string;
      phone: string;
      image?: string;
    };
  };
  error?: string;
}

interface UserData {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export default function KeepersPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual");
  const [cameraScanning, setCameraScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const stopCameraScan = useCallback(async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
      qrCodeScannerRef.current = null;
    }
    setCameraScanning(false);
  }, []);

  const startCameraScan = useCallback(async () => {
    // Verificar que el elemento existe antes de intentar inicializar
    const element = document.getElementById("qr-reader");
    if (!element) {
      console.error("Elemento qr-reader no encontrado");
      setCameraError("Error al inicializar el escáner. Por favor, intenta nuevamente.");
      setCameraScanning(false);
      return;
    }

    try {
      setCameraError(null);
      setCameraScanning(true);
      
      const scannerId = "qr-reader";
      const html5QrCode = new Html5Qrcode(scannerId);
      qrCodeScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Usar cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Código QR escaneado exitosamente
          setQrCode(decodedText);
          await stopCameraScan();
          // Llamar handleScanQR después de detener el escáner
          const codeToScan = decodedText.trim();
          if (codeToScan) {
            try {
              setLoading(true);
              setQrData(null);
              const response = await api.get<QRData>(`/bookings/qr/${codeToScan}`);
              if (response.data) {
                setQrData(response.data);
                if (!response.data.valid) {
                  toast.error(response.data.error || "Este código QR no es válido");
                } else if (response.data.data?.qr.isClaimed) {
                  toast.error("Este código QR ya fue reclamado anteriormente", {
                    duration: 5000,
                  });
                } else {
                  toast.success("Código QR válido", {
                    duration: 3000,
                  });
                }
              }
            } catch (error: any) {
              console.error("Error al escanear QR:", error);
              if (error.response?.status === 404) {
                toast.error("Código QR no encontrado");
                setQrData({
                  valid: false,
                  error: "Código QR no encontrado",
                });
              } else {
                toast.error(error.response?.data?.message || "Error al escanear el código QR");
              }
            } finally {
              setLoading(false);
            }
          }
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err: any) {
      console.error("Error al iniciar cámara:", err);
      setCameraError("No se pudo acceder a la cámara. Por favor, verifica los permisos o usa el modo manual.");
      setCameraScanning(false);
      toast.error("Error al acceder a la cámara. Usa el modo manual para escribir el código.");
    }
  }, [stopCameraScan]);

  useEffect(() => {
    // Focus en el input al cargar si está en modo manual
    if (scanMode === "manual") {
      inputRef.current?.focus();
    }
  }, [scanMode]);

  // Iniciar el escáner cuando se cambia a modo cámara y el elemento está disponible
  useEffect(() => {
    if (scanMode === "camera" && !cameraScanning && !cameraError && !qrCodeScannerRef.current) {
      // Esperar a que el elemento esté en el DOM antes de iniciar el escáner
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader");
        if (element && !qrCodeScannerRef.current) {
          // Iniciar el escáner solo si el elemento existe y no hay un escáner activo
          startCameraScan();
        }
      }, 300); // Delay para asegurar que el elemento esté completamente renderizado
      return () => clearTimeout(timer);
    }
  }, [scanMode, cameraScanning, cameraError, startCameraScan]);

  // Limpiar el escáner cuando se desmonta o cambia el modo
  useEffect(() => {
    return () => {
      if (qrCodeScannerRef.current && cameraScanning) {
        qrCodeScannerRef.current.stop().catch(() => {
          // Ignorar errores al detener
        });
      }
    };
  }, [cameraScanning]);

  const handleScanModeChange = (mode: "camera" | "manual") => {
    if (mode === "camera" && scanMode === "manual") {
      // Cambiar a modo cámara - el useEffect iniciará el escáner cuando el elemento esté disponible
      setScanMode("camera");
      setCameraError(null);
    } else if (mode === "manual" && scanMode === "camera") {
      // Cambiar a modo manual
      stopCameraScan();
      setScanMode("manual");
      setCameraError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleScanQR = async (code?: string) => {
    const codeToScan = code || qrCode.trim();
    
    if (!codeToScan) {
      toast.error("Por favor ingresa un código QR");
      return;
    }

    try {
      setLoading(true);
      setQrData(null);

      const response = await api.get<QRData>(`/bookings/qr/${codeToScan}`);
      
      if (response.data) {
        setQrData(response.data);
        
        if (!response.data.valid) {
          toast.error(response.data.error || "Este código QR no es válido");
        } else if (response.data.data?.qr.isClaimed) {
          toast.error("Este código QR ya fue reclamado anteriormente", {
            duration: 5000,
          });
        } else {
          toast.success("Código QR válido", {
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al escanear QR:", error);
      
      if (error.response?.status === 404) {
        toast.error("Código QR no encontrado");
        setQrData({
          valid: false,
          error: "Código QR no encontrado",
        });
      } else {
        toast.error(error.response?.data?.message || "Error al escanear el código QR");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimQR = async () => {
    if (!qrData?.data?.qr.qrCode) return;

    try {
      setClaiming(true);
      await api.post(`/bookings/qr/${qrData.data.qr.qrCode}/claim`);
      
      toast.success("Código QR marcado como reclamado exitosamente");
      
      // Actualizar el estado local
      if (qrData.data) {
        setQrData({
          ...qrData,
          data: {
            ...qrData.data,
            qr: {
              ...qrData.data.qr,
              isClaimed: true,
              claimedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (error: any) {
      console.error("Error al reclamar QR:", error);
      
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "No se pudo marcar como reclamado");
      } else {
        toast.error("Error al marcar el código QR como reclamado");
      }
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number, currency: string = "COP") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency === "COP" ? "COP" : currency === "EUR" ? "EUR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<UserData>("/auth/me");
        setUserData(response.data);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/sign-out");
      localStorage.removeItem("auth_token");
      toast.success("Sesión cerrada exitosamente");
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      // Aún así redirigir al login
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#131022]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#f1f0f4] dark:border-[#2d2a3d] px-4 md:px-10 py-3 bg-white dark:bg-[#131022] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="size-6 text-indigo-600">
            <QrCode className="size-6" />
          </div>
          <h2 className="text-lg font-bold">TravelHive Keeper</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f0f4] dark:bg-white/10 hover:bg-[#e0e0e4] dark:hover:bg-white/20 transition-colors">
            <AlertTriangle className="size-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f0f4] dark:bg-white/10 hover:bg-[#e0e0e4] dark:hover:bg-white/20 transition-colors">
                {userData?.user?.image ? (
                  <img
                    src={userData.user.image}
                    alt={userData.user.name || "Usuario"}
                    className="size-10 rounded-lg object-cover"
                  />
                ) : (
                  <User className="size-5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {userData?.user && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {userData.user.name || "Usuario"}
                    </p>
                    {userData.user.email && (
                      <p className="text-xs text-zinc-500 dark:text-gray-400 truncate">
                        {userData.user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="px-4 md:px-40 flex flex-1 justify-center py-10">
        <div className="max-w-[960px] w-full flex flex-col">
          {!qrData ? (
            <>
              {/* Headline Section */}
              <div className="flex flex-col items-center mb-8">
                <h1 className="font-caveat text-5xl font-bold text-zinc-900 dark:text-white tracking-wide text-center pb-2">
                  Security Checkpoint
                </h1>
                <div className="flex items-center gap-2 text-[#686189] dark:text-gray-400 text-sm font-medium">
                  <MapPin className="size-4" />
                  <span>Gate 4 - Terminal A</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    System Ready
                  </span>
                </div>
              </div>

              {/* Main QR Scanner Component */}
              <div className="p-4">
                <div className="flex flex-col items-center justify-start rounded-xl shadow-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-8">
                  {/* Viewfinder Area */}
                  {scanMode === "camera" && (
                    <div className="relative w-full max-w-[400px] aspect-square bg-black rounded-3xl overflow-hidden border-4 border-gray-100 dark:border-slate-800 shadow-inner mb-8">
                      <div
                        ref={scannerContainerRef}
                        id="qr-reader"
                        className="absolute inset-0 w-full h-full"
                      />
                      {/* Scanner Overlay */}
                      {cameraScanning && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-2 border-indigo-600/50 rounded-2xl relative">
                            {/* Corners */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-600 rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-600 rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-600 rounded-br-lg"></div>
                            {/* Scanning Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-indigo-600 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
                          </div>
                        </div>
                      )}
                      {/* Prompt */}
                      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                        <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                          Align QR Code within frame
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex flex-col items-center gap-6 w-full max-w-[480px]">
                    {scanMode === "camera" ? (
                      <>
                        <div className="text-center">
                          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Scanner Control</h2>
                          <p className="text-[#686189] dark:text-gray-400 text-base mt-1">Position the traveler's code inside the square to verify trip status</p>
                        </div>
                        {cameraError && (
                          <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-400">{cameraError}</p>
                            <button
                              onClick={() => handleScanModeChange("manual")}
                              className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:underline"
                            >
                              Cambiar a modo manual
                            </button>
                          </div>
                        )}
                        <div className="flex gap-4 w-full">
                          {!cameraScanning && !cameraError && (
                            <button
                              onClick={startCameraScan}
                              className="flex-1 flex items-center justify-center gap-2 h-14 px-6 bg-indigo-600 text-white text-lg font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-indigo-600/20"
                            >
                              <Camera className="size-5" />
                              <span>Start Scanner</span>
                            </button>
                          )}
                          {cameraScanning && (
                            <button
                              onClick={stopCameraScan}
                              className="flex-1 flex items-center justify-center gap-2 h-14 px-6 bg-red-600 text-white text-lg font-bold rounded-xl transition-transform active:scale-95"
                            >
                              <XCircle className="size-5" />
                              <span>Stop Scanner</span>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center w-full">
                          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Manual Entry</h2>
                          <p className="text-[#686189] dark:text-gray-400 text-sm">Enter the booking reference code</p>
                        </div>
                        <div className="w-full flex gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                              ref={inputRef}
                              type="text"
                              value={qrCode}
                              onChange={(e) => setQrCode(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleScanQR();
                                }
                              }}
                              placeholder="Enter Traveler ID or Booking Ref"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleScanQR()}
                            disabled={loading || !qrCode.trim()}
                            className="min-w-[140px] h-12 rounded-lg border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <Loader2 className="size-4 animate-spin mx-auto" />
                            ) : (
                              "Verify Entry"
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Mode Toggle */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleScanModeChange("camera")}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                          scanMode === "camera"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                        }`}
                      >
                        <Camera className="size-4" />
                        Camera
                      </button>
                      <button
                        onClick={() => handleScanModeChange("manual")}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                          scanMode === "manual"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                        }`}
                      >
                        <Keyboard className="size-4" />
                        Manual
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (

            <>
              {/* Verification Result Headline */}
              <div className="flex flex-col items-center text-center py-4 mb-6">
                {qrData.valid && qrData.data ? (
                  <>
                    {qrData.data.qr.isClaimed ? (
                      <div className="size-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="size-8" />
                      </div>
                    ) : qrData.data.booking.status === "CONFIRMED" ? (
                      <div className="size-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="size-8" />
                      </div>
                    ) : (
                      <div className="size-16 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="size-8" />
                      </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      {qrData.data.qr.isClaimed ? "Already Claimed" : qrData.data.booking.status === "CONFIRMED" ? "Valid Ticket" : "Invalid Ticket"}
                    </h1>
                    <p className="text-[#636388] dark:text-gray-400 mt-2">
                      {qrData.data.qr.isClaimed 
                        ? `Claimed on ${formatDate(qrData.data.qr.claimedAt || qrData.data.qr.createdAt)}`
                        : qrData.data.booking.status === "CONFIRMED" 
                        ? "Verified successfully for entry at Gate A"
                        : "This ticket is not valid"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="size-16 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="size-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Invalid Code</h1>
                    <p className="text-[#636388] dark:text-gray-400 mt-2">{qrData.error || "This QR code does not exist or is not valid"}</p>
                  </>
                )}
              </div>

              {qrData.valid && qrData.data && (
                <>
                  {/* Main Details Card */}
                  <div className="bg-white dark:bg-background-dark/40 border border-[#f0f0f4] dark:border-white/10 rounded-xl shadow-sm overflow-hidden mb-6">
                    {/* Trip Section */}
                    <div className="p-6 md:p-8 border-b border-[#f0f0f4] dark:border-white/10">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {qrData.data.trip.coverImage && (
                          <div className="w-full md:w-48 aspect-video bg-center bg-no-repeat bg-cover rounded-lg shadow-inner" style={{ backgroundImage: `url(${qrData.data.trip.coverImage})` }}></div>
                        )}
                        <div className="flex-1">
                          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                            {qrData.data.trip.category || "Experience"}
                          </span>
                          <h2 className="font-caveat text-4xl text-zinc-900 dark:text-white mt-2 leading-none">{qrData.data.trip.title}</h2>
                          <p className="text-[#636388] dark:text-gray-400 text-sm mt-1 font-medium flex items-center gap-1">
                            <Calendar className="size-4" />
                            {formatDate(qrData.data.expedition.startDate)}
                          </p>
                          {qrData.data.trip.city && (
                            <p className="text-[#636388] dark:text-gray-400 text-sm mt-1 font-medium flex items-center gap-1">
                              <MapPin className="size-4" />
                              {qrData.data.trip.city.nameCity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buyer & Capacity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#f0f0f4] dark:border-white/10">
                        <h3 className="text-[#636388] dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Buyer Information</h3>
                        <div className="flex items-center gap-4">
                          {qrData.data.owner.image ? (
                            <div className="size-14 rounded-full bg-cover border-2 border-white dark:border-gray-800 shadow-md" style={{ backgroundImage: `url(${qrData.data.owner.image})` }}></div>
                          ) : (
                            <div className="size-14 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center text-white font-bold">
                              {qrData.data.owner.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">{qrData.data.owner.name}</p>
                            <p className="text-[#636388] dark:text-gray-400 text-sm">{qrData.data.owner.email}</p>
                            {qrData.data.owner.phone && (
                              <p className="text-[#636388] dark:text-gray-400 text-sm">{qrData.data.owner.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 md:p-8">
                        <h3 className="text-[#636388] dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Entry Capacity</h3>
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Users className="size-7" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                              {qrData.data.booking.totalPersons} {qrData.data.booking.totalPersons === 1 ? "Person" : "People"}
                            </p>
                            <p className="text-[#636388] dark:text-gray-400 text-sm">Standard Admission</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket History Section */}
                  <div className="bg-white dark:bg-background-dark/40 border border-[#f0f0f4] dark:border-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="text-[#636388] dark:text-gray-400" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Verification History</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 pb-4 border-b border-[#f0f0f4] dark:border-white/5">
                        <div className={`size-2 rounded-full mt-2 ${qrData.data.qr.isClaimed ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {qrData.data.qr.isClaimed ? "QR Code Already Claimed" : "QR Code Scanned"}
                          </p>
                          <p className="text-xs text-[#636388] dark:text-gray-400">
                            {qrData.data.qr.isClaimed 
                              ? `Claimed on ${formatDate(qrData.data.qr.claimedAt || qrData.data.qr.createdAt)}`
                              : "Just now by Gate A Keeper (Current Session)"}
                          </p>
                        </div>
                        <span className={`text-xs font-bold ${qrData.data.qr.isClaimed ? "text-amber-600" : "text-emerald-600"}`}>
                          {qrData.data.qr.isClaimed ? "CLAIMED" : "SUCCESS"}
                        </span>
                      </div>
                      {qrData.data.booking.bookingItems && qrData.data.booking.bookingItems.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-gray-300 mb-2">Booking Details:</p>
                          {qrData.data.booking.bookingItems.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs text-[#636388] dark:text-gray-400 mb-1">
                              <span>{item.quantity}x {item.description}</span>
                              <span className="font-semibold">{formatCurrency(item.totalPrice, qrData.data?.booking.currency || "COP")}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white mt-2 pt-2 border-t border-[#f0f0f4] dark:border-white/5">
                            <span>Total</span>
                            <span>{formatCurrency(qrData.data?.booking.totalBuy || 0, qrData.data?.booking.currency || "COP")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Section */}
                  {!qrData.data.qr.isClaimed && qrData.data.booking.status === "CONFIRMED" && (
                    <div className="flex flex-col gap-3 py-6">
                      <button
                        onClick={handleClaimQR}
                        disabled={claiming}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98] disabled:opacity-50"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="size-5 animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-5" />
                            Mark as Claimed
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setQrData(null);
                          setQrCode("");
                        }}
                        className="w-full bg-white dark:bg-white/5 border border-[#f0f0f4] dark:border-white/10 text-zinc-900 dark:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        <XCircle className="size-4" />
                        Dismiss Result
                      </button>
                    </div>
                  )}

                  {/* Safety Note */}
                  <div className="flex items-center justify-center gap-2 text-center text-xs text-[#636388] dark:text-gray-500 pb-10">
                    <CheckCircle2 className="size-4" />
                    Secure transaction verified by TravelHive Protocol v2.4
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131022] text-center">
        <p className="text-xs text-gray-400">TravelHive Keeper Terminal v2.4.0 • Secured by BioPass™ Technology</p>
      </footer>
    </div>
  );
}
