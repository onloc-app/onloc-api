import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createPreference,
  deletePreference,
  readPreference,
  readPreferences,
  updatePreference,
} from "../controllers/preferenceController"

const router = Router()

router.use(authenticate)

router.post("/", createPreference)
router.get("/", readPreferences)
router.get("/:id", readPreference)
router.patch("/", updatePreference)
router.delete("/:id", deletePreference)

export default router
