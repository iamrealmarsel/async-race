import AppComponent from './components/app-component';
import { UpdateType } from './helpers/consts';
import { IState } from './helpers/types';
import { init } from './store/actions';
import appStore from './store/app-store';

class App {
  private parentElement: HTMLElement;
  private appComponent: AppComponent | undefined;

  constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
    appStore.addObserver(this.redraw.bind(this));
  }

  private redraw(_state: IState, updateType: UpdateType) {
    if (updateType === UpdateType.INIT) {
      if (this.appComponent) {
        this.appComponent.removeElement();
        this.appComponent.removeObserver();
      }

      this.appComponent = new AppComponent();
      this.parentElement.prepend(this.appComponent.getElement());
    }
  }

  public async init() {
    appStore.dispatch(init());

    this.appComponent = new AppComponent();
    this.parentElement.prepend(this.appComponent.getElement());
  }
}

export default App;
