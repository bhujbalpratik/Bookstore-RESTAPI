import express from "express"
import cors from "cors"
import "dotenv/config"
import { swaggerUi, specs } from "./config/swagger.js"
import userRoutes from "./routes/user.routes.js"
import cookieParser from "cookie-parser"
import bookRoutes from "./routes/book.routes.js"

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Bookstore API Documentation",
  })
)

app.use("/api/users", userRoutes)
app.use("/api/", bookRoutes)

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  })
})

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Bookstore API",
    documentation: "/api-docs",
    health: "/health",
  })
})

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    })
  }
)

app.listen(PORT, () => {
  console.log(`🚀 Server is running on :${PORT}`)
})
