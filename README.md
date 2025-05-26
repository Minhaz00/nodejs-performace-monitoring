# NodeJS Performance Monitoring Setup

This project demonstrates a complete NodeJS application performance monitoring setup using Prometheus, Grafana, and k6 for load testing. The application runs on an EC2 t3.medium instance and includes monitoring capabilities.

## Table of Contents
1. [EC2 Setup](#ec2-setup)
2. [Application Overview](#application-overview)
3. [Local Development Setup](#local-development-setup)
4. [Monitoring Setup](#monitoring-setup)
5. [Load Testing with k6](#load-testing-with-k6)

## EC2 Setup

### 1. Launch EC2 Instance
- Launch a t3.medium instance with Amazon Linux 2
- Configure security groups to allow:
  - SSH (Port 22)
  - HTTP (Port 80)
  - HTTPS (Port 443)
  - Application Port (3000)
  - Prometheus (Port 9090)
  - Grafana (Port 3000)
  - Node Exporter (Port 9100)

### 2. Install Dependencies
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git
```

### 3. Clone and Run Application
```bash
git clone <your-repository-url>
cd nodejs-performace-monitoring
docker-compose up -d
```

## Application Overview

The NodeJS application is a REST API service with the following components:

### Components
- **NodeJS Application**: Main application server
- **PostgreSQL**: Database for data persistence
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization
- **Node Exporter**: Host system metrics collection

### Architecture
- The application exposes metrics on port 9090
- Main API runs on port 3000
- PostgreSQL runs on port 5432
- Node Exporter runs on port 9100

## Local Development Setup

1. **Prerequisites**
   - Docker and Docker Compose
   - Node.js (for local development)
   - Git

2. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd nodejs-performace-monitoring
   ```

3. **Environment Setup**
   - Create `.env` file with necessary environment variables
   - Default database credentials are provided in docker-compose.yml

4. **Run Application**
   ```bash
   docker-compose up -d
   ```

## Monitoring Setup

### Prometheus Configuration
- Prometheus is configured to scrape metrics from:
  - NodeJS application (port 9090)
  - Node Exporter (port 9100)
- Configuration file: `prometheus.yml`

### Grafana Setup
1. Access Grafana at `http://localhost:3000`
2. Default credentials:
   - Username: admin
   - Password: admin
3. Add Prometheus as a data source
4. Import dashboards for:
   - NodeJS application metrics
   - System metrics
   - Database metrics

## Load Testing with k6

### k6 Setup
1. **Install k6**
   ```bash
   # Windows
   choco install k6

   # macOS
   brew install k6

   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

### Running Tests
1. **Basic Load Test**
   ```bash
   k6 run k6s/loadtest.js
   ```

2. **Test Scenarios**
   The load test includes the following stages:
   - Warm up: 0 → 5 users (30s)
   - Ramp up: 5 → 10 users (1m)
   - Steady state: 10 users (2m)
   - Peak load: 10 → 20 users (1m)
   - Sustained peak: 20 users (3m)
   - Stress test: 20 → 30 users (1m)
   - Stress sustain: 30 users (2m)
   - Ramp down: 30 → 0 users (1m)

3. **Performance Thresholds**
   - 95% of requests under 3s
   - Error rate under 10%
   - Custom error rate under 15%
   - 90% of DB inserts under 2s
   - 95% of health checks under 500ms

4. **Test Endpoints**
   - Health Check (20% of requests)
   - GET Data (30% of requests)
   - POST Data (50% of requests)

### Visualizing Results
1. **Real-time Monitoring**
   - Use Grafana dashboards to monitor:
     - Request Latency (P90/P99)
     - Requests Per Second
     - CPU & Memory Usage
     - DB Connection Count
     - Error Rates

2. **Test Reports**
   - k6 generates detailed JSON reports
   - Console output with formatted summary
   - Metrics exported to Prometheus for visualization

3. **Key Metrics Monitored**
   - HTTP Request Duration
   - Database Insert Latency
   - Health Check Latency
   - Error Rates
   - Data Transfer (sent/received)
   - Custom Business Metrics

## Additional Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [k6 Documentation](https://k6.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Grafana dashboard

![](./images/Screenshot%202025-05-26%20014552.png)

![](./images/Screenshot%202025-05-26%20014601.png)

### K6 output

![](./images/Screenshot%202025-05-26%20014727.png)