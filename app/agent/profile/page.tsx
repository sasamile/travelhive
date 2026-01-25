"use client";

import { useState, useEffect, useRef } from "react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldSet, FieldGroup } from "@/components/ui/field";
import { Camera, Info, HelpCircle, X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { gsap } from "gsap";

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null; // imagen del usuario avatar        
    createdAt: string;
    updatedAt: string;
    dniUser?: string;
    phoneUser?: string;
  };
  agencies: Array<{
    idAgency: string;
    role: string;
    agency: {
      idAgency: string;
      nameAgency: string;
      email: string;
      phone: string;
      nit: string;
      rntNumber: string;
      picture: string | null;
      status: string;
      approvalStatus: string;
      rejectionReason: string | null;
      reviewedBy: string;
      reviewedAt: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [agencyName, setAgencyName] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [nit, setNit] = useState("");
  const [rntNumber, setRntNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyPicture, setAgencyPicture] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<UserData>("/auth/me");
        setUserData(response.data);

        // Inicializar formulario con datos existentes
        if (response.data.agencies?.[0]?.agency) {
          const agency = response.data.agencies[0].agency;
          setAgencyName(agency.nameAgency || "");
          setPublicEmail(agency.email || "");
          setNit(agency.nit || "");
          setRntNumber(agency.rntNumber || "");
          setPhone(agency.phone || "");
          setAgencyPicture(agency.picture);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast.error("Error al cargar los datos de la agencia");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!userData?.agencies?.[0]?.idAgency) return;

    setSaving(true);
    try {
      const formData = new FormData();

      // Preparar los datos a enviar
      const dataToSend: any = {};
      if (agencyName) dataToSend.nameAgency = agencyName;
      if (publicEmail) dataToSend.email = publicEmail;
      if (phone) dataToSend.phone = phone;
      
      // Solo incluir NIT y RNT si no está aprobado (no se pueden editar cuando está aprobado)
      const approvalStatus = userData?.agencies?.[0]?.agency?.approvalStatus;
      if (approvalStatus !== "APPROVED") {
        if (nit) dataToSend.nit = nit;
        if (rntNumber) dataToSend.rntNumber = rntNumber;
      }

      // Enviar datos como JSON string en el campo 'data' (recomendado según la API)
      if (Object.keys(dataToSend).length > 0) {
        formData.append("data", JSON.stringify(dataToSend));
      }

      // Si hay un archivo nuevo, agregarlo al FormData
      if (pictureFile) {
        formData.append("picture", pictureFile);
      }

      await api.patch("/agencies/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Configuración guardada exitosamente");

      // Recargar datos
      const response = await api.get<UserData>("/auth/me");
      setUserData(response.data);
      
      // Limpiar el archivo después de guardar exitosamente
      setPictureFile(null);
    } catch (error: any) {
      console.error("Error al guardar:", error);
      toast.error(error.response?.data?.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!userData?.agencies?.[0]?.agency) return;

    const agency = userData.agencies[0].agency;
    setAgencyName(agency.nameAgency || "");
    setPublicEmail(agency.email || "");
    setNit(agency.nit || "");
    setRntNumber(agency.rntNumber || "");
    setPhone(agency.phone || "");
    setAgencyPicture(agency.picture);
    setPictureFile(null); // Limpiar el archivo pendiente
    toast.success("Cambios descartados");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        // Limpiar el input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validar tipo
      if (!file.type.match(/^image\/(jpeg|jpg|png|svg)$/)) {
        toast.error("Solo se permiten imágenes JPG, PNG o SVG");
        // Limpiar el input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Guardar el archivo original para enviarlo al servidor
      setPictureFile(file);

      // Leer el archivo como base64 para mostrar la vista previa
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          setAgencyPicture(result);
        }
      };
      reader.onloadend = () => {
        // Asegurar que el estado se actualice incluso si onload no se dispara
        if (reader.result && typeof reader.result === 'string') {
          setAgencyPicture(reader.result);
        }
      };
      reader.onerror = () => {
        toast.error("Error al leer la imagen");
        setPictureFile(null);
        setAgencyPicture(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAgencyPicture(null);
    setPictureFile(null);
  };

  // GSAP Animations
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Section titles animation
      gsap.fromTo(".section-title", 
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );

      // Section descriptions animation
      gsap.fromTo(".section-description",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "power2.out" }
      );

      // Logo container animation
      gsap.fromTo(".logo-container",
        { opacity: 0, scale: 0.8, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.7)" }
      );

      // Logo buttons animation
      gsap.fromTo(".logo-button",
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, delay: 0.3, ease: "back.out(1.7)" }
      );

      // Form fields animation
      gsap.fromTo(".form-field",
        { opacity: 0, x: -30, y: 10 },
        { opacity: 1, x: 0, y: 0, duration: 0.5, stagger: 0.08, delay: 0.4, ease: "power2.out" }
      );

      // Input fields animation
      gsap.fromTo(".form-input",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.5, ease: "power2.out" }
      );

      // Status badge animation
      gsap.fromTo(".status-badge",
        { opacity: 0, scale: 0.5, rotation: -180 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, delay: 0.6, ease: "back.out(1.7)" }
      );

      // Info box animation
      gsap.fromTo(".info-box",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.7, ease: "power2.out" }
      );

      // Action buttons animation
      gsap.fromTo(".action-button",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.8, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, userData]);

  if (loading) {
    return (
      <>
        <AgentHeader
          title="Agency Settings"
          actions={
            <>
              <div className="size-5 bg-zinc-200 rounded animate-pulse"></div>
              <div className="h-6 w-px bg-zinc-200"></div>
              <div className="h-9 w-32 bg-zinc-200 rounded-lg animate-pulse"></div>
            </>
          }
        />
        <main className="p-8 max-w-5xl mx-auto w-full">
          {/* Content Skeleton */}
          <div className="space-y-8">
            {/* Agency Identity Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-4 w-96 bg-zinc-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-4">
                {/* Logo Skeleton */}
                <div className="flex items-start gap-4">
                  <div className="size-24 rounded-full bg-zinc-200 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-zinc-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Agency Name Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-zinc-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Email Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-zinc-200 rounded-lg animate-pulse"></div>
                  <div className="h-3 w-80 bg-zinc-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Legal Section Skeleton */}
            <div className="space-y-6 pt-8 border-t border-zinc-200">
              <div className="space-y-2">
                <div className="h-6 w-56 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-4 w-96 bg-zinc-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-4">
                {/* Status Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-zinc-200 rounded-full animate-pulse"></div>
                </div>

                {/* NIT Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-zinc-200 rounded-lg animate-pulse"></div>
                </div>

                {/* RNT Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-zinc-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Info Box Skeleton */}
                <div className="h-20 w-full bg-zinc-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-200">
            <div className="h-9 w-24 bg-zinc-200 rounded-md animate-pulse"></div>
            <div className="h-9 w-32 bg-zinc-200 rounded-md animate-pulse"></div>
          </div>
        </main>
      </>
    );
  }

  const agency = userData?.agencies?.[0]?.agency;
  const approvalStatus = agency?.approvalStatus || "PENDING";

  return (
    <>
      <AgentHeader
        title="Agency Settings"
        actions={
          <button 
            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.1,
                rotation: 15,
                duration: 0.2,
                ease: "back.out(1.7)"
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                rotation: 0,
                duration: 0.2,
                ease: "back.out(1.7)"
              });
            }}
          >
            <HelpCircle className="size-5" />
          </button>
        }
      />

      <main className="p-8 max-w-5xl mx-auto w-full bg-linear-to-br from-zinc-50 via-white to-zinc-50 min-h-screen" ref={containerRef}>
        <div className="space-y-8">
          {/* Agency Identity Section */}
          <div className="space-y-6">
            <div>
              <h3 className="section-title text-lg font-semibold text-zinc-900 mb-1">
                Agency Identity
              </h3>
              <p className="section-description text-sm text-zinc-500">
                Update your public presence and brand identity used across the platform.
              </p>
            </div>

            <FieldSet>
              <FieldGroup>
                {/* Agency Logo */}
                <Field className="form-field flex flex-col gap-4">
                  <FieldLabel>Agency Logo</FieldLabel>
                  <FieldContent>
                    <div className="flex items-start gap-6">
                      <div className="relative logo-container">
                        <div
                          className="size-40 rounded-2xl bg-zinc-100 border-4 border-zinc-200 shadow-lg overflow-hidden"
                          onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, {
                              scale: 1.05,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                              duration: 0.3,
                              ease: "power2.out"
                            });
                          }}
                          onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, {
                              scale: 1,
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              duration: 0.3,
                              ease: "power2.out"
                            });
                          }}
                        >
                          {agencyPicture ? (
                            <img
                              key={agencyPicture.substring(0, 50)}
                              src={agencyPicture}
                              alt="Agency Logo"
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                // Forzar re-render si es necesario
                              }}
                              onError={(e) => {
                                console.error("Error loading image:", e);
                                toast.error("Error al cargar la imagen");
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                              <span className="text-5xl font-bold text-indigo-600">
                                {agencyName.charAt(0).toUpperCase() || "A"}
                              </span>
                            </div>
                          )}
                        </div>
                        {agencyPicture && (
                          <button
                            onClick={handleRemoveImage}
                            className="logo-button absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            onMouseEnter={(e) => {
                              gsap.to(e.currentTarget, {
                                scale: 1.2,
                                rotation: 90,
                                duration: 0.3,
                                ease: "back.out(1.7)"
                              });
                            }}
                            onMouseLeave={(e) => {
                              gsap.to(e.currentTarget, {
                                scale: 1,
                                rotation: 0,
                                duration: 0.3,
                                ease: "back.out(1.7)"
                              });
                            }}
                          >
                            <X className="size-4" />
                          </button>
                        )}
                        <label 
                          className="logo-button absolute bottom-0 right-0 size-10 bg-zinc-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors shadow-lg"
                          onClick={() => {
                            // Resetear el input para permitir seleccionar el mismo archivo de nuevo
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, {
                              scale: 1.15,
                              rotation: 15,
                              duration: 0.3,
                              ease: "back.out(1.7)"
                            });
                          }}
                          onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, {
                              scale: 1,
                              rotation: 0,
                              duration: 0.3,
                              ease: "back.out(1.7)"
                            });
                          }}
                        >
                          <Camera className="size-5" />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 mb-2">
                          JPG, PNG or SVG. Max 5MB.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            // Resetear el input para permitir seleccionar el mismo archivo de nuevo
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                              fileInputRef.current.click();
                            }
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, {
                              x: 5,
                              duration: 0.2,
                              ease: "power2.out"
                            });
                          }}
                          onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, {
                              x: 0,
                              duration: 0.2,
                              ease: "power2.out"
                            });
                          }}
                        >
                          Change picture
                        </button>
                      </div>
                    </div>
                  </FieldContent>
                </Field>

                {/* Agency Name */}
                <Field className="form-field flex flex-col gap-1.5">
                  <FieldLabel>Agency Name</FieldLabel>
                  <FieldContent>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="form-input h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Nombre de la agencia"
                      onFocus={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onBlur={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    />
                  </FieldContent>
                </Field>

                {/* Public Agency Email */}
                <Field className="form-field flex flex-col gap-1.5">
                  <FieldLabel>Public Agency Email</FieldLabel>
                  <FieldContent>
                    <input
                      type="email"
                      value={publicEmail}
                      onChange={(e) => setPublicEmail(e.target.value)}
                      className="form-input h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="email@agencia.com"
                      onFocus={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onBlur={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    />
                    <FieldDescription>
                      Used for customer-facing communication and booking receipts.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-200">
            <div>
              <h3 className="section-title text-lg font-semibold text-zinc-900 mb-1">
                Contact Information
              </h3>
              <p className="section-description text-sm text-zinc-500">
                Update your contact details for customer communication.
              </p>
            </div>

            <FieldSet>
              <FieldGroup>
                {/* Phone Number */}
                <Field className="form-field flex flex-col gap-1.5">
                  <FieldLabel>Phone Number</FieldLabel>
                  <FieldContent>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="+57 1 234 5678"
                      onFocus={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onBlur={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          {/* Legal & Tax Compliance Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-200">
            <div>
              <h3 className="section-title text-lg font-semibold text-zinc-900 mb-1">
                Legal & Tax Compliance
              </h3>
              <p className="section-description text-sm text-zinc-500">
                Regulatory information required for operating as a verified travel operator.
              </p>
            </div>

            <FieldSet>
              <FieldGroup>
                {/* Approval Status */}
                <Field className="form-field flex flex-col gap-2">
                  <FieldLabel>Verification Status</FieldLabel>
                  <FieldContent>
                    <div
                      className={`status-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit ${approvalStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : approvalStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1.1,
                          duration: 0.3,
                          ease: "back.out(1.7)"
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          duration: 0.3,
                          ease: "back.out(1.7)"
                        });
                      }}
                    >
                      {approvalStatus}
                    </div>
                  </FieldContent>
                </Field>

                {/* NIT */}
                <Field className="form-field flex flex-col gap-1.5">
                  <FieldLabel>NIT (Tax ID)</FieldLabel>
                  <FieldContent>
                    <input
                      type="text"
                      value={nit}
                      onChange={(e) => setNit(e.target.value)}
                      disabled={approvalStatus === "APPROVED"}
                      className={`form-input h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all ${
                        approvalStatus === "APPROVED"
                          ? "bg-zinc-50 cursor-not-allowed opacity-60"
                          : "focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      }`}
                      placeholder="901.442.122-0"
                      onFocus={(e) => {
                        if (approvalStatus !== "APPROVED") {
                          gsap.to(e.currentTarget, {
                            scale: 1.02,
                            y: -2,
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                            duration: 0.3,
                            ease: "power2.out"
                          });
                        }
                      }}
                      onBlur={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    />
                  </FieldContent>
                </Field>

                {/* RNT Number */}
                <Field className="form-field flex flex-col gap-1.5">
                  <FieldLabel>RNT Number</FieldLabel>
                  <FieldContent>
                    <input
                      type="text"
                      value={rntNumber}
                      onChange={(e) => setRntNumber(e.target.value)}
                      disabled={approvalStatus === "APPROVED"}
                      className={`form-input h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all ${
                        approvalStatus === "APPROVED"
                          ? "bg-zinc-50 cursor-not-allowed opacity-60"
                          : "focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      }`}
                      placeholder="RNT-104928"
                      onFocus={(e) => {
                        if (approvalStatus !== "APPROVED") {
                          gsap.to(e.currentTarget, {
                            scale: 1.02,
                            y: -2,
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                            duration: 0.3,
                            ease: "power2.out"
                          });
                        }
                      }}
                      onBlur={(e) => {
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    />
                  </FieldContent>
                </Field>

                {/* Info Message */}
                {approvalStatus === "APPROVED" && (
                  <div className="info-box flex gap-3 p-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <Info className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800">
                      Your legal documents have been verified. Any changes to the Tax ID or RNT Number will require a new verification process and might temporarily pause your ability to list new expeditions.
                    </p>
                  </div>
                )}
              </FieldGroup>
            </FieldSet>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-200">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={saving}
            className="action-button"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                x: -2,
                duration: 0.2,
                ease: "power2.out"
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                x: 0,
                duration: 0.2,
                ease: "power2.out"
              });
            }}
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="action-button bg-zinc-900 text-white hover:bg-zinc-800"
            onMouseEnter={(e) => {
              if (!saving) {
                gsap.to(e.currentTarget, {
                  scale: 1.05,
                  x: 2,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  duration: 0.2,
                  ease: "power2.out"
                });
              }
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                x: 0,
                boxShadow: "none",
                duration: 0.2,
                ease: "power2.out"
              });
            }}
          >
            {saving ? "Guardando..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </>
  );
}
