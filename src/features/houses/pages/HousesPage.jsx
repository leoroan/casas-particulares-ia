import { useState } from 'react';
export default function MinHouse() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>x</button>
      {show && <div>hi</div>}
    </div>
  );
}
