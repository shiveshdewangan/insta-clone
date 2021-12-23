const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const app = express();
const cors = require("cors");
dotenv.config();

// DB Connection
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(con => {
		console.log(`MongoDB Database connected with HOST: ${con.connection.host} `);
	});

// Middlewares
app.use(express.json());
app.use(cors());

// Use Routes
app.use("/api/v1", authRouter);
app.use("/api/v1", postRouter);
app.use("/api/v1", userRouter);

if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
	const path = require("path");
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
	});
}

// Run Server
app.listen(process.env.PORT || 5000, (req, res) => {
	console.log(`Server is running on ${process.env.PORT}`);
});
