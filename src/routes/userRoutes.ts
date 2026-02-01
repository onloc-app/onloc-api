import { Router } from "express"
import { authenticate } from "../middlewares/auth"
import {
  deleteUser,
  readUser,
  readUserInfo,
  readUsers,
  updateUser,
} from "../controllers/userController"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users
 *     description: Returns a list of users with additional computed fields.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserList"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/", readUsers)

/**
 * @openapi
 * /api/users/info:
 *   get:
 *     summary: Get current authenticated user info
 *     description: Returns information about the current authenticated user, including their assigned tier if present.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserWithExtras"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.get("/info", readUserInfo)

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user
 *     description: Returns a single user by ID. Users may only fetch their own data unless they are an admin.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "123"
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserWithExtras"
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
router.get("/:id", readUser)

/**
 * @openapi
 * /api/users:
 *   patch:
 *     summary: Update the current authenticated user
 *     description: Update fields on the current authenticated user. Admins may update other fields such as `admin` when permitted.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserUpdate"
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserSafe"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/InternalError"
 */
router.patch("/", updateUser)

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by ID. A user may delete their own account; admins may delete any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *         example: "123"
 *     responses:
 *       204:
 *         description: User deleted successfully (no content)
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
router.delete("/:id", deleteUser)

export default router
