const moment = require('moment')
const StartPage = require('../../pages/requestBooking/startPage')
const SelectCourtPage = require('../../pages/requestBooking/selectCourtPage')
const EnterOffenderDetailsPage = require('../../pages/requestBooking/enterOffenderDetailsPage')
const ConfirmationPage = require('../../pages/requestBooking/confirmationPage')

context('A user can request a booking', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLoginCourt')
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubCourts')
    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    cy.visit('/request-booking')
  })

  it('A user can request a video link booking for a prisoner who is not in prison', () => {
    const startPage = StartPage.verifyOnPage()
    const startForm = startPage.form()
    startForm.date().type(moment().add(1, 'days').format('DD/MM/YYYY'))
    startForm.prison().select('WWI')
    startForm.startTimeHours().select('10')
    startForm.startTimeMinutes().select('00')
    startForm.endTimeHours().select('11')
    startForm.endTimeMinutes().select('00')
    startForm.preAppointmentYes().click()
    startForm.postAppointmentYes().click()
    startForm.submitButton().click()

    const selectCourtPage = SelectCourtPage.verifyOnPage()
    selectCourtPage.prison().contains('HMP Wandsworth')
    selectCourtPage.date().contains(moment().add(1, 'days').format('D MMMM YYYY'))
    selectCourtPage.startTime().contains('10:00')
    selectCourtPage.endTime().contains('11:00')
    selectCourtPage.preStartEndTime().contains('09:40 to 10:00')
    selectCourtPage.postStartEndTime().contains('11:00 to 11:20')

    const selectCourtForm = selectCourtPage.form()
    selectCourtForm.hearingLocation().select('London')
    selectCourtForm.submitButton().click()

    const enterOffenderDetailsPage = EnterOffenderDetailsPage.verifyOnPage()
    const offenderForm = enterOffenderDetailsPage.form()
    offenderForm.firstName().type('John')
    offenderForm.lastName().type('Doe')
    offenderForm.dobDay().type('14')
    offenderForm.dobMonth().type('5')
    offenderForm.dobYear().type('1920')
    offenderForm.comments().type('test')
    offenderForm.submitButton().click()

    const confirmationPage = ConfirmationPage.verifyOnPage()
    confirmationPage.prison().contains('HMP Wandsworth')
    confirmationPage.date().contains(moment().add(1, 'days').format('dddd D MMMM YYYY'))
    confirmationPage.startTime().contains('10:00')
    confirmationPage.endTime().contains('11:00')
    confirmationPage.preStartEndTime().contains('09:40 to 10:00')
    confirmationPage.postStartEndTime().contains('11:00 to 11:20')
    confirmationPage.name().contains('John Doe')
    confirmationPage.dateOfBirth().contains('14 May 1920')
    confirmationPage.courtLocation().contains('London')
  })
})
