<script setup>
import IconButton from "../components/IconButton.vue";
import { onMounted } from "vue";
import { useRepo } from "../composables/useRepo";
import { FolderAddOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { handleDownloadByQuery } from "../utils/Download"
import { getActiveAccount, getActiveAccountIndex, isWriteModeForUser } from "../utils/auth";
import GlobalSwal from "../utils/GlobalSwal";
import Breadcrumb from "../components/Breadcrumb.vue";

const { repos, listRepos, createRepo, deleteRepo, loading, error } = useRepo();
const router = useRouter();
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

function handleCreateRepo() { if (!checkWriteMode()) return; createRepo(); }
function handleDeleteRepo(name) { if (!checkWriteMode()) return; deleteRepo(name); }

onMounted(() => {
  listRepos()
  console.log(repos)
  const downloadPath = route.query.download;
  if (downloadPath) {
    handleDownloadByQuery(downloadPath);
  }
});
</script>

<template>
  <div class="">
    <Breadcrumb />
    <div class="flex flex-wrap gap-4 pb-6">
      <IconButton @click="handleCreateRepo" :icon="FolderAddOutlined" label="Tambah Repository" color="blue" />
    </div>
    <div v-if="error" class="text-red-500 font-semibold">
      ❌ Terjadi Kesalahan: {{ error.message || "Gagal memuat repository." }}
    </div>
    <div v-else-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="repos.length === 0" class="text-gray-500">
      📂 Belum ada repository. Tambahkan repository baru untuk memulai.
    </div>
    <ul v-else class="flex flex-col gap-4">
      <li v-for="repo in repos" :key="repo.id" class="flex items-center gap-4 bg-white rounded-xl shadow p-4 hover:bg-blue-50 transition cursor-pointer border border-gray-100" @click="router.push(`/${repo.name}`)">
        <div class="flex items-center justify-center bg-blue-500 text-white rounded-lg w-10 h-10 font-bold text-base">
          📁
        </div>
        <span class="flex-1 text-blue-700 text-lg font-semibold truncate">
          {{ repo.name }}
        </span>
        <div class="flex items-center gap-2 ml-auto">
          <button class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer" @click.stop="handleDeleteRepo(repo.name)">
            <DeleteOutlined />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>