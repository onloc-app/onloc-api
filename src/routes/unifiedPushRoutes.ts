import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { register, unregister } from "../controllers/unifiedPushController";

const router = Router()

router.use(authenticate)

router.post("/register", register)

router.post("/unregister", unregister)

export default router
