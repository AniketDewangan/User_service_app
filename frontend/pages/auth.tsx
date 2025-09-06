// pages/auth.tsx
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { apiLogin, apiRegisterProfile } from "../lib/api";
import { DynamicList } from "../components/DynamicList";
import AddressList from "../components/AddressList";
import { AddressItem, encodeAddress, validateAddressItems } from "../lib/addressCodec";
import { toApiDate } from "../lib/date";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Always required
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Optional on register
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // UI uses yyyy-MM-dd
  const [sex, setSex] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [addressItems, setAddressItems] = useState<AddressItem[]>([{ address: "", pincode: "" }]);

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      if (mode === "register") {
        // If address provided, require 6-digit PIN
        if (!validateAddressItems(addressItems)) {
          throw new Error("Pincode must be 6 digits for every entered address.");
        }

        // Build payload: only include optional fields if present
        const payload: any = {
          email: email.trim(),
          password,
        };
        if (name.trim()) payload.name = name.trim();
        const dobApi = toApiDate(dob);
        if (dobApi) payload.dob = dobApi;
        if (sex) payload.sex = sex;

        const ph = phones.filter(Boolean);
        if (ph.length) payload.phones = ph;

        const mergedAddresses = addressItems.map(encodeAddress).filter(Boolean);
        if (mergedAddresses.length) payload.addresses = mergedAddresses;

        await apiRegisterProfile(payload);
        router.push("/profile");
      } else {
        await apiLogin({ email: email.trim(), password });
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="toolbar">
        <button type="button" className={mode === "login" ? "" : "ghost"} onClick={() => setMode("login")}>
          Login
        </button>
        <button type="button" className={mode === "register" ? "" : "ghost"} onClick={() => setMode("register")}>
          Register
        </button>
      </div>
      <div className="hr" />
      <form onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <div className="row">
              <div className="col">
                <label>Name (optional)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="col">
                <label>Sex (optional)</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Date of Birth (optional)</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>
          </>
        )}

        <div className="row">
          <div className="col">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="col">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
        </div>

        {mode === "register" && (
          <>
            <DynamicList label="Phone Numbers (optional)" values={phones} onChange={setPhones} placeholder="+91-XXXXXXXXXX" />
            <AddressList items={addressItems} onChange={setAddressItems} />
          </>
        )}

        {error && <div className="alert">{error}</div>}
        <div className="toolbar">
          <button type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "register" ? "Create account" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
