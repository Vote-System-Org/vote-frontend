import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { ResultatCandidat } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  resultats: ResultatCandidat[];
  nbAbstentions: number;
}

export default function GraphiqueResultats({ resultats, nbAbstentions }: Props) {
  const candidatsReels = resultats.filter(r => !r.est_vote_blanc);
  const voteBlanc      = resultats.find(r => r.est_vote_blanc);

  const couleurs = [
    '#1B2689', '#3B5BDB', '#4DABF7', '#74C0FC',
    '#A5D8FF', '#D0EBFF', '#748FFC', '#5C7CFA',
  ];

  const labels = [
    ...candidatsReels.map(c => `${c.nom} ${c.prenom || ''}`),
    ...(voteBlanc && voteBlanc.nb_voix > 0 ? ['Vote blanc'] : []),
    ...(nbAbstentions > 0 ? ['Abstentions'] : []),
  ];

  const data = [
    ...candidatsReels.map(c => c.nb_voix),
    ...(voteBlanc && voteBlanc.nb_voix > 0 ? [voteBlanc.nb_voix] : []),
    ...(nbAbstentions > 0 ? [nbAbstentions] : []),
  ];

  const backgroundColor = [
    ...candidatsReels.map((_, i) => couleurs[i % couleurs.length]),
    ...(voteBlanc && voteBlanc.nb_voix > 0 ? ['#ADB5BD'] : []),
    ...(nbAbstentions > 0 ? ['#DEE2E6'] : []),
  ];

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          font: { size: 12, family: 'Inter, sans-serif' },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const total = data.reduce((a, b) => a + b, 0);
            const pct   = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
            return ` ${context.label} : ${context.parsed} voix (${pct}%)`;
          },
        },
      },
    },
  };

  if (data.every(d => d === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Aucun vote enregistré
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}