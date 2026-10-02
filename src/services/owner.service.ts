import { api, extractData } from "./api";
import type { Dashboard, Place, PlacePayload } from "../types";

export const ownerService = {
  async dashboard() {
    return extractData<Dashboard>(await api.get("/api/owner/dashboard"));
  },
  async places() {
    const data: any = extractData(await api.get("/api/owner/places"));
    return Array.isArray(data)
      ? data
      : (data?.places ?? data?.items ?? data?.content ?? []);
  },
  async getPlace(id: string | number) {
    const data: any = extractData(await api.get(`/api/owner/places/${id}`));
    return (data?.place ?? data) as Place;
  },
  async createPlace(payload: PlacePayload) {
    const data: any = extractData(await api.post("/api/owner/places", payload));
    return (data?.place ?? data) as Place;
  },
  async updatePlace(id: string | number, payload: PlacePayload) {
    const data: any = extractData(
      await api.put(`/api/owner/places/${id}`, payload),
    );
    return (data?.place ?? data) as Place;
  },
  async deletePlace(id: string | number) {
    return extractData(await api.delete(`/api/owner/places/${id}`));
  },
};
