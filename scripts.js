const btnAgendarTurno = document.getElementById("btnAgendarTurno");
const btnVerTurnos = document.getElementById("btnVerTurnos");
const btnCatalogo = document.getElementById("btnCatalogo");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnImprimir = document.getElementById("btnImprimir");
const btnCerrar = document.getElementById("btnCerrar");
const btnInicio = document.getElementById("btnInicio");

const seccionFormulario = document.getElementById("seccionFormulario");
const seccionTurnos = document.getElementById("seccionTurnos");
const catalogo = document.getElementById("catalogo");
const formularioTurno = document.getElementById("FormularioTurno");

const inputFechaHora = document.getElementById("fechaHora");
const inputCliente = document.getElementById("cliente");
const selectServicio = document.getElementById("servicio");
const selectBarbero = document.getElementById("barbero");

const cuerpoTurnos = document.getElementById("cuerpoTurnos");
const cuerpoCatalogo = document.getElementById("cuerpoCatalogo");
const textoTotal = document.getElementById("textoTotal");
const mensajeError = document.getElementById("mensajeError");
const fechaReporte = document.getElementById("fechaReporte");

let turnos = JSON.parse(localStorage.getItem("turnosBarberia")) || [];

function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR");
}

function dosDigitos(n) {
    return String(n).padStart(2, "0");
}

function fechaLocalISO(fecha) {
    return fecha.getFullYear() + "-" + dosDigitos(fecha.getMonth() + 1) + "-" + dosDigitos(fecha.getDate());
}

function formatearFechaHora(valor) {
    const f = new Date(valor);
    return dosDigitos(f.getDate()) + "/" + dosDigitos(f.getMonth() + 1) + "/" + f.getFullYear() +
        " " + dosDigitos(f.getHours()) + ":" + dosDigitos(f.getMinutes());
}

// Botón Inicio: oculta el formulario y la tabla
btnInicio.addEventListener("click", () => {
    seccionFormulario.classList.add("oculto");
    seccionTurnos.classList.add("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fecha mínima del formulario (hoy) y fecha del reporte
function configurarFecha() {
    const hoy = new Date();
    const iso = fechaLocalISO(hoy);
    inputFechaHora.min = iso + "T00:00";
    fechaReporte.textContent = hoy.toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}
// Arma la tabla del catálogo a partir del combo de servicios
function cargarCatalogo() {
    cuerpoCatalogo.innerHTML = "";
    for (const opcion of selectServicio.options) {
        if (opcion.value === "") continue;
        const fila = document.createElement("tr");
        const tdNombre = document.createElement("td");
        const tdPrecio = document.createElement("td");
        tdNombre.textContent = opcion.value;
        tdPrecio.textContent = formatearPrecio(Number(opcion.dataset.precio));
        fila.append(tdNombre, tdPrecio);
        cuerpoCatalogo.appendChild(fila);
    }
}
// Dibuja la tabla con los turnos del día y calcula el total automáticamente
function dibujarTurnos() {
    cuerpoTurnos.innerHTML = "";

    // Ordenar los turnos por fecha y hora
    turnos.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

    const hoy = fechaLocalISO(new Date());
    let total = 0;
    let turnosHoy = 0;

    turnos.forEach((turno, indice) => {
        // La tabla y el total solo incluyen los turnos de hoy
        if (turno.fechaHora.slice(0, 10) !== hoy) return;

        total += turno.precio;
        turnosHoy++;

        const fila = document.createElement("tr");
        const datos = [
            formatearFechaHora(turno.fechaHora),
            turno.cliente,
            turno.servicio,
            turno.barbero,
            formatearPrecio(turno.precio)
        ];

        datos.forEach(texto => {
            const td = document.createElement("td");
            td.textContent = texto;
            fila.appendChild(td);
        });

        // Botón para quitar el turno (no se imprime)
        const tdAccion = document.createElement("td");
        tdAccion.className = "no-imprimir";
        const btn = document.createElement("button");
        btn.className = "btn-quitar";
        btn.textContent = "Quitar";
        btn.addEventListener("click", () => quitarTurno(indice));
        tdAccion.appendChild(btn);
        fila.appendChild(tdAccion);

        cuerpoTurnos.appendChild(fila);
    });

    // Mensaje cuando no hay turnos para hoy
    if (turnosHoy === 0) {
        const fila = document.createElement("tr");
        fila.className = "fila-vacia";
        const td = document.createElement("td");
        td.colSpan = 6;
        td.textContent = "Todavía no hay turnos registrados para hoy.";
        fila.appendChild(td);
        cuerpoTurnos.appendChild(fila);
    }

    // Texto con el total de turnos y el monto a recaudar en el día
    textoTotal.textContent = "Total de turnos del día: " + turnosHoy +
        " | Monto total estimado a recaudar: " + formatearPrecio(total);
}

function guardar() {
    localStorage.setItem("turnosBarberia", JSON.stringify(turnos));
}

function quitarTurno(indice) {
    turnos.splice(indice, 1);
    guardar();
    dibujarTurnos();
}

// Restablece los campos del formulario
function limpiarFormulario() {
    formularioTurno.reset();
    mensajeError.textContent = "";
}

// Eventos de los botones
btnAgendarTurno.addEventListener("click", () => {
    seccionFormulario.classList.toggle("oculto");
});

btnVerTurnos.addEventListener("click", () => {
    seccionTurnos.classList.toggle("oculto");
});

btnCatalogo.addEventListener("click", () => {
    catalogo.classList.toggle("oculto");
    btnCatalogo.textContent = catalogo.classList.contains("oculto") ? "Ver catálogo" : "Ocultar catálogo";
});

btnLimpiar.addEventListener("click", limpiarFormulario);

formularioTurno.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const fechaHora = inputFechaHora.value;
    const cliente = inputCliente.value.trim();
    const servicio = selectServicio.value;
    const barbero = selectBarbero.value;

    if (!fechaHora || !cliente || !servicio || !barbero) {
        mensajeError.textContent = "Completá todos los campos para registrar el turno.";
        return;
    }

    if (new Date(fechaHora) < new Date()) {
        mensajeError.textContent = "No se puede agendar un turno en una fecha que ya pasó.";
        return;
    }

    const precio = Number(selectServicio.selectedOptions[0].dataset.precio);

    turnos.push({ fechaHora, cliente, servicio, barbero, precio });
    guardar();
    dibujarTurnos();
    limpiarFormulario();

    // Si el turno es para otro día, avisar que aparecerá en la tabla ese día
    if (fechaHora.slice(0, 10) !== fechaLocalISO(new Date())) {
        mensajeError.textContent = "Turno guardado para el " + formatearFechaHora(fechaHora) +
            ". Aparecerá en la tabla ese día.";
    }

    seccionTurnos.classList.remove("oculto");
});

btnImprimir.addEventListener("click", () => {
    window.print();
});

btnCerrar.addEventListener("click", () => {
    seccionTurnos.classList.add("oculto");
});

configurarFecha();
cargarCatalogo();
dibujarTurnos();
