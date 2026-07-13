const express = require("express");
const authRouter = require("./routes/auth.routes");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const interViewRouter = require("./routes/interview.routes");

const app = express();

app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));


/* Root health check endpoint */
app.get("/", (req, res) => {
    res.json({ message: "Interview AI Backend is running successfully!" });
});

/* authRouter for all authentication related routes */
app.use("/api/auth",authRouter);

/* interViewRouter for all interview related routes */
app.use("/api/interview",interViewRouter);


module.exports = app;