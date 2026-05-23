import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users, Vote, FileText, ShieldCheck,
  LayoutDashboard, LogOut,
  Search, Printer, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface ListeBlancheEntry {
  id:                number;
  matricule:         string;
  nom:               string;
  prenom:            string;
  filiere:           string;
  niveau:            string;
  a_cree_son_compte: boolean;
}

const BASE_URL = 'https://vote-frontend-phi.vercel.app';

export default function QRCodes() {
  const { logout }   = useAuth();
  const navigate     = useNavigate();
  const printRef     = useRef<HTMLDivElement>(null);

  const [entries, setEntries]   = useState<ListeBlancheEntry[]>([]);
  const [filtered, setFiltered] = useState<ListeBlancheEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filiere, setFiliere]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { chargerListe(); }, []);

  useEffect(() => {
    let result = entries;
    if (search) {
      result = result.filter(e =>
        e.matricule.toLowerCase().includes(search.toLowerCase()) ||
        e.nom.toLowerCase().includes(search.toLowerCase()) ||
        e.prenom.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filiere) {
      result = result.filter(e => e.filiere === filiere);
    }
    setFiltered(result);
  }, [search, filiere, entries]);

  const chargerListe = async () => {
    try {
      const response = await api.get('/admin/liste-blanche/');
      const data = response.data.results || response.data;
      setEntries(data);
      setFiltered(data);
    } catch {
      console.error('Erreur chargement liste blanche');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const imprimer = () => {
    window.print();
  };

  const filieres = [...new Set(entries.map(e => e.filiere))].filter(Boolean);

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins' },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs' },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche' },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
    { to: '/admin/qrcodes',       icon: <QrCode size={18} />,          label: 'QR Codes', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 min-h-screen bg-blue-900 text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
            <Link key={link.to} to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                link.active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white text-sm transition-all w-full">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 print:hidden">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
            </div>
          </button>
          <span className="font-bold text-blue-900">QR Codes</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900">
                QR Codes étudiants
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Chaque QR code permet à un étudiant d'accéder directement à la plateforme
              </p>
            </div>
            <button onClick={imprimer}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Printer size={16} />
              Imprimer tout
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par matricule ou nom..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Toutes les filières</option>
                {filieres.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {filtered.length} étudiant(s) affiché(s)
            </p>
          </div>

          {/* Grille QR codes */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                  <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={printRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2"
            >
              {filtered.map((entry) => {
                const url = `${BASE_URL}/connexion?matricule=${entry.matricule}`;
                return (
                  <div key={entry.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow print:shadow-none print:border print:rounded-lg print:p-3">

                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-xl border border-gray-100 mb-3">
                      <QRCodeSVG
                        value={url}
                        size={120}
                        bgColor="#ffffff"
                        fgColor="#1B2689"
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Infos */}
                    <p className="font-bold text-gray-800 text-xs md:text-sm leading-tight">
                      {entry.prenom} {entry.nom}
                    </p>
                    <p className="font-mono text-blue-900 text-xs mt-1 font-semibold">
                      {entry.matricule}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        {entry.filiere}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {entry.niveau}
                      </span>
                    </div>

                    {/* Statut compte */}
                    <div className="mt-2">
                      {entry.a_cree_son_compte ? (
                        <span className="text-green-600 text-xs font-medium">✓ Inscrit</span>
                      ) : (
                        <span className="text-amber-500 text-xs font-medium">⚠ Non inscrit</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <QrCode className="mx-auto mb-3 text-gray-200" size={48} />
                  <p>Aucun étudiant trouvé.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Style impression */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          main, main * { visibility: visible; }
          main { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}