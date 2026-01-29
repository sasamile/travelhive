import axios from "axios";

// Crear instancia de axios configurada
const api = axios.create({
  baseURL:"/api" ,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Incluir cookies automáticamente
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Si el data es FormData, eliminar Content-Type para que el navegador lo establezca automáticamente
    if (config.data instanceof FormData) {
      // Eliminar Content-Type para que el navegador establezca el boundary correcto
      // Esto es crítico para multipart/form-data
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
      // Log para debugging
      try {
        const formDataEntries = Array.from((config.data as FormData).entries());
        const imageEntries = formDataEntries.filter(([key]) => key === "galleryImages");
        console.log("🔍 Axios interceptor - FormData detectado:", {
          totalFields: formDataEntries.length,
          imageFields: imageEntries.length,
          imageNames: imageEntries.map(([, value]) => value instanceof File ? value.name : "no-file"),
          hasContentType: !!(config.headers?.["Content-Type"] || config.headers?.["content-type"]),
        });
      } catch (e) {
        console.log("🔍 Axios interceptor - FormData detectado (error al leer):", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
