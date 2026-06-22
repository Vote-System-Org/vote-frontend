import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Users,
  BarChart3,
  ChevronRight,
  Trophy,
  Eye,
  Hash,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Cpu,
  GraduationCap,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import api from "../../api/axios";
import type { Scrutin } from "../../types";

const SCRUTINS_VISIBLES = 3;

export default function PageAccueil() {
  const [scrutinsClotures, setScrutinsClotures] = useState<Scrutin[]>([]);
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrutinsExpanded, setScrutinsExpanded] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    setTimeout(() => setVisible(true), 100);
    chargerScrutinsClotures();
  }, []);

  const chargerScrutinsClotures = async () => {
    try {
      const response = await api.get("/public/scrutins/clotures/");
      const data = response.data;
      const liste = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      setScrutinsClotures(liste);
    } catch {
      setScrutinsClotures([]);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const scrutinsAffiches = scrutinsExpanded
    ? scrutinsClotures
    : scrutinsClotures.slice(0, SCRUTINS_VISIBLES);

  const aPlus = scrutinsClotures.length > SCRUTINS_VISIBLES;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-blue-900 font-bold text-lg">VoteSystem</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                setAboutOpen(true);
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-gray-600 text-sm font-medium hover:text-blue-900 transition-colors"
            >
              À propos
            </button>
            <Link
              to="/verifier-vote"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-900 border border-blue-200 hover:border-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all group"
            >
              <ShieldCheck
                size={15}
                className="group-hover:scale-110 transition-transform"
              />
              Vérifier mon vote
            </Link>
            <Link
              to="/connexion"
              className="text-gray-600 text-sm font-medium hover:text-blue-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              className="bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all hover:shadow-md"
            >
              S'inscrire
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <div
              className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <div
              className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <div
              className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Info size={16} /> À propos
            </a>
            <Link
              to="/verifier-vote"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-blue-900 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <ShieldCheck size={16} /> Vérifier mon vote
            </Link>
            <Link
              to="/connexion"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-28 md:pt-36 pb-20 md:pb-28 px-4 md:px-8 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div
          className={`max-w-4xl mx-auto text-center relative transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8 border border-white/20">
            <ShieldCheck size={14} />
            Plateforme certifiée — Chiffrement RSA 2048
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Votez en toute
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              {" "}
              confiance
            </span>
          </h1>

          <p className="text-blue-200 text-base md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Plateforme de vote électronique sécurisée pour les élections
            étudiantes universitaires. Anonymat garanti, résultats vérifiables.
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap px-4">
            <Link
              to="/inscription"
              className="flex items-center gap-2 bg-white text-blue-900 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm md:text-base"
            >
              Commencer à voter <ChevronRight size={18} />
            </Link>
            <Link
              to="/connexion"
              className="flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-white/10 transition-all text-sm md:text-base"
            >
              Se connecter <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 max-w-2xl mx-auto px-4">
            {[
              { value: "RSA 2048", label: "Chiffrement" },
              { value: "SHA-256", label: "Hash chain audit" },
              { value: "100%", label: "Anonymat garanti" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <p className="text-lg md:text-2xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-blue-300 text-xs md:text-sm mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              Conçu pour la sécurité et la transparence
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Chaque fonctionnalité a été pensée pour garantir l'intégrité du
              processus électoral.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: <Lock size={22} />,
                title: "Anonymat Total",
                desc: "Aucun lien traçable entre un électeur et son bulletin. Architecture garantie en base de données.",
                color: "bg-blue-50 text-blue-900",
                delay: 0,
              },
              {
                icon: <Users size={22} />,
                title: "Éligibilité Contrôlée",
                desc: "Chaque électeur accède uniquement aux scrutins qui le concernent selon sa filière et son niveau.",
                color: "bg-green-50 text-green-700",
                delay: 100,
              },
              {
                icon: <ShieldCheck size={22} />,
                title: "Anti-fraude",
                desc: "Liste blanche officielle, un seul vote par électeur, vérification systématique côté serveur.",
                color: "bg-purple-50 text-purple-700",
                delay: 200,
              },
              {
                icon: <Hash size={22} />,
                title: "Audit immuable",
                desc: "Journalisation chaînée SHA-256 — toute altération des logs est immédiatement détectée.",
                color: "bg-amber-50 text-amber-700",
                delay: 0,
              },
              {
                icon: <Eye size={22} />,
                title: "Transparence",
                desc: "Résultats publiés après clôture, accessibles publiquement et vérifiables par tous.",
                color: "bg-red-50 text-red-700",
                delay: 100,
              },
              {
                icon: <BarChart3 size={22} />,
                title: "Résultats fiables",
                desc: "Statistiques de participation, taux de vote, export CSV pour l'administration.",
                color: "bg-teal-50 text-teal-700",
                delay: 200,
              },
            ].map((f) => (
              <div
                key={f.title}
                data-aos="fade-up"
                data-aos-delay={f.delay}
                className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              Comment ça marche ?
            </h2>
          </div>
          <div className="space-y-4 md:space-y-6">
            {[
              {
                step: "01",
                title: "Inscription sécurisée",
                desc: "L'étudiant s'inscrit avec son matricule officiel. Le système vérifie automatiquement son identité dans la liste blanche de l'administration.",
                delay: 0,
              },
              {
                step: "02",
                title: "Accès aux scrutins éligibles",
                desc: "Une fois connecté, l'électeur voit uniquement les scrutins qui le concernent selon sa filière et son niveau académique.",
                delay: 100,
              },
              {
                step: "03",
                title: "Vote chiffré et anonyme",
                desc: "Le bulletin est chiffré en RSA 2048 avant envoi. Aucun lien entre l'électeur et son vote n'est stocké en base de données.",
                delay: 200,
              },
              {
                step: "04",
                title: "Résultats publiés",
                desc: "À la clôture du scrutin, les résultats sont publiés automatiquement et accessibles à tous, avec les statistiques de participation.",
                delay: 300,
              },
            ].map((item) => (
              <div
                key={item.step}
                data-aos="fade-right"
                data-aos-delay={item.delay}
                className="flex gap-4 md:gap-6 p-5 md:p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-200 flex-shrink-0 w-10 md:w-14">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── À propos ────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full mb-4 border border-white/20">
              <Info size={12} /> À propos de VoteSystem
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Une plateforme pensée pour la démocratie étudiante
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              VoteSystem est né d'un constat simple : les élections étudiantes
              méritent des outils à la hauteur de leur importance. Nous avons
              conçu une solution moderne, sécurisée et transparente pour
              organiser des scrutins universitaires dignes de confiance.
            </p>
          </div>

          {/* Cards à propos */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {[
              {
                icon: <Target size={22} />,
                title: "Notre mission",
                desc: "Garantir que chaque voix étudiante compte. Nous offrons un outil fiable, accessible depuis n'importe quel appareil, qui élimine la fraude tout en préservant l'anonymat absolu de chaque électeur.",
                bg: "bg-white/10",
              },
              {
                icon: <Cpu size={22} />,
                title: "La technologie",
                desc: "Architecture découplée React + Django, chiffrement RSA 2048, signature HMAC-SHA256, chaîne d'audit immuable, base PostgreSQL sécurisée. Chaque choix technique est motivé par la sécurité.",
                bg: "bg-white/10",
              },
              {
                icon: <GraduationCap size={22} />,
                title: "Le contexte",
                desc: "Projet de fin de cycle — Licence Génie Logiciel 2025-2026, encadré par Ing. KUEDA. Développé par KENMATIO Vicens (backend) et FOUOGUE Gabriella (frontend) au sein de l'université.",
                bg: "bg-white/10",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`${card.bg} border border-white/15 rounded-2xl p-6`}
              >
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4 text-white">
                  {card.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-sm md:text-base">
                  {card.title}
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Valeurs / garanties */}
          <div
            className="bg-white/08 border border-white/10 rounded-2xl p-6 md:p-8"
            data-aos="fade-up"
            data-aos-delay="200"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-white font-bold text-base md:text-lg mb-6 text-center">
              Ce que VoteSystem garantit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Anonymat absolu",
                  desc: "Aucun lien entre l'électeur et son bulletin en base de données",
                },
                {
                  label: "Un électeur, un vote",
                  desc: "Double vote techniquement impossible grâce aux contraintes en base",
                },
                {
                  label: "Résultats vérifiables",
                  desc: "Chaque électeur peut vérifier que son vote a bien été comptabilisé",
                },
                {
                  label: "Intégrité des logs",
                  desc: "Chaîne SHA-256 — toute tentative de falsification est détectable",
                },
                {
                  label: "Éligibilité contrôlée",
                  desc: "Seuls les étudiants concernés accèdent à chaque scrutin",
                },
                {
                  label: "Données académiques protégées",
                  desc: "Filière et niveau issus de la liste officielle, non modifiables",
                },
              ].map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={11} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {g.label}
                    </p>
                    <p className="text-blue-300 text-xs mt-0.5 leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Résultats publics ───────────────────────────────────────────── */}
      {scrutinsClotures.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Titre + compteur */}
            <div
              className="flex items-center justify-between gap-3 mb-8"
              data-aos="fade-up"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Trophy className="text-amber-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-blue-900">
                    Résultats des élections
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {scrutinsClotures.length} scrutin
                    {scrutinsClotures.length > 1 ? "s" : ""} clôturé
                    {scrutinsClotures.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {/* Badge total si beaucoup */}
              {aPlus && (
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                  {scrutinsClotures.length} au total
                </span>
              )}
            </div>

            {/* Liste limitée */}
            <div className="space-y-4">
              {scrutinsAffiches.map((scrutin, i) => (
                <div
                  key={scrutin.id}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(i, 2) * 80}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm md:text-base">
                        {scrutin.titre}
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        Clôturé le {formatDate(scrutin.date_fin)}
                        {scrutin.filiere_cible && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {scrutin.filiere_cible}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/resultats/${scrutin.id}`}
                    className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-colors text-sm w-full sm:w-auto justify-center"
                  >
                    <BarChart3 size={16} />
                    Voir résultats
                  </Link>
                </div>
              ))}
            </div>

            {/* Bouton voir plus / voir moins */}
            {aPlus && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setScrutinsExpanded((v) => !v)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-blue-200 text-blue-900 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-900 transition-all text-sm"
                >
                  {scrutinsExpanded ? (
                    <>
                      <ChevronUp size={16} /> Réduire la liste
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Voir les{" "}
                      {scrutinsClotures.length - SCRUTINS_VISIBLES} autres
                      scrutins
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-blue-900">
        <div className="max-w-3xl mx-auto text-center" data-aos="zoom-in">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à participer ?
          </h2>
          <p className="text-blue-200 mb-8 md:mb-10 text-sm md:text-base">
            Inscrivez-vous avec votre matricule officiel et participez aux
            élections de votre université.
          </p>
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm md:text-base"
          >
            Créer mon compte <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-blue-950 px-4 md:px-8 py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-800 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="text-white" size={20} />
                </div>
                <span className="text-white font-bold text-lg">VoteSystem</span>
              </div>
              <p className="text-blue-300 text-sm leading-relaxed">
                Système de vote électronique sécurisé pour les élections
                étudiantes universitaires.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">
                Équipe de développement
              </h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  KENMATIO Vicens — Backend & Chef de projet
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  FOUOGUE Gabriela — Frontend
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Projet</h4>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  Encadreur : Ing KUEDA
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  Projet tutoré 2025-2026
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  Licence Génie Logiciel
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-6 md:pt-8 text-center text-blue-400 text-sm">
            © 2025-2026 VoteSystem — Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
