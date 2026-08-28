const mockValue = import.meta.env.VITE_USE_MOCKS ?? 'true'
if (!['true', 'false'].includes(mockValue)) {
  throw new Error('VITE_USE_MOCKS deve ser true ou false.')
}
export const env = {
  apiUrl: (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  useMocks: mockValue === 'true',
}
