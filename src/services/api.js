import { getFeedbacksFromFirestore } from './firestoreService.js';

const API_BASE = '/api';

function normalizeFeedback(feedback) {
  if (!feedback || typeof feedback !== 'object') return feedback;

  return {
    ...feedback,
    whatsapp_name: feedback.whatsapp_name ?? feedback.nome_aluno ?? feedback.nome ?? 'Sem nome',
    whatsapp_number: feedback.whatsapp_number ?? feedback.numero_aluno ?? feedback.numero ?? '',
    whatsapp_reply: feedback.whatsapp_reply ?? feedback.mensagem_resposta ?? feedback.reply ?? '',
  };
}

async function readJsonResponse(res, errorLabel) {
  const rawText = await res.text();

  if (!rawText.trim()) {
    throw new Error(`${errorLabel}: resposta vazia`);
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error(`${errorLabel}: resposta inválida`);
  }
}

export async function getFeedbacks() {
  try {
    // Em localhost com server.js rodando, usa a API do servidor (que sincroniza com n8n)
    const res = await fetch(`${API_BASE}/feedbacks`, { signal: AbortSignal.timeout(6000) });

    if (res.status === 503) {
      console.warn('Servidor sem dados ainda, buscando do Firestore...');
      return getFeedbacksFromFirestore();
    }

    if (!res.ok) throw new Error(`Servidor retornou ${res.status}`);

    const data = await readJsonResponse(res, 'Erro ao buscar feedbacks');
    return Array.isArray(data) ? data.map(normalizeFeedback) : data;
  } catch (err) {
    // Em produção (Firebase Hosting) o server.js não existe → busca direto do Firestore
    console.warn('API do servidor indisponível, usando Firestore diretamente:', err?.message);
    return getFeedbacksFromFirestore();
  }
}

export async function getMetrics() {
  try {
    const res = await fetch(`${API_BASE}/metrics`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return readJsonResponse(res, 'Erro ao buscar métricas');
  } catch {
    // Em produção sem servidor, métricas não estão disponíveis
    return null;
  }
}