const N8N_BASE = "https://nonebulliently-astomatous-reta.ngrok-free.dev/webhook";

export async function getFeedbacks() {
  const res = await fetch(`${N8N_BASE}/dashboard-feedbacks`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Erro ao buscar feedbacks");
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${N8N_BASE}/dashboard-metrics`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Erro ao buscar métricas");
  return res.json();
}