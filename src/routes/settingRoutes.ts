import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createSetting,
  deleteSetting,
  readSetting,
  readSettings,
  updateSetting,
} from "../controllers/settingController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/settings:
 *   post:
 *     summary: Create a new setting
 *     description: Create a new server setting (admin only).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SettingCreate"
 *     responses:
 *       201:
 *         description: Setting created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setting:
 *                   $ref: "#/components/schemas/Setting"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createSetting)

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: List all settings
 *     description: Returns all server settings (admin only).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Setting"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readSettings)

/**
 * @openapi
 * /api/settings/{id}:
 *   get:
 *     summary: Get a setting by ID
 *     description: Retrieve a single server setting by ID (admin only).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting ID
 *         example: "321"
 *     responses:
 *       200:
 *         description: Setting details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setting:
 *                   $ref: "#/components/schemas/Setting"
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
router.get("/:id", readSetting)

/**
 * @openapi
 * /api/settings:
 *   patch:
 *     summary: Update an existing setting
 *     description: Update a server setting (admin only).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SettingUpdate"
 *     responses:
 *       200:
 *         description: Setting updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setting:
 *                   $ref: "#/components/schemas/Setting"
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
router.patch("/", updateSetting)

/**
 * @openapi
 * /api/settings/{id}:
 *   delete:
 *     summary: Delete a setting
 *     description: Delete a server setting by ID (admin only).
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting ID
 *         example: "321"
 *     responses:
 *       204:
 *         description: Setting deleted successfully (no content)
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
router.delete("/:id", deleteSetting)

export default router
