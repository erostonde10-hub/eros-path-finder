// EROS Path Finder – AI helper endpoint (Vercel serverless function).
// The browser never sees the API key. The AI answers from OUR programme data.
import fs from "fs";
import path from "path";

const MAX_TURNS = 12, MAX_LEN = 1500;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });

  const body = req.body || {};
  const programme = String(body.programme || "").slice(0, 120);
  const subjects = Array.isArray(body.subjects) ? body.subjects.slice(0, 20).map(s => String(s).slice(0, 60)) : [];
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS).map(m => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return res.status(400).json({ error: "Last message must be from the user" });

  // Retrieve facts: the full record for the open programme, a short index of all others.
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "programmes.json"), "utf8"));
  const hit = data.programmes.find(p => p.n === programme);
  const index = data.programmes.map(p => ({ name: p.n, subjects: p.s, tagline: p.t }));
  const facts = (hit ? "FULL RECORD OF THE OPEN PROGRAMME:\n" + JSON.stringify(hit) + "\n\n" : "") +
    "ALL PROGRAMMES IN OUR DATABASE:\n" + JSON.stringify(index);

  const system = `You are EROS, the friendly guidance assistant inside EROS Path Finder, helping A-Level students choose university programmes.
Student's subjects: ${subjects.join(", ") || "not chosen yet"}.
Use ONLY the data below for programme facts. If the data does not contain the answer, say so honestly, give general guidance clearly labelled as general, and tell the student to confirm with the institution. Never invent fees, grades, deadlines or institutions.
Be warm and encouraging, but always give both advantages and disadvantages honestly. Explain simply so the student is not left with questions. Keep answers under 200 words. For big life decisions, suggest talking to a human counsellor.

${facts}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5", max_tokens: 700, system, messages }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: j.error?.message || "AI request failed" });
    const reply = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Could not reach the AI service" });
  }
}
