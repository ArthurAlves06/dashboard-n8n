const API_BASE = "https://nonebulliently-astomatous-reta.ngrok-free.dev/webhook";

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
  const res = await fetch(`${API_BASE}/dashboard-feedbacks`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Erro ao buscar feedbacks");

  const data = await readJsonResponse(res, 'Erro ao buscar feedbacks');
  return Array.isArray(data) ? data.map(normalizeFeedback) : data;
}

export async function getMetrics() {
  const res = await fetch(`${API_BASE}/dashboard-metrics`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Erro ao buscar métricas");

  return readJsonResponse(res, 'Erro ao buscar métricas');
}