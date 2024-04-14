import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app); // Inicializa Firestore

// Esta función se llamará cada vez que cambie el estado de autenticación del usuario
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // El usuario está autenticado, verifica si ya tiene datos en Firestore
        const userData = await obtenerDatosUsuario(user.uid);
        if (userData) {
            // Si ya tiene datos en Firestore, redirige a la página de inicio
            window.location.href = "mitablero";
        }
    }
});

// Agregar el evento submit al formulario de registro
const registro_Form = document.getElementById('registroForm');
registro_Form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir el envío del formulario

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const claveMaestro = document.getElementById("claveMaestro").value;

    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        // Registrar al usuario con Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Registro exitoso, obtener el ID del usuario
        const userId = userCredential.user.uid;

        // Guardar los datos del usuario en Firestore
        await guardarDatosUsuario(userId, nombre, apellidos, claveMaestro);

        // Guardar estado de autenticación en el almacenamiento local
        localStorage.setItem('usuarioAutenticado', true);

        // Redirigir a la página de inicio de sesión
        window.location.href = "mitablero";
    } catch (error) {
        // Si hay un error durante el registro, mostrar el mensaje de error
        alert("Error al registrar: " + error.message);
    }
});

const guardarDatosUsuario = async (userId, nombre, apellidos, claveMaestro) => {
    try {
        await setDoc(doc(db, 'users', userId), { nombre, apellidos, claveMaestro });
        console.log("Datos del usuario guardados en Firestore correctamente.");
    } catch (error) {
        console.error("Error al guardar los datos del usuario en Firestore:", error);
    }
};

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

// Verificar el estado de autenticación al cargar la página
window.onload = () => {
    const usuarioAutenticado = localStorage.getItem('usuarioAutenticado');
    if (usuarioAutenticado) {
        window.location.href = "mitablero";
    }
};



/*
export class ManageAccount {
    register(email, password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((_) => {
                window.location.href = "login.html";
                // Mostrar alerta de registro exitoso
                alert("Registro exitoso. Serás redirigido a la página de inicio de sesión.");
            })
            .catch((error) => {
                console.error(error.message);
                // Mostrar alerta de error de registro
                alert("Error al registrar: " + error.message);
            });
    }

    authenticate(email, password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((_) => {
                window.location.href = "index.html";
                // Mostrar alerta de inicio de sesión exitoso
                alert("Has iniciado sesión correctamente. Serás redirigido a la página principal.");
            })
            .catch((error) => {
                console.error(error.message);
                // Mostrar alerta de error de inicio de sesión
                alert("Error al iniciar sesión: " + error.message);
            });
    }

    signOut() {
        signOut(auth)
            .then((_) => {
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}*/