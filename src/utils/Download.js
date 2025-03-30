import JSZip from "jszip";
import { username } from "../config";
import { ref } from "vue";
import { saveAs } from "file-saver";
// import { fetchRepoContents } from "../composables/api";
// import { fetchRepoContents } from "../composables/api_v1";
import { fetchRepoContents } from "../composables/api_v2";

const isDownloading = ref(false);

async function fetchAllFiles(repoName, folderPath, zip, basePath = "") {
  try {
    console.log(`🔍 Mengecek isi folder: ${folderPath}`);
    const files = await fetchRepoContents(repoName, folderPath);

    for (const file of files) {
      const relativePath = `${basePath}${file.name}`;

      if (file.type === "file" && file.download_url) {
        console.log(`📥 Mengunduh file: ${relativePath}`);
        const response = await fetch(file.download_url);
        if (!response.ok) {
          console.error(`❌ Gagal mengunduh ${file.name}: ${response.statusText}`);
          continue; // Skip file yang gagal
        }

        const blob = await response.blob();
        zip.file(relativePath, blob);
      } else if (file.type === "dir") {
        console.log(`📂 Masuk ke subfolder: ${file.path}`);
        await fetchAllFiles(repoName, file.path, zip, `${relativePath}/`);
      }
    }
  } catch (error) {
    console.error(`⚠️ Gagal mengambil isi folder: ${folderPath}`, error);
  }
}

export async function downloadFolder(repoName, folderPath) {
  console.log("📦 Mulai mengunduh folder:", repoName, folderPath);
  isDownloading.value = true;
  const zip = new JSZip();

  try {
    await fetchAllFiles(repoName, folderPath, zip);

    // Jika tidak ada file dalam ZIP, jangan buat file kosong
    if (Object.keys(zip.files).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada file yang bisa diunduh",
        text: "Folder ini tidak memiliki file yang dapat diunduh.",
      });
      isDownloading.value = false;
      return;
    }

    // Generate ZIP dan simpan
    const content = await zip.generateAsync({ type: "blob" });
    console.log("✅ ZIP berhasil dibuat!");
    saveAs(content, `${folderPath}.zip`);

    Swal.fire({
      icon: "success",
      title: "ZIP berhasil dibuat!",
      text: `Folder ${folderPath} telah berhasil diunduh.`,
    });
  } catch (error) {
    console.error("❌ Gagal mengunduh folder:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal mengunduh folder",
      text: "Terjadi kesalahan saat mengunduh folder. Coba lagi!",
    });
  } finally {
    isDownloading.value = false;
  }
}

export async function downloadFile(file) {
  try {
    const response = await fetch(file.download_url);
    if (!response.ok) throw new Error("Gagal mengunduh file");

    const blob = await response.blob();
    saveAs(blob, file.name); // Simpan file dengan nama aslinya

    Swal.fire({
      icon: "success",
      title: "File berhasil diunduh!",
      text: `File ${file.name} berhasil diunduh.`,
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal mengunduh file",
      text: "Terjadi kesalahan saat mengunduh file. Coba lagi!",
    });
  }
}

// export const useDownload = () => {
export const handleDownloadByQuery = (downloadPath) => {
  const pathParts = downloadPath.split("/"); // Splitting the path by "/"

  const repoName = pathParts[0]; // First part is the repo name
  const itemPath = pathParts.slice(1).join("/"); // The rest is the file/folder path

  const isFolder = itemPath.endsWith("/"); // Check if it's a folder

  if (isFolder) {
    downloadFolder(repoName, itemPath); // Download folder
  } else {
    const rawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/main/${itemPath}`;
    downloadFile({ download_url: rawUrl, name: itemPath }); // Download file
  }
};

// return { handleDownloadByQuery };
// };
