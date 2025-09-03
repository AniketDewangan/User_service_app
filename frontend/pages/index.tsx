/* =============================
 * /pages/index.tsx — simple redirect to /auth
 * ============================= */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function Home(){
  const r = useRouter();
  useEffect(()=>{ r.replace('/auth'); },[r]);
  return null;
}
