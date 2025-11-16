'use client'

import React, { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, Loader2, AlertCircle } from 'lucide-react'
import { Vehicle } from '@/types'
import { useFeatureSettings } from '@/hooks/useFeatureSettings'

interface PricePredictionModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle
}

interface PredictionData {
  currentPrice: number
  predictedPrice: number
  priceDifference: number
  priceChangePercentage: number
  confidence: number
  yearsAhead: number
  currency: string
  market: string
  priceTrend: number[]
  timestamp: string
}

export default function PricePredictionModal({ isOpen, onClose, vehicle }: PricePredictionModalProps) {
  const { features, loading: featuresLoading } = useFeatureSettings()
  const [yearsAhead, setYearsAhead] = useState(1)
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!featuresLoading && !features.pricePrediction) {
      setError('Price prediction is currently disabled')
    } else if (vehicle.type !== 'car') {
      setError('Price prediction is only available for cars')
    }
  }, [features, featuresLoading, vehicle.type])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('LKR', 'Rs.')
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  const handlePredict = async () => {
    if (yearsAhead < 0 || yearsAhead > 5) return
    if (!features.pricePrediction) {
      setError('Price prediction is currently disabled')
      return
    }
    if (vehicle.type !== 'car') {
      setError('Price prediction is only available for cars')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { apiFetch } = await import('@/lib/api-client')
      const response = await apiFetch('vehicles/predict-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicle.id.toString(),
          yearsAhead: yearsAhead
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction')
      }

      setPrediction(data.prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPrediction(null)
    setError(null)
    setYearsAhead(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Price Prediction</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Vehicle Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{vehicle.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Brand:</span> {vehicle.brand}
              </div>
              <div>
                <span className="font-medium">Model:</span> {vehicle.model}
              </div>
              <div>
                <span className="font-medium">Year:</span> {vehicle.year}
              </div>
              <div>
                <span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()} km
              </div>
              <div>
                <span className="font-medium">Fuel Type:</span> {vehicle.fuelType}
              </div>
              <div>
                <span className="font-medium">Transmission:</span> {vehicle.transmission}
              </div>
              <div>
                <span className="font-medium">Condition:</span> {vehicle.condition}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <span className="font-medium text-lg">Current Price: </span>
              <span className="text-primary font-bold text-lg">{formatPrice(vehicle.price)}</span>
            </div>
          </div>

          {/* Prediction Controls */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Predict price for how many years ahead?
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={yearsAhead}
                onChange={(e) => setYearsAhead(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary min-w-[3rem] text-center">
                {yearsAhead} {yearsAhead === 1 ? 'year' : 'years'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 year</span>
              <span>5 years</span>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading || !features.pricePrediction || vehicle.type !== 'car'}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Predicting...</span>
              </>
            ) : !features.pricePrediction ? (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>Price Prediction Disabled</span>
              </>
            ) : vehicle.type !== 'car' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>Only Available for Cars</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                <span>Predict Future Price</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="mt-6 space-y-6">
              {/* Main Prediction */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Predicted Price in {prediction.yearsAhead} {prediction.yearsAhead === 1 ? 'Year' : 'Years'}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(prediction.predictedPrice)}
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold text-green-600">
                      {(prediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Change Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Price Change</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    prediction.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(Math.abs(prediction.priceDifference))}
                    {prediction.priceDifference >= 0 ? (
                      <TrendingUp className="h-6 w-6 inline ml-1" />
                    ) : (
                      <TrendingDown className="h-6 w-6 inline ml-1" />
                    )}
                  </div>
                  <div className={`text-sm ${
                    prediction.priceChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(prediction.priceChangePercentage)}
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Current Price</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">
                    {formatPrice(prediction.currentPrice)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Today's market value
                  </div>
                </div>
              </div>

              {/* Price Trend Chart */}
              {prediction.priceTrend && prediction.priceTrend.length > 0 && (
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="font-semibold mb-4">Price Trend Over Time</h4>
                  <div className="space-y-2">
                    {prediction.priceTrend.map((price, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Year {index + 1}
                        </span>
                        <span className="font-medium">
                          {formatPrice(price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Info */}
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p>
                  <strong>Market:</strong> {prediction.market} | 
                  <strong> Currency:</strong> {prediction.currency} | 
                  <strong> Prediction Date:</strong> {new Date(prediction.timestamp).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs">
                  * Predictions are based on historical data and market trends. Actual prices may vary.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

