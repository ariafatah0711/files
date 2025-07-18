import JSZip from "jszip";
import { getActiveAccount } from "./auth";
import { ref } from "vue";
import { saveAs } from "file-saver";
// import { fetchRepoContents } from "../composables/api";
// import { fetchRepoContents } from "../composables/api_v1";
import { fetchRepoContents } from "../composables/api.js";
import GlobalSwal from "./GlobalSwal";
const Swal = GlobalSwal;

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

  let loadingAlert;
  const zip = new JSZip();

  try {
    // Tampilkan loading
    loadingAlert = Swal.fire({
      title: "Mengunduh folder...",
      text: "Mohon tunggu, sedang mengambil file dari GitHub.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Fetch semua file di dalam folder
    await fetchAllFiles(repoName, folderPath, zip);

    // Cek apakah ada file dalam ZIP
    if (Object.keys(zip.files).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada file yang bisa diunduh",
        text: "Folder ini tidak memiliki file yang dapat diunduh.",
      });
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
    // Tutup loading
    if (loadingAlert) Swal.close();
  }
}

export async function downloadFile(file) {
  let loadingAlert;

  try {
    // Tampilkan loading
    loadingAlert = Swal.fire({
      title: "Mengunduh...",
      text: "Mohon tunggu, file sedang diunduh.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Tampilkan spinner
      },
    });

    // Mulai proses download
    const response = await fetch(file.download_url);
    if (!response.ok) throw new Error("Gagal mengunduh file");

    const blob = await response.blob();
    saveAs(blob, file.name); // Simpan file dengan nama aslinya

    // Tutup loading & tampilkan pesan sukses
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: `File ${file.name} berhasil diunduh.`,
    });
  } catch (error) {
    console.error("Error downloading file:", error);

    // Tampilkan pesan error
    Swal.fire({
      icon: "error",
      title: "Gagal mengunduh",
      text: "Terjadi kesalahan saat mengunduh file. Coba lagi!",
    });
  } finally {
    // Pastikan loading ditutup jika masih terbuka
    if (loadingAlert) Swal.close();
  }
}

// export const useDownload = () => {
export const handleDownloadByQuery = (downloadPath) => {
  const pathParts = downloadPath.split("/"); // Splitting the path by "/"

  const repoName = pathParts[0]; // First part is the repo name
  const itemPath = pathParts.slice(1).join("/"); // The rest is the file/folder path

  const isFolder = itemPath.endsWith("/"); // Check if it's a folder

  const username = getActiveAccount()?.name;

  if (isFolder) {
    downloadFolder(repoName, itemPath); // Download folder
  } else {
    const rawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/main/${itemPath}`;
    downloadFile({ download_url: rawUrl, name: itemPath }); // Download file
  }
};

// return { handleDownloadByQuery };
// };
