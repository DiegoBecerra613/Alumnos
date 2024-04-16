import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Tu configuración de Firebase y código de inicialización aquí...
    const firebaseConfig = {
        apiKey: "AIzaSyBYaOFfj9umpzsfWWTtYD7KhOak2gUMwtM",
        authDomain: "alumassist.firebaseapp.com",
        projectId: "alumassist",
        storageBucket: "alumassist.appspot.com",
        messagingSenderId: "1080021803308",
        appId: "1:1080021803308:web:57a41937424d7b81decc89"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(); // Obtener la instancia de autenticación
    const cuerpo = document.querySelector('body');


    onAuthStateChanged(auth, async function (user) {
        console.log(user)
    });
});
