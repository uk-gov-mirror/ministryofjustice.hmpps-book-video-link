const { stubFor, verifyPosts, getMatchingRequests } = require('./wiremock')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },
  stubCourtLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/court/all-courts',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || {
          courtLocations: ['London', 'Sheffield', 'Leeds'],
        },
      },
    })
  },
  stubCreateVideoLinkBooking: (status = 200) => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/whereabouts/court/video-link-bookings',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: 123 || {},
      },
    })
  },

  getBookingRequest: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/video-link-bookings',
    }).then(data => {
      const { requests } = data.body
      return JSON.parse(requests[0].body)
    }),

  stubGetVideoLinkBookings: (agencyId, date, bookings) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/court/video-link-bookings/prison/${agencyId}/date/${date}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: bookings || [],
      },
    })
  },

  stubRoomAvailability: response => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/whereabouts/court/vlb-appointment-location-finder`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || [],
      },
    })
  },

  getFindAvailabilityRequests: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/vlb-appointment-location-finder',
    }).then(data => {
      const { requests } = data.body
      return requests.map(request => JSON.parse(request.body))
    }),

  stubGetVideoLinkBooking: booking => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/court/video-link-bookings/${booking.videoLinkBookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: booking || {},
      },
    })
  },

  stubUpdateVideoLinkBookingComment: videoLinkBookingId => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/whereabouts/court/video-link-bookings/${videoLinkBookingId}/comment`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    })
  },

  getUpdateCommentRequest: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPattern: '/whereabouts/court/video-link-bookings/.*?/comment',
    }).then(data => {
      const { requests } = data.body
      return requests[0].body
    }),

  stubUpdateVideoLinkBooking: videoLinkBookingId => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/whereabouts/court/video-link-bookings/${videoLinkBookingId}`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    })
  },

  getUpdateBookingRequest: () =>
    getMatchingRequests({
      method: 'PUT',
      urlPattern: '/whereabouts/court/video-link-bookings/.*?',
    }).then(data => {
      const { requests } = data.body
      return JSON.parse(requests[0].body)
    }),

  stubDeleteVideoLinkBooking: videoBookingId => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/whereabouts/court/video-link-bookings/${videoBookingId}`,
      },
      response: {
        status: 204,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    })
  },

  verifyPostAttendance: () => {
    return verifyPosts('/whereabouts/attendance')
  },
  stubGroups: (caseload, status = 200) => {
    const json = [
      {
        name: '1',
        key: '1',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '2',
        key: '2',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '3',
        key: '3',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
    ]

    const jsonSYI = [
      {
        name: 'block1',
        key: 'block1',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
        ],
      },
      {
        name: 'block2',
        key: 'block2',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
    ]

    return stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/agencies/${caseload.id}/locations/groups`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseload.id === 'SYI' ? jsonSYI : json,
      },
    })
  },

  stubGetLocationPrefix: ({ agencyId, groupName, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/locations/${agencyId}/${groupName}/location-prefix`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubLocationGroups: locationGroups =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/whereabouts/agencies/.+?/locations/groups',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationGroups || [],
      },
    }),

  stubGetEventsCsv: body =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/whereabouts/events/video-link-booking-events',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=UTF-8',
        },
        body,
      },
    }),
}
