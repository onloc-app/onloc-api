import { Router } from "express"
import {
  createDevice,
  deleteDevice,
  lockDevice,
  readDevice,
  readDevices,
  ringDevice,
  updateDevice,
} from "../controllers/deviceController"
import { authenticate } from "../middlewares/auth"

const router = Router()
router.use(authenticate)

/**
 * @openapi
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     description: Creates a new device for the authenticated user
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "iPhone 12"
 *               icon:
 *                 type: string
 *                 nullable: true
 *               can_ring:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Device created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   $ref: "#/components/schemas/DeviceSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createDevice)

/**
 * @openapi
 * /api/devices:
 *   get:
 *     summary: List all devices for the current user
 *     description: Returns all devices with latest known location and connection status
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 devices:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/DeviceWithExtras"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readDevices)

/**
 * @openapi
 * /api/devices/{id}:
 *   get:
 *     summary: Get a single device by ID
 *     description: Returns detailed information including latest location and connection status
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *         example: "123"
 *     responses:
 *       200:
 *         description: Device details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   $ref: "#/components/schemas/DeviceWithExtras"
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
router.get("/:id", readDevice)

/**
 * @openapi
 * /api/devices:
 *   patch:
 *     summary: Update an existing device
 *     description: Updates device properties (name, icon, can_ring, etc.). Only the owner can update.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *                 nullable: true
 *               can_ring:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Device updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   $ref: "#/components/schemas/DeviceSafe"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.patch("/", updateDevice)

/**
 * @openapi
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete a device
 *     description: Permanently deletes a device. Only the owner can delete.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: Device deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteDevice)

/**
 * @openapi
 * /api/devices/{id}/ring:
 *   post:
 *     summary: Send ring command to device
 *     description: |
 *       Triggers a ring command if the device supports it (`can_ring = true`).
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *         example: "123"
 *     responses:
 *       200:
 *         description: Ring command sent (device online)
 *       202:
 *         description: Ring command queued (device offline)
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
router.post("/:id/ring", ringDevice)

/**
 * @openapi
 * /api/devices/{id}/lock:
 *   post:
 *     summary: Send lock command to device
 *     description: |
 *       Triggers a remote lock command for the specified device. If the device supports remote locking
 *       and is currently online the command is delivered immediately. If the device is offline the
 *       command will be queued for delivery when the device next comes online.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *         example: "123"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 nullable: true
 *                 description: Optional user message displayed on the device when locking
 *     responses:
 *       200:
 *         description: Lock command sent (device online)
 *       202:
 *         description: Lock command queued (device offline)
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
router.post("/:id/lock", lockDevice)

export default router
