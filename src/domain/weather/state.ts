import type { CurrentWeather, Location } from './models.ts'

export type AppErrorCode =
  | 'INVALID_INPUT'
  | 'LOCATION_NOT_FOUND'
  | 'API_ERROR'
  | 'INVALID_RESPONSE'

export type AppError = {
  code: AppErrorCode
  message: string
  cause?: unknown
}

export type AppState =
  | {
      status: 'initial'
    }
  | {
      status: 'loading'
      query: string
    }
  | {
      status: 'success'
      query: string
      location: Location
      current: CurrentWeather
    }
  | {
      status: 'not-found'
      query: string
      error: AppError
    }
  | {
      status: 'error'
      query: string
      error: AppError
    }
  | {
      status: 'invalid-input'
      error: AppError
    }
