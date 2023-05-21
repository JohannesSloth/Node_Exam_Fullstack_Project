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
    <nav>
      <Link to="/">Home</Link>
      <Link to="/chat">Chat</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/signup">Sign Up</Link>
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
