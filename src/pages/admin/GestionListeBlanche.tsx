import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Users,
  Vote,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  XCircle,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

interface ListeBlancheEntry {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere: string;
  niveau: string;
  a_cree_son_compte: boolean;
}

interface ImportStats {
  importes: number;
  mis_a_jour?: number;
  doublons: number;
  erreurs: number;
  details_erreurs: string[];
}

export default function GestionListeBlanche() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<ListeBlancheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [modeUpsert, setModeUpsert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtreFiliere, setFiltreFiliere] = useState("");

  // Modale modification
  const [editEntry, setEditEntry] = useState<ListeBlancheEntry | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Confirmation suppression
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    chargerListe();
  }, []);

  const chargerListe = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/liste-blanche/");
      setEntries(response.data.results || response.data);
    } catch {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichier) return;
    setImporting(true);
    setError("");
    setSuccess("");
    setStats(null);
    const formData = new FormData();
    formData.append("fichier", fichier);
    try {
      const url = modeUpsert
        ? "/admin/liste-blanche/import/?mode=upsert"
        : "/admin/liste-blanche/import/";
      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStats(response.data.data);
      setSuccess(response.data.message);
      setFichier(null);
      chargerListe();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erreur lors de l'import.");
    } finally {
      setImporting(false);
    }
  };

  const ouvrirModification = (entry: ListeBlancheEntry) => {
    setEditEntry(entry);
    setEditNom(entry.nom);
    setEditPrenom(entry.prenom);
    setEditEmail(entry.email);
    setError("");
  };

  const handleSauvegarder = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      await api.patch(`/admin/liste-blanche/${editEntry.id}/`, {
        nom: editNom,
        prenom: editPrenom,
        email: editEmail,
      });
      setSuccess("Entrée mise à jour.");
      setEditEntry(null);
      chargerListe();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/liste-blanche/${deleteId}/`);
      setSuccess("Entrée supprimée.");
      setDeleteId(null);
      chargerListe();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erreur lors de la suppression.");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/connexion");
  };

  // Filtrage local
  const entriesFiltrees = entries.filter((e) => {
    const q = recherche.toLowerCase();
    const matchRecherche =
      !q ||
      e.matricule.toLowerCase().includes(q) ||
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    const matchFiliere = !filtreFiliere || e.filiere === filtreFiliere;
    return matchRecherche && matchFiliere;
  });

  const filieres = [...new Set(entries.map((e) => e.filiere))].sort();
  const nbInscrits = entries.filter((e) => e.a_cree_son_compte).length;
  const nbAttente = entries.filter((e) => !e.a_cree_son_compte).length;

  const navLinks = [
    {
      to: "/admin",
      icon: <LayoutDashboard size={18} />,
      label: "Tableau de bord",
    },
    { to: "/admin/scrutins", icon: <Vote size={18} />, label: "Scrutins" },
    { to: "/admin/electeurs", icon: <Users size={18} />, label: "Électeurs" },
    {
      to: "/admin/liste-blanche",
      icon: <FileText size={18} />,
      label: "Liste blanche",
      active: true,
    },
    {
      to: "/admin/audit",
      icon: <ShieldCheck size={18} />,
      label: "Logs d'audit",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 min-h-screen bg-blue-900 text-white flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-bold text-lg">VoteSystem</span>
              <p className="text-blue-300 text-xs">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${link.active ? "bg-white/15 text-white font-semibold" : "text-blue-200 hover:bg-white/10 hover:text-white"}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white text-sm transition-all w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="space-y-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-5 h-0.5 bg-gray-600" />
              ))}
            </div>
          </button>
          <span className="font-bold text-blue-900">Liste blanche</span>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
              Liste blanche
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Importer et gérer le référentiel officiel des étudiants
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Stats import */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p className="text-2xl font-bold text-green-700">
                  {stats.importes}
                </p>
                <p className="text-green-600 text-sm mt-1">Importés</p>
              </div>
              {stats.mis_a_jour !== undefined && (
                <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.mis_a_jour}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">Mis à jour</p>
                </div>
              )}
              <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                <p className="text-2xl font-bold text-amber-700">
                  {stats.doublons}
                </p>
                <p className="text-amber-600 text-sm mt-1">Doublons ignorés</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <p className="text-2xl font-bold text-red-700">
                  {stats.erreurs}
                </p>
                <p className="text-red-600 text-sm mt-1">Erreurs</p>
              </div>
            </div>
          )}

          {/* Stats globales */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-900">
                {entries.length}
              </p>
              <p className="text-gray-500 text-xs mt-1">Total étudiants</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{nbInscrits}</p>
              <p className="text-gray-500 text-xs mt-1">Inscrits</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-amber-500">{nbAttente}</p>
              <p className="text-gray-500 text-xs mt-1">Non inscrits</p>
            </div>
          </div>

          {/* Formulaire import */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-1">Importer un CSV</h2>
            <p className="text-gray-500 text-sm mb-4">
              Format attendu :{" "}
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                matricule, nom, prenom, email, filiere, niveau
              </span>
            </p>

            {/* Toggle mode */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <button
                onClick={() => setModeUpsert(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!modeUpsert ? "bg-white shadow text-blue-900" : "text-gray-400"}`}
              >
                Ignorer les doublons
              </button>
              <button
                onClick={() => setModeUpsert(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${modeUpsert ? "bg-white shadow text-blue-900" : "text-gray-400"}`}
              >
                Mettre à jour les existants
              </button>
            </div>
            {modeUpsert && (
              <p className="text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Mode mise à jour — les champs nom, prénom, email et filière
                seront écrasés pour les matricules existants non encore
                inscrits.
              </p>
            )}

            <form
              onSubmit={handleImport}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFichier(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 transition-colors"
              />
              <button
                type="submit"
                disabled={!fichier || importing}
                className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Upload size={16} />
                {importing ? "Import..." : "Importer"}
              </button>
            </form>
          </div>

          {/* Barre recherche + filtre */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher par matricule, nom, email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={filtreFiliere}
                onChange={(e) => setFiltreFiliere(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              >
                <option value="">Toutes les filières</option>
                {filieres.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={chargerListe}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 bg-white transition-colors"
            >
              <RefreshCw size={14} />
              Actualiser
            </button>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="block md:hidden space-y-3">
                {entriesFiltrees.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {entry.prenom} {entry.nom}
                        </p>
                        <p className="font-mono text-xs text-gray-400">
                          {entry.matricule}
                        </p>
                        <p className="text-xs text-gray-400">{entry.email}</p>
                      </div>
                      {entry.a_cree_son_compte ? (
                        <CheckCircle
                          size={18}
                          className="text-green-500 flex-shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={18}
                          className="text-gray-300 flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {entry.filiere} — {entry.niveau}
                      </span>
                      {!entry.a_cree_son_compte && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => ouvrirModification(entry)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">
                    {entriesFiltrees.length} entrée(s)
                    {recherche || filtreFiliere
                      ? ` sur ${entries.length}`
                      : " dans le référentiel"}
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {[
                        "Matricule",
                        "Nom complet",
                        "Filière",
                        "Compte créé",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {entriesFiltrees.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-700">
                            {entry.matricule}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800">
                            {entry.prenom} {entry.nom}
                          </p>
                          <p className="text-xs text-gray-400">{entry.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                            {entry.filiere} — {entry.niveau}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {entry.a_cree_son_compte ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <XCircle size={18} className="text-gray-300" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!entry.a_cree_son_compte ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => ouvrirModification(entry)}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Pencil size={13} /> Modifier
                              </button>
                              <button
                                onClick={() => setDeleteId(entry.id)}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 size={13} /> Supprimer
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Compte actif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {entriesFiltrees.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          {recherche || filtreFiliere
                            ? "Aucun résultat pour cette recherche."
                            : "Aucune entrée. Importez un fichier CSV."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Modale modification ── */}
      {editEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Modifier l'entrée
                </h3>
                <p className="text-gray-400 text-sm font-mono">
                  {editEntry.matricule}
                </p>
              </div>
              <button
                onClick={() => setEditEntry(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Nom
                </label>
                <input
                  type="text"
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Prénom
                </label>
                <input
                  type="text"
                  value={editPrenom}
                  onChange={(e) => setEditPrenom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                La filière, le niveau et le matricule ne sont pas modifiables
                pour garantir l'intégrité du référentiel officiel.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditEntry(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSauvegarder}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale confirmation suppression ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Cette entrée sera définitivement retirée du référentiel.
              L'étudiant ne pourra plus s'inscrire.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimer}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
