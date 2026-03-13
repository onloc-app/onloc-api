import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  deleteAvatar,
  upload,
  upsertAvatar,
} from "../controllers/avatarController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/avatars:
 *   post:
 *     summary: Upload or update the authenticated user's avatar
 *     description: Uploads an avatar image for the authenticated user. If an avatar already exists it will be replaced.
 *     tags: [Avatars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (jpeg, png or webp). Field name must be `avatar`.
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     url:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       415:
 *         description: Unsupported media type / invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", upload.single("avatar"), upsertAvatar)

/**
 * @openapi
 * /api/avatars:
 *   delete:
 *     summary: Delete the authenticated user's avatar
 *     description: Removes the avatar file and database record for the authenticated user.
 *     tags: [Avatars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Avatar deleted successfully (no content)
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: Avatar not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/", deleteAvatar)

export default router
