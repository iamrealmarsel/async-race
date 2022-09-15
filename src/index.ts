import App from './app';
import './sass/main.scss';

const rootElement = document.body as HTMLElement;
const app = new App(rootElement);

app.init();
