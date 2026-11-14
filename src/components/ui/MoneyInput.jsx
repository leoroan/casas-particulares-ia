import { useState } from 'react';
import { moneyRaw } from '../../lib/format.js';

export default function MoneyInput({ value, onChange, className = '', placeholder = '0' }) {
  const [raw, setRaw] = useState(value != null ? String(value) : '');
  function format(n) {
    return n.replace(/[^0-9,]/g, '').replace(',', '.');
  }
  function handleChange(e) {
    const v = format(e.target.value);
    setRaw(v);
    onChange(v === '' ? '' : Number(v));
  }
  const show = raw !== '' ? moneyRaw(raw) : placeholder;
  return (
    <input
      type="text"
      className={`form-control ${className}`}
      value={show}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}