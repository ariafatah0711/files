import { getActiveAccount } from "../utils/auth";

export const fetchRepos = async () => {
  const token = getActiveAccount()?.api;
  const response = await fetch("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Gagal mengambil repository");
  return response.json();
};

export const createRepoAPI = async (repoName) => {
  const token = getActiveAccount()?.api;
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      private: false,
      description: `Repository ${repoName} created via Vue app`,
    }),
  });

  if (!response.ok) throw new Error("Gagal membuat repository");
  return response.json();
};

export const deleteRepoAPI = async (repoName) => {
  const token = getActiveAccount()?.api;
  const username = getActiveAccount()?.name;
  const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Gagal menghapus repository");
  return;
};

// Repo

export async function fetchRepoContents(repoName, path = "") {
  const token = getActiveAccount()?.api;
  const username = getActiveAccount()?.name;
  const cleanedPath = String(path || "")
    .split(",")
    .join("/");
  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${cleanedPath ? `${cleanedPath}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 404) {
      // Folder/file tidak ada, return kosong tanpa error
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      // Jika object error dari GitHub (misal { message: 'Not Found', ... })
      if (data && data.message === "Not Found") {
        return [];
      }
      // Bukan array, bisa error lain
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching repo contents:", error);
    return [];
  }
}

export async function uploadFile(repoName, path, file) {
  const token = getActiveAccount()?.api;
  const username = getActiveAccount()?.name;
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const fileContent = reader.result.split(",")[1]; // Ambil isi file dalam Base64
      const cleanedPath = path.replace(/\/+$/, "");
      const filePath = cleanedPath ? `${cleanedPath}/${file.name}` : file.name;
      const url = `https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`;
      let sha = null;
      // Cek apakah file sudah ada
      try {
        const existingFile = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (existingFile.ok) {
          const fileData = await existingFile.json();
          sha = fileData.sha;
        }
      } catch (error) {
        // Tidak perlu warning di sini
      }
      const body = {
        message: `Upload ${file.name}`,
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
        if (response.ok) {
          console.log(`Uploaded: ${filePath}`);
          resolve();
        } else {
          // Tampilkan pesan error dari GitHub
          console.error(`Failed to upload ${filePath}:`, result.message || result);
          if (result.message && result.message.includes("No commit found for the ref")) {
            alert(
              "Gagal upload: Branch 'main' belum ada di repo ini. " +
                "Buat file/commit pertama (misal README.md) lewat GitHub web, lalu coba upload lagi."
            );
          } else {
            alert(`Gagal upload: ${result.message || "Unknown error"}`);
          }
          reject(result.message || "Failed to upload");
        }
      } catch (error) {
        console.error(`Error uploading ${filePath}:`, error);
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
}

export async function deleteFileOrFolder(repoName, path) {
  const token = getActiveAccount()?.api;
  const username = getActiveAccount()?.name;
  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!Array.isArray(data)) {
      if (!data.sha) {
        console.error("Cannot find SHA for:", path);
        return;
      }

      await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete ${path}`,
          sha: data.sha,
          branch: "main",
        }),
      });

      console.log(`Deleted: ${path}`);
    } else {
      for (const item of data) {
        await deleteFileOrFolder(repoName, item.path);
      }
    }
  } catch (error) {
    console.error(`Failed to delete ${path}:`, error);
  }
}
