import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createHash, randomUUID } from 'crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIRESTORE_COLLECTION = 'feedbacks';

let firestoreDb = null;
let firestoreInitChecked = false;

function getFirestoreDb() {
  if (firestoreDb) {
    return firestoreDb;
  }

  if (firestoreInitChecked) {
    return null;
  }

  firestoreInitChecked = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firestore not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to enable persistence.');
    return null;
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  firestoreDb = getFirestore();
  return firestoreDb;
}

function normalizeFeedbackRecord(feedback, source = 'n8n') {
  const nowIso = new Date().toISOString();
  const dataEnvio = String(feedback?.data_envio ?? '').trim() || nowIso.replace('T', ' ').substring(0, 19);
  const whatsappName = feedback?.whatsapp_name ?? feedback?.nome_aluno ?? feedback?.nome ?? 'Sem nome';
  const whatsappNumber = feedback?.whatsapp_number ?? feedback?.numero_aluno ?? feedback?.numero ?? '';
  const mensagem = feedback?.mensagem ?? feedback?.texto ?? feedback?.message ?? '';
  const estrelas = Number.parseInt(feedback?.estrelas ?? feedback?.stars ?? 0, 10) || 0;
  const sentimento = feedback?.sentimento ?? 'neutro';
  const acao = feedback?.acao ?? feedback?.acao_final ?? 'NEUTRO';

  return {
    id: String(feedback?.id ?? buildFeedbackId({ whatsappNumber, dataEnvio, mensagem, estrelas, sentimento, acao })),
    whatsapp_name: whatsappName,
    whatsapp_number: whatsappNumber,
    mensagem,
    estrelas,
    sentimento,
    acao,
    data_envio: dataEnvio,
    whatsapp_reply: feedback?.whatsapp_reply ?? feedback?.mensagem_resposta ?? '',
    email_sent: Boolean(feedback?.email_sent),
    email_to_professor: feedback?.email_to_professor ?? null,
    email_subject: feedback?.email_subject ?? null,
    email_body: feedback?.email_body ?? null,
    source,
    updatedAt: nowIso,
  };
}

function buildFeedbackId(feedback) {
  const rawKey = [
    feedback?.id,
    feedback?.whatsapp_number,
    feedback?.data_envio,
    feedback?.mensagem,
    feedback?.estrelas,
    feedback?.sentimento,
    feedback?.acao,
  ]
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .map((value) => String(value).trim())
    .join('|');

  if (!rawKey) {
    return randomUUID();
  }

  return createHash('sha1').update(rawKey).digest('hex').slice(0, 20);
}

