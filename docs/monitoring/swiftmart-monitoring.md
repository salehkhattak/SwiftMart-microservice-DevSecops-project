# SwiftMart Monitoring and Observability

This phase moves SwiftMart from Kubernetes-only monitoring to application-aware monitoring.

## What Was Added

SwiftMart services now expose Prometheus metrics at:

```text
/metrics
```

Instrumented services:

```text
auth-service
product-service
cart-service
order-service
notification-service
```

Prometheus discovers them using Helm-managed `ServiceMonitor` resources.

## Metrics Added

Each Node.js service now exports:

```text
swiftmart_http_requests_total
swiftmart_http_request_duration_seconds
swiftmart_nodejs_heap_size_used_bytes
swiftmart_nodejs_eventloop_lag_seconds
swiftmart_process_cpu_user_seconds_total
```

What they mean:

```text
swiftmart_http_requests_total
  Counts HTTP requests by service, method, route, and status code.

swiftmart_http_request_duration_seconds
  Measures request latency. Use histogram_quantile for p95/p99 latency.

swiftmart_nodejs_heap_size_used_bytes
  Shows how much memory Node.js is using inside the app process.

swiftmart_nodejs_eventloop_lag_seconds
  Shows if the Node.js event loop is getting slow or blocked.
```

## ServiceMonitor

ServiceMonitors tell Prometheus:

```text
Scrape /metrics from these Kubernetes Services every 30 seconds.
```

The SwiftMart ServiceMonitors are created by:

```text
infra/helm/swiftmart/templates/monitoring/swiftmart-servicemonitors.yaml
```

Your kube-prometheus-stack release is named:

```text
monitoring
```

So the ServiceMonitor label must be:

```yaml
release: monitoring
```

Without that label, Prometheus will ignore the ServiceMonitor.

## Verify From Kubernetes

Check ServiceMonitors:

```bash
kubectl get servicemonitor -n swiftmart
```

Check Prometheus is selecting ServiceMonitors:

```bash
kubectl get prometheus -n monitoring -o yaml | grep -A4 serviceMonitorSelector
```

Check app metrics manually:

```bash
kubectl port-forward -n swiftmart svc/auth-service 15001:5001
curl http://localhost:15001/metrics
```

You should see metrics such as:

```text
swiftmart_http_requests_total
swiftmart_http_request_duration_seconds_bucket
swiftmart_nodejs_heap_size_used_bytes
```

## PromQL Queries

Service availability:

```promql
up{namespace="swiftmart"}
```

Request rate:

```promql
sum by (service) (
  rate(swiftmart_http_requests_total{namespace="swiftmart"}[5m])
)
```

Error rate:

```promql
sum by (service) (
  rate(swiftmart_http_requests_total{namespace="swiftmart", status_code=~"5.."}[5m])
)
```

p95 latency:

```promql
histogram_quantile(
  0.95,
  sum by (le, service) (
    rate(swiftmart_http_request_duration_seconds_bucket{namespace="swiftmart"}[5m])
  )
)
```

Pod memory:

```promql
sum by (pod) (
  container_memory_working_set_bytes{namespace="swiftmart", container!="", image!=""}
)
```

Pod CPU:

```promql
sum by (pod) (
  rate(container_cpu_usage_seconds_total{namespace="swiftmart", container!="", image!=""}[5m])
)
```

Pod restarts:

```promql
sum by (pod) (
  increase(kube_pod_container_status_restarts_total{namespace="swiftmart"}[30m])
)
```

## Grafana Dashboard

A project-specific dashboard is included here:

```text
docs/monitoring/grafana-dashboards/swiftmart-observability-dashboard.json
```

Import it in Grafana:

```text
Grafana UI
  -> Dashboards
  -> New
  -> Import
  -> Upload JSON file
```

Use your Prometheus datasource when prompted.

## Why Dashboard IDs 315 or 1860 May Not Load

Grafana dashboard imports by ID require Grafana to reach Grafana.com from the browser/server. They can fail because:

```text
internet access is blocked
Grafana cannot reach grafana.com
the dashboard ID changed or is outdated
the dashboard expects a different datasource name
the dashboard expects metrics that your cluster does not expose
```

For SwiftMart, a custom dashboard is better than generic imported dashboards because it uses your own namespace and application metrics.

## Screenshots To Capture

#### Prometheus targets showing SwiftMart services UP
![alt text](<../aws/screenshots/Prometheus targets showing SwiftMart services UP.png>)

#### ServiceMonitor list in swiftmart namespace
![alt text](<../aws/screenshots/ServiceMonitor list in swiftmart .png>)

#### Grafana SwiftMart Observability dashboard
![alt text](<../aws/screenshots/Grafana SwiftMart Observability dashboard.png>)

#### Request rate panel
![alt text](<../aws/screenshots/Request rate panel.png>)

#### Latency panel
![alt text](<../aws/screenshots/Latency panel.png>)

#### Pod CPU and memory panels
![alt text](<../aws/screenshots/Pod CPU Usage.png>)

![alt text](<../aws/screenshots/Pod memory Usage.png>)

#### Node.js heap/event loop panels
![alt text](<../aws/screenshots/Node.js heap used panel.png>)

![alt text](<../aws/screenshots/Node.js-event loop panel.png>)


