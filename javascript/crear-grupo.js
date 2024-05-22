import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, where, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, listAll } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

let userId; // Declarar userId en el ámbito global
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar el loader al principio de la página
    document.querySelector('.loader-background').classList.add('visible');
    const btnRegistrar = document.querySelector('.btnRegistrar');
    const tablaAlumnos = document.querySelector('.tabla-alumnos tbody');
    const btnAceptar = document.querySelector('.btnAceptar');
    const btnAceptarGrupo = document.querySelector('.btnAceptarGrupo');
    const cicloescolarSelect = document.getElementById('cicloescolarSelect');

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
    const storage = getStorage(app);

    // Definir variables de fecha de inicio y fin del ciclo escolar
    let inicioCicloEscolar;
    let finCicloEscolar;

    // Función para cargar y mostrar opciones de ciclo escolar
    const cargarCicloEscolarOptions = async () => {
        // Limpiar opciones existentes en el select
        cicloescolarSelect.innerHTML = '';

        const querySnapshot = await getDocs(collection(db, 'ciclosEscolares'));
        querySnapshot.forEach((doc) => {
            const inicio = new Date(doc.data().inicio.seconds * 1000); // Convertir a milisegundos
            const fin = new Date(doc.data().fin.seconds * 1000); // Convertir a milisegundos

            // Formatear las fechas en el formato deseado: mes año - mes año
            const inicioFormatted = `${obtenerNombreMes(inicio.getMonth())} ${inicio.getFullYear()}`;
            const finFormatted = `${obtenerNombreMes(fin.getMonth())} ${fin.getFullYear()}`;

            const option = document.createElement('option');
            option.textContent = `${inicioFormatted} - ${finFormatted}`;
            option.value = doc.id;
            cicloescolarSelect.appendChild(option);

            // Asignar valores a las variables de fecha de inicio y fin del ciclo escolar
            inicioCicloEscolar = inicio;
            finCicloEscolar = fin;
        });

        // Verificar si el usuario ya tiene un grupo registrado
        const usuarioTieneGrupo = await verificarUsuarioTieneGrupo();
        if (usuarioTieneGrupo) {
            // Si el usuario ya tiene un grupo registrado, deshabilitar el botón de aceptar y cambiar su texto y color
            btnAceptar.disabled = true;
            btnAceptar.textContent = 'Grupo Verificado';
            btnAceptar.style.backgroundColor = 'green';

            // Bloquear selectores de grado y grupo
            document.getElementById('gradoSelected').disabled = true;
            document.getElementById('grupoSelect').disabled = true;
            cicloescolarSelect.disabled = true;

            // Obtener los datos del grupo registrado por el usuario
            const grupoSnapshot = await getDocs(query(collection(db, 'grupos'), where('userID', '==', userId)));
            const grupoData = grupoSnapshot.docs[0].data();
            // Mostrar la selección anterior del usuario para los selectores de grado, grupo y ciclo escolar
            document.getElementById('gradoSelected').value = grupoData.grado;
            document.getElementById('grupoSelect').value = grupoData.grupo;
            cicloescolarSelect.value = grupoData.cicloEscolarID;
        }
    };

