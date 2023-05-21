<script>
  import { useNavigate } from "svelte-navigator";
  import userAuth from "../../utils/userAuth.js";

  const navigate = useNavigate();

  let username = "";
  let email = "";
  let password = "";
  let errorMessage = "";

  async function handleSignup(event) {
    event.preventDefault();

    try {
      const response = await userAuth.signup(username, email, password);

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

<main>
  <h1>Signup</h1>
  <form on:submit|preventDefault={handleSignup}>
    <label for="username">Username:</label>
    <input id="username" bind:value={username} required />

    <label for="email">Email:</label>
    <input id="email" type="email" bind:value={email} required />

    <label for="password">Password:</label>
    <input id="password" type="password" bind:value={password} required />

    <button type="submit">Sign up</button>
  </form>

  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}
</main>
