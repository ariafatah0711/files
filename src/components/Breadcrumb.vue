<!-- <template>
    <nav class="breadcrumb">
      <router-link to="/" class="text-blue-500 hover:underline">Home</router-link>
      <span v-if="pathParts.length"> / </span>
      <router-link
        v-for="(folder, index) in pathParts"
        :key="index"
        :to="generatePath(index)"
        class="text-blue-500 hover:underline"
      >
        {{ folder }}
      </router-link>
    </nav>
</template>
  

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Debugging: Lihat isi params path
console.log("route.params.path:", route.params.path);

// Pastikan path tidak berupa array
const rawPath = computed(() => {
  return Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path || '';
});

// Pisahkan path jadi array
const pathParts = computed(() => {
  return rawPath.value ? rawPath.value.split('/') : [];
});


// Fungsi untuk membuat link berdasarkan index dalam breadcrumb
const generatePath = (index) => {
  const baseRepo = route.params.repo;
  const subPath = pathParts.value.slice(0, index + 1).join('/');
  return `/${baseRepo}/${subPath}`;
};


// Debugging: Cek hasil pathParts
console.log("pathParts:", pathParts.value);
</script> -->

<template>
    <nav class="breadcrumb">
      <router-link :to="`/`" class="text-blue-500 hover:underline">
        /
      </router-link>

      <!-- Nama repo sebagai root -->
      <router-link :to="`/${repoName}`" class="text-blue-500 hover:underline">
        {{ repoName }}
      </router-link>
  
      <template v-if="pathParts.length">
        <span> / </span>
        <template v-for="(folder, index) in pathParts" :key="index">
          <template v-if="index !== pathParts.length - 1">
            <!-- Jika bukan elemen terakhir, tampilkan sebagai link -->
            <router-link :to="generatePath(index)" class="text-blue-500 hover:underline">
              {{ folder }}
            </router-link>
            <span> / </span>
          </template>
          <template v-else>
            <!-- Jika elemen terakhir, tampilkan sebagai teks biasa -->
            <span class="text-gray-600">{{ folder }}</span>
          </template>
        </template>
      </template>
    </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Ambil nama repo dari route params
const repoName = computed(() => route.params.repo || "Home");

// Pastikan path tidak berupa array
const rawPath = computed(() => {
  return Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path || '';
});

// Pisahkan path jadi array
const pathParts = computed(() => {
  return rawPath.value ? rawPath.value.split('/') : [];
});

// Fungsi untuk membuat link berdasarkan index dalam breadcrumb
const generatePath = (index) => {
  const subPath = pathParts.value.slice(0, index + 1).join('/');
  return `/${repoName.value}/${subPath}`;
};

// Debugging
console.log("repoName:", repoName.value);
console.log("pathParts:", pathParts.value);
</script>
