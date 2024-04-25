import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Obtener la instancia de autenticación de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        if (userDoc.exists() && adminDoc.exists()) {
            const userKey = userDoc.data().claveMaestro;
            const adminKey = adminDoc.data().claveAdmin;
            if (userKey === adminKey && window.location.pathname !== '/Tablero') {
                window.location.href = 'Tablero';
            } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                window.location.href = 'mitablero';
            }
        }
    } else if (window.location.pathname !== '/index') {
        window.location.href = 'index';
    }
});

document.querySelector('.btn_ver_estadisticas').addEventListener('click', function() {
    window.location.href = 'verEstadisticas.html';
});


