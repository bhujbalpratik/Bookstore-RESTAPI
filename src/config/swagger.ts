import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const isProduction = process.env.NODE_ENV === "production"
const baseUrl = process.env.BASE_URL || "http://localhost:8000"
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bookstore API",
      version: "1.0.0",
      description:
        "A comprehensive bookstore CRUD API with user authentication",
      contact: {
        name: "Pratik Bhujbal",
        email: "pratikbhujbal743@gmail.com",
      },
    },
    servers: [
      {
        url: isProduction ? baseUrl : "http://localhost:8000",
        description: isProduction ? "Production server" : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the user",
            },
            username: {
              type: "string",
              minLength: 3,
              maxLength: 20,
              description: "Username (3-20 characters)",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              minLength: 6,
              description:
                "Password (minimum 6 characters with letter and number)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            username: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Book: {
          type: "object",
          required: ["title", "author", "price"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the book",
            },
            title: {
              type: "string",
              description: "Book title",
            },
            author: {
              type: "string",
              description: "Book author",
            },
            genre: {
              type: "string",
              description: "Book genre",
            },
            publishedYear: {
              type: "number",
              minimum: 0,
              description: "Book price",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "User ID",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
}

const specs = swaggerJsdoc(options)

export { swaggerUi, specs }
