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

$(document).ready(function () {
  let userId = null;

  let init = $.ajax({
    url: '/checkUser',
    type: 'POST',
    success: function(result){
      const data = JSON.parse(result);
      $('#user').append(data.username);
      userId = data.id;
    }
  });

  init.done( function () {

    let friendList = $.ajax({
      url: `/v1/user/${userId}/friends`,
      type: 'GET',
      success: function(result){
        const selector = $('#friends');
        selector.empty();
        if(result != ""){
          const data = JSON.parse(result);
          data.forEach(function(item, i, data) {
            const template = `<span class="user-badge" user-id="${item.id}">${item.username}</span><br>`;
            selector.append(template);
          });
        } else {
          selector.append('<h2 style="color:grey;">Empty</h2>');
        }
      }
    });

    let sReq = $.ajax({
      url: `/v1/user/${userId}/friendRequestSent`,
      type: 'GET',
      success: function(result){
        const selector = $('#friends');
        if(result != ""){
          const data = result;
          selector.append('<h5>Sent requests</h5><br>');
          data.forEach(function(item, i, data) {
            const template = `<span class="user-badge" user-id="${item.id}">${item.username}</span><br>`;
            selector.append(template);
          });
        }
      }
    });

    let rReq = $.ajax({
      url: `/v1/user/${userId}/friendRequestReceived`,
      type: 'GET',
      success: function(result){
        if(result != ""){
          const data = result;
          const selector = $('#friends');
          selector.append('<h5>Received requests</h5><br>');
          data.forEach(function(item, i, data) {
            const template = `<span class="user-badge" user-id="${item.id}">${item.username}</span><br>`;
            selector.append(template);
          });
        }
      }
    });
  });

});
