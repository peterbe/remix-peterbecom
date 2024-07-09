export const API_BASE = process.env.API_BASE || "http://127.0.0.1:8000";
if (!API_BASE) throw new Error("$API_BASE must be set");
