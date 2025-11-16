// API Configuration
// This project now uses .NET backend exclusively

const DOTNET_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_BASE_URL = `${DOTNET_API_URL}/api`;

export const isUsingDotNetBackend = true;

