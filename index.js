import dotenv from 'dotenv';
import Servidor from "./models/server.js"
import Tarea from './models/Tarea.js';

dotenv.config();

const server = new Servidor();

server.listen();


server.io.on('connection', (socket) => {

    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto);
    });

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea)
    });

    socket.on('eliminar tarea', async (tarea) => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea eliminada', tarea);
    });

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('tarea actualizada', tarea);
    })

    socket.on('completar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('tarea completada', tarea);
    })
})

