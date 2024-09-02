<template>
  <div class="admin-panel-container">
    <!-- Header Section -->
    <h1 class="admin-title">Admin Panel</h1>
    <p class="admin-description">
      Aquesta és la pàgina d'administració. Només els usuaris amb rol d'administrador poden veure aquest contingut.
    </p>

    <!-- Navigation Buttons -->
    <div class="button-group">
      <button @click="goToMain" class="styled-button back-button">Back to Main</button>
      <button @click="toggleAllExperiments" class="styled-button">All Experiments</button>
      <button @click="togglePendentExperiments" class="styled-button">Pendent Experiments</button>
      <button @click="toggleAllUsers" class="styled-button">All Users</button>
    </div>

    <!-- Render Components Based on Options -->
    <MyExperiments v-if="showAllExperiments" :apiUrl="allExperimentsUrl" class="component-section" />
    <PendentExperiment v-if="showPendentExperiment" class="component-section" />
    <AllUsers v-if="showAllUsers" class="component-section" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MyExperiments from './MyExperiments.vue';
import PendentExperiment from './PendentExperiment.vue';
import AllUsers from './AllUsers.vue';

// decparem router
const router = useRouter();

// variables react
const showAllExperiments = ref(false);
const showPendentExperiment = ref(false);
const showAllUsers = ref(false);
const allExperimentsUrl = 'http://localhost/apiHydrolysisdb/AllExperiments';

// Methods
const goToMain = () => {
  router.push('/main');
};

const toggleAllExperiments = () => {
  showAllExperiments.value = !showAllExperiments.value;
  if (showAllExperiments.value) {
    showPendentExperiment.value = false;
    showAllUsers.value = false;
  }
};

const togglePendentExperiments = () => {
  showPendentExperiment.value = !showPendentExperiment.value;
  if (showPendentExperiment.value) {
    showAllExperiments.value = false;
    showAllUsers.value = false;
  }
};

const toggleAllUsers = () => {
  showAllUsers.value = !showAllUsers.value;
  if (showAllUsers.value) {
    showAllExperiments.value = false;
    showPendentExperiment.value = false;
  }
};
</script>

<style scoped>
/* Admin Panel Container */
.admin-panel-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  text-align: center;
  background-color: #EAF9FF;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Title */
.admin-title {
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #343a40;
}

/* Description */
.admin-description {
  font-size: 1.2em;
  margin-bottom: 30px;
  color: #6c757d;
}

/* Button Group */
.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

/* Styled Buttons */
.styled-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.styled-button:hover {
  background-color: #0056b3;
}

.back-button {
  background-color: #6c757d;
}

.back-button:hover {
  background-color: #5a6268;
}

/* Component Sections */
.component-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .styled-button {
    font-size: 0.9em;
    padding: 8px 15px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

<!-- <style scoped>
h1 {
  color: red;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.notShown {
  display: none;
}
</style> -->
