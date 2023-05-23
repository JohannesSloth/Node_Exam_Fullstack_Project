<script>
  import { Router, Link, Route } from "svelte-navigator";
  import Home from "./pages/Home/Home.svelte";
  import Chat from "./pages/Chat/Chat.svelte";
  import Login from "./pages/Login/Login.svelte";
  import Signup from "./pages/Signup/Signup.svelte";
  import Profile from "./pages/Profile/Profile.svelte";
</script>

<main>
  <Router>
    <nav
      class="bg-gray-800 text-white flex justify-center py-4 px-6 sticky top-0 z-10"
    >
      <Link
        class="bg-red-600 hover:bg-red-700 text-white no-underline ml-2 px-4 py-2 rounded-lg transition-colors duration-200"
        to="/">Home</Link
      >
      <Link
        class="bg-red-600 hover:bg-red-700 text-white no-underline ml-2 px-4 py-2 rounded-lg transition-colors duration-200"
        to="/chat">Chat</Link
      >
      <Link
        class="bg-red-600 hover:bg-red-700 text-white no-underline ml-2 px-4 py-2 rounded-lg transition-colors duration-200"
        to="/login">Login</Link
      >
      <Link
        class="bg-red-600 hover:bg-red-700 text-white no-underline ml-2 px-4 py-2 rounded-lg transition-colors duration-200"
        to="/profile">Profile</Link
      >
      <Link
        class="bg-red-600 hover:bg-red-700 text-white no-underline ml-2 px-4 py-2 rounded-lg transition-colors duration-200"
        to="/signup">Sign Up</Link
      >
    </nav>

    <Route path="/">
      <Home />
    </Route>

    <Route path="/chat">
      <Chat />
    </Route>

    <Route path="/login" primary={false}>
      <Login />
    </Route>

    <Route path="/profile" primary={false}>
      <Profile />
    </Route>

    <Route path="/signup">
      <Signup />
    </Route>
  </Router>
</main>

<style>
</style>
