import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle, Download,
  ArrowLeft, Vote, FileText, ShieldCheck, Clock
} from 'lucide-react';
import api from '../../api/axios';
import type { Resultats } from '../../types';

export default function ResultatsScrutin() {
  const { scrutinId }                   = useParams();
  const [resultats, setResultats]       = useState<Resultats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [exporting, setExporting]       = useState(false);

  useEffect(() => {
    chargerResultats();
    // Actualisation toutes les 30 secondes
    const interval = setInterval(chargerResultats, 30000);
    return () => clearInterval(interval);
  }, [scrutinId]);

  const chargerResultats = async () => {
    try {
      const response = await api.get(`/admin/scrutins/${scrutinId}/resultats/`);
      setResultats(response.data.data);
    } catch {
      setError('Erreur lors du chargement des résultats.');
    } finally {
      setLoading(false);
    }
  };

  const exporterCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get(
        `/admin/scrutins/${scrutinId}/resultats/export/`,
        { responseType: 'blob' }
      );
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `resultats_scrutin_${scrutinId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Erreur lors de l\'export CSV.');
    } finally {
      setExporting(false);
    }
  };

  const candidatsReels = resultats?.resultats.filter(r => !r.est_vote_blanc) || [];
  const voteBlanc      = resultats?.resultats.find(r => r.est_vote_blanc);
  const maxVoix        = Math.max(...candidatsReels.map(c => c.nb_voix), 1);

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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin/scrutins"
                className="flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Résultats en temps réel
                </h1>
                {resultats && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <Clock size={14} />
                    Actualisation automatique toutes les 30 secondes
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={exporterCSV}
              disabled={exporting}
              className="flex items-center gap-2 border border-blue-900 text-blue-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              <Download size={16} />
              {exporting ? 'Export...' : 'Exporter CSV'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : resultats ? (
            <div className="space-y-6">

              {/* Stats participation */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Éligibles</p>
                    <Users className="text-blue-900" size={18} />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {resultats.nb_eligibles}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Votants</p>
                    <CheckCircle className="text-green-600" size={18} />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {resultats.nb_votants}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Abstentions</p>
                    <Users className="text-gray-400" size={18} />
                  </div>
                  <p className="text-3xl font-bold text-gray-400">
                    {resultats.nb_abstentions}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Participation</p>
                    <BarChart3 className="text-purple-600" size={18} />
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {resultats.taux_participation}%
                  </p>
                </div>
              </div>

              {/* Résultats candidats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-6">
                  Résultats par candidat
                </h2>
                <div className="space-y-5">
                  {candidatsReels
                    .sort((a, b) => b.nb_voix - a.nb_voix)
                    .map((candidat, index) => (
                      <div key={candidat.candidat_id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            {index === 0 && candidat.nb_voix > 0 && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                1er
                              </span>
                            )}
                            <span className="font-semibold text-gray-800">
                              {candidat.nom} {candidat.prenom || ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-blue-900">
                              {candidat.nb_voix} voix
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({candidat.pourcentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-blue-900' : 'bg-blue-400'
                            }`}
                            style={{
                              width: `${maxVoix > 0 ? (candidat.nb_voix / maxVoix) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Vote blanc */}
                {voteBlanc && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-gray-500">Vote blanc</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-500">
                          {voteBlanc.nb_voix} voix
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({voteBlanc.pourcentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${voteBlanc.pourcentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Abstentions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-gray-400">Abstentions</span>
                  <span className="text-gray-400 font-medium">
                    {resultats.nb_abstentions}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              Aucun résultat disponible.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}