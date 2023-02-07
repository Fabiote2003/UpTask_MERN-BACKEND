import mongoose from "mongoose";
const {Schema, model} = mongoose;

const proyectosSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true
    },
    creador: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    tareas: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tarea'
        }
    ],
    colaboradores: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    ],
}, 
{
    timestamps: true
});

const Proyecto = model('Proyecto', proyectosSchema);

export default Proyecto;

