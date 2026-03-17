interface AdminAuth {
  token: string | null;
  user: { id: string; email: string; fullName: string; role: string } | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = "coverify_admin_token";
const USER_KEY = "coverify_admin_user";

export function getStoredAuth(): AdminAuth {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user, isAuthenticated: !!token };
}

export function setStoredAuth(token: string, user: AdminAuth["user"]): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
