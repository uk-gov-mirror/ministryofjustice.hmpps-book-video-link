import { Appointment, Interval } from 'whereaboutsApi'
import { Moment } from 'moment'

export type Context = unknown

export type Prison = {
  agencyId: string
  description: string
}

export type Room = {
  value: number
  text: string
}

export type Court = {
  value: string
  text: string
}

export type AvailabilityRequest = {
  agencyId: string
  videoBookingId?: number
  date: Moment
  startTime: Moment
  endTime: Moment
  preRequired: boolean
  postRequired: boolean
}

export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'NO_LONGER_AVAILABLE'

export type LegacyRoomAvailability = { mainLocations: Room[]; preLocations: Room[]; postLocations: Room[] }

export type SelectedRooms = { pre?: number; main: number; post?: number }

export type Rooms = { main: Room[]; pre: Room[]; post: Room[] }

export type RoomAvailability = {
  isAvailable: boolean
  rooms: Rooms
  totalInterval: Interval
}

export type AppointmentDetail = {
  startTime: string
  endTime: string
  prisonRoom: string
  description: string
}

export type BookingDetails = {
  videoBookingId: number
  prisonerName: string
  offenderNo: string
  prisonName: string
  prisonBookingId: number
  agencyId: string
  courtLocation: string
  date: Moment
  dateDescription: string
  comments: string
  preDetails?: AppointmentDetail
  mainDetails: AppointmentDetail
  postDetails?: AppointmentDetail
}

export type OffenderIdentifiers = {
  offenderNo: string
  offenderName: string
}

type Row = {
  videoLinkBookingId: number
  offenderName: string
  prison: string
  prisonLocation: string
  court: string
  time: string
  hearingType: HearingType
}

export type HearingType = 'PRE' | 'MAIN' | 'POST'

export type Bookings = {
  courts: string[]
  // Each booking is split into up to 3 separate appointments, this is the flattened list.
  appointments: Row[]
}

export type NewBooking = {
  offenderNo: string
  agencyId: string
  court: string
  mainStartTime: Moment
  mainEndTime: Moment
  main: number
  pre: number | undefined
  post: number | undefined
  comment: string | undefined
}

export type BookingUpdate = {
  date: Moment
  agencyId: string
  comment: string
  startTime: Moment
  endTime: Moment
  preLocation?: number
  mainLocation: number
  postLocation?: number
  preRequired: boolean
  postRequired: boolean
}

export type CreateEmail = {
  prison: string
  court: string
  agencyId: string
  prisonerName: string
  offenderNo: string
  date: Moment
  preDetails: string
  mainDetails: string
  postDetails: string
  comment: string
}

export type UpdateEmail = {
  offenderNo: string
  agencyId: string
  prisonName: string
  prisonerName: string
  dateDescription: string
  comments: string
  courtLocation: string
  preDescription?: string
  mainDescription: string
  postDescription?: string
}

export type RequestEmail = {
  firstName: string
  lastName: string
  dateOfBirth: string
  date: string
  startTime: string
  endTime: string
  agencyId: string
  prison: string
  hearingLocation: string
  comments: string
  preHearingStartAndEndTime?: string
  postHearingStartAndEndTime?: string
}

export type Recipient = 'omu' | 'vlb' | 'user'

export type EmailSpec = {
  name: string
  agencyId: string
  recipients: {
    recipient: Recipient
    template: string
    personalisation: (usersName: string) => Record<string, unknown>
  }[]
}
