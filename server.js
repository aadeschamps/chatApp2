var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});
var cowsay = require("cowsay");

var userDb = [];

server.on("connection", function(connection){
	connection.send("Connected");
	connection.send("Type in your user name:");
	var user = {
		name: "",
		client: connection,
	}


	user.client.on("message", function(message){
		if(user.name === ""){
			user.name = message;
			userDb.push(user);
			userDb.forEach(function(users){
				users.client.send(user.name + " has entered the chat");
			})
		}else{
			if( isWhisper(message) ){
				var split = message.split(" ");
				var whisper = split[1];
				split.splice(0,2);
				var new_msg = split.join(" ");
				userDb.forEach(function(other_users){
					if(other_users.name === whisper ||
						other_users.name === user.name){
						other_users.client.send("whisper: " +user.name + ": " + new_msg);
					}
				});
			// sends all other currently logged on users if
			// message only contains "/who"
			}else if(message === "/who"){
				userDb.forEach(function(other_users){
					user.client.send(other_users.name);
				});
				user.client.send("end");
			} else if( isCowsay(message) ){
				var split = message.split(" ");
				split.splice(0,1);
				var new_msg = split.join(" ");
				var cow = cowsay.say({text: new_msg});
				userDb.forEach(function(other_users){
					//if(other_users.name != user.name){
						other_users.client.send(user.name + ": \n" + cow);
					//}
				});
			}else{
				userDb.forEach(function(other_users){
					//if(other_users.name != user.name){
						other_users.client.send(user.name + ": " + message);
					//}
				});
			}
		}
		console.log(message);
	});
	
	connection.on("close", function(){
		userDb.forEach(function(users){
			if(users === user){
				index = userDb.indexOf(users);
				userDb.splice(index, 1);
			}
		});
	});

	console.log(userDb);
});

// returns true if "/w" is the first word in the msg,
// false otherwise
var isWhisper = function(msg){
	var split = msg.split(" ");
	if (split[0] === "/w"){
		return true;
	}else{
		return false
	};
};

// returns true if "/cowsay" is the first word in msg.
// false otherwise
var isCowsay = function(msg){
	var split = msg.split(" ");
	if(split[0] === "/cowsay"){
		return true;
	}else{
		return false;
	}
}




