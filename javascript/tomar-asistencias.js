import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
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
    const cuerpo = document.querySelector('body');

// Función para asignar el color del botón basándose en su valor
    function asignarColor(btn) {
        let valor = parseFloat(btn.textContent);
        if (valor === 0) {
            btn.classList.remove('asistio', 'inasistencia', 'falta-justificada');
        } else if (valor === 1) {
            btn.classList.add('asistio');
            btn.classList.remove('inasistencia', 'falta-justificada');
        } else if (valor === -1) {
            btn.classList.add('inasistencia');
            btn.classList.remove('asistio', 'falta-justificada');
        } else if (valor === 0.5) {
            btn.classList.add('falta-justificada');
            btn.classList.remove('asistio', 'inasistencia');
        }
    }
// Función para cambiar el valor y el color del botón
    function cambiarValorColor(btn) {
        let valor = parseFloat(btn.textContent);
        if (valor === 0) {
            valor = 1;
            btn.classList.add('asistio');
            btn.classList.remove('inasistencia', 'falta-justificada');
        } else if (valor === 1) {
            valor = -1;
            btn.classList.add('inasistencia');
            btn.classList.remove('asistio', 'falta-justificada');
        } else if (valor === -1) {
            valor = 0.5;
            btn.classList.add('falta-justificada');
            btn.classList.remove('asistio', 'inasistencia');
        } else {
            valor = 0;
            btn.classList.remove('falta-justificada', 'asistio', 'inasistencia');
        }
        btn.textContent = valor.toString();
        return valor;
    }

