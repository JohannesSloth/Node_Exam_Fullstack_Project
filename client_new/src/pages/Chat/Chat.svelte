<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import chatUtil from "../../utils/chatUtil.js";
  import { user as userStore } from "../../stores/userStore.js";
  import { navigate } from "svelte-navigator";

  let messages = [];
  let newMessage = "";
  let username = "";
  let errorMessage = "";

  let unsubscribeFromUserstore;
  let unsubscribeFromChat;

  async function fetchInitialMessages() {
    messages = await chatUtil.getMessages();
  }

  function setupUserSubscription() {
    unsubscribeFromUserstore = userStore.subscribe((currentUser) => {
      if (currentUser) {
        username = currentUser?.username;
      } else {
        navigate("/login");
      }
    });
  }

  function setupChatSubscription() {
    unsubscribeFromChat = chatUtil.subscribeToChat((newMsg) => {
        console.log("Received message via socketio:", newMsg);
        if (!messages.find((msg) => msg._id === newMsg._id)) {
          messages = [...messages, newMsg];
        }
      
    });
  }

  onMount(async () => {
    try {
      await fetchInitialMessages();
      setupUserSubscription();
      setupChatSubscription();
      console.log("In onMount, UFC: ", unsubscribeFromChat);
    } catch (error) {
      console.error(error);
    }
  });

  onDestroy(() => {
    console.log(
      "In onDestroy: UFC: ",
      unsubscribeFromChat,
      " UFUS: ",
      unsubscribeFromUserstore
    );
    unsubscribeFromChat && unsubscribeFromChat();
    unsubscribeFromUserstore && unsubscribeFromUserstore();
  });

  function handleSendMessage() {
    console.log(
      "Username in handleSendMessage: " +
        username +
        " Message in handleSendMessage: " +
        newMessage
    );
    chatUtil.sendMessage(newMessage, username);
    newMessage = "";
  }
</script>

<main>
  <h1>Chat</h1>

  <div class="chat-messages">
    {#each messages as message (message._id)}
      <p>{message.timestamp} {message.username}: {message.message}</p>
    {/each}
  </div>

  <div class="send-message">
    <input bind:value={newMessage} placeholder="Type a message..." />
    <button on:click={handleSendMessage}>Send</button>
  </div>
</main>
