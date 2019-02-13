$(document).ready(function () {
  let userId = null;
  let chatId = null;

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
                  template = `<div class="user-badge noselect" user-id="${result[0].id}">${result[0].username}</div>`;
                } else {
                  template = `<div class="user-badge noselect" user-id="${result[0].id}">${result[0].username}<button type="button" class="cntrl send-req">+</button></div>`;
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

    //Create chat button listener
    $("#createChat").on("click", function () {
      const selector = $("#createChatDiv");
      const chatsDiv = $("#chats");
      const button = $(this);

      if(selector.css("display") == "none"){
        selector.show();
        chatsDiv.hide();
        button.val("Cancel");
      }
      else {
        selector.hide();
        chatsDiv.show();
        button.val("Create chat");
      }
    });

    //Create chat form listener
    $("#createChatForm").on("submit", function () {
      event.preventDefault();
      const name = $(this).find( "input[name='chatName']" ).val();
      $.ajax({
        type: "POST",
        url: `/v1/${userId}/chat/createChat`,
        data: { chatName: name },
        success: function(){
          updateChatList();
          $("#createChat").trigger("click");
        }
      });
    });

    //Remove chat button listener
    $(".delete_chat").on("click", function () {
      const chat_id = $(this).parent().attr( "chat_id" );

      if(chat_id != ""){
        $.ajax({
          url: `/v1/${userId}/chat/${chatId}/removeChat`,
          type: 'PUT',
          success: function(){
            $(".history").addClass("disabled");
            $(".chat_name").text("");
            $(".chat_settings").attr("chat_id", "");

            updateChatList();
          }
        });
      }

    });

    //Rename chat button listener
    $(".rename_chat").on("click", function () {
      const selector = $("#renameChat");

      if(selector.css("display") == "none"){
        selector.show();
      }
      else {
        selector.hide();
      }
    });

    //Chat rename script
    $("#renameChatForm").on("submit", function () {
      event.preventDefault();
      const chat_id = $(".rename_chat").parent().attr( "chat_id" );
      const newName = $(this).find( "input[name='chatName']" ).val();

      if(chat_id != ""){
        $.ajax({
          url: `/v1/${userId}/chat/${chatId}/renameChat`,
          data: { name: newName },
          type: 'PUT',
          success: function(){
            $(".chat_name").text(newName);
            $("#renameChat").hide();

            updateChatList();
          }
        });
      }

    });

    //Chat add user button listener
    $(".add_usr").on("click", function () {
      const selector = $("#addUserChat");

      if(selector.css("display") == "none"){
        selector.show();
        viewFriends();
      }
      else {
        selector.hide();
      }
    });

    //Check friends that in chat
    const checkFriendsInChat = function (){
      return new Promise(function(resolve, reject) {
        let users = [];
        $.ajax({
          url: `/v1/chat/${chatId}/getUsers`,
          type: 'GET',
          success: function(result){
            result.forEach(function(item, i, data) {
              users.push(item.id);
            });
          }
        }).done(resolve(users));
      });
    }

    //Add user to chat: View all friends
    let viewFriends = function () {
      const selector = $('#friendResultChat');
      selector.empty();
      checkFriendsInChat().then( inChat => {
        $.ajax({
          url: `/v1/user/${userId}/friends`,
          type: 'GET',
          success: function(result){
            result.forEach(function(item, i, data) {
              if( !inChat.includes(item.id) ){
                const template = `<div class="chat-badge noselect" user-id="${item.id}">${item.username}<button type="button" class="cntrl addFriendChat">+</button></div>`;
                selector.append(template);
              } else {
                const template = `<div class="chat-badge noselect" user-id="${item.id}">${item.username}&nbsp;✔</div>`;
                selector.append(template);
              }
            });
          }
        }).done( function () {
          $(".addFriendChat").on("click", function () {
            const button = $(this);
            const id = button.parent().attr("user-id");

            $.ajax({
              url: `/v1/${userId}/chat/${chatId}/inviteChat`,
              type: 'PUT',
              data: { user_id: id },
              success: function(){
                $("#addUserChat").hide();
              }
            });
          });
        });
      });
    };

    //Remove chat button listener
    $(".leave_chat").on("click", function () {
      const chat_id = $(this).parent().attr( "chat_id" );

      if(chat_id != ""){
        $.ajax({
          url: `/v1/${userId}/chat/${chatId}/leaveChat`,
          type: 'PUT',
          success: function(){
            $(".history").addClass("disabled");
            $(".chat_name").text("");
            $(".chat_settings").attr("chat_id", "");

            updateChatList();
          }
        });
      }

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
              const template = `<div class="user-badge noselect" user-id="${item.id}">${item.username}<button type="button" class="cntrl unfriend">✘</button></div>`;
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
              const template = `<div class="user-badge noselect" user-id="${item.id}">${item.username}</div>`;
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
              const template = `<div class="user-badge noselect" user-id="${item.id}">${item.username}<button type="button" class="cntrl decline-req">✘</button><button type="button" class="cntrl accept-req">✔</button></div>`;
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

    //ChatList funcs
    let updateChatList = function() {

      //ChatList
      let chatList = $.ajax({
        url: `/v1/${userId}/chat/`,
        type: 'GET',
        success: function(result){
          const selector = $('#chats');
          selector.empty();
          if(result != ""){
            const data = result;
            selector.append("<hr>");
            data.forEach(function(item, i, data) {
              const template = `<div class="chat-badge noselect" chat-id="${item.id}">${item.name}<button type="button" class="cntrl chat">💬</button></div>`;
              selector.append(template);
            });
          } else {
            selector.append("<hr><h5>Empty chat list</h5>");
          }
        }
      });

      chatList.done( function () {
        //Chat click function
        $(".chat-badge").on("click", function () {
          const button = $(this);
          const nav = $("#chatSettings");
          const title = $(".chat_name");
          const id = button.attr("chat-id");

          $(".chat_settings").attr("chat_id", id);
          $(".history").removeClass("disabled");
          title.text(button.text());
          chatId = id;

          const selector = $("#chatWindow");
          selector.empty();
          selector.scrollTop(selector[0].scrollHeight);
          const fetchHistory = $.ajax({
            url: `/v1/${userId}/chat/${chatId}/loadMessages`,
            type: 'POST',
            success: function(result){
              result.forEach( function(item) {
                let template = `<div class="messageDiv" message-id="${item.id}"><p>${item.message}</p><span class="user">${item.User.username}</span><span class="time">${moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span></div>`;
                selector.append(template);
              });
            }
          });

          //WebSocket init
          const webSocketAddr = window.location.origin.replace(/^http/, 'ws');;
          const ws = new WebSocket(`${webSocketAddr}/echo/${chatId}`);

          let printMessage = function ( text ) {
            let template = `<div class="messageDiv" message-id=""><p>${text}</p><span class="user"></span><span class="time"></span></div>`;
            $("#chatWindow").append(template);
          }

          ws.onmessage = response => printMessage( response.data );

          $(".messageForm").on("submit", function () {
            event.preventDefault();
            const text = $(this).find( "input[name='message']" ).val();
            ws.send(text);
            $(this).find( "input[name='message']" ).val("");
          });

        });
      });

    };

    //fetch FriendList
    updateFriendsList();
    updateChatList();
  });

});
