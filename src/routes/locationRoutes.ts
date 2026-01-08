import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  availableDates,
  createLocation,
  deleteLocation,
  deleteLocations,
  readLocation,
  readLocations,
  updateLocation,
} from "../controllers/locationController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/locations/dates:
 *   get:
 *     summary: Get available dates with location records for a device
 *     description: Returns a list of dates for which location records exist for the provided device.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID to fetch available dates for
 *         example: "123"
 *     responses:
 *       200:
 *         description: List of available dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dates:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/dates", availableDates)

/**
 * @openapi
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     description: Create a new location entry for a device. The authenticated user must own the device.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LocationCreate"
 *     responses:
 *       201:
 *         description: Location created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: "#/components/schemas/LocationSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/", createLocation)

/**
 * @openapi
 * /api/locations:
 *   get:
 *     summary: Read locations
 *     description: Retrieve locations for devices owned by the authenticated user. Supports filtering by device, date range and `latest=true` to fetch only the latest location per device.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: device_id
 *         schema:
 *           type: string
 *         description: Filter locations to a specific device (device id)
 *         example: "123"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO start datetime for filtering (inclusive)
 *         example: "2026-01-08T12:34:56Z"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO end datetime for filtering (inclusive)
 *         example: "2026-01-09T12:34:56Z"
 *       - in: query
 *         name: latest
 *         schema:
 *           type: string
 *         description: When "true", returns only the latest location per device
 *         example: "true"
 *     responses:
 *       200:
 *         description: Locations grouped by device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       device_id:
 *                         type: string
 *                         example: "123"
 *                       locations:
 *                         type: array
 *                         items:
 *                           $ref: "#/components/schemas/LocationSafe"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readLocations)

/**
 * @openapi
 * /api/locations/{id}:
 *   get:
 *     summary: Get a single location
 *     description: Returns a single location entry by ID.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *         example: "123"
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: "#/components/schemas/LocationSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/:id", readLocation)

/**
 * @openapi
 * /api/locations:
 *   patch:
 *     summary: Update a location
 *     description: Update an existing location. The authenticated user must own the device related to the location.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LocationUpdate"
 *     responses:
 *       200:
 *         description: Updated location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: "#/components/schemas/LocationSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.patch("/", updateLocation)

/**
 * @openapi
 * /api/locations:
 *   delete:
 *     summary: Delete all locations for a user
 *     description: Deletes all locations for the specified user. Admins can delete any user's locations; non-admins may only delete their own.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose locations will be deleted
 *         example: "123"
 *     responses:
 *       204:
 *         description: Locations deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/", deleteLocations)

/**
 * @openapi
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a single location
 *     description: Deletes a single location by ID. The authenticated user must own the device related to the location.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: Location deleted successfully (no content)
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.delete("/:id", deleteLocation)

export default router
