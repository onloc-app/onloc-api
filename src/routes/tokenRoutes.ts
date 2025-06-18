import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  deleteToken,
  deleteTokenWithBody,
  readTokens,
} from "../controllers/tokenController"

const router = Router()

router.use(authenticate)

router.get("/", readTokens)
router.delete("/:id", deleteToken)
router.delete("/", deleteTokenWithBody)

export default router
