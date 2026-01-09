import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createPreference,
  deletePreference,
  readPreference,
  readPreferences,
  updatePreference,
} from "../controllers/preferenceController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/preferences:
 *   post:
 *     summary: Create a new preference
 *     description: Create a new preference for the authenticated user. The `user_id` must match the authenticated user.
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PreferenceCreate"
 *     responses:
 *       201:
 *         description: Preference created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preference:
 *                   $ref: "#/components/schemas/Preference"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createPreference)

/**
 * @openapi
 * /api/preferences:
 *   get:
 *     summary: List preferences for the authenticated user
 *     description: Returns one or more preferences for the current authenticated user. Supports optional `key` query filter.
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Optional preference key to filter by
 *     responses:
 *       200:
 *         description: List of preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Preference"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readPreferences)

/**
 * @openapi
 * /api/preferences/{id}:
 *   get:
 *     summary: Get a single preference
 *     description: Returns a single preference belonging to the authenticated user.
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Preference ID
 *         example: "789"
 *     responses:
 *       200:
 *         description: Preference details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preference:
 *                   $ref: "#/components/schemas/Preference"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/:id", readPreference)

/**
 * @openapi
 * /api/preferences:
 *   patch:
 *     summary: Update a preference
 *     description: Update an existing preference. The `user_id` must match the authenticated user.
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PreferenceUpdate"
 *     responses:
 *       200:
 *         description: Preference updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preference:
 *                   $ref: "#/components/schemas/Preference"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.patch("/", updatePreference)

/**
 * @openapi
 * /api/preferences/{id}:
 *   delete:
 *     summary: Delete a preference
 *     description: Delete a single preference. The authenticated user must own the preference.
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Preference ID to delete
 *         example: "789"
 *     responses:
 *       204:
 *         description: Preference deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deletePreference)

export default router
