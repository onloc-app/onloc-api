import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import { deleteUser, readUser, updateUser } from "../controllers/userController"

const router = Router()

router.use(authenticate)

router.get("/", readUser)
router.patch("/", updateUser)
router.delete("/:id", deleteUser)

export default router
