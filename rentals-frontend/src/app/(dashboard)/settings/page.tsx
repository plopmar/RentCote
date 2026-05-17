"use client";

import { useEffect, useState } from "react";
import { rentalTypesApi, expenseTypesApi, RentalTypeResponse, ExpenseTypeResponse } from "@/lib/api";
import { Plus, Trash2, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useModal } from "@/components/ModalProvider";

export default function SettingsPage() {
  const { confirm } = useModal();
  const [rentalTypes, setRentalTypes] = useState<RentalTypeResponse[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeResponse[]>([]);
  const [newRentalType, setNewRentalType] = useState("");
  const [newExpenseType, setNewExpenseType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rt, et] = await Promise.all([
        rentalTypesApi.getAll(),
        expenseTypesApi.getAll(),
      ]);
      setRentalTypes(rt);
      setExpenseTypes(et);
    } catch (error: any) {
      toast.error("Error al cargar tipos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRentalType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRentalType.trim()) return;
    try {
      const added = await rentalTypesApi.create(newRentalType);
      setRentalTypes([...rentalTypes, added]);
      setNewRentalType("");
      toast.success("Tipo de alquiler añadido");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddExpenseType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseType.trim()) return;
    try {
      const added = await expenseTypesApi.create(newExpenseType);
      setExpenseTypes([...expenseTypes, added]);
      setNewExpenseType("");
      toast.success("Tipo de gasto añadido");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteRentalType = async (id: string) => {
    if (!(await confirm("¿Seguro que quieres eliminar este tipo?", { danger: true }))) return;
    try {
      await rentalTypesApi.delete(id);
      setRentalTypes(rentalTypes.filter(t => t.id !== id));
      toast.success("Tipo eliminado");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteExpenseType = async (id: string) => {
    if (!(await confirm("¿Seguro que quieres eliminar este tipo?", { danger: true }))) return;
    try {
      await expenseTypesApi.delete(id);
      setExpenseTypes(expenseTypes.filter(t => t.id !== id));
      toast.success("Tipo eliminado");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Personalización</h1>
        <p className="text-sm text-[var(--color-muted)]">Adapta la herramienta a las necesidades de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tipos de Alquiler */}
        <div className="rounded-2xl p-6 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Tipos de Inmueble</h2>
          <form onSubmit={handleAddRentalType} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newRentalType}
              onChange={(e) => setNewRentalType(e.target.value)}
              placeholder="Ej: Ático, Local..."
              className="flex-1 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)", color: "white" }}
            />
            <button type="submit" className="p-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="space-y-2">
            {rentalTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                <span className="text-sm font-medium text-white">{type.name}</span>
                <button 
                  onClick={() => handleDeleteRentalType(type.id)}
                  className="text-[var(--color-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Gasto */}
        <div className="rounded-2xl p-6 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Categorías de Gasto</h2>
          <form onSubmit={handleAddExpenseType} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newExpenseType}
              onChange={(e) => setNewExpenseType(e.target.value)}
              placeholder="Ej: IBI, Seguro..."
              className="flex-1 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)", color: "white" }}
            />
            <button type="submit" className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="space-y-2">
            {expenseTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                <span className="text-sm font-medium text-white">{type.name}</span>
                <button 
                  onClick={() => handleDeleteExpenseType(type.id)}
                  className="text-[var(--color-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
