<template>
    <div>
      <GChart
        type="LineChart"
        :data="chartData"
        :options="chartOptions"
        style="width: 100%; max-width: 600px; height: 500px;"
      />
    </div>
  </template>
  
  <script>
  import { GChart } from 'vue-google-charts'
  
  export default {
    components: {
      GChart,
    },
    data() {
      return {
        chartData: [
          ['Square Meters', 'Price in Millions'],
          [50, 7], [60, 8], [70, 8], [80, 9], [90, 9],
          [100, 9], [110, 10], [120, 11],
          [130, 14], [140, 14], [150, 15]
        ],
        chartOptions: {
          title: 'House Prices vs. Size',
          hAxis: { title: 'Square Meters' },
          vAxis: { title: 'Price in Millions' },
          legend: 'none',
          pointSize: 5,
        },
      };
    },
  };
  </script>
  
  <style scoped>
 
  </style>