import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Users, BarChart3, ChevronRight } from 'lucide-react';

export default function PageAccueil() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-white" size={28} />
          <span className="text-white font-bold text-lg">VoteSystem</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/connexion"
            className="text-white text-sm font-medium hover:underline"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="bg-white text-blue-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6">
          <ShieldCheck size={16} />
          Plateforme sécurisée RSA 2048
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-2xl leading-tight">
          Système de Vote Électronique Sécurisé
        </h1>
        <p className="text-blue-200 text-lg mb-10 max-w-xl">
          Organisez vos élections étudiantes en ligne avec des garanties
          d'anonymat, d'intégrité et de transparence.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/inscription"
            className="flex items-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Commencer
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/connexion"
            className="flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20 max-w-5xl mx-auto">

        <div className="bg-white/10 rounded-xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Anonymat Total</h3>
          <p className="text-blue-200 text-sm">
            Aucun lien traçable entre un électeur et son bulletin de vote.
            Architecture garantie par la base de données.
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Éligibilité Contrôlée</h3>
          <p className="text-blue-200 text-sm">
            Chaque électeur ne voit que les scrutins qui le concernent,
            selon sa filière et son niveau.
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Résultats Fiables</h3>
          <p className="text-blue-200 text-sm">
            Résultats vérifiables via hash chain SHA-256.
            Export CSV disponible pour l'administrateur.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-blue-300 text-sm">
        © 2025 VoteSystem — Université · Filière Génie Logiciel
      </div>
    </div>
  );
}