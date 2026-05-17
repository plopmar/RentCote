"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, HelpCircle, X } from "lucide-react";

interface ModalContextType {
  confirm: (message: string, options?: { title?: string, confirmText?: string, cancelText?: string, danger?: boolean }) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, options?: { title?: string, confirmText?: string, cancelText?: string }) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "confirm" | "prompt";
    title: string;
    message: string;
    defaultValue: string;
    confirmText: string;
    cancelText: string;
    danger: boolean;
    resolve: (value: any) => void;
  } | null>(null);

  const [promptValue, setPromptValue] = useState("");

  const confirm = (message: string, options?: { title?: string, confirmText?: string, cancelText?: string, danger?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        type: "confirm",
        title: options?.title || "Confirmación",
        message,
        defaultValue: "",
        confirmText: options?.confirmText || "Confirmar",
        cancelText: options?.cancelText || "Cancelar",
        danger: options?.danger || false,
        resolve,
      });
    });
  };

  const prompt = (message: string, defaultValue = "", options?: { title?: string, confirmText?: string, cancelText?: string }) => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(defaultValue);
      setModalState({
        isOpen: true,
        type: "prompt",
        title: options?.title || "Entrada requerida",
        message,
        defaultValue,
        confirmText: options?.confirmText || "Aceptar",
        cancelText: options?.cancelText || "Cancelar",
        danger: false,
        resolve,
      });
    });
  };

  const handleClose = () => {
    if (modalState) {
      modalState.resolve(modalState.type === "prompt" ? null : false);
      setModalState(null);
    }
  };

  const handleConfirm = () => {
    if (modalState) {
      modalState.resolve(modalState.type === "prompt" ? promptValue : true);
      setModalState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, prompt }}>
      {children}
      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden animate-slide-up"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${modalState.danger ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                  {modalState.danger ? <AlertCircle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-white">{modalState.title}</h3>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 text-[var(--color-muted)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-[var(--color-muted)] mb-5">{modalState.message}</p>
              
              {modalState.type === "prompt" && (
                <input
                  type="text"
                  autoFocus
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-2"
                  style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)", color: "white" }}
                />
              )}
            </div>

            <div className="p-5 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-light)" }}>
              <button onClick={handleClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-colors">
                {modalState.cancelText}
              </button>
              <button onClick={handleConfirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90"
                style={modalState.danger 
                  ? { background: "linear-gradient(135deg, #ef4444, #b91c1c)" }
                  : { background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
