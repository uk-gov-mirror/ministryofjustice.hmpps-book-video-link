import type { OffenderBooking, Location, Prison } from 'prisonApi'
import moment from 'moment'
import type { Appointment, VideoLinkBooking } from 'whereaboutsApi'
import PrisonApi from '../api/prisonApi'
import WhereaboutsApi from '../api/whereaboutsApi'
import { formatName, getTime, flattenCalls } from '../utils'
import { app } from '../config'
import { Context, HearingType, AppointmentResult } from './model'

export = class BookingService {
  constructor(private readonly prisonApi: PrisonApi, private readonly whereaboutsApi: WhereaboutsApi) {}

  private filterByCourt(option: string, courts: string[], booking: VideoLinkBooking) {
    if (!option) {
      return true
    }
    if (option === 'Other') {
      return !courts.includes(booking.court)
    }
    return option === booking.court
  }

  private getOffenderName(offenderBookings: OffenderBooking[], booking: VideoLinkBooking) {
    const offenderBooking = offenderBookings.find(b => b.bookingId === booking.bookingId)
    return offenderBooking ? formatName(offenderBooking.firstName, offenderBooking.lastName) : ''
  }

  private toMap<T, F extends keyof T>(items: T[] = [], name: F): Map<T[F], T> {
    return items.reduce((result, item) => {
      result.set(item[name], item)
      return result
    }, new Map<T[F], T>())
  }

  private async toAppointment(
    context: Context,
    prisons: Map<string, Prison>,
    locations: Map<number, Location>,
    bookings: VideoLinkBooking[]
  ) {
    const offenderBookings = await this.prisonApi.getPrisonBookings(context, [
      ...new Set(bookings.map(b => b.bookingId)),
    ])

    return (booking: VideoLinkBooking, slot: Appointment, hearingType: HearingType) => {
      const location = locations.get(slot.locationId)
      const prison = prisons.get(location?.agencyId)
      return {
        locationId: slot.locationId,
        court: booking.court,
        offenderName: this.getOffenderName(offenderBookings, booking),
        prison: prison?.formattedDescription || '',
        prisonLocation: location?.userDescription || '',
        videoLinkBookingId: booking.videoLinkBookingId,
        hearingType,
        time: slot.endTime ? `${getTime(slot.startTime)} to ${getTime(slot.endTime)}` : getTime(booking.pre.startTime),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }
    }
  }

  public async getAppointmentList(
    context: Context,
    searchDate: moment.Moment,
    courtFilter: string
  ): Promise<AppointmentResult> {
    const bookingRequests = app.videoLinkEnabledFor.map(prison =>
      this.whereaboutsApi.getVideoLinkBookings(context, prison, searchDate)
    )
    const locationRequests = app.videoLinkEnabledFor.map(prison =>
      this.prisonApi.getLocationsForAppointments(context, prison)
    )

    const [courts, prisons, locations, bookings] = await Promise.all([
      this.whereaboutsApi.getCourtLocations(context).then(r => r.courtLocations),
      this.prisonApi.getAgencies(context).then(result => this.toMap(result, 'agencyId')),
      flattenCalls(locationRequests).then(result => this.toMap(result, 'locationId')),
      flattenCalls(bookingRequests),
    ])

    const relevantBookings = bookings
      .flatMap(array => array)
      .filter(booking => this.filterByCourt(courtFilter, courts, booking))

    const toAppointment = await this.toAppointment(context, prisons, locations, relevantBookings)

    const appointments = relevantBookings
      .flatMap(booking => [
        ...(booking.pre ? [toAppointment(booking, booking.pre, 'PRE')] : []),
        toAppointment(booking, booking.main, 'MAIN'),
        ...(booking.post ? [toAppointment(booking, booking.post, 'POST')] : []),
      ])
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return { courts, appointments }
  }
}
