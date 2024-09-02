<template>
  <div class="chart-creation-modal">
    <!-- Header -->
    <h3 class="modal-title">Crear Gràfic per a l'Experiment</h3>

    <!-- Form to Input Chart Data -->
    <form @submit.prevent="submitChart" class="chart-form">
      <!-- Title Input -->
      <div class="form-group">
        <label for="title" class="form-label">Títol del gràfic:</label>
        <input type="text" v-model="localChartData.title" required class="form-input" />
      </div>

      <!-- X Value Input -->
      <div class="form-group">
        <label for="xValue" class="form-label">Valor X:</label>
        <input type="number" v-model.number="newXValue" class="form-input" />
      </div>

      <!-- Y Value Input -->
      <div class="form-group">
        <label for="yValue" class="form-label">Valor Y:</label>
        <input type="number" v-model.number="newYValue" class="form-input" />
      </div>

      <!-- Add and Save Buttons -->
      <div class="button-group">
        <button type="button" @click="addPoint" :disabled="!canAddPoint" class="styled-button">
          Afegir Punt
        </button>
        <button type="submit" :disabled="localChartData.dates.length < 2" class="styled-button save-button">
          Desar Gràfic
        </button>
      </div>
    </form>

    <!-- Section to Remove Points -->
    <div v-if="localChartData.dates.length > 0" class="remove-point-section">
      <div v-if="message" class="error-message">{{ message }}</div>
      <div class="form-group">
        <label for="selectPoint" class="form-label">Selecciona el punt a eliminar:</label>
        <select v-model="selectedPointIndex" class="form-select">
          <option v-for="(point, index) in localChartData.dates" :key="index" :value="index">
            Punt {{ index + 1 }}: X={{ point[0] }}, Y={{ point[1] }}
          </option>
        </select>
        <button @click="removePoint" :disabled="selectedPointIndex === null" class="styled-button remove-button">
          Eliminar Punt
        </button>
      </div>
    </div>

    <!-- Div to Display the Chart -->
    <div id="chart_div" class="chart-display"></div>
  </div>
</template>

<script>
/* global google */

export default {
  props: {
    chartData: {
      type: Object,
      default: () => ({
        title: '', // Titol del grafic
        dates: [] // Dades del grafic (punts) array bidiomencional al sortir
      })
    }
  },
  data() {
    return {
      localChartData: { ...this.chartData }, // Crear una copia local de les dades del grafic
      newXValue: null, // Valor X del nou punt
      newYValue: null, // Valor Y del nou punt
      selectedPointIndex: null, // Index del punt seleccionat per eliminar
      message: '' // Missatge d'error
    };
  },
  computed: {
    // Comprovar si es poden afegir punts
    canAddPoint() {
      return this.newXValue !== null && this.newYValue !== null;
    }
  },
  methods: {
    // Enviar les dades del grafic si punts > 2
    submitChart() {
      if (this.localChartData.dates.length < 2) {
        this.message = 'Si us plau, afegeix almenys 2 punts per crear un gràfic.';
        return;
      }
      this.message = ''; // Netejar els missatges d'error anteriors
      this.$emit('chartData', this.localChartData); // Emit les dades del grafic (enviar dades al component pare)
    },
    
    // Afegeix un nou punt al grafic
    addPoint() {
      if (this.canAddPoint) {
        this.localChartData.dates.push([this.newXValue, this.newYValue]); // Afegeix el punt
        this.newXValue = null; // Neteja el valor X
        this.newYValue = null; // Neteja el valor Y
        this.selectedPointIndex = null; // Reiniciar l'index del punt seleccionat
        this.message = ''; // Netejar els missatges d'error anteriors
        this.drawChart(); // Dibuixa el grafic actualitzat
      } else {
        this.message = 'Si us plau, introdueix tant el valor X com el valor Y per afegir un punt.';
      }
    },

    // Eliminar el punt seleccionat del grafic
    removePoint() {
      if (this.selectedPointIndex !== null) {
        this.localChartData.dates.splice(this.selectedPointIndex, 1); // Eliminar el punt
        this.selectedPointIndex = null; // Reiniciar l'index del punt seleccionat
        this.message = ''; // Netejar els missatges d'error anteriors
        this.drawChart(); // Dibuixar el grafic actualitzat
      } else {
        this.message = 'Si us plau, selecciona un punt per eliminar.';
      }
    },

    // Dibuixa el gràfic utilitzant Google Charts
    drawChart() {
      if (typeof google === 'undefined') {
        // Carregar la llibreria de Google Charts si no esta carregada
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          this.initializeGoogleChart();
        };
        document.head.appendChild(script);
      } else {
        this.initializeGoogleChart(); // Inicialitzar el grafic si la llibreria ja esta carregada
      }
    },

    // Inicialitzar Google Charts i dibuixar el grafic
    initializeGoogleChart() {
      google.charts.load('current', { packages: ['corechart'] });
      google.charts.setOnLoadCallback(this.renderChart); // Dibuixar el grafic quan es carrega la llibreria
    },

    // Dibuixa el grafic a la pagina
    renderChart() {
      const dataTable = new google.visualization.DataTable();
      dataTable.addColumn('number', 'X'); // Columna per al valor X
      dataTable.addColumn('number', 'Y'); // Columna per al valor Y
      dataTable.addRows(this.localChartData.dates); // Afegeix les dades del grafic

      const options = {
        title: this.localChartData.title, // Titol del grafic
        hAxis: { title: 'Eix X' }, // Titol de l'eix X
        vAxis: { title: 'Eix Y' }, // Titol de l'eix Y
        legend: 'none',
        pointSize: 5 // Mida dels punts
      };

      const chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(dataTable, options); // Dibuixa el grafic amb les opcions
    }
  },
  watch: {
    // Observar/actualitzar canvis en les dades del grafic i actualitza el grafic
    chartData: {
      deep: true,
      handler(newData) {
        this.localChartData = { ...newData }; // Actualitzar les dades locals
        this.drawChart(); // Redibuixar el grafic amb les noves dades
        console.log('Dades del gràfic actualitzades:', newData);
      }
    }
  },
  mounted() {
    console.log('Dades del gràfic rebudes en el fill:', this.chartData);
    this.drawChart(); // Dibuixa el grafic quan es monta el component
  }
};
</script>

