<!-- <template>
  <div>
    <h1>Aplicació Principal</h1>
    <button @click="logout">Tanca Sessió</button> -->

    <!-- Botons per mostrar/ocultar diferents components -->
    <!-- <button @click="toggleCreateExperiment">Crear Experiment</button>
    <button @click="toggleMyExperiments">Els meus Experiments</button>
    <button @click="toggleExperiments">DB d'Experiments</button>
    <button @click="toggleHome">Home</button> -->
    
    <!-- Botó per accedir al component d'administrador -->
    <!-- <button v-if="isAdmin" @click="goToAdmin">Admin Panel</button> -->

    <!-- Render el component CrearExperiment -->
    <!-- <CrearExperiment v-if="showCreateExperiment" @experimentCreated="onExperimentCreated" /> -->

    <!-- Render el component MyExperiments -->
    <!-- <MyExperiments v-if="showMyExperiments" /> -->

    <!-- Render el component ExperimentsView -->
    <!-- <ExperimentsView v-if="showExperiments" /> -->

    <!-- Render el component HomeView -->
    <!-- <HomeView v-if="showHome" />
  </div>
</template> -->

<template>
  <div id="UpperLayout">
          <div id="LogoP"><img id="LogoS" src="@/assets/HydrolysisDBNL.jpg"/></div>
          <button id="Surt" @click="logout"><img class="iconI" src="@/assets/icons8-salida-50.png"/></button>
        </div>
        <div id="MyRow">
          <div id="LeftLayout">
            <div id="Fbtn">
              <button class="btn btn-cont" id="BtnHome" @click="toggleHome">
                <div>
                  <img class="iconI" src="@/assets/icons8-casa-64.png"/>
                </div>
                Home <i class="fa fa-chevron-right"></i></button>
              <button class="btn btn-cont" @click="toggleCreateExperiment">
                <div>
                  <!-- <img class="iconI" src="@/assets/icons8-recordatorios-de-citas-64.png"/> -->
                </div>
                Crear Experiment <i class="fa fa-chevron-right"></i></button>
            </div>
            <div class="Sbtn" id="Fnc">
              <button class="btnD btn-contF" id="BtnHome" @click="toggleMyExperiments">Els meus Experiments <i class="fa fa-chevron-right"></i></button>
            </div>
            <div class="Sbtn" id="Snc">
              <button class="btnD btn-contS" id="BtnHome" @click="toggleExperiments">DB d'Experiments <i class="fa fa-chevron-right"></i></button>
            </div>
            <div class="Sbtn" id="Enc">
              <button class="btnD btn-contS" id="BtnHome" v-if="isAdmin" @click="goToAdmin">Admin Panel <i class="fa fa-chevron-right"></i></button>
            </div>
          </div>
          <div id="ws">
            <HomeView v-if="showHome" />
            <CrearExperiment v-if="showCreateExperiment" @experimentCreated="onExperimentCreated" />
            <MyExperiments v-if="showMyExperiments" />
            <ExperimentsView v-if="showExperiments" />
          </div>
        </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CrearExperiment from '@/components/CrearExperiment.vue';
import MyExperiments from '@/components/MyExperiments.vue';
import ExperimentsView from '@/components/ExperimentsView.vue';
import HomeView from '@/components/HomeView.vue';
import axios from 'axios';

// Definim el router per navegar
const router = useRouter();

// Referències per controlar la visibilitat dels components
const showCreateExperiment = ref(false);
const showMyExperiments = ref(false);
const showExperiments = ref(false);
const showHome = ref(false);
const isAdmin = ref(false); // Aquesta referència determinarà si l'usuari és admin

// Funció per tancar sessió de l'usuari
const logout = () => {
  // Eliminem el token JWT del local storage
  localStorage.removeItem('token');

  // Redirigim l'usuari al login
  router.push('/login');
};

// Funció per obrir/tancar component CrearExperiment
const toggleCreateExperiment = () => {
  showCreateExperiment.value = !showCreateExperiment.value;
  if (showCreateExperiment.value) {
    showMyExperiments.value = false;
    showExperiments.value = false;
    showHome.value = false;
  }
};

// Funció per obrir/tancar component MyExperiments
const toggleMyExperiments = () => {
  showMyExperiments.value = !showMyExperiments.value;
  if (showMyExperiments.value) {
    showCreateExperiment.value = false;
    showExperiments.value = false;
    showHome.value = false;
  }
};

// Funció per obrir/tancar component ExperimentsView
const toggleExperiments = () => {
  showExperiments.value = !showExperiments.value;
  if (showExperiments.value) {
    showCreateExperiment.value = false;
    showMyExperiments.value = false;
    showHome.value = false;
  }
};

// Funció per obrir/tancar component HomeView
const toggleHome = () => {
  showHome.value = !showHome.value;
  if (showHome.value) {
    showCreateExperiment.value = false;
    showMyExperiments.value = false;
    showExperiments.value = false;
  }
};

// Funció per gestionar pàgina quan es crea un nou experiment
const onExperimentCreated = (newExperiment) => {
  console.log('Nou experiment creat:', newExperiment);
  showCreateExperiment.value = false;
};

// Funció per anar al component d'administració
const goToAdmin = () => {
  router.push('/admin');
};

// Funció per comprovar si l'usuari és admin
const checkAdminRole = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await axios.get('http://localhost/apiHydrolysisdb/check-role', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Accessing response.data directly since axios parses JSON automatically
      const data = response.data;
      isAdmin.value = data.role === 'administrador';
    } catch (error) {
      console.error('Error checking admin role:', error);
      isAdmin.value = false; // Handle the error, default to non-admin
    }
  } else {
    isAdmin.value = false; // No token found, default to non-admin
  }
};

