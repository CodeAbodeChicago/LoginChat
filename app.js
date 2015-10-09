// index.js for chat app!

// express server
var express = require("express");
var app = express();

// serve files in the public folder 
var path = require("path");
var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// start server and socket.io connection
var port = process.env.PORT || 8080; // for deploying to heroku
var server = app.listen(port);
var io = require("socket.io")(server);

var allUsers = [];
var chatHistory = [];
var serverUrl = "";
io.on("connection", function(socket) {

	// New connection setup
	var nickname = "";
	var profileUrl = "";
	console.log("New user has connected!");
	socket.emit("server chat history", chatHistory);

	socket.on("attempt username registration", function(username, callback) {
		var index = allUsers.indexOf(username);
		if (index === -1) callback(true);
		else callback(false);
	});

	socket.on("client register user", function(newUser) {
		nickname = newUser.name;
		profileUrl = newUser.profileUrl;
		// Update user list and notify clients
		allUsers.push(nickname);
		io.emit("server user list", allUsers);
		// Add connect message to history and send it to clientss
		var nowString = new Date().toISOString();
		var message = {
			user: nickname, 
			time: nowString, 
			text: "has joined", 
			imageUrl: profileUrl
		};
		chatHistory.push(message)
		io.emit("server new chat message", message);
	});

	socket.on("client new chat message", function(message) {
		chatHistory.push(message);
		socket.broadcast.emit("server new chat message", message);
	});

	socket.on("disconnect", function() {
		console.log("a user has left!");
		// Remove the user from the user list and update the remaining clients
		var index = allUsers.indexOf(nickname);
		allUsers.splice(index, 1);
		io.emit("server user list", allUsers);
		// Send a disconnect message to the clients
		var nowString = new Date().toISOString();
		var message = {
			user: nickname, 
			time: nowString, 
			text: "has disconnected", 
			imageUrl: profileUrl
		};
		chatHistory.push(message)
		io.emit("server new chat message", message);
	});
});

