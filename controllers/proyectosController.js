import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    // console.log(req.usuario)
    try {
        const proyectos = await Proyecto.find({
            $or: [
                { colaboradores: { $in: req.usuario } },
                { creador: { $in: req.usuario } }
            ],
        }).populate({
                path: 'creador',
                select: 'nombre email _id'
            })
       return  res.json(proyectos)
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            msg: "No se pudieron obtener los proyectos."
        })
    }
    
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        return res.status(400).json({
            msg: "No se pudo crear el proyecto."
        })
    }
}

const obtenerProyecto = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id)
        .populate("colaboradores", "nombre email")
        .populate({path: "tareas", populate: {path: "completado", select: "nombre email"}})

    if(!proyecto) { 
        return res.status(404).json({
            msg: "El proyecto no fue encontrado."
        })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        return res.status(401).json({
            msg: "No puedes obtener proyectos en los que no participes."
        })
    }

    return res.json(proyecto);
}

const editarProyecto = async (req, res) => {
    const {id} = req.params;
    const {_id, __v, confirmacion, createdAt, updatedAt, ...resto} = req.body;

    const proyecto = await Proyecto.findById(id);

    if(!proyecto) {
        return res.status(404).json({
            msg: "El proyecto no fue encontrado."
        })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(401).json({
            msg: "No puedes editar proyectos en los que no participes."
        })
    }    

    try {
        const proyectoActualizado = await Proyecto.findByIdAndUpdate(id, resto, {new: true});
        return res.json(proyectoActualizado);
    } catch (error) {
        return res.status(400).json({
            msg: "Ha ocurrido un error."
        })
    }

}

const eliminarProyecto = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id);

    if(!proyecto) {
        return res.status(404).json({
            msg: "El proyecto no fue encontrado."
        })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(401).json({
            msg: "No puedes eliminar proyectos en los que no participes."
        })
    }

    try {
        await Proyecto.findByIdAndDelete(id);
        return res.json({
            msg: "Proyecto eliminado."
        })
    } catch (error) {
        return res.json({
            msg: "El proyecto no pudo ser eliminado."
        })
    }
    
}

const buscarColaborador = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -token -createdAt -password -updatedAt -__v");
    
    if(!usuario) {
        return res.status(404).json({
            msg: "Usuario no encontrado."
        })
    }

    return res.json(usuario);
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto) {
        return res.status(404).json({
            msg: "Proyecto no encontrado."
        })
    }

    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -token -createdAt -password -updatedAt -__v");
    
    if(!usuario) {
        return res.status(404).json({
            msg: "Usuario no encontrado."
        })
    }

    //Comprobar que el colaborador que queremos agregar no es el administrador del proyecto 
    if(proyecto.creador.toString() === usuario._id.toString()) {
        return res.status(403).json({
            msg: "No puedes ser colaborador de un proyecto que es tuyo.",

        })
    }

    //Que no este ya agregado
    if(proyecto.colaboradores.includes(usuario._id)) {
        return res.status(401).json({
            msg: "El usuario ya pertenece al proyecto."
        })
    }

    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();

    return res.json({
        msg: "Colaborador agregado correctamente."
    })
} 

const eliminarColaborador = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id);
    if(!proyecto) {
        return res.status(404).json({
            msg: "Proyecto no encontrado."
        })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
            msg: "No puedes realizar esta acción, puesto que no eres administrador."
        })
    }

    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    return res.json({
        msg: "Colaborador eliminado."
    })
}



export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
}