const N8N_BASE = "http://192.168.1.10:5678/webhook";

export async function getFeedbacks() {
  const res = await fetch(`${N8N_BASE}/dashboard-feedbacks`);
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${N8N_BASE}/dashboard-metrics`);
  return res.json();
}   