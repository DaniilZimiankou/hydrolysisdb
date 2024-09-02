<template>
  <div class="register-container">
    <h2 class="register-title">Registra't</h2>
    <form @submit.prevent="register" class="register-form">
      <!-- Name Field -->
      <div class="form-group">
        <label for="name" class="form-label">Nom:</label>
        <input id="name" v-model="nom" type="text" required class="form-input" />
        <p v-if="formErrors.nom" class="error-message">El nom ha de tenir almenys 2 caràcters.</p>
      </div>

      <!-- Surname Field -->
      <div class="form-group">
        <label for="surname" class="form-label">Cognom:</label>
        <input id="surname" v-model="cognoms" type="text" required class="form-input" />
        <p v-if="formErrors.cognoms" class="error-message">Els cognoms han de tenir almenys 2 caràcters.</p>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">Correu electrònic:</label>
        <input id="email" v-model="email" type="email" required class="form-input" />
        <p v-if="formErrors.email" class="error-message">El correu electrònic introduït no és vàlid.</p>
        <p v-if="formErrors.emailOcupat" class="error-message">El correu electrònic ocupat</p>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">Contrasenya:</label>
        <input id="password" v-model="passwd" type="password" required class="form-input" />
        <p v-if="formErrors.passwd" class="error-message">
          La contrasenya ha de tenir almenys 8 caràcters, incloent majúscules, minúscules i números.
        </p>
      </div>

      <!-- Repeat Password Field -->
      <div class="form-group">
        <label for="repeatPassword" class="form-label">Repiteix la contrasenya:</label>
        <input id="repeatPassword" v-model="repeatPassword" type="password" required class="form-input" />
        <p v-if="formErrors.repeatPassword" class="error-message">Les contrasenyes no coincideixen.</p>
      </div>

      <!-- Buttons -->
      <div class="button-group">
        <button type="submit" class="submit-button">Registra't</button>
        <button @click="goToLogin" type="button" class="secondary-button">Torna a Login</button>
      </div>

      <!-- Error Message -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Definim les referències pels camps del formulari
const nom = ref('');
const cognoms = ref('');
const email = ref('');
const passwd = ref('');
const repeatPassword = ref('');
const errorMessage = ref('');
const formErrors = ref({});

//router per navegar entre les pàgines
const router = useRouter();

// Expressió regular per validar l'email
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Funció per validar el formulari
const validateForm = () => {
  formErrors.value = {};

  // Validació del nom
  if (nom.value.length < 2) {
    formErrors.value.nom = true;
  }

  // Validació dels cognoms
  if (cognoms.value.length < 2) {
    formErrors.value.cognoms = true;
  }

  // Validació del email
  if (!emailPattern.test(email.value)) {
    formErrors.value.email = true;
  }

  // Validació de la contrasenya
  if (passwd.value.length < 8 || !/[A-Z]/.test(passwd.value) || !/[a-z]/.test(passwd.value) || !/[0-9]/.test(passwd.value)) {
    formErrors.value.passwd = true;
  }

  // Comprovem si les contrasenyes coincideixen
  if (passwd.value !== repeatPassword.value) {
    formErrors.value.repeatPassword = true;
  }

  return Object.keys(formErrors.value).length === 0;
};

//Funció per registrar-se
const register = async () => {
  // Comprova si el formulari és vàlid
  if (!validateForm()) {
    errorMessage.value = "Si us plau, corregeix els errors del formulari.";
    return;
  }

  try {
    // Enviem la sol·licitud de registre al servidor
    const response = await axios.post('http://localhost/apiHydrolysisdb/Register', {
      nom: nom.value,
      cognoms: cognoms.value,
      email: email.value,
      passwd: passwd.value // La contrasenya s'encripta al backend
    });

    // Comprovem la resposta del servidor
    if (response.data.message === "User registered successfully") {
    // Redirect user to login
    router.push('/login');
    } else if (response.data.message === "The email is already in use.") {
    // Set form error for email already in use
    formErrors.value.emailOcupat = true;
    } else {
      // Handle other errors
      errorMessage.value = response.data.message || 'Error en el registre';
    }
  } catch (error) {
    // Gestionem qualsevol error que pot sorgir
    errorMessage.value = error.response?.data?.message || error.message;
  }
};

//Funció per redirigir al login
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
/* Container */
.register-container {
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  background-color: #EAF9FF;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #ddd;
}

/* Title */
.register-title {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #333;
}

/* Form Styles */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Form Group */
.form-group {
  text-align: left;
}

/* Labels */
.form-label {
  font-size: 0.9em;
  margin-bottom: 5px;
  color: #666;
  display: block;
}

/* Inputs */
.form-input {
  width: 95%;
  padding: 8px;
  font-size: 0.9em;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #007bff;
  outline: none;
}

/* Buttons */
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.submit-button,
.secondary-button {
  padding: 8px 15px;
  font-size: 1em;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button {
  background-color: #007bff;
  color: #fff;
}

.submit-button:hover {
  background-color: #0056b3;
}

.secondary-button {
  background-color: #6c757d;
  color: #fff;
}

.secondary-button:hover {
  background-color: #5a6268;
}

/* Error Messages */
.error-message {
  font-size: 0.85em;
  color: #dc3545;
  margin-top: 5px;
  text-align: left;
}
</style>