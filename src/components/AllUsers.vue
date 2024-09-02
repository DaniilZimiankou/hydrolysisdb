<template>
  <div class="users-container">
    <!-- Header Section -->
    <div class="header-section">
      <h1>Els usuaris</h1>
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
        <input v-model="filters.email" placeholder="Filtra per email" class="styled-input" />
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

    <!-- No Users Message -->
    <div v-if="noUsuaris" class="no-users">
      <h1>No tens usuaris en la app</h1>
      <p>Els hi pots crear en l'apartat "Crear Usuaris"</p>
    </div>

    <!-- Users List -->
    <ul class="users-list">
      <li v-for="usuari in sortedAndFilteredusuaris" :key="usuari.usuariID" class="user-item">
        <span class="user-info">{{ usuari.usuariID }}: {{ usuari.email }}: {{ usuari.nom }}</span>
        <button @click="toggleDetails(usuari.usuariID)" class="toggle-button">
          {{ usuari.showDetails ? 'Tanca' : 'Obre' }}
        </button>

        <!-- User Details -->
        <div v-if="usuari.showDetails" class="user-details">
          <p>Nom: {{ usuari.nom }}</p>
          <p>Cognoms: {{ usuari.cognoms }}</p>
          <p>Email: {{ usuari.email }}</p>
          <p>Rol: {{ usuari.rol }}</p>

          <!-- Edit Button -->
          <button @click="editusuari(usuari)" class="styled-button">Modifica</button>
        </div>
      </li>
    </ul>

    <!-- Edit User Modal -->
    <div v-if="editingusuari" class="modal-overlay" @click.self="closeEditForm">
      <div class="modal-content">
        <h2>Modificar dades</h2>
        <form @submit.prevent="updateusuari" class="edit-form">
          <label>
            Nom:
            <input v-model="editingusuari.nom" type="text" class="styled-input" />
          </label>
          <label>
            Cognoms:
            <input v-model="editingusuari.cognoms" type="text" class="styled-input" />
          </label>
          <label>
            Email:
            <input v-model="editingusuari.email" type="email" class="styled-input" />
          </label>
          <label>
            Rol:
            <select v-model="editingusuari.rol" class="styled-select">
              <option value="tecnic">tecnic</option>
              <option value="administrador">administrador</option>
            </select>
          </label>

          <!-- Error Messages -->
          <div class="form-errors">
            <p v-if="formErrors.cognoms" class="error-message">Els cognoms han de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.nom" class="error-message">El nom ha de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.emailOcupat" class="error-message">El correu electrònic ja està ocupat.</p>
            <p v-if="formErrors.email" class="error-message">El format de correu electrònic no es correcte.</p>
          </div>

          <!-- Save and Cancel Buttons -->
          <button type="button" @click="openConfirmModal" class="styled-button submit-button">Desa els canvis</button>
          <button type="button" @click="closeEditForm" class="styled-button cancel-button">Cancel·la</button>
        </form>

        <!-- Confirmation Modal -->
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
/* Container */
.users-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
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

/* Users List */
.users-list {
  list-style: none;
  padding: 0;
}

.user-item {
  padding: 15px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.user-info {
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

/*OLD ones////////////////////////////////////////////*/
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