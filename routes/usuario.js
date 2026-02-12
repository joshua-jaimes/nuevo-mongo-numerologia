import { Router } from "express";
import { deleteUsuario, getUsuario, getUsuarioEmail, postUsuario, putUsuario, putUsuarioActivar, putUsuarioInactivar } from "../controllers/usuario.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";
import { validarEmail, validarExisteUsuario } from "../helpers/usuarios.js";

const router = new Router()


router.get("/email", [
    check('email').not().isEmpty(),
    check('email', "No es un email valido").isEmail(),
    validarCampos
], getUsuarioEmail)

router.get("/", getUsuario)


router.post("/", [
    check('nombre').not().isEmpty().isLength({min:3,max:50}),
    check('Apellido').not().isAlpha('es-ES', {ignore: ' '}),
    check('edad').isNumeric(),
    check('fechanacimiento', "formato de fecha no valido").isISO8601().isDate(),
    check('email').isEmail().normalizeEmail(),    
    check('correo').custom(validarEmail),
    validarCampos
], postUsuario)


router.put("/activar/:id", putUsuarioActivar)

router.put("/inactivar/:id", putUsuarioInactivar)

router.put("/:id", [    
    check('nombre').not().isEmpty(),
    check('id').isMongoId(),
    check('id').custom(validarExisteUsuario),
    validarCampos
], putUsuario)


router.delete("/:id", deleteUsuario)


export default router