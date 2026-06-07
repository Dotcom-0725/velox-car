import { useState, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { CarLogo } from "../../components/CarIllustration";

export function AdminLogin() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@veloxcars.ma");
  const [password, setPassword] = useState("velox2026");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password, remember);
    setLoading(false);
    if (result.ok) {
      navigate("/admin");
    } else {
      setError(result.error || "Erreur de connexion");
    }
  };

  return (
    <div className="hero-mesh relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto inline-flex">
              <CarLogo size={64} />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">VELOX CARS</h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Admin Panel</p>
            <p className="mt-4 text-sm text-slate-500">Connexion à votre espace de gestion</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">E-mail</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 ps-10 pe-4 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  placeholder="admin@veloxcars.ma"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 ps-10 pe-10 text-sm focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-700"
                />
                Se souvenir de moi
              </label>
              <button type="button" className="text-xs font-semibold text-navy-700 hover:underline" onClick={() => alert("Contactez votre super-admin pour réinitialiser votre mot de passe.")}>
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-navy-800 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-navy-700/30 transition-all hover:shadow-xl disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Se connecter
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Identifiants de démonstration
            </p>
            <ul className="mt-1.5 space-y-0.5 font-mono text-[11px] text-amber-900">
              <li><span className="font-bold">Super Admin :</span> admin@veloxcars.ma / velox2026</li>
              <li><span className="font-bold">Manager :</span> karim@veloxcars.ma / karim2026</li>
              <li><span className="font-bold">Staff :</span> fatima@veloxcars.ma / fatima2026</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/70">
          © 2026 VELOX CARS — Système de gestion sécurisé
        </p>
      </motion.div>
    </div>
  );
}
