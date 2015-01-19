
var moment = require('moment');

var now = moment();

var formatted = now.format('HH:mm AM/PM');

console.log(formatted);


var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});
var ChatRoom = function(name, admin){
	this.name = name;
	this.admin = admin;
	this.users = [];
	this.chatHist = [];
	this.sendMessages = function(msg){
		this.users.forEach(function(user){
			j_msg = JSON.stringify(msg);
			user.client.send(msg);
		});
	};
	this.enter = function(user){
		// sends "add everyone" to current client
		this.users.forEach(function(others){
			var add = {type:"add_chat", name:others.name};
			var j_add = JSON.stringify(add);	
			user.client.send(j_add);
		});
		// adds user to chatroom
		this.users.push(user);
		user.room = this.name;
		if( user.rooms.indexOf(this.name) < 0 ){
			user.rooms.push(this.name);
		};
		// sends "add me" to everyone else
		this.users.forEach(function(clients){
			var add = {type:"add_chat", name:user.name};
			var j_add = JSON.stringify(add);
			clients.client.send(j_add);
		});
	};
	this.leave = function(user){
		index = this.users.indexOf(user);
		this.users.splice(index,1);
	};

};
var User = function(client){
	this.name = "";
	this.client = client;
	this.hasName = false;
	this.room = "";
	this.rooms = [];
}


var general = new ChatRoom("General Chat", "none");
var userDb = [];
var userDbObj = userDb;
var chatHistory = [];
var chatRooms = [general];

server.on("connection", function(connection){
	var user = new User(connection);

	// event for when user sends msg to server
	user.client.on("message", function(j_message_obj){
		var message_obj = JSON.parse(j_message_obj);
		var message = message_obj.message;
		console.log(message_obj);


		// sets the user names
		if(user.hasName === false){
			user.name = message.trim();
			chatRooms[0].enter(user);
			user.hasName = true;
			// console.log(user);


		
		}else{	
			if(message_obj.type === "msg"){
				sendRegMessages(message, user);
			}else if(message_obj.type === "room change"){
				changeChatrooms(user, message_obj);
			}
		}
	});
	
	connection.on("close", function(){

		userDb.forEach(function(users){
			if(users === user){
				index = userDb.indexOf(users);
				userDb.splice(index, 1);
			}
		});
		userDb.forEach(function(users){
			var del = {type:"delete", name:user.name};
			var j_del = JSON.stringify(del);
			users.client.send(j_del);
		});
		chatRooms.forEach(function(room){
			if(room.name === user.room){
				room.leave(user);
			}	
		});
	});
});




// 
var jsonifyMsg = function(name1, msg1, wh, name2){
	var obj = {type:"msg", name:name1, msg:msg1, whisper: wh, sender:name2};
	var j_obj = JSON.stringify(obj);
	return j_obj;

};

// sends regular messages to same chat room
function sendRegMessages(message, user){
	var reg_msg = jsonifyMsg(user.name, message, false);
	chatRooms.forEach(function(room){
		if(room.name === user.room){
			room.sendMessages(reg_msg);
		}	
	});
};

// changes the chat room if the type is room change
function changeChatrooms(user, chatroom){

};










// types of messages sent:
/* 
	Delete {type: delete, name = name}
	Add {type: add_chat, name = name}
	msg {type:"msg", name= name, msg="the message"}

	*/

/* Useless Code

//  var conversion = function(msg){
// 	var new_msg;

// 	return new_msg;
// }


// returns true if "/w" is the first word in the msg,
// false otherwise
// var isWhisper = function(msg){
// 	var split = msg.split(" ");
// 	if (split[0] === "/w"){
// 		return true;
// 	}else{
// 		return false;
// 	};
// };

// sends all other currently logged on users if
			// message only contains "/who" ---- obsolete
			// }else if(message === "/who"){
			// 	userDb.forEach(function(other_users){
			// 		var whoMsg = {type:"who", name: user.name};
			// 		user.client.send(whoMsg);
			// 	});





			// sends message in cowsay format
			// } else if( isCowsay(message) ){
			// 	var split = message.split(" ");
			// 	split.splice(0,1);
			// 	var new_msg = split.join(" ");
			// 	var cow = cowsay.say({text: new_msg});
			// 	var cow_msg = jsonifyMsg(user.name, cow_msg)
			// 	userDb.forEach(function(other_users){
			// 		//if(other_users.name != user.name){
			// 			other_users.client.send(cow_msg);
			// 		//}
			// 	});


// else{
		// 		// sends to each that the user has disconnected
		// 		var del = {type:"delete", name:user.name};
		// 		var j_del = JSON.stringify(del);
		// 		users.client.send(j_del);
		// 	}
		// });
		// returns true if "/cowsay" is the first word in msg.
// false otherwise
// var isCowsay = function(msg){
// 	var split = msg.split(" ");
// 	if(split[0] === "/cowsay"){
// 		return true;
// 	}else{
// 		return false;
// 	}
// }
*/
