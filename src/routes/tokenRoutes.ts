import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  deleteToken,
  deleteTokenWithBody,
  readTokens,
} from "../controllers/tokenController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/tokens:
 *   get:
 *     summary: List refresh tokens
 *     description: Returns refresh tokens belonging to the authenticated user
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RefreshTokenList"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readTokens)

/**
 * @openapi
 * /api/tokens/{id}:
 *   delete:
 *     summary: Delete a refresh token by ID
 *     description: Delete a single refresh token by its ID. The token must belong to the authenticated user.
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token ID
 *         example: "123"
 *     responses:
 *       204:
 *         description: Token deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteToken)

/**
 * @openapi
 * /api/tokens:
 *   delete:
 *     summary: Delete a refresh token by value
 *     description: Delete a refresh token by providing the full refresh token string in the request body. The token must belong to the authenticated user.
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RefreshTokenDelete"
 *     responses:
 *       204:
 *         description: Token deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/", deleteTokenWithBody)

export default router
