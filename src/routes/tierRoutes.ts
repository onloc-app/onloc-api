import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createTier,
  deleteTier,
  readTier,
  readTiers,
  reorderTiers,
  updateTier,
} from "../controllers/tierController"

const router = Router()

router.use(authenticate)

router.post("/", createTier)
router.post("/reorder", reorderTiers)
router.get("/", readTiers)
router.get("/:id", readTier)
router.patch("/", updateTier)
router.delete("/:id", deleteTier)

export default router
