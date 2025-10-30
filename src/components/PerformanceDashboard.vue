<template>
  <v-card class="performance-dashboard">
    <v-card-title class="d-flex align-center">
      <v-icon start color="primary">mdi-speedometer</v-icon>
      Performance Metrics
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="refreshMetrics"
        title="Refresh Metrics"
      ></v-btn>
      <v-btn
        icon="mdi-download"
        size="small"
        variant="text"
        @click="exportMetrics"
        title="Export Metrics"
      ></v-btn>
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        @click="clearMetrics"
        title="Clear Metrics"
      ></v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Web Vitals -->
      <div class="metrics-section">
        <h3 class="section-title">
          <v-icon size="small" class="mr-1">mdi-web</v-icon>
          Web Vitals
        </h3>
        <v-row dense>
          <v-col cols="12" sm="6" md="2" v-for="(value, key) in webVitals" :key="key">
            <v-card variant="tonal" :color="getVitalColor(key, value)">
              <v-card-text class="text-center">
                <div class="metric-label">{{ getVitalLabel(key) }}</div>
                <div class="metric-value">{{ formatVitalValue(key, value) }}</div>
                <div class="metric-unit">{{ getVitalUnit(key) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Connection Info -->
      <div class="metrics-section mt-4">
        <h3 class="section-title">
          <v-icon size="small" class="mr-1">mdi-network</v-icon>
          Connection
        </h3>
        <v-chip-group>
          <v-chip :color="connection.isOnline ? 'success' : 'error'" variant="flat">
            <v-icon start>{{ connection.isOnline ? 'mdi-wifi' : 'mdi-wifi-off' }}</v-icon>
            {{ connection.isOnline ? 'Online' : 'Offline' }}
          </v-chip>
          <v-chip :color="getConnectionQualityColor(connection.connectionQuality)">
            {{ connection.effectiveType.toUpperCase() }}
          </v-chip>
          <v-chip v-if="connection.saveData" color="warning" variant="flat">
            <v-icon start>mdi-content-save</v-icon>
            Data Saver
          </v-chip>
          <v-chip>
            <v-icon start>mdi-speedometer</v-icon>
            {{ connection.downlink.toFixed(1) }} Mbps
          </v-chip>
          <v-chip>
            <v-icon start>mdi-timer</v-icon>
            {{ connection.rtt }} ms RTT
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Performance Summary -->
      <div class="metrics-section mt-4">
        <h3 class="section-title">
          <v-icon size="small" class="mr-1">mdi-chart-box</v-icon>
          Summary
        </h3>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="summary-label">API Calls</div>
                <div class="summary-value">{{ summary.apiCalls.count }}</div>
                <div class="summary-detail">
                  Avg: {{ summary.apiCalls.avgDuration.toFixed(0) }}ms
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="summary-label">Route Changes</div>
                <div class="summary-value">{{ summary.routeChanges.count }}</div>
                <div class="summary-detail">
                  Avg: {{ summary.routeChanges.avgDuration.toFixed(0) }}ms
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="summary-label">Component Renders</div>
                <div class="summary-value">{{ summary.componentRenders.count }}</div>
                <div class="summary-detail">
                  Avg: {{ summary.componentRenders.avgDuration.toFixed(0) }}ms
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="summary-label">Total Metrics</div>
                <div class="summary-value">{{ summary.totalMetrics }}</div>
                <div class="summary-detail">
                  Tracked events
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Recent Metrics -->
      <div class="metrics-section mt-4">
        <h3 class="section-title">
          <v-icon size="small" class="mr-1">mdi-history</v-icon>
          Recent Activity
        </h3>
        <v-list density="compact">
          <v-list-item
            v-for="(metric, index) in recentMetrics"
            :key="index"
            :title="getMetricTitle(metric)"
            :subtitle="getMetricSubtitle(metric)"
          >
            <template v-slot:prepend>
              <v-icon :color="getMetricColor(metric)">{{ getMetricIcon(metric) }}</v-icon>
            </template>
            <template v-slot:append>
              <v-chip size="small">{{ metric.duration?.toFixed(0) || 0 }}ms</v-chip>
            </template>
          </v-list-item>
          <v-list-item v-if="recentMetrics.length === 0">
            <v-list-item-title class="text-center text-grey">
              No metrics recorded yet
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { performanceMonitor } from '../utils/performanceMonitor'
import { useConnection } from '../composables/useConnection'

export default {
  name: 'PerformanceDashboard',
  setup() {
    const connection = useConnection()
    const summary = ref({})
    const webVitals = ref({})
    const metrics = ref([])

    const refreshMetrics = () => {
      summary.value = performanceMonitor.getSummary()
      webVitals.value = performanceMonitor.getWebVitals()
      metrics.value = performanceMonitor.getMetrics()
    }

    const recentMetrics = computed(() => {
      return metrics.value.slice(-10).reverse()
    })

    const clearMetrics = () => {
      if (confirm('Are you sure you want to clear all performance metrics?')) {
        performanceMonitor.clear()
        refreshMetrics()
      }
    }

    const exportMetrics = () => {
      const data = performanceMonitor.export()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `performance-metrics-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    // Web Vitals helpers
    const getVitalLabel = (key) => {
      const labels = {
        fcp: 'FCP',
        lcp: 'LCP',
        fid: 'FID',
        cls: 'CLS',
        ttfb: 'TTFB'
      }
      return labels[key] || key.toUpperCase()
    }

    const getVitalUnit = (key) => {
      if (key === 'cls') return 'score'
      return 'ms'
    }

    const formatVitalValue = (key, value) => {
      if (value === null || value === undefined) return 'N/A'
      if (key === 'cls') return value.toFixed(3)
      return Math.round(value)
    }

    const getVitalColor = (key, value) => {
      if (!value) return 'grey'

      const thresholds = {
        fcp: { good: 1800, poor: 3000 },
        lcp: { good: 2500, poor: 4000 },
        fid: { good: 100, poor: 300 },
        cls: { good: 0.1, poor: 0.25 },
        ttfb: { good: 800, poor: 1800 }
      }

      const threshold = thresholds[key]
      if (!threshold) return 'grey'

      if (value <= threshold.good) return 'success'
      if (value <= threshold.poor) return 'warning'
      return 'error'
    }

    const getConnectionQualityColor = (quality) => {
      const colors = {
        fast: 'success',
        medium: 'warning',
        slow: 'error',
        offline: 'grey'
      }
      return colors[quality] || 'grey'
    }

    // Metrics helpers
    const getMetricTitle = (metric) => {
      if (metric.type === 'api_call') return `API: ${metric.method} ${metric.endpoint}`
      if (metric.type === 'route_change') return `Route: ${metric.to}`
      if (metric.type === 'component_render') return `Render: ${metric.component}`
      return metric.name || 'Unknown'
    }

    const getMetricSubtitle = (metric) => {
      const time = new Date(metric.timestamp).toLocaleTimeString()
      if (metric.type === 'api_call') return `${time} • Status: ${metric.status}`
      return time
    }

    const getMetricIcon = (metric) => {
      const icons = {
        api_call: 'mdi-api',
        route_change: 'mdi-routes',
        component_render: 'mdi-view-dashboard'
      }
      return icons[metric.type] || 'mdi-chart-line'
    }

    const getMetricColor = (metric) => {
      if (!metric.duration) return 'grey'
      if (metric.duration < 100) return 'success'
      if (metric.duration < 500) return 'warning'
      return 'error'
    }

    onMounted(() => {
      refreshMetrics()
    })

    return {
      connection,
      summary,
      webVitals,
      metrics,
      recentMetrics,
      refreshMetrics,
      clearMetrics,
      exportMetrics,
      getVitalLabel,
      getVitalUnit,
      formatVitalValue,
      getVitalColor,
      getConnectionQualityColor,
      getMetricTitle,
      getMetricSubtitle,
      getMetricIcon,
      getMetricColor
    }
  }
}
</script>

<style scoped>
.performance-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.metrics-section {
  padding: 12px 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #424242;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.metric-unit {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 2px;
}

.summary-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  line-height: 1;
  margin-bottom: 4px;
}

.summary-detail {
  font-size: 0.75rem;
  color: #9e9e9e;
}
</style>
