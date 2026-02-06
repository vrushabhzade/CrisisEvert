// Prediction Service - ML-based Threat Evolution Forecasting
// Uses historical trend analysis and pattern recognition

class PredictionService {
    constructor() {
        this.historicalData = [];
        this.maxHistoryLength = 50; // Keep last 50 data points
    }

    // Store historical threat data
    addDataPoint(threat) {
        if (!threat) return;

        const dataPoint = {
            timestamp: Date.now(),
            type: threat.type,
            severity: threat.severity,
            location: threat.location,
            details: threat.details
        };

        this.historicalData.push(dataPoint);

        // Keep only recent history
        if (this.historicalData.length > this.maxHistoryLength) {
            this.historicalData.shift();
        }
    }

    // Calculate trend for a specific metric
    calculateTrend(values) {
        if (values.length < 2) return 0;

        // Simple linear regression
        const n = values.length;
        const indices = Array.from({ length: n }, (_, i) => i);

        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
        const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    // Forecast intensity for weather threats
    forecastWeatherIntensity(currentThreat, hoursAhead = [6, 12, 24]) {
        if (!currentThreat || currentThreat.type === 'EARTHQUAKE') return null;

        const recentData = this.historicalData
            .filter(d => d.type === currentThreat.type)
            .slice(-10); // Last 10 data points

        if (recentData.length < 3) {
            return {
                forecasts: hoursAhead.map(h => ({
                    hoursAhead: h,
                    intensity: 'STABLE',
                    confidence: 0.3,
                    details: 'Insufficient historical data'
                })),
                confidence: 0.3
            };
        }

        // Extract metric based on threat type
        let metricValues = [];
        let metricName = '';

        if (currentThreat.type === 'FLOOD') {
            metricValues = recentData.map(d => d.details?.rainfall || 0);
            metricName = 'rainfall';
        } else if (currentThreat.type === 'CYCLONE') {
            metricValues = recentData.map(d => d.details?.windSpeed || 0);
            metricName = 'windSpeed';
        } else if (currentThreat.type === 'HEATWAVE') {
            metricValues = recentData.map(d => d.details?.temperature || 0);
            metricName = 'temperature';
        }

        const trend = this.calculateTrend(metricValues);
        const currentValue = metricValues[metricValues.length - 1];

        // Generate forecasts
        const forecasts = hoursAhead.map(hours => {
            const predictedValue = currentValue + (trend * hours);
            const intensity = this.classifyIntensity(currentThreat.type, predictedValue);
            const confidence = this.calculateConfidence(recentData, trend);

            return {
                hoursAhead: hours,
                intensity: intensity,
                predictedValue: predictedValue,
                metricName: metricName,
                confidence: confidence,
                trend: trend > 0 ? 'INCREASING' : trend < 0 ? 'DECREASING' : 'STABLE'
            };
        });

        return {
            forecasts: forecasts,
            overallConfidence: this.calculateConfidence(recentData, trend),
            trend: trend
        };
    }

    // Classify intensity based on predicted value
    classifyIntensity(threatType, value) {
        if (threatType === 'FLOOD') {
            if (value >= 100) return 'EXTREME';
            if (value >= 50) return 'HIGH';
            if (value >= 20) return 'MODERATE';
            return 'LOW';
        } else if (threatType === 'CYCLONE') {
            if (value >= 25) return 'EXTREME';
            if (value >= 15) return 'HIGH';
            if (value >= 10) return 'MODERATE';
            return 'LOW';
        } else if (threatType === 'HEATWAVE') {
            if (value >= 45) return 'EXTREME';
            if (value >= 40) return 'HIGH';
            if (value >= 35) return 'MODERATE';
            return 'LOW';
        }
        return 'UNKNOWN';
    }

    // Calculate confidence score (0-1)
    calculateConfidence(data, trend) {
        if (data.length < 3) return 0.3;
        if (data.length < 5) return 0.5;

        // More data points = higher confidence
        const dataConfidence = Math.min(data.length / 20, 0.7);

        // Stable trend = higher confidence
        const trendStability = Math.abs(trend) < 0.5 ? 0.3 : 0.1;

        return Math.min(dataConfidence + trendStability, 0.95);
    }

    // Detect escalation patterns
    detectEscalation(currentThreat) {
        if (!currentThreat) return null;

        const recentData = this.historicalData
            .filter(d => d.type === currentThreat.type)
            .slice(-5);

        if (recentData.length < 3) return null;

        // Check if severity is increasing
        const severityLevels = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'CRITICAL': 4, 'EXTREME': 5 };
        const severities = recentData.map(d => severityLevels[d.severity] || 0);

        const isEscalating = severities.every((val, i, arr) =>
            i === 0 || val >= arr[i - 1]
        );

        if (isEscalating && severities[severities.length - 1] > severities[0]) {
            return {
                isEscalating: true,
                rateOfChange: (severities[severities.length - 1] - severities[0]) / severities.length,
                warning: 'Threat intensity is escalating',
                recommendedAction: 'Increase alert level and prepare evacuation'
            };
        }

        return { isEscalating: false };
    }

    // Get prediction summary
    getPredictionSummary(currentThreat) {
        if (!currentThreat) return null;

        const forecast = this.forecastWeatherIntensity(currentThreat);
        const escalation = this.detectEscalation(currentThreat);

        return {
            currentSeverity: currentThreat.severity,
            forecast: forecast,
            escalation: escalation,
            dataPoints: this.historicalData.filter(d => d.type === currentThreat.type).length
        };
    }

    // Clear old data
    clearHistory() {
        this.historicalData = [];
    }
}

// Singleton instance
const predictionService = new PredictionService();

module.exports = predictionService;
