import moment, { duration, Moment } from 'moment'
import { Appointment } from './existingEventsService'
import { DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'

type Time = { hour: number; minute: number }
type MinuteOfDay = number
export type Options = { startOfDay: Time; endOfDay: Time }
export type TimeLineEventType = 'START' | 'CONTINUING' | 'END'
export type TimeLineEvent = { type: TimeLineEventType; locationId: number }
export type TimeLine = Map<MinuteOfDay, TimeLineEvent[]>

const minuteOfDay = (time: Moment) => time.diff(time.clone().startOf('day'), 'minutes')
const timeAt = (date: Moment, time: Time) => moment(date).hour(time.hour).minute(time.minute).seconds(0).millisecond(0)

export function createTimeLine(date: Moment, options: Options): TimeLine {
  const { startOfDay, endOfDay } = options

  const startTime = timeAt(date, startOfDay)
  const endTime = timeAt(date, endOfDay)

  const totalMinutes = duration(endTime.diff(startTime)).asMinutes()

  return new Map([...Array(totalMinutes).keys()].map(index => [minuteOfDay(startTime) + index, []]))
}

const toIndexedTimeLineEvents = (app: Appointment): [number, TimeLineEvent][] => {
  const eventType = (i, start, end): TimeLineEventType => {
    if (i === start) {
      return 'START'
    }
    return i === end ? 'END' : 'CONTINUING'
  }

  const start = minuteOfDay(moment(app.start, DATE_TIME_FORMAT_SPEC))
  const end = minuteOfDay(moment(app.end, DATE_TIME_FORMAT_SPEC))

  return Array(end - start + 1)
    .fill(null)
    .map((_, i) => start + i)
    .map(i => [i, { type: eventType(i, start, end), locationId: app.locationId }] as [number, TimeLineEvent])
}

export function populateTimeLine(timeLine: TimeLine, appointments: Appointment[]): TimeLine {
  const timeLineEvents = appointments.flatMap(app => toIndexedTimeLineEvents(app))

  return timeLineEvents.reduce((result, [time, event]) => {
    const events = result.get(time) || []
    result.set(time, [...events, event])
    return result
  }, timeLine)
}

export type Request = {
  bookingId: number
  main: { locationId: number; start: Moment; end: Moment }
  pre?: { locationId: number; start: Moment; end: Moment }
  post?: { locationId: number; start: Moment; end: Moment }
}

const isLocationAvailable = (timeLine: TimeLine, locationId: number, start, end): boolean => {
  // TODO impl
  // slice timeline using indexes
  // filter events by location
  // return false if any START or CONTINUING events
  return null
}

export function isAvailable(timeLine: TimeLine, { main, pre, post }: Request): boolean {
  const isPreRequired = Boolean(pre)
  const isPostRequired = Boolean(post)

  const isMainAvailable = isLocationAvailable(timeLine, main.locationId, minuteOfDay(main.start), minuteOfDay(main.end))
  const isPreAvailable =
    !isPreRequired || isLocationAvailable(timeLine, pre.locationId, minuteOfDay(pre.start), minuteOfDay(pre.end))
  const isPostAvailable =
    !isPostRequired || isLocationAvailable(timeLine, post.locationId, minuteOfDay(post.start), minuteOfDay(post.end))

  return isMainAvailable || isPreAvailable || isPostAvailable
}

export function isAvailableOnDay(timeLine: TimeLine, { main, pre, post }: Request): boolean {
  // iterate over timeline keeping track of availability
  // Iterate over time recording possible pre locations (if necessary)
  // then build up main locationspossible main locations // then possible post locations
  return false
}
