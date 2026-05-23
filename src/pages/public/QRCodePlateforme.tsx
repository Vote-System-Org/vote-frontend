import { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, Link2, ExternalLink, Download, Share2 } from 'lucide-react';

const URL_PLATEFORME = 'https://vote-frontend-phi.vercel.app';

export default function QRCodePlateforme() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const telecharger = () => {
    // Créer un canvas temporaire
    const canvas = document.createElement('canvas');
    const size   = 400;
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Trouver le SVG et le convertir
    const svg    = canvasRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData   = new XMLSerializer().serializeToString(svg);
    const svgBlob   = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl    = URL.createObjectURL(svgBlob);
    const img       = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(svgUrl);

      // Télécharger
      const link = document.createElement('a');
      link.download = 'qrcode-votesystem.png';
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = svgUrl;
  };

  const partager = async () => {
    try {
      // Créer canvas pour partage
      const canvas = document.createElement('canvas');
      const size   = 400;
      canvas.width  = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const svg    = canvasRef.current?.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl  = URL.createObjectURL(svgBlob);
      const img     = new Image();

      img.onload = async () => {
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'qrcode-votesystem.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title:   'VoteSystem — QR Code',
              text:    'Scannez ce QR code pour accéder à la plateforme de vote électronique.',
              files:   [file],
            });
          } else {
            // Fallback — copier le lien
            await navigator.clipboard.writeText(URL_PLATEFORME);
            alert('Lien copié ! Collez-le dans WhatsApp.');
          }
        }, 'image/png');
      };
      img.src = svgUrl;
    } catch (e) {
      console.error('Erreur partage:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-2xl mb-6">
          <ShieldCheck className="text-white" size={32} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
          VoteSystem
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Système de Vote Électronique Sécurisé
        </p>

        {/* QR Code */}
        <div ref={canvasRef}
          className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 inline-block">
          <QRCodeSVG
            value={URL_PLATEFORME}
            size={200}
            bgColor="#f9fafb"
            fgColor="#1B2689"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2">
          <Link2 size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-blue-700 text-sm font-mono font-semibold truncate">
            {URL_PLATEFORME}
          </p>
        </div>

        <p className="text-gray-400 text-xs mb-6">
          Scannez ce QR code pour accéder à la plateforme
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button onClick={telecharger}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
            <Download size={16} />
            Télécharger
          </button>
          <button onClick={partager}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
            <Share2 size={16} />
            Partager
          </button>
        </div>

        <a href={URL_PLATEFORME} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-900 hover:underline font-semibold text-sm">
          <ExternalLink size={14} />
          Accéder à la plateforme
        </a>

        {/* Info projet */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-400 text-xs leading-relaxed">
            Projet tutoré 2025-2026 · Licence Génie Logiciel<br />
            <span className="font-semibold text-gray-500">KENMATIO Vicens</span> &
            <span className="font-semibold text-gray-500"> FOUOGUE Gabriela</span><br />
            Encadreur : <span className="font-semibold text-gray-500">Ing KUEDA</span>
          </p>
        </div>
      </div>
    </div>
  );
}