<template>
  <div class="register">
    <h2>Registra't</h2>
    <form @submit.prevent="register">
      <div>
        <label for="name">Nom:</label>
        <input id="name" v-model="nom" type="text" required />
        <p v-if="formErrors.nom" class="error">El nom ha de tenir almenys 2 caràcters.</p>
      </div>
      <div>
        <label for="surname">Cognom:</label>
        <input id="surname" v-model="cognoms" type="text" required />
        <p v-if="formErrors.cognoms" class="error">Els cognoms han de tenir almenys 2 caràcters.</p>
      </div>
      <div>
        <label for="email">Correu electrònic:</label>
        <input id="email" v-model="email" type="email" required />
        <p v-if="formErrors.email" class="error">El correu electrònic introduït no és vàlid.</p>
        <p v-if="formErrors.emailOcupat" class="error">El correu electrònic ocupat</p>
      </div>
      <div>
        <label for="password">Contrasenya:</label>
        <input id="password" v-model="passwd" type="password" required />
        <p v-if="formErrors.passwd" class="error">La contrasenya ha de tenir almenys 8 caràcters, incloent majúscules, minúscules i números.</p>
      </div>
      <div>
        <label for="repeatPassword">Repiteix la contrasenya:</label>
        <input id="repeatPassword" v-model="repeatPassword" type="password" required />
        <p v-if="formErrors.repeatPassword" class="error">Les contrasenyes no coincideixen.</p>
      </div>
      <div>
        <button type="submit">Registra't</button>
        <button @click="goToLogin" type="button">Torna a Login</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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

<style>
.register {
  max-width: 400px;
  margin: 0 auto;
}
.error {
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
}
</style>