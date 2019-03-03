const db = require('../database/mysqlLib')
const Promise = require('bluebird');
const config = require('../config/config')
const adminAuthorization = require('../validators/adminAuthorization')

//All function exports
module.exports.closeConnection = closeConnection;
module.exports.checkDatabaseEmpty = checkDatabaseEmpty;
module.exports.insertIntoDatabase = insertIntoDatabase;
module.exports.getHashValue = getHashValue;
module.exports.fetchAdminDetails = fetchAdminDetails;
module.exports.fetchFreeDriversByRatings = fetchFreeDriversByRatings;
module.exports.fetchPendingBookings = fetchPendingBookings;
module.exports.getAvailableDriverCheck = getAvailableDriverCheck;
module.exports.assignDriver = assignDriver;
module.exports.updateDriverStatus = updateDriverStatus;
module.exports.allBookingDetail = allBookingDetail;

//All function definitions

function closeConnection() {
	return new Promise((resolve, reject) => {
		db.query("TRUNCATE TABLE admin", function (err, val) {
			if (err) {
				reject(err);
			} else {
				db.end(() => {
					resolve("DB connection ended");
				});
			}
		});
	});
}

function checkDatabaseEmpty() {
	return new Promise(function (resolve, reject) {
		db.query("SELECT admin_id FROM admin", function (err, val) {
			if (err) {
				reject(err)
			}
			else {
				resolve(val)
			}
		})
	})
}

function insertAdminFunction(adminName, adminMail, password) {
	return new Promise((resolve, reject) => {
		db.query("INSERT INTO admin(admin_name, admin_email,password_hash) VALUES (?,?,?)", [adminName, adminMail, password], (err, data) => {
			if (err) {
				reject(err)
			}
			else {
				resolve("success")
			}
		})
	})
}

function insertIntoDatabase() {
	return new Promise((resolve, reject) => {
		Promise.coroutine(function* () {
			let hashForAdmin1 = yield adminAuthorization.generateHashFunction(CONFIG.adminPassword[0])
			let hashForAdmin2 = yield adminAuthorization.generateHashFunction(CONFIG.adminPassword[1])
			let insertAdmin1 = yield insertAdminFunction("SAM JOHNSTONE", "samjohnstone@gmail.com", hashForAdmin1);
			let insertAdmin2 = yield insertAdminFunction("ALEX HUNTER", "hunteralex@gmail.com", hashForAdmin2);
			resolve('success')
		})().catch((err) => {
			reject(err)
		})
	})
}

function getHashValue(email) {
	return new Promise((resolve, reject) => {
		db.query("SELECT password_hash FROM admin WHERE admin_email =?", [email], (err, data) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(data[0])
			}
		})
	})
}

function fetchAdminDetails(email) {
	return new Promise((resolve, reject) => {
		db.query("SELECT admin_id,admin_name,created_at FROM admin WHERE admin_email=?", email, function (err, data) {
			if (err) {
				reject(err)
			}
			else {
				resolve(data[0])
			}
		})
	})
}

function fetchFreeDriversByRatings() {
	return new Promise((resolve, reject) => {
		db.query("SELECT driver_id, driver_name , driver_rating,driver_status FROM driver where driver_status=0 ORDER BY driver_rating DESC ", (err, details) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(details);
			}
		})
	})
}

function fetchPendingBookings() {
	return new Promise((resolve, reject) => {
		db.query("SELECT  booking_id,customer_id,source_address, destination_address FROM booking WHERE booking_status =? order by created_at", [0], (err, details) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(details);
			}
		})
	})
}

function getAvailableDriverCheck(driverID) {
	return new Promise((resolve, reject) => {
		db.query("SELECT driver_name,driver_phone,driver_car_number,driver_status FROM driver WHERE driver_id=?", [driverID], (err, data) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(data[0])
			}
		})
	})
}

function assignDriver(driverID, bookingID) {
	return new Promise((resolve, reject) => {
		db.query("UPDATE booking SET driver_id=?, booking_status=? WHERE booking_status=? AND booking_id= ?", [driverID, 1, 0, bookingID], function (err, result) {
			if (err) {
				reject(err)
			}
			else {
				resolve(result)
			}
		})
	})
}

function updateDriverStatus(driverID) {
	return new Promise((resolve, reject) => {
		db.query("UPDATE driver SET driver_status =? WHERE driver_id= ?", [1, driverID], (err, result) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(result)
			}
		})
	})
}

function allBookingDetail(bookingID) {
	return new Promise((resolve, reject) => {
		db.query("SELECT * FROM booking WHERE booking_id =?", bookingID, (err, data) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(data[0])
			}
		})
	})
}