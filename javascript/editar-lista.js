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
            const querySnapshot = await getDocs(collection(db, 'grupos'));
            querySnapshot.forEach((doc) => {
                const grupoData = doc.data();
                if (grupoData.userID === userId) {
                    llenarTabla(grupoData.nombresAlumnos);
                }
            });
        } else {
            console.log("Usuario no autenticado.");
        }
    });
});

function llenarTabla(datos) {
    const tbody = document.querySelector('.tabla-alumnos tbody');
    tbody.innerHTML = '';
    const nombresOrdenados = datos.sort();
    nombresOrdenados.forEach((nombre, index) => {
        const [apellidos, ...nombres] = nombre.split(' ');
        const row = document.createElement('tr');
        const numeroRegistro = document.createElement('td');
        numeroRegistro.textContent = index + 1;
        row.appendChild(numeroRegistro);
        const apellidosCell = document.createElement('td');
        apellidosCell.textContent = apellidos;
        row.appendChild(apellidosCell);
        const nombresCell = document.createElement('td');
        nombresCell.textContent = nombres.join(' '); // Unir los nombres separados por un espacio
        row.appendChild(nombresCell);
        const opcionesCell = document.createElement('td');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btnEditar');
        opcionesCell.appendChild(btnEditar);
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('btnEliminar');
        opcionesCell.appendChild(btnEliminar);
        row.appendChild(opcionesCell);
        tbody.appendChild(row);
    });
    tablaAlumnos.addEventListener('click', function(event) {
        const target = event.target;
        const fila = target.closest('tr');

        if (target.classList.contains('btnEditar')) {
            editarFila(fila);
        } else if (target.classList.contains('btnEliminar')) {
            eliminarFila(fila);
        } else if (target.classList.contains('btnAceptarCambios')) {
            aceptarCambios(fila);
        }
    });
    function editarFila(fila) {
        const celdaApellidos = fila.querySelector('td:nth-child(2)');
        const celdaNombre = fila.querySelector('td:nth-child(3)');

        const inputApellidos = document.createElement('input');
        inputApellidos.type = 'text';
        inputApellidos.value = celdaApellidos.textContent;

        const inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.value = celdaNombre.textContent;

        celdaApellidos.innerHTML = '';
        celdaNombre.innerHTML = '';

        celdaApellidos.appendChild(inputApellidos);
        celdaNombre.appendChild(inputNombre);

        // Ocultar botones de editar y eliminar
        fila.querySelector('.btnEditar').style.display = 'none';
        fila.querySelector('.btnEliminar').style.display = 'none';

        // Crear botón de aceptar cambios
        const btnAceptarCambios = document.createElement('button');
        btnAceptarCambios.textContent = 'Aceptar';
        btnAceptarCambios.classList.add('btnAceptarCambios');
        fila.querySelector('td:last-child').appendChild(btnAceptarCambios);
    }
}