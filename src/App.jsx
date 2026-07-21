import { useEffect, useState } from 'react';
import N8nWorkflowVisualizer from './components/N8nWorkflowVisualizer.jsx';
import MetricCards from './components/MetricCards.jsx';
import ChartsSection from './components/ChartsSection.jsx';
import InsightsSection from './components/InsightsSection.jsx';
import FeedbackTable from './components/FeedbackTable.jsx';
import AboutSection from './components/AboutSection.jsx';
import { Network, CheckCircle2, BarChart3, Database, Sparkles, Info } from 'lucide-react';
import { getFeedbacks, getMetrics } from './services/api.js';

export default function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [lastAccessAt, setLastAccessAt] = useState(null);

  const formatLastAccess = (dateValue) => {
    if (!dateValue) return 'Carregando...';

    const timeLabel = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateValue);

    const elapsedMinutes = Math.max(0, Math.round((Date.now() - dateValue.getTime()) / 60000));
    if (elapsedMinutes < 1) return `Agora mesmo (${timeLabel})`;
    if (elapsedMinutes === 1) return `Há 1 minuto (${timeLabel})`;

    return `Há ${elapsedMinutes} minutos (${timeLabel})`;
  };

  const loadDashboardData = async () => {
    // Usa allSettled para que feedbacks carreguem mesmo se métricas falharem
    const [feedbackResult, metricResult] = await Promise.allSettled([
      getFeedbacks(),
      getMetrics(),
    ]);

    if (feedbackResult.status === 'fulfilled' && Array.isArray(feedbackResult.value)) {
      setFeedbacks(feedbackResult.value);
    } else if (feedbackResult.status === 'rejected') {
      console.error('Erro ao buscar feedbacks:', feedbackResult.reason);
    }

    if (metricResult.status === 'fulfilled' && metricResult.value != null) {
      const metricData = metricResult.value;
      setMetrics(Array.isArray(metricData) ? metricData[0] ?? null : metricData ?? null);
    } else if (metricResult.status === 'rejected') {
      console.warn('Métricas indisponíveis (n8n offline), continuando sem elas.');
    }

    setLastAccessAt(new Date());
  };

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (window.confirm('Deseja recarregar os dados reais do webhook?')) {
      setSelectedSentiment(null);
      loadDashboardData();
    }
  };

  const handleRemoveFeedback = (id) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] text-slate-800 pb-16 antialiased font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                Feedback Monitor
                <span className="text-purple-600 font-mono text-xs px-2 py-0.5 bg-purple-50 rounded border border-purple-200">
                  n8n_v2.4
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">Monitoramento em tempo real de avaliações via WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Workflow Ativo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel de Monitoria</p>
              <h2 className="text-base font-black text-slate-800 tracking-tight">Olá, bem-vindo de volta!</h2>
            </div>
          </div>
          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-slate-100 sm:border-0">
            <span className="text-[10px] font-bold text-slate-400 block font-mono uppercase tracking-wider">Último Acesso</span>
            <span className="text-xs font-semibold text-purple-600 block mt-0.5 font-sans">{formatLastAccess(lastAccessAt)}</span>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
          <div className="flex gap-1.5 rounded-2xl border border-slate-200 bg-white/85 p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                activeTab === 'metrics' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Métricas & Gráficos
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                activeTab === 'insights' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Insights & Resumo
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                activeTab === 'database' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Database className="h-4 w-4" />
              Base de Dados ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                activeTab === 'about' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Info className="h-4 w-4" />
              Sobre o Projeto
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo: <span className="font-bold text-slate-800">{activeTab === 'metrics' ? 'Indicadores & Gráficos Recharts' : activeTab === 'insights' ? 'Resumo executivo e próximos passos' : activeTab === 'database' ? 'Banco de Dados de Feedbacks' : 'Arquitetura, Stack e Portfólio'}</span>
          </div>
        </div>

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Workflow do n8n</h3>
                  <p className="text-xs text-slate-500">Desenho fixo da automação ativa, sem simulação.</p>
                </div>
                <div className="text-xs bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full text-purple-700 font-bold shadow-sm">
                  Fluxo em produção
                </div>
              </div>
              <N8nWorkflowVisualizer />
            </div>

            <MetricCards
              feedbacks={feedbacks}
              metrics={metrics}
              onFilterSentiment={(sentiment) => {
                setSelectedSentiment(sentiment);
                setActiveTab('database');
              }}
              activeSentimentFilter={selectedSentiment}
            />
            <ChartsSection feedbacks={feedbacks} />
          </div>
        )}

        {activeTab === 'insights' && (
          <InsightsSection
            feedbacks={feedbacks}
            metrics={metrics}
            onFilterSentiment={(sentiment) => {
              setSelectedSentiment(sentiment);
              setActiveTab('database');
            }}
          />
        )}

        {activeTab === 'database' && (
          <div>
            {selectedSentiment && (
              <div className="mb-4 flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                <p>
                  Atualmente filtrando por sentimentos <b>{selectedSentiment.toUpperCase()}</b>. Clique em limpar filtro para ver a tabela MySQL na íntegra.
                </p>
                <button onClick={() => setSelectedSentiment(null)} className="px-2.5 py-1 bg-white border border-purple-200 hover:text-purple-700 hover:border-purple-300 font-bold rounded-lg cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:scale-95">
                  Limpar Filtro
                </button>
              </div>
            )}

            <FeedbackTable
              feedbacks={feedbacks}
              onRemoveFeedback={handleRemoveFeedback}
              selectedSentiment={selectedSentiment}
              onClearSentiment={() => setSelectedSentiment(null)}
              onFilterSentiment={(sentiment) => setSelectedSentiment(sentiment)}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <AboutSection feedbacks={feedbacks} />
        )}
      </main>

      <footer className="mx-auto mt-12 w-full border-t border-slate-200 px-4 pb-12 pt-6 text-[11px] text-slate-500 sm:px-6 lg:px-8">
        <p className="text-center font-semibold text-slate-500">
          Copyright © 2026 por <span className="text-purple-600 font-bold">Arthur</span> | Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}