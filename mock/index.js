const Mock = require('mockjs')
const { param2Obj } = require('./utils')

const user = require('./user')
const role = require('./role')
const article = require('./article')
const search = require('./remote-search')
// const domestic = require('./domestic') // Assuming this is old/renamed
// const international = require('./international') // Assuming this is old/renamed
// const amendments = require('./amendments') // Assuming this is old/renamed
const userManager = require('./user-manager') // Keep if still relevant for admin users
const customerDomestic = require('./customer-domestic') // Replaced by customer.js
// const customerInternational = require('./customer-international') // Replaced by customer.js

// New Mocks
const customer = require('./customer')
const ledger = require('./ledger')
const dataAnalysis = require('./dataAnalysis')
const log = require('./log')

const mocks = [
  ...user,
  ...role,
  ...article, // Keep if example pages are desired
  ...search,  // Keep if remote search examples are desired
  ...userManager,
  // ...domestic, // Comment out or remove if replaced
  // ...international,
  // ...amendments,
  ...customerDomestic,
  // ...customerInternational,
  ...customer,     // Add new customer mock
  ...ledger,       // Add new ledger mock
  ...dataAnalysis, // Add new dataAnalysis mock
  ...log           // Add new log mock
]

// ... (rest of the file remains the same) ...

function mockXHR() {
  // mock patch
  // https://github.com/nuysoft/Mock/issues/300
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false

      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType
      }
    }
    this.proxy_send(...arguments)
  }

  function XHR2ExpressReqWrap(respond) {
    return function(options) {
      let result = null
      if (respond instanceof Function) {
        const { body, type, url } = options
        // https://expressjs.com/en/4x/api.html#req
        result = respond({
          method: type,
          body: JSON.parse(body || '{}'), // Ensure body is parsed, handle empty body
          query: param2Obj(url)
        })
      } else {
        result = respond
      }
      return Mock.mock(result)
    }
  }

  for (const i of mocks) {
    Mock.mock(new RegExp(i.url), i.type || 'get', XHR2ExpressReqWrap(i.response))
  }
}

module.exports = {
  mocks,
  mockXHR
}