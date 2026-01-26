"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";


const inputClassName =
  "h-12 w-full rounded-xl border border-gray-200 bg-transparent px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:text-white";

const agencySteps = [
  {
    title: "Identificación",
    fields: [
      {
        name: "nit",
        label: "NIT",
        placeholder: "900123456-7",
        type: "text",
      },
      {
        name: "rnt",
        label: "Número de RNT",
        placeholder: "RNT-000000",
        type: "text",
      },
      {
        name: "nombreComercial",
        label: "Nombre comercial",
        placeholder: "Ej. TravelHive",
        type: "text",
      },
    ],
  },
  {
    title: "Empresa",
    fields: [

      {
        name: "emailCorporativo",
        label: "Email corporativo",
        placeholder: "contacto@empresa.com",
        type: "email",
      },
      {
        name: "password",
        label: "Contraseña",
        placeholder: "••••••••",
        type: "password",
      },
      {
        name: "confirmPassword",
        label: "Confirmar contraseña",
        placeholder: "••••••••",
        type: "password",
      },
    ],
  },
  {
    title: "Contacto",
    fields: [
      {
        name: "ciudadDepartamento",
        label: "Ciudad/Departamento",
        placeholder: "Bogotá, Cundinamarca",
        type: "text",
      },
      {
        name: "direccionTelefono",
        label: "Dirección y teléfono",
        placeholder: "Calle 123 #45-67, +57 300 000 0000",
        type: "text",
      },
    ],
  },
];