async function saveFeedbacksToFirestore(feedbacks, source = 'n8n') {
  const db = getFirestoreDb();
  if (!db) return;

  const list = Array.isArray(feedbacks) ? feedbacks : [feedbacks];
  if (list.length === 0) return;

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  list.forEach((feedback) => {
    const normalized = normalizeFeedbackRecord(feedback, source);
    const docRef = db.collection(FIRESTORE_COLLECTION).doc(normalized.id);
    batch.set(docRef, { ...normalized, createdAt: now }, { merge: true });
  });

  await batch.commit();
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const N8N_BASE = 'https://nonebulliently-astomatous-reta.ngrok-free.dev/webhook';

  app.use(express.json());

  async function proxyJson(targetPath, res) {
    const response = await fetch(`${N8N_BASE}${targetPath}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar ${targetPath}`);
    }

    const data = await response.json();
    if (targetPath === '/dashboard-feedbacks') {
      saveFeedbacksToFirestore(data, 'dashboard-sync').catch((err) => {
        console.error('Firestore sync error:', err);
      });
    }
    res.json(data);
  }

  app.get('/api/feedbacks', async (_req, res) => {
    try {
      await proxyJson('/dashboard-feedbacks', res);
    } catch (err) {
      console.error('API feedbacks proxy error:', err);
      res.status(500).json({ error: err?.message || 'Erro ao buscar feedbacks' });
    }
  });

  app.get('/api/metrics', async (_req, res) => {
    try {
      await proxyJson('/dashboard-metrics', res);
    } catch (err) {
      console.error('API metrics proxy error:', err);
      res.status(500).json({ error: err?.message || 'Erro ao buscar métricas' });
    }
  });

  app.post('/api/analyze-feedback', async (req, res) => {
    try {
      const payload = req.body ?? {};
      const mensagem = String(payload.mensagem ?? payload.texto ?? payload.message ?? '').trim();
      const estrelasInput = payload.estrelasInput ?? payload.estrelas ?? 3;
      const whatsapp_name = payload.whatsapp_name ?? payload.nome_aluno ?? 'Aluno';
      const whatsapp_number = payload.whatsapp_number ?? payload.numero_aluno ?? 'Recém Recebido';

      let finalStars = parseInt(estrelasInput, 10);
      if (Number.isNaN(finalStars) || finalStars < 1 || finalStars > 5) {
        finalStars = 3;
      }

      const textLower = mensagem.toLowerCase();
      let sentiment = 'neutro';
      let action = 'NEUTRO';
      let messageReasoning = 'Classificado localmente por heurísticas do servidor.';

      if (finalStars >= 4) {
        sentiment = 'positivo';
        action = 'ELOGIO';
      } else if (finalStars <= 2) {
        sentiment = 'negativo';
        action = 'ALERTA';
      }

      const keywordsNegativas = ['ruim', 'péssimo', 'horrível', 'difícil', 'confuso', 'não consegui', 'lento', 'bug', 'cortando', 'direito', 'perdi', 'falta', 'atrapalhou', 'errado', 'fora do ar'];
      const keywordsPositivas = ['excelente', 'ótimo', 'maravilhoso', 'bom demais', 'gostei', 'parabéns', 'didático', 'perfeito', 'amei', 'claro', 'didática'];

      for (const kw of keywordsNegativas) {
        if (textLower.includes(kw)) {
          sentiment = 'negativo';
          action = 'ALERTA';
          messageReasoning = `Classificado localmente com base na palavra-chave "${kw}".`;
          break;
        }
      }

      for (const kw of keywordsPositivas) {
        if (textLower.includes(kw) && sentiment !== 'negativo') {
          sentiment = 'positivo';
          action = 'ELOGIO';
          messageReasoning = `Classificado localmente com base na palavra-chave "${kw}".`;
          break;
        }
      }

      if (messageReasoning === 'Classificado localmente por heurísticas do servidor.') {
        messageReasoning = finalStars >= 4
          ? 'Classificado localmente como positivo pela nota.'
          : finalStars <= 2
            ? 'Classificado localmente como negativo pela nota.'
            : 'Classificado localmente como neutro pela nota.';
      }

      let replyTemplate = '';
      if (sentiment === 'positivo') {
        replyTemplate = `Olá ${whatsapp_name}! Muito obrigado pelo seu feedback positivo sobre a aula. Ficamos muito felizes em saber que você gostou! Seu comentário ajuda nossa equipe de ensino a continuar trazendo os melhores conteúdos. Ótimos estudos! 📚🚀`;
      } else if (sentiment === 'neutro') {
        replyTemplate = `Olá ${whatsapp_name}, obrigado por avaliar a aula de hoje. Registramos suas observações e vamos usá-las para aprimorar os próximos módulos. Continue firme nos estudos! 👍`;
      } else {
        replyTemplate = `Olá ${whatsapp_name}, sentimos muito que a sua experiência com a aula de hoje não tenha sido a melhor. 💔 Passamos o seu feedback de forma prioritária para o professor e coordenação revisarem o material e abordagem imediatamente. Queremos muito te ajudar a aprender o conteúdo, conte conosco! Se quiser compartilhar mais detalhes, pode responder diretamente aqui.`;
      }

      const emailSubject = `🔴 ALERTA DE FEEDBACK NEGATIVO - Aluno: ${whatsapp_name}`;
      const emailBody = `Prezado Professor, \n\nO sistema de automação n8n detectou um feedback crítico em relação à aula de hoje.\n\nDetalhes do Aluno:\n-------------------------\nNome: ${whatsapp_name}\nWhatsApp: Recém Recebido\nData/Hora: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}\n\nAvaliação:\n-------------------------\nNota: ${finalStars} de 5 Estrelas (Sentimento: ${sentiment.toUpperCase()})\n\nMensagem enviada pelo aluno:\n"${mensagem || 'Sem conteúdo de texto (apenas estrelas)'}"\n\nAção automatizada tomada pelo n8n:\n- Disparo deste e-mail de alerta para atuação e contato pedagógico.\n- Envio de mensagem de desculpas e suporte no WhatsApp do aluno.\n\nPor favor, verifique esta situação para apoiar o aluno em suas dificuldades.\n\nAtenciosamente,\nRobô de Automação de Feedbacks (escola_n8n_bot)`;

      await saveFeedbacksToFirestore(
        {
          nome_aluno: whatsapp_name,
          whatsapp_number,
          mensagem,
          estrelas: finalStars,
          sentimento,
          acao,
          data_envio: new Date().toISOString().replace('T', ' ').substring(0, 19),
          whatsapp_reply: replyTemplate,
          email_sent: sentiment === 'negativo',
          email_to_professor: sentiment === 'negativo' ? 'professor.coord@escola.com.br' : null,
          email_subject: sentiment === 'negativo' ? emailSubject : null,
          email_body: sentiment === 'negativo' ? emailBody : null,
        },
        'analyze-feedback',
      ).catch((err) => {
        console.error('Firestore save error:', err);
      });

      res.json({
        success: true,
        analysis: {
          acao_final: action,
          estrelas: finalStars,
          sentimento: sentiment,
          acao: action,
          reasoning: messageReasoning,
          mensagem_resposta: replyTemplate,
          whatsapp_reply: replyTemplate,
          email_sent: sentiment === 'negativo',
          email_to_professor: sentiment === 'negativo' ? 'professor.coord@escola.com.br' : null,
          email_subject: sentiment === 'negativo' ? emailSubject : null,
          email_body: sentiment === 'negativo' ? emailBody : null,
          nome_aluno: whatsapp_name,
          numero_aluno: whatsapp_number,
          whatsapp_name,
          whatsapp_number,
          mensagem,
        },
      });
    } catch (err) {
      console.error('API error details:', err);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();