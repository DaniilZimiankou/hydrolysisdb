<template>
  <div class="experiments-container">
    <!-- Header Section -->
    <h1>Llista d'Experiments Pendents per acceptacio</h1>

    <!-- Toggle Filter Options Button -->
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
            {{ component }}
          </option>
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
          Ordena per Nom
        </label>
      </div>
    </div>

    <!-- No Experiments Message -->
    <div v-if="noExperiment" class="no-experiments">
      <h2>No tens experiments per acceptar/denegar</h2>
    </div>

    <!-- List of Experiments -->
    <ul class="experiments-list">
      <li v-for="experiment in sortedAndFilteredExperiments" :key="experiment.experimentID" class="experiment-item">
        <div class="experiment-header">
          <span class="experiment-info">{{ experiment.experimentID }}: {{ experiment.nom_experiment }}</span>
          <div class="experiment-actions">
            <button @click="toggleDetails(experiment.experimentID)" class="toggle-button">
              {{ experiment.showDetails ? 'Tanca' : 'Obre' }}
            </button>
            <button @click="acceptOdenyExperiment(experiment.experimentID, 'acceptat')" class="styled-button accept-button">Acceptar</button>
            <button @click="acceptOdenyExperiment(experiment.experimentID, 'denegat')" class="styled-button deny-button">Denegar</button>
          </div>
        </div>

        <!-- Experiment Details -->
        <div v-if="experiment.showDetails" class="experiment-details">
          <p><strong>Estat:</strong> {{ experiment.estat }}</p>
          <p><strong>Verificació:</strong> {{ experiment.comprovacio }}</p>
          <p><strong>Catalitzador:</strong> {{ experiment.catalitzador }}</p>
          <p><strong>pH:</strong> {{ experiment.ph }}</p>
          <p><strong>Temps:</strong> {{ experiment.temps }} minuts</p>
          <p><strong>Temperatura:</strong> {{ experiment.temperatura }} °C</p>
          <p><strong>Concentració:</strong> {{ experiment.concentracio }} g/L</p>
          <p><strong>Tipus:</strong> {{ experiment.tipus }}</p>
          <p><strong>Grams:</strong> {{ experiment.grams }} g</p>
          <p><strong>Nom:</strong> {{ experiment.nom }}</p>

          <!-- Render Chart if Data Exists -->
          <div v-if="experiment.chartData.dates.length > 0" class="chart-container">
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
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost/apiHydrolysisdb/PendentExperiments', {
          headers: { Authorization: `Bearer ${token}` }
        });
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
            this.experiments = [];
            this.noExperiment = true;
            console.log('No experiments encontrats:');
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
      },

      async acceptOdenyExperiment(experimentID, acceptationState) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost/apiHydrolysisdb/UpdateExperimentStatus', {
          experimentID,
          status: acceptationState
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
        //   const experiment = this.experiments.find(exp => exp.experimentID === experimentID);
        //   if (experiment) {
        //     experiment.comprovacio = 'acceptat';
        //   }
          console.log('Experiment acceptat correctament.');
        } else {
          console.error('No s\'ha pogut acceptar l\'experiment.');
        }
        this.fetchExperiments();
      } catch (error) {
        console.error('Error en acceptar l\'experiment:', error);
      }
    }
    },
    created() {
      this.fetchExperiments(); // Obtenir experiments quan es crea el component
      this.fetchComponents(); // Obtenir components quan es crea el component
    }
  };
  </script>
  
  <style scoped>
/* Container */
.experiments-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

/* Header */
h1 {
  text-align: center;
  margin-bottom: 20px;
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

.accept-button {
  background-color: #28a745;
}

.deny-button {
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

/* No Experiments Message */
.no-experiments {
  text-align: center;
  margin: 20px 0;
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

.experiment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.experiment-info {
  font-weight: bold;
}

.experiment-actions {
  display: flex;
  gap: 10px;
}

/* Experiment Details */
.experiment-details {
  margin-top: 10px;
  padding: 10px;
  border-top: 1px solid #ddd;
}

/* Chart Container */
.chart-container {
  margin-top: 20px;
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