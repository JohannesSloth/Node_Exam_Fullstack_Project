<script>
  import { onMount } from "svelte";
  import userAuthUtil from "../../utils/userAuthUtil.js";
  import { navigate } from "svelte-navigator";
  import { user as userStore } from "../../stores/userStore.js";

  let user = null;
  let errorMessage = "";
  let statusMessage = "";

  const flairs = [
    "No class chosen",
    "Warrior",
    "Paladin",
    "Hunter",
    "Rogue",
    "Priest",
    "Shaman",
    "Mage",
    "Warlock",
    "Monk",
    "Druid",
    "Demon Hunter",
    "Death Knight",
    "Evoker",
  ];

  let flair = "";

  onMount(() => {
    const unsubscribe = userStore.subscribe((currentUser) => {
      if (currentUser) {
        user = currentUser;
        flair = user.flair || flairs[0];
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  });

  async function handleUpdateFlair() {
    try {
      const response = await userAuthUtil.updateFlair(flair);

      if (response.error) {
        errorMessage = response.error;
      } else if (response.user) {
        flair = response.user.flair;
        statusMessage = "Sucessfully updated flair.";
      }
    } catch (error) {
      errorMessage = error.message;
    }
  }
  
  async function handleLogout() {
    try {
      const response = await userAuthUtil.logout();

      if (response.error) {
        errorMessage = response.error;
      } else {
        navigate("/login");
      }
    } catch (error) {
      errorMessage = "An error occurred logging out. Please try again.";
    }
  }

  async function handleDeleteUserAccount() {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await userAuthUtil.deleteUserAccount();

      if (response.error) {
        errorMessage = response.error;
      } else {
        navigate("/login");
      }
    } catch (error) {
      errorMessage = "An error occurred deleting your account. Please try again.";
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
      {#if user}
        <h1 class="mb-4 text-2xl font-bold text-gray-900">
          {user.username}'s Profile
        </h1>
        <p class="text-gray-700">Email: {user.email}</p>

        <form
          on:submit|preventDefault={handleUpdateFlair}
          class="space-y-6 mt-4"
        >
          <div>
            <label
              for="flair"
              class="text-sm font-bold text-gray-600 block mb-2"
              >Class Flair:</label
            >
            <select
              id="flair"
              bind:value={flair}
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            >
              {#each flairs as classFlair}
                <option>{classFlair}</option>
              {/each}
            </select>
          </div>
          
          <p class="mt-4 text-green-500">{statusMessage}</p>
          <p class="mt-4 text-red-500">{errorMessage}</p>

          <div>
            <button
              type="submit"
              class="w-full py-2 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
              >Update Flair</button
            >
          </div>
        </form>

        <div class="mt-4">
          <button
            on:click|preventDefault={handleDeleteUserAccount}
            class="w-full py-2 px-4 bg-purple-900 text-white rounded-lg shadow-md hover:bg-red-900"
          >Delete Account</button>
        </div>
        


        <div class="mt-4">
          <button
            on:click|preventDefault={handleLogout}
            class="w-full py-2 px-4 bg-red-800 text-white rounded-lg shadow-md hover:bg-red-900"
            >Logout</button
          >
        </div>
      {:else if errorMessage}
        <p class="mt-4 text-red-500">{errorMessage}</p>
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
  </div>
</main>
