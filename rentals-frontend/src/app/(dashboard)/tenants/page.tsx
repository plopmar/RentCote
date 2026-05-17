"use client";

import { useEffect, useState } from "react";
import { tenantsApi, TenantResponse, TenantRequest } from "@/lib/api";
import { useModal } from "@/components/ModalProvider";

export default function TenantsPage() {
  const { confirm } = useModal();
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dniOrNie, setDniOrNie] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); tenantsApi.getAll().then(setTenants).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      await tenantsApi.create({ fullName, email, phone, dniOrNie } as TenantRequest);
      setShowForm(false); setFullName(""); setEmail(""); setPhone(""); setDniOrNie(""); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => { if (!(await confirm("¿Eliminar?", { danger: true }))) return; await tenantsApi.delete(id); load(); };
  const filtered = tenants.filter((t) => t.fullName.toLowerCase().includes(search.toLowerCase()) || t.dniOrNie.toLowerCase().includes(search.toLowerCase()));
  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const inputSt = { background: "var(--color-surface-light)", border: "1px solid var(--color-border)" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Inquilinos</h1><p className="text-sm text-[var(--color-muted)]">{tenants.length} registrados</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{showForm ? "Cancelar" : "+ Nuevo Inquilino"}</button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 border animate-fade-in" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Registrar Inquilino</h2>
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Nombre Completo</label><input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="María López" className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@email.com" className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Teléfono</label><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">DNI / NIE</label><input required value={dniOrNie} onChange={(e) => setDniOrNie(e.target.value)} placeholder="12345678A" className={inputCls} style={inputSt} /></div>
            <div className="md:col-span-2"><button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{submitting ? "Guardando..." : "Guardar"}</button></div>
          </form>
        </div>
      )}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o DNI..." className="w-full max-w-sm px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }} />

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}><p className="text-4xl mb-3">👥</p><p className="text-[var(--color-muted)]">{search ? "Sin resultados." : "No hay inquilinos."}</p></div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ background: "var(--color-surface-light)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Teléfono</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">DNI/NIE</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>{filtered.map((t) => (
              <tr key={t.id} className="border-t animate-fade-in" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 font-medium text-white">{t.fullName}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{t.email}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{t.phone}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{t.dniOrNie}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(t.id)} className="text-xs text-[var(--color-danger)] hover:underline">Eliminar</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
