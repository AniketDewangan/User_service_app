// lib/api.ts

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  success: boolean;
  message: string;
  profileId?: number;
  name?: string;
  email?: string;
};

// Registration: only email + password required; everything else optional
export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  dob?: string;           // YYYY-MM-DD
  sex?: string;
  phones?: string[];
  addresses?: string[];   // each address may be "ADDRESS<|PIN|>PINCODE"
};

// Update: your backend requires password on update; email is frozen but required
export type ProfileUpdatePayload = {
  name?: string;
  email: string;          // frozen in UI but backend expects
  dob?: string;
  sex?: string;
  password: string;       // REQUIRED on update by backend
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
  password?: string;      // we never surface it
  phones: string[];
  addresses: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// --- session (since backend returns no JWT) ---
const SESSION_KEY = "users_frontend_session";
export type SessionInfo = { profileId: number; email: string; name?: string };

export function setSession(s: SessionInfo) {
  if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function getSession(): SessionInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  try { return raw ? (JSON.parse(raw) as SessionInfo) : null; } catch { return null; }
}
export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

// --- API calls matching your Spring controllers ---

// REGISTER  POST /api/profiles  (email/password required; others optional)
export async function apiRegisterProfile(body: RegisterPayload): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await safeText(res)) || `Register failed (${res.status})`);
  const data = await res.json();
  setSession({ profileId: data.id, email: data.email, name: data.name });
  return normalizeProfileResponse(data);
}

// LOGIN  POST /api/profiles/login
export async function apiLogin(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await tryJSON<LoginResponse>(res);
    throw new Error(j?.message || `Login failed (${res.status})`);
  }
  const data = (await res.json()) as LoginResponse;
  if (!data.success || !data.profileId || !data.email)
    throw new Error(data.message || "Invalid login response");
  setSession({ profileId: data.profileId, email: data.email, name: data.name });
  return data;
}

// GET  /api/profiles/{id}
export async function apiGetProfileById(id: number): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`);
  if (!res.ok) throw new Error((await safeText(res)) || `Fetch profile failed (${res.status})`);
  return normalizeProfileResponse(await res.json());
}

// PUT  /api/profiles/{id}
export async function apiUpdateProfile(id: number, body: ProfileUpdatePayload): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await safeText(res)) || `Update failed (${res.status})`);
  const data = await res.json();
  setSession({ profileId: data.id, email: data.email, name: data.name });
  return normalizeProfileResponse(data);
}

// Optional: POST /api/profiles/{id}/verify-password
export async function apiVerifyPassword(id: number, password: string): Promise<{ matches: boolean }> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}/verify-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error((await safeText(res)) || `Verify failed (${res.status})`);
  return res.json();
}

// --- helpers ---
function normalizeProfileResponse(d: any): ProfileResponse {
  return {
    id: d.id,
    name: d.name || "",
    email: d.email || "",
    dob: d.dob ? String(d.dob).slice(0, 10) : "",
    age: typeof d.age === "number" ? d.age : 0,
    sex: d.sex || "",
    password: undefined,
    phones: Array.isArray(d.phones)
      ? d.phones
      : Array.isArray(d.profile_phones)
      ? d.profile_phones.map((x: any) => x.phone)
      : [],
    addresses: Array.isArray(d.addresses)
      ? d.addresses
      : Array.isArray(d.profile_addresses)
      ? d.profile_addresses.map((x: any) => x.address)
      : [],
  };
}
async function safeText(res: Response) { try { return await res.text(); } catch { return ""; } }
async function tryJSON<T = any>(res: Response) { try { return (await res.json()) as T; } catch { return null; } }
