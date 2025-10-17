const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");

// Import Route Handlers
const userHandler = require("./routeHandler/userHandler");
const bookingHandler = require("./routeHandler/bookingHandler");
const reviewHandler = require("./routeHandler/reviewHandler");

// Import Middlewares
const applyMiddleware = require("./middlewares");

// Initialize Stripe
const stripe = require("stripe")('your_stripe_secret_key_here'); // ⚠️ Replace with your actual Stripe key or use process.env

const app = express();
const port = process.env.PORT || 5000;

// Apply middleware
applyMiddleware(app);
app.use(express.json());

// --- Database Connection ---
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6g3butq.mongodb.net/Forex_realtime_DB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connection is OK"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// --- API Routes ---
app.use('/users', userHandler);
app.use('/booking', bookingHandler);
app.use('/review', reviewHandler);

app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
});

app.post("/create-intent", async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100);

    if (isNaN(amount) || amount < 1) {
        return res.status(400).send({ error: "Invalid price amount." });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).send({ error: "Failed to create payment intent" });
    }
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

// --- HTTP Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://your-live-frontend-url.com"], // Add your frontend URLs
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // --- Mock Data Emitter ---
    // This interval will send new fake data to this specific client every 5 seconds
    const mockDataInterval = setInterval(() => {
        const mockTick = {
            symbol: 'EUR/USD',
            bid: 1.07 + (Math.random() - 0.5) * 0.01, // Generates a price around 1.07
            ask: 1.0705 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toLocaleTimeString()
        };
        console.log(`Emitting mock tick to ${socket.id}`);
        // Emit the 'newTick' event that the frontend is listening for
        socket.emit("newTick", mockTick);
    }, 5000); // Interval set to 5000 ms (5 seconds)


    // --- Other Socket Events ---
    socket.on("updateLocation", ({ userId, latitude, longitude }) => {
        console.log(`User ${userId} updated location:`, latitude, longitude);
        io.emit("locationUpdated", { userId, latitude, longitude });
    });

    socket.on("manualUpdateLocation", ({ userId, latitude, longitude }) => {
        console.log(`Manual update for user ${userId}:`, latitude, longitude);
        io.emit("locationUpdated", { userId, latitude, longitude });
    });

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
        // Important: Clear the interval when the user disconnects to prevent memory leaks
        clearInterval(mockDataInterval);
    });
});

// --- Start Server ---
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});