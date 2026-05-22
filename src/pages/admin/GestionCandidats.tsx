import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users, Vote, FileText, ShieldCheck,
  Plus, Trash2, AlertCircle, User, ArrowLeft
} from 'lucide-react';
import api from '../../api/axios';
import type { Candidat, Scrutin } from '../../types';

export default function GestionCandidats() {
  const { scrutinId } = useParams();

  const [scrutin, setScrutin]       = useState<Scrutin | null>(null);
  const [candidats, setCandidats]   = useState<Candidat[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);

  // Formulaire
  const [nom, setNom]           = useState('');
  const [prenom, setPrenom]     = useState('');
  const [programme, setProgramme] = useState('');
  const [photo, setPhoto]       = useState<File | null>(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    chargerDonnees();
  }, [scrutinId]);

  const chargerDonnees = async () => {
    try {
      const [scrutinRes, candidatsRes] = await Promise.all([
        api.get(`/admin/scrutins/${scrutinId}/`),
        api.get(`/admin/candidats/?scrutin_id=${scrutinId}`),
      ]);
      setScrutin(scrutinRes.data);
      const tous = candidatsRes.data.results || candidatsRes.data;
      setCandidats(tous);
    } catch {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const ajouterCandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('scrutin', scrutinId!);
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('programme', programme);
      if (photo) formData.append('photo', photo);

      await api.post('/admin/candidats/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Candidat ajouté avec succès !');
      setShowForm(false);
      setNom(''); setPrenom(''); setProgramme(''); setPhoto(null);
      chargerDonnees();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout.');
    } finally {
      setSaving(false);
    }
  };

  const supprimerCandidat = async (id: number) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    try {
      await api.delete(`/admin/candidats/${id}/`);
      setSuccess('Candidat supprimé.');
      chargerDonnees();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur suppression.');
    }
  };

  const candidatsReels  = candidats.filter(c => !c.est_vote_blanc);
  const voteBlanc       = candidats.find(c => c.est_vote_blanc);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
          <div className="p-6 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} />
              <span className="font-bold text-lg">VoteSystem</span>
            </div>
            <p className="text-blue-300 text-xs mt-1">Administration</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              Tableau de bord
            </Link>
            <Link to="/admin/scrutins"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white text-sm font-medium">
              <Vote size={18} />
              Scrutins
            </Link>
            <Link to="/admin/electeurs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <Users size={18} />
              Électeurs
            </Link>
            <Link to="/admin/liste-blanche"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <FileText size={18} />
              Liste blanche
            </Link>
            <Link to="/admin/audit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <ShieldCheck size={18} />
              Logs d'audit
            </Link>
          </nav>
        </aside>

        {/* Contenu */}
        <main className="flex-1 p-8">

          {/* En-tête */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin/scrutins"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-900">
                Candidats
              </h1>
              {scrutin && (
                <p className="text-gray-500 text-sm mt-1">
                  {scrutin.titre} —
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    scrutin.statut === 'OUVERT'
                      ? 'bg-green-100 text-green-700'
                      : scrutin.statut === 'BROUILLON'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {scrutin.statut}
                  </span>
                </p>
              )}
            </div>
            {scrutin?.statut === 'BROUILLON' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Ajouter un candidat
              </button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Formulaire ajout */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-800 mb-6">Nouveau candidat</h2>
              <form onSubmit={ajouterCandidat} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de famille"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Programme électoral
                  </label>
                  <textarea
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Programme du candidat..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Photo (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                  />
                  <p className="text-gray-400 text-xs mt-1">JPEG ou PNG — max 2 Mo</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    {saving ? 'Ajout...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setNom(''); setPrenom(''); setProgramme(''); setPhoto(null); }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="space-y-6">

              {/* Candidats réels */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">
                    Candidats réels ({candidatsReels.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {candidatsReels.map((candidat) => (
                    <div key={candidat.id} className="p-6 flex items-start gap-4">
                      {/* Photo */}
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {candidat.photo ? (
                          <img
                            src={candidat.photo}
                            alt={candidat.nom}
                            className="w-14 h-14 object-cover rounded-full"
                          />
                        ) : (
                          <User size={24} className="text-blue-700" />
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">
                          {candidat.nom} {candidat.prenom || ''}
                        </p>
                        {candidat.programme && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {candidat.programme}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {scrutin?.statut === 'BROUILLON' && (
                        <button
                          onClick={() => supprimerCandidat(candidat.id)}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  ))}
                  {candidatsReels.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                      Aucun candidat ajouté.
                    </div>
                  )}
                </div>
              </div>

              {/* Vote blanc */}
              {voteBlanc && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Vote size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-600">Vote Blanc</p>
                      <p className="text-gray-400 text-sm">
                        Créé automatiquement — non supprimable (RG03)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}