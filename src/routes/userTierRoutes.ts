import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createUserTier,
  readUserTiers,
} from "../controllers/userTierController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/usertiers:
 *   post:
 *     summary: Assign or update a user's tier
 *     description: Create or update the link between a user and a tier (admin only). If the user already has a tier assignment, it will be updated.
 *     tags: [UserTiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserTierCreate"
 *     responses:
 *       201:
 *         description: User-tier link created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_tier:
 *                   $ref: "#/components/schemas/UserTier"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createUserTier)

/**
 * @openapi
 * /api/usertiers:
 *   get:
 *     summary: List user-tier links
 *     description: Returns all user-tier associations (admin only).
 *     tags: [UserTiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user-tier links
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserTierList"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readUserTiers)

export default router
