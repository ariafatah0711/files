import { token, username } from "../../config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respon preflight request
  }

  const { repoName, path, fileName, fileContent } = req.body;

  if (req.method === "PUT") {
    if (!repoName || !fileName || !fileContent) {
      return res.status(400).json({ error: "Repo name, file name, dan file content diperlukan" });
    }

    // Cek path file
    const cleanedPath = path ? `${path}/${fileName}` : fileName;
    const url = `https://api.github.com/repos/${username}/${repoName}/contents/${cleanedPath}`;

    let sha = null;

    // Cek apakah file sudah ada
    try {
      const existingFile = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (existingFile.ok) {
        const fileData = await existingFile.json();
        sha = fileData.sha;
      }
    } catch (error) {
      console.warn("File tidak ditemukan, akan dibuat baru.");
    }

    const body = {
      message: `Upload ${fileName}`,
      content: fileContent,
      branch: "main",
      ...(sha && { sha }),
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("Response dari GitHub:", result);

      if (!response.ok) throw new Error(result.message || "Gagal mengupload file");

      return res.status(200).json({ message: `File ${fileName} berhasil diupload` });
    } catch (error) {
      console.error("Error saat upload:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// import { token, username } from "../../config.js";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { repoName, fileName, fileUrl, path } = req.body;

//   if (!repoName || !fileName || !fileUrl) {
//     return res.status(400).json({ error: "Data tidak lengkap" });
//   }

//   try {
//     // 🔹 1. Ambil file dari Vercel Blob
//     console.log("🔹 Mengambil file dari Vercel Blob...");
//     const fileResponse = await fetch(fileUrl);
//     const fileBuffer = await fileResponse.arrayBuffer();
//     const fileBase64 = Buffer.from(fileBuffer).toString("base64");

//     // 🔹 2. Upload ke GitHub API
//     const filePath = path ? `${path}/${fileName}` : fileName;
//     const url = `https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`;

//     // Cek apakah file sudah ada
//     let sha = null;
//     try {
//       const existingFile = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (existingFile.ok) {
//         const fileData = await existingFile.json();
//         sha = fileData.sha;
//       }
//     } catch (error) {
//       console.warn("File tidak ditemukan, akan dibuat baru.");
//     }

//     const body = {
//       message: `Upload ${fileName} dari Vercel Blob`,
//       content: fileBase64, // File dalam format Base64
//       branch: "main",
//       ...(sha && { sha }),
//     };

//     console.log("🔹 Mengupload file ke GitHub...");
//     const response = await fetch(url, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.message || "Gagal upload ke GitHub");

//     console.log("✅ File berhasil diupload ke GitHub:", result);
//     return res.status(200).json({ message: "File berhasil diupload ke GitHub" });
//   } catch (error) {
//     console.error("Error upload ke GitHub:", error);
//     return res.status(500).json({ error: error.message });
//   }
// }
