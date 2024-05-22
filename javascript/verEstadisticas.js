import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de autenticación de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Obtener los nombres de los documentos de la colección 'grupo'
const grupoCollection = collection(db, 'grupos');
const grupoDocs = await getDocs(grupoCollection);
let grupoNames = [];
grupoDocs.forEach((doc) => {
    grupoNames.push(doc.id);
});

// Agregar los nombres de los documentos al selector "gradoSelected"
const gradoSelector = document.getElementById('gradoSelected');
grupoNames.forEach((name) => {
    let option = document.createElement('option');
    option.value = name;
    option.text = name;
    gradoSelector.add(option);
    // Ocultar el loader una vez que los datos se hayan cargado
    document.querySelector('.loader-background').classList.remove('visible');
});

// Cuando el usuario presione el botón "btnAceptar"
document.querySelector('.btnAceptar').addEventListener('click', async () => {
    // Limpiar la barra de progreso
    let progressBar = document.querySelector('.progress-bar');
    while (progressBar.firstChild) {
        progressBar.removeChild(progressBar.firstChild);
    }
    let meses = [];

    // Tomar el documento seleccionado
    let selectedGrupo = gradoSelector.value;


    const actualizarTextoMes = (meses, currentIndex) => {
        const elementoMes = document.querySelector('.text-asistencias-por-mes');
        if (elementoMes && currentIndex < meses.length) {
            elementoMes.innerHTML = `Asistencias por mes<br>${meses[currentIndex]}`;
        }
    };

    // Dirigirse a la subcolección 'lista'
    const listaDoc = await getDoc(doc(db, 'grupos', selectedGrupo, 'lista', 'lista' + selectedGrupo));
    const listaAlumnosDoc = await getDoc(doc(db, 'grupos', selectedGrupo));
    if (listaDoc.exists() && listaAlumnosDoc.exists()) {
        const cicloEscolarID = listaAlumnosDoc.data().cicloEscolarID;
        const cicloDoc = await getDoc(doc(db, 'ciclosEscolares', cicloEscolarID));
        if (cicloDoc.exists()) {
            const inicio = cicloDoc.data().inicio.toDate(); // Convertir a objeto Date
            const fin = cicloDoc.data().fin.toDate(); // Convertir a objeto Date

            let fecha = new Date(inicio);
            while (true) {
                const mes = fecha.toLocaleString('default', { month: 'long' }).toUpperCase();
                const año = fecha.getFullYear();
                meses.push(`${mes} ${año}`);
                if (fecha > fin) {
                    break;
                }
                fecha.setMonth(fecha.getMonth() + 1);
            }
            // Actualizar el texto del primer mes
            actualizarTextoMes(meses,0);

        }
        // Tomar todos los mapas con los arreglos
        let data = listaDoc.data();
        let alumnosData = listaAlumnosDoc.data();
        let nombresAlumnos = alumnosData.nombresAlumnos.sort();
        // Crear un objeto para almacenar los datos agrupados por nombre
        let groupedData = {};

        // Agrupar los arrays por nombre
        for (let map in data) {
            for (let array in data[map]) {
                if (!groupedData[array]) {
                    groupedData[array] = [];
                }
                groupedData[array] = groupedData[array].concat(data[map][array]);
            }
        }

        // Convertir el objeto a un array y ordenarlo alfabéticamente
        let sortedData = Object.entries(groupedData).sort();

        // Limpiar la tabla antes de agregar nuevos datos
        let table = document.querySelector('.tabla-asistencias-ciclo-escolar tbody');
        let tableAlumnos = document.querySelector('.tabla-alumnos tbody');
        table.innerHTML = '';
        tableAlumnos.innerHTML = '';

        let totalAsistencias = 0;
        let totalInasistencias = 0;
        let totalFaltasJustificadas = 0;

        // Realizar los cálculos y agregarlos a la tabla
        for (let i = 0; i < sortedData.length; i++) {
            let array = sortedData[i][1];

            // Contar los elementos que sean diferentes de "0"
            let totalDias = array.filter(x => x !== 0).length;

            // Sumar o restar dependiendo de los valores de los elementos del array
            let puntaje = array.reduce((a, b) => a + b, 0);

            // Calcular el porcentaje de asistencias
            let porcentaje = (puntaje / totalDias) * 100;

            // Agregar los cálculos a la tabla
            let row = table.insertRow();
            row.insertCell().textContent = totalDias;
            row.insertCell().textContent = puntaje;
            row.insertCell().textContent = porcentaje.toFixed(2) + '%';

            // Contar las asistencias, inasistencias y faltas justificadas
            totalAsistencias += array.filter(x => x === 1).length;
            totalInasistencias += array.filter(x => x === -1).length;
            totalFaltasJustificadas += array.filter(x => x === 0.5).length;
        }
        for (let i = 0; i < nombresAlumnos.length; i++) {
            let row = tableAlumnos.insertRow();
            row.insertCell().textContent = i + 1;
            row.insertCell().textContent = nombresAlumnos[i];
        }
        // Calcular los porcentajes para la barra de progreso
        let totalDias = totalAsistencias + totalInasistencias + totalFaltasJustificadas;
        let porcentajeAsistencias = (totalAsistencias / totalDias) * 100;
        let porcentajeInasistencias = (totalInasistencias / totalDias) * 100;
        let porcentajeFaltasJustificadas = (totalFaltasJustificadas / totalDias) * 100;

        // Limpiar la barra de progreso antes de agregar nuevos datos
        let progressBar = document.querySelector('.progress-bar');
        progressBar.innerHTML = '';

        let segmentoAsistencias = document.createElement('span');
        segmentoAsistencias.className = 'progress-segment';
        segmentoAsistencias.style.width = porcentajeAsistencias + '%';
        segmentoAsistencias.style.backgroundColor = '#05FF00';
        segmentoAsistencias.textContent = porcentajeAsistencias.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
        segmentoAsistencias.title = 'Asistencias: ' + porcentajeAsistencias.toFixed(2) + '%'; // Agregar tooltip
        progressBar.appendChild(segmentoAsistencias);
        let segmentoInasistencias = document.createElement('span');
        segmentoInasistencias.className = 'progress-segment';
        segmentoInasistencias.style.width = porcentajeInasistencias + '%';
        segmentoInasistencias.style.backgroundColor = '#FF0000';
        segmentoInasistencias.textContent = porcentajeInasistencias.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
        segmentoInasistencias.title = 'Inasistencias: ' + porcentajeInasistencias.toFixed(2) + '%'; // Agregar tooltip
        progressBar.appendChild(segmentoInasistencias);
        let segmentoFaltasJustificadas = document.createElement('span');
        segmentoFaltasJustificadas.className = 'progress-segment';
        segmentoFaltasJustificadas.style.width = porcentajeFaltasJustificadas + '%';
        segmentoFaltasJustificadas.style.backgroundColor = '#FFFF00';
        segmentoFaltasJustificadas.textContent = porcentajeFaltasJustificadas.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
        segmentoFaltasJustificadas.title = 'Faltas Justificadas: ' + porcentajeFaltasJustificadas.toFixed(2) + '%'; // Agregar tooltip
        progressBar.appendChild(segmentoFaltasJustificadas);


        // Crear las tablas para cada mapa en .tabla-asistencias-por-mes
        let mesContainer = document.querySelector('.tabla-asistencias-por-mes');
        mesContainer.innerHTML = '';
        let tables = [];
        let sortedMaps = Object.keys(data).sort().reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
        for (let map in sortedMaps) {
            let mesTable = document.createElement('table');
            mesTable.classList.add('tabla-asistencias-por-mes');
            let tbody = document.createElement('tbody');
            mesTable.appendChild(tbody);
            let mapData = Object.entries(data[map]).sort();
            for (let i = 0; i < mapData.length; i++) {
                let array = mapData[i][1];

                // Contar los elementos que sean diferentes de "0"
                let totalDias = array.filter(x => x !== 0).length;

                // Sumar o restar dependiendo de los valores de los elementos del array
                let puntaje = array.reduce((a, b) => a + b, 0);

                // Calcular el porcentaje de asistencias
                let porcentaje = (puntaje / totalDias) * 100;

                // Agregar los cálculos a la tabla
                let row = tbody.insertRow();
                row.insertCell().textContent = totalDias;
                row.insertCell().textContent = puntaje;
                row.insertCell().textContent = porcentaje.toFixed(2) + '%';
            }
            tables.push(mesTable);
        }
        tables.forEach((table, index) => {
            table.style.display = index === 0 ? 'table' : 'none';

            // Crear encabezados de tabla
            let thead = document.createElement('thead');
            let headerRow = document.createElement('tr');
            let headers = ['Total de dias<br>de Asistencias', 'Putaje de<br>Asistencias', 'Porcentaje de<br>Asistencias'];
            headers.forEach(headerText => {
                let th = document.createElement('th');
                th.innerHTML = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            // Agregar encabezados a la tabla
            table.prepend(thead);

            mesContainer.appendChild(table);
        });
        // Crear las barras de progreso para cada mapa en .barra-progreso-mes
        let progresoCotenedor = document.querySelector('.barra-progreso-mes');
        progresoCotenedor.innerHTML = '';
        let progressBars = [];
        for (let map in sortedMaps) {
            let progressBar = document.createElement('div');
            progressBar.classList.add('barra-progreso-mes');
            let mapData = Object.entries(data[map]).sort();

            let totalAsistencias = 0;
            let totalInasistencias = 0;
            let totalFaltasJustificadas = 0;

            // Realizar los cálculos para cada array en el mapa
            for (let i = 0; i < mapData.length; i++) {
                let array = mapData[i][1];

                // Contar las asistencias, inasistencias y faltas justificadas
                totalAsistencias += array.filter(x => x === 1).length;
                totalInasistencias += array.filter(x => x === -1).length;
                totalFaltasJustificadas += array.filter(x => x === 0.5).length;
            }

            // Calcular los porcentajes para la barra de progreso
            let totalDias = totalAsistencias + totalInasistencias + totalFaltasJustificadas;
            let porcentajeAsistencias = (totalAsistencias / totalDias) * 100;
            let porcentajeInasistencias = (totalInasistencias / totalDias) * 100;
            let porcentajeFaltasJustificadas = (totalFaltasJustificadas / totalDias) * 100;

            // Crear los segmentos de la barra de progreso
            let segmentoAsistencias = document.createElement('span');
            segmentoAsistencias.className = 'progress-segment';
            segmentoAsistencias.style.width = porcentajeAsistencias + '%';
            segmentoAsistencias.style.backgroundColor = '#05FF00';
            segmentoAsistencias.textContent = porcentajeAsistencias.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
            segmentoAsistencias.title = 'Asistencias: ' + porcentajeAsistencias.toFixed(2) + '%'; // Agregar tooltip
            progressBar.appendChild(segmentoAsistencias);
            let segmentoInasistencias = document.createElement('span');
            segmentoInasistencias.className = 'progress-segment';
            segmentoInasistencias.style.width = porcentajeInasistencias + '%';
            segmentoInasistencias.style.backgroundColor = '#FF0000';
            segmentoInasistencias.textContent = porcentajeInasistencias.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
            segmentoInasistencias.title = 'Inasistencias: ' + porcentajeInasistencias.toFixed(2) + '%'; // Agregar tooltip
            progressBar.appendChild(segmentoInasistencias);
            let segmentoFaltasJustificadas = document.createElement('span');
            segmentoFaltasJustificadas.className = 'progress-segment';
            segmentoFaltasJustificadas.style.width = porcentajeFaltasJustificadas + '%';
            segmentoFaltasJustificadas.style.backgroundColor = '#FFFF00';
            segmentoFaltasJustificadas.textContent = porcentajeFaltasJustificadas.toFixed(2) + '%'; // Agregar el porcentaje al texto del segmento
            segmentoFaltasJustificadas.title = 'Faltas Justificadas: ' + porcentajeFaltasJustificadas.toFixed(2) + '%'; // Agregar tooltip
            progressBar.appendChild(segmentoFaltasJustificadas);

            progressBars.push(progressBar);
        }
        progressBars.forEach((progressBar, index) => {
            progressBar.style.display = index === 0 ? 'flex' : 'none';
            progresoCotenedor.appendChild(progressBar);
        });


        // Agregar funcionalidad a los botones de navegación
        let currentIndex = 0;
        document.querySelector('.btn-anterior-mes').addEventListener('click', () => {
            if (currentIndex > 0) {
                tables[currentIndex].style.display = 'none';
                progressBars[currentIndex].style.display = 'none';
                currentIndex--;
                tables[currentIndex].style.display = 'table';
                progressBars[currentIndex].style.display = 'flex';
                actualizarTextoMes(meses, currentIndex); // Actualizar el texto de los meses al retroceder
            }
        });
        document.querySelector('.btn-siguiente-mes').addEventListener('click', () => {
            if (currentIndex < tables.length - 1) {
                tables[currentIndex].style.display = 'none';
                progressBars[currentIndex].style.display = 'none';
                currentIndex++;
                tables[currentIndex].style.display = 'table';
                progressBars[currentIndex].style.display = 'flex';
                actualizarTextoMes(meses, currentIndex); // Actualizar el texto de los meses al avanzar
            }
        });

    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const adminDoc = await getDoc(doc(db, 'claveMaestro', 'generarClaves'));
        if (userDoc.exists() && adminDoc.exists()) {
            const userKey = userDoc.data().claveMaestro;
            const adminKey = adminDoc.data().claveAdmin;
            if (userKey === adminKey && window.location.pathname !== '/VerEstadisticas') {
                window.location.href = 'VerEstadisticas';
            } else if (userKey !== adminKey && window.location.pathname !== '/mitablero') {
                window.location.href = 'mitablero';
            }
        }
    } else if (window.location.pathname !== '/index') {
        window.location.href = 'index';
    }
});
