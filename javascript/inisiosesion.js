import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


const firebaseConfig = {
    apiKey: "AIzaSyBYaOFfj9umpzsfWWTtYD7KhOak2gUMwtM",
    authDomain: "alumassist.firebaseapp.com",
    projectId: "alumassist",
    storageBucket: "alumassist.appspot.com",
    messagingSenderId: "1080021803308",
    appId: "1:1080021803308:web:57a41937424d7b81decc89"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Esta función se llamará cada vez que cambie el estado de autenticación del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        // El usuario está autenticado, redirige a la página de inicio
        window.location.href = "mitablero";
    } else {
        // El usuario no está autenticado, permanece en la página actual
    }
});

// Esperar a que el DOM esté completamente cargado antes de acceder a los elementos del formulario
window.addEventListener("DOMContentLoaded", function() {
    // Agregar el evento submit al formulario
    document.getElementById("inicioSesionForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevenir el envío del formulario
        loginUser(); // Llamar a la función para iniciar sesión
    });

    function loginUser() {
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");

        // Imprimir los elementos de email y password en la consola
        console.log("Elemento de email:", emailElement);
        console.log("Elemento de password:", passwordElement);

        // Verificar si los elementos existen y tienen un valor
        if (emailElement && passwordElement && emailElement.value && passwordElement.value) {
            const email = emailElement.value;
            const password = passwordElement.value;

            // Iniciar sesión con Firebase Authentication
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Inicio de sesión exitoso, redirigir a "mitablero.html"
                    console.log("Inicio de sesión exitoso. Redireccionando a mitablero.html.");
                    window.location.href = "mitablero";
                })
                .catch((error) => {
                    // Si hay un error durante el inicio de sesión, mostrar el mensaje de error
                    alert("Error al iniciar sesión: " + error.message);
                });
        } else {
            console.error("No se encontraron los elementos de email y/o password, o los valores son null.");
        }
    }
});