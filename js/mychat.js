var socket;

(function(){

    if(window.sessionStorage['name'] === undefined)
         window.location.href = "http://127.0.0.1:4000";

    socket = io.connect('http://127.0.0.1:4000',{query: "username="+window.sessionStorage['name'] });

    socket.on('output',function(data){
        if(data !== undefined){
            if(data[0]['msg'] !== ''){
                var textArea = document.getElementById('messages').value + '';
                document.getElementById('messages').value = data[0]['name'] + ': ' +  data[0]['msg'] + '\n' + textArea;
            }
        }
    });

    socket.on('user-online',function(data){
        document.getElementById('online-users').innerHTML = 'Active Users: ' + data.toString();
    });

    /*socket.on('add-user',function(name){
        var anchor = document.createElement('a')
        anchor.href = '#';
        anchor.id = name+'$';
        anchor.innerHTML = name;
        document.getElementById('displayUsers').appendChild(anchor);
    });

    socket.on('remove-user',function(name){
        var users = document.getElementById('displayUsers');
        users.removeChild(document.getElementById(name+'$')); 
    });*/

    socket.on('fetch',function(res){

        var len = res.length;
        var output = '';
        for(var i=len-1;i>=0;i--){
            if(i==0)
                output = output + res[i]['name'] + ': ' +  res[i]['msg'];
            else
                output = output + res[i]['name'] + ': ' +  res[i]['msg'] + '\n';    
        }
        if(output !== '')
            document.getElementById('messages').value = output;
    });

    socket.on('users-list',function(res){
        console.log(res,"hi");
        var len = res.length;
        var name;
        for(var i=len-1;i>=0;i--){
            if(res[i].id != socket.id && document.getElementById(res[i].username+'$') === null){
                name = res[i].username;
                var anchor = document.createElement('a')
                anchor.href = '#';
                anchor.id = name+'$';
                anchor.innerHTML = name;
                document.getElementById('displayUsers').appendChild(anchor);
            }  
        }
    });

    socket.on('remove-user',function(name,id){
        var users = document.getElementById('displayUsers');
        if(socket.id != id)
            users.removeChild(document.getElementById(name+'$')); 
    });

 })();

function handleSend(){
    var message = document.getElementById('chatbox').value.trim();
    if(message !== ''){
        socket.emit('send',{
            name:window.sessionStorage['name'],
            msg:message
        });
    document.getElementById('chatbox').value = '';
    }
}
