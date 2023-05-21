<script>
  import { onMount } from "svelte";
  import userAuth from "../../utils/userAuth.js";
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

  async function handleLogout() {
    try {
      const response = await userAuth.logout();

      if (response.error) {
        errorMessage = response.error;
      } else {
        console.log("Successfully logged out");
        navigate("/login");
      }
    } catch (error) {
      errorMessage = "An error occurred logging out. Please try again.";
    }
  }

  async function handleUpdateFlair() {
    try {
      const response = await userAuth.updateFlair(flair);

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
</script>

<main>
  {#if user}
    <h1>{user.username}'s Profile</h1>
    <p>Email: {user.email}</p>

    <form on:submit|preventDefault={handleUpdateFlair}>
      <label for="flair">Class Flair:</label>
      <select id="flair" bind:value={flair}>
        {#each flairs as classFlair}
          <option>{classFlair}</option>
        {/each}
      </select>
      <button type="submit">Update Flair</button>
    </form>
    <p>{statusMessage}</p>
    <p>{errorMessage}</p>
    <button on:click|preventDefault={handleLogout}>Logout</button>
  {:else if errorMessage}
    <p>{errorMessage}</p>
  {:else}
    <p>Loading...</p>
  {/if}
</main>
