import { Router } from "express"
import {
  loginUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/authController"

const router = Router()

router.post("/login", loginUser)
router.post("/register", registerUser)
router.post("/refresh", refreshAccessToken)

export default router
