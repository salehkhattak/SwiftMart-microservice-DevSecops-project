const express = require("express");
const cors = require("cors");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");
const {
  metricsMiddleware,
  metricsHandler
} = require("./middleware/metricsMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use("/api/v1/orders", orderRoutes);

app.get("/metrics", metricsHandler);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "order-service"
  });
});

const PORT = process.env.PORT || 5003;


app.listen(PORT, "0.0.0.0",() => {
  console.log(`Order Service running on port ${PORT}`);
});
