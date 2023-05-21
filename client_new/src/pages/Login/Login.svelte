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

<main>
  <h1>Login</h1>

  <form on:submit|preventDefault={handleLogin}>
    <label for="username">Username:</label>
    <input id="username" bind:value={username} required />

    <label for="password">Password:</label>
    <input id="password" type="password" bind:value={password} required />

    <button type="submit">Login</button>
  </form>

  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}
</main>
