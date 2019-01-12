const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoConnect = require('./js/database').mongoConnect;
const nocache = require('nocache');
const app = express();

app.use(express.static(__dirname));
app.use(express.static(__dirname+'/html'));
app.use(express.static(__dirname+'/images'));
app.use(express.static(__dirname+'/css'));
app.use(express.static(__dirname+'/js'));
app.use(express.static(__dirname+'/routes'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(nocache());

app.get('/',(req,res,next) => {
	res.sendFile(path.join(__dirname,'html','index.html'));
});

var body='';

app.post('/mychat',(req, res, next) => {
	body = req.body;
	if(body['nickname'] !== '')
    	res.sendFile(path.join(__dirname,'html','mychat.html'));
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
 		let chat = db.collection('new-chat');
 		//chat.deleteMany();
 		console.log('Table Created');
 		console.log(body);
 		chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }
            socket.emit('fetch', res);
        });

 		socket.on('send', function(data){
 			console.log(data);
 			chat.insertOne({name:data['name'],msg:data['msg']});
 			io.emit('output',[data]);
 		});

 		socket.on('disconnect',function(){
 			console.log("User Disconnected");
 		});

 	});

});
