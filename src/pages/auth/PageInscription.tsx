import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import type { CaptchaData } from "../../types";

type Etape = "formulaire" | "otp";

export default function PageInscription() {
  const navigate = useNavigate();

  const [etape, setEtape] = useState<Etape>("formulaire");
  const [matricule, setMatricule] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaValue, setCaptchaValue] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState("");
  const [emailMasque, setEmailMasque] = useState("");
  const [matriculeOtp, setMatriculeOtp] = useState("");
  const [renvoi, setRenvoi] = useState(false);
  const [compteur, setCompteur] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    chargerCaptcha();
    setTimeout(() => setMounted(true), 80);
  }, []);

  useEffect(() => {
    if (compteur <= 0) return;
    const t = setTimeout(() => setCompteur((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [compteur]);

  const chargerCaptcha = async () => {
    try {
      const res = await api.get("/auth/captcha/");
      setCaptcha(res.data);
      setCaptchaValue("");
    } catch {
      setError("Impossible de charger le CAPTCHA.");
    }
  };

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  const pwLabel = ["", "Faible", "Moyen", "Bon", "Fort"];
  const pwColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  const handleOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpCode(next.join(""));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = [...otpDigits];
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);
    setOtpCode(next.join(""));
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Minimum 8 caractères requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/inscription/", {
        matricule,
        email,
        password,
        password_confirm: passwordConfirm,
        captcha_key: captcha?.captcha_key || "",
        captcha_value: captchaValue,
      });
      setEmailMasque(res.data.data?.email_masque || "");
      setMatriculeOtp(matricule);
      setCompteur(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCode("");
      setEtape("otp");
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: { details?: Record<string, string[]>; message?: string };
        };
      };
      const d = e.response?.data?.details;
      if (d) {
        const first = Object.values(d)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError(e.response?.data?.message || "Erreur lors de l'inscription.");
      }
      chargerCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifierOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Saisissez les 6 chiffres du code.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/inscription/verification-otp/", {
        matricule: matriculeOtp,
        code,
      });
      setSuccess("Compte créé avec succès ! Redirection...");
      setTimeout(() => navigate("/connexion"), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Code incorrect ou expiré.");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCode("");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleRenvoyerOtp = async () => {
    if (compteur > 0 || renvoi) return;
    setRenvoi(true);
    setError("");
    try {
      await api.post("/auth/inscription/renvoyer-otp/", {
        matricule: matriculeOtp,
      });
      setCompteur(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCode("");
      setSuccess("Nouveau code envoyé.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Impossible de renvoyer le code. Recommencez l'inscription.");
    } finally {
      setRenvoi(false);
    }
  };

  const retourFormulaire = () => {
    setEtape("formulaire");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpCode("");
    setError("");
    setSuccess("");
    chargerCaptcha();
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ins-root {
          min-height: 100dvh;
          background: linear-gradient(145deg, #1a2870 0%, #1e3a8a 40%, #1e40af 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px 48px;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Cercles décoratifs comme sur la page d'accueil */
        .ins-deco-1 {
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .ins-deco-2 {
          position: absolute;
          bottom: -100px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          pointer-events: none;
        }
        .ins-deco-3 {
          position: absolute;
          top: 40%; left: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.02);
          pointer-events: none;
        }

        /* Wrapper animé */
        .ins-wrap {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .ins-wrap.visible { opacity: 1; transform: translateY(0); }

        /* Logo */
        .ins-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
          text-decoration: none;
        }
        .ins-logo-box {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .ins-logo-text {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        /* Carte principale — blanche comme partout sur la plateforme */
        .ins-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        /* En-tête de la carte — bleu marine identique à l'existant */
        .ins-card-head {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
          padding: 32px 32px 28px;
          text-align: center;
        }

        /* Icône en-tête */
        .ins-head-icon {
          width: 60px; height: 60px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }

        .ins-head-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
          margin-bottom: 6px;
        }
        .ins-head-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }

        /* Indicateur d'étapes */
        .ins-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
        .ins-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          transition: color 0.3s;
        }
        .ins-step.active { color: #ffffff; }
        .ins-step.done   { color: rgba(255,255,255,0.6); }
        .ins-step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.4);
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .ins-step.active .ins-step-num {
          background: #ffffff;
          border-color: #ffffff;
          color: #1e3a8a;
        }
        .ins-step.done .ins-step-num {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
          color: #ffffff;
        }
        .ins-step-line {
          width: 32px; height: 1px;
          background: rgba(255,255,255,0.2);
        }

        /* Corps de la carte */
        .ins-card-body {
          padding: 28px 28px 32px;
        }

        /* Alertes */
        .ins-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .ins-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        .ins-alert.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }
        .ins-alert.info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
        }
        .ins-alert svg { flex-shrink: 0; margin-top: 1px; }

        /* Champs */
        .ins-field { margin-bottom: 16px; }
        .ins-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .ins-input-wrap { position: relative; }
        .ins-input-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          display: flex;
          pointer-events: none;
        }
        .ins-input {
          width: 100%;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 11px 14px 11px 38px;
          font-size: 14px;
          color: #111827;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .ins-input::placeholder { color: #9ca3af; }
        .ins-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .ins-input.mono {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ins-input.valid {
          border-color: #22c55e;
          background: #f0fdf4;
        }
        .ins-input.invalid {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .ins-input-btn {
          position: absolute;
          right: 10px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #9ca3af;
          padding: 4px; display: flex;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .ins-input-btn:hover { color: #6b7280; }
        .ins-hint {
          font-size: 11.5px;
          color: #9ca3af;
          margin-top: 5px;
        }

        /* Force mot de passe */
        .pw-bars {
          display: flex;
          gap: 4px;
          align-items: center;
          margin-top: 8px;
        }
        .pw-bar {
          flex: 1; height: 3px;
          border-radius: 2px;
          background: #e5e7eb;
          overflow: hidden;
        }
        .pw-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 0.3s, background 0.3s;
        }
        .pw-bar-label {
          font-size: 11px; font-weight: 600;
          min-width: 28px; text-align: right;
        }

        /* CAPTCHA */
        .captcha-row {
          display: flex; align-items: center;
          gap: 10px; margin-bottom: 8px;
        }
        .captcha-img {
          height: 44px; border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          flex-shrink: 0;
        }
        .captcha-btn {
          width: 36px; height: 36px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          color: #6b7280;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .captcha-btn:hover {
          border-color: #d1d5db;
          background: #f3f4f6;
          color: #374151;
        }

        /* Bouton principal — bleu marine identique à la plateforme */
        .ins-btn {
          width: 100%;
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: -0.01em;
        }
        .ins-btn:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30,58,138,0.35);
        }
        .ins-btn:active:not(:disabled) { transform: translateY(0); }
        .ins-btn:disabled {
          background: #d1d5db; color: #9ca3af;
          cursor: not-allowed; transform: none;
          box-shadow: none;
        }
        .ins-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Lien connexion */
        .ins-foot {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #6b7280;
        }
        .ins-foot a {
          color: #1e3a8a;
          font-weight: 600;
          text-decoration: none;
        }
        .ins-foot a:hover { text-decoration: underline; }

        /* Séparateur */
        .ins-sep {
          height: 1px;
          background: #f3f4f6;
          margin: 20px 0;
        }

        /* Encart info bas de page */
        .ins-trust {
          margin-top: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
        }
        .ins-trust svg { flex-shrink: 0; color: rgba(255,255,255,0.5); margin-top: 1px; }
        .ins-trust p { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5; }

        /* ── OTP cases ── */
        .otp-grid {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin: 8px 0 6px;
        }
        .otp-cell {
          width: 100%;
          max-width: 54px;
          height: 62px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          text-align: center;
          font-size: 24px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: #111827;
          outline: none;
          -webkit-appearance: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.1s;
          caret-color: #1e3a8a;
        }
        .otp-cell:focus {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          transform: scale(1.05);
        }
        .otp-cell.filled {
          border-color: #1e3a8a;
          background: #eff6ff;
          color: #1e3a8a;
        }

        /* Renvoi */
        .resend-area {
          text-align: center;
          margin-top: 18px;
        }
        .resend-area p {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 6px;
        }
        .resend-btn {
          background: none; border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          color: #1e3a8a;
          padding: 0;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .resend-btn:disabled { color: #d1d5db; cursor: default; }
        .resend-btn:not(:disabled):hover { color: #1d4ed8; text-decoration: underline; }

        /* Retour */
        .back-btn {
          background: none; border: none;
          cursor: pointer;
          font-size: 12.5px;
          color: #9ca3af;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 16px auto 0;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #6b7280; }

        @media (max-width: 380px) {
          .ins-card-body { padding: 22px 20px 28px; }
          .ins-card-head { padding: 24px 20px 22px; }
          .otp-cell { height: 54px; font-size: 20px; }
          .otp-grid { gap: 6px; }
        }
      `}</style>

      <div className="ins-root">
        <div className="ins-deco-1" />
        <div className="ins-deco-2" />
        <div className="ins-deco-3" />

        <div className={`ins-wrap ${mounted ? "visible" : ""}`}>
          {/* Logo */}
          <Link to="/" className="ins-logo">
            <div className="ins-logo-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="ins-logo-text">VoteSystem</span>
          </Link>

          <div className="ins-card">
            {/* ══════════ ÉTAPE 1 — FORMULAIRE ══════════ */}
            {etape === "formulaire" && (
              <>
                <div className="ins-card-head">
                  <div className="ins-head-icon">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h1 className="ins-head-title">Créer votre compte</h1>
                  <p className="ins-head-sub">
                    Réservé aux étudiants de la liste officielle
                  </p>
                  <div className="ins-steps">
                    <div className="ins-step active">
                      <div className="ins-step-num">1</div>
                      <span>Informations</span>
                    </div>
                    <div className="ins-step-line" />
                    <div className="ins-step">
                      <div className="ins-step-num">2</div>
                      <span>Vérification</span>
                    </div>
                  </div>
                </div>

                <div className="ins-card-body">
                  {error && (
                    <div className="ins-alert error">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Matricule */}
                    <div className="ins-field">
                      <label className="ins-label">Matricule</label>
                      <div className="ins-input-wrap">
                        <span className="ins-input-icon">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM6 11.75a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 01-.75-.75zm.75-3.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={matricule}
                          onChange={(e) =>
                            setMatricule(e.target.value.toUpperCase())
                          }
                          className="ins-input mono"
                          placeholder="21GL0045"
                          required
                          autoComplete="off"
                        />
                      </div>
                      <p className="ins-hint">
                        Tel qu'il apparaît sur votre carte étudiant.
                      </p>
                    </div>

                    {/* Email */}
                    <div className="ins-field">
                      <label className="ins-label">Email institutionnel</label>
                      <div className="ins-input-wrap">
                        <span className="ins-input-icon">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="ins-input"
                          placeholder="prenom.nom@univ.cm"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="ins-field">
                      <label className="ins-label">Mot de passe</label>
                      <div className="ins-input-wrap">
                        <span className="ins-input-icon">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="ins-input"
                          placeholder="Minimum 8 caractères"
                          required
                          style={{ paddingRight: "42px" }}
                        />
                        <button
                          type="button"
                          className="ins-input-btn"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                                clipRule="evenodd"
                              />
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.509-2.495-8.963-6.268a1.651 1.651 0 010-1.185A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                            </svg>
                          ) : (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                              <path
                                fillRule="evenodd"
                                d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {password && (
                        <div className="pw-bars">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="pw-bar">
                              <div
                                className="pw-bar-fill"
                                style={{
                                  width: i <= pwStrength ? "100%" : "0%",
                                  background: pwColor[pwStrength],
                                }}
                              />
                            </div>
                          ))}
                          <span
                            className="pw-bar-label"
                            style={{ color: pwColor[pwStrength] }}
                          >
                            {pwLabel[pwStrength]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirmation */}
                    <div className="ins-field">
                      <label className="ins-label">
                        Confirmer le mot de passe
                      </label>
                      <div className="ins-input-wrap">
                        <span className="ins-input-icon">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className={`ins-input ${
                            passwordConfirm
                              ? password === passwordConfirm
                                ? "valid"
                                : "invalid"
                              : ""
                          }`}
                          placeholder="Répétez votre mot de passe"
                          required
                          style={{ paddingRight: "42px" }}
                        />
                        <button
                          type="button"
                          className="ins-input-btn"
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                                clipRule="evenodd"
                              />
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.509-2.495-8.963-6.268a1.651 1.651 0 010-1.185A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                            </svg>
                          ) : (
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                              <path
                                fillRule="evenodd"
                                d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordConfirm && password === passwordConfirm && (
                        <p
                          className="ins-hint"
                          style={{
                            color: "#16a34a",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Les mots de passe correspondent
                        </p>
                      )}
                    </div>

                    {/* CAPTCHA */}
                    {captcha && (
                      <div className="ins-field">
                        <label className="ins-label">Code de sécurité</label>
                        <div className="captcha-row">
                          <img
                            src={captcha.captcha_image_url}
                            alt="CAPTCHA"
                            className="captcha-img"
                          />
                          <button
                            type="button"
                            className="captcha-btn"
                            onClick={chargerCaptcha}
                            title="Nouveau code"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="ins-input-wrap">
                          <span className="ins-input-icon">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 7a5 5 0 113.61 4.804l-1.903 1.903A1 1 0 019 14H8v1a1 1 0 01-1 1H6v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 01.293-.707L7.196 9.39A5.002 5.002 0 018 7zm5-3a.75.75 0 000 1.5A1.5 1.5 0 0114.5 7 .75.75 0 0016 7a3 3 0 00-3-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={captchaValue}
                            onChange={(e) =>
                              setCaptchaValue(e.target.value.toUpperCase())
                            }
                            className="ins-input mono"
                            placeholder="Saisir le code affiché"
                            required
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="ins-btn"
                    >
                      {loading ? (
                        <>
                          <div className="ins-spinner" />
                          Vérification en cours...
                        </>
                      ) : (
                        <>
                          Continuer
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="ins-foot">
                    Déjà un compte ? <Link to="/connexion">Se connecter</Link>
                  </div>
                </div>
              </>
            )}

            {/* ══════════ ÉTAPE 2 — OTP ══════════ */}
            {etape === "otp" && (
              <>
                <div className="ins-card-head">
                  <div className="ins-head-icon">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 3v4M8 3v4M2 11h20" />
                      <path d="M8 15h2M14 15h2M8 18h2M14 18h2" />
                    </svg>
                  </div>
                  <h1 className="ins-head-title">Vérifiez votre email</h1>
                  <p className="ins-head-sub">
                    Code envoyé à{" "}
                    <strong style={{ color: "#fff" }}>{emailMasque}</strong>
                  </p>
                  <div className="ins-steps">
                    <div className="ins-step done">
                      <div className="ins-step-num">
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      </div>
                      <span>Informations</span>
                    </div>
                    <div className="ins-step-line" />
                    <div className="ins-step active">
                      <div className="ins-step-num">2</div>
                      <span>Vérification</span>
                    </div>
                  </div>
                </div>

                <div className="ins-card-body">
                  {error && (
                    <div className="ins-alert error">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="ins-alert success">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {success}
                    </div>
                  )}

                  <div className="ins-alert info">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Saisissez le code à <strong>6 chiffres</strong> reçu par
                    email. Il expire dans <strong>10 minutes</strong>.
                  </div>

                  <form onSubmit={handleVerifierOtp}>
                    <label
                      className="ins-label"
                      style={{
                        textAlign: "center",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      Code de vérification
                    </label>

                    <div className="otp-grid" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigit(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={`otp-cell ${digit ? "filled" : ""}`}
                          autoFocus={i === 0}
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>
                    <p
                      className="ins-hint"
                      style={{ textAlign: "center", marginBottom: "20px" }}
                    >
                      Vous pouvez coller le code directement depuis votre email
                    </p>

                    <button
                      type="submit"
                      disabled={loading || otpDigits.join("").length !== 6}
                      className="ins-btn"
                    >
                      {loading ? (
                        <>
                          <div className="ins-spinner" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Confirmer et créer le compte
                        </>
                      )}
                    </button>
                  </form>

                  <div className="ins-sep" />

                  <div className="resend-area">
                    <p>Vous n'avez pas reçu le code ?</p>
                    <button
                      onClick={handleRenvoyerOtp}
                      disabled={compteur > 0 || renvoi}
                      className="resend-btn"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {compteur > 0
                        ? `Renvoyer dans ${compteur}s`
                        : renvoi
                          ? "Envoi en cours..."
                          : "Renvoyer le code"}
                    </button>
                  </div>

                  <button onClick={retourFormulaire} className="back-btn">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.78 5.22a.75.75 0 010 1.06L8.06 10l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Revenir au formulaire
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Encart confiance */}
          <div className="ins-trust">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              Inscription sécurisée par vérification email. Votre filière et
              niveau sont automatiquement renseignés depuis la liste officielle
              de l'université.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
