<template>
  <div class="experiments-container">
    <!-- Header Section -->
    <div class="header-section">
      <h1>Els meus experiments</h1>
    </div>

    <!-- Button to Toggle Filter Options -->
    <button @click="toggleFilterOptions" class="toggle-button">
      {{ showFilters ? 'Tanca filtres' : 'Mostra filtres' }}
    </button>

    <!-- Filter Section -->
    <div v-if="showFilters" class="filters-section">
      <!-- Filter Inputs -->
      <div class="filter-inputs">
        <input v-model="filters.name" placeholder="Filtra per nom" class="styled-input" />
        <input v-model.number="filters.id" type="number" placeholder="Filtra per ID" class="styled-input" />
        <select v-model="filters.component" @change="applyFilters" class="styled-select">
          <option value="">qualsevol component</option>
          <option v-for="component in components" :key="component" :value="component">
            {{ component.nom }}
          </option>
        </select>
        <select v-model="filters.estat" @change="applyFilters" class="styled-select">
          <option value="">qualsevol estat</option>
          <option value="pendent">pendent</option>
          <option value="acabat">acabat</option>
          <option value="en process">en procés</option>
        </select>
        <select v-model="filters.comprovacio" @change="applyFilters" class="styled-select">
          <option value="">qualsevol comprovacio</option>
          <option value="no acceptat">no acceptat</option>
          <option value="acceptat">acceptat</option>
          <option value="denegat">denegat</option>
        </select>
      </div>

      <!-- Sorting Options -->
      <div class="sorting-options">
        <label class="radio-label">
          <input type="radio" v-model="sortOption" value="id" />
          Ordena per ID
        </label>
        <label class="radio-label">
          <input type="radio" v-model="sortOption" value="name" />
          Ordena per nom
        </label>
      </div>
    </div>

    <!-- No Experiments Message -->
    <div v-if="noExperiment" class="no-experiments">
      <h1>No tens experiments</h1>
      <p>Els hi pots crear en l'apartat "Crear Experiment"</p>
    </div>

    <!-- Experiments List -->
    <ul class="experiments-list">
      <li v-for="experiment in sortedAndFilteredExperiments" :key="experiment.experimentID" class="experiment-item">
        <span class="experiment-info">{{ experiment.experimentID }}: {{ experiment.nom_experiment }}</span>
        <button @click="toggleDetails(experiment.experimentID)" class="toggle-button">
          {{ experiment.showDetails ? 'Tanca' : 'Obre' }}
        </button>

        <!-- Experiment Details -->
        <div v-if="experiment.showDetails" class="experiment-details">
          <p>Estat: {{ experiment.estat }}</p>
          <p>Comprovació: {{ experiment.comprovacio }}</p>
          <p>Catalitzador: {{ experiment.catalitzador }}</p>
          <p>pH: {{ experiment.ph }}</p>
          <p>Temps: {{ experiment.temps }} minuts</p>
          <p>Temperatura: {{ experiment.temperatura }} °C</p>
          <p>Concentració: {{ experiment.concentracio }} %</p>
          <p>Tipus: {{ experiment.tipus }}</p>
          <p>Grams: {{ experiment.grams }} g</p>
          <p>Nom: {{ experiment.nom }}</p>

          <!-- Render Chart if Data Exists -->
          <div v-if="experiment.chartData.dates.length > 0" class="chart-container">
            <h3>{{ experiment.chartData.title }}</h3>
            <div :id="'chart-' + experiment.experimentID" style="width: 100%; height: 400px;"></div>
          </div>

          <!-- Edit and Delete Buttons -->
          <button @click="editExperiment(experiment)" :disabled="isAdmin === false && experiment.comprovacio === 'acceptat'" class="styled-button">
            Modifica
          </button>
          <button @click="deleteExperiment(experiment.experimentID)" :disabled="isAdmin === false && experiment.comprovacio === 'acceptat'" class="styled-button" id="eliminaButton">
            Elimina
          </button>
          <p v-if="experiment.comprovacio === 'acceptat'" class="error-message">Aquest experiment està completat i no es pot modificar.</p>
        </div>
      </li>
    </ul>

    <!-- Edit Experiment Modal -->
    <div v-if="editingExperiment" class="modal-overlay" @click.self="closeEditForm">
      <div class="modal-content">
        <h2>Edita l'experiment</h2>
        <form @submit.prevent="updateExperiment" class="edit-form">
          <label>
            Nom:
            <input v-model="editingExperiment.nom_experiment" type="text" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Estat:
            <select v-model="editingExperiment.estat" :disabled="isEditingDisabled" class="styled-select">
              <option value="pendent">pendent</option>
              <option value="acabat">acabat</option>
              <option value="en process">en procés</option>
            </select>
          </label>
          <label>
            Catalitzador:
            <select v-model="editingExperiment.catalitzador" :disabled="isEditingDisabled" class="styled-select">
              <option value="enzim">enzim</option>
            </select>
          </label>
          <label>
            pH:
            <input v-model.number="editingExperiment.ph" type="number" step="0.1" min="0" max="14" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Temps:
            <input v-model.number="editingExperiment.temps" type="number" min="0" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Temperatura:
            <input v-model.number="editingExperiment.temperatura" type="number" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Concentració:
            <input v-model.number="editingExperiment.concentracio" type="number" step="0.1" min="0" max="100" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Grams:
            <input v-model.number="editingExperiment.grams" type="number" min="0" step="0.1" :disabled="isEditingDisabled" class="styled-input" />
          </label>
          <label>
            Component:
            <select v-model="editingExperiment.componentID" :disabled="isEditingDisabled" class="styled-select">
              <option v-for="component in components" :key="component.componentID" :value="component.componentID">
                {{ component.nom }}
              </option>
            </select>
          </label>

          <!-- Error Messages -->
          <div class="form-errors">
            <p v-if="formErrors.componentID" class="error-message">Si us plau, selecciona un component.</p>
            <p v-if="formErrors.nom_experiment" class="error-message">El nom ha de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.ph" class="error-message">Ph ha de ser entre 0.0 i 14.0</p>
            <p v-if="formErrors.temps" class="error-message">Temps no pot ser mes petit o igual a 0</p>
            <p v-if="formErrors.concentracio" class="error-message">Concentracio ha de ser entre 0 i 100</p>
            <p v-if="formErrors.grams" class="error-message">Pes en Grams no pot ser mes petit o igual a 0</p>
          </div>

          <!-- Chart Button and Modal -->
          <button type="button" @click="showChartModal = true" :disabled="isEditingDisabled" class="styled-button">Modifica el gràfic</button>
          <button type="submit" :disabled="isEditingDisabled" class="styled-button submit-button">Desa els canvis</button>
          <button @click="closeEditForm" class="styled-button cancel-button">Cancel·la</button>
        </form>
        
        <!-- Chart Modal -->
        <div v-if="showChartModal" class="modal-overlay" @click.self="closeChartModal">
          <div class="modal-content">
            <CreateChart :chartData="editingExperiment.chartData" @chartData="handleChartData" />
            <button @click="closeChartModal" class="styled-button">Tanca</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CreateChart from './ChartCreation.vue';

