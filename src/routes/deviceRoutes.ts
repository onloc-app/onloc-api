import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createDevice,
  deleteDevice,
  readDevice,
  readDevices,
  ringDevice,
  updateDevice,
} from "../controllers/deviceController"

const router = Router()

router.use(authenticate)

router.post("/", createDevice)
router.get("/", readDevices)
router.get("/:id", readDevice)
router.patch("/", updateDevice)
router.delete("/:id", deleteDevice)
router.post("/:id/ring", ringDevice)

export default router
