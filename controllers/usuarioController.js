import Usuario from '../models/Usuario.js';
import generarID from '../helpers/generar-ID.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro,emailOlvidePassword } from '../helpers/email.js';

const registrar = async (req, res) => {

    //Evitar registros duplicados
    const {email, nombre, password} = req.body;
    const existeUsuario = await Usuario.findOne({email});

    if(existeUsuario) {
        return res.status(400).json({
            msg: "Ya hay un usuario registrado con este email."
        })
    }


    //Creamos el modelo
    const usuario = new Usuario({
        email,
        nombre, 
        password,
        token: generarID()
    });

   

    try {
        await usuario.save();

        //Enviar el email
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        return res.json({
            msg: "Usuario Creado Correctamente. Revisa tu email para confirmar tu cuenta.",
        })

    } catch (error) {
        console.log(error)
    }
}


const autenticar = async (req, res) => {
    
    const {email, password} = req.body;

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne( {email} );

    if(!usuario) {
        return res.status(404).json({
            msg: "Email o Contraseña son incorrectos."
        })
    }

    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        return res.status(404).json({
            msg: "La cuenta no ha sido confirmada."
        })
    }

    //Comprobar su password
    const passwordValido = bcrypt.compareSync(password, usuario.password);

    if(!passwordValido) {
        return res.status(404).json({
            msg: "Email o Contraseña son incorrectos."
        })
    }

    //Generamos el JSON WEB TOKEN
    const token = generarJWT(usuario._id);

    return res.json({
        nombre: usuario.nombre,
        _id: usuario._id,
        email: usuario.email,
        token,
    })

}


const confirmar = async (req, res) => {
    const {token} = req.params;

    const usuarioConfirmar = await Usuario.findOne( {token} );

    if(!usuarioConfirmar) {
        return res.status(403).json({
            msg: "Token no válido."
        });
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        return res.json({
            msg: "Cuenta confirmada correctamente."
        })
    } catch (error) {
        return res.status(403).json({
            msg: "La cuenta ya fue registrada tiempo atras."
        })
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne( {email} );

    if(!usuario) {
        return res.status(404).json({
            msg:"No existe un usuario con el email ingresado."
        });
    }

    try {
        usuario.token = generarID();
        await usuario.save();

        //Enviamos el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });

        return res.json({
            msg: "Hemos enviado un email con las instrucciones."
        })
    } catch (error) {
        console.log(error);
    }

}


const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if(!tokenValido) {
        return res.status(403).json({
            msg: "Token no válido."
        })
    }

    return res.json({
        msg: "Token válido y el usuario existe."
    })
}

const actualizarPassword = async (req, res) => {
    const { token } = req.params;
    const {password} = req.body;
    
    const usuario = await Usuario.findOne({ token });

    if(!usuario) {
        return res.status(403).json({
            msg: "Token no válido."
        })
    }

    usuario.password = password;
    usuario.token = "";
    await usuario.save();

    res.json({
        msg: "Contraseña modificada correctamente."
    })
}

const perfil = async (req, res) => {
    const {usuario} = req;

    return res.json(usuario);
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    actualizarPassword,
    perfil
}