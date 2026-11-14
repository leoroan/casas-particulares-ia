import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adapter } from '../../../lib/storageAdapter.js';
import { money, dateES, periodLabel } from '../../../lib/format.js';

export default function SettlementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState(null);
  const [lines, setLines] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [houses, setHouses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, l, e, h, p] = await Promise.all([
          adapter.getSettlements(),
          adapter.getSettlementLines(id),
          adapter.getEmployees(),
          adapter.getHouses(),
          adapter.getProfile()
        ]);
        if (mounted) {
          const sData = s.data || [];
          const sett = sData.find((x) => x.id === id);
          setSettlement(sett);
          setLines(l.data || []);
          const empData = e.data || [];
          setEmployee(empData.find((x) => x.id === sett.employee_id));
          setHouses(h.data || []);
          setProfile(p.data || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="text-center py-5">Cargando liquidación...</div>;
  if (!settlement) return <div className="text-center text-danger py-5">Liquidación no encontrada.</div>;

  const bd = settlement.breakdown || {};
  const houseMap = Object.fromEntries((houses || []).map((h) => [h.id, h.alias]));
  function printRecibo() {
    const win = window.open('', '', 'width=800');
    const emp = employee || {};
    const prof = profile || {};
    const html = `
      <html><head><style>
        body{font-family:sans-serif;font-size:13px;color:#111;padding:20px;}
        .header{display:flex;justify-content:space-between;border-bottom:2px solid #6c5ce7;padding-bottom:10px;margin-bottom:20px;}
        .empresa{font-weight:bold;font-size:16px;}
        .titulo{text-align:center;font-size:18px;font-weight:bold;margin:20px 0;}
        table{width:100%;border-collapse:collapse;margin-bottom:15px;}
        th,td{border:1px solid #ccc;padding:5px 8px;text-align:left;}
        th{background:#f4f4f4;}
        .text-end{text-align:right;}
        .fw-bold{font-weight:bold;}
        .no-print{border-top:1px solid #ccc;margin-top:20px;padding-top:10px;text-align:center;}
        @media print{.no-print{display:none;}}
      </style></head><body>
        <div class="header">
          <div>
            <div class="empresa">${prof.nombre || 'Empleador'}</div>
            <div>${prof.domicilio || ''} | CUIT: ${prof.cuit || ''}</div>
          </div>
          <div class="text-end">
            <div>Recibo de sueldos</div>
            <div>Período: ${periodLabel(settlement.periodo)}</div>
          </div>
        </div>
        <div class="titulo">Recibo de Haberes - ${emp.nombre || ''}</div>
        <table>
          <tr><th>CUIL</th><td>${emp.cuil || ''}</td><th>Fecha ingreso</th><td>${dateES(emp.fecha_ingreso)}</td></tr>
          <tr><th>Domicilio</th><td colspan="3">${prof.domicilio || ''}</td></tr>
        </table>
        <table>
          <tr><th>Concepto</th><th class="text-end">Importe</th></tr>
          <tr><td>Básico</td><td class="text-end">${money(bd.basico || 0)}</td></tr>
          ${(bd.viaticos || 0) > 0 ? `<tr><td>Viáticos</td><td class="text-end">${money(bd.viaticos)}</td></tr>` : ''}
          ${(bd.feriado || 0) > 0 ? `<tr><td>Feriado trabajado</td><td class="text-end">${money(bd.feriado)}</td></tr>` : ''}
          ${(bd.extras || 0) > 0 ? `<tr><td>Horas extras</td><td class="text-end">${money(bd.extras)}</td></tr>` : ''}
          ${(bd.antiguedad?.monto || 0) > 0 ? `<tr><td>Antigüedad</td><td class="text-end">${money(bd.antiguedad.monto)}</td></tr>` : ''}
          ${(bd.zona || 0) > 0 ? `<tr><td>Zona desfavorable</td><td class="text-end">${money(bd.zona)}</td></tr>` : ''}
          <tr class="fw-bold"><td>Bruto</td><td class="text-end">${money(bd.bruto || 0)}</td></tr>
          <tr><td>Aportes (descuento)</td><td class="text-end">- ${money(bd.aportes || 0)}</td></tr>
          <tr class="fw-bold"><td>Neto a cobrar</td><td class="text-end">${money(bd.neto || 0)}</td></tr>
        </table>
        <div class="no-print"><button onclick="window.print()">Imprimir recibo</button></div>
        <div style="margin-top:40px;border-top:1px solid #333;padding-top:10px;">
          <div style="display:flex;justify-content:space-between;">
            <div style="border-bottom:1px solid #333;width:45%;padding-bottom:5px;">Firma empleada</div>
            <div style="border-bottom:1px solid #333;width:45%;padding-bottom:5px;">Firma empleador</div>
          </div>
        </div>
      </body></html>
    `;
    win.document.write(html);
    win.document.close();
  }

  function exportCSV() {
    const rows = [
      ['Concepto', 'Importe'],
      ['Básico', bd.basico || 0],
      ['Viáticos', bd.viaticos || 0],
      ['Feriado trabajado', bd.feriado || 0],
      ['Horas extras', bd.extras || 0],
      ['Antigüedad', bd.antiguedad?.monto || 0],
      ['Zona desfavorable', bd.zona || 0],
      ['Bruto', bd.bruto || 0],
      ['Aportes', - (bd.aportes || 0)],
      ['Neto', bd.neto || 0]
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidacion-${settlement.periodo}-${(employee && employee.nombre) || 'emp'}.csv`;
    a.click();
  }
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h2>Liquidación {settlement.periodo.slice(0, 7)}</h2>
          <div className="text-muted">{employee ? employee.nombre : ''}</div>
        </div>
        <div className="d-flex gap-2">
          <span className={`badge ${settlement.estado === 'cerrada' ? 'bg-success' : 'bg-warning text-dark'}`}>
            {settlement.estado === 'cerrada' ? 'Cerrada' : 'Borrador'}
          </span>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/historial')}>Volver al historial</button>
          <button className="btn btn-cp" onClick={printRecibo}>Imprimir recibo</button>
          <button className="btn btn-outline-primary" onClick={exportCSV}>Exportar CSV</button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4"><div className="card"><div className="card-body">
          <div className="text-muted small">Bruto</div><div className="fw-bold fs-4">{money(bd.bruto || 0)}</div>
        </div></div></div>
        <div className="col-md-4"><div className="card"><div className="card-body">
          <div className="text-muted small">Aportes (descuento)</div><div className="fw-bold fs-4">- {money(bd.aportes || 0)}</div>
        </div></div></div>
        <div className="col-md-4"><div className="card"><div className="card-body">
          <div className="text-muted small">Neto a pagar</div><div className="fw-bold fs-4 text-success">{money(bd.neto || 0)}</div>
        </div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h6 className="mb-0">Desglose por casa</h6></div>
        <div className="card-body">
          {(lines || []).length > 0 ? (
            <table className="table table-sm border-0">
              <thead><tr><th>Casa</th><th>Horas</th><th>Básico</th><th>Viáticos</th><th>Feriado</th><th className="text-end">Subtotal</th></tr></thead>
              <tbody>
                {(lines || []).map((ln) => (
                  <tr key={ln.id}>
                    <td>{houseMap[ln.house_id] || ln.house_id}</td>
                    <td>{ln.breakdown?.horas ?? 0}</td>
                    <td>{money(ln.breakdown?.basico ?? 0)}</td>
                    <td>{money(ln.breakdown?.viaticos ?? 0)}</td>
                    <td>{money(ln.breakdown?.feriado ?? 0)}</td>
                    <td className="text-end">{money(ln.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted py-3">Sin líneas de casa detalladas.</div>
          )}
        </div>
      </div>

      <div className="mt-3 card">
        <div className="card-body">
          <h6 className="mb-2">Detalle del cálculo (breakdown)</h6>
          <pre className="bg-light p-2 rounded small">{JSON.stringify(bd, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}