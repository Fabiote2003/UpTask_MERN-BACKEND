import express from 'express';
import cors from 'cors';
import dbConnection from '../database/config.js';
import usuarioRoutes from '../routes/usuarioRoutes.js';
import proyectoRoutes from '../routes/proyectoRoutes.js';
import tareaRoutes from '../routes/tareaRoutes.js';
import {Server} from "socket.io";
import http from "http";

class Servidor {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4000;
        this.usuariosPath = '/api/usuarios';
        this.proyectosPath = '/api/proyectos';
        this.tareasPath = '/api/tareas';
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            pingTimeout: 60000,
            cors: {
                origin: process.env.FRONTEND_URL,
            }
        });

        //Middlewars
        this.middlewares();

        //Conectar a la base de datos
        this.conectarDB();

        //Rutas de la aplicación
        this.routes();

        
    }

    middlewares() {
        const whiteList = [process.env.FRONTEND_URL]
        const corsOptions = {
            origin: function(origin, callback) {
                if(whiteList.includes(origin)) {
                    callback(null, true);
                }else {
                    callback(new Error('Error de CORS'));
                }
            }
        }
        this.app.use(cors(corsOptions));

        //Lectura y parseo del body
        this.app.use(express.json())

    }

    async conectarDB() {
        await dbConnection();
    }


    routes() {
        this.app.use(this.usuariosPath, usuarioRoutes);
        this.app.use(this.proyectosPath, proyectoRoutes);
        this.app.use(this.tareasPath, tareaRoutes);
    }

    listen() {
        this.server.listen(this.port);
        console.log("Escuchando el puerto: ", this.port);
    }

}

export default Servidor;