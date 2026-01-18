"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    ],
  },
  {
    title: "Empresa",
    fields: [
      {
        name: "nombreComercial",
        label: "Nombre comercial",
        placeholder: "Ej. TravelHive",
        type: "text",
      },
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

  return (
    <form className="space-y-4">
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
                    }}
                  >
                    <option value="agency">Agencia</option>
                    <option value="person">Persona natural</option>
                  </select>
                  <p className="mt-1 text-xs text-[#657f81]">
                    Solo las agencias pueden crear viajes “full” con todo
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
          {currentStep.fields.map((field) => (
            <Field className="flex flex-col gap-1.5" key={field.name}>
              <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
                {field.label}
              </FieldLabel>
              <FieldContent>
                <input
                  className={inputClassName}
                  placeholder={field.placeholder}
                  type={field.type}
                  name={field.name}
                />
              </FieldContent>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-3 pt-2">
        <Button
          className="h-12 flex-1 rounded-xl border border-gray-200 bg-white font-bold text-[#121717] shadow-none hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          type="button"
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0}
        >
          Atrás
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          type="submit"
          onClick={(event) => {
            if (!isLastStep) {
              event.preventDefault();
              setStep((prev) => Math.min(steps.length - 1, prev + 1));
            }
          }}
        >
          {isLastStep ? "Crear cuenta" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

function UserRegisterForm() {
  return (
    <form className="space-y-4">
      <FieldSet className="space-y-2">
        <FieldGroup className="space-y-1">
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
              />
            </FieldContent>
          </Field>
          <Field className="flex flex-col gap-1.5">
            <FieldLabel className="ml-1 text-sm font-bold text-[#121717] dark:text-gray-200">
              Contraseña
            </FieldLabel>
            <FieldContent>
              <input
                className={inputClassName}
                placeholder="••••••••"
                type="password"
                name="password"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button
        className="mt-8 h-12 w-full rounded-xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        type="submit"
      >
        Crear cuenta
      </Button>
    </form>
  );
}

function RegisterPage() {
  const [role, useRole] = useState<"user" | "host">("user");
  return (
    <AuthLayout role={role} userRole={useRole}>
      {role === "host" ? <HostRegisterForm /> : <UserRegisterForm />}
    </AuthLayout>
  );
}

export default RegisterPage;
