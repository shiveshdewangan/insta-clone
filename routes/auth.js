const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireSignIn = require("../middlewares/requireLogin");

router.get("/protected", requireSignIn, (req, res) => {
	return res.status(200).json({
		status: 200,
		message: "Success",
	});
});

router.post("/signup", (req, res, next) => {
	const { name, email, password, pic } = req.body;
	if (!email || !password || !name) {
		return res.status(422).json({
			error: "Name, Email or Password missing",
		});
	}
	User.findOne({ email })
		.then(savedUser => {
			if (savedUser) {
				return res.status(422).json({ error: "User already exists with that email" });
			}
			bcrypt.hash(password, 12).then(hashedPassword => {
				const user = new User({
					email,
					password: hashedPassword,
					name,
					pic,
				});
				user
					.save()
					.then(user => {
						return res.json({ message: "User saved successfully" });
					})
					.catch(err => {
						console.log("Error", err);
					});
			});
		})
		.catch(err => console.log("Error", err));
});

router.post("/signin", (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(422).json({
			error: "Please provide email or password",
		});
	}
	User.findOne({ email })
		.then(savedUser => {
			if (!savedUser) {
				return res.status(422).json({ error: "Invalid email or password" });
			}
			bcrypt
				.compare(password, savedUser.password)
				.then(doMatch => {
					if (doMatch) {
						const token = jwt.sign({ _id: savedUser._id }, process.env.SECRET_KEY);
						const { _id, name, email, followers, following, pic } = savedUser;
						return res.status(200).json({ token, user: { _id, name, email, followers, following, pic } });
					} else {
						return res.status(422).json({
							error: "Invalid Email or Password",
						});
					}
				})
				.catch(err => {
					console.log("Passwords do not match");
				});
		})
		.catch(err => {
			console.log("Error", err);
		});
});

module.exports = router;
