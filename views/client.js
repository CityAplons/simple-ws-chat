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

    //'Add a friend' button listener
    $("#findFriend").click(function () {
      const selector = $("#addFriend");
      const friendsDiv = $("#friends");
      const button = $(this);

      if(selector.css("display") == "none"){
        selector.show();
        friendsDiv.hide();
        button.val("Cancel");
      }
      else {
        selector.hide();
        friendsDiv.show();
        button.val("Add a friend");
      }

    });

    //Check user for requests and friend other user
    const checkUserReq = s_id => {
      return new Promise(function(resolve, reject) {
        let status = false;

        //Friends
        $.ajax({
          url: `/v1/user/${userId}/friends`,
          type: 'GET',
          success: function(result){
              result.forEach(function(item, i, data) {
                if(item.id == s_id) status = true;
              });
            }
        }).done( function () {
          //Sent requests
          $.ajax({
            url: `/v1/user/${userId}/friendRequestSent`,
            type: 'GET',
            success: function(result){
              result.forEach(function(item, i, data) {
                if(item.id == s_id) status = true;
              });
            }
          }).done( function () {
            //Received requests
            $.ajax({
              url: `/v1/user/${userId}/friendRequestReceived`,
              type: 'GET',
              success: function(result){
                result.forEach(function(item, i, data) {
                  if(item.id == s_id) status = true;
                });
              }
            }).done( function () {
              resolve(status);
            });
          });
        });
      });
    };

    //Search friend function
    let searchFriend = function () {
      let username = $("#findUser").val();
      const selector = $('#friendResult');
      selector.empty();
      if(username != ""){
        $.ajax({
          url: '/v1/user/',
          type: 'GET',
          data: { user: username },
          success: function(result){
            if(result[0] && result[0].id != userId ){
              checkUserReq(result[0].id).then( function(status) {
                let template;
                if (status == true){
                  template = `<div class="user-badge" user-id="${result[0].id}">${result[0].username}</div>`;
                } else {
                  template = `<div class="user-badge" user-id="${result[0].id}">${result[0].username}<button type="button" class="cntrl send-req">+</button></div>`;
                }
                selector.append(template);
              });
            } else {
              selector.append("User not found...");
            }

          }
        });
      }
    };

    //Searchbox listener
    let typingTimer;
    let input = $("#findUser");
    input.on("change keyup keydown", function () {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(searchFriend, 800);
    });

    //Add friend button
    $(document).on("click", ".send-req", function (){
      const el = $(this).parent();
      const id = el.attr("user-id");
      $.ajax({
        url: `/v1/user/${userId}/friendRequest`,
        type: 'PUT',
        data: { requesteeId: id },
        success: function(){
          updateFriendsList();
          $("#findFriend").trigger("click");
        }
      });
    });

    //FriendList funcs
    let updateFriendsList = function() {

      //FriendList
      var friendList = $.ajax({
        url: `/v1/user/${userId}/friends`,
        type: 'GET',
        success: function(result){
          const selector = $('#friends');
          selector.empty();
          if(result != ""){
            const data = result;
            selector.append("<hr>");
            data.forEach(function(item, i, data) {
              const template = `<div class="user-badge" user-id="${item.id}">${item.username}&nbsp<span class="status">•</span><button type="button" class="cntrl unfriend">✘</button><button type="button" class="cntrl chat">💬</button></div>`;
              selector.append(template);
            });
          } else {
            selector.append("<hr><h5>Empty friend list</h5>");
          }
        }
      });

      //Sent requests
      var sReq = $.ajax({
        url: `/v1/user/${userId}/friendRequestSent`,
        type: 'GET',
        success: function(result){
          const selector = $('#friends');
          if(result != ""){
            const data = result;
            data.forEach(function(item, i, data) {
              const template = `<div class="user-badge" user-id="${item.id}">${item.username}</div>`;
              selector.prepend(template);
            });
            selector.prepend('<h5 class="titles">Sent requests</h5>');
          }
        }
      });

      //Recieved requests
      var rReq = $.ajax({
        url: `/v1/user/${userId}/friendRequestReceived`,
        type: 'GET',
        success: function(result){
          if(result != ""){
            const data = result;
            const selector = $('#friends');
            data.forEach(function(item, i, data) {
              const template = `<div class="user-badge" user-id="${item.id}">${item.username}<button type="button" class="cntrl decline-req">✘</button><button type="button" class="cntrl accept-req">✔</button></div>`;
              selector.prepend(template);
            });
            selector.prepend('<h5 class="titles">Received requests</h5>');
          }
        }
      });

      //Friendlist render done trigger
      friendList.done( function () {

        //Unfriend
        $(".unfriend").on("click", function (){
          const el = $(this).parent();
          const id = el.attr("user-id");
          $.ajax({
            url: `/v1/user/${userId}/unfriend`,
            type: 'PUT',
            data: { friendId: id },
            success: function(){
              updateFriendsList();
            }
          });
        });

      });

      //Recieved requests render done trigger
      rReq.done( function () {

        //Decline friend request listener
        $(".decline-req").on("click", function (){
          const el = $(this).parent();
          const id = el.attr("user-id");
          $.ajax({
            url: `/v1/user/${userId}/cancelFriendRequest`,
            type: 'PUT',
            data: { requesterId: id },
            success: function(){
              updateFriendsList();
            }
          });
        });

        //Accept friend request listener
        $(".accept-req").on("click", function (){
          const el = $(this).parent();
          const id = el.attr("user-id");
          $.ajax({
            url: `/v1/user/${userId}/acceptFriendRequest`,
            type: 'PUT',
            data: { requesterId: id },
            success: function(){
              updateFriendsList();
            }
          });
        });


      });

    };

    //fetch FriendList
    updateFriendsList();
  });

});
