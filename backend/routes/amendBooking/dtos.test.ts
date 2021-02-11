import moment from 'moment'
import { buildDate, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import { ChangeDateAndTime, ChangeDateAndTimeCodec, RoomAndComment } from './dtos'

describe('ChangeDateAndTime', () => {
  test('check parse', () => {
    const result = ChangeDateAndTime({
      agencyId: 'WWI',
      date: '22/01/2020',
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '00',
      preAppointmentRequired: 'yes',
      postAppointmentRequired: 'no',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      date: moment('22/01/2020', DAY_MONTH_YEAR),
      startTime: buildDate('22/01/2020', '10', '30'),
      endTime: buildDate('22/01/2020', '11', '00'),
      preRequired: true,
      postRequired: false,
    })
  })

  test('fails on missing field', () => {
    expect(() =>
      ChangeDateAndTime({
        agencyId: 'WWI',
        date: '22/01/2020',
        startTimeHours: '10',
        startTimeMinutes: '30',
        endTimeHours: '11',
        endTimeMinutes: '00',
        postAppointmentRequired: 'no',
      })
    ).toThrowError('Missing or invalid keys: preAppointmentRequired')
  })

  test('fails on incorrect data type', () => {
    expect(() =>
      ChangeDateAndTime({
        agencyId: 'WWI',
        date: '22/01/2020',
        startTimeHours: ['10'],
        startTimeMinutes: '30',
        endTimeHours: 11,
        endTimeMinutes: '00',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      })
    ).toThrowError('Missing or invalid keys: startTimeHours,endTimeHours')
  })
})

describe('ChangeDateAndTimeCodec', () => {
  test('read', () => {
    const result = ChangeDateAndTimeCodec.read({
      agencyId: 'WWI',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })
  })

  test('write', () => {
    const result = ChangeDateAndTimeCodec.write({
      agencyId: 'WWI',
      date: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
      endTime: moment('2020-11-20T19:00:00', DATE_TIME_FORMAT_SPEC, true),
      postRequired: true,
      preRequired: true,
      startTime: moment('2020-11-20T18:00:00', DATE_TIME_FORMAT_SPEC, true),
    })

    expect(result).toStrictEqual({
      agencyId: 'WWI',
      date: '2020-11-20T18:00:00',
      startTime: '2020-11-20T18:00:00',
      endTime: '2020-11-20T19:00:00',
      preRequired: 'true',
      postRequired: 'true',
    })
  })
})

describe('RoomAndComment', () => {
  test('check parse', () => {
    const result = RoomAndComment({
      preLocation: '20',
      mainLocation: '10',
      postLocation: '30',
      comment: 'A comment',
    })

    expect(result).toStrictEqual({
      preLocation: 20,
      mainLocation: 10,
      postLocation: 30,
      comment: 'A comment',
    })
  })

  test('check optional fields', () => {
    const result = RoomAndComment({
      mainLocation: '10',
      postLocation: '30',
    })

    expect(result).toStrictEqual({
      preLocation: null,
      mainLocation: 10,
      postLocation: 30,
      comment: undefined,
    })
  })

  test('check valid types', () => {
    expect(() =>
      RoomAndComment({
        mainLocation: ['10'],
        postLocation: '30',
        comment: [],
      })
    ).toThrowError('Non string keys: mainLocation,comment')
  })
})