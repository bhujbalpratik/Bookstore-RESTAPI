# Bookstore REST API

A RESTful API built with Node.js and Express for managing a bookstore application. Features include CRUD operations for books, JWT-based authentication, and file-based data persistence.

## Features

- **User Authentication**: JWT-based token authentication
- **Book Management**: Full CRUD operations for books
- **File-based Persistence**: Data stored in JSON files
- **User Authorization**: Users can only modify their own books
- **Search & Filter**: Search books by genre
- **Pagination**: Paginated results for book listings
- **Error Handling**: Comprehensive error handling
- **API Documentation**: Interactive Swagger UI documentation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **UUID** - Unique identifier generation
- **bcrypt** - Password hashing
- **fs.promises** - File system operations
- **Swagger UI** - API documentation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bhujbalpratik/Bookstore-RESTAPI.git
cd Bookstore-RESTAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create .env file
touch .env
```

Add the following to `.env`:
```
PORT=3000
JWT_SECRET=your-jwt-secret
NODE_ENV=development
BASE_URL=http://localhost:3000
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Interactive Documentation
Visit `http://localhost:3000/api-docs` to access the complete interactive API documentation with Swagger UI.

### Quick Start

1. **Register a new user** at `/api/users/register`
2. **Login** at `/api/users/login` to get your JWT token
3. **Use the token** in the Authorization header for all book endpoints
4. **Explore all endpoints** in the Swagger UI at `/api-docs`

### Authentication
All book endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Testing the API

### Using Swagger UI (Recommended)
1. Go to `http://localhost:3000/api-docs`
2. Register a new user or login with existing credentials
3. Copy the JWT token from the login response
4. Click "Authorize" button in Swagger UI and paste the token
5. Test all endpoints directly from the documentation

### Using Postman
1. Import the API collection (if available) or manually create requests
2. Set base URL: `http://localhost:3000`
3. Register/Login to get JWT token
4. Set Authorization header: `Bearer <your-jwt-token>`
5. Test all endpoints as documented in Swagger UI

### Using cURL
Example requests:

**Register:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Books:**
```bash
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For complete examples, refer to the Swagger documentation at `/api-docs`.

## Project Structure

```
Bookstore-RESTAPI/
├── src/
│   ├── config/
│   │   └── swagger.ts
│   ├── controllers/
│   │   ├── book.controllers.ts
│   │   └── user.controllers.ts
│   ├── database/
│   │   ├── books.json
│   │   └── users.json
│   ├── routes/
│   │   ├── book.routes.ts
│   │   └── user.routes.ts
│   ├── types/
│   │   ├── book.types.ts
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── file.utils.ts
│   │   └── verifyuser.ts
│   └── index.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Data Persistence

The API uses file-based persistence with JSON files:
- `users.json` - Stores user data
- `books.json` - Stores book data

Files are automatically created when the server starts if they don't exist.

## Security Features

- **Password Hashing**: User passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **User Authorization**: Users can only modify their own books
- **Input Validation**: Request data is validated before processing

## Error Handling

The API returns appropriate HTTP status codes and error messages. Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

**Pratik Bhujbal**
- GitHub: [@bhujbalpratik](https://github.com/bhujbalpratik)

## Acknowledgments

- Built as part of a Node.js REST API development task
- Uses industry-standard practices for authentication and data persistence
