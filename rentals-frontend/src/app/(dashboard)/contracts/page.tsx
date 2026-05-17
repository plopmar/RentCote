"use client";

import { useEffect, useState } from "react";
import { contractsApi, ContractResponse, ContractRequest, rentalsApi, RentalResponse, tenantsApi, TenantResponse, RentEvolutionResponse } from "@/lib/api";
import toast from "react-hot-toast";
import { FileText, History, XCircle, Trash2, Download, Edit2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

const STATUS_COLORS: Record<string, string> = { ACTIVE: "#22c55e", TERMINATED: "#ef4444", PENDING: "#f59e0b" };
const STATUS_LABELS: Record<string, string> = { ACTIVE: "Activo", TERMINATED: "Finalizado", PENDING: "Pendiente" };
const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function ContractsPage() {
  const { confirm, prompt } = useModal();
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rentalId, setRentalId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [pdf, setPdf] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedContract, setSelectedContract] = useState<ContractResponse | null>(null);
  const [rentHistory, setRentHistory] = useState<RentEvolutionResponse[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [c, r, t] = await Promise.all([contractsApi.getAll(), rentalsApi.getAll(), tenantsApi.getAll()]);
      setContracts(c); setRentals(r); setTenants(t);
    } catch (err) {
      toast.error("Error al cargar contratos");
    } finally { setLoading(false); }
  };
  
  useEffect(() => { load(); }, []);

  // Auto-completar renta al seleccionar inmueble
  useEffect(() => {
    if (rentalId) {
      const rental = rentals.find(r => r.id === rentalId);
      if (rental) {
        setMonthlyRent(rental.monthlyPrice.toString());
      }
    }
  }, [rentalId, rentals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const data: ContractRequest = { rentalId, tenantId, startDate, endDate, monthlyRent: parseFloat(monthlyRent), deposit: parseFloat(deposit), status };
      
      if (editingId) {
        await contractsApi.update(editingId, data, pdf || undefined);
        toast.success("Contrato actualizado con éxito");
      } else {
        await contractsApi.create(data, pdf || undefined);
        toast.success("Contrato creado con éxito");
      }
      
      setShowForm(false); 
      setEditingId(null);
      setPdf(null);
      load();
    } catch (err: any) { setError(err.message || "Error"); } finally { setSubmitting(false); }
  };

  const handleEdit = (c: ContractResponse) => {
    setEditingId(c.id);
    setRentalId(c.rentalId);
    setTenantId(c.tenantId);
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setMonthlyRent(c.monthlyRent.toString());
    setDeposit(c.deposit.toString());
    setStatus(c.status);
    setPdf(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setEditingId(null);
      setRentalId("");
      setTenantId("");
      setStartDate("");
      setEndDate("");
      setMonthlyRent("");
      setDeposit("");
      setStatus("ACTIVE");
      setPdf(null);
    }
  };

  const handleTerminate = async (id: string) => {
    if (!(await confirm("¿Dar de baja este contrato? Esto liberará el inmueble.", { danger: true }))) return;
    try {
      await contractsApi.terminate(id);
      load();
      toast.success("Contrato finalizado e inmueble liberado");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => { 
    if (!(await confirm("¿Eliminar contrato?", { danger: true }))) return; 
    try {
      await contractsApi.delete(id); load(); 
      toast.success("Contrato eliminado");
    } catch (err: any) { toast.error(err.message); }
  };

  const viewHistory = async (contract: ContractResponse) => {
    setSelectedContract(contract);
    try {
      const history = await contractsApi.getHistory(contract.id);
      setRentHistory(history);
    } catch (err) { toast.error("Error al cargar historial"); }
  };

  const addPriceUpdate = async () => {
    if (!selectedContract) return;
    const amount = await prompt("Nuevo importe de renta:");
    if (!amount) return;
    const date = await prompt("Fecha de aplicación (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!date) return;
    try {
      await contractsApi.addHistory(selectedContract.id, { amount: parseFloat(amount), startDate: date, description: "Actualización manual" });
      viewHistory(selectedContract);
      toast.success("Precio actualizado");
    } catch (err: any) { toast.error(err.message); }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const inputSt = { background: "var(--color-surface-light)", border: "1px solid var(--color-border)" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Contratos</h1><p className="text-sm text-[var(--color-muted)]">{contracts.length} contratos registrados</p></div>
        <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{showForm ? "Cancelar" : "+ Nuevo Contrato"}</button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 border animate-fade-in" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">{editingId ? "Editar Contrato" : "Crear Contrato"}</h2>
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Inmueble</label><select required value={rentalId} onChange={(e) => setRentalId(e.target.value)} className={inputCls} style={inputSt}><option value="">Seleccionar...</option>{rentals.filter(r => r.status === 'VACIO' || r.status === 'VACÍO' || r.id === rentalId).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.address})</option>)}</select></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Inquilino</label><select required value={tenantId} onChange={(e) => setTenantId(e.target.value)} className={inputCls} style={inputSt}><option value="">Seleccionar...</option>{tenants.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Fecha Inicio</label><input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Fecha Fin</label><input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Renta Mensual (€)</label><input type="number" step="0.01" min="0.01" required value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Fianza (€)</label><input type="number" step="0.01" min="0" required value={deposit} onChange={(e) => setDeposit(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Documento (PDF)</label><input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Estado</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputSt}><option value="ACTIVE">Activo</option><option value="PENDING">Pendiente</option></select></div>
            <div className="md:col-span-2 pt-2"><button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{submitting ? "Guardando..." : (editingId ? "Actualizar Contrato" : "Crear Contrato")}</button></div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}><p className="text-4xl mb-3">📝</p><p className="text-[var(--color-muted)]">No hay contratos.</p></div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ background: "var(--color-surface-light)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Inmueble / Inquilino</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Período</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Renta Act.</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr></thead>
            <tbody>{contracts.map((c) => (
              <tr key={c.id} className="border-t animate-fade-in" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{c.rentalName}</div>
                  <div className="text-[10px] text-[var(--color-muted)] uppercase">{c.tenantName}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] text-xs">{c.startDate} → {c.endDate}</td>
                <td className="px-4 py-3 font-semibold text-[var(--color-success)]">{fmt(c.monthlyRent)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white" style={{ background: STATUS_COLORS[c.status] }}>{STATUS_LABELS[c.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.pdfUrl && <a href={`http://localhost:8080${c.pdfUrl}`} target="_blank" className="text-indigo-400 hover:text-indigo-300" title="Ver PDF"><FileText className="w-4 h-4" /></a>}
                    <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300" title="Editar Contrato"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => viewHistory(c)} className="text-amber-400 hover:text-amber-300" title="Historial de Precios"><History className="w-4 h-4" /></button>
                    {c.status === "ACTIVE" && <button onClick={() => handleTerminate(c.id)} className="text-red-400 hover:text-red-300" title="Dar de Baja"><XCircle className="w-4 h-4" /></button>}
                    <button onClick={() => handleDelete(c.id)} className="text-gray-500 hover:text-red-500" title="Eliminar permanentemente"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* History Modal (Simplified as a section below) */}
      {selectedContract && (
        <div className="rounded-2xl p-6 border animate-slide-up" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><History className="w-5 h-5 text-amber-500" /> Historial de Precios: {selectedContract.rentalName}</h2>
            <div className="flex gap-2">
              <button onClick={addPriceUpdate} className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/30">+ Actualizar Precio</button>
              <button onClick={() => setSelectedContract(null)} className="text-xs text-[var(--color-muted)] hover:text-white">Cerrar</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rentHistory.map((h) => (
              <div key={h.id} className="p-3 rounded-xl border border-gray-800 bg-gray-900/50">
                <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase">{h.startDate}</p>
                <p className="text-lg font-bold text-emerald-400">{fmt(h.amount)}</p>
                <p className="text-[10px] text-gray-500 truncate">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
