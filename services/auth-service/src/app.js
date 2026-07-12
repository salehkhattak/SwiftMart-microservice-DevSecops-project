const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const {
  metricsMiddleware,
  metricsHandler
} = require("./middleware/metricsMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use("/api/v1/auth", authRoutes);

app.get("/metrics", metricsHandler);


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "auth-service"
  });
});


const PORT = process.env.PORT || 5001;

app.listen(PORT,"0.0.0.0", () => {
    console.log(`Auth Service running pn port ${PORT}`);

});
