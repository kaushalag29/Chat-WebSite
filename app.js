const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoConnect = require('./js/database').mongoConnect;
const nocache = require('nocache');
const expressHbs = require('express-handlebars');
//const Confirm = require('confirm-dialog');
const app = express();


app.use(express.static(__dirname));
app.use(express.static(__dirname+'/html'));
app.use(express.static(__dirname+'/images'));
app.use(express.static(__dirname+'/css'));
app.use(express.static(__dirname+'/js'));
app.use(express.static(__dirname+'/routes'));

app.use(bodyParser.urlencoded({extended: false}));

app.use(nocache());

app.engine('hbs',expressHbs());
app.set('view engine','hbs');
app.set('views','html');

function check_nick(name){
	if(name == '' || name.endsWith('$'))
		return false;
	if(nameToSocketId[name] === undefined)
		return true;
	return false;
}

app.get('/',(req,res,next) => {
	res.render('index');
});

var body='';
var users_online = 0;
var nameToSocketId = {};
var socketIdToName = {};

app.get('/mychat',(req,res,next) => {
	console.log(req);
	res.render('mychat');
});

app.post('/mychat',(req, res, next) => {
	body = req.body;
	if(check_nick(body['nickname']))
    	res.render('mychat');
    else
    	res.redirect('/');
});

app.use((req, res, next) => {
    res.status(404).redirect('/');
});

mongoConnect(() => {
	var server;
	try{
		 server = app.listen(4000);
	}catch(err){
		console.log(err);
	}
	const io = require('socket.io')(server);
 	const getDb = require('./js/database').getDb;
 	const db = getDb();
 	io.on('connection',socket => {
 		console.log('Client Connected!');
 		var socket_query = socket.request._query;
 		users_online++;
 		console.log(socket.id);
 		socketIdToName[socket.id] = socket_query['username'];
 		nameToSocketId[socket_query['username']] = socket.id;
 		io.emit('user-online',users_online-1);
 		let chat = db.collection('new-chat');
 		let users_list = db.collection('online-users');
 		console.log("adding");
 		users_list.insertOne({id:socket.id,username:socketIdToName[socket.id]}).then(function(res){
	 			
	 			users_list.find().limit(100).sort({_id:1}).toArray().then(function(res){
	            console.log("emitting");
	            io.emit('users-list', res);
        	},function(err){
	        	if(err){
	                throw err;
	            }
        	});

 		},function(err){
 			console.log(err);
 		});
 		chat.find().limit(100).sort({_id:1}).toArray().then(function(res){
            socket.emit('fetch', res);
        },function(err){
        	 if(err){
                throw err;
            }
        });

 		socket.on('send', function(data){
 			try{
 				chat.insertOne({name:data['name'],msg:data['msg']}).then(function(res){
 					io.emit('output',[data]);
 				},function(err){
 					console.log(err);
 				});
 			}catch(err){
 				console.log(err);
 			}
 		});

 		socket.on('disconnect',function(){
 			console.log("Client Disconnected");
 			users_online--;
 			io.emit('user-online',users_online-1);
 			io.emit('remove-user',socketIdToName[socket.id],socket.id);
 			users_list.find({id:socket.id}).toArray().then(function(item){
 				 //console.log(item);
 				 users_list.deleteOne(item[0]);
 				 if(users_online === 0)
 					chat.deleteMany(),
 					users_list.deleteMany();
 			},
 			function(error){
 				console.log("Error while deleting user from active user list.");
 			});
 			nameToSocketId[socketIdToName[socket.id]] = undefined;
 			socketIdToName[socket.id] = undefined;
 		});

 	});

});
