
var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});
var ChatRoom = function(name, admin){
	this.name = name;
	this.admin = admin;
	this.users = [];
	this.sendMessages = function(msg){
		this.users.forEach(function(user){
			j_msg = JSON.stringify(msg);
			user.send(msg);
		});
	};
	this.enter = function(user_obj){
		this.users.push(user_obj);
	};
	this.leave = function(user_obj){
		index = this.users.indexOf(user_obj);
		this.users.splice(index,1);
	};

};
var User = function(client){
	this.name = "";
	this.client = client;
	this.hasName = false;
	this.room = "General Chat"
}


var general = new ChatRoom("General Chat", "none");
var userDb = [];
var userDbObj = userDb;
var chatHistory = [];
var chatRooms = [general];

server.on("connection", function(connection){
	//connection.send("Connected");
	//connection.send("Type in your user name:");
	var user = {
		name: "",
		client: connection,
		hasName: false
	}
	// var start_msg = "Please enter user name";
	// connection.send(jsonifyMsg("Server", start_j_msg, false))


	user.client.on("message", function(j_message_obj){
		var message_obj = JSON.parse(j_message_obj);
		var message = message_obj.message;
		// sets the user names
		if(user.hasName === false){
			user.name = message.trim();
			userDb.forEach(function(users){
				var add = {type:"add_chat", name:users.name};
				var j_add = JSON.stringify(add);
				user.client.send(j_add);
			});
			userDb.push(user);
			//console.log(user);
			var enter_msg = " has entered the chat room";
			var j_enter_msg = jsonifyMsg(user.name, enter_msg, false);
			userDb.forEach(function(users){
				var add = {type:"add_chat", name:user.name};
				var j_add = JSON.stringify(add);
				users.client.send(j_add);
				users.client.send(j_enter_msg);
			});
			chatHistory.forEach( function(history){
				user.client.send(history);
			});
			user.hasName = true;


		// accepts and sends messenges	
		}else{


			// if the iswhisper is true, only send to name 
			if( message_obj.whisper ){
				var j_w_msg = jsonifyMsg(user.name, message_obj.message, true);
				console.log(userDb);
				console.log(message_obj.sendTo)
				userDb.forEach(function(other_users){
					if(other_users.name === message_obj.sendTo ||
						other_users.name === user.name){
						console.log(other_users.name)
						other_users.client.send(j_w_msg);
					}
				});
			

			// regular default message
			}else{
				var reg_msg = jsonifyMsg(user.name, message, false);
				userDb.forEach(function(other_users){
					//if(other_users.name != user.name){
						other_users.client.send(reg_msg);
					//}
					chatHistory.push(reg_msg);
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
		userDb.forEach(function(users){
			var del = {type:"delete", name:user.name};
			var j_del = JSON.stringify(del);
			users.client.send(j_del);
		});
		
	});

	console.log(userDb);
});




// 
var jsonifyMsg = function(name1, msg1, wh, name2){
	var obj = {type:"msg", name:name1, msg:msg1, whisper: wh, sender:name2};
	var j_obj = JSON.stringify(obj);
	return j_obj;

};

function sendRegMessage(msg){

};












