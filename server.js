import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const { mensagem = '', estrelasInput = 3, whatsapp_name = 'Aluno' } = req.body;

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

      res.json({
        success: true,
        analysis: {
          estrelas: finalStars,
          sentimento: sentiment,
          acao: action,
          reasoning: messageReasoning,
          whatsapp_reply: replyTemplate,
          email_sent: sentiment === 'negativo',
          email_to_professor: sentiment === 'negativo' ? 'professor.coord@escola.com.br' : null,
          email_subject: sentiment === 'negativo' ? emailSubject : null,
          email_body: sentiment === 'negativo' ? emailBody : null,
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