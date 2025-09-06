// lib/addressCodec.ts
export const ADR_PIN_DELIM = "<|PIN|>";
export type AddressItem = { address: string; pincode: string };

// Merge into "ADDRESS<|PIN|>PINCODE" (strip trailing 6-digit pin if user typed it in address)
export function encodeAddress(row: AddressItem): string {
  const addr = (row.address ?? "").replace(/[,\s-]*\d{6}\s*$/, "").trim();
  const pin = (row.pincode ?? "").trim();
  return addr ? `${addr}${ADR_PIN_DELIM}${pin}` : "";
}

// Split back to { address, pincode }; support legacy strings with trailing pin
export function decodeAddress(s: string): AddressItem {
  if (!s) return { address: "", pincode: "" };
  const idx = s.lastIndexOf(ADR_PIN_DELIM);
  if (idx !== -1) {
    return {
      address: s.slice(0, idx).trim().replace(/[,\s]+$/, ""),
      pincode: s.slice(idx + ADR_PIN_DELIM.length).trim(),
    };
  }
  const m = s.match(/(\d{6})(?!.*\d)/);
  const pin = m ? m[1] : "";
  const addr = m ? s.replace(/[,\s-]*\d{6}\s*$/, "").trim() : s.trim();
  return { address: addr, pincode: pin };
}

// If an address is provided, require a 6-digit pincode
export function validateAddressItems(items: AddressItem[]) {
  for (const it of items) {
    if (it.address.trim() && !/^\d{6}$/.test(it.pincode.trim())) return false;
  }
  return true;
}
