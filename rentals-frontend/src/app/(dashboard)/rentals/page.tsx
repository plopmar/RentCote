"use client";

import { useEffect, useState } from "react";
import { 
  rentalsApi, 
  rentalTypesApi, 
  transactionsApi, 
  expenseTypesApi,
  RentalResponse, 
  RentalRequest, 
  RentalTypeResponse,
  TransactionResponse,
  ExpenseTypeResponse
} from "@/lib/api";
import toast from "react-hot-toast";
import { Wallet, Plus, Trash2, X, Receipt, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function RentalsPage() {
  const { confirm, prompt } = useModal();
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [rentalTypes, setRentalTypes] = useState<RentalTypeResponse[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Property Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rentalTypeId, setRentalTypeId] = useState("");
  const [newMonthlyPrice, setNewMonthlyPrice] = useState("");
  const [newPurchasePrice, setNewPurchasePrice] = useState("");
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Finance Modal State
  const [selectedRental, setSelectedRental] = useState<RentalResponse | null>(null);
  const [rentalTransactions, setRentalTransactions] = useState<TransactionResponse[]>([]);
  const [showTxForm, setShowTxForm] = useState(false);
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"INGRESO" | "GASTO">("INGRESO");
  const [txDueDate, setTxDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDesc, setTxDesc] = useState("");
  const [txExpenseTypeId, setTxExpenseTypeId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [r, rt, et] = await Promise.all([
        rentalsApi.getAll(),
        rentalTypesApi.getAll(),
        expenseTypesApi.getAll()
      ]);
      setRentals(r);
      setRentalTypes(rt);
      setExpenseTypes(et);
      if (rt.length > 0 && !rentalTypeId) setRentalTypeId(rt[0].id);
      if (et.length > 0) setTxExpenseTypeId(et[0].id);
    } catch (err) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Rental CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data: RentalRequest = {
        name, address, rentalTypeId,
        monthlyPrice: parseFloat(newMonthlyPrice),
        purchasePrice: newPurchasePrice ? parseFloat(newPurchasePrice) : undefined,
        attributes: Object.fromEntries(Object.entries(attrs).filter(([, v]) => v !== "")),
      };
      await rentalsApi.create(data);
      setShowForm(false);
      setName(""); setAddress(""); setNewMonthlyPrice(""); setNewPurchasePrice(""); setAttrs({});
      load();
      toast.success("Inmueble creado");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("¿Eliminar este inmueble?", { danger: true }))) return;
    try {
      await rentalsApi.delete(id);
      load();
      toast.success("Inmueble eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Finance Logic
  const openFinance = async (rental: RentalResponse) => {
    setSelectedRental(rental);
    try {
      const allTxs = await transactionsApi.getAll();
      setRentalTransactions(allTxs.filter(t => t.rentalId === rental.id));
    } catch (err) {
      toast.error("Error al cargar finanzas");
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;
    try {
      await transactionsApi.create({
        rentalId: selectedRental.id,
        amount: parseFloat(txAmount),
        type: txType,
        status: "PAGADO",
        dueDate: txDueDate,
        description: txDesc,
        expenseTypeId: txType === "GASTO" ? txExpenseTypeId : null
      });
      setShowTxForm(false);
      setTxAmount(""); setTxDesc("");
      openFinance(selectedRental);
      toast.success("Transacción registrada");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!(await confirm("¿Eliminar transacción?", { danger: true }))) return;
    try {
      await transactionsApi.delete(id);
      if (selectedRental) openFinance(selectedRental);
      toast.success("Eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addAttrField = async () => {
    const key = await prompt("Nombre del atributo (ej: M2, Planta):");
    if (key) setAttrs({ ...attrs, [key]: "" });
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const inputSt = { background: "var(--color-surface-light)", border: "1px solid var(--color-border)" };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Propiedades</h1>
          <p className="text-sm text-[var(--color-muted)]">{rentals.length} inmuebles registrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
          {showForm ? "Cancelar" : "+ Añadir Inmueble"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 border animate-fade-in"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Nuevo Inmueble</h2>
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Nombre</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Piso Centro" className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Dirección</label>
              <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle Mayor 1" className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Tipo de Inmueble</label>
              <select value={rentalTypeId} onChange={(e) => setRentalTypeId(e.target.value)} className={inputCls} style={inputSt}>
                {rentalTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Precio Mensual (€)</label>
              <input type="number" step="0.01" min="0.01" required value={newMonthlyPrice} onChange={(e) => setNewMonthlyPrice(e.target.value)} className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Precio de Compra (€)</label>
              <input type="number" step="0.01" min="0" value={newPurchasePrice} onChange={(e) => setNewPurchasePrice(e.target.value)} className={inputCls} style={inputSt} />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Atributos Dinámicos</span>
                <button type="button" onClick={addAttrField} className="text-[10px] text-[var(--color-primary)] hover:underline">+ Añadir Atributo</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(attrs).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-[10px] text-[var(--color-muted)] mb-1">{key}</label>
                    <input value={val} onChange={(e) => setAttrs({ ...attrs, [key]: e.target.value })} className="w-full px-3 py-1.5 rounded-lg text-xs outline-none" style={inputSt} />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
                {submitting ? "Guardando..." : "Guardar Inmueble"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((r, i) => (
            <div key={r.id} className="rounded-2xl p-5 border transition-all hover:translate-y-[-4px] animate-fade-in relative overflow-hidden flex flex-col group"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", animationDelay: `${i * 60}ms` }}>
              
              <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest ${r.status === 'VACÍO' || r.status === 'VACIO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {r.status}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white bg-[var(--color-primary)]">{r.rentalTypeName}</span>
                </div>
                <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{r.name}</h3>
              <p className="text-xs text-[var(--color-muted)] mb-4">{r.address}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Renta mensual</p>
                  <p className="text-xl font-black text-white">{fmt(r.monthlyPrice)}</p>
                </div>
                <button onClick={() => openFinance(r)} 
                  className="p-3 rounded-xl bg-[var(--color-surface-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-lg border border-white/5"
                  title="Gestionar Finanzas">
                  <Wallet className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Finance Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border flex flex-col shadow-2xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><Wallet className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Finanzas: {selectedRental.name}</h2>
                  <p className="text-sm text-[var(--color-muted)]">{selectedRental.address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRental(null)} className="p-2 rounded-full hover:bg-white/10 text-[var(--color-muted)]"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Ingresos</p>
                  <p className="text-lg font-black text-white">{fmt(rentalTransactions.filter(t => t.type === 'INGRESO' && t.status === 'PAGADO').reduce((acc, t) => acc + t.amount, 0))}</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Gastos</p>
                  <p className="text-lg font-black text-white">{fmt(rentalTransactions.filter(t => t.type === 'GASTO').reduce((acc, t) => acc + t.amount, 0))}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 col-span-2">
                  <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Balance Neto</p>
                  <p className="text-xl font-black text-white">{fmt(rentalTransactions.reduce((acc, t) => acc + (t.type === 'INGRESO' ? t.amount : -t.amount), 0))}</p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Movimientos Recientes</h3>
                  <button onClick={() => setShowTxForm(!showTxForm)} className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] hover:underline">
                    {showTxForm ? "Cancelar" : <><Plus className="w-3 h-3" /> Registrar Movimiento</>}
                  </button>
                </div>

                {showTxForm && (
                  <form onSubmit={handleAddTx} className="p-4 rounded-2xl border bg-white/5 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-slide-down" style={{ borderColor: "var(--color-border)" }}>
                    <div>
                      <label className="block text-[10px] text-[var(--color-muted)] mb-1 uppercase">Tipo</label>
                      <select value={txType} onChange={(e) => setTxType(e.target.value as any)} className={inputCls} style={inputSt}>
                        <option value="INGRESO">Ingreso</option>
                        <option value="GASTO">Gasto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--color-muted)] mb-1 uppercase">Importe (€)</label>
                      <input required type="number" step="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className={inputCls} style={inputSt} />
                    </div>
                    {txType === "GASTO" ? (
                      <div>
                        <label className="block text-[10px] text-[var(--color-muted)] mb-1 uppercase">Categoría</label>
                        <select value={txExpenseTypeId} onChange={(e) => setTxExpenseTypeId(e.target.value)} className={inputCls} style={inputSt}>
                          {expenseTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                        </select>
                      </div>
                    ) : <div />}
                    <div>
                      <label className="block text-[10px] text-[var(--color-muted)] mb-1 uppercase">Fecha</label>
                      <input type="date" value={txDueDate} onChange={(e) => setTxDueDate(e.target.value)} className={inputCls} style={inputSt} />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-[var(--color-muted)] mb-1 uppercase">Concepto / Descripción</label>
                      <input required value={txDesc} onChange={(e) => setTxDesc(e.target.value)} placeholder="Ej: Pago IBI 2024" className={inputCls} style={inputSt} />
                    </div>
                    <div className="sm:col-span-4">
                      <button type="submit" className="w-full py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg hover:opacity-90">Registrar Movimiento</button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {rentalTransactions.length === 0 ? (
                    <p className="text-center py-8 text-sm text-[var(--color-muted)]">No hay movimientos registrados para este inmueble.</p>
                  ) : (
                    rentalTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                            {tx.type === 'INGRESO' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{tx.description}</p>
                            <p className="text-[10px] text-[var(--color-muted)] uppercase">{tx.expenseTypeName || (tx.type === 'INGRESO' ? 'Alquiler' : 'General')} • {tx.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <p className={`text-sm font-black ${tx.type === 'INGRESO' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'INGRESO' ? '+' : '-'}{fmt(tx.amount)}
                          </p>
                          <button onClick={() => handleDeleteTx(tx.id)} className="text-[var(--color-muted)] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
