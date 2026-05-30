import { useState } from 'react';
import { initialFeedbacksList } from './data/mockFeedbacks.js';
import MetricCards from './components/MetricCards.jsx';
import ChartsSection from './components/ChartsSection.jsx';
import FeedbackTable from './components/FeedbackTable.jsx';
import N8nWorkflowVisualizer from './components/N8nWorkflowVisualizer.jsx';
import SimulatorSection from './components/SimulatorSection.jsx';
import { Network, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacksList);
  const [activeTab, setActiveTab] = useState('simulator');
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simInput, setSimInput] = useState(null);
  const [simResult, setSimResult] = useState(null);

  const handleResetData = () => {
    if (window.confirm('Deseja redefinir os dados para o padrão inicial do MySQL?')) {
      setFeedbacks(initialFeedbacksList);
      setSelectedSentiment(null);
    }
  };

  const handleAddFeedbackSimulated = async (payload) => {
    setIsSimulating(true);
    setSimulationStep(1);
    setSimInput(payload);
    setSimResult(null);

    try {
      const response = await fetch('/api/analyze-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data && data.success) {
        const finalResult = data.analysis;
        setSimResult(finalResult);
        return finalResult;
      }

      throw new Error(data.error || 'Erro na resposta do servidor.');
    } catch (err) {
      console.warn('Backend offline or unavailable, using rule-based local simulation:', err);

      const starsNum = Number(payload.estrelasInput);
      let localSentiment = 'neutro';
      let localAction = 'NEUTRO';

      if (starsNum >= 4) {
        localSentiment = 'positivo';
        localAction = 'ELOGIO';
      } else if (starsNum <= 2) {
        localSentiment = 'negativo';
        localAction = 'ALERTA';
      }

      const textLower = payload.mensagem.toLowerCase();
      if (textLower.includes('ruim') || textLower.includes('péssimo') || textLower.includes('erro') || textLower.includes('difícil')) {
        localSentiment = 'negativo';
        localAction = 'ALERTA';
      }

      const localResult = {
        estrelas: starsNum,
        sentimento: localSentiment,
        acao: localAction,
        reasoning: 'Classificado localmente (Heurísticas do Frontend).',
        whatsapp_reply:
          localSentiment === 'positivo'
            ? `Olá ${payload.whatsapp_name}! Muito obrigado pelo seu feedback positivo sobre a aula. Ficamos muito felizes em saber que você gostou! Seu comentário ajuda nossa equipe de ensino a continuar trazendo os melhores conteúdos. Ótimos estudos! 📚🚀`
            : localSentiment === 'negativo'
              ? `Olá ${payload.whatsapp_name}, sentimos muito que a sua experiência com a aula de hoje não tenha sido a melhor. 💔 Passamos o seu feedback de forma prioritária para o professor e coordenação revisarem o material e abordagem imediatamente.`
              : `Olá ${payload.whatsapp_name}, obrigado por avaliar a aula de hoje. Registramos suas observações e vamos usá-las para aprimorar os próximos módulos. Continue firme nos estudos! 👍`,
        email_sent: localSentiment === 'negativo',
        email_to_professor: localSentiment === 'negativo' ? 'professor.coord@escola.com.br' : null,
        email_subject: localSentiment === 'negativo' ? `🔴 ALERTA DE FEEDBACK NEGATIVO - Aluno: ${payload.whatsapp_name}` : null,
        email_body:
          localSentiment === 'negativo'
            ? `Prezado Professor,\n\nO n8n detectou uma nota baixa (${starsNum}/5) do aluno ${payload.whatsapp_name}.\nMensagem: ${payload.mensagem}`
            : null,
      };

      setSimResult(localResult);
      return localResult;
    }
  };

  const handleTriggerStep = (step, input, result) => {
    setSimulationStep(step);

    if (input) setSimInput(input);
    if (result) setSimResult(result);

    if (step === 5 && result) {
      const finalFeedbackItem = {
        id: input.id || Math.floor(200 + Math.random() * 500),
        whatsapp_number: input.whatsapp_number,
        whatsapp_name: input.whatsapp_name,
        mensagem: input.mensagem,
        estrelas: result.estrelas || input.estrelas || 3,
        sentimento: result.sentimento,
        acao: result.acao,
        data_envio: input.data_envio,
        email_sent: result.email_sent,
        email_to_professor: result.email_to_professor,
        email_subject: result.email_subject,
        email_body: result.email_body,
        whatsapp_reply: result.whatsapp_reply,
      };

      setFeedbacks((prev) => [finalFeedbackItem, ...prev]);
      setIsSimulating(false);
    }
  };

  const handleRemoveFeedback = (id) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 antialiased font-sans">
      <header className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Restaurar banco de dados original"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resetar Banco</span>
            </button>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Workflow Ativo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel de Monitoria</p>
              <h2 className="text-base font-black text-slate-800 tracking-tight">Olá Arthur, bem-vindo de volta!</h2>
            </div>
          </div>
          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-slate-100 sm:border-0">
            <span className="text-[10px] font-bold text-slate-400 block font-mono uppercase tracking-wider">Último Acesso</span>
            <span className="text-xs font-semibold text-purple-600 block mt-0.5 font-sans">Hoje, às 18:02 (há 11 minutos)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
          <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'simulator' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <span className="flex h-2 w-2 relative">
                {isSimulating && activeTab !== 'simulator' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-purple-700' : 'bg-transparent border border-slate-400'}`}></span>
              </span>
              🚀 Testador de Fluxo n8n
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'metrics' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              📈 Métricas & Gráficos
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'database' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              🗃️ Base MySQL ({feedbacks.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo: <span className="font-bold text-slate-800">{activeTab === 'simulator' ? 'Ambiente de Testes do Webhook' : activeTab === 'metrics' ? 'Indicadores & Gráficos Recharts' : 'Banco de Dados MySQL de Feedbacks'}</span>
          </div>
        </div>

        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fade-in">
            <SimulatorSection onAddFeedbackSimulated={handleAddFeedbackSimulated} onTriggerStep={handleTriggerStep} isSimulating={isSimulating} />

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Visualização de Arquitetura do n8n</h3>
                  <p className="text-xs text-slate-500">Mapeamento integrado dos nós de automação e rotas do WhatsApp</p>
                </div>
              </div>
              <div className="text-xs bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg text-purple-700 font-bold">
                Webhook Status: <span className="text-purple-800">PRONTO & ATIVO</span>
              </div>
            </div>

            <div className="w-full">
              <N8nWorkflowVisualizer activeStep={simulationStep} simulationInput={simInput} simulationResult={simResult} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-purple-600 font-black text-xs uppercase tracking-wider mb-1.5 font-mono">01. Webhook Trigger</div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">O n8n captura de forma imediata o JSON com a mensagem de feedback e o contato do aluno assim que enviados por WhatsApp.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-purple-600 font-black text-xs uppercase tracking-wider mb-1.5 font-mono">02. Gravação MySQL</div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Persiste recursivamente o contato, a avaliação por estrelas, o texto e a data na tabela feedbacks.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-purple-600 font-black text-xs uppercase tracking-wider mb-1.5 font-mono">03. Classificação Local</div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Mapeia o sentimento do comentário com regras locais e constrói respostas personalizadas para o WhatsApp.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-purple-600 font-black text-xs uppercase tracking-wider mb-1.5 font-mono">04. Roteamento Ativo</div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Envia desculpas automatizadas ao aluno se o comentário for negativo, e emite avisos de alertas de e-mail urgentes para a coordenação pedagógica.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <MetricCards
              feedbacks={feedbacks}
              onFilterSentiment={(sentiment) => {
                setSelectedSentiment(sentiment);
                setActiveTab('database');
              }}
              activeSentimentFilter={selectedSentiment}
            />
            <ChartsSection feedbacks={feedbacks} />
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            {selectedSentiment && (
              <div className="mb-4 flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                <p>
                  Atualmente filtrando por sentimentos <b>{selectedSentiment.toUpperCase()}</b>. Clique em limpar filtro para ver a tabela MySQL na íntegra.
                </p>
                <button onClick={() => setSelectedSentiment(null)} className="px-2.5 py-1 bg-white border border-purple-200 hover:text-purple-700 hover:border-purple-300 font-bold rounded-lg cursor-pointer">
                  Limpar Filtro
                </button>
              </div>
            )}

            <FeedbackTable feedbacks={feedbacks} onRemoveFeedback={handleRemoveFeedback} selectedSentiment={selectedSentiment} onClearSentiment={() => setSelectedSentiment(null)} />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 pb-12 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
        <p className="font-semibold">© 2026 Feedback Monitor. Todos os direitos reservados.</p>
        <div className="flex gap-4 items-center font-mono uppercase tracking-wider text-[9px] text-slate-400">
          <span className="text-purple-600 font-bold">Automação Ativa</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span>Ambiente do Webhook</span>
        </div>
      </footer>
    </div>
  );
}