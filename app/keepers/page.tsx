"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, CheckCircle2, XCircle, Calendar, MapPin, Users, User, Mail, Phone, AlertTriangle, Loader2, QrCode, Camera, Keyboard } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";

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

export default function KeepersPage() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual");
  const [cameraScanning, setCameraScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <QrCode className="size-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Keeper - Escáner QR</h1>
              <p className="text-sm text-zinc-600">Escanea códigos QR de reservas para verificar acceso</p>
            </div>
          </div>

          {/* Selector de modo */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleScanModeChange("camera")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                scanMode === "camera"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <Camera className="size-4" />
              Escanear con Cámara
            </button>
            <button
              onClick={() => handleScanModeChange("manual")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                scanMode === "manual"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <Keyboard className="size-4" />
              Escribir Código
            </button>
          </div>

          {/* Modo Cámara */}
          {scanMode === "camera" && (
            <div className="space-y-4">
              <div
                ref={scannerContainerRef}
                id="qr-reader"
                className="w-full bg-zinc-900 rounded-lg overflow-hidden"
                style={{ minHeight: "300px" }}
              />
              {cameraError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{cameraError}</p>
                  <button
                    onClick={() => handleScanModeChange("manual")}
                    className="mt-2 text-sm font-semibold text-red-700 hover:underline"
                  >
                    Cambiar a modo manual
                  </button>
                </div>
              )}
              {!cameraScanning && !cameraError && (
                <button
                  onClick={startCameraScan}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="size-4" />
                  Iniciar Escaneo
                </button>
              )}
              {cameraScanning && (
                <button
                  onClick={stopCameraScan}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  Detener Escaneo
                </button>
              )}
            </div>
          )}

          {/* Modo Manual */}
          {scanMode === "manual" && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
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
                  placeholder="Ingresa el código QR (ej: BK-1145214792121024513-A1B2C3D4)"
                  className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={() => handleScanQR()}
                disabled={loading || !qrCode.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Search className="size-4" />
                    Escanear
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Resultado del escaneo */}
        {qrData && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {qrData.valid && qrData.data ? (
              <>
                {/* Header con estado */}
                <div className={`px-6 py-4 ${
                  qrData.data.qr.isClaimed 
                    ? "bg-amber-500" 
                    : qrData.data.booking.status === "CONFIRMED"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {qrData.data.qr.isClaimed ? (
                        <>
                          <AlertTriangle className="size-6" />
                          <div>
                            <h2 className="text-xl font-bold">Ya Reclamado</h2>
                            <p className="text-sm opacity-90">
                              Reclamado el {formatDate(qrData.data.qr.claimedAt || qrData.data.qr.createdAt)}
                            </p>
                          </div>
                        </>
                      ) : qrData.data.booking.status === "CONFIRMED" ? (
                        <>
                          <CheckCircle2 className="size-6" />
                          <div>
                            <h2 className="text-xl font-bold">Reserva Confirmada</h2>
                            <p className="text-sm opacity-90">Código QR válido</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-6" />
                          <div>
                            <h2 className="text-xl font-bold">Reserva No Confirmada</h2>
                            <p className="text-sm opacity-90">Este código QR no es válido</p>
                          </div>
                        </>
                      )}
                    </div>
                    {!qrData.data.qr.isClaimed && qrData.data.booking.status === "CONFIRMED" && (
                      <button
                        onClick={handleClaimQR}
                        disabled={claiming}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Marcando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-4" />
                            Marcar como Reclamado
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Información del evento */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    {qrData.data.trip.coverImage && (
                      <img
                        src={qrData.data.trip.coverImage}
                        alt={qrData.data.trip.title}
                        className="w-32 h-32 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-zinc-900 mb-2">{qrData.data.trip.title}</h3>
                      <div className="space-y-2 text-zinc-600">
                        {qrData.data.trip.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            <span>{qrData.data.trip.city.nameCity}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>{formatDate(qrData.data.expedition.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />
                          <span>{qrData.data.booking.totalPersons} persona{qrData.data.booking.totalPersons > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle de personas */}
                  {qrData.data.booking.bookingItems && qrData.data.booking.bookingItems.length > 0 && (
                    <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-zinc-700 mb-3">Detalle de Entradas</h4>
                      <div className="space-y-2">
                        {qrData.data.booking.bookingItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-zinc-600">
                              {item.quantity}x {item.description}
                            </span>
                            <span className="font-semibold text-zinc-900">
                              {formatCurrency(item.totalPrice, qrData.data?.booking.currency || "COP")}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-zinc-200 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(qrData.data?.booking.totalBuy || 0, qrData.data?.booking.currency || "COP")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información del comprador */}
                  <div className="border-t border-zinc-200 pt-6">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-4">Información del Comprador</h4>
                    <div className="flex items-start gap-4">
                      {qrData.data.owner.image ? (
                        <img
                          src={qrData.data.owner.image}
                          alt={qrData.data.owner.name}
                          className="w-16 h-16 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <User className="size-8 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-semibold text-zinc-900">{qrData.data.owner.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Mail className="size-4" />
                          <span>{qrData.data.owner.email}</span>
                        </div>
                        {qrData.data.owner.phone && (
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <Phone className="size-4" />
                            <span>{qrData.data.owner.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información del QR */}
                  <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-600">Código QR:</span>
                      <span className="font-mono font-semibold text-zinc-900">{qrData.data.qr.qrCode}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-zinc-600">Fecha de compra:</span>
                      <span className="text-zinc-900">{formatDate(qrData.data.booking.dateBuy)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <XCircle className="size-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Código QR Inválido</h3>
                <p className="text-zinc-600">{qrData.error || "Este código QR no existe o no es válido"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
