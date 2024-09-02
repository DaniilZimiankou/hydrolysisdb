<template>
  <div class="experiments-container">
    <!-- Header Title -->
    <h1 class="experiments-title">Llista d'Experiments Completats i Acceptats</h1>

    <!-- Login Button for Direct Route -->
    <div v-if="isDirectRoute" class="login-section">
      <button class="styled-button" @click="navigateToLogin">Inicia Sessió</button>
    </div>

    <!-- Toggle Filter Options Button -->
    <button class="toggle-filters-button styled-button" @click="toggleFilterOptions">
      {{ showFilters ? 'Tanca filtres' : 'Mostra filtres' }}
    </button>

    <!-- Filter Section -->
    <div v-if="showFilters" class="filter-section">
      <!-- Filter Inputs -->
      <div class="filter-inputs">
        <input v-model="filters.name" placeholder="Filtra per nom" class="styled-input" />
        <input v-model.number="filters.id" type="number" placeholder="Filtra per ID" class="styled-input" />
        <select v-model="filters.component" @change="applyFilters" class="styled-select">
          <option value="">qualsevol component</option>
          <option v-for="component in components" :key="component" :value="component">
            {{ component }}
          </option>
        </select>
      </div>

      <!-- Sort Options -->
      <div class="sort-options">
        <label class="styled-label">
          <input type="radio" v-model="sortOption" value="id" />
          Ordena per ID
        </label>
        <label class="styled-label">
          <input type="radio" v-model="sortOption" value="name" />
          Ordena per Nom
        </label>
      </div>
    </div>

    <!-- No Experiment Message -->
    <div v-if="noExperiment" class="no-experiment">
      <h2>De moment no hi han experiment en la Base de Dates</h2>
    </div>

    <!-- Experiments List -->
    <ul class="experiments-list">
      <li v-for="experiment in sortedAndFilteredExperiments" :key="experiment.experimentID" class="experiment-item">
        <span class="experiment-title">{{ experiment.experimentID }}: {{ experiment.nom_experiment }}</span>
        <button class="details-button styled-button" @click="toggleDetails(experiment.experimentID)">
          {{ experiment.showDetails ? 'Tanca' : 'Obre' }}
        </button>

        <!-- Experiment Details -->
        <div v-if="experiment.showDetails" class="experiment-details">
          <p>Estat: {{ experiment.estat }}</p>
          <p>Verificació: {{ experiment.comprovacio }}</p>
          <p>Catalitzador: {{ experiment.catalitzador }}</p>
          <p>pH: {{ experiment.ph }}</p>
          <p>Temps: {{ experiment.temps }} minuts</p>
          <p>Temperatura: {{ experiment.temperatura }} °C</p>
          <p>Concentració: {{ experiment.concentracio }} g/L</p>
          <p>Tipus: {{ experiment.tipus }}</p>
          <p>Grams: {{ experiment.grams }} g</p>
          <p>Nom: {{ experiment.nom }}</p>

          <!-- Render Graph if Chart Data Exists -->
          <div v-if="experiment.chartData.dates.length > 0" :id="'chart-' + experiment.experimentID">
            <h3>{{ experiment.chartData.title }}</h3>
            <div :id="'chart-' + experiment.experimentID" style="width: 100%; height: 400px;"></div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

/* global google */

