/* eslint-disable import/no-extraneous-dependencies */
global.print = jest.fn()
global.afterPrint = jest.fn()
global.open = jest.fn()

process.env.USE_OF_FORCE_URL = '//useOfForceUrl'
process.env.USE_OF_FORCE_PRISONS = 'LEI'
