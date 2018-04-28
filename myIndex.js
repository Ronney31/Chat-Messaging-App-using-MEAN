var express = require('express');
//var router = express.Router();
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var MongoClient =require('mongodb').MongoClient;
var server = require('http').Server(app);
var socket = require('socket.io');
var io = socket(server);
var session;
var port = 8080;
var dynamicUserNm = "user Name";
var onlineuser = [];
var username= "user";

var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// function userID()
// {
// 	console.log('user name to be sent is '+ username);
// 	// console.log(dynamicUserNm);
// 	return username;
// };

app.use(sessions({
	secret: '**^&as%@#a67d62a^%^^&S%&%^',
	resave: false,
	saveUninitialized: true
}))
app.get('/', function(req, res) {
	session = req.session;
	if(session.uniqueID){
		res.redirect('/redirects');
	}    
	res.sendFile(path.join(__dirname + '/ui/logIn.html'));
});
app.get('/logIn', function(req, res) {
	session = req.session;
	if(session.uniqueID){
		res.redirect('/redirects');
	}    
	res.sendFile(path.join(__dirname + '/ui/logIn.html'));
});
app.get('/signUp', function(req, res) {
    res.sendFile(path.join(__dirname + '/ui/signUp.html'));
    //res.end(req.query.firstName+" "+req.query.lastName);
});
app.get('/logout', function(req,res){
	req.session.destroy(function(error){
		console.log("Successfully Logout");
		session=null;
		dynamicUserNm = "";
		res.redirect('/logIn');
	});
});

app.get('/redirects',function(req,res){
	session = req.session;
	if(session.uniqueID){
		console.log(session.uniqueID);
		res.redirect('/chat');
	}else{
		res.send("Who are you ?? ");
	}
});
app.get('/chat', function(req, res) { 
	// userid = document.getElementById('userNm');
	// userid.innerHTML = dynamicUserNm;
	//req.user = username;
	//console.log('username is ' + username);
	res.sendFile(path.join(__dirname + '/ui/chat.html'));

});
app.get('/viewUser',  function(req, res) {
    dbConn.then(function(db) {
    	var dbo = db.db("mydb");
        dbo.collection('user').find({}).toArray().then(function(user) {
        	//onlineuser = user;
        	//console.log(user);
            res.status(200).json(user);
        });
        //console.log(onlineuser);
    });
   //console.log(onlineuser);
});



dbConn.then(function(db) {
		var length=0;
    	var dbo = db.db("mydb");
    	var lst=[];
    dbo.collection("user").find({}).toArray().then(function(result) {
    		//onlineuser +=  result;
    		//console.log(result);
    		//console.log('length is '+result.length);
    		length = (result.length);
    		for(var i=0; i<length; i++)
    		{
    			var arr =result[i];
    			lst.push(arr.firstName); 
    			//console.log(arr.firstName);
    			//console.log(onlineuser);
    		}
    		
	});
    	// console.log(lst);
    	// lst.push('raj');
    	// console.log(lst);
    	
    	// length = (lst.length);
    	// //console.log(raj);
    	// for(var i=0; i<length; i++)
    	// 	{
    	// 		//var arr =result[i];
    	// 		//onlineuser.push(arr.firstName); 
    	// 		//console.log(arr.firstName);
    	// 		console.log(lst[i]);
    	// 	}
     //    //console.log(onlineuser);

    	
});




app.use(express.static('public'));
io.on('connection', (socket) => {

    //console.log('made socket connection', socket.id);
	dbConn.then(function(db) {
		var length=0;
    	var dbo = db.db("mydb");
    	var lst=[];

    	dbo.collection("user").find({}).toArray().then(function(result) {
    		//onlineuser +=  result;
    		//console.log(result);
    		//console.log('length is '+result.length);
    		length = (result.length);
    		for(var i=0; i<length; i++)
    		{
    			var arr =result[i];
    			lst.push(arr.firstName); 
    			//console.log(arr.firstName);
    			//console.log(onlineuser);
    		}

		    //console.log('this is a latest user'+dynamicUserNm);
		    // Handle chat event
		    socket.on('chat', function(data){
		        //data['ppl'] ="raja/n Jatin /n mahesh";
		        data['ppl'] =lst;
		        io.sockets.emit('chat', data);
			});


			//user and his friend list
			socket.on('userAndFriends', function(data){
		   	var friendlist = [];
		    	dbo.collection("user").find({}).toArray().then(function(result) {
		    		//onlineuser +=  result;
		    		//console.log(result);
		    		//console.log('length is '+result.length);
		    		length = (result.length);
		    		for(var i=0; i<length; i++)
		    		{
		    			var arr =result[i];
		    			if(username == arr.firstName)
		    				friendlist = arr.friends; 
		    			//console.log(arr.firstName);
		    			//console.log(onlineuser);
		    		}

			        data['friends'] =friendlist;
			        data['user'] = username;
			        console.log('user is '+username);
			        console.log('friends are '+ friendlist);
			        socket.emit('userAndFriends', data);
				});

				// Handle typing event
			    socket.on('typing', function(data){
			        socket.broadcast.emit('typing', data);
				});
			});
    	
		});

	});
});

//post data

