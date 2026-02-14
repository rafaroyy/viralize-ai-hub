const API_BASE = "https://api.viralizeia.com";

export function getToken(): string | null {
  return localStorage.getItem("viralize_token");
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || data?.message || `Erro ${res.status}`);
  }

  // Handle blob responses
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("video") || ct.includes("octet-stream")) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

// Typed API helpers

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  expires_in_hours: number;
}

export interface QuotaItem {
  limit: number;
  used: number;
  remaining: number;
}

export interface QuotaResponse {
  user_id: number;
  quota: {
    total: QuotaItem;
    sora: QuotaItem;
    custom: QuotaItem;
    period_start: string;
    period_end: string;
    cycle_days: number;
  };
}

export interface CaptionStyle {
  id: string;
  label: string;
  description: string;
}

export interface CaptionStylesResponse {
  default: string;
  styles: CaptionStyle[];
}

export interface RenderJobResponse {
  job_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface JobStatus {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  result?: Record<string, unknown>;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoListItem {
  job_id: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<Record<string, unknown>>("/auth/me"),

  quota: () => apiFetch<QuotaResponse>("/quota"),

  captionStyles: () => apiFetch<CaptionStylesResponse>("/captions/styles"),

  renderVideo: (payload: Record<string, unknown>, files?: File[]) => {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (files) {
      files.forEach((file) => formData.append("files", file));
    }
    return apiFetch<RenderJobResponse>("/videos/render", {
      method: "POST",
      body: formData,
    });
  },

  jobStatus: (jobId: string) => apiFetch<JobStatus>(`/videos/status/${jobId}`),

  downloadVideo: async (jobId: string) => {
    const blob = await apiFetch<Blob>(`/videos/download/${jobId}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viralize-${jobId}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  videoList: (skip = 0, limit = 20) =>
    apiFetch<VideoListItem[]>(`/videos/list?skip=${skip}&limit=${limit}`),
};
