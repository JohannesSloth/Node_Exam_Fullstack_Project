/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      minHeight: {
        'screen-minus-navbar': 'calc(100vh - 4.5rem)',
      },
    },
  },
  plugins: [],
}

