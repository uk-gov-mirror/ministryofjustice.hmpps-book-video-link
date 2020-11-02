const { stubFor } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        fixedDelayMilliseconds: status === 500 ? 5000 : '',
      },
    })
  },
  stubUserMe: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/users/me',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          firstName: 'JAMES',
          lastName: 'STUART',
          activeCaseLoadId: 'MDI',
        },
      },
    })
  },
  stubUserCaseloads: caseloads => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/api/users/me/caseLoads',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseloads || [
          {
            caseLoadId: 'MDI',
            description: 'Moorland',
            currentlyActive: true,
          },
        ],
      },
    })
  },
  stubOffenderBasicDetails: offender => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/offenderNo/.+?\\?fullInfo=false`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offender || {},
      },
    })
  },
  stubAgencies: agencies => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/prison',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: agencies || [],
      },
    })
  },
  stubAppointmentsGet: (appointments, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/schedules/[A-Z].+?/appointments.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    })
  },
  stubAppointmentLocations: (agency, locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agency}/locations?eventType=APP`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [],
      },
    })
  },
  stubAppointmentTypes: (types, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/api/reference-domains/scheduleReasons?eventType=APP',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: types || [],
      },
    })
  },
  stubAgencyDetails: (agencyId, details, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agencyId}?activeOnly=false`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    })
  },
  stubPrisonApiGlobalSearch: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/prisoners',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubActivityLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/.+?/eventLocationsBooked.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [
          {
            locationId: 1,
            userDescription: 'loc1',
          },
          {
            locationId: 2,
            userDescription: 'loc2',
          },
          {
            locationId: 3,
            userDescription: 'loc3',
          },
        ],
      },
    })
  },
  stubSchedulesAtAgency: (agency, location, type, date, schedules, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/${agency}/locations/${location}/usage/${type}?date=${date}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: schedules || [],
      },
    })
  },
}