// app.post('/chat', function(req, res) { 
// 	dbConn.then(function(db) {
//     	var dbo = db.db("mydb");
//         dbo.collection('user').find({}).toArray().then(function(user) {
//             req.body.content= user.firstName;
//         });
//     });
// });
app.post('/logIn', function(req,res){
	var nm,ps;
	console.log("we are in post /");
	session = req.session;
	if(session.uniqueID){
		res.redirect('/redirects');
	}
	//console.log(req.body.username);
	dbConn.then(function(db) {
    	var dbo = db.db("mydb");
    	dbo.collection("user").findOne({email: req.body.username}, function(err, result) {
		    		if (err) {console.log('user not found');throw err;}
		    		if(result == null)
		    			res.redirect('/redirects');
		    		else{
						        console.log('this is emil:- '+result.email);
						        nm = result.email;
						        ps = result.passWord;

							    console.log("ps is "+ps);
							    console.log("nm is "+nm);
							    dynamicUserNm = nm;
							    

							    console.log("email is "+req.body.username);
							    console.log("pass is "+req.body.password);

							if(req.body.username == nm && req.body.password == ps){
								session.uniqueID = req.body.username;
								console.log("matched");
								username = result.firstName;
							}
							else
								console.log("authentication not matched");
							res.redirect('/redirects');
						}
			});
    });
});
app.post('/', function(req,res){
	var nm,ps;
	console.log("we are in post /");
	session = req.session;
	if(session.uniqueID){
		res.redirect('/redirects');
	}
	//console.log(req.body.username);
	dbConn.then(function(db) {
    	var dbo = db.db("mydb");
    	dbo.collection("user").findOne({email: req.body.username}, function(err, result) {
		    		if (err) {console.log('user not found');throw err;}
		    		if(result != null)
		    		{
		    			 console.log('this is emil:- '+result.email);
						        nm = result.email;
						        ps = result.passWord;

							    console.log("ps is "+ps);
							    console.log("nm is "+nm);
							    dynamicUserNm = nm;
							    //console.log("dynamic user name is "+dynamicUserNm);

							    console.log("email is "+req.body.username);
							    console.log("pass is "+req.body.password);

							if(req.body.username == nm && req.body.password == ps){
								session.uniqueID = req.body.username;
								username = result.firstName;
								console.log("matched");
							}
							else
								console.log("authentication not matched");
							
						}
						res.redirect('/redirects');
		});
    });
});

app.post('/signUp', function(req,res){
	//res.end(JSON.stringify(req.body));
	//password checker
	//if(req.body.username == 'userlist' && req.body.userPass == 'passlist')
	dbConn.then(function(db) {
        delete req.body._id; // for safety reasons
        var dbo = db.db("mydb");
        //var fnd={'friends' : ''};
        req.body['friends'] = '';
        dbo.collection('user').insertOne(req.body);
        //console.log('we are in signUp and data is ' + req.body);
    });    
    res.end('Data received:\n' + JSON.stringify(req.body));
});

app.post('/chat', function(req,res){
	res.end(JSON.stringify(req.body));
});

app.use(express.static(__dirname + '/local'));

//if the link or the file is not available/present then put 404 ERROR
app.get(/^(.+)$/, function(req, resp){
	try{
		if(fs.statSync(path.join(__dirname, './ui/', req.parms[0]+'.html')).isFile()){
			//continue;
		}
	}catch(err){
		resp.sendFile('404error.html',{root: path.join(__dirname, './ui')});
	}
});
//database
mongoose.connect('mongodb://localhost/database');

// var Schema = new mongoose.Schema({
// 		fname : String,
// 		lname : String,
// 		email : String,
// 		password : String
// });
// var user = mongoose.model('emp', Schema);
// var fn,ln,em,ps;
// app.post('/signUp',function(req,res){
// 	new user({
// 		fname : req.body.firstName,
// 		lname : req.body.lastName,
// 		email : req.body.email,
// 		password : req.body.password
// 	}).save(function(err, doc){
// 		if(err) res.json(err);
// 		else
// 			res.send('Successfully inserted !');
// //		res.send()
// 		fn=req.body.firstName;
// 		ln=req.body.lastName;
// 		em=req.body.email;
// 		ps=req.body.password;
// 	});
// });

// var url = "mongodb://localhost:27017/";
// //insert function into mongodb
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var myobj = {
//   	fname : fn,
// 	lname : ln,
// 	email : em,
// 	password : ps
// 	};
//   dbo.collection("customers").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//   });
// });

// //find function in mongodb
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   dbo.collection("customers").findOne({}, function(err, result) {
//     if (err) throw err;
//     console.log(result.fname);
//     console.log(result.lname);
//     console.log(result.email);
//     console.log(result.password);
//     db.close();
//   });
// }); 

app.use(express.static(__dirname + '/public'));
//var io = require('socket.io').listen(app.listen(port));
//recieve message from the client and send it to other
// io.sockets.on('connection', function (socket) {
//     socket.emit('message', { message: 'welcome to Verto Chat Messenger' });
//     socket.on('send', function (data) {
//         io.sockets.emit('message', data);
//     });
// });

// io.on('connection',(socket)=>{
// 	console.log('new connection made');
// 	//Test messages
// 	socket.on('event1',(data)=> {
// 		console.log(data.msg);
// 	});

// 	socket.emit('event2',{
// 		msg: 'Server to client, do you read me? Over.'
// 	});

// 	socket.on('event3',(data)=>{
// 		console.log(data.msg);
// 		socket.emit('event4',{
// 			msg: 'Loud and clear :) '
// 		});
// 	});	

// });

//app.listen(port);
server.listen(port,function() {
	console.log("Listening on port " + port);
});
//module.exports = router