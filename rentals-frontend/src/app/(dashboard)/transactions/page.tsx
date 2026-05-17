"use client";

import { useEffect, useState } from "react";
import { transactionsApi, TransactionResponse, TransactionRequest, contractsApi, ContractResponse, expenseTypesApi, ExpenseTypeResponse } from "@/lib/api";
import toast from "react-hot-toast";
import { useModal } from "@/components/ModalProvider";

const STATUS_COLORS: Record<string, string> = { PAGADO: "#22c55e", PENDIENTE: "#f59e0b", ATRASADO: "#ef4444" };
const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function TransactionsPage() {
  const { confirm } = useModal();
  const [txs, setTxs] = useState<TransactionResponse[]>([]);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("GASTO");
  const [expenseTypeId, setExpenseTypeId] = useState("");
  const [status, setStatus] = useState("PENDIENTE");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiptContractId, setReceiptContractId] = useState("");
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, c, et] = await Promise.all([
        transactionsApi.getAll(),
        contractsApi.getAll(),
        expenseTypesApi.getAll()
      ]);
      setTxs(t);
      setContracts(c);
      setExpenseTypes(et);
      if (et.length > 0 && !expenseTypeId) setExpenseTypeId(et[0].id);
    } catch (err) {
      toast.error("Error al cargar datos financieros");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const data: TransactionRequest = { 
        amount: parseFloat(amount), 
        type, 
        status, 
        dueDate, 
        description,
        expenseTypeId: type === "GASTO" ? expenseTypeId : undefined
      };
      await transactionsApi.create(data);
      setShowForm(false); setAmount(""); setDescription(""); load();
      toast.success("Transacción registrada");
    } catch (err: any) { setError(err.message || "Error"); } finally { setSubmitting(false); }
  };

  const handlePay = async (id: string) => { 
    try {
      await transactionsApi.markAsPaid(id); 
      load(); 
      toast.success("Pagado correctamente");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const handleDelete = async (id: string) => { 
    if (!(await confirm("¿Eliminar transacción?", { danger: true }))) return; 
    try {
      await transactionsApi.delete(id); 
      load(); 
      toast.success("Eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!receiptContractId) return;
    setGeneratingReceipt(true);
    try { 
      await transactionsApi.generateReceipt(receiptContractId); 
      load(); 
      toast.success("Recibo generado");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally { setGeneratingReceipt(false); }
  };

  const filtered = filter === "ALL" ? txs : txs.filter((t) => t.status === filter);
  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const inputSt = { background: "var(--color-surface-light)", border: "1px solid var(--color-border)" };
  const activeContracts = contracts.filter((c) => c.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Finanzas</h1><p className="text-sm text-[var(--color-muted)]">{txs.length} transacciones</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{showForm ? "Cancelar" : "+ Registrar Transacción"}</button>
      </div>

      {activeContracts.length > 0 && (
        <div className="rounded-2xl p-4 border flex items-center gap-3 flex-wrap animate-fade-in" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <span className="text-sm text-[var(--color-muted)]">Generar Recibo Mensual:</span>
          <select value={receiptContractId} onChange={(e) => setReceiptContractId(e.target.value)} className="px-3 py-1.5 rounded-xl text-sm" style={inputSt}>
            <option value="">Seleccionar contrato activo...</option>
            {activeContracts.map((c) => <option key={c.id} value={c.id}>{c.rentalName} — {fmt(c.monthlyRent)}/mes</option>)}
          </select>
          <button onClick={handleGenerateReceipt} disabled={!receiptContractId || generatingReceipt} className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "var(--color-success)" }}>{generatingReceipt ? "Generando..." : "🧾 Generar"}</button>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl p-6 border animate-fade-in" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Registrar Transacción</h2>
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Importe (€)</label><input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Tipo</label><select value={type} onChange={(e) => setType(e.target.value)} className={inputCls} style={inputSt}><option value="GASTO">Gasto</option><option value="INGRESO">Ingreso</option></select></div>
            
            {type === "GASTO" && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Categoría de Gasto</label>
                <select value={expenseTypeId} onChange={(e) => setExpenseTypeId(e.target.value)} className={inputCls} style={inputSt}>
                  {expenseTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </div>
            )}

            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Estado</label><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputSt}><option value="PENDIENTE">Pendiente</option><option value="PAGADO">Pagado</option></select></div>
            <div><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Fecha Vencimiento</label><input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} style={inputSt} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Descripción</label><input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Pago mensual, Reparación..." className={inputCls} style={inputSt} /></div>
            <div className="md:col-span-2"><button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>{submitting ? "Guardando..." : "Guardar"}</button></div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PAGADO", "PENDIENTE", "ATRASADO"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === f ? "text-white" : "text-[var(--color-muted)]"}`}
            style={filter === f ? { background: f === "ALL" ? "var(--color-primary)" : STATUS_COLORS[f] || "var(--color-primary)" } : { background: "var(--color-surface-light)", border: "1px solid var(--color-border)" }}>
            {f === "ALL" ? "Todas" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}><p className="text-4xl mb-3">💰</p><p className="text-[var(--color-muted)]">Sin transacciones.</p></div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ background: "var(--color-surface-light)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Descripción</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Importe</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Vence</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Estado</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>{filtered.map((t) => (
              <tr key={t.id} className="border-t animate-fade-in" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{t.description}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase ${t.type === "INGRESO" ? "text-emerald-400" : "text-amber-400"}`}>
                    {t.type === "INGRESO" ? "Alquiler" : (t.expenseTypeName || "General")}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: t.type === "INGRESO" ? "var(--color-success)" : "var(--color-danger)" }}>{fmt(t.amount)}</td>
                <td className="px-4 py-3 text-[var(--color-muted)] text-xs">{t.dueDate}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white" style={{ background: STATUS_COLORS[t.status] }}>{t.status}</span></td>
                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                  {t.status !== "PAGADO" && <button onClick={() => handlePay(t.id)} className="text-xs text-[var(--color-success)] hover:underline">Cobrar</button>}
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-[var(--color-danger)] hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
