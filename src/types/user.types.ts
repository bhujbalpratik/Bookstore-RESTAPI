export interface User {
  id: string
  username: string
  email: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface UserData {
  users: User[]
}

export interface UserWithoutPassword {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface RegisterUserRequest {
  username: string
  email: string
  password: string
}

export interface LoginUserRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: UserWithoutPassword
    token: string
  }
}

export interface UsersResponse {
  success: boolean
  message: string
  data?: {
    users: UserWithoutPassword[]
    count: number
  }
}

export interface UserResponse {
  success: boolean
  message: string
  data?: {
    user: UserWithoutPassword
  }
}

export interface ErrorResponse {
  success: false
  message: string
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}
