// pages/auth.tsx
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { apiLogin, apiRegisterProfile } from "../lib/api";
import { DynamicList } from "../components/DynamicList";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-specific fields (required by your backend)
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [sex, setSex] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [addresses, setAddresses] = useState<string[]>([""]);

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      if (mode === "register") {
        // Build ProfileRequest
        await apiRegisterProfile({
          name: name.trim(),
          email: email.trim(),
          dob,
          sex,
          password,
          phones: phones.filter(Boolean),
          addresses: addresses.filter(Boolean),
        });
        // registration sets session; go to profile
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
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="col">
                <label>Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} required>
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
                <label>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
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
            <DynamicList label="Phone Numbers" values={phones} onChange={setPhones} placeholder="+91-XXXXXXXXXX" />
            <DynamicList label="Addresses" values={addresses} onChange={setAddresses} placeholder="House, Street, City, State, PIN" />
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
