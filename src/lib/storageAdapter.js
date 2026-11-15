import { supabase, hasSupabaseConfig } from './supabaseClient.js';
import { DEMO_USER, CONFIG } from '../config.js';

const PREFIX = 'cp_';
const DEMO_ID = DEMO_USER.id;

function key(table, userId) {
  return `${PREFIX}${table}:${userId || DEMO_ID}`;
}

function read(table, userId) {
  try {
    const raw = localStorage.getItem(key(table, userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(table, data, userId) {
  localStorage.setItem(key(table, userId), JSON.stringify(data));
}

function nextId() {
  return 'demo-' + crypto.randomUUID();
}

function nowISO() {
  return new Date().toISOString();
}

function seed(userId) {
  const tables = ['profiles', 'houses', 'employees', 'assignments', 'salary_scales', 'contribution_rates', 'holidays', 'settlements', 'settlement_lines', 'leaves', 'settings'];
  const empty = tables.every((t) => !read(t, userId));
  if (!empty) return;

  const u = userId;
  write('profiles', [
    { id: u, nombre: DEMO_USER.nombre, cuit: '20-12345678-9', domicilio: 'Calle Falsa 123, CABA', created_at: nowISO(), updated_at: nowISO() }
  ], u);

  write('houses', [
    { id: 'demo-house-1', user_id: u, alias: 'Casa particular', direccion: 'Calle Falsa 123, CABA', notas: 'Vivienda del empleador', created_at: nowISO(), updated_at: nowISO() }
  ], u);

  const houseId = 'demo-house-1';

  const tatianaId = 'demo-emp-tatiana';
  const jesicaId = 'demo-emp-jesica';
  const gracielaId = 'demo-emp-graciela';

  write('employees', [
    {
      id: tatianaId, user_id: u, nombre: 'Tatiana', cuil: '27-12345678-1', fecha_ingreso: '2024-01-15', activo: true,
      zona_desfavorable: false, notas: 'Tareas generales, con retiro.', created_at: nowISO(), updated_at: nowISO()
    },
    {
      id: jesicaId, user_id: u, nombre: 'Jesica', cuil: '27-23456789-2', fecha_ingreso: '2024-03-01', activo: true,
      zona_desfavorable: false, notas: 'Tareas generales, con retiro.', created_at: nowISO(), updated_at: nowISO()
    },
    {
      id: gracielaId, user_id: u, nombre: 'Graciela', cuil: '27-34567890-3', fecha_ingreso: '2022-06-10', activo: true,
      zona_desfavorable: false, notas: 'Asistencia y cuidado de personas.', created_at: nowISO(), updated_at: nowISO()
    }
  ], u);

  write('assignments', [
    {
      id: 'demo-ass-tatiana', user_id: u, employee_id: tatianaId, house_id: houseId,
      dias_semana: [1, 2, 3, 4, 5, 6], horas_dia: 3, categoria: 'Personal para tareas generales', con_retiro: true,
      valor_hora_override: 6000, valor_mensual_override: null, viatico_habilitado: true, valor_viaje: 1489, viajes_por_dia: 2,
      modalidad_override: null, created_at: nowISO(), updated_at: nowISO()
    },
    {
      id: 'demo-ass-jesica', user_id: u, employee_id: jesicaId, house_id: houseId,
      dias_semana: [1, 2, 4, 5], horas_dia: 3, categoria: 'Personal para tareas generales', con_retiro: true,
      valor_hora_override: 4500, valor_mensual_override: null, viatico_habilitado: true, valor_viaje: 1486, viajes_por_dia: 2,
      modalidad_override: null, created_at: nowISO(), updated_at: nowISO()
    },
    {
      id: 'demo-ass-graciela', user_id: u, employee_id: gracielaId, house_id: houseId,
      dias_semana: [1, 2, 3, 4, 5], horas_dia: 6, categoria: 'Asistencia y cuidado de personas', con_retiro: true,
      valor_hora_override: null, valor_mensual_override: 264000, viatico_habilitado: false, valor_viaje: 0, viajes_por_dia: 2,
      modalidad_override: null, created_at: nowISO(), updated_at: nowISO()
    }
  ], u);
  write('salary_scales', CONFIG.salaryScales.map((s) => ({
    id: 'demo-scale-' + crypto.randomUUID(), user_id: u, ...s, created_at: nowISO(), updated_at: nowISO()
  })), u);

  write('contribution_rates', CONFIG.contributionRates.map((r) => ({
    id: 'demo-rate-' + crypto.randomUUID(), user_id: u, ...r, created_at: nowISO(), updated_at: nowISO()
  })), u);

  write('holidays', CONFIG.holidays.map((h) => ({
    id: 'demo-hol-' + h.fecha.replaceAll('-', ''), user_id: u, ...h, created_at: nowISO()
  })), u);

  // Liquidacion cerrada de referencia: Tatiana, agosto/2025 (el "cuentito" del Excel)
  const inputs = { diasTrabajados: 26, feriadoTrabajado: { '2025-08-17': true } };
  const breakdown = {
    employeeId: tatianaId, employeeNombre: 'Tatiana', periodo: '2025-08-01',
    modality: 'por_hora', hoursWeek: 18, totalHours: 78, valorHora: 6000,
    basico: 468000, viaticos: 77428, feriado: 18000, extras50: 0, extras100: 0, extras: 0,
    antiguedad: { anios: 0, monto: 0 }, zona: 0, ajuste: 0,
    bruto: 563428, aportes: 9400, contribuciones: 4700, art: 1000, neto: 554028,
    lines: [{ houseId, horas: 78, basico: 468000, viaticos: 77428, feriado: 18000, subtotal: 563428 }]
  };
  const settlementId = 'demo-sett-tatiana-2025-08';

  write('settlements', [
    {
      id: settlementId, user_id: u, employee_id: tatianaId, periodo: '2025-08-01', estado: 'cerrada',
      inputs, breakdown, total: 563428, neto: 554028, cerrada_at: nowISO(),
      created_at: nowISO(), updated_at: nowISO()
    }
  ], u);
  write('settlement_lines', [
    { id: 'demo-line-tatiana-2025-08', settlement_id: settlementId, house_id: houseId,
      breakdown: { horas: 78, basico: 468000, viaticos: 77428, feriado: 18000 }, subtotal: 563428 }
  ], u);

  write('settings', [
    { id: 'demo-settings', user_id: u, datos: { divisorProporcional: 48, porcentajeAntiguedad: 1, porcentajeZona: 30 }, created_at: nowISO(), updated_at: nowISO() }
  ], u);
}

// ---------- adaptador localStorage ----------
function localStorageAdapter() {
  const userId = DEMO_ID;

  function ensure() {
    seed(userId);
  }

  return {
    // auth simulada
    async signUp() { return { data: { user: DEMO_USER }, error: null }; },
    async signIn() { return { data: { user: DEMO_USER, session: { access_token: 'demo', refresh_token: 'demo', user: DEMO_USER, expires_at: 9999999999 } }, error: null }; },
    async signOut() { localStorage.removeItem(key('session', userId)); return { error: null }; },
    async getSession() {
      ensure();
      return { data: { session: { access_token: 'demo', refresh_token: 'demo', user: DEMO_USER, expires_at: 9999999999 } }, error: null };
    },
    onAuthStateChange() { return { data: { subscription: { unsubscribe: () => {} } } }; },

    // profile
    async getProfile() { ensure(); const p = read('profiles', userId); return { data: p[0] || null, error: null }; },
    async saveProfile(profile) {
      ensure();
      const ps = read('profiles', userId);
      const rec = { ...profile, id: profile.id || userId, user_id: userId, updated_at: nowISO() };
      const i = ps.findIndex((x) => x.id === rec.id);
      if (i >= 0) ps[i] = rec; else ps.push(rec);
      write('profiles', ps, userId);
      return { data: rec, error: null };
    },

    // houses
    async getHouses() { ensure(); return { data: read('houses', userId), error: null }; },
    async saveHouse(house) {
      ensure(); const hs = read('houses', userId);
      const rec = { ...house, id: house.id || nextId(), user_id: userId, updated_at: nowISO() };
      const i = hs.findIndex((x) => x.id === rec.id);
      if (i >= 0) hs[i] = rec; else hs.push(rec);
      write('houses', hs, userId);
      return { data: rec, error: null };
    },
    async deleteHouse(id) {
      ensure(); const hs = read('houses', userId).filter((x) => x.id !== id);
      write('houses', hs, userId); return { error: null };
    },

    // employees
    async getEmployees() { ensure(); return { data: read('employees', userId), error: null }; },
    async saveEmployee(employee) {
      ensure(); const es = read('employees', userId);
      const rec = { ...employee, id: employee.id || nextId(), user_id: userId, updated_at: nowISO() };
      const i = es.findIndex((x) => x.id === rec.id);
      if (i >= 0) es[i] = rec; else es.push(rec);
      write('employees', es, userId);
      return { data: rec, error: null };
    },
    async deleteEmployee(id) {
      ensure(); let es = read('employees', userId).filter((x) => x.id !== id);
      write('employees', es, userId);
      let as = read('assignments', userId).filter((x) => x.employee_id !== id);
      write('assignments', as, userId);
      let ls = read('leaves', userId).filter((x) => x.employee_id !== id);
      write('leaves', ls, userId);
      return { error: null };
    },
    // assignments
    async getAssignments() { ensure(); return { data: read('assignments', userId), error: null }; },
    async saveAssignment(assignment) {
      ensure(); const as = read('assignments', userId);
      const rec = { ...assignment, id: assignment.id || nextId(), user_id: userId, updated_at: nowISO() };
      const i = as.findIndex((x) => x.id === rec.id);
      if (i >= 0) as[i] = rec; else as.push(rec);
      write('assignments', as, userId);
      return { data: rec, error: null };
    },
    async deleteAssignment(id) {
      ensure(); const as = read('assignments', userId).filter((x) => x.id !== id);
      write('assignments', as, userId); return { error: null };
    },

    // salary scales
    async getSalaryScales() { ensure(); return { data: read('salary_scales', userId), error: null }; },
    async saveSalaryScale(scale) {
      ensure(); const ss = read('salary_scales', userId);
      const rec = { ...scale, id: scale.id || nextId(), user_id: userId, created_at: recCreated(scale, ss), updated_at: nowISO() };
      const i = ss.findIndex((x) =>
        x.user_id === u && x.vigencia_desde === rec.vigencia_desde && x.categoria === rec.categoria && x.con_retiro === rec.con_retiro
      );
      if (i >= 0) ss[i] = rec; else ss.push(rec);
      write('salary_scales', ss, userId);
      return { data: rec, error: null };
    },
    async deleteSalaryScale(id) {
      ensure(); const ss = read('salary_scales', userId).filter((x) => x.id !== id);
      write('salary_scales', ss, userId); return { error: null };
    },

    // contribution rates
    async getContributionRates() { ensure(); return { data: read('contribution_rates', userId), error: null }; },
    async saveContributionRate(rate) {
      ensure(); const rs = read('contribution_rates', userId);
      const rec = { ...rate, id: rate.id || nextId(), user_id: userId, created_at: recCreated(rate, rs), updated_at: nowISO() };
      const i = rs.findIndex((x) =>
        x.user_id === u && x.vigencia_desde === rec.vigencia_desde && x.tramo === rec.tramo
      );
      if (i >= 0) rs[i] = rec; else rs.push(rec);
      write('contribution_rates', rs, userId);
      return { data: rec, error: null };
    },
    async deleteContributionRate(id) {
      ensure(); const rs = read('contribution_rates', userId).filter((x) => x.id !== id);
      write('contribution_rates', rs, userId); return { error: null };
    },
    // holidays
    async getHolidays() { ensure(); return { data: read('holidays', userId), error: null }; },
    async saveHoliday(holiday) {
      ensure(); const hs2 = read('holidays', userId);
      const rec = { ...holiday, id: holiday.id || nextId(), user_id: userId, created_at: nowISO() };
      hs2.push(rec);
      write('holidays', hs2, userId);
      return { data: rec, error: null };
    },
    async deleteHoliday(id) {
      ensure(); const hs2 = read('holidays', userId).filter((x) => x.id !== id);
      write('holidays', hs2, userId); return { error: null };
    },

    // settlements
    async getSettlements() { ensure(); return { data: read('settlements', userId).sort((a, b) => (b.periodo || '').localeCompare(a.periodo || '')), error: null }; },
    async saveSettlement(settlement) {
      ensure(); const ss2 = read('settlements', userId);
      const rec = { ...settlement, id: settlement.id || nextId(), user_id: userId, updated_at: nowISO() };
      if (rec.estado === 'cerrada' && !rec.cerrada_at) rec.cerrada_at = nowISO();
      const i = ss2.findIndex((x) => x.employee_id === rec.employee_id && x.periodo === rec.periodo);
      if (i >= 0) ss2[i] = rec; else ss2.push(rec);
      write('settlements', ss2, userId);
      return { data: rec, error: null };
    },
    async deleteSettlement(id) {
      ensure(); let ss2 = read('settlements', userId).filter((x) => x.id !== id);
      write('settlements', ss2, userId);
      let sl = read('settlement_lines', userId).filter((x) => x.settlement_id !== id);
      write('settlement_lines', sl, userId);
      return { error: null };
    },

    // settlement lines
    async getSettlementLines(settlementId) {
      ensure(); return { data: read('settlement_lines', userId).filter((x) => x.settlement_id === settlementId), error: null };
    },
    async saveSettlementLine(line) {
      ensure(); const sl = read('settlement_lines', userId);
      const rec = { ...line, id: line.id || nextId() };
      sl.push(rec);
      write('settlement_lines', sl, userId);
      return { data: rec, error: null };
    },
    async deleteSettlementLine(id) {
      ensure(); const sl = read('settlement_lines', userId).filter((x) => x.id !== id);
      write('settlement_lines', sl, userId); return { error: null };
    },

    // leaves
    async getLeaves() { ensure(); return { data: read('leaves', userId), error: null }; },
    async saveLeave(leave) {
      ensure(); const ls = read('leaves', userId);
      const rec = { ...leave, id: leave.id || nextId(), user_id: userId, created_at: nowISO() };
      ls.push(rec);
      write('leaves', ls, userId);
      return { data: rec, error: null };
    },
    async deleteLeave(id) {
      ensure(); const ls = read('leaves', userId).filter((x) => x.id !== id);
      write('leaves', ls, userId); return { error: null };
    },

    // settings
    async getSettings() { ensure(); const s = read('settings', userId); return { data: s[0] || null, error: null }; },
    async saveSettings(settings) {
      ensure(); const ss3 = read('settings', userId);
      const rec = { ...settings, id: settings.id || nextId(), user_id: userId, updated_at: nowISO() };
      const i = ss3.findIndex((x) => x.id === rec.id || x.user_id === userId);
      if (i >= 0) ss3[i] = rec; else ss3.push(rec);
      write('settings', ss3, userId);
      return { data: rec, error: null };
    },

    // export / import
    async exportData() {
      ensure();
      const tables = ['profiles','houses','employees','assignments','salary_scales','contribution_rates','holidays','settlements','settlement_lines','leaves','settings'];
      const out = {};
      for (const t of tables) out[t] = read(t, userId);
      return { data: out, error: null };
    },
    async importData(json) {
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const tables = Object.keys(data);
        for (const t of tables) {
          const arr = Array.isArray(data[t]) ? data[t] : [];
          const cleaned = arr.map((r) => ({ ...r, user_id: userId }));
          write(t, cleaned, userId);
        }
        return { data: { ok: true }, error: null };
      } catch (e) {
        return { data: null, error: { message: 'JSON invÃ¡lido' } };
      }
    }
  };
}
function recCreated(rec, existing) {
  const found = existing.find((x) =>
    x.vigencia_desde === rec.vigencia_desde && x.categoria === rec.categoria &&
    x.con_retiro === rec.con_retiro && x.user_id === u
  );
  return found ? found.created_at : nowISO();
}
// ---------- adaptador Supabase ----------
function supabaseAdapter() {
  const uid = async () => {
    const { data: { user} } = await supabase.auth.getUser();
    return user?.id || null;
  };

  return {
    async signUp({ email, password }) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    },
    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    },
    onAuthStateChange(cb) {
      const { data } = supabase.auth.onAuthStateChange(cb);
      return data;
    },
    async getProfile() {
      const id = await uid();
      if (!id) return { data: null, error: { message: 'Sin sesiÃ³n' } };
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      return { data, error };
    },
    async saveProfile(profile) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('profiles').upsert({ ...profile, id }, { onConflict: 'id' }).select().single();
      return { data, error };
    },
    async getHouses() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('houses').select('*').eq('user_id', id).order('created_at', { ascending: false });
      return { data, error };
    },
    async saveHouse(house) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('houses').upsert({ ...house, user_id: id }).select().single();
      return { data, error };
    },
    async deleteHouse(id) {
      const { error } = await supabase.from('houses').delete().eq('id', id);
      return { error };
    },
    async getEmployees() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('employees').select('*').eq('user_id', id).order('nombre', { ascending: true });
      return { data, error };
    },
    async saveEmployee(employee) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('employees').upsert({ ...employee, user_id: id }).select().single();
      return { data, error };
    },
    async deleteEmployee(id) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      return { error };
    },
    async getAssignments() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('assignments').select('*').eq('user_id', id);
      return { data, error };
    },
    async saveAssignment(assignment) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('assignments').upsert({ ...assignment, user_id: id }).select().single();
      return { data, error };
    },
    async deleteAssignment(id) {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      return { error };
    },
    async getSalaryScales() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('salary_scales').select('*').eq('user_id', id).order('vigencia_desde', { ascending: false });
      return { data, error };
    },
    async saveSalaryScale(scale) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('salary_scales').upsert({ ...scale, user_id: id }).select().single();
      return { data, error };
    },
    async deleteSalaryScale(id) {
      const { error } = await supabase.from('salary_scales').delete().eq('id', id);
      return { error };
    },
    async getContributionRates() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('contribution_rates').select('*').eq('user_id', id).order('vigencia_desde', { ascending: false });
      return { data, error };
    },
    async saveContributionRate(rate) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('contribution_rates').upsert({ ...rate, user_id: id }).select().single();
      return { data, error };
    },
    async deleteContributionRate(id) {
      const { error } = await supabase.from('contribution_rates').delete().eq('id', id);
      return { error };
    },
    async getHolidays() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('holidays').select('*').eq('user_id', id).order('fecha', { ascending: true });
      return { data, error };
    },
    async saveHoliday(holiday) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('holidays').insert({ ...holiday, user_id: id }).select().single();
      return { data, error };
    },
    async deleteHoliday(id) {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      return { error };
    },
    async getSettlements() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('settlements').select('*').eq('user_id', id).order('periodo', { ascending: false });
      return { data, error };
    },
    async saveSettlement(settlement) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('settlements').upsert(settlement).select().single();
      return { data, error };
    },
    async deleteSettlement(id) {
      const { error } = await supabase.from('settlements').delete().eq('id', id);
      return { error };
    },
    async getSettlementLines(settlementId) {
      const { data, error } = await supabase.from('settlement_lines').select('*').eq('settlement_id', settlementId);
      return { data, error };
    },
    async saveSettlementLine(line) {
      const { data, error } = await supabase.from('settlement_lines').insert(line).select().single();
      return { data, error };
    },
    async deleteSettlementLine(id) {
      const { error } = await supabase.from('settlement_lines').delete().eq('id', id);
      return { error };
    },
    async getLeaves() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('leaves').select('*').eq('user_id', id).order('desde', { ascending: true });
      return { data, error };
    },
    async saveLeave(leave) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('leaves').insert({ ...leave, user_id: id }).select().single();
      return { data, error };
    },
    async deleteLeave(id) {
      const { error } = await supabase.from('leaves').delete().eq('id', id);
      return { error };
    },
    async getSettings() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('settings').select('*').eq('user_id', id).maybeSingle();
      return { data, error };
    },
    async saveSettings(settings) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const { data, error } = await supabase.from('settings').upsert({ ...settings, user_id: id }).select().single();
      return { data, error };
    },
    async exportData() {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      const tables = ['profiles','houses','employees','assignments','salary_scales','contribution_rates','holidays','settlements','settlement_lines','leaves','settings'];
      const out = {};
      for (const t of tables) {
        const { data } = await supabase.from(t).select('*').eq('user_id', id);
        out[t] = data || [];
      }
      return { data: out, error: null };
    },
    async importData(json) {
      const id = await uid();
       if (!id) return { data: null, error: { message: 'Sin sesión' } };
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const tables = Object.keys(data);
        for (const t of tables) {
          const arr = Array.isArray(data[t]) ? data[t] : [];
          const cleaned = arr.map((r) => {
            const { id: _id, ...rest } = r;
            return { ...rest, user_id: id };
          });
          if (cleaned.length) {
            await supabase.from(t).upsert(cleaned);
          }
        }
        return { data: { ok: true }, error: null };
      } catch (e) {
        return { data: null, error: { message: 'JSON invÃ¡lido' } };
      }
    }
  };
}

export const adapter = hasSupabaseConfig() ? supabaseAdapter() : localStorageAdapter();
export const isDemoMode = !hasSupabaseConfig();
