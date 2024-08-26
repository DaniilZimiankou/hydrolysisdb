<template>
  <div>
    <h1>Aplicació Principal</h1>
    <button @click="logout">Tanca Sessió</button>

    <!-- Botons per mostrar/ocultar diferents components -->
    <button @click="toggleCreateExperiment">Crear Experiment</button>
    <button @click="toggleMyExperiments">Els meus Experiments</button>
    <button @click="toggleExperiments">DB d'Experiments</button>
    
    <!-- Botó per accedir al component d'administrador -->
    <button v-if="isAdmin" @click="goToAdmin">Admin Panel</button>

    <!-- Render el component CrearExperiment -->
    <CrearExperiment v-if="showCreateExperiment" @experimentCreated="onExperimentCreated" />

    <!-- Render el component MyExperiments -->
    <MyExperiments v-if="showMyExperiments" />

    <!-- Render el component ExperimentsView -->
    <ExperimentsView v-if="showExperiments" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CrearExperiment from '@/components/CrearExperiment.vue';
import MyExperiments from '@/components/MyExperiments.vue';
import ExperimentsView from '@/components/ExperimentsView.vue';
import axios from 'axios';

// Definim el router per navegar
const router = useRouter();

// Referències per controlar la visibilitat dels components
const showCreateExperiment = ref(false);
const showMyExperiments = ref(false);
const showExperiments = ref(false);
const isAdmin = ref(false); // Aquesta referència determinarà si l'usuari és admin

// Funció per tancar sessió de l'usuari
const logout = () => {
  // Eliminem el token JWT del local storage
  localStorage.removeItem('token');

  // Redirigim l'usuari al login
  router.push('/login');
};

// Funció per obrir/tancar component CrearExperiment
const toggleCreateExperiment = () => {
  showCreateExperiment.value = !showCreateExperiment.value;
  if (showCreateExperiment.value) {
    showMyExperiments.value = false;
    showExperiments.value = false;
  }
};

// Funció per obrir/tancar component MyExperiments
const toggleMyExperiments = () => {
  showMyExperiments.value = !showMyExperiments.value;
  if (showMyExperiments.value) {
    showCreateExperiment.value = false;
    showExperiments.value = false;
  }
};

// Funció per obrir/tancar component ExperimentsView
const toggleExperiments = () => {
  showExperiments.value = !showExperiments.value;
  if (showExperiments.value) {
    showCreateExperiment.value = false;
    showMyExperiments.value = false;
  }
};

// Funció per gestionar pàgina quan es crea un nou experiment
const onExperimentCreated = (newExperiment) => {
  console.log('Nou experiment creat:', newExperiment);
  showCreateExperiment.value = false;
};

// Funció per anar al component d'administració
const goToAdmin = () => {
  router.push('/admin');
};

// Funció per comprovar si l'usuari és admin
const checkAdminRole = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await axios.get('http://localhost/apiHydrolysisdb/check-role', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Accessing response.data directly since axios parses JSON automatically
      const data = response.data;
      isAdmin.value = data.role === 'administrador';
    } catch (error) {
      console.error('Error checking admin role:', error);
      isAdmin.value = false; // Handle the error, default to non-admin
    }
  } else {
    isAdmin.value = false; // No token found, default to non-admin
  }
};

// Quan es carrega el component, comprova si l'usuari és admin
onMounted(() => {
  checkAdminRole();
});
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.notShown {
  display: none;
}
</style>