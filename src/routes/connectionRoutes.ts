import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  acceptConnectionRequest,
  readConnections,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../controllers/connectionController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/connections/send:
 *   post:
 *     summary: Send a connection request
 *     description: Send a connection request from the authenticated user to another user.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressee_id]
 *             properties:
 *               addressee_id:
 *                 type: string
 *                 description: ID of the user to send a connection request to
 *                 example: "456"
 *     responses:
 *       201:
 *         description: Connection request created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     requester_id:
 *                       type: string
 *                     addressee_id:
 *                       type: string
 *                     status:
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
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/send", sendConnectionRequest)

/**
 * @openapi
 * /api/connections/accept:
 *   post:
 *     summary: Accept a connection request
 *     description: Accept a pending connection request. Only the addressee may accept.
 *     tags: [Connections]
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
 *                 description: Connection ID to accept
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Connection accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     requester_id:
 *                       type: string
 *                     addressee_id:
 *                       type: string
 *                     status:
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
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/accept", acceptConnectionRequest)

/**
 * @openapi
 * /api/connections/reject:
 *   post:
 *     summary: Reject a connection request
 *     description: Reject a pending connection request.
 *     tags: [Connections]
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
 *                 description: Connection ID to reject
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Connection rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     requester_id:
 *                       type: string
 *                     addressee_id:
 *                       type: string
 *                     status:
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
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.post("/reject", rejectConnectionRequest)

/**
 * @openapi
 * /api/connections:
 *   get:
 *     summary: List connections for current user
 *     description: Returns all connections where the authenticated user is either the requester or addressee.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       requester_id:
 *                         type: string
 *                       addressee_id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       username:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readConnections)

export default router
