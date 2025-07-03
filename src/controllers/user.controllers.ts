import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { readJSONFile, writeJSONFile } from "../utils/file.utils.js"
import { User, UserData } from "../types/user.types.js"
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE_PATH = path.join(__dirname, "..", "database", "users.json")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
  return passwordRegex.test(password)
}
const initializeUsersFile = async (): Promise<void> => {
  try {
    await readJSONFile<UserData>(USERS_FILE_PATH)
  } catch (error) {
    const initialData: UserData = { users: [] }
    await writeJSONFile(USERS_FILE_PATH, initialData)
  }
}
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeUsersFile()

    const { username, email, password } = req.body

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      })
      return
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      })
      return
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long and contain at least one letter and one number",
      })
      return
    }

    if (username.length < 3 || username.length > 20) {
      res.status(400).json({
        success: false,
        message: "Username must be between 3 and 20 characters",
      })
      return
    }

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)

    const existingUser = userData.users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() ||
        user.username.toLowerCase() === username.toLowerCase()
    )

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      })
      return
    }

    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser: User = {
      id: uuidv4(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    userData.users.push(newUser)

    await writeJSONFile(USERS_FILE_PATH, userData)

    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    // Handle specific error types
    if (error instanceof SyntaxError) {
      res.status(500).json({
        success: false,
        message: "Database corruption detected. Please contact support.",
      })
      return
    }

    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.status(500).json({
        success: false,
        message: "Database file not found. Please contact support.",
      })
      return
    }

    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      res.status(500).json({
        success: false,
        message: "Database access denied. Please contact support.",
      })
      return
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await initializeUsersFile()

    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
      return
    }

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)

    const user = userData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
      return
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    })
    const { password: _, ...userWithoutPassword } = user

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token,
        },
      })
  } catch (error) {
    console.error("Login error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeUsersFile()

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)

    const usersWithoutPasswords = userData.users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: usersWithoutPasswords,
        count: usersWithoutPasswords.length,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeUsersFile()

    const { id } = req.params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      })
      return
    }

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)
    const user = userData.users.find((u) => u.id === id)

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Update user
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeUsersFile()

    const { id } = req.params
    const { username, email } = req.body

    if (!id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      })
      return
    }

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)
    const userIndex = userData.users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      })
      return
    }

    // Check for duplicate username/email
    if (username || email) {
      const duplicateUser = userData.users.find(
        (user, index) =>
          index !== userIndex &&
          ((username &&
            user.username.toLowerCase() === username.toLowerCase()) ||
            (email && user.email.toLowerCase() === email.toLowerCase()))
      )

      if (duplicateUser) {
        res.status(409).json({
          success: false,
          message: "Username or email already exists",
        })
        return
      }
    }

    // Update user
    const updatedUser = {
      ...userData.users[userIndex],
      ...(username && { username: username.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      updatedAt: new Date().toISOString(),
    }

    userData.users[userIndex] = updatedUser

    // Write updated data
    await writeJSONFile(USERS_FILE_PATH, userData)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await initializeUsersFile()

    const { id } = req.params

    if (!id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      })
      return
    }

    const userData = await readJSONFile<UserData>(USERS_FILE_PATH)
    const userIndex = userData.users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }

    // Remove user
    userData.users.splice(userIndex, 1)

    // Write updated data
    await writeJSONFile(USERS_FILE_PATH, userData)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
}
