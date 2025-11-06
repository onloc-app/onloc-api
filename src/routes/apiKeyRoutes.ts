import { Router } from "express"
import {
  createApiKey,
  deleteApiKeys,
  readApiKeys,
} from "../controllers/apiKeyController"
import { authenticate } from "../middlewares/auth"

const router = Router()

router.use(authenticate)

router.post("/", createApiKey)
router.get("/", readApiKeys)
router.delete("/:id", deleteApiKeys)

export default router
