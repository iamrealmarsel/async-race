import { Page, UpdateType } from '../helpers/consts';
import { IState } from '../helpers/types';
import { changeWinnerPage } from '../store/actions';
import appStore from '../store/app-store';
import ElementAbstract from './element-abstract';
import WinnerCaptionComponent from './winner-caption-component';
import WinnerComponent from './winner-component';

class WinnersComponent extends ElementAbstract {
  constructor() {
    super();
    this.redraw = this.redraw.bind(this);

    appStore.addObserver(this.redraw);

    this.generateElement();
    this.handleWinnerPageChange();
  }

  private redraw(state: IState, updateType: UpdateType) {
    if (updateType === UpdateType.CHANGE_WINNER_PAGE) {
      this.updatePage(state);
    } else if (updateType === UpdateType.UPDATE_CAR) {
      this.updatePage(state);
    }
  }

  public removeObserver() {
    appStore.removeObserver(this.redraw);
  }

  private updatePage(state: IState) {
    const { totalWinners, currentWinners, winnersPageNumber } = state;
    (
      this.getElement().querySelector('.js-total-winners') as HTMLElement
    ).innerText = `${totalWinners}`;
    const winnerCars = this.getElement().querySelector('.js-winners-cars') as HTMLElement;
    winnerCars.innerHTML = '';
    currentWinners.forEach((winner, i) =>
      winnerCars.append(new WinnerComponent(winner, i + 1).getElement())
    );
    (
      this.getElement().querySelector('.js-winner-page') as HTMLElement
    ).innerText = `${winnersPageNumber}`;

    const winnerCaptionElement = this.getElement().querySelector(
      '.js-winner-caption'
    ) as HTMLElement;
    winnerCaptionElement.innerHTML = '';
    const winnerCaption = new WinnerCaptionComponent().getElement();
    winnerCaptionElement.append(winnerCaption);
  }

  private handleWinnerPageChange() {
    this.getElement()
      .querySelector('.js-prev')
      ?.addEventListener('click', () => {
        appStore.dispatch(changeWinnerPage(Page.PREV));
      });
    this.getElement()
      .querySelector('.js-next')
      ?.addEventListener('click', () => {
        appStore.dispatch(changeWinnerPage(Page.NEXT));
      });
  }

  private generateElement(): void {
    const { currentWinners } = appStore.getData();

    const winners = currentWinners.map((winner, i) =>
      new WinnerComponent(winner, i + 1).getElement()
    );
    this.getElement()
      .querySelector('.js-winners-cars')
      ?.append(...winners);

    const winnerCaption = new WinnerCaptionComponent().getElement();
    this.getElement().querySelector('.js-winner-caption')?.append(winnerCaption);
  }

  public getHTML(): string {
    const { totalWinners, winnersPageNumber } = appStore.getData();

    return `
    <div class="winners">
      <h2 class="winners__title">Winners (<span class="js-total-winners">${totalWinners}</span>)</h2>
      <span class="winners__caption">Page №<span class="js-winner-page">${winnersPageNumber}</span></span>
      <div class="winners__table">
        <div class="winners__caption js-winner-caption">
        </div>
        <ul class="winners__cars js-winners-cars">
        </ul>
      </div>
      <div class="winners__pages">
        <button class="btn js-prev" type="button">Prev</button>
        <button class="btn js-next" type="button">Next</button>
      </div>
    </div>

    `;
  }
}

export default WinnersComponent;
