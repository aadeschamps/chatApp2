var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});
var cowsay = require("cowsay");

var userDb = [];
var userDbObj = userDb;
var chatHistory = [];

server.on("connection", function(connection){
	//connection.send("Connected");
	//connection.send("Type in your user name:");
	var user = {
		name: "",
		client: connection,
	}


	user.client.on("message", function(message){
		// sets the user names
		if(user.name === ""){
			user.name = message;
			userDb.forEach(function(users){
				var add = {type:"add_chat", name:users.name};
				var j_add = JSON.stringify(add);
				user.client.send(j_add);
			});
			userDb.push(user);
			//console.log(user);
			userDb.forEach(function(users){
				var add = {type:"add_chat", name:user.name};
				var j_add = JSON.stringify(add);
				users.client.send(j_add);
			});
			chatHistory.forEach( function(history){
				user.client.send(history);
			});


		// accepts and sends messenges	
		}else{


			// is the iswhisper is true, only send to name 
			if( isWhisper(message) ){
				var split = message.split(" ");
				var whisper = split[1];
				split.splice(0,2);
				var new_msg = split.join(" ");
				var j_w_msg = jsonifyMsg(user.name, new_msg, true);
				userDb.forEach(function(other_users){
					if(other_users.name === whisper ||
						other_users.name === user.name){
						other_users.client.send(j_w_msg);
					}
				});


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
		// else{
		// 		// sends to each that the user has disconnected
		// 		var del = {type:"delete", name:user.name};
		// 		var j_del = JSON.stringify(del);
		// 		users.client.send(j_del);
		// 	}
		// });
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
		return false;
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

var conversion = function(msg){
	var new_msg;

	return new_msg;
}

var jsonifyMsg = function(name1, msg1, wh){
	var obj = {type:"msg", name:name1, msg:msg1, whisper: wh};
	var j_obj = JSON.stringify(obj);
	return j_obj;

}


// types of messages sent:
/* 
	Delete {type: delete, name = name}
	Add {type: add_chat, name = name}
	msg {type:"msg", name= name, msg="the message"}

	*/