// Función para crear la tabla
    async function crearTabla(grupoDoc, letras, listaDoc, fechasDoc, tablas) {
        const mapa = listaDoc.data()[letras];
        const array = fechasDoc.data()[letras];

        // Convertir el objeto mapa en un array de pares clave-valor y ordenarlo por las claves (nombres)
        const mapaOrdenado = Object.entries(mapa).sort();

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        for (let fecha of array) {
            const th = document.createElement('th');
            th.textContent = fecha;
            th.classList.add('vertical-text'); // Agrega la clase para texto vertical
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        const tbody = document.createElement('tbody');

        // Iterar sobre el array ordenado en lugar del objeto mapa
        for (let [nombre, asistencias] of mapaOrdenado) {
            const trBody = document.createElement('tr');
            for (let asistencia of asistencias) {
                const td = document.createElement('td');
                const btn = document.createElement('button');
                btn.classList.add('btn-asistencia');
                btn.textContent = asistencia;
                asignarColor(btn)
                // Almacenar la información necesaria en el botón
                btn.dataset.grupoId = grupoDoc.id;
                btn.dataset.grado = grupoDoc.data().grado;
                btn.dataset.grupo = grupoDoc.data().grupo;
                btn.dataset.letras = letras;
                btn.dataset.nombre = nombre;
                td.appendChild(btn);
                trBody.appendChild(td);
            }
            tbody.appendChild(trBody);
        }

        const tabla = document.querySelector('.tabla-asistencias');
        tabla.innerHTML = '';
        tabla.appendChild(thead);
        tabla.appendChild(tbody);
        tablas.push(tabla.innerHTML);
    }

// Función para crear la tabla de alumnos
    async function crearTablaAlumnos(grupoDoc) {
        const nombresAlumnos = grupoDoc.data().nombresAlumnos.sort(); // Obtener y ordenar los nombres de los alumnos
        const tbody = document.querySelector('.tabla-alumnos tbody');
        tbody.innerHTML = ''; // Limpiar las filas existentes
        for (let i = 0; i < nombresAlumnos.length; i++) {
            const trBody = document.createElement('tr');
            const tdNumeroLista = document.createElement('td');
            tdNumeroLista.textContent = i + 1; // Asignar el número de lista
            trBody.appendChild(tdNumeroLista);
            const tdNombre = document.createElement('td');
            tdNombre.textContent = nombresAlumnos[i]; // Asignar el nombre del alumno
            trBody.appendChild(tdNombre);
            tbody.appendChild(trBody);
        }
    }
// Función para obtener todos los meses entre dos fechas
    function obtenerMeses(inicio, fin) {
        const meses = [];
        const fechaInicio = inicio.toDate(); // Convertir el Timestamp a Date
        const fechaFin = fin.toDate(); // Convertir el Timestamp a Date
        fechaFin.setMonth(fechaFin.getMonth() + 1); // Añadir un mes a la fecha de fin
        while (fechaInicio < fechaFin) {
            meses.push(fechaInicio.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase());
            fechaInicio.setMonth(fechaInicio.getMonth() + 1);
        }
        console.log('Meses:', meses); // Imprimir los meses en la consola
        return meses;
    }


    onAuthStateChanged(auth, async function (user) {
        if (user) {
            cuerpo.classList.add('autenticado');
            const gruposQuerySnapshot = await getDocs(query(collection(db, 'grupos'), where('userID', '==', user.uid)));
            const tablas = [];
            let tablaActual = 0;
            gruposQuerySnapshot.forEach(async (grupoDoc) => {
                const grupoData = grupoDoc.data();
                const grado = grupoData.grado;
                const grupo = grupoData.grupo;
                const cicloEscolarDoc = await getDoc(doc(db, 'ciclosEscolares', grupoDoc.data().cicloEscolarID));
                const inicio = cicloEscolarDoc.data().inicio;
                const fin = cicloEscolarDoc.data().fin;
                console.log('Inicio:', inicio); // Imprimir la fecha de inicio en la consola
                console.log('Fin:', fin); // Imprimir la fecha de fin en la consola
                // Obtener todos los meses entre las fechas de inicio y fin
                const meses = obtenerMeses(inicio, fin);
                const nombreDocumentoLista = `lista${grado}${grupo}`;
                const listaDoc = await getDoc(doc(db, 'grupos', grupoDoc.id, 'lista', nombreDocumentoLista));
                const fechasDoc = await getDoc(doc(db, 'grupos', grupoDoc.id, 'lista', 'fecha'));
                const letras = Object.keys(listaDoc.data()).sort();
                for (let letra of letras) {
                    await crearTabla(grupoDoc, letra, listaDoc, fechasDoc, tablas);
                }
                await crearTablaAlumnos(grupoDoc);
                document.querySelector('.tabla-asistencias').innerHTML = tablas[tablaActual];
                document.querySelector('.text-mes').textContent = meses[tablaActual]; // Establecer el nombre del mes cuando se carga la página
                document.querySelector('.btn-anterior-mes').addEventListener('click', function () {
                    if (tablaActual > 0) {
                        tablaActual--;
                        document.querySelector('.tabla-asistencias').innerHTML = tablas[tablaActual];
                        console.log('Tabla actual:', tablaActual); // Imprimir la tabla actual en la
                        document.querySelector('.text-mes').textContent = meses[tablaActual];
                        console.log('Nombre del mes:', meses[tablaActual]); // Imprimir el nombre del mes en la consola
                    }
                });
                document.querySelector('.btn-siguiente-mes').addEventListener('click', function () {
                    if (tablaActual < tablas.length - 1) {
                        tablaActual++;
                        document.querySelector('.tabla-asistencias').innerHTML = tablas[tablaActual];
                        console.log('Tabla actual:', tablaActual); // Imprimir la tabla actual en la
                        document.querySelector('.text-mes').textContent = meses[tablaActual];
                        console.log('Nombre del mes:', meses[tablaActual]); // Imprimir el nombre del mes en la consola
                    }
                });
            });
        } else {
            cuerpo.classList.remove('autenticado');
            window.location.href = 'index';
        }
    });

// Delegación de eventos
    document.querySelector('.tabla-asistencias').addEventListener('click', async function (event) {
        if (event.target.matches('.btn-asistencia')) {
            const btn = event.target;
            const nuevoValor = cambiarValorColor(btn);
            // Recuperar la información del botón
            const grupoId = btn.dataset.grupoId;
            const grado = btn.dataset.grado;
            const grupo = btn.dataset.grupo;
            const letras = btn.dataset.letras;
            const nombre = btn.dataset.nombre;
            // Actualizar el valor en la base de datos
            const listaDocRef = doc(db, 'grupos', grupoId, 'lista', `lista${grado}${grupo}`);
            const listaDoc = await getDoc(listaDocRef);
            const data = listaDoc.data();
            if (data && data[letras] && data[letras][nombre]) {
                data[letras][nombre][btn.parentElement.cellIndex] = nuevoValor;
                await updateDoc(listaDocRef, data);
            } else {
                console.error('El array no existe');
            }
        }
    });

});