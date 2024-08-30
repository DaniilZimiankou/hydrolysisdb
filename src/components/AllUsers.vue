<template>
    <div>
      <div>
        <h1>Els meus usuaris</h1>
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
          <input v-model="filters.email" placeholder="Filtra per email" />
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

      <div v-if="noUsuaris">
        <h1>No tens usuaris en la app</h1>
        <p>Els hi pots crear en l'apartat "Crear Usuaris"</p>
      </div>
  
      <ul>
        <li v-for="usuari in sortedAndFilteredusuaris" :key="usuari.usuariID">
          <span>{{ usuari.usuariID }}: {{ usuari.email }}: {{ usuari.nom }}</span>
          <button @click="toggleDetails(usuari.usuariID)">
            {{ usuari.showDetails ? 'Tanca' : 'Obre' }}
          </button>
  
          <div v-if="usuari.showDetails">
            <p>Nom: {{ usuari.nom }}</p>
            <p>Cognoms: {{ usuari.cognoms }}</p>
            <p>Email: {{ usuari.email }}</p>
            <p>Rol: {{ usuari.rol }}</p>
  
            <!-- Botó de modificar -->
            <button @click="editusuari(usuari)">
              Modifica
            </button>
          </div>
        </li>
      </ul>
  
      <!-- Formulari modal per editar l'usuari (edit modal) -->
      <div v-if="editingusuari" class="modal">
        <div class="modal-content">
          <h2>Modificar dades</h2>
          <form @submit.prevent="updateusuari">
            <label>
              Nom:
              <input v-model="editingusuari.nom" type="text"/>
            </label>
            <label>
              Cognoms:
              <input v-model="editingusuari.cognoms" type="text"/>
            </label>
            <label>
              Email:
              <input v-model="editingusuari.email" type="email"/>
            </label>
            <label>
            Rol:
            <select v-model="editingusuari.rol">
              <option value="tecnic">tecnic</option>
              <option value="administrador">administrador</option>
            </select>
            <p v-if="formErrors.cognoms" style="color: red;">Els cognoms han de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.nom" style="color: red;">El nom ha de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.emailOcupat" style="color: red;">El correu electrònic ja està ocupat.</p>
            <p v-if="formErrors.email" style="color: red;">El format de correu electrònic no es correcte.</p>
          </label>
            <button type="button" @click="openConfirmModal">Desa els canvis</button>
            <button type="button" @click="closeEditForm">Cancel·la</button>
          </form>
          <ConfirmationModal
            :isVisible="showConfirmModal"
            message="Estàs segur que vols desar els canvis?"
            @confirm="handleConfirm"
            @cancel="showConfirmModal = false"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import ConfirmationModal from './ConfirmationModal.vue';
  
  export default {
    components: {
      ConfirmationModal
    },
    props: {
      apiUrl: {
        type: String, // Prop type is String
        default: 'http://localhost/apiHydrolysisdb/AllUsers' // Default API URL
      }
    },
    data() {
      return {
        usuaris: [], // Llista dels usuaris obtinguts des de la api
        editingusuari: null, // Objecte que emmagatzema les dades de l'usuari que estem modifican
        filters: {
          name: '', // Filtre pel nom de l'usuari
          id: null, // Filtre pel ID de l'usuari
          email: '' // Filtre pel email de l'usuari
        },
        showFilters: false, // Obrir tancar filtres
        sortOption: 'id', // Opció d'ordenació actual (per defecte pel ID)
        formErrors: {}, // Objecte per emmagatzemar errors de validació del formulari (de moment no funciona bé)
        noUsuaris: false,
        showConfirmModal: false // Controla la visibilitat del modal de confirmació
      };
    },
    computed: {   
      // Comprobem els usuaris filtrats i ordenats segons els filtres i l'opció de la ordenació actual
      sortedAndFilteredusuaris() {
        let filtered = this.usuaris.filter(usuari => {
          // Filtra els usuaris basats en els criteris especificats
          const matchesName = this.filters.name
            ? usuari.nom.toLowerCase().includes(this.filters.name.toLowerCase())
            : true;
          const matchesID = this.filters.id
            ? usuari.usuariID === this.filters.id
            : true;
          const matchesEmail = this.filters.email
            ? usuari.email.toLowerCase().includes(this.filters.email.toLowerCase())
            : true;
          
          return matchesName && matchesID && matchesEmail;
        });
  
        // Ordena els usuaris segons de l'opció seleccionada (ID o nom)
        if (this.sortOption === 'id') {
          filtered.sort((a, b) => a.usuariID - b.usuariID);
        } else if (this.sortOption === 'name') {
          filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        }
  
        return filtered;
      }
    },
    methods: {
      // Obté la llista d'usuaris del servidor (api endpoint way) i actualitza el seu estat
      async fetchUsuaris() {
        try {
          const token = localStorage.getItem('token'); // Obtenir el token d'autenticació (jwt) des del localStorage
          const response = await axios.get(this.apiUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
        this.usuaris = response.data

        } catch (error) {
          this.noUsuaris = true;
          console.error('Error en obtenir els usuaris:', error);
        }
      },
  
      // Obrir o tancar els detalls d'un usuari
      toggleDetails(usuariID) {
        const usuari = this.usuaris.find(exp => exp.usuariID === usuariID);
        if (usuari) {
          usuari.showDetails = !usuari.showDetails; // Obrir o tancar els detalls
          if (usuari.showDetails && usuari.chartData && usuari.chartData.dates.length > 0) {
            this.drawChart(usuari); // Dibuixar el grafic si hi han dades
          }
        }
      },
  
      // Iniciar el process d'edició d'un usuari
      async editusuari(usuari) {
        this.editingusuari = { ...usuari }; //Crear una còpia de les dades de l'usuari
      },
  
      //Validacio del formulari d'edició
      validateForm() {
        this.formErrors = {}; // Neteja errors anteriors
        if (this.editingusuari.cognoms.length > 0 && this.editingusuari.cognoms.length < 2) {
          this.formErrors.cognoms = true; // Error si el cognom és massa curt nom.length < 2
        }
        if (this.editingusuari.nom.length > 0 && this.editingusuari.nom.length < 2) {
          this.formErrors.nom = true; // Error si el nom és massa curt nom.length < 2
        }
        // Validació del email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expressió regular per validar l'email
        if (!emailPattern.test(this.editingusuari.email)) {
            this.formErrors.email = true; // Error si l'email no és vàlid
        }
        return Object.keys(this.formErrors).length === 0; // Retorna si no hi ha errors
      },
  
      // Actualitza les dades de l'usuari al servidor si no hi han els errors en form
      async updateusuari() {
        if (!this.validateForm()) {
          console.error('Validació del formulari fallida:', this.formErrors);
          return; // Evitar l'enviacio si la validació falla
        }
  
        try {
          const token = localStorage.getItem('token');
          await axios.post('http://localhost/apiHydrolysisdb/UpdateUsuari', this.editingusuari, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await this.fetchUsuaris(); // Actualitza la llista d'usuaris després de l'actualitzacio (basicament torna a carregar els usuaris)
          this.editingusuari = null; // Tancar el formulari d'edició
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // Display an error message to the user
                this.formErrors.emailOcupat = true;
            } else {
                // Handle other errors
                console.error('Error en actualitzar l\'usuari:', error);
                alert('There was an error updating the user. Please try again.');
            }
        }
      },
  
      // Tancar el formulari d'edició sense desar els canvis (un close)
      closeEditForm() {
        this.editingusuari = null;
      },
  
      // Obrir/Tancar les opcions del filtre
      toggleFilterOptions() {
        this.showFilters = !this.showFilters;
      },
  
      // Aplicar els filtres seleccionats
      applyFilters() {
        // El mètode és cridat automàticament per la propietat del computed:
      },

      // Open confirmation modal
      openConfirmModal() {
        this.showConfirmModal = true;
      },
  
      // Handle confirm action
      async handleConfirm() {
        this.showConfirmModal = false;
        await this.updateusuari(); // Call updateusuari after confirmation
      }
    },
    created() {
      // Quan es crea el component, obtenir els usuaris i components + debug
      this.fetchUsuaris();
    },
    mounted() {
      console.log('API URL being used:', this.apiUrl); // Log the apiUrl to verify
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