import express from 'express';
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
} from '../controllers/proyectosController.js';
import checkAuth from '../middlewares/checkAuth.js';

const router = express.Router();

router.get('/', checkAuth, obtenerProyectos);

router.post('/', checkAuth, nuevoProyecto);

router.route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)

router.post('/colaboradores', checkAuth, buscarColaborador)

router.post('/colaboradores/:id', checkAuth, agregarColaborador);

router.post('/eliminar-colaboradores/:id', checkAuth, eliminarColaborador);

export default router;
 