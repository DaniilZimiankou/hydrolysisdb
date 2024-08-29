<template>
    <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-white shadow-lg rounded-lg w-80">
        <div class="p-4">
          <h3 class="text-lg font-semibold">{{ message }}</h3>
          <div class="mt-4 flex justify-end space-x-2">
            <button @click="confirm" class="bg-blue-500 text-white px-4 py-2 rounded">
              Sí
            </button>
            <button @click="cancel" class="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              Cancel·la
            </button>
          </div>
        </div>
      </div>
      <div class="fixed inset-0 bg-black opacity-50" @click="cancel"></div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    isVisible: Boolean,
    message: String,
  });
  
  const emit = defineEmits(['confirm', 'cancel']);
  const confirm = () => emit('confirm');
  const cancel = () => emit('cancel');
  </script>
  
  <style scoped>
  /* Tailwind CSS classes for styling */
  </style>