/* global google */

export default {
  props: {
    apiUrl: {
      type: String, // Prop type is String
      default: 'http://localhost/apiHydrolysisdb/MyExperiments' // Default API URL
    }
  },
  data() {
    return {
      experiments: [], // Llista dels experiments obtinguts des de la api
      components: [], // Llista dels components
      editingExperiment: null, // Objecte que emmagatzema les dades de l'experiment que estem modifican
      filters: {
        name: '', // Filtre pel nom de l'experiment
        id: null, // Filtre pel ID de l'experiment
        component: '', // Filtre pel component de l'experiment
        estat: '', // Filtre per l'estat de l'experiment
        comprovacio: '' // Filtre per comprovació de l'experiment
      },
      showFilters: false, // Obrir tancar filtres
      sortOption: 'id', // Opció d'ordenació actual (per defecte pel ID)
      formErrors: {}, // Objecte per emmagatzemar errors de validació del formulari (de moment no funciona bé)
      showChartModal: false, // Obrir tancar chart creation modal
      isAdmin: false,
      noExperiment: false
    };
  },
  components: {
    CreateChart // Component per crear i mostrar els gràfics
  },
  computed: {
    // Combrobem si la edició de l'experiment esta desactivada (per exemple quan l'experiment esta marcat com 'acceptat')
    isEditingDisabled() {
      const isDisabled = this.editingExperiment && 
                        this.editingExperiment.comprovacio === 'acceptat' && 
                        !this.isAdmin;
      console.log('isEditingDisabled:', isDisabled); // Debugging output
      return isDisabled;
    },
    
    // Combrobem els experiments filtrats i ordenats segons els filtres i l'opció de la ordenació actual
    sortedAndFilteredExperiments() {
      let filtered = this.experiments.filter(experiment => {
        // Filtra els experiments basats en els criteris especificats
        const matchesName = this.filters.name
          ? experiment.nom_experiment.toLowerCase().includes(this.filters.name.toLowerCase())
          : true;
        const matchesID = this.filters.id
          ? experiment.experimentID === this.filters.id
          : true;
        const matchesComponent = this.filters.component.nom
          ? experiment.nom === this.filters.component.nom
          : true;
        const matchesEstat = this.filters.estat
          ? experiment.estat === this.filters.estat
          : true;
        const matchesComprovacio = this.filters.comprovacio
          ? experiment.comprovacio === this.filters.comprovacio
          : true;
        
        return matchesName && matchesID && matchesComponent && matchesComprovacio && matchesEstat;
      });

      // Ordena els experiments segons de l'opció seleccionada (ID o nom)
      if (this.sortOption === 'id') {
        filtered.sort((a, b) => a.experimentID - b.experimentID);
      } else if (this.sortOption === 'name') {
        filtered.sort((a, b) => a.nom_experiment.localeCompare(b.nom_experiment));
      }

      return filtered;
    }
  },
  methods: {
    // Obté la llista d'experiments del servidor (api endpoint way) i actualitza el seu estat
    async fetchMyExperiments() {
      try {
        const token = localStorage.getItem('token'); // Obtenir el token d'autenticació (jwt) des del localStorage
        const response = await axios.get(this.apiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(response.data)) {
          this.experiments = response.data.map(experiment => {
            let chartData = experiment.chartData || {}; // Assegurem que chartData és un objecte

            // Convertir les dates del gràfic si es troben en format de string
            if (chartData.dates && typeof chartData.dates === 'string') {
              try {
                chartData.dates = JSON.parse(chartData.dates);
              } catch (e) {
                console.error('Error en analitzar les dates del gràfic:', chartData.dates);
                chartData.dates = []; // Inicialitzar dates com array buit si no es pot analitzar
              }
            } else if (!Array.isArray(chartData.dates)) {
              chartData.dates = []; // Inicialitzar dates com array buit si no està formatat correctament
            }

            return {
              ...experiment.experiment[0],
              chartData,
              showDetails: false // Iniciar amb detalls ocultats
            };
          });
        } 
      else {
        // Si no hi ha experiment per que no surti error (perque no ho es)
        this.experiments = []; // Buidem experiment array
        this.noExperiment = true;
        console.log('No experiments found.');
        //*Recordar afegir un missatge de que no teniu cap experiment
      }
      // }  else {
      //     console.error('Estructura de resposta inesperada:', response.data);
      //   }
      } catch (error) {
        console.error('Error en obtenir els experiments:', error);
      }
    },

    // Manejar l'eliminació d'un experiment
    async deleteExperiment(experimentID) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost/apiHydrolysisdb/DeleteExperiment/${experimentID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchMyExperiments(); // Torna a obtenir la llista actualitzada d'experiments
      } catch (error) {
        console.error('Error deleting experiment:', error);
      }
    },

    // Obtenir la llista de components del api backpoint
    async fetchComponents() {
      try {
        const response = await axios.get('http://localhost/apiHydrolysisdb/Components');
        this.components = response.data;
      } catch (error) {
        console.error('Error en obtenir els components:', error);
      }
    },

    // Obrir o tancar els detalls d'un experiment
    toggleDetails(experimentID) {
      const experiment = this.experiments.find(exp => exp.experimentID === experimentID);
      if (experiment) {
        experiment.showDetails = !experiment.showDetails; // Obrir o tancar els detalls
        if (experiment.showDetails && experiment.chartData && experiment.chartData.dates.length > 0) {
          this.drawChart(experiment); // Dibuixar el grafic si hi han dades
        }
      }
    },

    //Dibuixa el grafic utilitzant la biblioteca Google Charts
    drawChart(experiment) {
      if (typeof google === 'undefined') {
        //Carregar el script de Google Charts si no està disponible
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          this.initializeGoogleChart(experiment); //Inicialitza el grafic un cop carregat al script
        };
        document.head.appendChild(script);
      } else {
        this.initializeGoogleChart(experiment);
      }
    },

    // Inicialitza Google Charts i configura el grafic
    initializeGoogleChart(experiment) {
      google.charts.load('current', { packages: ['corechart'] });
      google.charts.setOnLoadCallback(() => this.renderChart(experiment));
    },

    // Render el grafic amb les dades de l'experiment
    renderChart(experiment) {
      if (Array.isArray(experiment.chartData.dates) && experiment.chartData.dates.length > 0) {
        const data = new google.visualization.DataTable();
        data.addColumn('number', 'X');
        data.addColumn('number', 'Y');
        data.addRows(experiment.chartData.dates);

        const options = {
          title: experiment.chartData.title,
          hAxis: { title: 'Eix X' },
          vAxis: { title: 'Eix Y' },
          legend: 'none',
          pointSize: 5
        };

        const chart = new google.visualization.LineChart(document.getElementById('chart-' + experiment.experimentID));
        chart.draw(data, options);
      } else {
        console.error('No hi ha dades vàlides per al gràfic de l\'experiment ID:', experiment.experimentID);
      }
    },

    // Iniciar el process d'edició d'un experiment
    async editExperiment(experiment) {
      this.editingExperiment = { ...experiment }; //Crear una còpia de les dades de l'experiment
      await this.fetchComponents(); //Obtenir la llista de components per seleccionar durant l'edició
      // Configurem el component seleccionat en el formulari
      this.$nextTick(() => {
        const selectElement = this.$el.querySelector('select[v-model="editingExperiment.componentID"]');
        if (selectElement) {
          selectElement.value = this.editingExperiment.componentID;
        }
      });
    },

    //Validacio del formulari d'edició
    validateForm() {
      this.formErrors = {}; // Neteja errors anteriors
      if (!this.editingExperiment.componentID) {
        this.formErrors.componentID = true; // Error si no esta seleccionat un component
      }
      if (this.editingExperiment.nom_experiment.length >= 0 && this.editingExperiment.nom_experiment.length < 2) {
        this.formErrors.nom_experiment = true; // Error si el nom és massa curt nom.length < 2
      }
      if (this.editingExperiment.ph < 0 && this.editingExperiment.ph > 14) {
        this.formErrors.ph = true; // Error si el ph no es entre 0 i 14
      }
      if (this.editingExperiment.temps <= 0) {
        this.formErrors.temps = true; // Error si el temps és mes petit que 0
      }
      if (this.editingExperiment.concentracio < 0 && this.editingExperiment.concentracio > 100) {
        this.formErrors.concentracio = true; // Error si concentracio no es entre 0 i 100
      }
      if (this.editingExperiment.grams <= 0) {
        this.formErrors.grams = true; // Error si el pes en grams es mes petit que 0
      }
      return Object.keys(this.formErrors).length === 0; // Retorna si no hi ha errors
    },

    // Actualitza les dades de l'experiment al servidor si no hi han els errors en form
    async updateExperiment() {
      if (!this.validateForm()) {
        console.error('Validació del formulari fallida:', this.formErrors);
        return; // Evitar l'enviacio si la validació falla
      }

      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost/apiHydrolysisdb/UpdateExperiment', this.editingExperiment, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(this.editingExperiment);
        await this.fetchMyExperiments(); // Actualitza la llista d'experiments després de l'actualitzacio (basicament torna a carregar els experiments)
        this.editingExperiment = null; // Tancar el formulari d'edició
      } catch (error) {
        console.error('Error en actualitzar l\'experiment:', error);
      }
    },

    // Tancar el formulari d'edició sense desar els canvis (un close)
    closeEditForm() {
      this.editingExperiment = null;
    },

    // Tancar el modal del gràfic +(debug de data)
    closeChartModal() {
      console.log('Experiments inicials:', this.experiments);
      console.log('Components inicials:', this.components);
      console.log('Experiment en edició inicial:', this.editingExperiment);
      console.log('Errors del formulari inicials:', this.formErrors);
      console.log('Modal del gràfic visible inicialment:', this.showChartModal);
      this.showChartModal = false;
    },

    // Manage les dades del chart rebuts del component fill
    handleChartData(chartData) {
      console.log('Dades del gràfic rebudes del fill:', chartData);
      this.editingExperiment.chartData = chartData;
      this.closeChartModal(); // Tancar el modal del chart creation després d'actualitzar les dades
    },

    // Obrir/Tancar les opcions del filtre
    toggleFilterOptions() {
      this.showFilters = !this.showFilters;
    },

    // Aplicar els filtres seleccionats
    applyFilters() {
      // El mètode és cridat automàticament per la propietat del computed:
    },

    async checkUserRole() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost/apiHydrolysisdb/check-role', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Update the isAdmin state based on the server response
        this.isAdmin = response.data.role === 'administrador';
      } catch (error) {
        console.error('Error checking user role:', error);
        // Handle error appropriately, e.g., setting isAdmin to false or handling retries
        this.isAdmin = false;
      }
    },
  },
  created() {
    // Fetch the user role status when the component is created
    this.checkUserRole();
    // Quan es crea el component, obtenir els experiments i components + debug
    this.fetchMyExperiments();
    this.fetchComponents();
    
    // console.log('Experiments inicials:', this.experiments);
    // console.log('Components inicials:', this.components);
    // console.log('Experiment en edició inicial:', this.editingExperiment);
    // console.log('Errors del formulari inicials:', this.formErrors);
    // console.log('Modal del gràfic visible inicialment:', this.showChartModal);
  },
  mounted() {
    // Quan es monta el component fem el debug (tot debug del codi s eliminara despres de finalitzar l'aplicació)
    // console.log('Experiments muntats:', this.experiments);
    // console.log('Components muntats:', this.components);
    // console.log('Experiment en edició muntat:', this.editingExperiment);
    // console.log('Errors del formulari muntats:', this.formErrors);
    // console.log('Modal del gràfic visible muntat:', this.showChartModal);
    console.log('API URL being used:', this.apiUrl); // Log the apiUrl to verify
  }
};
</script>


<style scoped>
/* Container */
.experiments-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  background-color: #f7f9fc;
}

/* Header */
.header-section {
  margin-bottom: 20px;
  text-align: center;
}

/* Buttons */
.toggle-button, .styled-button {
  margin: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.toggle-button:hover, .styled-button:hover {
  background-color: #0056b3;
}

#eliminaButton{
  background-color: red;
}

#eliminaButton:hover{
  background-color: rgb(114, 8, 8);
}

.submit-button {
  background-color: #28a745;
}

.cancel-button {
  background-color: #dc3545;
}

/* Filters and Inputs */
.filters-section, .filter-inputs, .sorting-options {
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.styled-input, .styled-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  min-width: 150px;
}

.radio-label {
  margin-right: 15px;
}

/* Experiments List */
.experiments-list {
  list-style: none;
  padding: 0;
}

.experiment-item {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.experiment-item:hover {
  transform: scale(1.02);
}

.experiment-info {
  font-weight: bold;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
}

.edit-form label {
  display: block;
  margin-bottom: 10px;
}

.error-message {
  color: red;
  margin-top: 5px;
}

/*OLD ones/////////////////////////////////////////////////////////*/
/* .modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
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