/* eslint-disable @next/next/no-img-element */
"use client";

import CustomersFooter from "@/components/customers/CustomersFooter";
import CustomersNav from "@/components/customers/CustomersNav";
import api from "@/lib/axios";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  Gem,
  Laptop,
  Luggage,
  Mail,
  MessageSquareText,
  Mountain,
  Pencil,
  PiggyBank,
  Shield,
  Smartphone,
  Sparkles,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

type ProfileSection = "personal" | "security" | "preferences" | "payments";

interface UserData {
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phoneUser?: string;
    bio?: string | null;
    preferences?: string[] | null;
    travelStyles?: string[] | null;
    interestTags?: string[] | null;
    notifyEmail?: boolean | null;
    notifySms?: boolean | null;
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-primary transition-colors">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfilePage() {
  const [active, setActive] = useState<ProfileSection>("personal");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form (UI-only por ahora)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [prefs, setPrefs] = useState<string[]>(["Aventura", "Playa", "Cultura"]);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Seguridad (UI-only)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      expiresAt?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      userAgent?: string | null;
      ipAddress?: string | null;
      isCurrent?: boolean;
    }>
  >([]);

  // Preferencias (UI-only)
  const [travelStyles, setTravelStyles] = useState<string[]>(["Aventura", "Lujo"]);
  const [interestTags, setInterestTags] = useState<string[]>([
    "Islandia",
    "Japón",
    "Patagonia",
  ]);
  const [newInterest, setNewInterest] = useState("");

  // Pagos (UI-only)
  const cards = useMemo(
    () => [
      { id: "c1", last4: "4242", exp: "12/26", brand: "VISA", primary: true },
      { id: "c2", last4: "8890", exp: "08/25", brand: "MASTERCARD", primary: false },
    ],
    []
  );
  const transactions = useMemo(
    () => [
      {
        id: "t1",
        date: "12 Oct, 2023",
        title: "Expedición Alpes Suizos",
        subtitle: "Reserva #VP-9021",
        status: "Completado",
        amount: "2.450,00 €",
      },
      {
        id: "t2",
        date: "28 Sep, 2023",
        title: "Tour Gastronómico Kyoto",
        subtitle: "Reserva #VP-8845",
        status: "Completado",
        amount: "890,00 €",
      },
      {
        id: "t3",
        date: "15 Ago, 2023",
        title: "Safari Luxury Serengueti",
        subtitle: "Reserva #VP-7712",
        status: "Completado",
        amount: "5.200,00 €",
      },
    ],
    []
  );

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<UserData>("/auth/me");
        setUserData(res.data);
      } catch {
        // página pública / sin sesión: mantener placeholders
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await api.get<any>("/auth/sessions");

      const raw = res.data;
      const list: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.sessions)
          ? raw.sessions
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.data?.sessions)
              ? raw.data.sessions
              : [];

      const normalized = list
        .map((s) => ({
          id: String(s?.id ?? ""),
          expiresAt: s?.expiresAt ?? null,
          createdAt: s?.createdAt ?? null,
          updatedAt: s?.updatedAt ?? null,
          userAgent: s?.userAgent ?? null,
          ipAddress: s?.ipAddress ?? null,
          isCurrent: Boolean(s?.isCurrent ?? s?.current ?? s?.thisSession),
        }))
        .filter((s) => s.id);

      setSessions(normalized);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (active === "security") {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const name = userData?.user?.name ?? "";
    const mail = userData?.user?.email ?? "";
    const tel = userData?.user?.phoneUser ?? "";
    if (name) setFullName(name);
    if (mail) setEmail(mail);
    if (tel) setPhone(tel);
    if (typeof userData?.user?.bio === "string") setBio(userData.user.bio);

    if (Array.isArray(userData?.user?.preferences)) {
      setPrefs(userData.user.preferences);
    }
    if (Array.isArray(userData?.user?.travelStyles)) {
      setTravelStyles(userData.user.travelStyles);
    }
    if (Array.isArray(userData?.user?.interestTags)) {
      setInterestTags(userData.user.interestTags);
    }
  }, [userData]);

  useEffect(() => {
    if (!pictureFile) return;
    const url = URL.createObjectURL(pictureFile);
    setPicturePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pictureFile]);

  const avatarFallback = useMemo(() => {
    const n = userData?.user?.name?.trim();
    if (!n) return "U";
    return n.charAt(0).toUpperCase();
  }, [userData?.user?.name]);

  const navItems: Array<{
    id: ProfileSection;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: "personal", label: "Información Personal", icon: User },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "preferences", label: "Preferencias de Viaje", icon: Luggage },
    { id: "payments", label: "Pagos", icon: CreditCard },
  ];

  const togglePref = (label: string) => {
    setPrefs((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  const toggleTravelStyle = (label: string) => {
    setTravelStyles((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  const removeInterest = (label: string) => {
    setInterestTags((prev) => prev.filter((t) => t !== label));
  };

  const addInterest = () => {
    const v = newInterest.trim();
    if (!v) return;
    setInterestTags((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setNewInterest("");
  };

  const refreshMe = async () => {
    const res = await api.get<UserData>("/auth/me");
    setUserData(res.data);
  };

  const patchMe = async (payload: Record<string, any>, picture?: File | null) => {
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    if (picture) form.append("picture", picture);

    // Enviar multipart/form-data
    await api.patch("/auth/me", form, {
      headers: {
        // Dejar que el browser ponga boundary (axios lo ajusta en runtime)
        "Content-Type": "multipart/form-data",
      },
    });
  };

  return (
    <div className="bg-[#fdfdfc] text-[#121717] dark:bg-[#1a1a1a] dark:text-gray-100 min-h-screen">
      <CustomersNav />

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.id === active;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="flex-1">
            <header className="mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#121717] dark:text-white">
                {active === "personal"
                  ? "Editar Perfil"
                  : active === "security"
                    ? "Seguridad"
                    : active === "preferences"
                      ? "Preferencias de Viaje"
                      : "Pagos"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {active === "personal"
                  ? "Actualiza tu información personal y cómo te ven los demás."
                  : active === "security"
                    ? "Administra tu contraseña y opciones de seguridad."
                    : active === "preferences"
                      ? "Personaliza el tipo de experiencias que más te gustan."
                      : "Configura tus métodos de pago y facturación."}
              </p>
            </header>

            {active === "personal" && (
              <div className="max-w-2xl">
                <div className="mb-10 flex items-center gap-6">
                  <div className="relative">
                    <div className="size-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      {picturePreviewUrl ? (
                        // preview local
                        <img
                          alt="Avatar"
                          src={picturePreviewUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : userData?.user?.image ? (
                        <Image
                          alt="Avatar"
                          src={userData.user.image}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-extrabold text-white">
                          {avatarFallback}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform"
                      aria-label="Editar foto"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setPictureFile(f);
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Foto de perfil</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG o PNG. Máximo 1MB.
                    </p>
                  </div>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (savingPersonal) return;
                    try {
                      setSavingPersonal(true);
                      const payload: Record<string, any> = {
                        nameUser: fullName,
                        emailUser: email,
                        phoneUser: phone,
                        bio,
                        preferences: prefs,
                      };
                      await patchMe(payload, pictureFile);
                      await refreshMe();
                      setPictureFile(null);
                      toast.success("Perfil actualizado");
                    } catch (err: any) {
                      toast.error(
                        err?.response?.data?.message ||
                          err?.message ||
                          "No se pudo actualizar el perfil"
                      );
                    } finally {
                      setSavingPersonal(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-6">
                    <Field label="Nombre Completo">
                      <input
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={loading ? "Cargando..." : "Tu nombre"}
                      />
                    </Field>

                    <Field label="Correo Electrónico">
                      <input
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={loading ? "Cargando..." : "correo@ejemplo.com"}
                      />
                    </Field>

                    <Field label="Teléfono">
                      <input
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+57 300 000 0000"
                      />
                    </Field>

                    <Field label="Biografía">
                      <textarea
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all outline-none resize-none"
                        placeholder="Cuéntanos un poco sobre tus viajes..."
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="pt-4">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-4">
                      Preferencias
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Aventura",
                        "Playa",
                        "Gastronomía",
                        "Cultura",
                        "Relax",
                        "Montaña",
                      ].map((label) => {
                        const selected = prefs.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => togglePref(label)}
                            className={[
                              "px-4 py-2 rounded-full border-2 text-sm transition-all",
                              selected
                                ? "border-primary bg-primary text-white font-bold"
                                : "border-gray-200 dark:border-gray-700 text-[#121717] dark:text-gray-300 font-semibold hover:border-primary/50",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button
                      className="bg-primary text-white px-10 py-4 rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                      type="submit"
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {active === "security" && (
              <div className="max-w-2xl space-y-12">
                <section>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    Cambiar contraseña
                  </h3>
                  <form
                    className="space-y-5"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (savingPassword) return;
                      if (!newPassword || newPassword.length < 8) {
                        toast.error("La nueva contraseña debe tener al menos 8 caracteres");
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        toast.error("Las contraseñas no coinciden");
                        return;
                      }
                      try {
                        setSavingPassword(true);
                        // Para usuarios con Google-only, currentPassword puede omitirse
                        const payload: Record<string, string> = { newPassword };
                        if (currentPassword.trim()) {
                          payload.currentPassword = currentPassword.trim();
                        }
                        await api.post("/auth/password", payload);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        toast.success("Contraseña actualizada");
                      } catch (err: any) {
                        toast.error(
                          err?.response?.data?.error?.message ||
                            err?.response?.data?.message ||
                            err?.message ||
                            "No se pudo cambiar la contraseña"
                        );
                      } finally {
                        setSavingPassword(false);
                      }
                    }}
                  >
                    <Field label="Contraseña actual (si aplica)">
                      <input
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 transition-all"
                        placeholder="••••••••••••"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Nueva contraseña">
                        <input
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 transition-all"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Field>
                      <Field label="Confirmar contraseña">
                        <input
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 transition-all"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="pt-2">
                      <button
                        className="bg-primary text-white px-8 py-3 rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                        type="submit"
                        disabled={savingPassword}
                      >
                        {savingPassword ? "ACTUALIZANDO..." : "ACTUALIZAR CONTRASEÑA"}
                      </button>
                    </div>
                  </form>
                </section>

                <hr className="border-gray-100 dark:border-gray-800" />

                <section>
                  <h3 className="text-xl font-bold mb-6">Sesiones activas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sessionsLoading
                          ? "Cargando sesiones..."
                          : sessions.length
                            ? `${sessions.length} sesión(es) activas`
                            : "No hay sesiones activas"}
                      </p>
                      <button
                        type="button"
                        onClick={fetchSessions}
                        className="text-sm font-bold text-primary hover:underline"
                        disabled={sessionsLoading}
                      >
                        Actualizar
                      </button>
                    </div>

                    {sessions.map((s) => {
                      const ua = (s.userAgent || "").toLowerCase();
                      const isMobile = /mobile|android|iphone|ipad|tablet/.test(ua);
                      const isCurrent = Boolean(s.isCurrent);
                      const Icon = isMobile ? Smartphone : Laptop;

                      const secondary = [
                        s.ipAddress ? `IP ${s.ipAddress}` : null,
                        s.expiresAt
                          ? `Expira ${new Date(s.expiresAt).toLocaleString("es-CO")}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" • ");

                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                              <Icon className="h-5 w-5 text-[#121717] dark:text-gray-300" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">
                                {isCurrent ? "Esta sesión" : "Sesión"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {secondary || "Activa"}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                ID: {s.id.slice(0, 10)}…
                              </p>
                            </div>
                          </div>

                          {isCurrent ? (
                            <span className="text-xs font-extrabold text-primary uppercase tracking-tight">
                              Actual
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs font-extrabold text-gray-500 hover:text-primary uppercase tracking-tight transition-colors"
                              onClick={async () => {
                                try {
                                  await api.delete(`/auth/sessions/${s.id}`);
                                  toast.success("Sesión cerrada");
                                  fetchSessions();
                                } catch (err: any) {
                                  toast.error(
                                    err?.response?.data?.message ||
                                      err?.message ||
                                      "No se pudo cerrar la sesión"
                                  );
                                }
                              }}
                            >
                              Cerrar sesión
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {active === "preferences" && (
              <div className="max-w-3xl">
                <form
                  className="space-y-12"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (savingPreferences) return;
                    try {
                      setSavingPreferences(true);
                      const payload: Record<string, any> = {
                        preferences: prefs,
                        travelStyles,
                        interestTags,
                      };
                      await patchMe(payload, null);
                      await refreshMe();
                      toast.success("Preferencias actualizadas");
                    } catch (err: any) {
                      toast.error(
                        err?.response?.data?.message ||
                          err?.message ||
                          "No se pudieron actualizar las preferencias"
                      );
                    } finally {
                      setSavingPreferences(false);
                    }
                  }}
                >
                  <div className="space-y-4">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500">
                      Estilo de viaje
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Aventura", icon: Mountain },
                        { label: "Relax", icon: Sparkles },
                        { label: "Lujo", icon: Gem },
                        { label: "Económico", icon: PiggyBank },
                      ].map((item) => {
                        const selected = travelStyles.includes(item.label);
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => toggleTravelStyle(item.label)}
                            className={[
                              "border-2 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all",
                              selected
                                ? "border-primary bg-primary/5 hover:shadow-lg"
                                : "border-gray-100 dark:border-gray-800 hover:border-primary/30",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "size-12 rounded-xl flex items-center justify-center transition-colors",
                                selected
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                              ].join(" ")}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-sm">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-4 group-focus-within:text-primary transition-colors">
                      Destinos de interés
                    </label>
                    <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                      {interestTags.map((t) => (
                        <span
                          key={t}
                          className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeInterest(t)}
                            className="text-gray-500 hover:text-primary transition-colors"
                            aria-label={`Quitar ${t}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 p-0 text-sm placeholder:text-gray-400 outline-none"
                        placeholder="Añadir destino..."
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addInterest}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold hover:border-primary/50 transition-all"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button
                      className="bg-primary text-white px-10 py-4 rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                      type="submit"
                      disabled={savingPreferences}
                    >
                      {savingPreferences ? "GUARDANDO..." : "GUARDAR PREFERENCIAS"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {active === "payments" && (
              <div>
                <div className="mt-16">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-extrabold tracking-tight text-[#121717] dark:text-white">
                      Historial de transacciones
                    </h3>
                    <button
                      type="button"
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Ver todo el historial
                    </button>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-500">
                            Fecha
                          </th>
                          <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-500">
                            Viaje / Concepto
                          </th>
                          <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-500">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-500 text-right">
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {transactions.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium">
                              {t.date}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">
                                  {t.title}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t.subtitle}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <BadgeCheck className="h-4 w-4" />
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-extrabold text-right">
                              {t.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">Datos de facturación</h4>
                      <p className="text-sm text-gray-500 max-w-sm">
                        Tus facturas se enviarán a{" "}
                        <span className="font-semibold">
                          {userData?.user?.email || "tu correo"}
                        </span>
                        . ¿Necesitas facturar a nombre de una empresa?
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="whitespace-nowrap px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:border-primary transition-all"
                  >
                    Editar Información
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <CustomersFooter />
    </div>
  );
}

export default ProfilePage;
