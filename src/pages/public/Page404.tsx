import { Link } from 'react-router-dom';
import { ShieldCheck, Home, ArrowLeft, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Page404() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className={`text-center relative z-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <span className="text-white font-bold text-xl">VoteSystem</span>
        </div>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-white/10 leading-none select-none">
            404
          </h1>
          <div className="relative -mt-12 md:-mt-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/15 rounded-3xl border border-white/20 mb-6">
              <Search className="text-white" size={40} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Page introuvable
          </h2>
          <p className="text-blue-200 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/"
            className="flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg">
            <Home size={16} />
            Retour à l'accueil
          </Link>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/20">
            <ArrowLeft size={16} />
            Page précédente
          </button>
        </div>

        {/* Liens utiles */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-blue-300 text-sm">
          <Link to="/connexion" className="hover:text-white transition-colors">
            Se connecter
          </Link>
          <span className="text-blue-600">·</span>
          <Link to="/inscription" className="hover:text-white transition-colors">
            S'inscrire
          </Link>
          <span className="text-blue-600">·</span>
          <Link to="/verifier-vote" className="hover:text-white transition-colors">
            Vérifier mon vote
          </Link>
        </div>
      </div>
    </div>
  );
}