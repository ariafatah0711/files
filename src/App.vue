<template>
  <div>
    <!-- <Navbar /> -->
    <Navbar />
    <router-view class="pt-18 sm:pt-25"></router-view>
    <footer v-if="isVercel" class="bg-gray-100 text-gray-800 p-4 mt-auto">
        <a href="https://files-web.vercel.app/#/" class="text-blue-500 hover:text-blue-700">
          <h3 class="text-xs sm:text-sm md:text-base font-semibold">
            Versi yang di-deploy menggunakan GitHub Pages memiliki batasan ukuran file karena meng-upload langsung ke API Vercel. 
            Gunakan versi ini (di Vercel) jika Anda perlu mengunggah file dengan ukuran lebih besar tanpa batasan, 
            karena versi ini mengandalkan API GitHub untuk upload file secara langsung.
          </h3>
        </a>
    </footer>
  </div>
</template>

<script setup>
  import Navbar from "./components/Navbar.vue";

  import { ref, onMounted } from "vue";
  const isVercel = ref(false);

  onMounted(() => {
    if (import.meta.env.BASE_URL === "/files/") isVercel.value = true;
  });
</script>