function HostRegisterForm() {
  const [hostType, setHostType] = useState<"agency" | "person">("agency");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const steps =
    hostType === "agency"
      ? agencySteps
      : [
        {
          title: "Identificación",
          fields: [
            {
              name: "fullName",
              label: "Nombre completo",
              placeholder: "Tu nombre",
              type: "text",
            },
            {
              name: "documento",
              label: "Documento de identidad",
              placeholder: "CC 123456789",
              type: "text",
            },
          ],
        },
        {
          title: "Contacto",
          fields: [
            {
              name: "email",
              label: "Email",
              placeholder: "hola@gmail.com",
              type: "email",
            },
            {
              name: "password",
              label: "Contraseña",
              placeholder: "••••••••",
              type: "password",
            },
            {
              name: "confirmPassword",
              label: "Confirmar contraseña",
              placeholder: "••••••••",
              type: "password",
            },
          ],
        },
        {
          title: "Acceso",
          fields: [
            {
              name: "telefono",
              label: "Teléfono",
              placeholder: "+57 300 000 0000",
              type: "text",
            },
            {
              name: "ciudadDepartamento",
              label: "Ciudad/Departamento",
              placeholder: "Bogotá, Cundinamarca",
              type: "text",
            },
          ],
        },
      ];
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const validatePassword = (password: string, confirmPassword?: string) => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (confirmPassword !== undefined && confirmPassword !== "") {
      if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      } else if (confirmPassword && !password) {
        errors.confirmPassword = "Primero ingresa la contraseña";
      }
    }

    return errors;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Validación en tiempo real para contraseñas
      if (name === "password" || name === "confirmPassword") {
        const password = name === "password" ? value : prev.password || "";
        const confirmPassword = name === "confirmPassword" ? value : prev.confirmPassword || "";

        const errors = validatePassword(password, confirmPassword || undefined);
        setPasswordErrors(errors);
      }

      return updated;
    });
  };

  const canProceedToNextStep = () => {
    // Si estamos en el paso que tiene contraseñas, validar antes de avanzar
    const passwordStep = steps.findIndex((s) =>
      s.fields.some((f) => f.name === "password")
    );

    if (step === passwordStep) {
      const password = formData.password || "";
      const confirmPassword = formData.confirmPassword || "";

      if (!password || !confirmPassword) {
        return false;
      }

      const errors = validatePassword(password, confirmPassword);
      return Object.keys(errors).length === 0;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (hostType === "agency") {
        // Validar campos requeridos para agencia
        if (!formData.nit || !formData.rnt || !formData.nombreComercial ||
          !formData.emailCorporativo || !formData.password) {
          toast.error("Por favor completa todos los campos requeridos");
          setLoading(false);
          return;
        }

        // Validar contraseñas
        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error("La contraseña debe tener al menos 8 caracteres");
          setLoading(false);
          return;
        }

        // Simular registro (sin backend)
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Formulario validado correctamente. (Backend no implementado)");
      } else {
        // Validar campos requeridos para agente
        if (!formData.fullName || !formData.documento || !formData.email ||
          !formData.password) {
          toast.error("Por favor completa todos los campos requeridos");
          setLoading(false);
          return;
        }

        // Validar contraseñas
        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error("La contraseña debe tener al menos 8 caracteres");
          setLoading(false);
          return;
        }

        // Simular registro (sin backend)
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Formulario validado correctamente. (Backend no implementado)");
      }
    } catch (err: any) {
      toast.error("Error al procesar el formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-3 pb-4">
        <FieldSet className="space-y-2">
          <FieldGroup className="space-y-1 pb-4">
            {step === 0 && (
              <Field className="flex flex-col gap-1.5">
                <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
                  Tipo de anfitrión
                </FieldLabel>
                <FieldContent>
                  <select
                    className={`${inputClassName} bg-white dark:bg-transparent`}
                    value={hostType}
                    onChange={(event) => {
                      setHostType(event.target.value as "agency" | "person");
                      setStep(0);
                      setFormData({});
                    }}
                  >
                    <option value="agency">Agencia</option>
                    <option value="person">Persona natural</option>
                  </select>
                  <p className="mt-1 text-xs text-[#657f81]">
                    Solo las agencias pueden crear viajes "full" con todo
                    pagado.
                  </p>
                </FieldContent>
              </Field>
            )}
          </FieldGroup>
        </FieldSet>
        <div className="flex items-center justify-between gap-2">
          {steps.map((item, index) => {
            const isActive = index === step;
            const isCompleted = index < step;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={`flex flex-1 items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs font-bold uppercase tracking-wide transition-colors ${isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : isCompleted
                    ? "border-primary/40 text-primary/80"
                    : "border-gray-200 text-[#657f81] hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${isActive
                    ? "bg-primary text-white"
                    : isCompleted
                      ? "bg-primary/80 text-white"
                      : "bg-gray-200 text-[#657f81] dark:bg-gray-700"
                    }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <FieldSet className="space-y-2">
        <FieldGroup className="space-y-1">
          {currentStep.fields.map((field) => {
            const hasError = passwordErrors[field.name];
            const isPasswordField = field.name === "password" || field.name === "confirmPassword";
            const password = formData.password || "";
            const confirmPassword = formData.confirmPassword || "";
            const isPasswordValid = password.length >= 8;
            const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

            return (
              <Field className="flex flex-col gap-1.5" key={field.name}>
                <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
                  {field.label}
                </FieldLabel>
                <FieldContent>
                  <input
                    className={`${inputClassName} ${hasError ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                    placeholder={field.placeholder}
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={isLastStep}
                  />
                </FieldContent>
                {isPasswordField && (
                  <div className="ml-1 space-y-1">
                    {field.name === "password" && password && (
                      <p className={`text-xs ${isPasswordValid ? "text-green-600" : "text-red-600"}`}>
                        {isPasswordValid ? "✓ Contraseña segura" : "✗ Mínimo 8 caracteres"}
                      </p>
                    )}
                    {field.name === "confirmPassword" && confirmPassword && (
                      <p className={`text-xs ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                        {doPasswordsMatch ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                      </p>
                    )}
                    {hasError && (
                      <p className="text-xs text-red-600">{hasError}</p>
                    )}
                  </div>
                )}
              </Field>
            );
          })}
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-3 pt-2">
        <Button
          className="h-12 flex-1 rounded-xl border border-gray-200 bg-white font-bold text-[#121717] shadow-none hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          type="button"
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0 || loading}
        >
          Atrás
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          type={isLastStep ? "submit" : "button"}
          onClick={(event) => {
            if (!isLastStep) {
              event.preventDefault();
              // Validar antes de avanzar
              if (!canProceedToNextStep()) {
                toast.error("Por favor completa correctamente todos los campos antes de continuar");
                return;
              }
              setStep((prev) => Math.min(steps.length - 1, prev + 1));
            }
          }}
          disabled={loading || (!isLastStep && !canProceedToNextStep())}
        >
          {loading ? "Registrando..." : isLastStep ? "Crear cuenta" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

function UserRegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string, confirmPassword?: string) => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (confirmPassword !== undefined && confirmPassword !== "") {
      if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      } else if (confirmPassword && !password) {
        errors.confirmPassword = "Primero ingresa la contraseña";
      }
    }

    return errors;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Validación en tiempo real para contraseñas
      if (name === "password" || name === "confirmPassword") {
        const password = name === "password" ? value : prev.password || "";
        const confirmPassword = name === "confirmPassword" ? value : prev.confirmPassword || "";

        const errors = validatePassword(password, confirmPassword || undefined);
        setPasswordErrors(errors);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar contraseñas
      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        setLoading(false);
        return;
      }

      // Simular registro (sin backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Formulario validado correctamente. (Backend no implementado)");
    } catch (err: any) {
      toast.error("Error al procesar el formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldSet className="space-y-2">
        <FieldGroup className="-space-y-2">
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Nombre completo
            </FieldLabel>
            <FieldContent>
              <input
                className={inputClassName}
                placeholder="Tu nombre"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                required
              />
            </FieldContent>
          </Field>
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Correo electrónico
            </FieldLabel>
            <FieldContent>
              <input
                className={inputClassName}
                placeholder="hola@gmail.com"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </FieldContent>
          </Field>
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Contraseña
            </FieldLabel>
            <FieldContent>
              <input
                className={`${inputClassName} ${passwordErrors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="••••••••"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </FieldContent>
            {formData.password && (
              <p className={`ml-1 text-xs ${formData.password.length >= 8 ? "text-green-600" : "text-red-600"}`}>
                {formData.password.length >= 8 ? "✓ Contraseña segura" : "✗ Mínimo 8 caracteres"}
              </p>
            )}
          </Field>
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Confirmar contraseña
            </FieldLabel>
            <FieldContent>
              <input
                className={`${inputClassName} ${passwordErrors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="••••••••"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </FieldContent>
            {formData.confirmPassword && (
              <p className={`ml-1 text-xs ${formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                ? "text-green-600"
                : "text-red-600"
                }`}>
                {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                  ? "✓ Las contraseñas coinciden"
                  : "✗ Las contraseñas no coinciden"}
              </p>
            )}
            {passwordErrors.confirmPassword && (
              <p className="ml-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button
        className="mt-8 h-12 w-full cursor-pointer rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}

function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "host">("user");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Usar la URL completa del frontend para el callback
      // Detectar automáticamente la URL del frontend (puerto 3001)
      const frontendURL = typeof window !== "undefined" 
        ? `${window.location.protocol}//${window.location.host}` 
        : "http://localhost:3001";
      const callbackURL = `${frontendURL}/customers`;
      
      const response = await api.post("/api/auth/sign-in/social", {
        provider: "google",
        callbackURL,
      });

      // La respuesta contiene la URL de autorización de Google
      if (response.data?.url) {
        // Redirigir al usuario a Google OAuth
        // Better Auth manejará automáticamente:
        // - Si el usuario NO existe: lo crea automáticamente (registro)
        // - Si el usuario YA existe: inicia sesión (login)
        // Luego redirige al callbackURL especificado
        window.location.href = response.data.url;
      } else {
        toast.error("Error al obtener la URL de autorización de Google");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      const rawErrorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error al registrarse con Google";
      
      toast.error(rawErrorMessage);
      setGoogleLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      role={role} 
      userRole={setRole}
      onGoogleClick={role === "user" ? handleGoogleSignIn : undefined}
      googleLoading={googleLoading}
    >
      {role === "host" ? <HostRegisterForm /> : <UserRegisterForm />}
    </AuthLayout>
  );
}

export default RegisterPage;
