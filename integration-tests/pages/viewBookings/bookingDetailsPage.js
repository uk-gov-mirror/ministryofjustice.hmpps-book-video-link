const page = require('../page')

const bookingDetailsPage = prisonerName =>
  page(`${prisonerName} video link details`, {
    changeDate: () => cy.get('[data-qa="change-date"]'),
    changeTime: () => cy.get('[data-qa="change-time"]'),
    changeComment: () => cy.get('[data-qa="change-comments"]'),
    deleteButton: () => cy.get('[data-qa="delete-button"]'),
  })

export default {
  verifyOnPage: bookingDetailsPage,
  goTo: (id, prisonerName) => {
    cy.visit(`/booking-details/${id}`)
    return bookingDetailsPage(prisonerName)
  },
}
