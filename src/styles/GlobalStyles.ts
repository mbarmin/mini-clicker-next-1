import { createGlobalStyle } from 'styled-components';
import { reset } from 'styled-reset';


const GlobalStyles = createGlobalStyle`

  ${reset}

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #__next {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--tg-theme-bg-color, #ffffff);
    color: var(--tg-theme-text-color, #000000);
	height: 100vh;
    overflow: hidden;
    padding: 20px;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: var(--tg-theme-link-color, inherit);
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }

  /* Утилитарный класс для скролла. Стили для скролла внутри контейнера игры */
  .scroll-container {
    overflow-y: auto;
    height: 100%;
	padding-bottom: 20px;
    -webkit-overflow-scrolling: touch;
  }
`;

export default GlobalStyles;


