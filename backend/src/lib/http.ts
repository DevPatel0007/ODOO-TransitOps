import type { NextFunction, Request, Response } from 'express'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public details?: unknown,
  ) {
    super(message)
  }
}

export function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(handler(request, response, next)).catch(next)
  }
}

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({ error: 'Route not found' })
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({ error: error.message, details: error.details })
  }

  console.error(error)
  return response.status(500).json({ error: 'Internal server error' })
}