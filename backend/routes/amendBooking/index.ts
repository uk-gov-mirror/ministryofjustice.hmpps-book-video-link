import express, { Router } from 'express'
import { Services } from '../../services'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ChangeDateAndTimeController from './changeDateAndTimeController'
import VideoLinkIsAvailableController from './videoLinkIsAvailableController'
import SelectAvailableRoomsController from './selectAvailableRoomsController'
import ConfirmationController from './confirmationController'

export default function createRoutes({ bookingService }: Services): Router {
  const changeDateAndTime = new ChangeDateAndTimeController(bookingService)
  const videoLinkIsAvailable = new VideoLinkIsAvailableController(bookingService)
  const selectAvailableRooms = new SelectAvailableRoomsController(bookingService)
  const confirmation = new ConfirmationController(bookingService)

  const router = express.Router({ mergeParams: true })

  router.get('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.view()))
  router.post('/change-date-and-time/:bookingId', asyncMiddleware(changeDateAndTime.submit()))

  router.get('/video-link-is-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.view()))
  router.post('/video-link-is-available/:bookingId', asyncMiddleware(videoLinkIsAvailable.submit()))

  router.get('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.view()))
  router.post('/select-available-rooms/:bookingId', asyncMiddleware(selectAvailableRooms.submit()))

  router.get('/video-link-amended-confirmation/:bookingId', asyncMiddleware(confirmation.view()))

  return router
}