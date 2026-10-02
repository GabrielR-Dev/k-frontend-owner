export type Role = "OWNER" | "ADMIN" | "TOURIST";
export type PlaceStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type PlaceCategory =
  "GENERAL" | "RESTAURANT" | "HOTEL" | "MUSEUM" | "TOURIST_ATTRACTION" | "SHOP";

export interface User {
  id?: number | string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
}

export interface Plan {
  id?: number | string;
  code: string;
  name?: string;
  description?: string;
  price?: number;
  active?: boolean;
  maxPlaces?: number;
  [key: string]: unknown;
}

export interface Place {
  id: number | string;
  name: string;
  description?: string;
  category: PlaceCategory | string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  image_url?: string;
  status: PlaceStatus;
  rejection_reason?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dashboard {
  totalPlaces?: number;
  approvedPlaces?: number;
  pendingPlaces?: number;
  rejectedPlaces?: number;
  statistics?: {
    totalPlaces: number;
    approvedPlaces: number;
    pendingPlaces: number;
    rejectedPlaces: number;
  };
  plan?: Plan | null;
  [key: string]: unknown;
}

export interface PlacePayload {
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}
