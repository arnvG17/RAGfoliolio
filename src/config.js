// src/config.js

const LOCAL_BACKEND = "http://localhost:5000";
const PROD_BACKEND = "https://folio-backend-beta.vercel.app";

const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const DEFAULT_API_BASE = isLocalhost ? LOCAL_BACKEND : PROD_BACKEND;

let isLocalBackendRunning = null; // null = unknown, true = running, false = not running

async function checkLocalBackend() {
  if (isLocalBackendRunning !== null) return isLocalBackendRunning;
  
  if (!isLocalhost) {
    isLocalBackendRunning = false;
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    
    // Check local backend health (using health endpoint)
    await fetch(`${LOCAL_BACKEND}/health`, {
      signal: controller.signal,
      mode: "no-cors" // no-cors avoids CORS preflight failures during offline/online check
    });
    
    clearTimeout(timeoutId);
    isLocalBackendRunning = true;
    console.log("Local backend is running. Using:", LOCAL_BACKEND);
    return true;
  } catch (e) {
    isLocalBackendRunning = false;
    console.log("Local backend is not running. Falling back to production:", PROD_BACKEND);
    return false;
  }
}

export async function getBackendUrl() {
  const localIsUp = await checkLocalBackend();
  return localIsUp ? LOCAL_BACKEND : PROD_BACKEND;
}
