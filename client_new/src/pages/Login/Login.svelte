<script>
  import { onMount } from "svelte";
  import { useNavigate } from "svelte-navigator";
  import { user as userStore } from "../../stores/userStore.js";
  import userAuth from "../../utils/userAuth.js";

  const navigate = useNavigate();

  let username = "";
  let password = "";
  let errorMessage = "";

  onMount(() => {
    const unsubscribe = userStore.subscribe((currentUser) => {
      if (currentUser) {
        navigate("/chat");
      }
    });

    return unsubscribe;
  });

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const response = await userAuth.login(username, password);

      if (response.error) {
        errorMessage = response.error;
      } else {
        navigate("/chat");
        console.log("Successfully logged in.");
      }
    } catch (error) {
      errorMessage = error.message;
    }
  }
</script>

<main
  class="min-h-screen-minus-navbar bg-gray-800 py-6 flex flex-col justify-center sm:py-12"
>
  <div class="relative py-3 sm:max-w-xl sm:mx-auto">
    <div
      class="absolute inset-0 bg-gradient-to-r from-red-600 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-lg"
    />
    <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
      <h1 class="mb-4 text-2xl font-bold text-gray-900">Login</h1>

      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <div>
          <label
            for="username"
            class="text-sm font-bold text-gray-600 block mb-2">Username:</label
          >
          <input
            id="username"
            bind:value={username}
            required
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label
            for="password"
            class="text-sm font-bold text-gray-600 block mb-2">Password:</label
          >
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >Login</button
          >
        </div>
      </form>

      {#if errorMessage}
        <p class="mt-4 text-red-500">{errorMessage}</p>
      {/if}
    </div>
  </div>
</main>