// Quan es carrega el component, comprova si l'usuari és admin
onMounted(() => {
  checkAdminRole();
});
</script>

<style scoped>
        .TascaUseerControlButton{
          width: 100%;
          height: 100%;
        }
        #LeftLayout{
            width: 20%;
            height: 90%;
            background-color: #61AFF7;
        }
        #UpperLayout{
            width: 100%;
            height: 10%;
            /* background-color:aqua; */
            border-bottom: solid 3px black;
            position: relative;
        }
        #LogoP{
            width: 20%;
            height: 100%;
            position: absolute;
            object-fit: cover;
        }
        #LogoS{
          
          width: 100%;
          height: 100%;
        }
        #MyRow{
          display: flex;
          height: 100%;
          width: 100%;
        }
        #ws{
          width: 80%;
          height: 90%;
          background-color: #EAF9FF;
          overflow: auto;
        }
        #Fbtn{
          height: 30%;
          width: 100%;
          background-color: #0836C1;
          border-bottom: solid 3px black;
        }
        .Sbtn{
          width: 100%;
          height: 15%;
        }
        #Fnc{
          background-color: #1D6AEF;
          /* border-bottom: solid 3px black; */
        }
        #Snc{
          background-color: #3E88EF;
          /* border-bottom: solid 3px black; */
        }
        #Enc{
          background-color: #5494ee;
          /* border-bottom: solid 3px black; */
        }
        #Surt{
          margin-left: 95%;
          margin-top: 1.5%;
          position:absolute;
          cursor: pointer;
          width: 4%;
          height: 60%;
          background-color: transparent;
          border: none;
        }
        #Lletres{
          font-size: 20px;
        }
        .FbtnB{
          width: 100%;
          height: 50%;
        }

        .btn {
          width: 100%;
          height: 50%;
          font-family: "Lato";
          font-size: 2vw;
          text-transform: uppercase;
          background-color: #EAF9FF;
          font-weight: 300;
          background-color: transparent;
          transition: all 0.5s ease;
          cursor:pointer;
          padding: 0%;
        }
        .btnD {
          width: 100%;
          height: 100%;
          font-family: "Lato";
          font-size: 2vw;
          text-transform: uppercase;
          background-color: #EAF9FF;
          font-weight: 300;
          background-color: transparent;
          transition: all 0.5s ease;
          cursor:pointer;
          padding: 0%;
        }
        .btn:hover,
        button:hover {
          outline: 0;
          font-size: 2.5vw;
          color: #fff;
        }
        .btn:active,
        button:active {
          outline: 0;
          font-size: 2.5vw;
          color: #fff;
        }
        .btnD:hover,
        button:hover {
          outline: 0;
          font-size: 2.5vw;
          color: #fff;
        }
        .btnD:active,
        button:active {
          outline: 0;
          font-size: 2.5vw;
          color: #fff;
        }
        .btn-cont {
          border: none;
          color: #fff;
          background: linear-gradient(to left, #0836C1 50%, #74D0DB 50%);
          background-size: 200% 100%;
          background-position: right bottom;
        }
        .btn-contF {
          border: none;
          color: #fff;
          background: linear-gradient(to left, #1D6AEF 50%, #74D0DB 50%);
          background-size: 200% 100%;
          background-position: right bottom;
        }
        .btn-contS {
          border: none;
          color: #fff;
          background: linear-gradient(to left, #3E88EF 50%, #74D0DB 50%);
          background-size: 200% 100%;
          background-position: right bottom;
        }
        .btn-contE {
          border: none;
          color: #fff;
          background: linear-gradient(to left, #143461 50%, #74D0DB 50%);
          background-size: 200% 100%;
          background-position: right bottom;
        }
        .btn-cont:hover {
          background-position: left bottom;
        }
        .btn-contF:hover {
          background-position: left bottom;
        }
        .btn-contS:hover {
          background-position: left bottom;
        }
        #BtnHome{
          border-bottom: solid 3px black;
        }
        .iconI{
          width: 3vw;
          height: 3vw;
          object-fit: cover;
        }


        /* Desplegables de ws */
        .linkRespB{
            margin: 10px auto;
            width: 90%;
            height: 8%;
            border: 2px solid #8360c3;
            border-radius: 8px;
            display: flex;
            flex-direction: row;
            align-items: center;
            background-color: white;
        }
        .resBusqd{
            width: 89%;
            height: 90%;
            margin: 4px;
        }
        .botonLikeOjo{
            width: 4%;
            height: 90%;
            margin: 4px;
            border-radius: 50%;
            background-color:#8360c3;
            display: flex;
            align-items: center;
            overflow: hidden;
            justify-content: center;
        }

        .botonLikeOjoR{
            width: 4%;
            height: 90%;
            margin: 4px;
            border-radius: 50%;
            background-color:#8360c3;
            display: flex;
            align-items: center;
            overflow: hidden;
            justify-content: center;
        }
        .real{
            /* border: 1px solid #333333;
            width: 80%;
            height: 100px; */
            /* overflow-y: scroll; */
            display: none;
        }
        .real.abierto{
            border: 1px solid #333333;
            width: 90%;
            height: 50%;
            border-radius: 8px;
            background-color: white;
            /* overflow-y: scroll; */
            margin: auto;
            display:block}

</style>