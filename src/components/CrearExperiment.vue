<template>
  <div class="experiment-form-container">
    <!-- Form Title -->
    <h2>Crear Nou Experiment</h2>

    <!-- Form to Create an Experiment -->
    <form @submit.prevent="submitForm" class="experiment-form">
      <!-- Experiment Name -->
      <div class="form-group">
        <label for="nom_experiment">Nom de l'experiment:</label>
        <input type="text" v-model="experiment.nom_experiment" required class="styled-input" />
        <p v-if="formErrors.nom_experiment" class="error-message">El nom ha de tenir almenys 3 caràcters.</p>
      </div>

      <!-- Status -->
      <div class="form-group">
        <label for="estat">Estat:</label>
        <select v-model="experiment.estat" class="styled-select">
          <option value="pendent">Pendent</option>
          <option value="acabat">Acabat</option>
          <option value="en_process">En procés</option>
        </select>
      </div>

      <!-- Verification (Read-Only) -->
      <div class="form-group">
        <label for="comprovacio">Comprovació:</label>
        <input type="text" v-model="experiment.comprovacio" readonly class="styled-input" />
      </div>

      <!-- Catalyst -->
      <div class="form-group">
        <label for="catalitzador">Catalitzador:</label>
        <select v-model="experiment.catalitzador" class="styled-select">
          <option value="enzim">Enzim</option>
        </select>
      </div>

      <!-- pH -->
      <div class="form-group">
        <label for="ph">pH (0.0 - 14.0):</label>
        <input type="number" v-model="experiment.ph" step="0.1" min="0" max="14.0" required class="styled-input" />
      </div>

      <!-- Time (in Minutes) -->
      <div class="form-group">
        <label for="temps">Temps (en minuts):</label>
        <input type="number" v-model="experiment.temps" min="0" required class="styled-input" />
      </div>

      <!-- Temperature -->
      <div class="form-group">
        <label for="temperatura">Temperatura (°C):</label>
        <input type="number" v-model="experiment.temperatura" required class="styled-input" />
      </div>

      <!-- Component Name (Dropdown) -->
      <div class="form-group">
        <label for="component_id">Nom del Component:</label>
        <select v-model="experiment.componentID" required class="styled-select">
          <option v-for="component in components" :key="component.componentID" :value="component.componentID">
            {{ component.nom }} ({{ component.tipus }})
          </option>
        </select>
      </div>

      <!-- Grams -->
      <div class="form-group">
        <label for="grams">Grams:</label>
        <input type="number" v-model="experiment.grams" step="0.1" min="0" required class="styled-input" />
      </div>

      <!-- Concentration -->
      <div class="form-group">
        <label for="concentracio">Concentració:</label>
        <input type="number" v-model="experiment.concentracio" step="0.1" min="0" max="100" required class="styled-input" />
      </div>

      <!-- Button to Create Chart -->
      <button type="button" class="styled-button" @click="showChartModal = true">Crear Gràfic</button>

      <!-- Button to Create Experiment -->
      <button type="submit" :disabled="isSubmitting" class="styled-button submit-button">Crear Experiment</button>
    </form>

    <!-- Modal for Chart Creation -->
    <div v-if="showChartModal" class="modal-overlay" @click.self="closeChartModal">
      <div class="modal-content">
        <CreateChart @chartData="handleChartData" />
        <button @click="closeChartModal" class="styled-button">Tancar</button>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
      <div class="modal-content">
        <p>{{ successMessage }}</p>
        <button @click="closeSuccessModal" class="styled-button">Tancar</button>
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
      formErrors: {},
      components: [], // Llista de components disponibles
      showChartModal: false, // Obrir/tancar el modal del grafic
      showSuccessModal: false, // Mostrar/ocultar el modal d'èxit
      successMessage: '', // Missatge d'èxit a mostrar
      isSubmitting: false // Controla si el formulari esta en proces de presentació
    };
  },
  components: {
    CreateChart // Component per crear grafics (chart)
  },
  methods: {
    // Mètode per validar el formulari
    validateForm() {
      this.formErrors = {}; // Neteja errors anteriors

      if (this.experiment.nom_experiment.length < 3) {
        this.formErrors.nom_experiment = true; // Afegeix error si el nom és massa curt
      }

      return Object.keys(this.formErrors).length === 0; // Retorna si no hi ha errors
    },
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
        if (!this.validateForm()) {
          console.error('Validació del formulari fallida:', this.formErrors);
          this.isSubmitting = false; // Ensure isSubmitting is reset
          return; // Evitar l'enviament si la validació falla
        }

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
        this.showSuccessModal = true; // Mostrar el modal d'èxit
        this.successMessage = 'Experiment i gràfic desats correctament!';
        this.clearForm(); // Neteja els camps del formulari

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
    },

    // Tancar el modal d'èxit
    closeSuccessModal() {
      this.showSuccessModal = false;
      this.$router.push('/main'); // Redirecciona després de tancar el modal
    },

    // Neteja els camps del formulari després d'un enviament reeixit
    clearForm() {
      this.experiment = {
        nom_experiment: '',
        estat: 'pendent',
        comprovacio: 'no acceptat',
        catalitzador: 'enzim',
        ph: 7.0,
        temps: null,
        temperatura: null,
        componentID: null,
        grams: null,
        concentracio: null,
        chartData: null
      };
    }
  },
  created() {
    this.fetchComponents(); // Obtenir la llista de components quan es crea el component
  }
};
</script>


<style scoped>
/* Container */
.experiment-form-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f7f9fc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Form Title */
.experiment-form-container h2 {
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Form */
.experiment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.styled-input,
.styled-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.3s;
}

.styled-input:focus,
.styled-select:focus {
  border-color: #4CAF50;
  outline: none;
}

/* Error Message */
.error-message {
  color: red;
  font-size: 0.9rem;
  margin: 5px 0;
}

/* Buttons */
.styled-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 10px;
  align-self: flex-start;
}

.styled-button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.submit-button {
  align-self: flex-end;
  background-color: #007BFF;
}

.submit-button:hover {
  background-color: #0056b3;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

/*OLD ones///////////////////////////////////////////////////////////*/

/* form {
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
} */
</style>