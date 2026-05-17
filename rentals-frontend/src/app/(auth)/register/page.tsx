"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("userName", res.name);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #111119 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">RentCote</h1>
          <p className="text-[var(--color-muted)] mt-1 text-sm">Crea tu cuenta de propietario</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-semibold text-white mb-6">Registro</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-300 animate-fade-in"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-1.5">Nombre completo</label>
              <input
                id="register-name"
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)" }}
                placeholder="Juan García"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-1.5">Email</label>
              <input
                id="register-email"
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)" }}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-1.5">Contraseña</label>
              <input
                id="register-password"
                type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{ background: "var(--color-surface-light)", border: "1px solid var(--color-border)" }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button
              id="register-submit"
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-muted)] mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[var(--color-primary-light)] hover:underline font-medium">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
