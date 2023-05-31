<script>
  import { onMount, onDestroy, afterUpdate, tick } from "svelte";
  import { navigate } from "svelte-navigator";
  import DOMPurify from "dompurify";
  import { user as userStore } from "../../stores/userStore.js";
  import chatUtil from "../../utils/chatUtil.js";

  //Declare variables
  let messages = [];
  let newMessage = "";
  let errorMessage = "";
  let user;

  //Declare subscriptions
  let unsubscribeFromUserstore;
  let unsubscribeFromChat;
  let unsubscribeFromEdit;
  let unsubscribeFromDelete;
  let unsubscribeFromUserNotifications;
  let unsubscribeFromUserLeftNotifications;

  //Handle fetching initial messages
  async function fetchInitialMessages() {
    messages = await chatUtil.getMessages();
  }

  //Declare setup functions for subscriptions
  function setupUserSubscription() {
    unsubscribeFromUserstore = userStore.subscribe((currentUser) => {
      if (currentUser) {
        user = currentUser;
      }
    });
  }

  function setupChatSubscription() {
    unsubscribeFromChat = chatUtil.subscribeToChat((newMsg) => {
      if (!messages.find((msg) => msg._id === newMsg._id)) {
        messages = [...messages, newMsg];
        onNewMessage();
      }
    });
  }

  function setupEditSubscribtion() {
    unsubscribeFromEdit = chatUtil.subscribeToEdit((editedMsg) => {
      messages = messages.map((msg) =>
        msg._id === editedMsg._id ? editedMsg : msg
      );
    });
  }

  function setupDeleteSubscription() {
    unsubscribeFromDelete = chatUtil.subscribeToDelete((id) => {
      messages = messages.map((msg) =>
        msg._id === id
          ? {
              ...msg,
              message: "<i>This message was deleted by the user</i>",
              deletedByUser: true,
            }
          : msg
      );
    });
  }

  function setupUserNotificationSubscription() {
    unsubscribeFromUserNotifications =
      chatUtil.subscribeToUserJoinedNotification((username) => {
        const notification = {
          _id: `notification-${Date.now()}`,
          username: "MechaGnomeBot",
          timestamp: new Date(),
          message: `${username} has joined the chat!`,
          flair: "MechaGnomeBot",
        };
        messages = [...messages, notification];
      });
  }

  function setupUserLeftNotificationSubscription() {
    unsubscribeFromUserLeftNotifications =
      chatUtil.subscribeToUserLeftNotification((username) => {
        const notification = {
          _id: `notification-${Date.now()}`,
          username: "MechaGnomeBot",
          timestamp: new Date(),
          message: `${username} has left the chat...`,
          flair: "MechaGnomeBot",
        };
        messages = [...messages, notification];
      });
  }

  //Handle user joined/left notifications
  function handleSendUserJoinedNotification() {
    if (user && user.username) {
      chatUtil.sendUserJoinedNotification(user.username);
    }
  }

  function handleSendUserLeftNotification() {
    if (user && user.username) {
      chatUtil.sendUserLeftNotification(user.username);
    }
  }

  //Svelte lifecycle functions
  onMount(async () => {
    try {
      setupUserSubscription();
      if (!user) {
        navigate("/login");
        return;
      }
      await fetchInitialMessages();
      setupChatSubscription();
      setupEditSubscribtion();
      setupDeleteSubscription();
      setupUserNotificationSubscription();
      setupUserLeftNotificationSubscription();
      if (user) {
        handleSendUserJoinedNotification();
      }
    } catch (error) {
      console.error(error);
    }
  });

  afterUpdate(scrollToBottom);

  onDestroy(() => {
    unsubscribeFromUserstore && unsubscribeFromUserstore();
    unsubscribeFromChat && unsubscribeFromChat();
    unsubscribeFromEdit && unsubscribeFromEdit();
    unsubscribeFromDelete && unsubscribeFromDelete();
    unsubscribeFromUserNotifications && unsubscribeFromUserNotifications();
    unsubscribeFromUserLeftNotifications &&
      unsubscribeFromUserLeftNotifications();
    if (user) {
      handleSendUserLeftNotification();
    }
  });

  //Handle sending, editing and deletion of messages
  function handleSendMessage() {
    errorMessage = "";
    let sanitizedMessage = DOMPurify.sanitize(newMessage);
    chatUtil.sendMessage(user.username, user.flair, sanitizedMessage, (ack) => {
      if (ack.error) {
        errorMessage = ack.error;
      }
    });
    newMessage = "";
  }

  let editId = null;
  let editText = "";

  function startEdit(id, text) {
    editId = id;
    editText = text;
  }

  async function handleEditSubmit(event, id) {
    if (event && event.key !== "Enter") {
      return;
    }

    errorMessage = "";
    let sanitizedMessage = DOMPurify.sanitize(editText);
    chatUtil.editMessage(id, sanitizedMessage, (ack) => {
      if (ack.error) {
        errorMessage = ack.error;
      }
    });
    editId = null;
    editText = "";
  }

  async function handleDeleteMessage(id) {
    errorMessage = "";
    try {
      await chatUtil.deleteMessage(id);
    } catch (error) {
      errorMessage = "Error deleting message: " + error.message;
    }
  }

  //Formatting and parsing helpers
  function formatTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function parseLinks(inputMessage) {
    const urlRegex = /((https?:\/\/)[^\s]+)/g;
    return inputMessage.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
    });
  }

  function parseEmotes(inputMessage) {
    const emoteRegex = /:([a-z0-9]+?):/gi;
    return inputMessage.replace(emoteRegex, (match, emoteName) => {
      return `<img src="/images/betterttv-images/${emoteName}.webp" alt="${emoteName}" class="inline-block" />`;
    });
  }

  function parseAndSanitizeMessage(message) {
    const messageWithParsedLinks = parseLinks(message);
    const messageWithParsedLinksAndEmotes = parseEmotes(messageWithParsedLinks);
    const sanitizedAndParsedMessage = DOMPurify.sanitize(
      messageWithParsedLinksAndEmotes,
      { ADD_ATTR: ["target"] }
    );
    return sanitizedAndParsedMessage;
  }

  //Flair handling
  function getFlairClass(flair) {
    switch (flair) {
      case "Death Knight":
        return "text-[#C41E3A]";
      case "Demon Hunter":
        return "text-[#A330C9]";
      case "Druid":
        return "text-[#FF7C0A]";
      case "Evoker":
        return "text-[#33937F]";
      case "Hunter":
        return "text-[#AAD372]";
      case "Mage":
        return "text-[#3FC7EB]";
      case "Monk":
        return "text-[#00FF98]";
      case "Paladin":
        return "text-[#F48CBA]";
      case "Priest":
        return "text-[#FFFFFF]";
      case "Rogue":
        return "text-[#FFF468]";
      case "Shaman":
        return "text-[#0070DD]";
      case "Warlock":
        return "text-[#8788EE]";
      case "Warrior":
        return "text-[#C69B6D]";
      case "MechaGnomeBot":
        return "text-[#cbd5e1]";
      default:
        return "text-black";
    }
  }

  //Handle chatbox scrolling
  let chatBox;
  let shouldScrollToBottom = true;

  async function onNewMessage() {
    await tick();

    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = chatBox;
    const atBottom = scrollHeight - scrollTop - clientHeight < 5;

    shouldScrollToBottom = atBottom;
  }
