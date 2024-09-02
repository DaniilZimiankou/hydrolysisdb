<template>
  <div class="home-container">
    <!-- Header Section -->
    <div class="home-header">
      <h1>Home</h1>
      <p v-if="usuaris">Hola {{ usuaris.nom }}</p>
    </div>

    <!-- User Details Section -->
    <ul v-if="usuaris" class="user-details">
      <li>
        <div class="user-info-card">
          <h2>Dades d'Usuari</h2>
          <p><strong>Nom:</strong> {{ usuaris.nom }}</p>
          <p><strong>Cognoms:</strong> {{ usuaris.cognoms }}</p>
          <p><strong>Email:</strong> {{ usuaris.email }}</p>
          <p><strong>Rol:</strong> {{ usuaris.rol }}</p>

          <!-- Edit Button -->
          <button class="edit-button styled-button" @click="editusuari(usuaris)">
            Modifica
          </button>
        </div>
      </li>
    </ul>

    <!-- Edit User Modal -->
    <div v-if="editingusuari" class="modal">
      <div class="modal-content">
        <h2>Modificar dades</h2>
        <form @submit.prevent="updateusuari" class="edit-form">
          <label class="form-label">
            Nom:
            <input v-model="editingusuari.nom" type="text" class="styled-input" />
          </label>
          <label class="form-label">
            Cognoms:
            <input v-model="editingusuari.cognoms" type="text" class="styled-input" />
          </label>
          <label class="form-label">
            Email:
            <input v-model="editingusuari.email" type="email" class="styled-input" />
          </label>

          <!-- Error Messages -->
          <p v-if="formErrors.cognoms" class="error-message">Els cognoms han de tenir almenys 2 caràcters.</p>
          <p v-if="formErrors.nom" class="error-message">El nom ha de tenir almenys 2 caràcters.</p>
          <p v-if="formErrors.emailOcupat" class="error-message">El correu electrònic ja està ocupat.</p>
          <p v-if="formErrors.email" class="error-message">El format de correu electrònic no es correcte.</p>

          <!-- Action Buttons -->
          <div class="modal-buttons">
            <button type="button" class="styled-button" @click="openConfirmModal">Desa els canvis</button>
            <button type="button" class="styled-button cancel-button" @click="closeEditForm">Cancel·la</button>
          </div>
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
        type: String,
        default: 'http://localhost/apiHydrolysisdb/dataUser' //Default Api URL
      }
    },
    data() {
      return {
        usuaris: null, // Dades del usuari obtingut des de la api
        editingusuari: null, // Objecte que emmagatzema les dades de l'usuari que estem modifican
        formErrors: {}, // Objecte per emmagatzemar errors de validació del formulari (de moment no funciona bé)
        showConfirmModal: false // Controla la visibilitat del modal de confirmació
      };
    },
    methods: {
      // Obté les dades d'usuari del servidor (api endpoint way)
      async fetchUsuaris() {
        try {
          const token = localStorage.getItem('token'); // Obtenir el token d'autenticació (jwt) des del localStorage
          const response = await axios.get(this.apiUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.usuaris = response.data[0]; // Asumir que la resposta d'array és un usuari
        } catch (error) {
          console.error('Error en obtenir els usuaris:', error);
        }
      },
  
      // Iniciar el process d'edició d'un usuari
      editusuari(usuaris) {
        this.editingusuari = { ...usuaris };
      },
      
      //Validacio del formulari d'edició
      validateForm() {
        this.formErrors = {}; // Neteja errors anteriors
        if (this.editingusuari.cognoms.length > 0 && this.editingusuari.cognoms.length < 2) {
          this.formErrors.cognoms = true; // Error si cognoms.length < 2
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
          await axios.post('http://localhost/apiHydrolysisdb/UpdateMyUsuari', this.editingusuari, {
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
      this.fetchUsuaris();
    },
    mounted() {
      console.log('API URL being used:', this.apiUrl); // Log the apiUrl to verify
    }
  };
  </script>
  
  <style scoped>
  /* Container and Header */
  .home-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    background-color: #f7f9fc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .home-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .home-header h1 {
    color: #333;
    font-size: 2rem;
  }
  
  .home-header p {
    color: #666;
    font-size: 1.2rem;
    margin-top: 10px;
  }
  
  /* User Details */
  .user-details {
    list-style: none;
    padding: 0;
    margin: 20px 0;
  }
  
  .user-info-card {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 10px;
  }
  
  .user-info-card h2 {
    color: #007bff;
    margin-bottom: 10px;
  }
  
  .user-info-card p {
    margin: 5px 0;
    color: #333;
  }
  
  /* Buttons */
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
  
  .cancel-button {
    background-color: #d9534f;
  }
  
  .cancel-button:hover {
    background-color: #c9302c;
  }
  
  /* Modal Styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-label {
    font-weight: bold;
    color: #333;
  }
  
  .styled-input {
    width: 95%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-top: 5px;
  }
  
  .error-message {
    color: red;
    font-size: 0.9rem;
    margin: 5px 0;
  }
  
  /* Modal Buttons */
  .modal-buttons {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  /*OLD ONES///////////////////////////////////////////*/
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