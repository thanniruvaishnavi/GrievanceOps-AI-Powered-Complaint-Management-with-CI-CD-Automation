import apiClient from './apiClient'

export const createTicket = (payload) => apiClient.post('/tickets', payload)

export const getTicket = (id) => apiClient.get(`/tickets/${id}`)

export const getMyTickets = (page = 0, size = 10) =>
  apiClient.get(`/tickets/mine?page=${page}&size=${size}&sort=createdAt,desc`)

export const getResolverQueue = (page = 0, size = 10) =>
  apiClient.get(`/resolver/queue?page=${page}&size=${size}&sort=createdAt,desc`)

export const getAllTickets = (page = 0, size = 10) =>
  apiClient.get(`/admin/tickets?page=${page}&size=${size}&sort=createdAt,desc`)

export const updateTicketStatus = (id, status) =>
  apiClient.patch(`/tickets/${id}/status?status=${status}`)

export const getAnalyticsSummary = () => apiClient.get('/admin/analytics/summary')