// Función auxiliar para obtener el nombre del mes
    const obtenerNombreMes = (numeroMes) => {
        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        return meses[numeroMes];
    };

    // Llamar a la función para cargar y mostrar opciones de ciclo escolar solo una vez
    cargarCicloEscolarOptions();

    // Evento click del botón 'btnAceptar'
    btnAceptar.addEventListener('click', async () => {
        const userId = auth.currentUser.uid;
        const gradoSelected = document.getElementById('gradoSelected').value;
        const grupoSelect = document.getElementById('grupoSelect').value;
        const cicloEscolarId = cicloescolarSelect.value;

        // Verificar si el botón ya está deshabilitado
        if (btnAceptar.disabled) {
            return; // Si ya está deshabilitado, salir de la función
        }

        // Deshabilitar el botón de aceptar
        btnAceptar.disabled = true;
        document.getElementById('gradoSelected').disabled = true;
        document.getElementById('grupoSelect').disabled = true;
        cicloescolarSelect.disabled = true;

        // Verificar si el usuario ya tiene un grupo registrado
        const usuarioTieneGrupo = await verificarUsuarioTieneGrupo(userId);

        if (usuarioTieneGrupo) {
            console.error('El usuario ya tiene un grupo registrado.');
            // Habilitar el botón de aceptar y salir de la función
            btnAceptar.disabled = false;
            return;
        }

        // Verificar si el grupo ya existe para el ciclo escolar seleccionado y está asignado al mismo usuario
        const grupoYaExiste = await verificarGrupoExistente(gradoSelected, grupoSelect, cicloEscolarId, userId);

        if (grupoYaExiste) {
            console.error('El grupo ya está ocupado para el ciclo escolar seleccionado.');
            // Habilitar el botón de aceptar y salir de la función
            btnAceptar.disabled = false;
            return;
        }

        // Guardar datos del grupo en la colección 'grupos'
        try {
            await setDoc(doc(db, 'grupos', `${gradoSelected}${grupoSelect}`), {
                grado: gradoSelected,
                grupo: grupoSelect,
                userID: userId,
                cicloEscolarID: cicloEscolarId
            });
            console.log('Datos del grupo guardados correctamente.');

            // Cambiar el texto y color del botón a "Grupo Verificado"
            btnAceptar.textContent = 'Grupo Verificado';
            btnAceptar.style.backgroundColor = 'green';
        } catch (error) {
            console.error('Error al guardar los datos del grupo:', error);
        }
    });

    // Función para verificar si el usuario tiene un grupo registrado
    const verificarUsuarioTieneGrupo = async () => {
        const userId = auth.currentUser.uid;
        const querySnapshot = await getDocs(query(collection(db, 'grupos'), where('userID', '==', userId)));
        return !querySnapshot.empty;
    };



    // Función para verificar si el grupo ya existe para el ciclo escolar seleccionado y está asignado al mismo usuario
    const verificarGrupoExistente = async (grado, grupo, cicloEscolarId, userId) => {
        const q = query(collection(db, 'grupos'), where('cicloEscolarID', '==', cicloEscolarId));

        const querySnapshot = await getDocs(q);
        let grupoExistente = false;

        querySnapshot.forEach((doc) => {
            if (doc.data().grado === grado && doc.data().grupo === grupo && doc.data().userID !== userId) {
                grupoExistente = true;
            }
        });

        return grupoExistente;
    };

    btnRegistrar.addEventListener('click', function() {
        const apellidosInput = document.querySelector('input[name="apellidos"]');
        const nombreInput = document.querySelector('input[name="nombre"]');

        const apellidos = apellidosInput.value.trim();
        const nombre = nombreInput.value.trim();

        if (apellidos !== '' && nombre !== '') {
            // Crear nueva fila en la tabla
            const fila = document.createElement('tr');

            // Agregar número de lista (automático)
            const numeroLista = tablaAlumnos.rows.length + 1;
            const celdaNumero = document.createElement('td');
            celdaNumero.textContent = numeroLista;
            fila.appendChild(celdaNumero);

            // Agregar apellidos
            const celdaApellidos = document.createElement('td');
            celdaApellidos.textContent = apellidos;
            fila.appendChild(celdaApellidos);

            // Agregar nombre(s)
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = nombre;
            fila.appendChild(celdaNombre);

            // Agregar opciones (botones de editar y eliminar)
            const celdaOpciones = document.createElement('td');
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.classList.add('btnEditar');
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.classList.add('btnEliminar');
            celdaOpciones.appendChild(btnEditar);
            celdaOpciones.appendChild(btnEliminar);
            fila.appendChild(celdaOpciones);

            // Agregar fila a la tabla
            tablaAlumnos.appendChild(fila);

            // Limpiar campos de entrada
            apellidosInput.value = '';
            nombreInput.value = '';
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    // Agregar eventos a los botones de editar y eliminar
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

    // Función para eliminar una fila de la tabla
    function eliminarFila(fila) {
        fila.remove();

        // Actualizar los números de lista
        const filas = tablaAlumnos.querySelectorAll('tr');
        filas.forEach((fila, index) => {
            fila.querySelector('td:first-child').textContent = index + 1;
        });
    }


    // Función para editar una fila de la tabla
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

    // Función para aceptar los cambios editados en una fila de la tabla
    function aceptarCambios(fila) {
        const celdaApellidos = fila.querySelector('td:nth-child(2) input');
        const celdaNombre = fila.querySelector('td:nth-child(3) input');

        fila.querySelector('td:nth-child(2)').textContent = celdaApellidos.value;
        fila.querySelector('td:nth-child(3)').textContent = celdaNombre.value;

        // Mostrar botones de editar y eliminar
        fila.querySelector('.btnEditar').style.display = 'inline-block';
        fila.querySelector('.btnEliminar').style.display = 'inline-block';

        // Eliminar botón de aceptar cambios
        fila.querySelector('.btnAceptarCambios').remove();
    }

// Esta función se llamará cada vez que cambie el estado de autenticación del usuario
    onAuthStateChanged(auth, async (user) => {
        const cuerpo = document.body;
        if (user) {
            // Si el usuario está autenticado, agregar la clase .autenticado al cuerpo
            cuerpo.classList.add('autenticado');
            userId = auth.currentUser.uid; // Asignar valor a userId
            // Si el usuario está autenticado, mostrar el contenido de la página
            const usuarioTieneGrupo = await verificarUsuarioTieneGrupo();
            if (usuarioTieneGrupo) {
                // Si el usuario ya tiene un grupo creado, deshabilitar el botón de aceptar grupo y cambiar su texto y color
                btnAceptarGrupo.disabled = true;
                btnAceptarGrupo.textContent = 'Grupo Aceptado';
                btnAceptarGrupo.style.backgroundColor = 'green';
                document.getElementById('gradoSelected').disabled = true;
                document.getElementById('grupoSelect').disabled = true;
                cicloescolarSelect.disabled = true;
            }
        } else {
            // Si el usuario no está autenticado, eliminar la clase .autenticado del cuerpo
            cuerpo.classList.remove('autenticado');

            // Si el usuario no está autenticado, redirigirlo a la página de inicio de sesión o al index.html
            window.location.replace("index");
        }
        // Ocultar el loader una vez que los datos se hayan cargado
        document.querySelector('.loader-background').classList.remove('visible');
    });
// Evento click del botón 'btnAceptarGrupo'
    btnAceptarGrupo.addEventListener('click', async () => {
        // Obtener el usuario actual
        const userId = auth.currentUser.uid;

        // Obtener el grupo del usuario desde la base de datos
        const grupoSnapshot = await getDocs(query(collection(db, 'grupos'), where('userID', '==', userId)));
        if (!grupoSnapshot.empty) {
            // Tomar el primer grupo del usuario (debería haber solo uno)
            const grupoData = grupoSnapshot.docs[0].data();
            const cicloEscolarId = grupoData.cicloEscolarID;
            const gradoGrupo = `${grupoData.grado}${grupoData.grupo}`; // Concatenar grado y grupo

            // Obtener las fechas de inicio y fin del ciclo escolar desde la base de datos
            const cicloEscolarDoc = await getDoc(doc(db, 'ciclosEscolares', cicloEscolarId));
            const inicioCicloEscolar = new Date(cicloEscolarDoc.data().inicio.seconds * 1000); // Convertir a milisegundos
            const finCicloEscolar = new Date(cicloEscolarDoc.data().fin.seconds * 1000); // Convertir a milisegundos

            // Obtener datos de los alumnos registrados en la tabla y ordenarlos alfabéticamente
            const nombresAlumnos = []; // Array para almacenar los nombres de los alumnos
            tablaAlumnos.querySelectorAll('tr').forEach(row => {
                const apellido = row.querySelector('td:nth-child(2)').textContent.trim();
                const nombre = row.querySelector('td:nth-child(3)').textContent.trim();
                nombresAlumnos.push(`${apellido} ${nombre}`); // Agregar nombre completo al array
            });
            nombresAlumnos.sort(); // Ordenar los nombres alfabéticamente

            // Guardar los datos en Firestore
            const grupoDocRef = doc(db, 'grupos', grupoSnapshot.docs[0].id);
            await setDoc(grupoDocRef, {
                nombresAlumnos: nombresAlumnos, // Agregar array de nombres de alumnos al documento del grupo
            }, { merge: true }); // Usar merge: true para no sobrescribir otros datos del grupo

            // Crear mapas para cada mes del ciclo escolar
            const asistenciasPorMes = {};
            const numDiasPorMes = numDiasHabiles(inicioCicloEscolar, finCicloEscolar);
            const letras = "abcdefghijklmnopqrstuvwxyz"; // Usar letras en lugar de nombres de meses
            let i = 0;
            // Ordenar los meses del ciclo escolar
            const mesesOrdenados = Object.keys(numDiasPorMes).sort((a, b) => {
                const [anoA, mesA] = a.split('-').map(Number);
                const [anoB, mesB] = b.split('-').map(Number);
                return anoA - anoB || mesA - mesB; // Ordenar por año y luego por mes
            });
            for (const mes of mesesOrdenados) {
                if (Number.isInteger(numDiasPorMes[mes]) && numDiasPorMes[mes] >= 0) {
                    const diasAsistencia = Array(numDiasPorMes[mes]).fill(0);
                    const letraMes = letras[i++];
                    const asistenciasPorAlumno = {};
                    nombresAlumnos.forEach(nombreAlumno => {
                        asistenciasPorAlumno[nombreAlumno] = diasAsistencia.slice();
                    });
                    asistenciasPorMes[letraMes] = asistenciasPorAlumno;

                    // Imprimir el nombre del mapa y el mes correspondiente
                    console.log(`Nombre del mapa: ${letraMes}`);
                    console.log(`Mes correspondiente: ${mes}`);
                    console.log(`Array de asistencias: ${JSON.stringify(asistenciasPorAlumno)}`);
                } else {
                    console.error('Número de días inválido:', numDiasPorMes[mes]);
                }
            }

            // Guardar los mapas de asistencias por mes en el documento lista + el grado y grupo del usuario
            const listaDocRef = doc(db, 'grupos', grupoSnapshot.docs[0].id, 'lista', `lista${gradoGrupo}`);
            await setDoc(listaDocRef, asistenciasPorMes);

            // Crear arrays de días de asistencia por mes
            const asistenciasPorDias = generarAsistenciasPorDias(inicioCicloEscolar, finCicloEscolar);

            // Guardar los arrays de días de asistencia por mes en Firestore
            const fechasDocRef = doc(db, 'grupos', grupoSnapshot.docs[0].id, 'lista', `fecha`);
            await setDoc(fechasDocRef, asistenciasPorDias);

            // Deshabilitar el botón de aceptar grupo y cambiar su texto y color
            btnAceptarGrupo.disabled = true;
            btnAceptarGrupo.textContent = 'Grupo Aceptado';
            btnAceptarGrupo.style.backgroundColor = 'green';
            console.log('Datos de asistencias y nombres de alumnos guardados correctamente.');
        } else {
            console.error('El usuario no tiene un grupo registrado.');
            // Aquí puedes mostrar un mensaje al usuario indicando que debe seleccionar y aceptar un grupo primero.
            return;
        }
    });

// Función para generar un objeto de asistencias por mes con nombres de días como propiedades
    function generarAsistenciasPorDias(fechaInicio, fechaFin) {
        const letras = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        const asistenciasPorDias = {};

        // Obtener el primer día del ciclo escolar
        let fechaActual = new Date(fechaInicio);
        let indiceLetra = 0;
        let mesAnterior = fechaActual.getMonth();
        let anoAnterior = fechaActual.getFullYear();

        while (fechaActual <= fechaFin) {
            const mesActual = fechaActual.getMonth();
            const anoActual = fechaActual.getFullYear();

            // Cambiar la letra si cambia el mes o el año
            if (mesActual !== mesAnterior || anoActual !== anoAnterior) {
                indiceLetra++;
                mesAnterior = mesActual;
                anoAnterior = anoActual;
            }

            const letraMes = letras[indiceLetra];

            // Verificar si el mes ya tiene un array creado
            if (!asistenciasPorDias.hasOwnProperty(letraMes)) {
                asistenciasPorDias[letraMes] = [];
            }

            // Agregar el nombre del día al array del mes
            if (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6) { // Si es lunes a viernes
                const nombreDia = obtenerNombreDia(fechaActual.getDay());
                const fechaFormateada = `${nombreDia}. ${fechaActual.getDate()}`;
                asistenciasPorDias[letraMes].push(fechaFormateada);
            }

            // Incrementar la fecha al siguiente día
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        return asistenciasPorDias;
    }



// Función auxiliar para obtener el nombre del día
    function obtenerNombreDia(numeroDia) {
        const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
        return dias[numeroDia];
    }
// Función para calcular la cantidad de días hábiles entre dos fechas
    function numDiasHabiles(fechaInicio, fechaFin) {
        let numDiasPorMes = {};
        let fechaActual = new Date(fechaInicio);

        while (fechaActual <= fechaFin) {
            const mes = fechaActual.getMonth();
            const ano = fechaActual.getFullYear();
            const clave = `${ano}-${mes}`; // Usar año y mes como clave
            if (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6) {
                if (!numDiasPorMes.hasOwnProperty(clave)) {
                    numDiasPorMes[clave] = 1;
                } else {
                    numDiasPorMes[clave]++;
                }
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        // Asegurarse de que todos los meses del ciclo escolar están en el objeto numDiasPorMes
        let mesInicio = fechaInicio.getMonth();
        let anoInicio = fechaInicio.getFullYear();
        let mesFin = fechaFin.getMonth();
        let anoFin = fechaFin.getFullYear();
        for (let ano = anoInicio; ano <= anoFin; ano++) {
            for (let mes = (ano === anoInicio ? mesInicio : 0); mes <= (ano === anoFin ? mesFin : 11); mes++) {
                const clave = `${ano}-${mes}`;
                if (!numDiasPorMes.hasOwnProperty(clave)) {
                    numDiasPorMes[clave] = 0;
                }
            }
        }

        return numDiasPorMes;
    }
});