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

<main
  class="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12"
>
  <div class="relative py-3 sm:max-w-xl sm:mx-auto">
    <div
      class="absolute inset-0 bg-gradient-to-r from-red-600 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-lg"
    />
    <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
      <h1 class="mb-4 text-2xl font-bold text-gray-900">Chat</h1>

      <div
        class="chat-messages overflow-y-scroll h-64 mb-4 bg-gray-100 rounded-lg p-4"
      >
        {#each messages as message (message._id)}
          <div class="mb-2">
            <span class="text-sm text-gray-600">[{message.timestamp}]</span>
            <span class="font-bold text-gray-900">{message.username}:</span>
            <span class="text-gray-700">{message.message}</span>
          </div>
        {/each}
      </div>

      <div class="send-message flex items-center">
        <input
          bind:value={newMessage}
          class="flex-grow mr-4 py-2 px-4 rounded-lg border-2 border-gray-300"
          placeholder="Type a message..."
        />
        <button
          on:click={handleSendMessage}
          class="py-2 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >Send</button
        >
      </div>
    </div>
  </div>
</main>
