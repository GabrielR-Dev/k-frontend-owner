import { api, extractData } from "./api";
import type { Plan } from "../types";

export const planService = {
  async list(): Promise<Plan[]> {
    const res = await api.get("/api/plans");
    const data: any = extractData(res);
    const list = Array.isArray(data)
      ? data
      : (data?.plans ?? data?.items ?? data?.content ?? []);
    return list;
  },
  async me(): Promise<Plan | null> {
    const res = await api.get("/api/plans/me");
    const data: any = extractData(res);
    return (data?.plan ?? data) as Plan | null;
  },
  async select(code: string): Promise<Plan> {
    const res = await api.post("/api/plans/select", { code });
    const data: any = extractData(res);
    return (data?.plan ?? data) as Plan;
  },
};
