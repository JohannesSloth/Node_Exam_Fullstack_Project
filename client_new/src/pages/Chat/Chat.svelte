<script>
  import { onMount } from "svelte";
  import chatUtil from "../../utils/chatUtil.js";
  import { user as userStore } from "../../stores/userStore.js";
  import { navigate } from "svelte-navigator";

  let messages = [];
  let newMessage = "";
  let username = "";
  let errorMessage = "";

  onMount(async () => {
    try {
      const unsubscribe = userStore.subscribe((currentUser) => {
        if (currentUser) {
          username = currentUser?.username;
        } else {
          navigate("/login");
        }
      });
      unsubscribe();
      messages = await chatUtil.getMessages();
      chatUtil.subscribeToChat((error, newMessage) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Received message via socketio:', newMessage);
        messages = [...messages, newMessage];
      }
    });

    } catch (error) {
      console.error(error);
    }
  });

  async function handleSendMessage() {
    try {
      console.log(
        "Username in handleSendMessage: " +
          username +
          " Message in handleSendMessage: " +
          newMessage
      );
      const response = await chatUtil.sendMessage(newMessage, username);
      if (response.error) {
        errorMessage = response.error;
      } else {
        console.log("response.message:", response.message);
        //messages = [...messages, response.message];
        newMessage = "";
      }
    } catch (error) {
      console.error(error);
    }
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
