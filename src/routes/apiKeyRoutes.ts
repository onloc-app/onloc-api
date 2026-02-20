import { Router } from "express"
import {
  createApiKey,
  deleteApiKeys,
  readApiKeys,
} from "../controllers/apiKeyController"
import { authenticate } from "../middlewares/auth"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/apikeys:
 *   post:
 *     summary: Create a new API key
 *     description: Generates a new random API key for the authenticated user. The full key is only returned once (on creation).
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My backup script"
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_key:
 *                   $ref: "#/components/schemas/ApiKeySafe"
 *             example:
 *               apiKey:
 *                 id: "123"
 *                 name: "My backup script"
 *                 key: "ak_64_char_hex_string_here_64_char_hex_string_here"
 *                 created_at: "2026-01-08T12:00:00Z"
 *                 updated_at: "2026-01-08T12:00:00Z"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createApiKey)

/**
 * @openapi
 * /api/apikeys:
 *   get:
 *     summary: List all API keys for the current user
 *     description: Returns all API keys belonging to the authenticated user.
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_keys:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/ApiKeySafe"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readApiKeys)

/**
 * @openapi
 * /api/apikeys/{id}:
 *   delete:
 *     summary: Delete an API key
 *     description: Permanently deletes an API key. You can only delete your own keys.
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The API key ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: API key deleted successfully (no content)
 *       400:
 *         description: Missing ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: API key not found or doesn't belong to you
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteApiKeys)

export default router
