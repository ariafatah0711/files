<script setup>
import IconButton from "../components/IconButton.vue";
import Checkbox from "../components/Checkbox.vue"
import dragdrop from "../components/dragdrop.vue"
import Breadcrumb from "../components/Breadcrumb.vue";
import { onMounted } from "vue";
import { useFolder } from "../composables/useFolder";
import { useRoute } from "vue-router";
import { ArrowLeftOutlined, FileAddOutlined, FolderAddOutlined, FolderOpenOutlined, CloudUploadOutlined, DeleteOutlined, DownloadOutlined, CopyOutlined } from "@ant-design/icons-vue";
import { downloadFolder, downloadFile, handleDownloadByQuery } from "../utils/Download"
import GlobalSwal from "../utils/GlobalSwal";

const {
  repoName,
  currentPath,
  repoContents,
  fileQueue,
  selectedItems,
  loadRepoContents,
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

const shareDownloadLink = (item) => {
  const path = item.path || ''; // Ensure you have a valid path
  const validRepoName = repoName.value && typeof repoName.value === 'string' ? repoName.value : 'UnknownRepo'; // Fallback if repoName is not valid

  if (typeof path === 'string' && path.trim() !== '') {
    const currentPath = window.location; // Get the current path
    const downloadLink = `${currentPath}?download=${validRepoName}/${path}`; // Append download query to the current path
    console.log('Download link:', downloadLink);

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
    console.error('Path tidak valid:', path);
    Swal.fire({
      icon: 'error',
      title: 'Path tidak valid',
      text: 'Gagal menyalin link karena path tidak valid.',
    });
  }
};

onMounted(() => {
  console.log(repoContents)
  const downloadPath = route.query.download;
  if (downloadPath) {
    // Jika ada query parameter download
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
  <div class="p-4 min-h-screen transition-all duration-300"
      :class="{ 'drag-overlay bg-blue-200 opacity-50': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="handleDrop($event); isDragging = false">

    <h2 class="text-xl font-semibold mb-4">
      <breadcrumb />
    </h2>
    
    <div class="flex flex-wrap gap-4 justify-left pb-4">
      <!-- <IconButton @click="goBack" :icon="ArrowLeftOutlined" label="Back" color="gray" /> -->
      <IconButton @click="addFile" :icon="FileAddOutlined" label="Add File" color="blue" />
      <IconButton @click="addFilePath" :icon="FolderAddOutlined" label="Add File with Path" color="green" />
      <IconButton @click="addFolder" :icon="FolderOpenOutlined" label="Upload Folder" color="yellow" />
      <IconButton @click="uploadAllFiles" :icon="CloudUploadOutlined" label="Upload Semua" color="purple" />
      <IconButton @click="deleteSelected" :icon="DeleteOutlined" label="Hapus Terpilih" color="red" />
    </div>

    <!-- <div v-if="error" class="text-gray-500">{{ error }}</div> -->
    <!-- <div v-else-if="loading" class="text-gray-500">Loading...</div> -->
    <div v-if="error" class="text-red-500 font-semibold">
      ❌ Terjadi Kesalahan: {{ error.message || "Tidak diketahui" }}
    </div>

    <div v-else-if="loading" class="text-gray-500">Loading...</div>

    <div v-else-if="repoContents.length === 0" class="text-gray-500">
      📂 Folder masih kosong. Tambahkan file atau folder untuk memulai.
    </div>

    <ul v-else>
      <IconButton @click="goBack" :icon="ArrowLeftOutlined" label="Back" color="gray" />
      <li v-for="item in repoContents" :key="item.path" class="flex justify-between items-center my-2 p-3 bg-gray-100 rounded shadow-md hover:bg-blue-100 cursor-pointer">
        <Checkbox v-model="isChecked" :value="item.path" @change="toggleSelection(item.path)" class="mr-4"/>
        <template v-if="item.type === 'dir'">
          <router-link :to="`/${repoName}/${item.path}`" class="w-full text-blue-600 text-lg font-medium hover:text-blue-800 truncate">
            📁 {{ item.name }}
          </router-link>
          <button @click="shareDownloadLink({ ...item, path: item.type === 'dir' && !item.path.endsWith('/') ? item.path + '/' : item.path })" 
            class="flex bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 cursor-pointer mr-4">
            <CopyOutlined />
          </button>
          <button  @click="downloadFolder(repoName, item.name)" download class="flex bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 cursor-pointer">
            <DownloadOutlined />
          </button>
        </template>
        <template v-else>
          <a :href="item.html_url" target="_blank" class="w-full text-blue-600 text-lg font-medium hover:text-blue-800 truncate">
            📄 {{ item.name }}
          </a>
          <button @click="shareDownloadLink (item)" class="flex bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 cursor-pointer mr-4">
            <CopyOutlined />
          </button>
          <button @click="downloadFile(item)" class="flex bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 cursor-pointer">
            <DownloadOutlined />
          </button>
        </template>
      </li>
    </ul>

    <h3 class="text-lg font-semibold mt-4">Files/Folders to Upload:</h3>
    <ul>
      <li v-for="(item, index) in fileQueue" :key="index" class="flex justify-between items-center p-2 bg-gray-200 rounded shadow-sm my-1">
        {{ item.path ? item.path.replace(/\/+$/, '') + '/' : '' }}{{ item.file.name }}
        <button @click="fileQueue.splice(index, 1)">❌</button>
      </li>
    </ul>
  </div>
  <!-- </dragdrop> -->
</template>