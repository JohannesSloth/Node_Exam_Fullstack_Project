<script>
  import { Link } from "svelte-navigator";
</script>

<main
  class="min-h-screen-minus-navbar bg-gray-800 py-6 flex flex-col justify-center sm:py-12"
>
  <div class="relative py-3 sm:max-w-xl sm:mx-auto">
    <div
      class="absolute inset-0 bg-gradient-to-r from-red-600 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-lg"
    />
    <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
      <h1 class="mb-4 text-2xl font-bold text-gray-900">WowChatter</h1>

      <p class="mb-4 text-gray-700">
        Hello and welcome to the WowChatter homepage!
      </p>

      <Link
        to="/chat"
        class="inline-block py-2 px-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
        >Go to Chat</Link
      >
    </div>
  </div>
</main>
