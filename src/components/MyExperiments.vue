<template>
  <div>
    <div>
      <h1>Els meus experiments</h1>
    </div>

    <!-- Botó per obrir o tencar les opcions de filtre -->
    <button @click="toggleFilterOptions">
      {{ showFilters ? 'Tanca filtres' : 'Mostra filtres' }}
    </button>

    <!-- Secció dels filtres -->
    <div v-if="showFilters">
      <!-- Inputs dels filtres -->
      <div>
        <input v-model="filters.name" placeholder="Filtra per nom" />
        <input v-model.number="filters.id" type="number" placeholder="Filtra per ID" />
        <select v-model="filters.component" @change="applyFilters">
          <option value="">qualsevol component</option>
          <option v-for="component in components" :key="component" :value="component">
            {{ component.nom }}
          </option>
        </select>
        <select v-model="filters.estat" @change="applyFilters">
          <option value="">qualsevol estat</option>
          <option value="pendent">pendent</option>
          <option value="acabat">acabat</option>
          <option value="en process">en procés</option>
        </select>
        <select v-model="filters.comprovacio" @change="applyFilters">
          <option value="">qualsevol comprovacio</option>
          <option value="no acceptat">no acceptat</option>
          <option value="acceptat">acceptat</option>
          <option value="denegat">denegat</option>
        </select>
      </div>

      <!-- Opcions d'ordenacio -->
      <div>
        <label>
          <input type="radio" v-model="sortOption" value="id" />
          Ordena per ID
        </label>
        <label>
          <input type="radio" v-model="sortOption" value="name" />
          Ordena per nom
        </label>
      </div>
    </div>

    <ul>
      <li v-for="experiment in sortedAndFilteredExperiments" :key="experiment.experimentID">
        <span>{{ experiment.experimentID }}: {{ experiment.nom_experiment }}</span>
        <button @click="toggleDetails(experiment.experimentID)">
          {{ experiment.showDetails ? 'Tanca' : 'Obre' }}
        </button>

        <div v-if="experiment.showDetails">
          <p>Estat: {{ experiment.estat }}</p>
          <p>Comprovació: {{ experiment.comprovacio }}</p>
          <p>Catalitzador: {{ experiment.catalitzador }}</p>
          <p>pH: {{ experiment.ph }}</p>
          <p>Temps: {{ experiment.temps }} minuts</p>
          <p>Temperatura: {{ experiment.temperatura }} °C</p>
          <p>Concentració: {{ experiment.concentracio }} g/L</p>
          <p>Tipus: {{ experiment.tipus }}</p>
          <p>Grams: {{ experiment.grams }} g</p>
          <p>Nom: {{ experiment.nom }}</p>

          <!-- Renderitzar el grafic si existeixin dades del grafic -->
          <div v-if="experiment.chartData.dates.length > 0" :id="'chart-' + experiment.experimentID">
            <h3>{{ experiment.chartData.title }}</h3>
            <div :id="'chart-' + experiment.experimentID" style="width: 100%; height: 400px;"></div>
          </div>

          <!-- Botó de modificar -->
          <button @click="editExperiment(experiment)" :disabled="experiment.comprovacio === 'acceptat'">
            Modifica
          </button>
          <button @click="deleteExperiment(experiment.experimentID)" :disabled="experiment.comprovacio === 'acceptat'">
            Elimina
          </button>
          <p v-if="experiment.comprovacio === 'acceptat'" style="color: red;">Aquest experiment està completat i no es pot modificar.</p>
        </div>
      </li>
    </ul>

    <!-- Formulari modal per editar l'experiment (edit modal) -->
    <div v-if="editingExperiment" class="modal">
      <div class="modal-content">
        <h2>Edita l'experiment</h2>
        <form @submit.prevent="updateExperiment">
          <label>
            Nom:
            <input v-model="editingExperiment.nom_experiment" type="text" :disabled="isEditingDisabled"/>
          </label>
          <label>
            Estat:
            <select v-model="editingExperiment.estat" :disabled="isEditingDisabled">
              <option value="pendent">pendent</option>
              <option value="acabat">acabat</option>
              <option value="en process">en procés</option>
            </select>
          </label>
          <label>
            Catalitzador:
            <select v-model="editingExperiment.catalitzador" :disabled="isEditingDisabled">
              <option value="enzim">enzim</option>
            </select>
          </label>
          <label>
            pH:
            <input v-model.number="editingExperiment.ph" type="number" step="0.1" min="0" max="14" :disabled="isEditingDisabled" />
          </label>
          <label>
            Temps:
            <input v-model.number="editingExperiment.temps" type="number" :disabled="isEditingDisabled" />
          </label>
          <label>
            Temperatura:
            <input v-model.number="editingExperiment.temperatura" type="number" :disabled="isEditingDisabled" />
          </label>
          <label>
            Concentració:
            <input v-model.number="editingExperiment.concentracio" type="number" step="0.1" min="0" max="100" :disabled="isEditingDisabled" />
          </label>
          <label>
            Grams:
            <input v-model.number="editingExperiment.grams" type="number" step="0.1" :disabled="isEditingDisabled" />
          </label>
          <label>
            Component:
            <select v-model="editingExperiment.componentID" :disabled="isEditingDisabled">
              <option value="" disabled>Selecciona un component</option>
              <option v-for="component in components" :key="component.componentID" :value="component.componentID">
                {{ component.nom }}
              </option>
            </select>
            <p v-if="formErrors.componentID" style="color: red;">Si us plau, selecciona un component.</p>
            <p v-if="formErrors.nom_experiment" style="color: red;">El nom ha de tenir almenys 2 caràcters.</p>
          </label>
          <button type="button" @click="showChartModal = true">Modifica el gràfic</button>
          <button type="submit" :disabled="isEditingDisabled">Desa els canvis</button>
          <button @click="closeEditForm">Cancel·la</button>
        </form>
        <div v-if="showChartModal" class="modal-overlay" @click.self="closeChartModal">
          <div class="modal-content">
            <CreateChart :chartData="editingExperiment.chartData" @chartData="handleChartData" />
            <button @click="closeChartModal">Tanca</button>
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
      showChartModal: false // Obrir tancar chart creation modal
    };
  },
  components: {
    CreateChart // Component per crear i mostrar els gràfics
  },
  computed: {
    // Combrobem si la edició de l'experiment esta desactivada (per exemple quan l'experiment esta marcat com 'acceptat')
    isEditingDisabled() {
      return this.editingExperiment && this.editingExperiment.comprovacio === 'acceptat';
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
        const response = await axios.get('http://localhost/apiHydrolysisdb/MyExperiments', {
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
          legend: 'none'
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
      if (this.editingExperiment.nom_experiment.length > 0 && this.editingExperiment.nom_experiment.length < 2) {
        this.formErrors.nom_experiment = true; // Error si el nom és massa curt nom.length < 2
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
    }
  },
  created() {
    // Quan es crea el component, obtenir els experiments i components + debug
    this.fetchMyExperiments();
    this.fetchComponents();
    console.log('Experiments inicials:', this.experiments);
    console.log('Components inicials:', this.components);
    console.log('Experiment en edició inicial:', this.editingExperiment);
    console.log('Errors del formulari inicials:', this.formErrors);
    console.log('Modal del gràfic visible inicialment:', this.showChartModal);
  },
  mounted() {
    // Quan es monta el component fem el debug (tot debug del codi s eliminara despres de finalitzar l'aplicació)
    console.log('Experiments muntats:', this.experiments);
    console.log('Components muntats:', this.components);
    console.log('Experiment en edició muntat:', this.editingExperiment);
    console.log('Errors del formulari muntats:', this.formErrors);
    console.log('Modal del gràfic visible muntat:', this.showChartModal);
  }
};
</script>

<style scoped>
.modal {
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
}
</style>