// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        fontFamily: {
          poppins: ['Poppins', 'sans-serif'], // Menambahkan font Poppins ke default sans
        },
        width: {
          200: '100px',
        },
        height: {
          200: '100px',
        },
      },
    },
    plugins:[]
  }