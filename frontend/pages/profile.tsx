// pages/profile.tsx
import { useEffect, useMemo, useState } from "react";
import {
  apiGetProfileById,
  apiUpdateProfile,
  getSession,
  clearSession,
  ProfileUpdatePayload,
  ProfileResponse,
} from "../lib/api";
import { useRouter } from "next/router";
import { DynamicList } from "../components/DynamicList";
import AddressList from "../components/AddressList";
import { AddressItem, decodeAddress, encodeAddress, validateAddressItems } from "../lib/addressCodec";
import { fromApiDate, toApiDate, toDisplayDate } from "../lib/date";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [original, setOriginal] = useState<ProfileResponse | null>(null);

  // Editable state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // read-only
  const [dob, setDob] = useState("");     // UI value: yyyy-MM-dd
  const [age, setAge] = useState<number>(0);
  const [sex, setSex] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [addressItems, setAddressItems] = useState<AddressItem[]>([{ address: "", pincode: "" }]);

  // backend requires password on update
  const [password, setPassword] = useState("");

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
        setDob(fromApiDate(p.dob));  // <-- coerce to yyyy-MM-dd for input
        setAge(p.age || 0);
        setSex(p.sex || "");
        setPhones(p.phones?.length ? p.phones : [""]);

        const decoded: AddressItem[] = (p.addresses?.length ? p.addresses : [""]).map((s) => decodeAddress(s));
        setAddressItems(decoded.length ? decoded : [{ address: "", pincode: "" }]);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!dob) return;
    // derive age from dob (yyyy-MM-dd)
    const parts = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) return;
    const y = +parts[1], m = +parts[2], d = +parts[3];
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return;
    const now = new Date();
    let a = now.getFullYear() - dt.getFullYear();
    const mm = now.getMonth() - dt.getMonth();
    if (mm < 0 || (mm === 0 && now.getDate() < dt.getDate())) a--;
    setAge(a);
  }, [dob]);

  const prettyOriginalAddresses = useMemo(() => {
    const arr = original?.addresses ?? [];
    return arr.map((s) => {
      const { address, pincode } = decodeAddress(s);
      return pincode ? `${address}, ${pincode}` : address;
    }).join("\n");
  }, [original]);

  const changed = useMemo(() => {
    if (!original) return false;
    const current = JSON.stringify({
      name,
      email,
      dob: toApiDate(dob), // compare as API format
      sex,
      phones,
      addresses: addressItems.map(encodeAddress).filter(Boolean),
    });
    const baseline = JSON.stringify({
      name: original.name,
      email: original.email,
      dob: toApiDate(original.dob),
      sex: original.sex,
      phones: original.phones,
      addresses: original.addresses,
    });
    return current !== baseline || !!password;
  }, [name, email, dob, sex, phones, addressItems, password, original]);

  async function save() {
    setError(undefined);
    try {
      if (!profile?.id) throw new Error("Missing profile id");
      if (!password.trim()) throw new Error("Password is required to save changes.");
      if (!validateAddressItems(addressItems)) {
        throw new Error("Pincode must be 6 digits for every entered address.");
      }

      const mergedAddresses = addressItems.map(encodeAddress).filter(Boolean);
      const payload: ProfileUpdatePayload = {
        email: email.trim(),            // frozen; backend expects it
        password,                       // REQUIRED on update
        name: name.trim() || undefined,
        dob: toApiDate(dob),            // <-- send API format yyyy-MM-dd (or undefined)
        sex: sex || undefined,
        phones: phones.filter(Boolean) || undefined,
        addresses: mergedAddresses.length ? mergedAddresses : undefined,
      };

      const updated = await apiUpdateProfile(profile.id, payload);
      setProfile(updated);
      setOriginal(updated);
      setPassword("");

      const decoded = (updated.addresses || []).map((s) => decodeAddress(s));
      setAddressItems(decoded.length ? decoded : [{ address: "", pincode: "" }]);
      setDob(fromApiDate(updated.dob)); // keep input normalized
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
  }

  function reset() {
    if (!original) return;
    setName(original.name || "");
    setEmail(original.email || "");
    setDob(fromApiDate(original.dob));
    setAge(original.age || 0);
    setSex(original.sex || "");
    setPhones(original.phones?.length ? original.phones : [""]);
    const decoded = (original.addresses?.length ? original.addresses : [""]).map((s) => decodeAddress(s));
    setAddressItems(decoded.length ? decoded : [{ address: "", pincode: "" }]);
    setPassword("");
  }

  if (loading) return <div className="card">Loading…</div>;
  if (error)
    return (
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
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 0)}
            />
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
      <AddressList items={addressItems} onChange={setAddressItems} />

      <div className="card">
        <div className="toolbar">
          <button onClick={save} disabled={!changed}>Save Changes</button>
          <button className="ghost" onClick={reset} disabled={!changed}>Reset to Original</button>
          <button className="danger" onClick={() => { clearSession(); location.href = "/auth"; }}>Logout</button>
        </div>
        <p className="small">
          Email is frozen. Password is required to update. Each entered address must have a 6-digit pincode.
        </p>
      </div>

      <div className="card">
        <h3 className="h">Original Data (Read-only)</h3>
        <div className="row">
          <div className="col"><label>Name</label><input readOnly value={original?.name || ""} /></div>
          <div className="col"><label>Email</label><input readOnly value={original?.email || ""} /></div>
        </div>
        <div className="row">
          <div className="col"><label>DOB</label><input readOnly value={toDisplayDate(original?.dob)} /></div>
          <div className="col"><label>Age</label><input readOnly value={original?.age ?? 0} /></div>
        </div>
        <div className="row">
          <div className="col"><label>Sex</label><input readOnly value={original?.sex || ""} /></div>
        </div>
        <div className="row">
          <div className="col"><label>Phones</label><textarea readOnly value={(original?.phones || []).join("\n")} rows={3} /></div>
          <div className="col"><label>Addresses</label><textarea readOnly value={
            (original?.addresses ?? []).map((s)=>{ const {address,pincode}=decodeAddress(s); return pincode?`${address}, ${pincode}`:address; }).join("\n")
          } rows={3} /></div>
        </div>
      </div>
    </>
  );
}
