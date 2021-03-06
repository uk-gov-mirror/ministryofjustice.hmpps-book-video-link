const currentUser = require('./currentUser')

describe('Current user', () => {
  const oauthApi = {}
  let req
  let res

  beforeEach(() => {
    oauthApi.currentUser = jest.fn()
    oauthApi.userRoles = jest.fn()

    oauthApi.currentUser.mockReturnValue({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })

    oauthApi.userRoles.mockReturnValue([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])

    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get: jest.fn() }

    res = { locals: {} }
  })

  it('should request and store user details', async () => {
    const controller = currentUser({ oauthApi })

    await controller(req, res, () => {})

    expect(oauthApi.currentUser).toHaveBeenCalled()
    expect(req.session.userDetails).toEqual({
      name: 'Bob Smith',
      username: 'USER_BOB',
    })
  })

  it('should request and store user roles to session', async () => {
    const controller = currentUser({ oauthApi })

    await controller(req, res, () => {})

    expect(oauthApi.userRoles).toHaveBeenCalled()
    expect(req.session.userRoles).toEqual([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])
  })

  it('should call get', async () => {
    const controller = currentUser({ oauthApi })
    const get = jest.fn().mockReturnValue('someHost')
    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get }

    await controller(req, res, () => {})

    expect(get).toHaveBeenCalledWith('host')
  })
  it('should stash user data into res.locals', async () => {
    const controller = currentUser({ oauthApi })
    const get = jest.fn().mockReturnValue('someHost')
    req = { session: {}, protocol: 'http', originalUrl: '/somethingelse', get }

    await controller(req, res, () => {})

    expect(res.locals.user).toEqual({
      clientID: 'book-video-link-client',
      displayName: 'B. Smith',
      returnUrl: 'http://someHost/somethingelse',
      username: 'USER_BOB',
    })
  })

  it('should stash userRole data into res.locals', async () => {
    const controller = currentUser({ oauthApi })

    await controller(req, res, () => {})
    expect(res.locals.userRoles).toEqual([{ roleCode: 'ROLE_A' }, { roleCode: 'ROLE_B' }, { roleCode: 'ROLE_C' }])
  })

  it('ignore xhr requests', async () => {
    const controller = currentUser({ oauthApi })
    req.xhr = true

    const next = jest.fn()

    await controller(req, res, next)

    expect(oauthApi.currentUser.mock.calls.length).toEqual(0)
    expect(next).toHaveBeenCalled()
  })
})
