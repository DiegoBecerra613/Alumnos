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

// Función para llenar la tabla con los datos de los alumnos
function llenarTabla(datos) {
    // Obtener el cuerpo de la tabla
    const tbody = document.querySelector('.tabla-alumnos tbody');
  
    // Limpiar el contenido actual de la tabla
    tbody.innerHTML = '';
  
    // Ordenar los nombres de los alumnos alfabéticamente
    const nombresOrdenados = datos.sort();
  
    // Iterar sobre los nombres ordenados y agregar filas a la tabla
    nombresOrdenados.forEach((nombre, index) => {
        // Dividir el nombre en apellidos y nombres
        const [apellidos, ...nombres] = nombre.split(' ');
        console.log(apellidos);
        console.log(nombres);
      
        // Crear una nueva fila de la tabla
        const row = document.createElement('tr');
      
        // Añadir número de registro (index + 1)
        const numeroRegistro = document.createElement('td');
        numeroRegistro.textContent = index + 1;
        row.appendChild(numeroRegistro);
      
        // Añadir apellidos
        const apellidosCell = document.createElement('td');
        apellidosCell.textContent = apellidos;
        row.appendChild(apellidosCell);
      
        // Añadir nombres
        const nombresCell = document.createElement('td');
        nombresCell.textContent = nombres.join(' '); // Unir los nombres separados por un espacio
        row.appendChild(nombresCell);
      
        // Añadir celda de opciones (podrías añadir botones de editar, eliminar, etc.)
        const opcionesCell = document.createElement('td');
        opcionesCell.textContent = 'Opciones'; // Aquí podrías añadir botones de editar, eliminar, etc.
        row.appendChild(opcionesCell);
      
        // Agregar la fila a la tabla
        tbody.appendChild(row);
    });
}