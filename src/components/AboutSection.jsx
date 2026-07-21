import { BookOpen, Box, Cloud, Code2, Container, ExternalLink, FlaskConical, GitBranch, Globe, MessageCircle, Server, Smartphone, Workflow, Zap } from 'lucide-react';

// Stack de tecnologias usadas no projeto
const TECH_STACK = [
  {
    category: 'Automação & Fluxo',
    color: 'from-orange-500 to-amber-500',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    items: [
      { name: 'n8n', desc: 'Orquestração do workflow de automação', icon: Workflow },
      { name: 'ngrok', desc: 'Tunnel para expor o servidor local', icon: Globe },
      { name: 'WhatsApp', desc: 'Canal de entrada dos feedbacks dos alunos', icon: Smartphone },
    ],
  },
  {
    category: 'Back-end & Infraestrutura',
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    items: [
      { name: 'Node.js', desc: 'Servidor Express que recebe webhooks', icon: Server },
      { name: 'Docker', desc: 'Containerização do ambiente n8n', icon: Container },
      { name: 'Google Colab', desc: 'Prototipagem e testes de análise de dados', icon: FlaskConical },
      { name: 'Express.js', desc: 'API REST para proxy e webhooks', icon: Code2 },
    ],
  },
  {
    category: 'Banco de Dados & Nuvem',
    color: 'from-amber-500 to-yellow-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    items: [
      { name: 'Firebase Firestore', desc: 'Banco NoSQL para persistência dos feedbacks', icon: Cloud },
      { name: 'Firebase Hosting', desc: 'Deploy do front-end em produção', icon: Globe },
      { name: 'Firebase Admin SDK', desc: 'Escrita segura no Firestore pelo servidor', icon: Box },
    ],
  },
  {
    category: 'Front-end',
    color: 'from-purple-500 to-violet-500',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    items: [
      { name: 'React 19', desc: 'Interface do dashboard em SPA', icon: Code2 },
      { name: 'Vite', desc: 'Bundler e servidor de dev', icon: Zap },
      { name: 'Recharts', desc: 'Gráficos interativos de métricas', icon: GitBranch },
      { name: 'Tailwind CSS', desc: 'Estilização utilitária moderna', icon: BookOpen },
    ],
  },
];

// Etapas do fluxo da arquitetura
const ARCH_STEPS = [
  {
    num: '01',
    title: 'Aluno avalia',
    desc: 'O aluno responde ao formulário de feedback via WhatsApp após a aula.',
    color: 'bg-blue-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    num: '02',
    title: 'n8n processa',
    desc: 'O workflow n8n recebe a mensagem, analisa o sentimento com IA e classifica a ação.',
    color: 'bg-orange-500',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  {
    num: '03',
    title: 'Webhook persiste',
    desc: 'O servidor Node.js recebe os dados via webhook e salva imediatamente no Firestore.',
    color: 'bg-emerald-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  {
    num: '04',
    title: 'Dashboard exibe',
    desc: 'O front-end React lê diretamente do Firestore e exibe métricas, gráficos e tabelas em tempo real.',
    color: 'bg-purple-500',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
];

export default function AboutSection({ feedbacks }) {
  const totalFeedbacks = feedbacks.length;
  const totalPositivos = feedbacks.filter((f) => f.sentimento === 'positivo').length;
  const satisfacao = totalFeedbacks > 0 ? Math.round((totalPositivos / totalFeedbacks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Hero do projeto */}
      <div className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-600 to-violet-700 p-8 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.45)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-200 block mb-2">Projeto de Portfólio</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Feedback Monitor <span className="text-purple-300">n8n</span>
          </h2>
          <p className="text-sm text-purple-100 leading-relaxed max-w-2xl">
            Sistema completo de automação para coleta, análise e visualização de feedbacks de alunos via WhatsApp.
            Integra <strong className="text-white">n8n</strong>, <strong className="text-white">Firebase</strong>,{' '}
            <strong className="text-white">Docker</strong> e <strong className="text-white">React</strong> em um pipeline
            end-to-end — do recebimento da mensagem até o dashboard analítico em produção.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
              <span className="text-xl font-black block">{totalFeedbacks}</span>
              <span className="text-[10px] text-purple-200 uppercase tracking-wider">Feedbacks reais</span>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
              <span className="text-xl font-black block">{satisfacao}%</span>
              <span className="text-[10px] text-purple-200 uppercase tracking-wider">Satisfação</span>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
              <span className="text-xl font-black block">100%</span>
              <span className="text-[10px] text-purple-200 uppercase tracking-wider">Automatizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arquitetura — fluxo visual */}
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Como funciona</span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Arquitetura do Pipeline</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARCH_STEPS.map((step) => (
            <div key={step.num}>
              <div className={`rounded-2xl border ${step.border} ${step.bg} p-4 h-full`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-7 h-7 rounded-lg ${step.color} text-white text-[10px] font-black flex items-center justify-center`}>
                    {step.num}
                  </span>
                  <span className={`text-xs font-black ${step.text}`}>{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stack de tecnologias */}
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Stack utilizado</span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Tecnologias do Projeto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TECH_STACK.map((group) => (
            <div key={group.category} className={`rounded-2xl border ${group.border} p-4`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${group.color} text-white text-[10px] font-bold uppercase tracking-wider mb-3`}>
                {group.category}
              </div>
              <div className="space-y-2">
                {group.items.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <div key={tech.name} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg ${group.bg} ${group.text} flex items-center justify-center flex-shrink-0 border ${group.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className={`text-xs font-black ${group.text}`}>{tech.name}</span>
                        <p className="text-[11px] text-slate-500">{tech.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota de privacidade */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 mb-0.5">🔒 Privacidade dos dados</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Todos os números de telefone e nomes completos exibidos neste dashboard são mascarados para proteger a identidade
            dos participantes. Os dados reais são armazenados de forma segura no Firebase Firestore com acesso restrito,
            e este portfólio exibe apenas versões anonimizadas para fins demonstrativos.
          </p>
        </div>
      </div>
    </div>
  );
}
