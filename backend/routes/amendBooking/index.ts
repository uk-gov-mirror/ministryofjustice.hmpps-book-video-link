import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import ChangeDateAndTimeController from './changeDateAndTimeController'
import changeDateAndTimeValidation from './changeDateAndTimeValidation'
import VideoLinkIsAvailableController from './videoLinkIsAvailableController'
import SelectAvailableRoomsController from './selectAvailableRoomsController'
import ConfirmationController from './confirmationController'

export default function createRoutes({ bookingService, availabilityCheckService }: Services): Router {
  const changeDateAndTime = new ChangeDateAndTimeController(bookingService)
  const videoLinkIsAvailable = new VideoLinkIsAvailableController(bookingService)
  const selectAvailableRooms = new SelectAvailableRoomsController(bookingService, availabilityCheckService)
  const confirmation = new ConfirmationController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.view(false)))
  router.post(
    '/change-date-and-time/:bookingId',
    validationMiddleware(changeDateAndTimeValidation),
    asyncMiddleware(changeDateAndTime.submit(false))
  )

  router.get('/change-time/:bookingId', asyncMiddleware(changeDateAndTime.view(true)))
  router.post(
    '/change-time/:bookingId',
    validationMiddleware(changeDateAndTimeValidation),
    asyncMiddleware(changeDateAndTime.submit(true))
  )

  router.get('/video-link-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.view()))
  router.post('/video-link-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.submit()))

  router.get('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.view()))
  router.post('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.submit()))

  router.get('/video-link-change-confirmed/:bookingId', asyncMiddleware(confirmation.view()))

  return router
}