export default {
  data() {
    return {
      experiments: [], // Llista d'experiments
      components: [], // Per emmagatzemar els components obtinguts del endpoint
      filters: {
        name: '', // Filtre per nom d'experiment
        id: null, // Filtre per ID d'experiment
        component: '' // Filtre per component
      },
      showFilters: false, // obrir/tancar filtre
      sortOption: 'id', // filtrar pel defecte pel id
      noExperiment: false
    };
  },
  computed: {
    // Mirem si la ruta actual és la vista d'experiments (per ocultar login button per que reutilitzem component)
    isDirectRoute() {
      return this.$route.name === 'ExperimentsView';
    },
    // Aplicar els filtres als experiments
    sortedAndFilteredExperiments() {
      let filtered = this.experiments.filter(experiment => {
        const matchesName = this.filters.name
          ? experiment.nom_experiment.toLowerCase().includes(this.filters.name.toLowerCase())
          : true;
        const matchesID = this.filters.id
          ? experiment.experimentID === this.filters.id
          : true;
        const matchesComponent = this.filters.component
          ? experiment.nom === this.filters.component
          : true;
        
        return matchesName && matchesID && matchesComponent;
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
    // Obtenir la llista d'experiments des del endpoint
    async fetchExperiments() {
      try {
        const response = await axios.get('http://localhost/apiHydrolysisdb/Experiments');
        console.log('Resposta de l\'API:', response.data); // Verifiquem estructura (debug)

        if (Array.isArray(response.data)) {
          this.experiments = response.data.map(experiment => {
            let chartData = experiment.chartData || {}; // Assegurar que chartData es un objecte
            
            // Analitzar els dates si és un string
            if (chartData.dates && typeof chartData.dates === 'string') {
              try {
                chartData.dates = JSON.parse(chartData.dates);
              } catch (e) {
                console.error('Error al parsejar dates del gràfic:', chartData.dates);
                chartData.dates = [];
              }
            } else if (!Array.isArray(chartData.dates)) {
              chartData.dates = []; // Inicialitzar dates com array buit si no esta ben format
            }

            return {
              ...experiment.experiment[0],
              chartData,
              showDetails: false // Detalls tancats pel defecte
            };
          });
        } else {
          this.noExperiment = true;
          console.log('No experiments en DB');
        }
      } catch (error) {
        console.error('Error en obtenir experiments:', error);
      }
    },

    // Obtenir la llista de components des del endpoint
    async fetchComponents() {
      try {
        const response = await axios.get('http://localhost/apiHydrolysisdb/Components');
        this.components = response.data.map(component => component.nom); // Extreure noms dels components
      } catch (error) {
        console.error('Error en obtenir components:', error);
      }
    },

    // Obrir/tancar els detalls d'un experiment
    toggleDetails(experimentID) {
      const experiment = this.experiments.find(exp => exp.experimentID === experimentID);
      if (experiment) {
        experiment.showDetails = !experiment.showDetails;
        if (experiment.showDetails && experiment.chartData && experiment.chartData.dates.length > 0) {
          this.drawChart(experiment);
        }
      }
    },

    // Dibuixa el grafic utilitzant Google Charts
    drawChart(experiment) {
      if (typeof google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          this.initializeGoogleChart(experiment);
        };
        document.head.appendChild(script);
      } else {
        this.initializeGoogleChart(experiment);
      }
    },

    // Inicialitza el grafic de Google
    initializeGoogleChart(experiment) {
      google.charts.load('current', { packages: ['corechart'] });
      google.charts.setOnLoadCallback(() => this.renderChart(experiment));
    },

    // Render el grafic de l'experiment
    renderChart(experiment) {
      console.log('Dades del gràfic:', experiment.chartData.dates); // debug

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
        console.error('No hi ha dades vàlides per al gràfic per l\'ID d\'experiment:', experiment.experimentID);
      }
    },

    // Obrir/tancar es opcions de filtratge
    toggleFilterOptions() {
      this.showFilters = !this.showFilters;
    },

    // Aplicar els filtres als experiments
    applyFilters() {
      // Aquest metode es cridat automaticament per computed:
    },

    // Navegar al login
    navigateToLogin() {
      this.$router.push('/login');
    }
  },
  created() {
    this.fetchExperiments(); // Obtenir experiments quan es crea el component
    this.fetchComponents(); // Obtenir components quan es crea el component
  }
};
</script>

<style scoped>
/* Container and Title */
.experiments-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f7f9fc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.experiments-title {
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Button Styles */
.styled-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin: 5px;
}

.styled-button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.toggle-filters-button {
  display: block;
  margin: 0 auto;
}

/* Filter Section */
.filter-section {
  margin: 20px 0;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.styled-input,
.styled-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
}

.sort-options {
  display: flex;
  gap: 20px;
}

.styled-label {
  font-size: 1rem;
}

/* No Experiment Message */
.no-experiment {
  text-align: center;
  margin-top: 20px;
  color: #777;
}

/* Experiment List */
.experiments-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.experiment-item {
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.experiment-item:hover {
  transform: scale(1.02);
}

.experiment-title {
  font-weight: bold;
  color: #333;
}

.details-button {
  margin-left: 10px;
}

/* Experiment Details */
.experiment-details {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f4f8;
  border-radius: 5px;
}

.experiment-details p {
  margin: 5px 0;
}
</style>

<!-- <style scoped>
button {
  margin: 10px 0;
  padding: 5px 10px;
}

input, select {
  margin-right: 10px;
  padding: 5px;
}

select {
  width: 200px;
}

label {
  margin-right: 15px;
}
</style> -->