const client = require("prom-client");

const serviceName = process.env.SERVICE_NAME || "notification-service";

client.collectDefaultMetrics({
  prefix: "swiftmart_",
  labels: {
    service: serviceName
  }
});

const httpRequestsTotal = new client.Counter({
  name: "swiftmart_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["service", "method", "route", "status_code"]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "swiftmart_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["service", "method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const normalizeRoute = (req) => {
  if (req.route?.path) {
    return `${req.baseUrl || ""}${req.route.path}`;
  }

  return req.path || "unknown";
};

const metricsMiddleware = (req, res, next) => {
  if (req.path === "/metrics") {
    return next();
  }

  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    const labels = {
      service: serviceName,
      method: req.method,
      route: normalizeRoute(req),
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
};

const metricsHandler = async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsHandler
};
