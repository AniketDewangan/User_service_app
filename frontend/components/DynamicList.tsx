// components/DynamicList.tsx
import { useState } from "react";

type Props = {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
};

export function DynamicList({ label, values, onChange, placeholder }: Props) {
  const [items, setItems] = useState<string[]>(values.length ? values : [""]);

  function set(idx: number, val: string) {
    const next = items.slice();
    next[idx] = val;
    setItems(next);
    onChange(next);
  }
  function add() {
    const next = [...items, ""];
    setItems(next);
    onChange(next);
  }
  function remove(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    const normalized = next.length ? next : [""];
    setItems(normalized);
    onChange(normalized);
  }

  return (
    <div className="card">
      <h3 className="h">{label}</h3>
      {items.map((val, idx) => (
        <div className="listItem" key={idx}>
          <input value={val} placeholder={placeholder} onChange={(e) => set(idx, e.target.value)} />
          <button className="ghost" type="button" onClick={() => remove(idx)}>Remove</button>
        </div>
      ))}
      <div className="toolbar">
        <button type="button" onClick={add}>+ Add</button>
        <span className="small">You can add multiple.</span>
      </div>
    </div>
  );
}
