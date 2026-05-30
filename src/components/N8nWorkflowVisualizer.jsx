import { Webhook, Database, Mail, Split, Globe, Code } from 'lucide-react';

export default function N8nWorkflowVisualizer({ activeStep = 0, simulationInput = null, simulationResult = null }) {
  const nodeClass = (step) => (activeStep >= step ? 'border-purple-300 shadow-md shadow-purple-100' : 'border-slate-200');

  return (
    <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1.5px,transparent_1.5px),linear-gradient(to_bottom,#f1f5f9_1.5px,transparent_1.5px)] bg-[size:3.5rem_3.5rem] opacity-60"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 font-bold uppercase tracking-wider">VISUALIZAÇÃO DE ARQUITETURA</span>
          <h4 className="text-base font-black font-sans text-slate-900 mt-1">Sua Automação de Produção no n8n</h4>
          <p className="text-xs text-slate-500 font-medium font-sans">Esta é a reprodução exata dos nós de integrações ativos no seu fluxo</p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Fluxograma Ativo no Servidor</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Passo atual: <span className="font-bold text-slate-800">{activeStep || 0}</span>
          </div>
        </div>
      </div>

      {(simulationInput || simulationResult) && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-bold uppercase tracking-wider text-slate-400 mb-1">Entrada</div>
            <div className="text-slate-700 break-words">{simulationInput ? `${simulationInput.whatsapp_name} • ${simulationInput.estrelas ?? 'n/a'} estrelas` : 'Aguardando simulação'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-bold uppercase tracking-wider text-slate-400 mb-1">Resultado</div>
            <div className="text-slate-700 break-words">{simulationResult ? `${simulationResult.sentimento?.toUpperCase()} • ${simulationResult.acao}` : 'Nenhum resultado ainda'}</div>
          </div>
        </div>
      )}

      <div className="relative z-10 overflow-x-auto pb-4 select-none scrollbar-thin">
        <div className="relative h-[290px] w-[1245px] mx-auto">
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <line x1="145" y1="140" x2="180" y2="140" stroke="#7c3aed" strokeWidth="2.5" />
              <line x1="305" y1="140" x2="340" y2="140" stroke="#7c3aed" strokeWidth="2.5" />
              <line x1="465" y1="140" x2="500" y2="140" stroke="#7c3aed" strokeWidth="2.5" />
              <line x1="625" y1="140" x2="660" y2="140" stroke="#7c3aed" strokeWidth="2.5" />
              <line x1="785" y1="140" x2="820" y2="140" stroke="#7c3aed" strokeWidth="2.5" />
              <path d="M 900 140 C 915 140, 925 60, 940 60" stroke="#10b981" strokeWidth="2.5" fill="none" />
              <path d="M 900 140 C 915 140, 925 220, 940 220" stroke="#64748b" strokeWidth="2.5" fill="none" />
              <line x1="1065" y1="60" x2="1100" y2="60" stroke="#10b981" strokeWidth="2.5" />
            </svg>

            <div className="absolute left-[908px] top-[90px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold font-mono px-1 py-0.5 rounded leading-none">true</div>
            <div className="absolute left-[908px] top-[176px] bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-bold font-mono px-1 py-0.5 rounded leading-none">false</div>
          </div>

          <div style={{ left: '20px', top: '104px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(1)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <Webhook className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">Webhook</span>
            </div>
            <div className="text-[9px] font-mono text-pink-600 bg-pink-50 rounded px-1.5 py-0.5 font-bold self-start leading-none uppercase">POST</div>
          </div>

          <div style={{ left: '180px', top: '104px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(2)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Code className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="Code in JavaScript">Code in JS</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 font-bold self-start leading-none uppercase">code (JS)</div>
          </div>

          <div style={{ left: '340px', top: '104px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(3)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="HTTP Request">HTTP Request</span>
            </div>
            <div className="text-[8px] font-mono text-indigo-600 bg-indigo-50 rounded px-1 py-0.5 font-bold self-start leading-none truncate max-w-full">POST: nonebulliently</div>
          </div>

          <div style={{ left: '500px', top: '104px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(4)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Code className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="Code in JavaScript2">Code in JS 2</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 font-bold self-start leading-none uppercase">code (JS)</div>
          </div>

          <div style={{ left: '660px', top: '104px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(5)}`}>
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Database className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-black leading-tight text-slate-800" title="Insert rows in a table">Insert rows</span>
            </div>
            <div className="text-[9px] font-mono text-sky-600 bg-sky-50 rounded px-1.5 py-0.5 font-bold self-start leading-none uppercase">insert DB</div>
          </div>

          <div style={{ left: '820px', top: '110px' }} className={`absolute w-[80px] h-[60px] bg-white border-2 rounded-lg p-1.5 flex flex-col items-center justify-center hover:border-emerald-500 shadow-sm transition-all text-center ${activeStep >= 6 ? 'border-emerald-400' : 'border-emerald-400'}`}>
            <div className="text-emerald-700">
              <Split className="h-5 w-5 mb-0.5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">If</span>
          </div>

          <div style={{ left: '940px', top: '24px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-emerald-300 shadow-sm transition-all text-left border ${nodeClass(7)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="Send an Email">Send Email</span>
            </div>
            <div className="text-[9px] font-mono text-rose-600 bg-rose-50 rounded px-1.5 py-0.5 font-bold self-start leading-none uppercase">send</div>
          </div>

          <div style={{ left: '1100px', top: '24px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-emerald-300 shadow-sm transition-all text-left border ${nodeClass(8)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="HTTP Request 1">http request1</span>
            </div>
            <div className="text-[8px] font-mono text-indigo-600 bg-indigo-50 rounded px-1 py-0.5 font-bold self-start leading-none truncate max-w-full">POST: Port 808...</div>
          </div>

          <div style={{ left: '940px', top: '184px' }} className={`absolute w-[125px] h-[72px] bg-white rounded-xl p-2 px-2.5 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all text-left border ${nodeClass(7)}`}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 truncate" title="HTTP Request 2">http request2</span>
            </div>
            <div className="text-[8px] font-mono text-indigo-600 bg-indigo-50 rounded px-1 py-0.5 font-bold self-start leading-none truncate max-w-full">POST: Port 808...</div>
          </div>
        </div>
      </div>
    </div>
  );
}