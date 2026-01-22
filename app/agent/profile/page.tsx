"use client";

import { useState, useEffect, useRef } from "react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldSet, FieldGroup } from "@/components/ui/field";
import { Camera, Info, HelpCircle, X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
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
  const [activeTab, setActiveTab] = useState("profile");

  // Form state
  const [agencyName, setAgencyName] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [nit, setNit] = useState("");
  const [rntNumber, setRntNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyPicture, setAgencyPicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const agencyId = userData.agencies[0].idAgency;
      
      await api.put(`/agencies/${agencyId}`, {
        nameAgency: agencyName,
        email: publicEmail,
        nit: nit,
        rntNumber: rntNumber,
        phone: phone,
        picture: agencyPicture,
      });

      toast.success("Configuración guardada exitosamente");
      
      // Recargar datos
      const response = await api.get<UserData>("/auth/me");
      setUserData(response.data);
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
    toast.success("Cambios descartados");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 2MB");
        return;
      }

      // Validar tipo
      if (!file.type.match(/^image\/(jpeg|jpg|png|svg)$/)) {
        toast.error("Solo se permiten imágenes JPG, PNG o SVG");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAgencyPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAgencyPicture(null);
  };

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
          {/* Tabs Skeleton */}
          <div className="mb-8 flex gap-2">
            <div className="h-10 w-28 bg-zinc-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-zinc-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-zinc-200 rounded-lg animate-pulse"></div>
          </div>

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
          <>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <HelpCircle className="size-5" />
            </button>
            <div className="h-6 w-px bg-zinc-200"></div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {saving ? "Guardando..." : "Save Changes"}
            </Button>
          </>
        }
      />

      <main className="p-8 max-w-5xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="legal">Legal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            {/* Agency Identity Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                  Agency Identity
                </h3>
                <p className="text-sm text-zinc-500">
                  Update your public presence and brand identity used across the platform.
                </p>
              </div>

              <FieldSet>
                <FieldGroup>
                  {/* Agency Logo */}
                  <Field className="flex flex-col gap-4">
                    <FieldLabel>Agency Logo</FieldLabel>
                    <FieldContent>
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div
                            className="size-24 rounded-full bg-zinc-100 bg-cover bg-center border-2 border-zinc-200"
                            style={{
                              backgroundImage: agencyPicture
                                ? `url('${agencyPicture}')`
                                : undefined,
                            }}
                          >
                            {!agencyPicture && (
                              <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-zinc-500">
                                  {agencyName.charAt(0).toUpperCase() || "A"}
                                </span>
                              </div>
                            )}
                          </div>
                          {agencyPicture && (
                            <button
                              onClick={handleRemoveImage}
                              className="absolute -top-1 -right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          )}
                          <label className="absolute bottom-0 right-0 size-8 bg-zinc-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
                            <Camera className="size-4" />
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
                            JPG, PNG or SVG. Max 2MB.
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Change picture
                          </button>
                        </div>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Agency Name */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel>Agency Name</FieldLabel>
                    <FieldContent>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                        placeholder="Nombre de la agencia"
                      />
                    </FieldContent>
                  </Field>

                  {/* Public Agency Email */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel>Public Agency Email</FieldLabel>
                    <FieldContent>
                      <input
                        type="email"
                        value={publicEmail}
                        onChange={(e) => setPublicEmail(e.target.value)}
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                        placeholder="email@agencia.com"
                      />
                      <FieldDescription>
                        Used for customer-facing communication and booking receipts.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

            {/* Legal & Tax Compliance Section */}
            <div className="space-y-6 pt-8 border-t border-zinc-200">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                  Legal & Tax Compliance
                </h3>
                <p className="text-sm text-zinc-500">
                  Regulatory information required for operating as a verified travel operator.
                </p>
              </div>

              <FieldSet>
                <FieldGroup>
                  {/* Approval Status */}
                  <Field className="flex flex-col gap-2">
                    <FieldLabel>Verification Status</FieldLabel>
                    <FieldContent>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit ${
                          approvalStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : approvalStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {approvalStatus}
                      </div>
                    </FieldContent>
                  </Field>

                  {/* NIT */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel>NIT (Tax ID)</FieldLabel>
                    <FieldContent>
                      <input
                        type="text"
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                        placeholder="901.442.122-0"
                      />
                    </FieldContent>
                  </Field>

                  {/* RNT Number */}
                  <Field className="flex flex-col gap-1.5">
                    <FieldLabel>RNT Number</FieldLabel>
                    <FieldContent>
                      <input
                        type="text"
                        value={rntNumber}
                        onChange={(e) => setRntNumber(e.target.value)}
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                        placeholder="RNT-104928"
                      />
                    </FieldContent>
                  </Field>

                  {/* Info Message */}
                  {approvalStatus === "APPROVED" && (
                    <div className="flex gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <Info className="size-5 text-zinc-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-600">
                        Your legal documents have been verified. Any changes to the Tax ID or RNT Number will require a new verification process and might temporarily pause your ability to list new expeditions.
                      </p>
                    </div>
                  )}
                </FieldGroup>
              </FieldSet>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                Legal Information
              </h3>
              <p className="text-sm text-zinc-500">
                Manage your legal and regulatory information.
              </p>
            </div>

            <FieldSet>
              <FieldGroup>
                <Field className="flex flex-col gap-1.5">
                  <FieldLabel>NIT (Tax ID)</FieldLabel>
                  <FieldContent>
                    <input
                      type="text"
                      value={nit}
                      onChange={(e) => setNit(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                      placeholder="901.442.122-0"
                    />
                  </FieldContent>
                </Field>

                <Field className="flex flex-col gap-1.5">
                  <FieldLabel>RNT Number</FieldLabel>
                  <FieldContent>
                    <input
                      type="text"
                      value={rntNumber}
                      onChange={(e) => setRntNumber(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                      placeholder="RNT-104928"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                Contact Information
              </h3>
              <p className="text-sm text-zinc-500">
                Update your contact details for customer communication.
              </p>
            </div>

            <FieldSet>
              <FieldGroup>
                <Field className="flex flex-col gap-1.5">
                  <FieldLabel>Phone Number</FieldLabel>
                  <FieldContent>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                      placeholder="+57 1 234 5678"
                    />
                  </FieldContent>
                </Field>

                <Field className="flex flex-col gap-1.5">
                  <FieldLabel>Public Agency Email</FieldLabel>
                  <FieldContent>
                    <input
                      type="email"
                      value={publicEmail}
                      onChange={(e) => setPublicEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-all focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
                      placeholder="email@agencia.com"
                    />
                    <FieldDescription>
                      Used for customer-facing communication and booking receipts.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </FieldSet>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-200">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={saving}
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            {saving ? "Guardando..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </>
  );
}
