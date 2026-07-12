const express = require("express");
const cors = require("cors");
require("dotenv").config();

const cartRoutes = require("./routes/cartRoutes");
const {
  metricsMiddleware,
  metricsHandler
} = require("./middleware/metricsMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use("/api/v1/cart", cartRoutes);

app.get("/metrics", metricsHandler);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "cart-service"
  });
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, "0.0.0.0",() => {
  console.log(`Product Service running on port ${PORT}`);
});
