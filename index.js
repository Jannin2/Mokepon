const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // Importar UUID para generar IDs únicos

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

const jugadores = [];
class Mokepon {
    constructor(nombre) {
        this.nombre = nombre;
    }
}

class Jugador {
    constructor(id) {
        this.id = id;
        this.mokepon = null;
        this.x = 0;
        this.y = 0;
        this.ataques = [];
    }

    asignarMokepon(mokepon) {
        this.mokepon = mokepon;
    }

    actualizarPosicion(x, y) {
        this.x = x;
        this.y = y;
    }

    asignarAtaques(ataques) {
        this.ataques = ataques;
    }
}

// Endpoint para unirse al juego
app.get("/unirse", (req, res) => {
    const id = uuidv4(); // Generar un ID único
    const jugador = new Jugador(id);
    jugadores.push(jugador);
    console.log(`Jugador ${id} agregado a la lista`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(id);
});

// Asignar Mokepon
app.post("/mokepon/:jugadorId", (req, res) => {
    const { jugadorId } = req.params;
    const { mokepon } = req.body;

    if (!jugadorId || !mokepon) {
        return res.status(400).send("Faltan datos en la solicitud");
    }

    const jugador = jugadores.find((jugador) => jugador.id === jugadorId);

    if (jugador) {
        jugador.asignarMokepon(new Mokepon(mokepon));
        console.log(`Jugador ${jugadorId} seleccionó a ${mokepon}`);
        res.status(200).send("Mokepon asignado correctamente");
    } else {
        console.error(`Jugador ${jugadorId} no encontrado`);
        res.status(404).send("Jugador no encontrado");
    }
});

// Actualizar posición del jugador y enviar enemigos
app.post("/mokepon/:jugadorId/posicion", (req, res) => {
    const { jugadorId } = req.params;
    const { x, y } = req.body;

    const jugador = jugadores.find((jugador) => jugador.id === jugadorId);

    if (!jugador) {
        console.error(`Jugador ${jugadorId} no encontrado para actualizar posición.`);
        return res.status(404).send("Jugador no encontrado");
    }

    jugador.actualizarPosicion(x, y);

    const enemigos = jugadores.filter(j => j.id !== jugadorId).map(enemigo => ({
        id: enemigo.id,
        mokepon: enemigo.mokepon ? enemigo.mokepon.nombre : null,
        x: enemigo.x,
        y: enemigo.y
    }));

    res.status(200).send({ enemigos });
});

// Obtener ataques del jugador
app.get("/mokepon/:jugadorId/ataques", (req, res) => {
    const { jugadorId } = req.params;
    const jugador = jugadores.find(j => j.id === jugadorId);

    if (!jugador) {
        console.error(`Jugador ${jugadorId} no encontrado para obtener ataques.`);
        return res.status(404).send("Jugador no encontrado");
    }

    res.status(200).send({ ataques: jugador.ataques });
});

// Enviar ataques del jugador
app.post("/mokepon/:jugadorId/ataques", (req, res) => {
    const { jugadorId } = req.params;
    const { ataques } = req.body;

    const jugador = jugadores.find(j => j.id === jugadorId);
    if (!jugador) {
        console.error(`Jugador ${jugadorId} no encontrado para asignar ataques.`);
        return res.status(404).send("Jugador no encontrado");
    }

    jugador.asignarAtaques(ataques);
    console.log(`Ataques asignados a ${jugadorId}:`, ataques);
    res.status(200).send("Ataques asignados correctamente");
});

// Reiniciar sin eliminar IDs
app.post("/reiniciar", (req, res) => {
    jugadores.forEach(jugador => {
        jugador.mokepon = null;
        jugador.ataques = [];
        jugador.x = 0;
        jugador.y = 0;
    });
    console.log("Estado de jugadores reiniciado sin eliminar IDs");
    res.status(200).send("Juego reiniciado correctamente");
});

app.listen(8000, () => {
    console.log("Servidor funcionando en http://localhost:8000");
});