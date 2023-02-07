import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

const agregarTarea = async (req, res) => {
    const {proyecto} = req.body;

    const existeProyecto = await Proyecto.findById(proyecto);

    //Comprobamos si existe el proyecto al que se le quiere agregar la tarea.
    if(!existeProyecto) {
        return res.status(404).json({
            msg: "El proyecto no existe."
        })
    }

    //Comprobamos que el creador del proyecto es el mismo que hace la solicitud para crear la tarea.
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(401).json({
            msg: "No tienes permiso para crear una tarea. Necesitas ser el creador del proyecto."
        })
    }
    
    try {
        const tareaAlmacenada = new Tarea(req.body);
        await tareaAlmacenada.save();

        //Almacenar el ID de la tarea en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error)
    }

}

const obtenerTarea = async (req, res) => {
    const {id} = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprobamos que existe la tarea.
    if(!tarea) {
        return res.status(404).json({
            msg: "No existe una tarea con ese ID."
        })
    }

    //Comprobamos que el creador del proyecto al que pertenece la tarea, es el mismo que esta haciendo la consulta para obtener la tarea.
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
            msg: "No tienes permiso de obtener la tarea."
        })
    }

    return res.json(tarea);
}

const actualizarTarea = async (req, res) => {
    const {id} = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprobamos que existe la tarea.
    if(!tarea) {
        return res.status(404).json({
            msg: "No existe una tarea con ese ID."
        })
    }

    //Comprobamos que el creador del proyecto al que pertenece la tarea, es el mismo que esta haciendo la consulta para actualizar la tarea.
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
            msg: "No tienes permiso de actualizar la tarea."
        })
    }

    const {createdAt, updatedAt, _id, proyecto, ...resto} = req.body;

    try {
        const tareaActualizada = await Tarea.findByIdAndUpdate(id, resto, {new: true});
        return res.json(tareaActualizada)
    } catch (error) {
        console.log(error);
    }
}

const eliminarTarea = async (req, res) => {
    const {id} = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprobamos que existe la tarea.
    if(!tarea) {
        return res.status(404).json({
            msg: "No existe una tarea con ese ID."
        })
    }

    //Comprobamos que el creador del proyecto al que pertenece la tarea, es el mismo que esta haciendo la consulta para eliminar la tarea.
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
            msg: "No tienes permiso de eliminar la tarea."
        })
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id);

        await Promise.allSettled([ await proyecto.save(), await Tarea.findByIdAndDelete(id)])
       
        return res.json({
            msg: "Tarea eliminada."
        })
    } catch (error) {
        console.log(error);
    }
}

const cambiarEstado = async (req, res) => {
    const {id} = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprobamos que existe la tarea.
    if(!tarea) {
        return res.status(404).json({
            msg: "No existe una tarea con ese ID."
        })
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        return res.status(403).json({
            msg: "No puede realizar esta acción."
        })
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;

    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
        .populate("proyecto")
        .populate("completado")
    return res.json(tareaAlmacenada);
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}