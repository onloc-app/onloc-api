import { Router } from "express"
import {
  createSetting,
  deleteSetting,
  readSetting,
  readSettings,
  updateSetting,
} from "../controllers/settingController"
import { authenticate } from "../middlewares/auth"

const router: Router = Router()

router.use(authenticate)

router.post("/", createSetting)
router.get("/", readSettings)
router.get("/:id", readSetting)
router.patch("/", updateSetting)
router.delete("/:id", deleteSetting)

export default router
