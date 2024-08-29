<template>
    <div>
      <div>
        <h1>Home</h1>
        <p v-if="usuaris">Hola {{ usuaris.nom }}</p>
      </div>
  
      <!-- Mostrar user details si usuari es un objecte i no buid -->
      <ul v-if="usuaris">
        <li>
          <div>
            <p>Dades d'Usuari</p>
            <p>Nom: {{ usuaris.nom }}</p>
            <p>Cognoms: {{ usuaris.cognoms }}</p>
            <p>Email: {{ usuaris.email }}</p>
            <p>Rol: {{ usuaris.rol }}</p>
  
            <!-- Botó de modificar -->
            <button @click="editusuari(usuaris)">
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
              <input v-model="editingusuari.nom" type="text" />
            </label>
            <label>
              Cognoms:
              <input v-model="editingusuari.cognoms" type="text" />
            </label>
            <label>
              Email:
              <input v-model="editingusuari.email" type="email" />
            </label>
            <p v-if="formErrors.cognoms" style="color: red;">Els cognoms han de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.nom" style="color: red;">El nom ha de tenir almenys 2 caràcters.</p>
            <p v-if="formErrors.emailOcupat" style="color: red;">El correu electrònic ja està ocupat.</p>
            <p v-if="formErrors.email" style="color: red;">El format de correu electrònic no es correcte.</p>
            <button type="submit">Desa els canvis</button>
            <button type="button" @click="closeEditForm">Cancel·la</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
//   import ConfirmationModal from './ConfirmationModal.vue'; // Adjust the path as needed
  
  export default {
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
        this.formErrors = {};// Neteja errors anteriors
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
      }
    },
    // Quan es crea el component, obtenir les dades del usuari
    created() {
      this.fetchUsuaris();
    },
    mounted() {
      console.log('API URL being used:', this.apiUrl);// Log the apiUrl to verify
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