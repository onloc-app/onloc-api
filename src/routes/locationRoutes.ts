import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  availableDates,
  createLocation,
  deleteLocation,
  readLocation,
  readLocations,
  updateLocation,
} from "../controllers/locationController"

const router = Router()

router.use(authenticate)

router.get("/dates", availableDates)

router.post("/", createLocation)
router.get("/", readLocations)
router.get("/:id", readLocation)
router.patch("/", updateLocation)
router.delete("/:id", deleteLocation)

export default router
