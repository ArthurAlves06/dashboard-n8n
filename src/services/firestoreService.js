import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from './firebaseConfig.JS';

function normalizeFeedback(feedback) {
  if (!feedback || typeof feedback !== 'object') return feedback;
  return {
    ...feedback,
    whatsapp_name: feedback.whatsapp_name ?? feedback.nome_aluno ?? feedback.nome ?? 'Sem nome',
    whatsapp_number: feedback.whatsapp_number ?? feedback.numero_aluno ?? feedback.numero ?? '',
    whatsapp_reply: feedback.whatsapp_reply ?? feedback.mensagem_resposta ?? feedback.reply ?? '',
  };
}

/**
 * Busca feedbacks diretamente do Firestore (client-side).
 * Usado em produção (Firebase Hosting) onde o server.js não está rodando.
 */
export async function getFeedbacksFromFirestore() {
  const q = query(
    collection(db, 'feedbacks'),
    orderBy('data_envio', 'desc'),
    limit(500)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => normalizeFeedback(doc.data()));
}
