import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyApGQm8o2efr0t8MBKczFF7yi7-lexS-xY",
    authDomain: "alumassistprueba.firebaseapp.com",
    projectId: "alumassistprueba",
    storageBucket: "alumassistprueba.appspot.com",
    messagingSenderId: "290788592374",
    appId: "1:290788592374:web:85967780d4373795ea3ad7",
    measurementId: "G-89RQQTTHMK"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await obtenerDatosUsuario(user.uid);
        if (userData) {
            const claveAdmin = await obtenerClaveAdmin();
            if (userData.claveMaestro === claveAdmin) {
                window.top.location.href = "Tablero";
            } else {
                window.top.location.href = "mitablero";
            }
        }
    }
});

// Esperar a que el DOM esté completamente cargado antes de acceder a los elementos del formulario
window.addEventListener("DOMContentLoaded", function() {
    // Agregar el evento submit al formulario
    document.getElementById("inicioSesionForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevenir el envío del formulario
        loginUser(); // Llamar a la función para iniciar sesión
    });
    // Agregar el event listener para la etiqueta <p> Olvidaste la contraseña?
    document.querySelector(".olvidaste-la-contrasea-LbD").addEventListener("click", function() {
        window.location.href = "RecuperarContraseña"; // Redirigir al usuario
    });

    function loginUser() {
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");

        // Mostrar el loader
        document.querySelector('.loader-background').classList.add('visible');

        // Verificar si los elementos existen y tienen un valor
        if (emailElement && passwordElement && emailElement.value && passwordElement.value) {
            const email = emailElement.value;
            const password = passwordElement.value;

            // Iniciar sesión con Firebase Authentication
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Inicio de sesión exitoso, redirigir según el tipo de usuario
                    console.log("Inicio de sesión exitoso.");
                    document.querySelector('.loader-background').classList.remove('visible');
                })
                .catch((error) => {
                    // Si hay un error durante el inicio de sesión, mostrar el mensaje de error
                    alert("Error al iniciar sesión: " + error.message);
                    document.querySelector('.loader-background').classList.remove('visible');
                });
        } else {
            console.error("No se encontraron los elementos de email y/o password, o los valores son null.");
        }
    }
});

const obtenerDatosUsuario = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        return null;
    }
};

const obtenerClaveAdmin = async () => {
    try {
        const claveAdminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        return claveAdminDoc.data().claveAdmin;
    } catch (error) {
        console.error("Error al obtener la clave de administrador:", error);
        return null;
    }
};
