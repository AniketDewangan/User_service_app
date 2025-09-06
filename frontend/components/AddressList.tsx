// components/AddressList.tsx
import { useState } from "react";
import type { AddressItem } from "../lib/addressCodec";

type Props = {
  items: AddressItem[];
  onChange: (items: AddressItem[]) => void;
};

export default function AddressList({ items, onChange }: Props) {
  const [rows, setRows] = useState<AddressItem[]>(
    items.length ? items : [{ address: "", pincode: "" }]
  );

  function set(idx: number, patch: Partial<AddressItem>) {
    const next = rows.slice();
    next[idx] = { ...next[idx], ...patch };
    setRows(next);
    onChange(next);
  }

  function add() {
    const next = [...rows, { address: "", pincode: "" }];
    setRows(next);
    onChange(next);
  }

  function remove(idx: number) {
    const next = rows.filter((_, i) => i !== idx);
    const normalized = next.length ? next : [{ address: "", pincode: "" }];
    setRows(normalized);
    onChange(normalized);
  }

  return (
    <div className="card">
      <h3 className="h">Addresses</h3>
      {rows.map((row, idx) => (
        <div className="row" key={idx} style={{ marginBottom: 8 }}>
          <div className="col">
            <label>Address</label>
            <input
              value={row.address}
              placeholder="House, Street, City, State"
              onChange={(e) => set(idx, { address: e.target.value })}
            />
          </div>
          <div className="col" style={{ maxWidth: 240 }}>
            <label>Pincode (6 digits)</label>
            <input
              value={row.pincode}
              maxLength={6}
              placeholder="560001"
              onChange={(e) => set(idx, { pincode: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div className="col" style={{ flex: "0 0 auto", alignSelf: "end" }}>
            <button type="button" className="ghost" onClick={() => remove(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="toolbar">
        <button type="button" onClick={add}>+ Add Address</button>
        <span className="small">Pincode is required when an address is filled.</span>
      </div>
    </div>
  );
}
