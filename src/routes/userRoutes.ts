import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import { readUser, updateUser } from "../controllers/userController"

const router = Router()

router.use(authenticate)

router.get("/", readUser)
router.patch("/", updateUser)

export default router
