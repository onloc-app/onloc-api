import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createUserTier,
  readUserTiers,
} from "../controllers/userTierController"

const router = Router()

router.use(authenticate)

router.post("/", createUserTier)
router.get("/", readUserTiers)

export default router