</script>

<main
  class="min-h-screen-minus-navbar bg-gray-800 py-6 flex flex-col justify-center sm:py-12"
>
  <div class="relative py-3 sm:w-1/2 sm:mx-auto">
    <div
      class="absolute inset-0 bg-gradient-to-r from-red-600 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-lg"
    />
    <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-10">
      <h1 class="mb-4 text-2xl font-bold text-gray-900">Chat</h1>

      <div
        class="chat-messages overflow-y-scroll h-64 w-full lg:h-96 lg:w-full mb-4 bg-gray-700 rounded-lg p-4"
        bind:this={chatBox}
        on:scroll={onScroll}
      >
        {#each messages as message (message._id)}
          <div class="relative group mb-2">
            <span class="text-sm text-neutral-50"
              >[{formatTime(message.timestamp)}]</span
            >
            <span
              ><img
                src="/images/class-icons/{message.flair}.webp"
                alt="{message.flair} icon"
                class="inline-block mr-2"
                width="20"
                height="20"
              /></span
            >
            <span class="font-bold {getFlairClass(message.flair)}"
              >{message.username}:</span
            >
            <span class="text-neutral-50"
              >{@html parseAndSanitizeMessage(message.message)}</span
            >

            {#if message.username === user.username && !message.deletedByUser}
              {#if message._id === editId}
                <div>
                  <input
                    bind:value={editText}
                    on:keydown={(event) => handleEditSubmit(event, message._id)}
                    class="border rounded p-2 bg-white text-gray-700 shadow"
                  />
                  <button
                    on:click={() => handleEditSubmit(null, message._id)}
                    class="ml-2 bg-blue-500 text-white rounded p-2 shadow"
                    >OK</button
                  >
                </div>
              {:else}
                <div>
                  <button
                    on:click={() => startEdit(message._id, message.message)}
                    class="text-neutral-50 absolute right-14 top-1/2 transform -translate-y-1/2 invisible group-hover:visible"
                  >
                    Edit
                  </button>
                  <button
                    on:click|preventDefault={() =>
                      handleDeleteMessage(message._id)}
                    class="text-neutral-50 absolute right-0 top-1/2 transform -translate-y-1/2 invisible group-hover:visible"
                  >
                    Delete
                  </button>
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>

      {#if errorMessage}
        <div class="mb-4 text-red-500">{errorMessage}</div>
      {/if}

      <form
        on:submit|preventDefault={handleSendMessage}
        class="send-message flex items-center"
      >
        <input
          bind:value={newMessage}
          class="flex-grow mr-4 py-2 px-4 rounded-lg border-2 border-gray-300"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          class="py-2 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >Send</button
        >
      </form>
    </div>
  </div>
</main>
