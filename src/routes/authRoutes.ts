import { Router } from "express"
import {
  loginUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/authController"

const router = Router()

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user and get JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthTokens"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               message: "Invalid credentials"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/login", loginUser)

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account.
 *       The first registered user becomes admin automatically.
 *       Subsequent registrations may be disabled depending on server configuration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 format: password
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthTokens"
 *       400:
 *         description: Bad request (missing fields or username taken)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: "Username and password fields are required"
 *               usernameTaken:
 *                 value:
 *                   message: "Username already taken"
 *       403:
 *         description: Registration is disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               message: "Registration is disabled"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/register", registerUser)

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: Generates a new access token using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token obtained during login/register
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RefreshTokenResponse"
 *       400:
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               invalid:
 *                 value:
 *                   message: "Invalid refresh token"
 *       500:
 *         description: Server error
 */
router.post("/refresh", refreshAccessToken)

export default router
