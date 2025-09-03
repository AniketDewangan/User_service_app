// lib/api.ts
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  profileId?: number;
  name?: string;
  email?: string;
};

export type ProfileRequest = {
  name: string;
  email: string;          // frozen in UI, but required by backend
  dob: string;            // YYYY-MM-DD
  sex: string;            // "Male" | "Female" | "Other" | "Prefer not to say" | etc.
  password: string;       // REQUIRED by backend on create & update
  phones?: string[];
  addresses?: string[];
};

export type ProfileResponse = {
  id: number;
  name: string;
  email: string;
  dob: string;            // ISO date
  age: number;
  sex: string;
  password?: string;      // present in DTO but we won't use it in UI
  phones: string[];
  addresses: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // e.g., http://localhost:8080

// ------ Auth/session helpers (no JWT in your backend) ------
const SESSION_KEY = "users_frontend_session"; // stores { profileId, email, name }

export type SessionInfo = {
  profileId: number;
  email: string;
  name?: string;
};

export function setSession(s: SessionInfo) {
  if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function getSession(): SessionInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  try { return raw ? JSON.parse(raw) as SessionInfo : null; } catch { return null; }
}

export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

// ------ API calls matching your Spring controllers ------

// Register = POST /api/profiles  (expects ProfileRequest)  -> returns ProfileResponse
export async function apiRegisterProfile(body: ProfileRequest): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await safeText(res) || `Register failed (${res.status})`);
  }
  const data = await res.json();
  // set session from the returned profile
  setSession({ profileId: data.id, email: data.email, name: data.name });
  return normalizeProfileResponse(data);
}

// Login = POST /api/profiles/login (expects LoginRequest) -> returns LoginResponse
export async function apiLogin(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 404 || res.status === 401 || !res.ok) {
    const err = await tryJSON<LoginResponse>(res);
    throw new Error(err?.message || `Login failed (${res.status})`);
  }
  const data = await res.json() as LoginResponse;
  if (!data.success || !data.profileId || !data.email) {
    throw new Error(data.message || "Invalid login response");
  }
  setSession({ profileId: data.profileId, email: data.email, name: data.name });
  return data;
}

// Get profile by id = GET /api/profiles/{id} -> ProfileResponse
export async function apiGetProfileById(id: number): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`);
  if (!res.ok) throw new Error(await safeText(res) || `Fetch profile failed (${res.status})`);
  const data = await res.json();
  return normalizeProfileResponse(data);
}

// Update profile = PUT /api/profiles/{id} (expects ProfileRequest) -> ProfileResponse
export async function apiUpdateProfile(id: number, body: ProfileRequest): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await safeText(res) || `Update failed (${res.status})`);
  }
  const data = await res.json();
  // Refresh local session name/email if changed (email is frozen in UI but included in payload)
  setSession({ profileId: data.id, email: data.email, name: data.name });
  return normalizeProfileResponse(data);
}

// Optional: verify password = POST /api/profiles/{id}/verify-password
export async function apiVerifyPassword(id: number, password: string): Promise<{ matches: boolean }> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}/verify-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(await safeText(res) || `Verify failed (${res.status})`);
  return res.json();
}

// ------ helpers ------
function normalizeProfileResponse(d: any): ProfileResponse {
  return {
    id: d.id,
    name: d.name || "",
    email: d.email || "",
    dob: d.dob ? String(d.dob).slice(0, 10) : "",
    age: typeof d.age === "number" ? d.age : 0,
    sex: d.sex || "",
    password: undefined, // never surface to UI
    phones: Array.isArray(d.phones) ? d.phones
           : Array.isArray(d.profile_phones) ? d.profile_phones.map((x:any)=>x.phone) : [],
    addresses: Array.isArray(d.addresses) ? d.addresses
              : Array.isArray(d.profile_addresses) ? d.profile_addresses.map((x:any)=>x.address) : [],
  };
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ""; }
}
async function tryJSON<T=any>(res: Response): Promise<T | null> {
  try { return await res.json(); } catch { return null; }
}
