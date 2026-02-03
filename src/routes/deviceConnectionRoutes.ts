import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  createDeviceConnection,
  deleteDeviceConnection,
  readDeviceConnections,
} from "../controllers/deviceConnectionController"

const router = Router()
router.use(authenticate)

/**
 * @openapi
 * /api/deviceconnections:
 *   post:
 *     summary: Create a device connection
 *     description: Create a device connection linking a device to a connection (shared user). The authenticated user must be part of the connection and owner of the device.
 *     tags: [DeviceConnections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DeviceConnectionCreate"
 *     responses:
 *       201:
 *         description: Device connection created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device_connection:
 *                   $ref: "#/components/schemas/DeviceConnectionSafe"
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
router.post("/", createDeviceConnection)

/**
 * @openapi
 * /api/deviceconnections:
 *   get:
 *     summary: List device connections for the authenticated user
 *     description: Returns device connections where the authenticated user is part of the underlying connection. Includes the related device details.
 *     tags: [DeviceConnections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of device connections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DeviceConnectionList"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readDeviceConnections)

/**
 * @openapi
 * /api/deviceconnections/{id}:
 *   delete:
 *     summary: Delete a device connection
 *     description: Deletes a device connection by ID. The authenticated user must own the related device or be allowed to delete.
 *     tags: [DeviceConnections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: DeviceConnection ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: Device connection deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteDeviceConnection)

export default router
