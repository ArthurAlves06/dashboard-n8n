import { Star, Smile, AlertTriangle, MessageSquare } from 'lucide-react';

export default function MetricCards({ feedbacks, metrics, onFilterSentiment, activeSentimentFilter }) {
  const total = metrics?.total ?? metrics?.total_feedbacks ?? metrics?.totalFeedbacks ?? feedbacks.length;
  const avgStarsValue = metrics?.avg_stars ?? metrics?.average_stars ?? metrics?.averageStars;
  const positiveCount = metrics?.positive_count ?? metrics?.positiveFeedbacks ?? feedbacks.filter((f) => f.sentimento === 'positivo').length;
  const negativeCount = metrics?.negative_count ?? metrics?.negativeFeedbacks ?? feedbacks.filter((f) => f.sentimento === 'negativo').length;
  const satisfactionRate = metrics?.satisfaction_rate ?? metrics?.satisfactionRate ?? (total > 0 ? Math.round((positiveCount / total) * 100) : 0);
  const totalStars = feedbacks.reduce((acc, curr) => acc + curr.estrelas, 0);
  const avgStars = avgStarsValue ?? (total > 0 ? (totalStars / total).toFixed(1) : '0');

  const metricCards = [
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-8">
      {metricCards.map((m) => {
        const Icon = m.icon;
        const isClickable = !!m.action;

        return (
          <div
            key={m.id}
            id={`metric-card-${m.id}`}
            onClick={() => m.action && m.action()}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg active:scale-[0.99]' : ''
            } ${m.active ? 'border-purple-300 bg-purple-50/30 ring-2 ring-purple-600/20 shadow-lg shadow-purple-500/10' : 'border-slate-200 shadow-sm'}`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-300/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{m.title}</span>
                <p className="mt-1 text-[11px] font-medium text-slate-400">{m.sub}</p>
              </div>
              <div className={`rounded-xl border p-2.5 ${m.color.split(' ')[1]} ${m.color.split(' ')[2]}`}>
                <Icon className={`h-4.5 w-4.5 ${m.color.split(' ')[0]}`} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-[2rem] font-black font-sans text-slate-900 tracking-tight">{m.value}</h3>
              <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full w-1/2 rounded-full ${m.active ? 'bg-purple-500' : 'bg-slate-300'} transition-colors`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}