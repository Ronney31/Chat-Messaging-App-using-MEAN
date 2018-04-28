var socket = io.connect('http://localhost:8080');
//var meIndex = require("/myIndex");

// Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('typing'),
    online = document.getElementById('online'),
    user = document.getElementById('user'),
    friends = document.getElementById('friends');

var userN;
//userid.innerHTML = myIndex.dynamicUserNm;
//console.log('welcom to chat.js');
//console.log("dynamic from chat.js "+dynamicUserNm);
//userid.innerHTML = "Raju";
//userid.innerHTML = meIndex.people();
//logg1.innerHTML = ("Samir");

function showUser(){
    // user.innerHTML = meIndex.userID();
    // user.innerHTML += " name";
    //alert('HELLO')
    // socket.emit('logg2', logg1.value);

    // socket.on('logg2', function(data){
    //     logg1.innerHTML = data.user;
    //     //feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
    // });

    socket.emit('userAndFriends', {
          user: user.value,
          friends: friends.value
    });
}

var friendlist=[];
//listen to fetch user profile and his friends
socket.on('userAndFriends', function(data){
    user.innerHTML = data.user;
    userN = data.user;
    friends.innerHTML = " ";
    friendlist = data.friends;
    length = (friendlist.length);
    if(length == 0)
        friends.innerHTML = '<p> No Friends Yet ! </p>';
    for(var i=0; i<length; i++)
    {
        //var arr =result[i];
        //onlineuser.push(arr.firstName); 
        //console.log(arr.firstName);
        //console.log(lst[i]); 
        friends.innerHTML += '<a href="" class="link2" >'+ lst[i]+'</a><br>';
    }
});


// Emit events
btn.addEventListener('click', function(){
  socket.emit('chat', {
      message: message.value,
      handle: userN,
  });
  message.value = "";
});

// socket.on('avail',function(data){
//     userid.innerHTML = "RAJA";
//     online.innerHTML = data;
// });


// Emiting typing to all

message.addEventListener('keypress', function(){
    socket.emit('typing', userN);
});

var lst=[];
// Listen for events
socket.on('chat', function(data){
    var d = new Date();
    feedback.innerHTML = '';
    online.innerHTML = '';
    //logg1.innerHTML = 
    //people.innerHTML = data.ppl;
    lst = data.ppl;
    length = (lst.length);
        //console.log(raj);
        for(var i=0; i<length; i++)
         {
             //var arr =result[i];
             //onlineuser.push(arr.firstName); 
             //console.log(arr.firstName);
             //console.log(lst[i]); 
             online.innerHTML += '<a href="" class="link2" >'+ lst[i]+'</a><br>';
         }
    //userid.innerHTML = data.handle;
//    logg1.innerHTML = data.user;
    output.innerHTML += d.getHours()+":"+d.getMinutes() + '<p style="text-align: left;""><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

        //console.log(onlineuser);

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
