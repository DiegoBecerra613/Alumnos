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
            const userId = user.uid;
            const querySnapshot = await getDocs(query(collection(db, 'grupos'), orderBy('nombresAlumnos')));
            const tablaBody = document.querySelector('.tabla-alumnos tbody');
            let numeroLista = 1;
            querySnapshot.forEach((doc) => {
                const grupoData = doc.data();
                if (grupoData.userID === userId) {
                    const nombre = grupoData.nombresAlumnos;
                    const apellidos = grupoData.apellidosAlumnos;
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${numeroLista}</td>
                        <td>${apellidos}</td>
                        <td>${nombre}</td>
                        <td class="opciones">
                            <button class="btnEditar">Editar</button>
                            <button class="btnEliminar">Eliminar</button>
                        </td>
                    `;
                    tablaBody.appendChild(fila);
                    numeroLista++;
                }
            });
        } else {
            console.log("Usuario no autenticado.");
        }
    });
});
