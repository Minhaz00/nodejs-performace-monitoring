# 📊 Manual Import Setup Guide

Since you're doing manual import, here's the simplified setup without auto-provisioning.

## 📁 Simplified Directory Structure

```
monitoring/
├── docker-compose.yml           # Simple Prometheus + Grafana
├── prometheus.yml              # Prometheus scrape config
├── nodejs-monitoring.json      # Complete dashboard (for manual import)
└── README.md                   # This guide
```

**Remove these (not needed for manual import):**
- ❌ `provisioning/` directory
- ❌ `provisioning/datasources/`
- ❌ `provisioning/dashboards/`

## 🛠️ Updated Files for Manual Import

### 1. Simplified docker-compose.yml
Remove the provisioning volume mount since we're doing manual import.

### 2. Complete Dashboard JSON
The `nodejs-monitoring.json` now contains **ALL 11 REQUIRED METRICS**:

#### ✅ **Row 1: Application Health (4 Stat Panels)**
1. **Availability %** - Service uptime percentage
2. **Requests Per Second (RPS)** - Total request rate
3. **Request Latency P99** - 99th percentile response time
4. **DB Connection Count** - Active database connections

#### ✅ **Row 2: Performance & Database (2 Time Series)**
5. **Request Latency (P90/P99)** - Latency percentiles over time
6. **DB Insert Latency P90** - Database query performance

#### ✅ **Row 3: System Resources (2 Time Series)**
7. **CPU Usage** - System CPU utilization percentage
8. **Memory Usage** - System memory utilization percentage

#### ✅ **Row 4: Network & Advanced (3 Time Series)**
9. **Network RX/TX Pressure** - Network bandwidth usage
10. **CPU Throttling & Load** - CPU steal time and load averages
11. **Error Rates** - 4xx and 5xx HTTP error percentages

## 🚀 Manual Setup Steps

### Step 1: Start Containers (Simplified)
```bash
cd monitoring
docker-compose up -d
```

### Step 2: Access Grafana
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin123`

### Step 3: Add Prometheus Datasource Manually
1. Go to **Configuration** → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure:
   - **Name:** `Prometheus`
   - **URL:** `http://prometheus:9090`
   - **Access:** `Server (default)`
5. Click **Save & Test** (should show green checkmark)

### Step 4: Import Complete Dashboard
1. Go to **Dashboards** → **Import**
2. Click **Upload JSON file**
3. Select the `nodejs-monitoring.json` file
4. **OR** Copy-paste the JSON content directly
5. Click **Load** → **Import**

### Step 5: Verify Dashboard
- Dashboard should appear as "Node.js Performance Monitoring - Complete"
- All 11 panels should be visible
- Panels may show "No data" until your EC2 app is running

## 🎯 Complete Metrics Checklist

Your dashboard now includes **ALL** required metrics:

- ✅ **Request Latency (P90/P99)** - Panel 5
- ✅ **Requests Per Second (RPS)** - Panel 2  
- ✅ **CPU & Memory Usage** - Panels 7, 8
- ✅ **DB Insert Latency P90** - Panel 6
- ✅ **DB Connection Count** - Panel 4
- ✅ **Availability %** - Panel 1
- ✅ **CPU Throttling** - Panel 10 (CPU steal time)
- ✅ **Network RX/TX Pressure** - Panel 9
- ✅ **Error Rates** - Panel 11

## 🔧 Testing Your Setup

### 1. Check Prometheus Targets
- Go to http://localhost:9090/targets
- Verify your EC2 targets are UP:
  - `nodejs-app` (EC2:3000)
  - `node-exporter` (EC2:9100)

### 2. Test Queries in Prometheus
Try these queries in Prometheus to verify metrics:
```promql
# App metrics
up{job="nodejs-app"}
rate(http_requests_total[1m])

# System metrics  
up{job="node-exporter"}
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### 3. Load Test and Monitor
```bash
# From your main project directory
k6 run --env TARGET_URL=http://YOUR_EC2_IP:3000 k6/loadtest.js
```

Watch all metrics populate in real-time!

## 💡 Benefits of Manual Import

✅ **Simpler setup** - No provisioning complexity  
✅ **Full control** - You can modify dashboard easily  
✅ **Troubleshooting** - Easier to debug issues  
✅ **Complete metrics** - All 11 required metrics included  
✅ **Production ready** - Professional dashboard layout  

## 🛠️ Useful Commands

```bash
# Start monitoring
docker-compose up -d

# Check logs
docker-compose logs grafana
docker-compose logs prometheus

# Restart services
docker-compose restart

# Clean slate (removes all data)
docker-compose down -v
```

---

**You now have a complete monitoring dashboard with all required metrics that you can import manually in under 5 minutes!** 🎉