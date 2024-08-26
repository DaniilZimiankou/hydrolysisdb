<template>
  <div>
    <h1>Aplicació Principal</h1>
    <button @click="logout">Tanca Sessió</button>
    
    <!-- Botons per mostrar/ocultar diferents components -->
    <button @click="toggleCreateExperiment">Crear Experiment</button>
    <button @click="toggleMyExperiments">Els meus Experiments</button>
    <button @click="toggleExperiments">DB d'Experiments</button>
    
    <!-- Render el component CrearExperiment -->
    <CrearExperiment v-if="showCreateExperiment" @experimentCreated="onExperimentCreated" />

    <!-- Render el component MyExperiments -->
    <MyExperiments v-if="showMyExperiments" />

    <!-- Render el component ExperimentsView -->
    <ExperimentsView v-if="showExperiments" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CrearExperiment from '@/components/CrearExperiment.vue';
import MyExperiments from '@/components/MyExperiments.vue';
import ExperimentsView from '@/components/ExperimentsView.vue';

// Definim el router per navegar
const router = useRouter();

// Referencies per controlar la visibilitat dels components
const showCreateExperiment = ref(false);
const showMyExperiments = ref(false);
const showExperiments = ref(false);

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
  // Assegurem que Els meus Experiments i BdD d'Experiments estiguin ocultats si CrearExperiment es mostra
  if (showCreateExperiment.value) {
    showMyExperiments.value = false;
    showExperiments.value = false;
  }
};

//Funció per obrir/tancar component component MyExperiments
const toggleMyExperiments = () => {
  showMyExperiments.value = !showMyExperiments.value;
  // Assegurem que CrearExperiment i BdD d'Experiments estiguin ocultats si Els meus Experiments es mostra
  if (showMyExperiments.value) {
    showCreateExperiment.value = false;
    showExperiments.value = false;
  }
};

//Funció per obrir/tancar component component ExperimentsView
const toggleExperiments = () => {
  showExperiments.value = !showExperiments.value;
  // Assegurem que CrearExperiment i Els meus Experiments estiguin ocultats si BdD d'Experiments es mostra
  if (showExperiments.value) {
    showCreateExperiment.value = false;
    showMyExperiments.value = false;
  }
};

// Funció per gestionar pàgina quan es crea un nou experiment
const onExperimentCreated = (newExperiment) => {
  console.log('Nou experiment creat:', newExperiment);
  // Recordar implementar el codi per creacio del experiment
  showCreateExperiment.value = false; // Tanquem el formulari després de la creació
};
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