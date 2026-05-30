import { useState } from 'react';
import { defaultReplyTemplates } from '../data/mockFeedbacks.js';
import { Search, FileDown, Eye, Mail, MessageSquare, Star, ArrowUpDown, X, Phone, Calendar, Trash } from 'lucide-react';

export default function FeedbackTable({ feedbacks, onRemoveFeedback, selectedSentiment, onClearSentiment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [sortField, setSortField] = useState('data_envio');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredFeedbacks = feedbacks.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = f.whatsapp_name.toLowerCase().includes(term) || f.whatsapp_number.includes(term) || (f.mensagem && f.mensagem.toLowerCase().includes(term));
    const matchesSentiment = selectedSentiment ? f.sentimento === selectedSentiment : true;
    return matchesSearch && matchesSentiment;
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    const rawA = a[sortField];
    const rawB = b[sortField];

    if (sortField === 'data_envio') {
      return sortOrder === 'desc' ? rawB.localeCompare(rawA) : rawA.localeCompare(rawB);
    }

    if (typeof rawA === 'number' && typeof rawB === 'number') {
      return sortOrder === 'desc' ? rawB - rawA : rawA - rawB;
    }

    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = 'id,whatsapp_number,whatsapp_name,mensagem,estrelas,sentimento,acao,data_envio\n';
    const rows = feedbacks
      .map((f) => {
        const cleanMsg = f.mensagem ? f.mensagem.replace(/"/g, '""').replace(/\n/g, ' ') : '';
        return `${f.id},${f.whatsapp_number},"${f.whatsapp_name}","${cleanMsg}",${f.estrelas},${f.sentimento},${f.acao},"${f.data_envio}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedbacks_historico_n8n_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 self-start">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-base font-black font-sans text-slate-800">Registros do Banco de Dados (feedbacks)</h4>
            <p className="text-xs text-slate-500">Tabela de replicação MySQL integrada ao webhook do WhatsApp</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer">
              <FileDown className="h-3.5 w-3.5" />
              <span>Exportar MySQL CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por telefone, aluno ou mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {selectedSentiment && (
            <div className="flex items-center gap-1.5 text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full font-bold">
              <span>Filtrado por: {selectedSentiment.toUpperCase()}</span>
              <button onClick={onClearSentiment} className="hover:text-purple-950 transition-colors cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold tracking-widest border-b border-slate-200 uppercase">
                <th className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1 select-none">
                    <span>ID</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">WhatsApp / Aluno</th>
                <th className="p-3.5">Avaliação de Texto</th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('estrelas')}>
                  <div className="flex items-center gap-1 select-none">
                    <span>Estrelas</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Sentimento</th>
                <th className="p-3.5">Ação (n8n)</th>
                <th className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('data_envio')}>
                  <div className="flex items-center gap-1 select-none">
                    <span>Data Envio</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-right flex-grow-0 min-w-16">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 bg-slate-50/50">
                    Nenhum feedback encontrado com filtros ativos.
                  </td>
                </tr>
              ) : (
                sortedFeedbacks.map((f) => {
                  const isActive = selectedFeedback?.id === f.id;
                  return (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedFeedback(f)}
                      className={`transition-colors cursor-pointer duration-150 ${isActive ? 'bg-purple-50/60 text-purple-950 font-medium border-l-4 border-purple-600' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="p-3.5 font-mono text-slate-400 font-extrabold">{f.id}</td>
                      <td className="p-3.5">
                        <div>
                          <div className={`font-bold leading-tight ${isActive ? 'text-purple-800' : 'text-slate-800'}`}>{f.whatsapp_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">+{f.whatsapp_number}</div>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-[180px] truncate italic text-slate-600" title={f.mensagem}>
                        {f.mensagem ? `"${f.mensagem}"` : <em className="text-slate-400 font-light">Apenas estrelas</em>}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-0.5 font-black text-amber-500">
                          <span>{f.estrelas}</span>
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${f.sentimento === 'positivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : f.sentimento === 'negativo' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {f.sentimento}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${f.acao === 'ELOGIO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : f.acao === 'ALERTA' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {f.acao}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono whitespace-nowrap">{f.data_envio}</td>
                      <td className="p-3.5 text-right font-semibold" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedFeedback(f)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-purple-600 transition-colors cursor-pointer" title="Visualizar Respostas Executadas">
                            <Eye className="h-4 w-4" />
                          </button>
                          {onRemoveFeedback && (
                            <button onClick={() => onRemoveFeedback(f.id)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Deletar Registro">
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 font-sans leading-relaxed">
          <span className="font-bold text-purple-600 uppercase tracking-wide">Dica:</span>
          <span>Clique em qualquer linha para inspecionar no painel ao lado o e-mail enviado ao professor e a mensagem de resposta que o n8n disparou para o WhatsApp do aluno.</span>
        </div>
      </div>

      <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[500px] flex flex-col justify-between">
        {selectedFeedback ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">ID MySQL: {selectedFeedback.id}</span>
                <h4 className="text-base font-black text-slate-800 font-sans">{selectedFeedback.whatsapp_name}</h4>
              </div>
              <button onClick={() => setSelectedFeedback(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Phone className="h-3.5 w-3.5 text-purple-600" />
                <span className="font-mono">+{selectedFeedback.whatsapp_number}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                <span>Enviado em: {selectedFeedback.data_envio}</span>
              </div>
              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200 mt-1">
                <span className="font-semibold text-slate-500 mr-2">Avaliado com:</span>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: selectedFeedback.estrelas }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  {Array.from({ length: 5 - selectedFeedback.estrelas }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-slate-200" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Mensagem do Aluno:</span>
              <p className="text-xs text-slate-700 italic leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200">
                "{selectedFeedback.mensagem || 'O aluno não enviou mensagem escrita, apenas apertou nas estrelas do menu no WhatsApp.'}"
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-500">Mensagem de Resposta no WhatsApp:</span>
              </div>

              <div className="bg-slate-100 rounded-xl p-4 shadow-sm border border-slate-200 max-w-sm relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="space-y-3 relative z-10">
                  {selectedFeedback.mensagem && (
                    <div className="bg-white border border-slate-200 text-slate-800 text-[11px] p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[85%] font-sans">
                      <p>{selectedFeedback.mensagem}</p>
                      <span className="text-[8px] text-slate-400 text-right block mt-1 font-mono">17:40</span>
                    </div>
                  )}

                  <div className="bg-purple-100/70 text-purple-950 border border-purple-200 text-[11px] p-2.5 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto font-sans">
                    <p>{selectedFeedback.whatsapp_reply || defaultReplyTemplates[selectedFeedback.sentimento](selectedFeedback.whatsapp_name)}</p>
                    <span className="text-[8px] text-purple-700 font-bold block mt-1.5 flex items-center justify-end gap-0.5 font-mono">
                      <span>✓✓ Enviado via n8n</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Mail className={`h-4 w-4 ${selectedFeedback.sentimento === 'negativo' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-500">Fluxo de E-mail de Alerta:</span>
                </div>
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${selectedFeedback.sentimento === 'negativo' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                  {selectedFeedback.sentimento === 'negativo' ? 'ALERTA ATIVO' : 'NÃO REQUISITADO'}
                </span>
              </div>

              {selectedFeedback.sentimento === 'negativo' ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 space-y-1 font-mono text-[9px] text-slate-500 leading-none">
                    <div>
                      <span className="font-semibold text-slate-400">Para:</span> {selectedFeedback.email_to_professor || 'professor.coord@escola.com.br'}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-slate-400">Assunto:</span> {selectedFeedback.email_subject || `🔴 ALERTA DE FEEDBACK NEGATIVO - Aluno: ${selectedFeedback.whatsapp_name}`}
                    </div>
                  </div>
                  <div className="p-3 bg-white font-mono text-[9px] text-slate-600 h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">{selectedFeedback.email_body || 'N/A'}</div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">Sem disparo de e-mail neste registro porque o sentimento foi classificado como positivo ou neutro.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8">
            <Eye className="h-8 w-8 mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Selecione um feedback na tabela para ver os detalhes.</p>
          </div>
        )}
      </div>
    </div>
  );
}