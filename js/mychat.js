var socket;

(function(){
    
    socket = io.connect('http://127.0.0.1:4000');

    socket.on('output',function(data){
        if(data !== undefined){
            if(data[0]['msg'] !== ''){
                var textArea = document.getElementById('messages').value + '';
                document.getElementById('messages').value = data[0]['name'] + ': ' +  data[0]['msg'] + '\n' + textArea;
            }
        }
    });

    socket.on('fetch',function(res){
        console.log(res);
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

 })();

//console.log(window.sessionStorage);
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
