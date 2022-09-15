import ElementAbstract from './element-abstract';
import GarageComponent from './garage-component';
import WinnersComponent from './winners-component';

class AppComponent extends ElementAbstract {
  private garageComponent: GarageComponent | undefined;
  private winnersComponent: WinnersComponent | undefined;
  private generatedElement: boolean;

  constructor() {
    super();
    this.generatedElement = false;
    this.setBtnsClick();
  }

  public getElement(): HTMLElement {
    if (!this.generatedElement) {
      this.garageComponent = new GarageComponent();
      this.winnersComponent = new WinnersComponent();

      super.getElement().append(this.garageComponent.getElement());
      super.getElement().append(this.winnersComponent.getElement());

      this.generatedElement = true;
    }

    return super.getElement();
  }

  public removeObserver() {
    this.garageComponent?.removeObserver();
    this.winnersComponent?.removeObserver();
  }

  private setBtnsClick() {
    this.getElement()
      .querySelector('.js-btn-garage')
      ?.addEventListener('click', () => {
        (this.getElement().querySelector('.garage') as HTMLElement).style.display = 'block';
        (this.getElement().querySelector('.winners') as HTMLElement).style.display = 'none';
      });

    this.getElement()
      .querySelector('.js-btn-winners')
      ?.addEventListener('click', () => {
        (this.getElement().querySelector('.garage') as HTMLElement).style.display = 'none';
        (this.getElement().querySelector('.winners') as HTMLElement).style.display = 'block';
      });
  }

  public getHTML(): string {
    return `
    <main>
      <div class="tabs">
        <button class="tabs__garage btn js-btn-garage" type="button">Garage</button>
        <button class="tabs__winners btn js-btn-winners" type="button">Winners</button>
      </div>
    </main>
    `;
  }
}

export default AppComponent;
