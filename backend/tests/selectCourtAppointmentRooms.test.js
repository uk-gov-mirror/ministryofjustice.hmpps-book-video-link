const { selectCourtAppointmentRoomsFactory } = require('../controllers/appointments/selectCourtAppointmentRooms')
const { notifyApi } = require('../api/notifyApi')
const config = require('../config')

describe('Select court appointment rooms', () => {
  const prisonApi = {}
  const oauthApi = {}
  const appointmentService = {}
  const existingEventsService = {}
  let service

  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Court User' } },
    body: {},
  }
  const res = { locals: {}, redirect: jest.fn() }

  const bookingId = 1
  const appointmentDetails = {
    bookingId,
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    appointmentType: 'VLB',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    comment: 'Test',
    appointmentTypeDescription: 'Videolink',
    date: '10/10/2019',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
    preLocations: [{ value: 1, text: 'Room 1' }],
    postLocations: [{ value: 3, text: 'Room 3' }],
    court: 'Leeds',
  }

  const availableLocations = {
    mainLocations: [{ value: 1, text: 'Room 1' }],
    preLocations: [{ value: 2, text: 'Room 2' }],
    postLocations: [{ value: 3, text: 'Room 3' }],
  }

  beforeEach(() => {
    prisonApi.getPrisonerDetails = jest.fn()
    prisonApi.getAgencyDetails = jest.fn()
    prisonApi.addSingleAppointment = jest.fn()
    prisonApi.getLocation = jest.fn()

    oauthApi.userEmail = jest.fn()
    appointmentService.getAppointmentOptions = jest.fn()
    appointmentService.getVideoLinkLocations = jest.fn()
    appointmentService.createAppointmentRequest = jest.fn()

    existingEventsService.getAppointmentsAtLocations = jest.fn()
    existingEventsService.getAvailableLocationsForVLB = jest.fn()

    req.flash = jest.fn()
    res.render = jest.fn()

    appointmentService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [{ value: 'VLB', text: 'Videolink' }],
      locationTypes: [{ value: 1, text: 'Room 3' }],
    })

    existingEventsService.getAvailableLocationsForVLB.mockReturnValue(availableLocations)

    prisonApi.getPrisonerDetails.mockReturnValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    prisonApi.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    req.flash.mockImplementation(() => [appointmentDetails])

    notifyApi.sendEmail = jest.fn()

    service = selectCourtAppointmentRoomsFactory({
      prisonApi,
      appointmentService,
      existingEventsService,
      oauthApi,
      notifyApi,
    })
  })

  describe('index', () => {
    it('should return locations', async () => {
      const { index } = service

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining(availableLocations)
      )
    })

    it('should extract appointment details', async () => {
      const { index } = service

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          details: {
            date: '10 October 2017',
            endTime: '14:00',
            prisonerName: 'John Doe',
            startTime: '11:00',
            prison: 'Moorland',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { index } = service

      req.flash.mockImplementation(() => [])

      await expect(index(req, res)).rejects.toThrow('Appointment details are missing')
    })

    it('should call getAvailableLocationsForVLB with the correct parameters', async () => {
      const { index } = service

      await index(req, res)

      expect(existingEventsService.getAvailableLocationsForVLB).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'MDI',
          date: '10/10/2017',
          endTime: '2017-10-10T14:00',
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
          startTime: '2017-10-10T11:00',
        }
      )
    })
  })

  describe('validateInput', () => {
    it('should return a validation message if the pre or post appointment location is the same as the main appointment location', async () => {
      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '1',
        selectPostAppointmentLocation: '1',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      const { validateInput } = service
      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          errors: [
            {
              text: 'Select a different room for the post-court hearing to the room for the court hearing briefing',
              href: '#selectPostAppointmentLocation',
            },
            {
              text: 'Select a different room for the pre-court hearing to the room for the court hearing briefing',
              href: '#selectPreAppointmentLocation',
            },
          ],
        })
      )
    })

    it('should validate presence of room locations', async () => {
      const { validateInput } = service

      req.body = {
        selectPreAppointmentLocation: null,
        selectMainAppointmentLocation: null,
        selectPostAppointmentLocation: null,
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          errors: [
            { text: 'Select a prison room for the court hearing video link', href: '#selectMainAppointmentLocation' },
            { text: 'Select a prison room for the pre-court hearing briefing', href: '#selectPreAppointmentLocation' },
            {
              text: 'Select a prison room for the post-court hearing briefing',
              href: '#selectPostAppointmentLocation',
            },
          ],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { validateInput } = service
      const comment = 'Some supporting comment text'

      req.body = { comment }

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          formValues: { comment },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { validateInput } = service

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
        },
      ])

      await validateInput(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
          details: {
            date: '10 October 2017',
            startTime: '11:00',
            endTime: '14:00',
            prisonerName: 'John Doe',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { validateInput } = service

      req.flash.mockImplementation(() => [])
      expect(() => validateInput(req, res)).toThrow('Appointment details are missing')
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { validateInput } = service

      await validateInput(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
    })
  })

  describe('createAppointments', () => {
    beforeEach(() => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          startTime: '2017-10-10T11:00',
          endTime: '2017-10-10T14:00',
        },
      ])

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      res.redirect = jest.fn()
    })

    it('should redirect to confirmation page', async () => {
      const { createAppointments } = service

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
    })

    it('should redirect to confirmation page if no pre or post rooms are required', async () => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        },
      ])
      const { createAppointments } = service

      req.body = {
        selectMainAppointmentLocation: '2',
        comment: 'Test',
      }

      await createAppointments(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      expect(notifyApi.sendEmail).not.toHaveBeenCalled()
    })

    it('should call the appointment service with correct appointment details', async () => {
      const { createAppointments } = service
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

      expect(appointmentService.createAppointmentRequest).toBeCalledWith(
        {
          appointmentType: 'VLB',
          appointmentTypeDescription: 'Videolink',
          bookingId: 1,
          comment: 'Test',
          court: 'Leeds',
          date: '10/10/2019',
          endTime: '2017-10-10T14:00',
          firstName: 'john',
          lastName: 'doe',
          locationId: 1,
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          preLocations: [
            {
              text: 'Room 1',
              value: 1,
            },
          ],
          postLocations: [
            {
              text: 'Room 3',
              value: 3,
            },
          ],
          mainLocations: [
            {
              text: 'Room 2',
              value: 2,
            },
          ],
          offenderNo: 'A12345',
          startTime: '2017-10-10T11:00',
        },
        'Test',
        {
          postAppointment: { endTime: '2017-10-10T14:20:00', locationId: 3, startTime: '2017-10-10T14:00' },
          preAppointment: { endTime: '2017-10-10T11:00', locationId: 1, startTime: '2017-10-10T10:40:00' },
        },
        '2',
        {}
      )
    })
    it('should try to send email with court template when court user has email', async () => {
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      oauthApi.userEmail.mockReturnValue({
        email: 'test@example.com',
      })

      const { createAppointments } = selectCourtAppointmentRoomsFactory({
        prisonApi,
        oauthApi,
        notifyApi,
        appointmentService,
        existingEventsService,
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await createAppointments(req, res)

      const personalisation = {
        startTime: '11:00',
        endTime: '14:00',
        date: '10 October 2019',
        comments: appointmentDetails.comment,
        court: 'Leeds',
        firstName: 'John',
        lastName: 'Doe',
        offenderNo: appointmentDetails.offenderNo,
        location: 'Room 2',
        postAppointmentInfo: 'Room 3, 14:00 to 14:20',
        preAppointmentInfo: 'Room 1, 10:40 to 11:00',
        userName: 'Court User',
      }

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.confirmBookingCourtTemplateId,
        'test@example.com',
        {
          personalisation,
          reference: null,
        }
      )
    })
  })
})
