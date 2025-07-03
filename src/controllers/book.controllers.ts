import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { readJSONFile, writeJSONFile } from "../utils/file.utils.js"
import { Book } from "../types/book.types.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BOOKS_FILE_PATH = path.join(__dirname, "..", "database", "books.json")

interface BookData {
  books: Book[]
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

const initializeBooksFile = async (): Promise<void> => {
  try {
    await readJSONFile<BookData>(BOOKS_FILE_PATH)
  } catch (error) {
    const initialData: BookData = { books: [] }
    await writeJSONFile(BOOKS_FILE_PATH, initialData)
  }
}

// Get all books with filtering and pagination
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { page = "1", limit = "10", genre, author, title } = req.query

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)

    if (pageNumber < 1 || limitNumber < 1) {
      res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)
    let filteredBooks = bookData.books

    // Apply filters
    if (genre) {
      filteredBooks = filteredBooks.filter(
        (book) => book.genre.toLowerCase() === (genre as string).toLowerCase()
      )
    }

    if (author) {
      filteredBooks = filteredBooks.filter((book) =>
        book.author.toLowerCase().includes((author as string).toLowerCase())
      )
    }

    if (title) {
      filteredBooks = filteredBooks.filter((book) =>
        book.title.toLowerCase().includes((title as string).toLowerCase())
      )
    }

    // Apply pagination
    const startIndex = (pageNumber - 1) * limitNumber
    const endIndex = startIndex + limitNumber
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

    const totalBooks = filteredBooks.length
    const totalPages = Math.ceil(totalBooks / limitNumber)

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: {
        books: paginatedBooks,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalBooks,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get books error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Search books by genre
export const searchBooksByGenre = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { genre } = req.params
    const { page = "1", limit = "10" } = req.query

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)

    if (pageNumber < 1 || limitNumber < 1) {
      res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)
    const filteredBooks = bookData.books.filter(
      (book) => book.genre.toLowerCase() === genre.toLowerCase()
    )

    // Apply pagination
    const startIndex = (pageNumber - 1) * limitNumber
    const endIndex = startIndex + limitNumber
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

    const totalBooks = filteredBooks.length
    const totalPages = Math.ceil(totalBooks / limitNumber)

    res.status(200).json({
      success: true,
      message: `Books in genre '${genre}' retrieved successfully`,
      data: {
        books: paginatedBooks,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalBooks,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      },
    })
  } catch (error) {
    console.error("Search books error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Get book by ID
export const getBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { id } = req.params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Book ID is required",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)
    const book = bookData.books.find((b) => b.id === id)

    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: {
        book,
      },
    })
  } catch (error) {
    console.error("Get book error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Add a new book
export const addBook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { title, author, genre, publishedYear } = req.body
    const userId = req.user?.userId

    if (!title || !author || !genre || !publishedYear) {
      res.status(400).json({
        success: false,
        message: "Title, author, genre, and published year are required",
      })
      return
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User authentication required",
      })
      return
    }

    // Validate published year
    const currentYear = new Date().getFullYear()
    if (publishedYear < 1000 || publishedYear > currentYear) {
      res.status(400).json({
        success: false,
        message: `Published year must be between 1000 and ${currentYear}`,
      })
      return
    }

    // Validate title and author length
    if (title.trim().length < 1 || title.trim().length > 200) {
      res.status(400).json({
        success: false,
        message: "Title must be between 1 and 200 characters",
      })
      return
    }

    if (author.trim().length < 1 || author.trim().length > 100) {
      res.status(400).json({
        success: false,
        message: "Author must be between 1 and 100 characters",
      })
      return
    }

    if (genre.trim().length < 1 || genre.trim().length > 50) {
      res.status(400).json({
        success: false,
        message: "Genre must be between 1 and 50 characters",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)

    const newBook: Book = {
      id: uuidv4(),
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      publishedYear: parseInt(publishedYear),
      userId,
    }

    bookData.books.push(newBook)
    await writeJSONFile(BOOKS_FILE_PATH, bookData)

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: {
        book: newBook,
      },
    })
  } catch (error) {
    console.error("Add book error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Update book (with ownership check)
export const updateBook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { id } = req.params
    const { title, author, genre, publishedYear } = req.body
    const userId = req.user?.userId

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Book ID is required",
      })
      return
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User authentication required",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)
    const bookIndex = bookData.books.findIndex((b) => b.id === id)

    if (bookIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      })
      return
    }

    // Check ownership
    if (bookData.books[bookIndex].userId !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only update your own books",
      })
      return
    }

    // Validate fields if provided
    if (publishedYear) {
      const currentYear = new Date().getFullYear()
      if (publishedYear < 1000 || publishedYear > currentYear) {
        res.status(400).json({
          success: false,
          message: `Published year must be between 1000 and ${currentYear}`,
        })
        return
      }
    }

    if (title && (title.trim().length < 1 || title.trim().length > 200)) {
      res.status(400).json({
        success: false,
        message: "Title must be between 1 and 200 characters",
      })
      return
    }

    if (author && (author.trim().length < 1 || author.trim().length > 100)) {
      res.status(400).json({
        success: false,
        message: "Author must be between 1 and 100 characters",
      })
      return
    }

    if (genre && (genre.trim().length < 1 || genre.trim().length > 50)) {
      res.status(400).json({
        success: false,
        message: "Genre must be between 1 and 50 characters",
      })
      return
    }

    // Update book
    const updatedBook = {
      ...bookData.books[bookIndex],
      ...(title && { title: title.trim() }),
      ...(author && { author: author.trim() }),
      ...(genre && { genre: genre.trim() }),
      ...(publishedYear && { publishedYear: parseInt(publishedYear) }),
    }

    bookData.books[bookIndex] = updatedBook
    await writeJSONFile(BOOKS_FILE_PATH, bookData)

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: {
        book: updatedBook,
      },
    })
  } catch (error) {
    console.error("Update book error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Delete book (with ownership check)
export const deleteBook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await initializeBooksFile()

    const { id } = req.params
    const userId = req.user?.userId

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Book ID is required",
      })
      return
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User authentication required",
      })
      return
    }

    const bookData = await readJSONFile<BookData>(BOOKS_FILE_PATH)
    const bookIndex = bookData.books.findIndex((b) => b.id === id)

    if (bookIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      })
      return
    }

    // Check ownership
    if (bookData.books[bookIndex].userId !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own books",
      })
      return
    }

    // Remove book
    bookData.books.splice(bookIndex, 1)
    await writeJSONFile(BOOKS_FILE_PATH, bookData)

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    })
  } catch (error) {
    console.error("Delete book error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}
