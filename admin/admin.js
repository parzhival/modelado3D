/* =========================================
   BROADCAST CHANNEL
========================================= */

const canal = new BroadcastChannel(
    "turnos_3d"
);


/* =========================================
   DATOS
========================================= */

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


/* =========================================
   GUARDAR
========================================= */

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


    /*
        Avisamos a cliente.html
        que hubo cambios.
    */

    canal.postMessage({

        tipo: "ACTUALIZAR"

    });


    actualizarPantalla();

}


/* =========================================
   ASIGNAR TURNO
========================================= */

function asignarTurno(
    turnoId,
    diseñadorId
) {

    const turnos =
        obtenerTurnos();


    const diseñadores =
        obtenerDiseñadores();


    /*
        Comprobar diseñador
    */

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


    /*
        Buscar turno
    */

    const turno =
        turnos.find(
            t => t.id === turnoId
        );


    if (!turno) {

        return;

    }


    /*
        Cambiar estado
    */

    turno.estado =
        "atencion";


    turno.diseñadorId =
        diseñadorId;


    /*
        Asignar diseñador
    */

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


/* =========================================
   FINALIZAR
========================================= */

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

        /*
            El turno queda
            finalizado.
        */

        turno.estado =
            "finalizado";


        turno.diseñadorId =
            null;


        /*
            Aquí posteriormente
            podemos añadir:

            turno.pagado = true;

            después de validar
            el código de autenticación.
        */

    }


    /*
        Liberar diseñador
    */

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


/* =========================================
   ACTUALIZAR PANTALLA
========================================= */

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


/* =========================================
   ESTADÍSTICAS
========================================= */

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


/* =========================================
   DISEÑADORES
========================================= */

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
                🔐 ${turno.codigo}
            </span>

        `;


        boton.disabled =
            false;

    });

}


/* =========================================
   COLA DE ESPERA
========================================= */

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
                    🔐 Código:
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


/* =========================================
   ATENCIÓN
========================================= */

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
                    🔐 ${turno.codigo}
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


/* =========================================
   BROADCAST CHANNEL
========================================= */

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


/* =========================================
   MENSAJES
========================================= */

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


/* =========================================
   INICIO
========================================= */

actualizarPantalla();