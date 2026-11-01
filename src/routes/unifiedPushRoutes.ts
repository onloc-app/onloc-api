import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import { register, unregister } from "../controllers/unifiedPushController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/unifiedpush/register:
 *   post:
 *     summary: Register a UnifiedPush provider
 *     description: Register or update a UnifiedPush endpoint for the authenticated user, optionally linked to a owned device.
 *     tags: [UnifiedPush]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UnifiedPushRegister"
 *     responses:
 *       201:
 *         description: Provider registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unified_push_provider:
 *                   $ref: "#/components/schemas/UnifiedPushProviderSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/register", register)

/**
 * @openapi
 * /api/unifiedpush/unregister:
 *   post:
 *     summary: Unregister a UnifiedPush provider
 *     description: Remove a registered UnifiedPush endpoint owned by the authenticated user.
 *     tags: [UnifiedPush]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UnifiedPushUnregister"
 *     responses:
 *       204:
 *         description: Provider unregistered
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/unregister", unregister)

export default router
