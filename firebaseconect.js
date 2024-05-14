import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyApGQm8o2efr0t8MBKczFF7yi7-lexS-xY",
    authDomain: "alumassistprueba.firebaseapp.com",
    projectId: "alumassistprueba",
    storageBucket: "alumassistprueba.appspot.com",
    messagingSenderId: "290788592374",
    appId: "1:290788592374:web:85967780d4373795ea3ad7",
    measurementId: "G-89RQQTTHMK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await obtenerDatosUsuario(user.uid);
        if (userData) {
            const claveAdmin = await obtenerClaveAdmin();
            if (userData.claveMaestro === claveAdmin) {
                window.location.href = "Tablero";
            } else {
                window.location.href = "mitablero";
            }
        }
    }
});

const registro_Form = document.getElementById('registroForm');

registro_Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const claveMaestro = document.getElementById("claveMaestro").value;

    try {
        //const claveAdmin = await obtenerClaveAdmin();
        //const claveMaestroDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        //const clavesMaestroArray = claveMaestroDoc.data().claveMaestro;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        await guardarDatosUsuario(userId, nombre, apellidos, claveMaestro);
        localStorage.setItem('usuarioAutenticado', true);
        window.location.href = "Tablero";

    } catch (error) {
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

const obtenerClaveAdmin = async () => {
    try {
        console.log("Intentando obtener la clave de administrador...");
        const claveAdminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        console.log("Clave de administrador obtenida:", claveAdminDoc.data().claveAdmin);
        return claveAdminDoc.data().claveAdmin;
    } catch (error) {
        console.error("Error al obtener la clave de administrador:", error);
        return null;
    }
};

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