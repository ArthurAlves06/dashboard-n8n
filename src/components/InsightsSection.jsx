import { AlertTriangle, ArrowRight, CalendarDays, Lightbulb, Sparkles, ThumbsUp } from 'lucide-react';

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatDateLabel(dateValue) {
  if (!dateValue || dateValue === 'sem-data') return 'Sem data';

  const parsedDate = new Date(String(dateValue).includes('T') ? dateValue : `${dateValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? String(dateValue).substring(0, 10) : shortDateFormatter.format(parsedDate);
}

function formatDateTimeLabel(dateValue) {
  if (!dateValue) return 'Sem data';

  const normalized = String(dateValue).replace(' ', 'T');
  const parsedDate = new Date(normalized);
  return Number.isNaN(parsedDate.getTime()) ? String(dateValue) : `${shortDateFormatter.format(parsedDate)} às ${parsedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function InsightsSection({ feedbacks, metrics, onFilterSentiment }) {
  const total = metrics?.total ?? metrics?.total_feedbacks ?? metrics?.totalFeedbacks ?? feedbacks.length;
  const avgStarsValue = metrics?.avg_stars ?? metrics?.average_stars ?? metrics?.averageStars;
  const positiveCount = metrics?.positive_count ?? metrics?.positiveFeedbacks ?? feedbacks.filter((f) => f.sentimento === 'positivo').length;
  const negativeCount = metrics?.negative_count ?? metrics?.negativeFeedbacks ?? feedbacks.filter((f) => f.sentimento === 'negativo').length;
  const neutralCount = feedbacks.filter((f) => f.sentimento === 'neutro').length;
  const satisfactionRate = metrics?.satisfaction_rate ?? metrics?.satisfactionRate ?? (total > 0 ? Math.round((positiveCount / total) * 100) : 0);
  const avgStars = avgStarsValue ?? (total > 0 ? (feedbacks.reduce((acc, curr) => acc + (curr.estrelas ?? 0), 0) / total).toFixed(1) : '0.0');

  const dailyMap = {};
  feedbacks.forEach((item) => {
    const date = String(item.data_envio ?? '').substring(0, 10) || 'sem-data';
    if (!dailyMap[date]) {
      dailyMap[date] = { total: 0, positivo: 0, neutro: 0, negativo: 0 };
    }
    const sentimento = item.sentimento ?? 'neutro';
    dailyMap[date].total += 1;
    if (dailyMap[date][sentimento] !== undefined) {
      dailyMap[date][sentimento] += 1;
    }
  });

  const dailyData = Object.entries(dailyMap).map(([date, counts]) => ({ date, ...counts }));
  const peakDay = dailyData.reduce(
    (best, current) => (current.total > best.total ? current : best),
    dailyData[0] ?? { total: 0, date: 'sem-data' },
  );

  const latestFeedback = [...feedbacks].sort((a, b) => String(b.data_envio ?? '').localeCompare(String(a.data_envio ?? '')))[0] ?? null;
  const dominantSentiment = [
    { label: 'Positivo', value: positiveCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Neutro', value: neutralCount, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Negativo', value: negativeCount, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ].sort((a, b) => b.value - a.value)[0];

  const alertRate = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
  const healthTone =
    alertRate >= 20
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : satisfactionRate >= 60
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  const insightMessage =
    alertRate >= 20
      ? 'Há um volume relevante de feedbacks críticos. Vale revisar a resposta automática e checar os pontos de atrito.'
      : satisfactionRate >= 60
        ? 'O fluxo está saudável, com boa concentração de avaliações positivas e pouca pressão operacional.'
        : 'O cenário está equilibrado, mas ainda pede leitura atenta para evitar picos de insatisfação.';

  const recommendations = [
    {
      title: 'Filtrar negativos',
      description: 'Abra a base já filtrada nos registros mais críticos.',
      action: () => onFilterSentiment('negativo'),
      tone: 'border-rose-200 bg-rose-50 text-rose-700',
    },
    {
      title: 'Ver elogios',
      description: 'Confira os alunos com melhor percepção da experiência.',
      action: () => onFilterSentiment('positivo'),
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Abrir base completa',
      description: 'Volte para a tabela para cruzar volume, data e texto.',
      action: () => onFilterSentiment(null),
      tone: 'border-slate-200 bg-slate-50 text-slate-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)] gap-6 xl:gap-7 mb-8 items-stretch">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
              <Sparkles className="h-4 w-4" />
              Insights Executivos
            </div>
            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">Leitura rápida da saúde do fluxo</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Uma visão resumida para entender o que está acontecendo sem abrir a tabela ou os gráficos.</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2 text-right text-xs font-bold shadow-sm ${healthTone}`}>
            <div className="uppercase tracking-[0.18em] opacity-80">Status</div>
            <div className="mt-0.5 text-sm">{alertRate >= 20 ? 'Atenção' : satisfactionRate >= 60 ? 'Saudável' : 'Neutro'}</div>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => onFilterSentiment(null)} className="text-left rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:bg-white cursor-pointer active:scale-95">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total de feedbacks</span>
            <div className="mt-2 text-3xl font-black text-slate-900">{total}</div>
            <p className="mt-1 text-xs text-slate-500">{positiveCount} positivos, {negativeCount} negativos e {neutralCount} neutros.</p>
          </button>

          <button onClick={() => onFilterSentiment('positivo')} className="text-left rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:bg-emerald-50 cursor-pointer active:scale-95">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Satisfação geral</span>
            <div className="mt-2 text-3xl font-black text-emerald-800">{satisfactionRate}%</div>
            <p className="mt-1 text-xs text-emerald-700">Média atual: {avgStars} estrelas.</p>
          </button>

          <button onClick={() => onFilterSentiment('negativo')} className="text-left rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:bg-rose-50 cursor-pointer active:scale-95">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">Alertas críticos</span>
            <div className="mt-2 text-3xl font-black text-rose-800">{negativeCount}</div>
            <p className="mt-1 text-xs text-rose-700">{alertRate}% do volume total.</p>
          </button>

          <div className={`rounded-2xl border p-4 shadow-sm ${dominantSentiment.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">Sentimento dominante</span>
            <div className="mt-2 text-3xl font-black">{dominantSentiment.label}</div>
            <p className="mt-1 text-xs opacity-80">Maior concentração entre os feedbacks recebidos.</p>
          </div>
        </div>

        <div className="relative mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Leitura automática
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{insightMessage}</p>
        </div>

        <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Pico de volume
            </div>
            <div className="mt-2 text-sm font-bold text-slate-800">{peakDay.total > 0 ? `${peakDay.total} em ${formatDateLabel(peakDay.date)}` : 'Sem dados'}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              Média de estrelas
            </div>
            <div className="mt-2 text-sm font-bold text-slate-800">{avgStars} / 5</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Último registro
            </div>
            <div className="mt-2 text-sm font-bold text-slate-800">{latestFeedback ? formatDateTimeLabel(latestFeedback.data_envio) : 'Sem dados'}</div>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-black tracking-tight text-slate-900">Próximas ações</h4>
            <p className="mt-1 text-sm text-slate-500">Escolha um caminho rápido para aprofundar a leitura.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 shadow-sm">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {recommendations.map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer ${item.tone}`}
            >
              <div className="text-sm font-bold">{item.title}</div>
              <p className="mt-1 text-xs leading-5 opacity-80">{item.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Resumo rápido</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• {peakDay.total > 0 ? `O maior pico foi de ${peakDay.total} feedbacks em um único dia.` : 'Ainda não há volume suficiente para destacar um pico.'}</li>
            <li>• {alertRate >= 20 ? 'O nível de alertas pede atenção imediata.' : 'A quantidade de alertas está sob controle.'}</li>
            <li>• {latestFeedback ? `O registro mais recente entrou em ${formatDateTimeLabel(latestFeedback.data_envio)}.` : 'Nenhum registro recente disponível.'}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}