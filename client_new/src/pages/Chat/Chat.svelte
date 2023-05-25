<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { tick } from "svelte";
  import chatUtil from "../../utils/chatUtil.js";
  import { user as userStore } from "../../stores/userStore.js";
  import { navigate } from "svelte-navigator";
  import DOMPurify from "dompurify"

  let messages = [];
  let newMessage = "";
  let user;
  let errorMessage = "";

  let unsubscribeFromUserstore;
  let unsubscribeFromChat;
  let unsubscribeFromDelete;

  async function fetchInitialMessages() {
    messages = await chatUtil.getMessages();
  }

  function setupUserSubscription() {
    unsubscribeFromUserstore = userStore.subscribe((currentUser) => {
      console.log("currentUser: ", currentUser);
      if (currentUser) {
        user = currentUser;
        console.log("User: ", user);
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
        onNewMessage();
      }
    });
  }

  function setupDeleteSubscription() {
    unsubscribeFromDelete = chatUtil.subscribeToDelete((id) => {
      console.log("Received deletion via socketio:", id);
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

  onMount(async () => {
    try {
      setupUserSubscription();
      await fetchInitialMessages();
      scrollToBottom();
      setupChatSubscription();
      setupDeleteSubscription();
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
    unsubscribeFromUserstore && unsubscribeFromUserstore();
    unsubscribeFromChat && unsubscribeFromChat();
    unsubscribeFromDelete && unsubscribeFromDelete();
  });

  function handleSendMessage() {
    console.log("Unsanitized Message in handleSendMessage: ", newMessage);
    let sanitizedMessage = DOMPurify.sanitize(newMessage);
    console.log("Sanitized Message in handleSendMessage: ", sanitizedMessage);
    chatUtil.sendMessage(user.username, user.flair, sanitizedMessage);
    newMessage = "";
  }

  async function handleDeleteMessage(id) {
    try {
      await chatUtil.deleteMessage(id);
    } catch (error) {
      errorMessage = "Error deleting message.";
    }
  }

  function formatTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
    const atBottom = scrollHeight - scrollTop === clientHeight;

    shouldScrollToBottom = atBottom;
  }

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
      default:
        return "text-black";
    }
  }

  function parseEmotes(message) {
    const emoteRegex = /:(.*?):/g;
    let parsedMessage = message.replace(emoteRegex, (match, emoteName) => {
        return `<img src="/images/betterttv-images/${emoteName}.webp" alt="${emoteName}" class="inline-block" />`;
    });
    return parsedMessage;
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
            <span class="text-neutral-50">{@html parseEmotes(message.message)}</span>

            {#if message.username === user.username && !message.deletedByUser}
              <button
                on:click|preventDefault={() => handleDeleteMessage(message._id)}
                class="text-neutral-50 absolute right-0 top-1/2 transform -translate-y-1/2 invisible group-hover:visible"
              >
                Delete
              </button>
            {/if}
          </div>
        {/each}
      </div>

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
