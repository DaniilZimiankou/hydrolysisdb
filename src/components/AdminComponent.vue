<template>
  <div>
    <h1>Admin Panel</h1>
    <p>Aquesta és la pàgina d'administració. Només els usuaris amb rol d'administrador poden veure aquest contingut.</p>
    <button @click="goToMain">Back to Main</button>
    <button @click="toggleAllExperiments">All Experiments</button>
    <button @click="togglePendentExperiments">Pendent Experiments</button>
    <button @click="toggleAllUsers">All users</button>

    <!-- Render components depend de l'opció -->
    <MyExperiments v-if="showAllExperiments" :apiUrl="allExperimentsUrl" />
    <PendentExperiment v-if="showPendentExperiment" />
    <AllUsers v-if="showAllUsers" />
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
</style>
