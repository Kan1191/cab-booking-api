const bcrypt = require('bcrypt')
const saltRounds = 10;
const customerService = require('../services/customerService')
const jwt = require('jsonwebtoken');

//All function exports
module.exports.checkCredentials = checkCredentials;
module.exports.passwordToHash = passwordToHash;
module.exports.generateToken = generateToken;
module.exports.validateToken = validateToken;

//All function definitions

async function checkCredentials(req, res, next) {
	try {
		const password = req.body.password;
		let passwordHash = await customerService.checkEmailExistance(req, res)
		if (passwordHash[0] == undefined) {
			res.send({
				statusCode: CONSTANTS.responseStatusCode.INVALID_EMAIL_ID,
				error: "customer email id not found",
				message: "Email id not registered"
			})
		}
		else {
			bcrypt.compare(password, passwordHash[0].password_hash, function (err, check) {
				if (check) {
					next();
				}
				else {
					res.send({
						statusCode: CONSTANTS.responseStatusCode.WRONG_PASSWORD,
						error: "pasword did not match",
						message: "Wrong password"
					})
				}
			})
		}
	} catch (err) {
		res.send({
			statusCode: CONSTANTS.responseStatusCode.SERVER_ERROR,
			error: err.message,
			message: "Some error occurred"
		});
	}
}

function passwordToHash(req, res, next) {
	bcrypt.genSalt(saltRounds, (err, salt) => {
		bcrypt.hash(req.body.confirmPassword, salt, (err, hash) => {
			if (err) {
				res.send({
					statusCode: CONSTANTS.responseStatusCode.SERVER_ERROR,
					error: err.message,
					message: "Some error occurred"
				});
			}
			else {
				req.hash = hash;
				next();
			}
		});
	});
}

function generateToken(req, res, next) {
	const payLoad = {
		email: req.body.email
	}
	jwt.sign(payLoad, CONFIG.privateKey, (err, token) => {
		if (err) {
			res.send({
				statusCode: CONSTANTS.responseStatusCode.SERVER_ERROR,
				error: err.message,
				message: "Some error occurred"
			});
		}
		else {
			req.token = token;
			next();
		}
	});
}

async function validateToken(req, res, next) {
	let email = await customerService.getEmailByToken(req, res);
	if (email == undefined) {
		res.send({
			statusCode: CONSTANTS.responseStatusCode.SERVER_ERROR,
			error: "email not found in token",
			message: "Some error occurred"
		});
	}
	else {
		req.tokenEmail = email;
		next();
	}
}