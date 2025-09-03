// pages/profile.tsx
import { useEffect, useMemo, useState } from "react";
import {
  apiGetProfileById,
  apiUpdateProfile,
  getSession,
  clearSession,
  ProfileRequest,
  ProfileResponse,
} from "../lib/api";
import { useRouter } from "next/router";
import { DynamicList } from "../components/DynamicList";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  // editable state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // read-only
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number>(0);
  const [sex, setSex] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [addresses, setAddresses] = useState<string[]>([""]);
  const [password, setPassword] = useState(""); // REQUIRED on update by backend

  const [original, setOriginal] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    (async () => {
      const s = getSession();
      if (!s?.profileId) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      try {
        const p = await apiGetProfileById(s.profileId);
        setProfile(p);
        setOriginal(p);
        setName(p.name || "");
        setEmail(p.email || "");
        setDob(p.dob || "");
        setAge(p.age || 0);
        setSex(p.sex || "");
        setPhones(p.phones?.length ? p.phones : [""]);
        setAddresses(p.addresses?.length ? p.addresses : [""]);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derive age when DOB changes
  useEffect(() => {
    if (!dob) return;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    setAge(a);
  }, [dob]);

  const changed = useMemo(() => {
    if (!original) return false;
    const cur = JSON.stringify({ name, email, dob, sex, phones, addresses });
    const base = JSON.stringify({
      name: original.name, email: original.email, dob: original.dob, sex: original.sex,
      phones: original.phones, addresses: original.addresses
    });
    return cur !== base || !!password;
  }, [name, email, dob, sex, phones, addresses, password, original]);

  async function save() {
    setError(undefined);
    try {
      if (!profile?.id) throw new Error("Missing profile id");
      if (!password.trim()) {
        // Your backend requires password in ProfileRequest for updates
        throw new Error("Password is required to save changes.");
      }
      const payload: ProfileRequest = {
        name: name.trim(),
        email: email.trim(),    // frozen in UI, still must send
        dob,
        sex,
        password,               // REQUIRED
        phones: phones.filter(Boolean),
        addresses: addresses.filter(Boolean),
      };
      const updated = await apiUpdateProfile(profile.id, payload);
      setProfile(updated);
      setOriginal(updated);
      setPassword(""); // clear field after successful update
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
  }

  function reset() {
    if (!original) return;
    setName(original.name || "");
    setEmail(original.email || "");
    setDob(original.dob || "");
    setAge(original.age || 0);
    setSex(original.sex || "");
    setPhones(original.phones?.length ? original.phones : [""]);
    setAddresses(original.addresses?.length ? original.addresses : [""]);
    setPassword("");
  }

  if (loading) return <div className="card">Loading…</div>;
  if (error) return (
    <div className="card">
      <div className="alert">{error}</div>
      <div className="toolbar">
        <button onClick={() => router.push("/auth")}>Go to Login</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="card">
        <h2 className="h">My Profile</h2>
        <div className="grid2">
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Email (frozen)</label>
            <input value={email} readOnly />
          </div>
        </div>
        <div className="grid2" style={{ marginTop: 12 }}>
          <div>
            <label>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div>
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} />
          </div>
        </div>
        <div className="grid2" style={{ marginTop: 12 }}>
          <div>
            <label>Sex</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label>Password (required to save)</label>
            <input
              type="password"
              value={password}
              placeholder="Enter your password to save changes"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DynamicList label="Phone Numbers" values={phones} onChange={setPhones} placeholder="+91-XXXXXXXXXX" />
      <DynamicList label="Addresses" values={addresses} onChange={setAddresses} placeholder="House, Street, City, State, PIN" />

      <div className="card">
        <div className="toolbar">
          <button onClick={save} disabled={!changed}>Save Changes</button>
          <button className="ghost" onClick={reset} disabled={!changed}>Reset to Original</button>
          <button className="danger" onClick={() => { clearSession(); location.href = "/auth"; }}>Logout</button>
        </div>
        <p className="small">Email is frozen. Your backend requires entering a password to update.</p>
      </div>

      <div className="card">
        <h3 className="h">Original Data (Read-only)</h3>
        <div className="row">
          <div className="col"><label>Name</label><input readOnly value={original?.name || ""} /></div>
          <div className="col"><label>Email</label><input readOnly value={original?.email || ""} /></div>
        </div>
        <div className="row">
          <div className="col"><label>DOB</label><input readOnly value={original?.dob || ""} /></div>
          <div className="col"><label>Age</label><input readOnly value={original?.age ?? 0} /></div>
        </div>
        <div className="row">
          <div className="col"><label>Sex</label><input readOnly value={original?.sex || ""} /></div>
        </div>
        <div className="row">
          <div className="col"><label>Phones</label><textarea readOnly value={(original?.phones || []).join("\n")} rows={3} /></div>
          <div className="col"><label>Addresses</label><textarea readOnly value={(original?.addresses || []).join("\n")} rows={3} /></div>
        </div>
      </div>
    </>
  );
}
