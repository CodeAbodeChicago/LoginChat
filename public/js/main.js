

// Getting DOM elements
var msgWrap = document.getElementById("msg-wrap");
var msgTemplate = msgWrap.querySelector(".msg-template");
msgWrap.removeChild(msgTemplate);
msgTemplate.style.visibility = "visible";
var userList = document.querySelector(".user-list");

var chatForm = document.getElementById("msg-form");
var chatInput = chatForm.elements["new-msg"];
var form = document.getElementById("login-form");
var errorDisplay = document.querySelector("#login-form .error");
var usernameInput = form.elements["username"];



var socket = io();

// Pick random avatar
var avatar = document.querySelector(".avatar");
var randIndex = Math.floor(Math.random() * 24);
avatar.src = "images/" + randIndex + ".jpg";

var username = "";
var profileUrl = avatar.src;


usernameInput.focus();
form.onsubmit = function (event) {
	event.preventDefault();

	errorDisplay.textContent = "";
	errorDisplay.style.display = "none";

	username = usernameInput.value;
	if (username === "") {
		errorDisplay.textContent = "*No username entered!";
		errorDisplay.style.display = "block";
		return;
	}

	var user = {
		name: username, 
		profileUrl: profileUrl
	};
	socket.emit("attempt username registration", username, function (isAvailable) {
		console.log(isAvailable);
		if (isAvailable) {
			socket.emit("client register user", user);
			document.getElementById("login-wrap").style.display = "none";
			chatInput.focus();
		}
		else {
			errorDisplay.textContent = "*Username is taken!";
			errorDisplay.style.display = "block";
		}
	});	
};

// _____________________________________________________________________________
// Form input

chatForm.onsubmit = function(e) {
	e.preventDefault();
	if (chatInput.value === "") return false;

	var nowString = new Date().toISOString();
	var message = {
		user: username, 
		time: nowString, 
		text: chatInput.value, 
		imageUrl: profileUrl
	};
	console.log(message)
	socket.emit("client new chat message", message);
	printMessage(message, false);
	chatInput.value = "";

	return false;
};

function printMessage(message, dim){
	var clone = msgTemplate.cloneNode(true);
	clone.querySelector(".profile").src = message.imageUrl;
	clone.querySelector(".username").textContent = message.user;
	clone.querySelector(".msg").textContent = message.text;
	var timeString = moment(message.time).format("h:mm:ss a");
	clone.querySelector(".time").textContent = timeString;
	if (dim) clone.style.opacity = "0.4"; // dim used for chat history
	msgWrap.appendChild(clone);
	clone.scrollIntoView(false); // scroll to bottom of page
}


// _____________________________________________________________________________
// Socket messages & history

socket.on("server new chat message", function(message) {
	console.log("Another user sent a message!");
	printMessage(message, false);
});

socket.on("server chat history", function(chatHistory) {
	for (var i = 0; i < chatHistory.length; i++) {
		printMessage(chatHistory[i], true);
	}
});



// _____________________________________________________________________________
// User list sidebar

socket.on("server user list", function(allUsers) {
	userList.innerHTML = "";
	for (var i = 0; i < allUsers.length; i += 1) {
		var newItem = document.createElement("li");
		newItem.textContent = allUsers[i];
		userList.appendChild(newItem);
	}
});

