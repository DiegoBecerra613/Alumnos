import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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


