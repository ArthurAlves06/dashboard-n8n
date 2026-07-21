import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});

const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function parseDateValue(dateValue) {
  if (!dateValue || dateValue === 'sem-data') return null;

  const rawValue = String(dateValue).trim();

  if (rawValue.includes('/')) {
    const [datePart, timePart] = rawValue.split(' ');
    const [day, month, year] = datePart.split('/').map((value) => Number.parseInt(value, 10));
    if (!day || !month || !year) return null;

    const [hours = 0, minutes = 0, seconds = 0] = String(timePart ?? '00:00:00')
      .split(':')
      .map((value) => Number.parseInt(value, 10) || 0);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  const normalized = rawValue.includes('T') ? rawValue : rawValue.replace(' ', 'T');
  const parsedDate = new Date(normalized);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function normalizeDateKey(dateValue) {
  const parsedDate = parseDateValue(dateValue);
  if (parsedDate) {
    return parsedDate.toISOString().substring(0, 10);
  }

  const fallback = String(dateValue ?? '').trim().substring(0, 10);
  return fallback || 'sem-data';
}

function formatDateLabel(dateValue) {
  if (!dateValue || dateValue === 'sem-data') return 'Sem data';
  const parsedDate = parseDateValue(dateValue);
  return parsedDate ? dateFormatter.format(parsedDate) : dateValue;
}

export default function ChartsSection({ feedbacks }) {
  const dailyMap = {};

  feedbacks.forEach((f) => {
    const date = normalizeDateKey(f.data_envio);
    if (!dailyMap[date]) {
      dailyMap[date] = { positivo: 0, neutro: 0, negativo: 0 };
    }
    const sentimento = f.sentimento ?? 'neutro';
    if (dailyMap[date][sentimento] !== undefined) {
      dailyMap[date][sentimento]++;
    }
  });

  const dailyData = Object.entries(dailyMap)
    .map(([date, counts]) => ({
      date,
      label: formatDateLabel(date),
      positivo: counts.positivo,
      neutro: counts.neutro,
      negativo: counts.negativo,
      total: counts.positivo + counts.neutro + counts.negativo,
    }))
    .sort((a, b) => {
      const dateA = parseDateValue(a.date)?.getTime() ?? 0;
      const dateB = parseDateValue(b.date)?.getTime() ?? 0;
      return dateA - dateB;
    });

  const peakDay = dailyData.reduce(
    (best, current) => (current.total > best.total ? current : best),
    dailyData[0] ?? { total: 0, date: 'sem-data' },
  );

  const starData = [1, 2, 3, 4, 5].map((s) => ({
    name: `${s} ★`,
    quantidade: feedbacks.filter((f) => f.estrelas === s).length,
    stars: s,
  }));

  const positiveCount = feedbacks.filter((f) => f.sentimento === 'positivo').length;
  const neutralCount = feedbacks.filter((f) => f.sentimento === 'neutro').length;
  const negativeCount = feedbacks.filter((f) => f.sentimento === 'negativo').length;

  const sentimentData = [
    { name: 'Positivo', value: positiveCount, color: '#10b981' },
    { name: 'Neutro', value: neutralCount, color: '#f59e0b' },
    { name: 'Negativo', value: negativeCount, color: '#f43f5e' },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-6 xl:gap-7 mb-8 items-stretch">
      <div
        id="chart-daily-volume"
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_36%)]" />
        <div className="relative mb-4 flex items-start justify-between gap-4">
          <div>
            <h4 className="text-lg sm:text-xl font-black font-sans tracking-tight text-slate-900">Volume Diário & Tendências de Feedback</h4>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Classificação diária de sentimentos recebidos por alunos via WhatsApp</p>
          </div>
          <div className="hidden sm:block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-[11px] text-slate-500 shadow-sm">
            <div className="font-bold text-slate-700 uppercase tracking-[0.18em]">Pico</div>
            <div className="mt-0.5 text-sm font-semibold text-indigo-700">{peakDay.total > 0 ? `${peakDay.total} em ${formatDateLabel(peakDay.date)}` : 'Sem dados'}</div>
          </div>
        </div>
        <div className="relative h-[22rem] sm:h-[26rem] xl:h-[31rem] w-full">
          {dailyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">Nenhum dado disponível para exibir.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorNeutro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorNegativo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} width={34} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  formatter={(value, name) => {
                    const labels = {
                      positivo: 'Positivos',
                      neutro: 'Neutros',
                      negativo: 'Negativos',
                    };
                    return [value, labels[name] ?? name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    const parsedDate = item?.date ? parseDateValue(item.date) : null;
                    return parsedDate ? fullDateFormatter.format(parsedDate) : label;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569', paddingTop: '14px' }} />
                <Area name="Positivo (Elogios)" type="monotone" dataKey="positivo" stroke="#10b981" fillOpacity={1} fill="url(#colorPositivo)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                <Area name="Neutro" type="monotone" dataKey="neutro" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNeutro)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                <Area name="Negativo (Crítico)" type="monotone" dataKey="negativo" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNegativo)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div id="chart-sentiment-stars" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]">
        <div className="flex h-full flex-col justify-between gap-5">
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-black font-sans tracking-tight text-slate-900">Distribuição de Estrelas</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">Soma total de estrelas coletadas nas avaliações</p>
            </div>
            <div className="h-56 w-full rounded-2xl bg-gradient-to-b from-slate-50 to-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={starData} margin={{ top: 8, right: 6, left: -20, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(241, 194, 255, 0.12)' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="quantidade" radius={[10, 10, 0, 0]} maxBarSize={32}>
                    {starData.map((entry, index) => {
                      const barColor = entry.stars <= 2 ? '#f43f5e' : entry.stars === 3 ? '#f59e0b' : '#10b981';
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] font-mono">Aproveitamento de Opinião</h5>
              <span className="text-[11px] text-slate-400 font-mono">Percentual</span>
            </div>
            {sentimentData.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-2">Sem feedbacks.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 items-center">
                <div className="mx-auto h-28 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={26} outerRadius={44} paddingAngle={5} dataKey="value">
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  {sentimentData.map((entry, i) => {
                    const totalVal = feedbacks.length;
                    const pct = totalVal > 0 ? Math.round((entry.value / totalVal) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2 font-medium text-slate-700 font-sans">
                          <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                          <span>{entry.name}</span>
                        </div>
                        <span className="font-semibold text-slate-500">
                          {pct}% ({entry.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}