import { Router } from "express";
import { getLecturas, getLecturasId, postLecturas, putLecturas, deleteLecturas } from "../controllers/lecturas.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";


const router = new Router()

router.get("/", getLecturas);

router.get("/:usuario_id", [
  check("usuario_id", "No es un ID válido").isMongoId(),
  validarCampos
], getLecturasId);

router.delete("/:id", [
  check("id", "No es un ID válido").isMongoId(),
  validarCampos
], deleteLecturas);

router.post("/", [
  check("usuario_id", "El campo usuario_id es obligatorio").not().isEmpty(),
  check("usuario_id", "No es un ID válido").isMongoId(),
  check("tipo", "El campo tipo es obligatorio").isIn(["principal", "diaria"]),
  validarCampos
], postLecturas);

router.put("/:id", [
  check("id", "No es un ID válido").isMongoId(),
  check("monto", "El campo monto debe ser numérico").optional().isNumeric(),
  check("fecha_pago", "El campo fecha_pago debe ser una fecha válida").optional().isISO8601(),
  check("fecha_vencimiento", "El campo fecha_vencimiento debe ser una fecha válida").optional().isISO8601(),
  check("metodo", "El campo metodo es obligatorio").optional().not().isEmpty(),
  validarCampos
], putLecturas);

export default router
