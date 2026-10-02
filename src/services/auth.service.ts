import { api, extractData } from "./api";
import type { Role, User } from "../types";

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: User;
}

type UserResponse = User | { user?: User };

function extractUser(value: UserResponse): User {
  if ("user" in value && value.user) return value.user;
  return value as User;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    const data = extractData<LoginResponse>(response.data);
    const token = data.token || data.accessToken || data.jwt;
    if (!token) throw new Error("La API no devolvió un JWT.");
    localStorage.setItem("kiago_token", token);
    return data;
  },

  async register(payload: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: Role;
  }) {
    return extractData(await api.post("/api/auth/register", payload));
  },

  async me() {
    const data = extractData<UserResponse>(await api.get("/api/auth/me"));
    return extractUser(data);
  },

  async updateProfile(payload: {
    name: string;
    lastName: string;
    phone: string;
  }) {
    const data = extractData<UserResponse>(
      await api.put("/api/auth/profile", payload),
    );
    return extractUser(data);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return extractData(
      await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      }),
    );
  },

  logout() {
    localStorage.removeItem("kiago_token");
  },
};
