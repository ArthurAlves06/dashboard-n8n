import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

export default function ChartsSection({ feedbacks }) {
  const dailyMap = {};

  feedbacks.forEach((f) => {
    const date = f.data_envio.substring(0, 10);
    if (!dailyMap[date]) {
      dailyMap[date] = { positivo: 0, neutro: 0, negativo: 0 };
    }
    dailyMap[date][f.sentimento]++;
  });

  const dailyData = Object.entries(dailyMap)
    .map(([date, counts]) => ({
      date,
      positivo: counts.positivo,
      neutro: counts.neutro,
      negativo: counts.negativo,
      total: counts.positivo + counts.neutro + counts.negativo,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div id="chart-daily-volume" className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="mb-4">
          <h4 className="text-base font-black font-sans text-slate-800">Volume Diário & Tendências de Feedback</h4>
          <p className="text-xs text-slate-500 font-medium">Classificação diária de sentimentos recebidos por alunos via WhatsApp</p>
        </div>
        <div className="h-72 w-full">
          {dailyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">Nenhum dado disponível para exibir.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.005} />
                  </linearGradient>
                  <linearGradient id="colorNeutro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.005} />
                  </linearGradient>
                  <linearGradient id="colorNegativo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.005} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} labelStyle={{ fontWeight: 'bold', color: '#1e293b' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569', paddingTop: '10px' }} />
                <Area name="Positivo (Elogios)" type="monotone" dataKey="positivo" stroke="#10b981" fillOpacity={1} fill="url(#colorPositivo)" strokeWidth={2.5} />
                <Area name="Neutro" type="monotone" dataKey="neutro" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNeutro)" strokeWidth={2.5} />
                <Area name="Negativo (Crítico)" type="monotone" dataKey="negativo" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNegativo)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div id="chart-sentiment-stars" className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <h4 className="text-base font-black font-sans text-slate-800">Distribuição de Estrelas</h4>
            <p className="text-xs text-slate-500 font-medium">Soma total de estrelas coletadas nas avaliações</p>
          </div>
          <div className="h-44 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(241, 194, 255, 0.15)' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="quantidade" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {starData.map((entry, index) => {
                    const barColor = entry.stars <= 2 ? '#f43f5e' : entry.stars === 3 ? '#f59e0b' : '#10b981';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Aproveitamento de Opinião</h5>
            <span className="text-xs text-slate-400 font-mono">Percentual</span>
          </div>
          {sentimentData.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-2">Sem feedbacks.</div>
          ) : (
            <div className="flex items-center justify-around">
              <div className="w-1/2 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={22} outerRadius={35} paddingAngle={4} dataKey="value">
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col gap-1 text-xs">
                {sentimentData.map((entry, i) => {
                  const totalVal = feedbacks.length;
                  const pct = totalVal > 0 ? Math.round((entry.value / totalVal) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-slate-600 font-medium font-sans">
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                      <span>
                        {entry.name}: {pct}% ({entry.value})
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
  );
}