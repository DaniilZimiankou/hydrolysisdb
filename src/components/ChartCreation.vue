<template>
  <div>

    <h3>Crear Gràfic per a l'Experiment</h3>
    
    <!-- Formulari per introduir les dades del grafic -->
    <form @submit.prevent="submitChart">
      
      <div>
        <label for="title">Títol del gràfic:</label>
        <input type="text" v-model="localChartData.title" required />
      </div>

      <div>
        <label for="xValue">Valor X:</label>
        <input type="number" v-model.number="newXValue" />
      </div>

      <div>
        <label for="yValue">Valor Y:</label>
        <input type="number" v-model.number="newYValue" />
      </div>

      <!-- Botons per afegir o guardar el punt -->
      <button type="button" @click="addPoint" :disabled="!canAddPoint">Afegir Punt</button>
      <button type="submit" :disabled="localChartData.dates.length < 2">Desar Gràfic</button>
    </form>

    <!-- Seccio condicional per eliminar punts -->
    <div v-if="localChartData.dates.length > 0">
      <div v-if="message" class="error-message">{{ message }}</div>
      <div v-if="localChartData.dates.length > 0">
        <label for="selectPoint">Selecciona el punt a eliminar:</label>
        <select v-model="selectedPointIndex">
          <option v-for="(point, index) in localChartData.dates" :key="index" :value="index">
            Punt {{ index + 1 }}: X={{ point[0] }}, Y={{ point[1] }}
          </option>
        </select>
        <button @click="removePoint" :disabled="selectedPointIndex === null">Eliminar Punt</button>
      </div>
    </div>

    <!-- Div per mostrar el grafic -->
    <div id="chart_div" style="width: 100%; height: 500px;"></div>
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

.error-message {
  color: red;
  margin: 10px 0;
}
</style>