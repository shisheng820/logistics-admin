import request from '@/utils/request'

// Fetch the list of customers with query parameters
export function fetchList(params) { // Renamed from getDomesticCustomers
  return request({
    url: '/api/customer/list', // Unified URL
    method: 'get',
    params // Pass query parameters like page, limit, sort, searchKey, searchValue, province, city
  })
}

// Add a new customer
export function createCustomer(data) { // Renamed from addDomesticCustomer
  return request({
    url: '/api/customer/create', // Unified URL
    method: 'post',
    data // Customer data in the request body
  })
}

// Update an existing customer
export function updateCustomer(data) { // Renamed from updateDomesticCustomer
  return request({
    url: '/api/customer/update', // Unified URL
    method: 'post', // Or 'put' depending on backend convention
    data // Updated customer data in the request body
  })
}

// Delete a customer by ID
export function deleteCustomer(id) { // Renamed from deleteDomesticCustomer
  return request({
    url: `/api/customer/delete`, // Unified URL, send ID in body or as param based on backend
    method: 'post', // Or 'delete'
    data: { id } // Assuming ID is sent in the body for POST
  })
}

// Optional: Function to fetch details for a single customer
export function fetchCustomerDetail(id) {
  return request({
    url: '/api/customer/detail', // Unified URL
    method: 'get',
    params: { id }
  })
}
