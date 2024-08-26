<template>
  <div>
    <!-- Títol del formulari -->
    <h2>Crear Nou Experiment</h2>
    
    <!-- Formulari per crear un experiment -->
    <form @submit.prevent="submitForm">
      
      <!-- Nom de l'experiment -->
      <div>
        <label for="nom_experiment">Nom de l'experiment:</label>
        <input type="text" v-model="experiment.nom_experiment" required />
      </div>

      <!-- Estat -->
      <div>
        <label for="estat">Estat:</label>
        <select v-model="experiment.estat">
          <option value="pendent">Pendent</option>
          <option value="acabat">Acabat</option>
          <option value="en_process">En procés</option>
        </select>
      </div>

      <!-- Comprovació (no editable) -->
      <div>
        <label for="comprovacio">Comprovació:</label>
        <input type="text" v-model="experiment.comprovacio" readonly />
      </div>

      <!-- Catalitzador -->
      <div>
        <label for="catalitzador">Catalitzador:</label>
        <select v-model="experiment.catalitzador">
          <option value="enzim">Enzim</option>
        </select>
      </div>

      <!-- pH (1.0 - 14.0 amb 1 decimal) -->
      <div>
        <label for="ph">pH (0.0 - 14.0):</label>
        <input type="number" v-model="experiment.ph" step="0.1" min="0" max="14.0" required />
      </div>

      <!-- Temps (en minuts) -->
      <div>
        <label for="temps">Temps (en minuts):</label>
        <input type="number" v-model="experiment.temps" required />
      </div>

      <!-- Temperatura -->
      <div>
        <label for="temperatura">Temperatura (°C):</label>
        <input type="number" v-model="experiment.temperatura" required />
      </div>

      <!-- Nom del Component (Desplegable) -->
      <div>
        <label for="component_id">Nom del Component:</label>
        <select v-model="experiment.componentID" required>
          <option v-for="component in components" :key="component.componentID" :value="component.componentID">
            {{ component.nom }} ({{ component.tipus }})
          </option>
        </select>
      </div>

      <!-- Grams -->
      <div>
        <label for="grams">Grams:</label>
        <input type="number" v-model="experiment.grams" step="0.1" min="0" required />
      </div>

      <!-- Concentració -->
      <div>
        <label for="concentracio">Concentració:</label>
        <input type="number" v-model="experiment.concentracio" step="0.1" min="0" required />
      </div>

      <!-- Botó per crear el grafic -->
      <button type="button" @click="showChartModal = true">Crear Gràfic</button>

      <!-- Botó per crear l'experiment -->
      <button type="submit" :disabled="isSubmitting">Crear Experiment</button>
    </form>

    <!-- Modal per la creació del grafic -->
    <div v-if="showChartModal" class="modal-overlay" @click.self="closeChartModal">
      <div class="modal-content">
        <CreateChart @chartData="handleChartData" />
        <button @click="closeChartModal">Tancar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CreateChart from './ChartCreation.vue';

export default {
  data() {
    return {
      experiment: {
        nom_experiment: '', // Nom de l'experiment
        estat: 'pendent', // Estat inicial pel defecte
        comprovacio: 'no acceptat', // Comprovació inicial pel defecte
        catalitzador: 'enzim', // Catalitzador inicial pel defecte
        ph: 7.0, // Valor inicial pel defecte del pH
        temps: null, // Temps de l'experiment en minuts
        temperatura: null, // Temperatura de l'experiment en °C
        componentID: null, // ID del component seleccionat
        grams: null, // Quantitat de grams
        concentracio: null, // Concentració
        chartData: null // Dades del grafic
      },
      components: [], // Llista de components disponibles
      showChartModal: false, // Obrir/tancar el modal del grafic
      isSubmitting: false // Controla si el formulari esta en proces de presentació
    };
  },
  components: {
    CreateChart // Component per crear grafics (chart)
  },
  methods: {
    // Obtenir la llista de components del endpoint
    async fetchComponents() {
      try {
        const response = await axios.get('http://localhost/apiHydrolysisdb/Components');
        this.components = response.data;
      } catch (error) {
        console.error('Error en obtenir els components:', error);
        alert('No s\'ha pogut obtenir la llista de components.');
      }
    },
    
    // Envia el formulari per crear un nou experiment
    async submitForm() {
      if (this.isSubmitting) return; // Comprovar enviaments duplicats
      this.isSubmitting = true;

      const tokenPrepare = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${tokenPrepare}` }
      };

      // Validació del valor del pH
      if (this.experiment.ph < 1.0 || this.experiment.ph > 14.0) {
        alert("El pH ha de ser entre 1.0 i 14.0");
        this.isSubmitting = false;
        return;
      }

      try {
        //Crear l'experiment
        const response = await axios.post('http://localhost/apiHydrolysisdb/CreateExperiment', this.experiment, config);
        this.experiment.id = response.data.id; // Agafarar l'ID de l'experiment

        //Desar les dades del grafic (si hi ha)
        // if (this.experiment.chartData) {
        //   const chartPayload = {
        //     experimentID: this.experiment.id,
        //     ...this.experiment.chartData
        //   };
        //   await axios.post('http://localhost/apiHydrolysisdb/SaveChart', chartPayload, config);
        // }

        // Notificar l'usuari i navegar
        alert('Experiment i gràfic desats correctament!');
        this.$router.push('/main'); // *Canviar la direccio

      } catch (error) {
        console.error('Error en crear l\'experiment o desar les dades del gràfic:', error);
        alert('No s\'ha pogut crear l\'experiment o desar les dades del gràfic.');
      } finally {
        this.isSubmitting = false;
      }
    },

    // Tancar el modal del grafic
    closeChartModal() {
      this.showChartModal = false;
    },

    // Manage les dades del gràfic rebudes del component fill
    handleChartData(chartData) {
      this.experiment.chartData = chartData;
      this.closeChartModal(); // Tancar el modal després d'actualitzar les dades
    }
  },
  created() {
    this.fetchComponents(); // Obtenir la llista de components quan es crea el component
  }
};
</script>

<style scoped>
form {
  margin-top: 20px;
}

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