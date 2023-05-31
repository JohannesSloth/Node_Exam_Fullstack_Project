<script>
  import { onMount, onDestroy, afterUpdate, tick } from "svelte";
  import { navigate } from "svelte-navigator";
  import DOMPurify from "dompurify";
  import { user as userStore } from "../../stores/userStore.js";
  import chatMessageUtil from "../../utils/chatMessageUtil.js";
  import { classColour } from "../../utils/classColourUtil.js";
  import {
    formatTime,
    parseAndSanitizeMessage,
  } from "../../utils/parseFormatUtil.js";

  let user;
  let messages = [];
  let newMessage = "";
  let errorMessage = "";

  let unsubscribeFromUserstore;
  let unsubscribeFromNewMessages;
  let unsubscribeFromEditedMessages;
  let unsubscribeFromDeletedMessages;
  let unsubscribeFromUserJoinedNotifications;
  let unsubscribeFromUserLeftNotifications;

  async function fetchPreviousMessages() {
    messages = await chatMessageUtil.getPreviousMessages();
  }

  function setupUserSubscription() {
    unsubscribeFromUserstore = userStore.subscribe((currentUser) => {
      if (currentUser) {
        user = currentUser;
      }
    });
  }

  function setupNewMessageSubscription() {
    unsubscribeFromNewMessages = chatMessageUtil.subscribeToNewMessages(
      (newMsg) => {
        if (!messages.find((msg) => msg._id === newMsg._id)) {
          messages = [...messages, newMsg];
          onNewMessage();
        }
      }
    );
  }

  function setupEditedMessagesSubscription() {
    unsubscribeFromEditedMessages = chatMessageUtil.subscribeToEditedMessages(
      (editedMsg) => {
        messages = messages.map((msg) =>
          msg._id === editedMsg._id ? editedMsg : msg
        );
      }
    );
  }

  function setupDeletedMessagesSubscription() {
    unsubscribeFromDeletedMessages = chatMessageUtil.subscribeToDeletedMessages(
      (id) => {
        messages = messages.map((msg) =>
          msg._id === id
            ? {
                ...msg,
                message: "<i>This message was deleted by the user</i>",
                deletedByUser: true,
              }
            : msg
        );
      }
    );
  }

  function setupUserJoinedNotificationSubscription() {
    unsubscribeFromUserJoinedNotifications =
      chatMessageUtil.subscribeToUserJoinedNotification((username) => {
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
      chatMessageUtil.subscribeToUserLeftNotification((username) => {
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

  function handleSendUserJoinedNotification() {
    if (user && user.username) {
      chatMessageUtil.sendUserJoinedNotification(user.username);
    }
  }

  function handleSendUserLeftNotification() {
    if (user && user.username) {
      chatMessageUtil.sendUserLeftNotification(user.username);
    }
  }

  onMount(async () => {
    try {
      setupUserSubscription();
      if (!user) {
        navigate("/login");
        return;
      }
      await fetchPreviousMessages();
      setupNewMessageSubscription();
      setupEditedMessagesSubscription();
      setupDeletedMessagesSubscription();
      setupUserJoinedNotificationSubscription();
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
    unsubscribeFromNewMessages && unsubscribeFromNewMessages();
    unsubscribeFromEditedMessages && unsubscribeFromEditedMessages();
    unsubscribeFromDeletedMessages && unsubscribeFromDeletedMessages();
    unsubscribeFromUserJoinedNotifications &&
      unsubscribeFromUserJoinedNotifications();
    unsubscribeFromUserLeftNotifications &&
      unsubscribeFromUserLeftNotifications();
    if (user) {
      handleSendUserLeftNotification();
    }
  });

  function handleSendMessage() {
    errorMessage = "";
    let sanitizedMessage = DOMPurify.sanitize(newMessage);
    chatMessageUtil.sendMessage(
      user.username,
      user.flair,
      sanitizedMessage,
      (ack) => {
        if (ack.error) {
          errorMessage = ack.error;
        }
      }
    );
    newMessage = "";
  }

  let editId = null;
  let editText = "";

  function startEdit(id, text) {
    editId = id;
    editText = text;
  }

  async function handleEditMessage(event, id) {
    if (event && event.key !== "Enter") {
      return;
    }
    errorMessage = "";
    let sanitizedMessage = DOMPurify.sanitize(editText);
    chatMessageUtil.editMessage(id, sanitizedMessage, (ack) => {
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
      await chatMessageUtil.deleteMessage(id);
    } catch (error) {
      errorMessage = "Error deleting message: " + error.message;
    }
  }

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
            <span class="font-bold {classColour(message.flair)}"
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
                    on:keydown={(event) =>
                      handleEditMessage(event, message._id)}
                    class="border rounded p-2 bg-white text-gray-700 shadow"
                  />
                  <button
                    on:click={() => handleEditMessage(null, message._id)}
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
