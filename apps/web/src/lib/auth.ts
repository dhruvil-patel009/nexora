import { AuthResponse, AuthUser, AuthWorkspace } from "@nexora/shared";

const TOKEN_KEY = "nexora_access_token";
const USER_KEY = "nexora_user";
const WORKSPACE_KEY = "nexora_active_workspace";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getActiveWorkspace(): AuthWorkspace | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(data: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(data.workspace));

  // Also set cookie for server-side / middleware inspection
  document.cookie = `nexora_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(WORKSPACE_KEY);
  document.cookie = "nexora_token=; path=/; max-age=0; SameSite=Lax";
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
