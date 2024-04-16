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
        if (user) {
            cuerpo.classList.add('autenticado');
            const gruposQuerySnapshot = await getDocs(query(collection(db, 'grupos'), where('userID', '==', user.uid)));
            gruposQuerySnapshot.forEach(async (grupoDoc) => {
                const apellidosNombresAlumnos = grupoDoc.data().apellidosNombresAlumnos; // Obtener los apellidos y nombres de los alumnos
                const tablaAlumnos = document.querySelector('.tabla-alumnos tbody');
                tablaAlumnos.innerHTML = ''; // Limpiar las filas existentes
                apellidosNombresAlumnos.forEach(async (apellidosNombres) => {
                    const tr = document.createElement('tr');
                    const tdNumero = document.createElement('td');
                    const tdApellidos = document.createElement('td');
                    const tdNombres = document.createElement('td');
                    tdNumero.textContent = apellidosNombresAlumnos.indexOf(apellidosNombres) + 1; // Asignar el número de lista
                    const [apellidos, nombres] = apellidosNombres.split(' '); // Separar apellidos y nombres
                    tdApellidos.textContent = apellidos; // Asignar los apellidos
                    tdNombres.textContent = nombres; // Asignar los nombres
                    tr.appendChild(tdNumero);
                    tr.appendChild(tdApellidos);
                    tr.appendChild(tdNombres);
                    tablaAlumnos.appendChild(tr);
                });
            });
        } else {
            cuerpo.classList.remove('autenticado');
            window.location.href = 'index';
        }
    });
});
