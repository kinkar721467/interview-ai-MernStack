const express = require("express");
const authRouter = require("./routes/auth.routes");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const interViewRouter = require("./routes/interview.routes");

const app = express();

app.use(express.json());
app.use(cookieparser());
const allowedOrigins = [
    "http://localhost:5173",
    "https://interview-ai-mern-stack.vercel.app"
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
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