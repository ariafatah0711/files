<script setup>
import { ref, onMounted } from "vue";
import IconButton from "../components/IconButton.vue";
import Checkbox from "../components/Checkbox.vue"
import Breadcrumb from "../components/Breadcrumb.vue";
import { useFolder } from "../composables/useFolder";
import { useRoute } from "vue-router";
import { ArrowLeftOutlined, FileAddOutlined, FolderAddOutlined, FolderOpenOutlined, CloudUploadOutlined, DeleteOutlined, DownloadOutlined, CopyOutlined } from "@ant-design/icons-vue";
import { downloadFolder, downloadFile, handleDownloadByQuery } from "../utils/Download"
import GlobalSwal from "../utils/GlobalSwal";
import { getActiveAccount, getActiveAccountIndex, isWriteModeForUser } from "../utils/auth";

const isDragging = ref(false);
const error = ref(null);
const loading = ref(false);

const {
  repoName,
  currentPath,
  repoContents,
  fileQueue,
  selectedItems,
  loadRepoContents: originalLoadRepoContents,
  goBack,
  addFile,
  addFilePath,
  addFolder,
  uploadAllFiles,
  deleteSelected,
  toggleSelection,
  handleDrop
} = useFolder();
const route = useRoute();
const Swal = GlobalSwal;

function checkWriteMode() {
  const idx = getActiveAccountIndex();
  const acc = getActiveAccount();
  if (!isWriteModeForUser(idx, acc?.password)) {
    Swal.fire("Read Only", "Aktifkan Write Mode untuk melakukan perubahan!", "warning");
    return false;
  }
  return true;
}

function handleAddFile() { if (!checkWriteMode()) return; addFile(); }
function handleAddFilePath() { if (!checkWriteMode()) return; addFilePath(); }
function handleAddFolder() { if (!checkWriteMode()) return; addFolder(); }
function handleUploadAllFiles() { if (!checkWriteMode()) return; uploadAllFiles(); }
function handleDeleteSelected() { if (!checkWriteMode()) return; deleteSelected(); }

const shareDownloadLink = (item) => {
  const path = item.path || '';
  const validRepoName = repoName.value && typeof repoName.value === 'string' ? repoName.value : 'UnknownRepo';
  if (typeof path === 'string' && path.trim() !== '') {
    const currentPath = window.location;
    const downloadLink = `${currentPath}?download=${validRepoName}/${path}`;
    navigator.clipboard.writeText(downloadLink)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Link download berhasil disalin!',
          text: 'Link download telah berhasil disalin ke clipboard.',
        });
      })
      .catch((error) => {
        console.error("Gagal menyalin link:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal menyalin link',
          text: 'Gagal menyalin link. Coba lagi!',
        });
      });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Path tidak valid',
      text: 'Gagal menyalin link karena path tidak valid.',
    });
  }
};

// Custom loadRepoContents with error handling
async function loadRepoContents() {
  loading.value = true;
  error.value = null;
  try {
    const result = await originalLoadRepoContents();
    // Jika repoContents kosong, cek apakah error 404
    if (!repoContents.value || repoContents.value.length === 0) {
      error.value = null; // Bukan error fatal, hanya kosong
    }
  } catch (err) {
    if (err.message && err.message.includes("Not Found")) {
      repoContents.value = [];
      error.value = null; // Folder kosong, bukan error fatal
    } else {
      error.value = err;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRepoContents();
  const downloadPath = route.query.download;
  if (downloadPath) {
    handleDownloadByQuery(downloadPath);
  }
});
</script>

<style>
.drag-overlay {
  /* position: fixed; */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  transition: all 0.3s ease-in-out;
}
</style>

<template>
  <div class="">
    <Breadcrumb />
    <div class="flex flex-wrap gap-4 pb-6">
      <IconButton @click="handleAddFile" :icon="FileAddOutlined" label="Add" color="blue" />
      <IconButton @click="handleAddFilePath" :icon="FolderAddOutlined" label="Add File with Path" color="green" />
      <IconButton @click="handleAddFolder" :icon="FolderOpenOutlined" label="Add Folder" color="yellow" />
      <IconButton @click="handleUploadAllFiles" :icon="CloudUploadOutlined" label="Upload" color="purple" />
      <IconButton @click="handleDeleteSelected" :icon="DeleteOutlined" label="Delete" color="red" />
    </div>
    <div v-if="error" class="text-red-500 font-semibold">
      ❌ Terjadi Kesalahan: {{ error.message || error || "Tidak diketahui" }}
    </div>
    <div v-else-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="repoContents.length === 0" class="text-gray-500">
      📂 Folder kosong atau tidak ditemukan. Tambahkan file atau folder untuk memulai.
    </div>
    <ul v-else class="flex flex-col gap-4">
      <IconButton @click="goBack" :icon="ArrowLeftOutlined" label="Back" color="gray" class="w-full" alwaysShowLabel />
      <li v-for="item in repoContents" :key="item.path" class="group flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-gray-100 hover:bg-blue-50 transition cursor-pointer">
        <Checkbox v-model="isChecked" :value="item.path" @change="toggleSelection(item.path)" class="mr-4"/>
        <div class="flex items-center justify-center w-10 h-10">
          <svg v-if="item.type === 'dir'" class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
          <svg v-else class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 012-2h4.586A2 2 0 0112 2.586l3.414 3.414A2 2 0 0116 7.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3z"/></svg>
        </div>
        <template v-if="item.type === 'dir'">
          <router-link :to="`/${repoName}/${item.path}`" class="flex-1 text-blue-700 text-lg font-semibold truncate hover:text-blue-900">
            {{ item.name }}
          </router-link>
          <div class="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
            <button @click.stop="shareDownloadLink({ ...item, path: item.type === 'dir' && !item.path.endsWith('/') ? item.path + '/' : item.path })" 
              class="flex bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer">
              <CopyOutlined />
            </button>
            <button @click.stop="downloadFolder(repoName, item.name)" download class="flex bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer">
              <DownloadOutlined />
            </button>
          </div>
        </template>
        <template v-else>
          <a :href="item.html_url" target="_blank" class="flex-1 text-blue-700 text-lg font-semibold truncate hover:text-blue-900">
            {{ item.name }}
          </a>
          <div class="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
            <button @click.stop="shareDownloadLink(item)" class="flex bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer">
              <CopyOutlined />
            </button>
            <button @click.stop="downloadFile(item)" class="flex bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer">
              <DownloadOutlined />
            </button>
          </div>
        </template>
      </li>
    </ul>
    <h3 class="text-lg font-semibold mt-8 mb-2">Files/Folders to Upload:</h3>
    <ul class="flex flex-col gap-2">
      <li v-for="(item, index) in fileQueue" :key="index" class="flex justify-between items-center p-2 bg-gray-200 rounded shadow-sm my-1">
        {{ item.path ? item.path.replace(/\/+$/, '') + '/' : '' }}{{ item.file.name }}
        <button @click="fileQueue.splice(index, 1)">❌</button>
      </li>
    </ul>
  </div>
</template>