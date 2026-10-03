
const canal = new BroadcastChannel(
    "turnos_3d"
);


function obtenerTurnos() {

    return JSON.parse(
        localStorage.getItem("turnos_3d")
    ) || [];

}


function obtenerDiseñadores() {

    return JSON.parse(
        localStorage.getItem("diseñadores_3d")
    ) || {

        1: {
            nombre: "Diseñador 1",
            turnoId: null
        },

        2: {
            nombre: "Diseñador 2",
            turnoId: null
        }

    };

}


function guardarDatos(
    turnos,
    diseñadores
) {

    localStorage.setItem(
        "turnos_3d",
        JSON.stringify(turnos)
    );


    localStorage.setItem(
        "diseñadores_3d",
        JSON.stringify(diseñadores)
    );


    canal.postMessage({

        tipo: "ACTUALIZAR"

    });


    actualizarPantalla();

}


function asignarTurno(
    turnoId,
    diseñadorId
) {

    const turnos =
        obtenerTurnos();


    const diseñadores =
        obtenerDiseñadores();


    if (
        diseñadores[diseñadorId]
            .turnoId !== null
    ) {

        mostrarMensaje(
            `Diseñador ${diseñadorId} está ocupado.`,
            "error"
        );

        return;

    }


    const turno =
        turnos.find(
            t => t.id === turnoId
        );


    if (!turno) {

        return;

    }

    turno.estado =
        "atencion";


    turno.diseñadorId =
        diseñadorId;

    diseñadores[diseñadorId]
        .turnoId =
        turno.id;


    guardarDatos(
        turnos,
        diseñadores
    );


    mostrarMensaje(
        `${turno.numero} asignado al Diseñador ${diseñadorId}.`,
        "exito"
    );

}


function liberarDiseñador(
    diseñadorId
) {

    const turnos =
        obtenerTurnos();


    const diseñadores =
        obtenerDiseñadores();


    const turnoId =
        diseñadores[diseñadorId]
            .turnoId;


    if (!turnoId) {

        return;

    }


    const turno =
        turnos.find(
            t => t.id === turnoId
        );


    if (turno) {

        turno.estado =
            "finalizado";


        turno.diseñadorId =
            null;


    }

    diseñadores[diseñadorId]
        .turnoId = null;


    guardarDatos(
        turnos,
        diseñadores
    );


    mostrarMensaje(
        `Diseñador ${diseñadorId} está disponible.`,
        "exito"
    );

}

function actualizarPantalla() {

    const turnos =
        obtenerTurnos();


    const diseñadores =
        obtenerDiseñadores();


    actualizarEstadisticas(
        turnos
    );


    actualizarDiseñadores(
        turnos,
        diseñadores
    );


    actualizarCola(
        turnos,
        diseñadores
    );


    actualizarAtencion(
        turnos
    );

}

function actualizarEstadisticas(
    turnos
) {

    const espera =
        turnos.filter(
            t => t.estado === "espera"
        ).length;


    const atencion =
        turnos.filter(
            t => t.estado === "atencion"
        ).length;


    const finalizados =
        turnos.filter(
            t => t.estado === "finalizado"
        ).length;


    document
        .getElementById("totalEspera")
        .textContent = espera;


    document
        .getElementById("totalAtencion")
        .textContent = atencion;


    document
        .getElementById("totalFinalizados")
        .textContent = finalizados;

}


function actualizarDiseñadores(
    turnos,
    diseñadores
) {

    [1, 2].forEach(id => {

        const diseñador =
            diseñadores[id];


        const estado =
            document.getElementById(
                `estado${id}`
            );


        const cliente =
            document.getElementById(
                `cliente${id}`
            );


        const boton =
            document.getElementById(
                `liberar${id}`
            );


        if (
            diseñador.turnoId === null
        ) {

            estado.textContent =
                "DISPONIBLE";


            estado.className =
                "disponible";


            cliente.innerHTML =
                "Sin cliente";


            boton.disabled =
                true;


            return;

        }


        const turno =
            turnos.find(
                t =>
                    t.id ===
                    diseñador.turnoId
            );


        if (!turno) {

            return;

        }


        estado.textContent =
            "EN ATENCIÓN";


        estado.className =
            "ocupado";


        cliente.innerHTML = `

            <strong>
                ${turno.numero}
            </strong>

            <span>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${turno.codigo}
            </span>

        `;


        boton.disabled =
            false;

    });

}

function actualizarCola(
    turnos,
    diseñadores
) {

    const contenedor =
        document.getElementById(
            "cola"
        );


    const espera =
        turnos.filter(
            t => t.estado === "espera"
        );


    contenedor.innerHTML = "";


    if (espera.length === 0) {

        contenedor.innerHTML = `

            <div class="vacio">

                No hay clientes esperando.

            </div>

        `;

        return;

    }


    espera.forEach(turno => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "turno";


        elemento.innerHTML = `

            <div class="datos-turno">

                <strong>
                    ${turno.numero}
                </strong>

                <span>
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Código:
                    ${turno.codigo}
                </span>

                <small>
                    ${turno.fecha}
                </small>

            </div>


            <div class="acciones">

                <button
                    onclick="asignarTurno(
                        ${turno.id},
                        1
                    )">

                    Diseñador 1

                </button>


                <button
                    onclick="asignarTurno(
                        ${turno.id},
                        2
                    )">

                    Diseñador 2

                </button>

            </div>

        `;


        contenedor.appendChild(
            elemento
        );

    });

}

function actualizarAtencion(
    turnos
) {

    const contenedor =
        document.getElementById(
            "atencion"
        );


    const atencion =
        turnos.filter(
            t => t.estado === "atencion"
        );


    contenedor.innerHTML = "";


    if (atencion.length === 0) {

        contenedor.innerHTML = `

            <div class="vacio">

                No hay clientes siendo atendidos.

            </div>

        `;

        return;

    }


    atencion.forEach(turno => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "turno atencion-card";


        elemento.innerHTML = `

            <div class="datos-turno">

                <strong>
                    ${turno.numero}
                </strong>

                <span>
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${turno.codigo}
                </span>

                <small>
                    Diseñador
                    ${turno.diseñadorId}
                </small>

            </div>


            <span class="badge">

                EN ATENCIÓN

            </span>

        `;


        contenedor.appendChild(
            elemento
        );

    });

}

canal.onmessage =
    function(event) {

        console.log(
            "Mensaje recibido:",
            event.data
        );


        if (
            event.data.tipo ===
            "NUEVO_TURNO"
        ) {

            /*
                Un cliente acaba de
                generar un turno.
            */

            actualizarPantalla();


            mostrarMensaje(
                `Nuevo turno generado: ${event.data.turno.numero}`,
                "exito"
            );

        }


        if (
            event.data.tipo ===
            "ACTUALIZAR"
        ) {

            actualizarPantalla();

        }

    };

function mostrarMensaje(
    texto,
    tipo
) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    mensaje.textContent =
        texto;


    mensaje.className =
        "mensaje " + tipo;


    setTimeout(() => {

        mensaje.className =
            "mensaje";

    }, 3500);

}


actualizarPantalla();


window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "turnos_3d" ||
            event.key === "diseñadores_3d"
        ) {

            actualizarPantalla();

        }

    }
);