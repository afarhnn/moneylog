import client from './client'

export const getAIInsight = () => client.get('/ai/insight')
