"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AuthLayout from "@/components/auth/AuthLayout";
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
        name: "commercialName",
        label: "Nombre comercial",
        placeholder: "Ej. TravelHive",
        type: "text",
      },
    ],
  },
  {
    title: "Contacto",
    fields: [
      {
        name: "corporateEmail",
        label: "Email corporativo",
        placeholder: "contacto@empresa.com",
        type: "email",
      },
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

const agentSteps = [
  {
    title: "Identificación",
    fields: [
      {
        name: "documento",
        label: "Documento de identidad",
        placeholder: "CC 123456789",
        type: "text",
      },
      {
        name: "phone",
        label: "Teléfono",
        placeholder: "+57 300 000 0000",
        type: "text",
      },
    ],
  },
  {
    title: "Ubicación",
    fields: [
      {
        name: "ciudadDepartamento",
        label: "Ciudad/Departamento",
        placeholder: "Bogotá, Cundinamarca",
        type: "text",
      },
    ],
  },
];

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || null;
  const [hostType, setHostType] = useState<"agency" | "person">("agency");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      toast.error("No se proporcionó información del usuario");
      router.push("/auth/register");
      return;
    }
  }, [userId, router]);

  const steps = hostType === "agency" ? agencySteps : agentSteps;
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceedToNextStep = () => {
    // Validar campos requeridos del paso actual
    const requiredFields = currentStep.fields.filter((field) => {
      // Algunos campos son opcionales en el último paso
      if (isLastStep) {
        if (hostType === "agency") {
          // Para agencia, todos los campos del último paso son requeridos excepto ciudadDepartamento y direccionTelefono
          if (field.name === "ciudadDepartamento" || field.name === "direccionTelefono") {
            return false;
          }
        }
        return false; // En el último paso, algunos campos pueden ser opcionales
      }
      return true;
    });

    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === "") {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      toast.error("Usuario no válido");
      setLoading(false);
      return;
    }

    try {
      // Determinar el rol a usar
      const finalRole = hostType === "agency" ? "agency" : "agent";

      // Validar campos requeridos según el tipo
      if (hostType === "agency") {
        if (!formData.nit || !formData.rnt || !formData.commercialName || !formData.corporateEmail) {
          toast.error("Por favor completa todos los campos requeridos para agencia");
          setLoading(false);
          return;
        }
      } else {
        if (!formData.documento) {
          toast.error("Por favor ingresa tu documento de identidad");
          setLoading(false);
          return;
        }
      }

      // TODO: Implementar lógica de registro
      toast.success("Datos completados exitosamente. Tu cuenta está en revisión.");
      router.push("/auth/login?message=registration_pending");
    } catch (err: any) {
      toast.error(err.message || "Error al completar el registro");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

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
                    Solo las agencias pueden crear viajes "full" con todo pagado.
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
                className={`flex flex-1 items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs font-bold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : isCompleted
                      ? "border-primary/40 text-primary/80"
                      : "border-gray-200 text-[#657f81] hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                    isActive
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
            const isRequired = isLastStep && (
              (hostType === "agency" && 
                (field.name === "corporateEmail" || field.name === "nit" || field.name === "rnt" || field.name === "commercialName")) ||
              (hostType === "person" && field.name === "documento")
            );

            return (
              <Field className="flex flex-col gap-1.5" key={field.name}>
                <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
                  {field.label} {isRequired && <span className="text-red-500">*</span>}
                </FieldLabel>
                <FieldContent>
                  <input
                    className={inputClassName}
                    placeholder={field.placeholder}
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={isRequired}
                  />
                </FieldContent>
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
              if (!canProceedToNextStep()) {
                toast.error("Por favor completa correctamente todos los campos antes de continuar");
                return;
              }
              setStep((prev) => Math.min(steps.length - 1, prev + 1));
            }
          }}
          disabled={loading || (!isLastStep && !canProceedToNextStep())}
        >
          {loading ? "Guardando..." : isLastStep ? "Completar registro" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

export default function CompleteProfilePage() {
  return (
    <AuthLayout role="host">
      <CompleteProfileForm />
    </AuthLayout>
  );
}
