import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import { DAY_MONTH_YEAR } from '../../shared/dateHelpers'

export = class ChangeDateAndTimeController {
  public constructor(private readonly bookingService: BookingService) {}

  public view(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params

      const errors = req.flash('errors') || []
      const input = req.flash('input')[0] || {}
      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))
      res.render('amendBooking/changeDateAndTime.njk', {
        changeTime: changeTimeView,
        date: input.date || (changeTimeView ? bookingDetails.date.format(DAY_MONTH_YEAR) : null),
        startTimeHours: input.startTimeHours || null,
        startTimeMinutes: input.startTimeMinutes || null,
        endTimeHours: input.endTimeHours || null,
        endTimeMinutes: input.endTimeMinutes || null,
        preAppointmentRequired: input.preAppointmentRequired || null,
        postAppointmentRequired: input.postAppointmentRequired || null,
        errors,
        bookingId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
          court: bookingDetails.courtLocation,
        },
      })
    }
  }

  public submit(changeTimeView: boolean): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(changeTimeView ? `/change-time/${bookingId}` : `/change-date-and-time/${bookingId}`)
      }
      return res.redirect(`/video-link-available/${bookingId}`)
    }
  }
}