<style scoped>
/* Modal Container */
.chart-creation-modal {
  max-width: 700px; /* Reduced width */
  margin: 10px auto;
  padding: 10px; /* Reduced padding */
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow-y: auto; /* Enable vertical scrolling */
  max-height: 80vh; /* Constrain modal height */
}

/* Title */
.modal-title {
  font-size: 1.3em; /* Reduced font size */
  margin-bottom: 8px; /* Reduced margin */
  color: #333;
}

/* Form Styles */
.chart-form {
  margin-bottom: 10px; /* Reduced bottom margin */
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  gap: 6px; /* Less gap between fields */
}

.form-group {
  margin-bottom: 6px; /* Reduced margin */
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 2px; /* Reduced margin */
  font-size: 0.85em; /* Reduced font size */
  color: #555;
}

.form-input,
.form-select {
  width: 100%;
  padding: 3px; /* Reduced padding */
  font-size: 0.85em; /* Reduced font size */
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  border-color: #007bff;
  outline: none;
}

/* Button Styles */
.button-group {
  display: flex;
  justify-content: center;
  gap: 6px; /* Reduced gap */
  margin-top: 6px; /* Reduced margin */
  grid-column: span 2; /* Span both columns */
}

.styled-button {
  padding: 4px 10px; /* Reduced padding */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85em; /* Reduced font size */
  transition: background-color 0.3s;
}

.styled-button:hover {
  background-color: #0056b3;
}

.save-button {
  background-color: #28a745;
}

.save-button:hover {
  background-color: #218838;
}

.remove-button {
  background-color: #dc3545;
}

.remove-button:hover {
  background-color: #c82333;
}

/* Error Message */
.error-message {
  color: #dc3545;
  font-weight: bold;
  margin-bottom: 6px; /* Reduced margin */
  font-size: 0.85em; /* Reduced font size */
}

/* Chart Display */
.chart-display {
  width: 100%;
  height: 250px; /* Further reduced height */
  margin-top: 10px; /* Reduced top margin */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive Adjustments */
@media (max-width: 700px) {
  .chart-creation-modal {
    max-width: 90%;
  }

  .chart-form {
    grid-template-columns: 1fr; /* One column layout */
  }
}
</style>