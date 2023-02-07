import mongoose from "mongoose";
const {Schema, model} = mongoose;
import bcrypt from "bcrypt";


const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

usuarioSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next();
    }
     //Encriptamos la contraseña
     const salt = bcrypt.genSaltSync(10);
     this.password = bcrypt.hashSync(this.password, salt);
})

const Usuario = model('Usuario', usuarioSchema);

export default Usuario;

