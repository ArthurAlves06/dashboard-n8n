import { Star, Smile, AlertTriangle, MessageSquare } from 'lucide-react';

export default function MetricCards({ feedbacks, onFilterSentiment, activeSentimentFilter }) {
  const total = feedbacks.length;
  const totalStars = feedbacks.reduce((acc, curr) => acc + curr.estrelas, 0);
  const avgStars = total > 0 ? (totalStars / total).toFixed(1) : '0';

  const positiveCount = feedbacks.filter((f) => f.sentimento === 'positivo').length;
  const negativeCount = feedbacks.filter((f) => f.sentimento === 'negativo').length;
  const satisfactionRate = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

  const metrics = [
    {
      id: 'total',
      title: 'Total de Avaliações',
      value: total,
      sub: 'Métricas gerais via WhatsApp',
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      action: () => onFilterSentiment(null),
      active: activeSentimentFilter === null,
    },
    {
      id: 'stars',
      title: 'Média de Nota (Estrelas)',
      value: `${avgStars} ★`,
      sub: 'Escala de 1 a 5 estrelas',
      icon: Star,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      action: null,
      active: false,
    },
    {
      id: 'satisfaction',
      title: 'Satisfação Geral',
      value: `${satisfactionRate}%`,
      sub: `${positiveCount} feedbacks positivos`,
      icon: Smile,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      action: () => onFilterSentiment('positivo'),
      active: activeSentimentFilter === 'positivo',
    },
    {
      id: 'alerts',
      title: 'Alertas Ativos (Filtro)',
      value: negativeCount,
      sub: `${negativeCount} e-mails pedagógicos`,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      action: () => onFilterSentiment('negativo'),
      active: activeSentimentFilter === 'negativo',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => {
        const Icon = m.icon;
        const isClickable = !!m.action;

        return (
          <div
            key={m.id}
            id={`metric-card-${m.id}`}
            onClick={() => m.action && m.action()}
            className={`p-5 rounded-2xl border transition-all duration-200 bg-white ${
              isClickable ? 'cursor-pointer hover:border-purple-300 hover:shadow-md hover:scale-[1.01]' : ''
            } ${m.active ? 'ring-2 ring-purple-600 border-purple-300 bg-purple-50/10' : 'shadow-sm border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.title}</span>
              <div className={`p-2 rounded-lg border ${m.color.split(' ')[1]} ${m.color.split(' ')[2]}`}>
                <Icon className={`h-4.5 w-4.5 ${m.color.split(' ')[0]}`} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-sans text-slate-900 tracking-tight">{m.value}</h3>
              <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}