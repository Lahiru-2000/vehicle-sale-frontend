// API Client Utility
// This project now uses .NET backend exclusively

// .NET Backend Configuration
const DOTNET_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getApiUrl(path: string): string {
  // Remove leading slash if present and remove /api prefix if it exists
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.slice(4);
  }
  
  // Always use .NET backend
  return `${DOTNET_API_URL}/api/${cleanPath}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  
  // Create headers object
  const headers = new Headers();
  
  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options?.body instanceof FormData;
  
  // Copy existing headers (but skip Content-Type for FormData)
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        // Don't set Content-Type for FormData - browser needs to set it with boundary
        if (!(isFormData && key.toLowerCase() === 'content-type')) {
          headers.set(key, value);
        }
      });
    } else if (typeof options.headers === 'object') {
      Object.entries(options.headers).forEach(([key, value]) => {
        // Don't set Content-Type for FormData - browser needs to set it with boundary
        if (typeof value === 'string' && !(isFormData && key.toLowerCase() === 'content-type')) {
          headers.set(key, value);
        }
      });
    }
  }
  
  // Add Content-Type for non-FormData requests if not already set
  if (!isFormData && !headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add token if available and not already set
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  return fetch(url, {
    ...options,
    headers: headers,
  });
}

