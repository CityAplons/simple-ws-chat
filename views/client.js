/*(function() {
  var HOST = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(HOST);

  var form = document.querySelector('.form');

  form.onsubmit = function() {
    const input = document.querySelector('.input');
    let text = input.value;
    if(text !== ""){
      ws.send(text);
      input.value = '';
      input.focus();
    }
    return false;
  }

  ws.onmessage = function(msg) {
    var response = msg.data;
    var messageList = document.querySelector('.messages');
    var msg = document.createElement('div');
    msg.textContent = response;
    messageList.appendChild(msg);
  }
});*/

window.onload = function () {

  //Get username
  const userTag = document.getElementById("user");
  fetchUser(userTag);
  
}

function fetchUser ( selector ) {
  let xhr = new XMLHttpRequest();

  xhr.open('POST','/checkUser');
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.send();
  xhr.onload = function () {
    if(this.responseText != ""){
      selector.innerHTML = this.responseText;
    }
  };
}
