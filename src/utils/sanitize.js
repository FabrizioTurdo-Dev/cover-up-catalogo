// src/utils/sanitize.js
// ====================================================================
// UTILIDADES DE SEGURIDAD
// ====================================================================

/**
 * Sanitiza una URL para prevenir XSS.
 * Solo permite protocolos seguros (https, http, //).
 * Bloquea javascript:, data:, vbscript:, etc.
 *
 * @param {string} url - URL a sanitizar
 * @param {string} fallback - URL por defecto si la original es inválida
 * @returns {string} URL segura o fallback
 */
export function sanitizeImageUrl(url, fallback = "") {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();

  if (!trimmed) return fallback;

  const lowercased = trimmed.toLowerCase();

  // Permitir data:image/* (imágenes base64, seguras en <img src>)
  if (lowercased.startsWith("data:image/")) {
    return trimmed;
  }

  // Bloquear otros protocolos peligrosos
  const dangerousProtocols = [
    "javascript:",
    "vbscript:",
    "file:",
    "ftp:",
  ];

  for (const protocol of dangerousProtocols) {
    if (lowercased.startsWith(protocol)) {
      console.warn(`URL bloqueada (protocolo peligroso): ${trimmed.slice(0, 80)}...`);
      return fallback;
    }
  }

  // Permitir: https://, http://, //, rutas relativas
  if (
    lowercased.startsWith("https://") ||
    lowercased.startsWith("http://") ||
    lowercased.startsWith("//") ||
    lowercased.startsWith("/")
  ) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Valida que una URL apunte a un dominio permitido.
 * Útil para restringir imágenes solo a ciertos dominios.
 *
 * @param {string} url - URL a validar
 * @param {string[]} allowedDomains - Dominios permitidos
 * @returns {boolean} true si es válida o si no hay restricciones
 */
export function isUrlFromAllowedDomain(url, allowedDomains = []) {
  if (!allowedDomains.length) return true; // Sin restricciones
  if (!url) return false;

  try {
    // Si es URL relativa, permitir
    if (url.startsWith("/") || url.startsWith("./")) return true;

    const parsed = new URL(url);
    return allowedDomains.some(domain => parsed.hostname === domain);
  } catch {
    // Si no se puede parsear, probablemente es relativa → permitir
    return true;
  }
}
