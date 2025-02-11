'use client'
import { useAuth } from "../authcontext"

interface FetchOptions extends RequestInit {
    body?: BodyInit | FormData | undefined
}

export function useApi() {
    const { auth } = useAuth()
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

    const fetchWithAuth = async(endpoint: string, options: FetchOptions = {}) => {
        if (!auth) {
            throw new Error('Not authenticated')
        }

        const headers = new Headers(options.headers || {})
        headers.set('Authorization', 'Basic ' + btoa(`${auth.username}:${auth.password}`))
        if (options.body && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json')
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
                body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
            })

            if (!response.ok) {
                throw new Error('Failed to fetch')
            }

            return response.json()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    return {
        fetchWithAuth
    }
}