<template>
  <div>
    <!-- <Navbar /> -->
    <Navbar :links="[{ name: 'Notes', path: '/notes/' }, { name: 'Files', path: '/files/' }, { name: 'Info', path: '/blog/files' }]" />
    <router-view class="pt-18 sm:pt-25"></router-view>
  </div>
</template>

<script setup>
  import Navbar from "./components/Navbar.vue";
</script>