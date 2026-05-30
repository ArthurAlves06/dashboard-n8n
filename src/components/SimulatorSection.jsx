import { useState } from 'react';
import { defaultReplyTemplates, studentProfiles } from '../data/mockFeedbacks.js';
import { Send, Sparkles, AlertCircle, HelpCircle, Smile, ThumbsDown, Star } from 'lucide-react';

export default function SimulatorSection({ onAddFeedbackSimulated, onTriggerStep, isSimulating }) {
  const [phoneNumber, setPhoneNumber] = useState('5541987654321');
  const [studentName, setStudentName] = useState('Ana Paula Souza');
  const [stars, setStars] = useState(5);
  const [mensagem, setMensagem] = useState('Gostei muito da dinâmica prática de hoje! O professor explicou com muita calma.');
  const [errorText, setErrorText] = useState('');

  const presets = [
    {
      label: 'Elogio (Positivo)',
      stars: 5,
      mensagem: 'Excelente aula! O material prático e os robôs de n8n foram muito divertidos.',
      accent: 'border-emerald-200 hover:bg-emerald-50/70 text-emerald-700 bg-emerald-50/30',
      icon: Smile,
    },
    {
      label: 'Médio (Neutro)',
      stars: 3,
      mensagem: 'A explicação foi razoável, mas o laboratório de docker foi um pouco corrido.',
      accent: 'border-amber-200 hover:bg-amber-50/70 text-amber-700 bg-amber-50/30',
      icon: HelpCircle,
    },
    {
      label: 'Reclamação (Alerta)',
      stars: 1,
      mensagem: 'Péssimo áudio hoje! Não deu para escutar a explicação das rotas e ninguém respondeu no chat.',
      accent: 'border-rose-200 hover:bg-rose-50/70 text-rose-700 bg-rose-50/30',
      icon: ThumbsDown,
    },
  ];

  const handleApplyPreset = (p) => {
    setStars(p.stars);
    setMensagem(p.mensagem);
  };

  const handleSimulate = async () => {
    if (!mensagem.trim()) {
      setErrorText('Por favor, digite uma mensagem de feedback para simular.');
      return;
    }

    setErrorText('');
    const simulatedId = Math.floor(140 + Math.random() * 1000);
    const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const initialInput = {
      id: simulatedId,
      whatsapp_number: phoneNumber,
      whatsapp_name: studentName,
      mensagem,
      estrelas: stars,
      data_envio: dateNow,
    };

    onTriggerStep(1, initialInput, null);

    setTimeout(() => {
      onTriggerStep(2, initialInput, null);
    }, 1000);

    setTimeout(() => {
      onTriggerStep(3, initialInput, null);
    }, 2000);

    setTimeout(async () => {
      try {
        const payload = {
          mensagem,
          estrelasInput: stars,
          whatsapp_name: studentName,
          whatsapp_number: phoneNumber,
        };

        const result = await onAddFeedbackSimulated(payload);
        onTriggerStep(4, initialInput, result);

        setTimeout(() => {
          onTriggerStep(5, initialInput, result);
        }, 1200);
      } catch (err) {
        console.error('Simulation error during process:', err);
        const fbResultFallback = {
          id: simulatedId,
          whatsapp_number: phoneNumber,
          whatsapp_name: studentName,
          mensagem,
          estrelas: stars,
          sentimento: stars >= 4 ? 'positivo' : stars <= 2 ? 'negativo' : 'neutro',
          acao: stars >= 4 ? 'ELOGIO' : stars <= 2 ? 'ALERTA' : 'NEUTRO',
          data_envio: dateNow,
          whatsapp_reply: defaultReplyTemplates[stars >= 4 ? 'positivo' : stars <= 2 ? 'negativo' : 'neutro'](studentName),
        };

        onTriggerStep(4, initialInput, fbResultFallback);
        setTimeout(() => {
          onTriggerStep(5, initialInput, fbResultFallback);
        }, 1000);
      }
    }, 3200);
  };

  return (
    <div id="simulator-section" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <div>
          <h4 className="text-base font-bold font-sans text-slate-800">Simulador de Entrada de WhatsApp</h4>
          <p className="text-xs text-slate-500">Injete mensagens de alunos fictícias e veja o n8n agir em tempo real</p>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs font-semibold text-slate-500 block mb-1.5 font-mono uppercase tracking-wider">Modelos de Feedback Rápidos:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {presets.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isSimulating}
                onClick={() => handleApplyPreset(p)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all duration-150 ${p.accent} ${isSimulating ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Nome do Aluno (Fictício):</label>
            <select
              value={studentName}
              disabled={isSimulating}
              onChange={(e) => {
                setStudentName(e.target.value);
                const num = Object.entries(studentProfiles).find(([, val]) => val === e.target.value)?.[0] || '5541987654321';
                setPhoneNumber(num);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white text-slate-800"
            >
              {Object.entries(studentProfiles).map(([num, name]) => (
                <option key={num} value={name} className="bg-white text-slate-800">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">WhatsApp Telefone (n8n capture):</label>
            <input type="text" disabled value={`+${phoneNumber}`} className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none bg-slate-50 text-slate-400 cursor-not-allowed font-mono" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Selecione as Estrelas:</label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" disabled={isSimulating} onClick={() => setStars(star)} className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${star <= stars ? 'text-amber-500' : 'text-slate-300'}`}>
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
              <span className="text-xs font-mono text-slate-500 ml-2">({stars}/5 estrelas)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Mensagem enviada no WhatsApp:</label>
            <textarea
              value={mensagem}
              disabled={isSimulating}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite o comentário do aluno..."
              rows={4}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white text-slate-800 placeholder-slate-400 resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end mt-3 gap-2">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold text-white shadow-md transition-all cursor-pointer ${isSimulating ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-purple-600/10 hover:shadow-purple-600/20'}`}
            >
              {isSimulating ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping"></span>
                  <span>Simulando...</span>
                </div>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Testar no n8n</span>
                </>
              )}
            </button>
          </div>
          {errorText && <span className="text-[10px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errorText}</span>}
        </div>
      </div>
    </div>
  );
}