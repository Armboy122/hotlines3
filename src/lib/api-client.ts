const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api'

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
        ...options?.headers as Record<string, string>,
    }

    if (!(options?.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store', // Ensure fresh data for server actions
    })

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
}
