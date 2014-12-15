var ws = new WebSocket("ws://localhost:3000");

var onlineList = [];
var liList = [];
var ul = document.querySelector("#chat");
var new_list = document.querySelector("#chatwrap");
var input_field = document.querySelector("#input");

ws.addEventListener("open", function(evt){
	console.log("Connected to server");
});

ws.addEventListener("message", function(evt){
	var msg_obj = JSON.parse(evt.data);
	var type = msg_obj.type;
	console.log(msg_obj);
	if(type === "msg"){
		chatMessages(msg_obj);
	}else if(type === "add_chat"){
		addCurrent(msg_obj);
	}else if(type === "delete"){
		deleteOffline(msg_obj);
	}else if(type === "add_msg" || type === 'off_msg'){
		onlineMsg(msg_obj);
	}else if(type === "ban" || type === "server"){
		serverMsg(msg_obj);
	}
});

var serverMsg = function(message_obj){
	var li = document.createElement("li");
	var inner = message_obj.msg;
	li.innerHTML = inner;
	liList.push(li);
	var first = ul.firstChild;
	ul.insertBefore(li, first);
}

var addCurrent = function(message_obj){
	var ul = document.getElementById("current");
	var li = document.createElement("li");
	li.innerHTML = message_obj.name;
	ul.appendChild(li);
	onlineList.push(li);
	li.addEventListener("click", function(){
		input_field.value = "/w " + message_obj.name + " ";
	})
}


var deleteOffline = function(message_obj){
	onlineList.forEach(function(names){
		if(names.innerHTML === message_obj.name){
			names.remove();
		}
	})
};
var count = 0;

var onlineMsg = function(message_obj){
	var name = message_obj.name;
	if( message_obj.type === "add_msg"){
		var inner = name + " has entered the chat";
	}else{
		var inner = name + " has left the chat";
	}
	var li = document.createElement("li");
	if(count % 2 === 0){
		li.setAttribute("class","even");
	}else{
		li.setAttribute("class","odd");
	}
	count++;
	li.innerHTML = inner;
	liList.push(li);
	var first = ul.firstChild;
	ul.insertBefore(li, first);
};

var chatMessages = function(message_obj){
	var name = message_obj.name
	var message = message_obj.msg;
	console.log(message);
	var li = document.createElement("li");
	console.log(message_obj.color);
	li.style.color = message_obj.color;
	if(count % 2 === 0){
		li.setAttribute("class","even");
	}else{
		li.setAttribute("class","odd");
	}
	count++;
	var link_test = message.split(" ");
	link_test.forEach(function(word){
		var http = word[0] + word[1] + word[2] + word[3] + word[4] + 
		word[5] + word[6];
		if( http === "http://"){
			var replacement = "<a href='" + word + "'>" + word + "</a>";
			var index = link_test.indexOf(word);
			link_test[index] = replacement;
		}
	});
	console.log(link_test);
	console.log(message);
	message = link_test.join(" ");

	if (message_obj.whisper){
		inner = name + " whisper: " + message;
	}else{
		inner = name + ": " + message;
	}
	li.innerHTML = inner;
	var split = message.split(" ");
	split.forEach(function(elem){
		var l = elem.length;
		var last3 = elem.charAt(l-3) + elem.charAt(l-2) + elem.charAt(l-1);
		if(last3 === "png" || last3 === "bmp" || last3 === "jpg" || last3 === "gif"){
			var img = document.createElement("img");
			img.setAttribute("src", elem);
			img.setAttribute("width", "100");
			img.setAttribute("height", "100");
			li.appendChild(img);
	}
	});
	
	liList.push(li);
	var first = ul.firstChild;
	ul.insertBefore(li, first);
}



// Message is sent
input_field.addEventListener("keyup", function(evt){
	if (evt.keyCode === 13){
		var send_obj = new buildSendObj("msg", input_field.value);
		console.log(send_obj);
		var new_msg = send_obj.isWhisper(input_field.value);
		send_obj.isYell(new_msg);
		send_obj.tableFlip();
		send_obj.changeColor();
		var j_send_obj = JSON.stringify(send_obj);
		console.log(j_send_obj);
		ws.send(j_send_obj);
		input_field.value = "";
}});

var buildSendObj = function(type, message){
	this.type = type;
	this.message = message;
	this.whisper = false;
	this.sendTo = "";
	this.isWhisper = function(input){
		var split = input.split(" ");
		if(split[0] === "/w"){
			this.whisper = true;
			this.sendTo = split[1];
			split.splice(0,2);
			new_msg = split.join(" ");
			this.message = new_msg;
			return new_msg;
			// can handle detection if the person exists here
		};
		return input;
	};

	this.isYell = function(input){
		var split = input.split(" ");
		if(split[0] === "/yell"){
			split.splice(0,1);
			var new_msg = split.join(" ");
			new_msg = new_msg.toUpperCase();
			console.log(new_msg);
			this.message = new_msg;
		}
	};
	this.tableFlip = function(){
		var check = this.message;
		var checked = check.replace("(table flip)", "(╯°□°）╯︵ ┻━┻");
		this.message = checked;
	};
	this.changeColor = function(){
		var check = this.message;
		var split = check.split(" ");
		if(split[0] === "/color"){
			this.type = "color";
			split.splice(0,1);
		}
		var checked = split.join(" ");
		this.message = checked;
	}
};

var bad_words = ["fuck", "ass", "shit"];

var isValid = function(name){
	name = name.toUpperCase();
	var test1 = name.split(" ");
	if(test1.length != 1){
		return false;
	}
	bad_words.forEach(function(word){
		if (name === word){
			return false;
		}
	});
	return true;
}



			// }else
			// 	var li = document.createElement("li");
			// 	li.innerHTML = "Invalid user name, try again";
			// 	var first = ul.firstChild;
			// 	ul.insertBefore(li, first);