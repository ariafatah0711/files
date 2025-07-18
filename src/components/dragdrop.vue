<!-- <script setup>
import { ref } from "vue";

const isDragging = ref(false);
const emit = defineEmits(["drop"]);

function handleDragOver(event) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragging.value = false;
}

function handleDrop(event) {
  event.preventDefault();
  isDragging.value = false;
  emit("drop", event); // Emit event biar bisa di-handle di parent
}

async function handleDrop(event) {
  event.preventDefault();

  const items = event.dataTransfer.items;
  const files = event.dataTransfer.files;
  
  if (items) {
    // Pakai items jika tersedia
    const entries = [...items].map(item => item.webkitGetAsEntry()).filter(entry => entry);
    await Promise.all(entries.map(entry => processEntry(entry, "")));
  } else if (files) {
    // Pakai files jika items tidak tersedia
    for (const file of files) {
      fileQueue.value.push({ file, path: "" });
    }
  }
}

// 📌 Proses file dan folder secara rekursif
async function processEntry(entry, parentPath) {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => {
        fileQueue.value.push({
          file,
          path: parentPath,
        });
        resolve();
      });
    });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    return new Promise((resolve) => {
      reader.readEntries(async (entries) => {
        await Promise.all(entries.map(subEntry => processEntry(subEntry, `${parentPath}${entry.name}/`)));
        resolve();
      });
    });
  }
}
</script>

<template>
  <div
    class="relative min-h-screen w-screen"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop="handleDrop"
  >
    <slot></slot>

    <div
      v-if="isDragging"
      class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 flex items-center justify-center z-50"
    >
      <p class="text-white text-lg">Drop file di sini!</p>
    </div>
  </div>
</template> -->

<script setup>
import { ref } from "vue";

const isDragging = ref(false);
const emit = defineEmits(["drop"]);
const fileQueue = ref([]); // Tambahkan ini supaya file bisa tersimpan

function handleDragOver(event) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragging.value = false;
}

async function handleDrop(event) {
  event.preventDefault();
  isDragging.value = false;

  const items = event.dataTransfer.items;
  const files = event.dataTransfer.files;

  if (items) {
    const entries = [...items].map((item) => item.webkitGetAsEntry()).filter((entry) => entry);
    await Promise.all(entries.map((entry) => processEntry(entry, "")));
  } else if (files) {
    for (const file of files) {
      fileQueue.value.push({ file, path: "" });
    }
  }

  emit("drop", fileQueue.value); // Emit hasil file yang di-drop ke parent
}

// 📌 Proses file dan folder secara rekursif
async function processEntry(entry, parentPath) {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => {
        fileQueue.value.push({
          file,
          path: parentPath,
        });
        resolve();
      });
    });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    return new Promise((resolve) => {
      reader.readEntries(async (entries) => {
        await Promise.all(entries.map((subEntry) => processEntry(subEntry, `${parentPath}${entry.name}/`)));
        resolve();
      });
    });
  }
}
</script>

<template>
  <div
    class="relative min-h-screen w-screen"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop="handleDrop"
  >
    <slot></slot> <!-- Tempat isi kontennya -->

    <div
      v-if="isDragging"
      class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 flex items-center justify-center z-50"
    >
      <p class="text-white text-lg">Drop file di sini!</p>
    </div>
  </div>
</template>
