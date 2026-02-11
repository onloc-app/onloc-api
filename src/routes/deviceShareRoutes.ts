import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createDeviceShare,
  deleteDeviceShare,
  readDeviceShares,
} from "../controllers/deviceShareController"

const router = Router()
router.use(authenticate)

/**
 * @openapi
 * /api/deviceshares:
 *   post:
 *     summary: Create a device share
 *     description: Create a device share linking a device to a connection (shared user). The authenticated user must be part of the connection and owner of the device.
 *     tags: [DeviceShares]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DeviceSharesCreate"
 *     responses:
 *       201:
 *         description: Device share created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device_share:
 *                   $ref: "#/components/schemas/DeviceShareSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createDeviceShare)

/**
 * @openapi
 * /api/deviceShares:
 *   get:
 *     summary: List device shares for the authenticated user
 *     description: Returns device shares where the authenticated user is part of the underlying connection. Includes the related device details.
 *     tags: [DeviceShares]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of device shares
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DeviceShareList"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readDeviceShares)

/**
 * @openapi
 * /api/deviceshares/{id}:
 *   delete:
 *     summary: Delete a device share
 *     description: Deletes a device share by ID. The authenticated user must own the related device or be allowed to delete.
 *     tags: [DeviceShares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: DeviceShare ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: Device share deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteDeviceShare)

export default router
