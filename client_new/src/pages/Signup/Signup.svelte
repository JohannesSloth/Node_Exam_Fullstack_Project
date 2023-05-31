<script>
  import { useNavigate } from "svelte-navigator";
  import userAuthUtil from "../../utils/userAuthUtil.js";

  const navigate = useNavigate();

  let username = "";
  let email = "";
  let password = "";
  let errorMessage = "";

  async function handleSignup(event) {
    event.preventDefault();

    try {
      const response = await userAuthUtil.signup(username, email, password);

      if (response.error) {
        errorMessage = response.error;
      } else {
        navigate("/profile");
        console.log("Successfully signed up.");
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
      <h1 class="mb-4 text-2xl font-bold text-gray-900">Signup</h1>

      <form on:submit|preventDefault={handleSignup} class="space-y-6">
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
          <label for="email" class="text-sm font-bold text-gray-600 block mb-2"
            >Email:</label
          >
          <input
            id="email"
            type="email"
            bind:value={email}
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
            >Sign up</button
          >
        </div>
      </form>

      {#if errorMessage}
        <p class="mt-4 text-red-500">{errorMessage}</p>
      {/if}
    </div>
  </div>
</main>
