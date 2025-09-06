/* =============================
 * /pages/_app.tsx
 * ============================= */
import type { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <nav className="nav">
        <div className="brand"><Link href="/">User Service</Link></div>
        <div>
          <Link href="/auth">Login / Register</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </nav>
      <div className="container">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
