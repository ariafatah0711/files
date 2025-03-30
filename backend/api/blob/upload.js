export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    // ✅ Debug: Log request body
    console.log("Incoming request body:", req.body);

    const body = await req.json(); // 💡 Pastikan ini bisa membaca request body
    console.log("Parsed body:", body);

    const url = body.url; // 💡 Cek apakah URL ditemukan
    if (!url) {
      console.error("❌ Parameter URL tidak ditemukan dalam body!");
      return res.status(400).json({ error: "Parameter URL tidak ditemukan" });
    }

    return res.status(200).json({ url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ error: error.message || "Terjadi kesalahan server" });
  }
}
