import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Tipos para roles y respuesta de la API
type UserRole = "customer" | "agent" | "agency" | "admin";
interface AgencyInfo {
  idAgency: string;
  role: "admin" | "agent";
  agency: {
    idAgency: string;
    nameAgency: string;
    email: string;
    approvalStatus: string;
    status: string;
  };
}
interface AuthMeResponse {
  user?: {
    id: string;
    email: string;
    name?: string;
    emailVerified?: boolean;
  };
  agencies?: AgencyInfo[];
  error?: string;
}

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/complete-profile",
  "/", // Página principal puede ser pública
  "/customers", // Página de búsqueda pública
  "/customers/search", // Búsqueda es pública
];

// Rutas que requieren autenticación pero son específicas
const protectedRoutes = {
  agent: ["/agent"],
  customer: ["/customers/viajes"],
};

// Función simplificada para verificar solo si hay cookie de sesión
// NO hacer fetch a /auth/me para evitar timeouts y loops infinitos
function hasSessionCookie(request: NextRequest): boolean {
  // Buscar ambas variantes de la cookie (con y sin prefijo __Secure-)
  const sessionToken = request.cookies.get("better-auth.session_token");
  const secureSessionToken = request.cookies.get("__Secure-better-auth.session_token");
  return !!(sessionToken || secureSessionToken);
}

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

// Función para verificar si un usuario tiene acceso a una ruta
function hasAccess(pathname: string, userRole: UserRole | null): boolean {
  if (!userRole) {
    return isPublicRoute(pathname);
  }

  // Rutas de agente/agencia (admin también puede acceder)
  if (pathname.startsWith("/agent")) {
    return userRole === "agent" || userRole === "agency" || userRole === "admin";
  }
  
  // Ruta de preview (solo para agentes)
  if (pathname.startsWith("/new/preview")) {
    return userRole === "agent" || userRole === "agency" || userRole === "admin";
  }

  // Rutas de customer (solo para usuarios sin agencias)
  if (pathname.startsWith("/customers/viajes")) {
    return userRole === "customer";
  }

  // Rutas generales de customers (búsqueda, etc.) son públicas o para customers
  if (pathname.startsWith("/customers") && !pathname.startsWith("/customers/search")) {
    // Permitir acceso a customers solo si es customer o la ruta es pública
    return userRole === "customer" || isPublicRoute(pathname);
  }

  // Rutas públicas
  return true;
}

// Función para obtener el rol del usuario desde la respuesta de /auth/me
function getUserRoleFromResponse(response: AuthMeResponse): UserRole | null {
  if (!response.user) {
    return null;
  }

  // Si tiene agencias, verificar el rol en las agencias
  if (response.agencies && response.agencies.length > 0) {
    const agency = response.agencies[0];
    // Si tiene rol admin o agent en una agencia, es un agente/anfitrión
    if (agency.role === "admin" || agency.role === "agent") {
      return "agent"; // o "agency" si prefieres
    }
  }

  // Por defecto, asumir customer si no hay agencias
  return "customer";
}

// Función para obtener la ruta de redirección según el rol
function getRedirectPathByRole(role: UserRole | null): string {
  if (!role) {
    return "/";
  }

  switch (role) {
    case "agent":
    case "agency":
    case "admin":
      return "/agent";
    case "customer":
      return "/customers";
    default:
      return "/";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir siempre acceso a archivos estáticos y API routes (ya están excluidos en el matcher, pero por si acaso)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Verificar si la ruta es pública
  if (isPublicRoute(pathname)) {
    // Para rutas públicas, permitir acceso inmediatamente sin verificar sesión
    // Esto evita loops infinitos y timeouts innecesarios
    return NextResponse.next();
  }

  // Verificar sesión para rutas protegidas (solo verificar cookie, sin fetch)
  // Si no hay cookie de sesión, redirigir a login
  if (!hasSessionCookie(request)) {
    // Usuario no autenticado intentando acceder a ruta protegida
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay cookie, permitir acceso (la protección real se hace en el cliente)
  // Esto evita loops infinitos y timeouts
  return NextResponse.next();
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
