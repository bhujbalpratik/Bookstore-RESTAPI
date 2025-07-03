import express from "express"
import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  searchBooksByGenre,
} from "../controllers/book.controllers.js"
import { isAuthenticated } from "../utils/verifyuser.js"

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - genre
 *         - publishedYear
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: The title of the book
 *         author:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: The author of the book
 *         genre:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The genre of the book
 *         publishedYear:
 *           type: integer
 *           minimum: 1000
 *           maximum: 2024
 *           description: The year the book was published
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who added the book
 *       example:
 *         id: d5fE_asz
 *         title: "The Great Gatsby"
 *         author: "F. Scott Fitzgerald"
 *         genre: "Fiction"
 *         publishedYear: 1925
 *         userId: "user123"
 *     BookInput:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - genre
 *         - publishedYear
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: The title of the book
 *         author:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: The author of the book
 *         genre:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The genre of the book
 *         publishedYear:
 *           type: integer
 *           minimum: 1000
 *           maximum: 2024
 *           description: The year the book was published
 *       example:
 *         title: "To Kill a Mockingbird"
 *         author: "Harper Lee"
 *         genre: "Fiction"
 *         publishedYear: 1960
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: Current page number
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *         totalBooks:
 *           type: integer
 *           description: Total number of books
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *         hasPreviousPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *       example:
 *         currentPage: 1
 *         totalPages: 5
 *         totalBooks: 50
 *         hasNextPage: true
 *         hasPreviousPage: false
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with filtering and pagination
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of books per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter books by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter books by author (partial match)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter books by title (partial match)
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Books retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/books", getAllBooks)

/**
 * @swagger
 * /api/books/search/{genre}:
 *   get:
 *     summary: Search books by genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre to search for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Books in genre 'Fiction' retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/books/search/:genre", searchBooksByGenre)

/**
 * @swagger
 * /api/book/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Book retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     book:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         description: Book ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/book/:id", getBookById)

/**
 * @swagger
 * /api/book:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Book added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     book:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/book", isAuthenticated, addBook)

/**
 * @swagger
 * /api/book/{id}:
 *   put:
 *     summary: Update book (only by owner)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: The title of the book
 *               author:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: The author of the book
 *               genre:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: The genre of the book
 *               publishedYear:
 *                 type: integer
 *                 minimum: 1000
 *                 maximum: 2024
 *                 description: The year the book was published
 *             example:
 *               title: "The Great Gatsby - Updated"
 *               author: "F. Scott Fitzgerald"
 *               genre: "Classic Fiction"
 *               publishedYear: 1925
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Book updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     book:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - You can only update your own books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/book/:id", isAuthenticated, updateBook)

/**
 * @swagger
 * /api/book/{id}:
 *   delete:
 *     summary: Delete book (only by owner)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Book deleted successfully
 *       400:
 *         description: Book ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - You can only delete your own books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/book/:id", isAuthenticated, deleteBook)

export default router
