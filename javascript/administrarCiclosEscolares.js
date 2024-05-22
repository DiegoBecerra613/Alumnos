import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc, Timestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Mostrar el loader
    document.querySelector('.loader-background').classList.add('visible');
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
    const db = getFirestore(app);
    const auth = getAuth(); // Obtener la instancia de autenticación

    const fecha1 = document.querySelector('.fecha-1');
    const fecha2 = document.querySelector('.fecha-2');
    const btnCrearCiclo = document.querySelector('.btn-crear-ciclo');
    const contenedorACE = document.querySelector('.contenedor-ACE');

    function getMonthName(monthNumber) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[monthNumber - 1];
    }

    function formatDate(date) {
        const day = date.getDate();
        const month = getMonthName(date.getMonth() + 1);
        const year = date.getFullYear();
        return `${day} de ${month} del ${year}`;
    }

    async function loadCiclosEscolares() {
        const querySnapshot = await getDocs(collection(db, 'ciclosEscolares'));
        querySnapshot.forEach((documento) => {
            const data = documento.data();
            const inicio = new Date(data.inicio.seconds * 1000);
            const fin = new Date(data.fin.seconds * 1000);
            const recycleView = document.createElement('div');
            recycleView.innerHTML = `
        <div class="recyle-view-ciclo-escolar">
            <div class="text-ciclo-escolar">
                Ciclo Escolar:
            </div>
            <div class="text-fecha-ciclo-escolar">
                <span class="text-fechaCE">
                    ${formatDate(inicio)} - ${formatDate(fin)}
                </span>
            </div>
            <button class="btn-eliminar-grupo">
                <span class="eliminar-ciclo-escolar">
                    Eliminar Ciclo Escolar
                </span>
            </button>
        </div>
    `;
            recycleView.querySelector('.btn-eliminar-grupo').addEventListener('click', async () => {
                await deleteDoc(doc(db, 'ciclosEscolares', documento.id));
                recycleView.remove();
            });
            contenedorACE.appendChild(recycleView);
        });
// Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    }

    btnCrearCiclo.addEventListener('click', async () => {
        const inicio = new Date(fecha1.value);
        const fin = new Date(fecha2.value);

        const nombreDocumento = `${getMonthName(inicio.getMonth()+1)}${inicio.getFullYear()}-${getMonthName(fin.getMonth()+1)}${fin.getFullYear()}`;

        await setDoc(doc(db, 'ciclosEscolares', nombreDocumento), {
            inicio: Timestamp.fromDate(inicio),
            fin: Timestamp.fromDate(fin)
        });

        const recycleView = document.createElement('div');
        recycleView.innerHTML = `
        <div class="recyle-view-ciclo-escolar">
            <div class="text-ciclo-escolar">
                Ciclo Escolar:
            </div>
            <div class="text-fecha-ciclo-escolar">
                <span class="text-fechaCE">
                    ${formatDate(inicio)} - ${formatDate(fin)}
                </span>
            </div>
            <button class="btn-eliminar-grupo">
                <span class="eliminar-ciclo-escolar">
                    Eliminar Ciclo Escolar
                </span>
            </button>
        </div>
    `;
        recycleView.querySelector('.btn-eliminar-grupo').addEventListener('click', async () => {
            await deleteDoc(doc(db, 'ciclosEscolares', nombreDocumento));
            recycleView.remove();
        });
        contenedorACE.appendChild(recycleView);
    });


    loadCiclosEscolares();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
            if (userDoc.exists() && adminDoc.exists()) {
                const userKey = userDoc.data().claveMaestro;
                const adminKey = adminDoc.data().claveAdmin;
                if (userKey === adminKey && window.location.pathname !== '/administrarCiclosEscolares.html') {
                    window.location.href = 'administrarCiclosEscolares.html';
                } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                    window.location.href = 'mitablero';
                }
            }
        } else if (window.location.pathname !== '/index') {
            window.location.href = 'index';
        }
    });
});
