import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token
  if (!token) {
    const err = new Error("You should sign in first")
    ;(err as any).status = 401
    return next(err)
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      const error = new Error("Token is not valid")
      ;(error as any).status = 403
      return next(error)
    }

    req.user = user
    next()
  })
}
