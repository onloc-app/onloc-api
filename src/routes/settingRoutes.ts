import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createSetting,
  deleteSetting,
  readSetting,
  readSettings,
  updateSetting,
} from "../controllers/settingController"

const router = Router()

router.use(authenticate)

router.post("/", createSetting)
router.get("/", readSettings)
router.get("/:id", readSetting)
router.patch("/", updateSetting)
router.delete("/:id", deleteSetting)

export default router
