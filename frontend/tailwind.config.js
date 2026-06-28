export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth:{ 50:'#f6f3ee',100:'#e8e0d0',200:'#d4c5a9',300:'#b9a07a',400:'#a08050',500:'#7a5f38',600:'#5e4528',700:'#453018',800:'#2e1f0e',900:'#180f06' },
        leaf:{ 50:'#f0f7ee',100:'#d8edcf',200:'#aed9a1',300:'#7dc070',400:'#52a645',500:'#3a8a2e',600:'#2a6e20',700:'#1c5214',800:'#11370c',900:'#071c06' },
        sky:{ 50:'#eff8ff',100:'#d6edfc',200:'#a8d9f8',300:'#6bbef2',400:'#2ea0e8',500:'#1585cc',600:'#0e68a8',700:'#094e80',800:'#063659',900:'#03192c' },
      },
      fontFamily:{ sans:['Inter','system-ui','sans-serif'] },
    },
  },
  plugins:[],
}
