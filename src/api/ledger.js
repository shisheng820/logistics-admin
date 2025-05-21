import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/ledger/list',
    method: 'get',
    params: query
  })
}

// Add fetchLedger, createLedger, updateLedger, deleteLedger similar to customer.js
export function createLedger(data) {
  return request({
    url: '/api/ledger/create',
    method: 'post',
    data
  })
}

export function updateLedger(data) {
  return request({
    url: '/api/ledger/update',
    method: 'post',
    data
  })
}

export function deleteLedger(id) {
  return request({
    url: '/api/ledger/delete',
    method: 'post',
    data: { id }
  })
}
