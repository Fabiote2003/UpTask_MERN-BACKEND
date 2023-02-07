import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = await Usuario.findById(decoded.id).select(
                "-password -__v -confirmado -token -createdAt -updatedAt"
            );
            
            return next();
        } catch (error) {
            return res.status(403).json({
                msg: "Token no válido."
            })
        }
    }
    if(!token) {
        return res.status(401).json({
            msg: "No hay token en la petición"
        })
    }
    
}

export default checkAuth;