import express from 'express';
import { registrar, autenticar,  confirmar, olvidePassword, comprobarToken, actualizarPassword, perfil} from '../controllers/usuarioController.js';
import checkAuth from '../middlewares/checkAuth.js';

const router = express.Router();

router.post('/', registrar); //Crea un nuevo usuario.

router.post('/login', autenticar); //Autentica un usuario.

router.get('/confirmar/:token', confirmar); //Confirma la cuenta de un usuario.

router.post('/olvide-password', olvidePassword); //Crea una nueva contraseña a un usuario.

router.get('/olvide-password/:token', comprobarToken); //Comprueba el token para cambiar la contraseña.

router.post('/olvide-password/:token', actualizarPassword); //Actualiza el password.

router.get("/perfil", checkAuth, perfil); //Obtiene la información del usuario.

export default router;