import moment from 'moment'
import {
  createTimeLine,
  populateTimeLine,
  Options,
  TimeLine,
  TimeLineEvent,
  TimeLineEventType,
} from './availabilityService'
import { Appointment } from './existingEventsService'

describe('check availability', () => {
  const options: Options = { startOfDay: { hour: 9, minute: 0 }, endOfDay: { hour: 9, minute: 10 } }

  const timeLine = (): TimeLine =>
    new Map([
      [540, []],
      [541, []],
      [542, []],
      [543, []],
      [544, []],
      [545, []],
      [546, []],
      [547, []],
      [548, []],
      [549, []],
    ])

  describe('create timeline', () => {
    test('create a simple empty timeline', () => {
      expect(createTimeLine(moment('2021-01-03T09:00:00.000'), options)).toEqual(timeLine())
    })
  })

  describe('populate timeline', () => {
    const event = (locationId: number, type: TimeLineEventType): TimeLineEvent => ({ locationId, type })
    const appointment = (locationId: number, start: string, end: string): Appointment => ({ locationId, start, end })
    test('populate single appointment', () => {
      const appointments = [appointment(1, '2021-01-03T09:03:00.000', '2021-01-03T09:07:00.000')]

      expect(populateTimeLine(timeLine(), appointments)).toEqual(
        new Map([
          [540, []],
          [541, []],
          [542, []],
          [543, [event(1, 'START')]],
          [544, [event(1, 'CONTINUING')]],
          [545, [event(1, 'CONTINUING')]],
          [546, [event(1, 'CONTINUING')]],
          [547, [event(1, 'END')]],
          [548, []],
          [549, []],
        ])
      )
    })

    test('populate with over lapping appointment', () => {
      const appointments = [
        appointment(1, '2021-01-03T09:03:00.000', '2021-01-03T09:07:00.000'),
        appointment(2, '2021-01-03T09:02:00.000', '2021-01-03T09:05:00.000'),
      ]

      expect(populateTimeLine(timeLine(), appointments)).toEqual(
        new Map([
          [540, []],
          [541, []],
          [542, [event(2, 'START')]],
          [543, [event(1, 'START'), event(2, 'CONTINUING')]],
          [544, [event(1, 'CONTINUING'), event(2, 'CONTINUING')]],
          [545, [event(1, 'CONTINUING'), event(2, 'END')]],
          [546, [event(1, 'CONTINUING')]],
          [547, [event(1, 'END'), event(1, 'START')]],
          [548, []],
          [549, []],
        ])
      )
    })
  })
})
