<template>
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="p-4">
          <h3 class="text-lg font-semibold">{{ message }}</h3>
          <div class="mt-4 flex justify-end space-x-2">
            <button @click="confirm" class="bg-white-500 text-white px-4 py-2 rounded">
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
  
  <script>
  export default {
    props: {
      isVisible: {
        type: Boolean,
        required: true
      },
      message: {
        type: String,
        required: true
      }
    },
    methods: {
      confirm() {
        this.$emit('confirm');
      },
      cancel() {
        this.$emit('cancel');
      }
    }
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 90%;
    max-width: 500px;
  }
  </style>