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

/**
 * @openapi
 * /api/tiers:
 *   post:
 *     summary: Create a new tier
 *     description: Create a new tier (admin only).
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TierCreate"
 *     responses:
 *       201:
 *         description: Tier created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tier:
 *                   $ref: "#/components/schemas/Tier"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createTier)

/**
 * @openapi
 * /api/tiers/reorder:
 *   post:
 *     summary: Reorder tiers
 *     description: Update the order of multiple tiers (admin only). Provide an array of tier objects with the modified `order_rank`.
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: "#/components/schemas/Tier"
 *     responses:
 *       200:
 *         description: Tiers reordered successfully
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/reorder", reorderTiers)

/**
 * @openapi
 * /api/tiers:
 *   get:
 *     summary: List tiers
 *     description: Returns a list of tiers (admin only).
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tiers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tiers:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Tier"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readTiers)

/**
 * @openapi
 * /api/tiers/{id}:
 *   get:
 *     summary: Get a single tier
 *     description: Returns a single tier by ID (admin only).
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tier ID
 *         example: "123"
 *     responses:
 *       200:
 *         description: Tier details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tier:
 *                   $ref: "#/components/schemas/Tier"
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
router.get("/:id", readTier)

/**
 * @openapi
 * /api/tiers:
 *   patch:
 *     summary: Update a tier
 *     description: Update an existing tier (admin only). The request body must include the `id` of the tier to update.
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TierUpdate"
 *     responses:
 *       200:
 *         description: Tier updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tier:
 *                   $ref: "#/components/schemas/Tier"
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
router.patch("/", updateTier)

/**
 * @openapi
 * /api/tiers/{id}:
 *   delete:
 *     summary: Delete a tier
 *     description: Delete a single tier by ID (admin only).
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tier ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: Tier deleted successfully (no content)
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
router.delete("/:id", deleteTier)

export default router
