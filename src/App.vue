<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-6">
      <Navbar />
      <router-view class="pt-10 sm:pt-10"></router-view>
    </div>
  </div>
</template>

<script setup>
  import Navbar from "./components/Navbar.vue";
  import { ref, onMounted } from "vue";
  const isVercel = ref(false);
  onMounted(() => {
    if (import.meta.env.BASE_URL === "/") isVercel.value = true;
  });
</script>