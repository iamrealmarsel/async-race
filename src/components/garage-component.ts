import { Notifications, Page, UpdateType } from '../helpers/consts';
import { IState } from '../helpers/types';
import { randomizeColor } from '../helpers/utils';
import {
  addWinner,
  changePage,
  createCar,
  deleteSelectedCar,
  generate100Cars,
  updateSelectedCar,
} from '../store/actions';
import appStore from '../store/app-store';
import ElementAbstract from './element-abstract';
import TrackComponent from './track-component';

class GarageComponent extends ElementAbstract {
  private selectedCar: { id: number; name: string } | null;
  private tracksComponents: TrackComponent[];

  constructor() {
    super();
    this.selectedCar = null;
    this.tracksComponents = [];

    this.redraw = this.redraw.bind(this);
    appStore.addObserver(this.redraw);

    this.selectClickHandler = this.selectClickHandler.bind(this);
    this.deleteClickHandler = this.deleteClickHandler.bind(this);
    this.disableReset = this.disableReset.bind(this);

    this.generateElement();
    this.handleGenerate100Cars();
    this.handlePageChange();
    this.handleCreateCar();
    this.handleUpdateCar();
    this.handleRace();
    this.handleReset();
    this.handleCloseModal();
  }

  private redraw(state: IState, updateType: UpdateType) {
    if (updateType === UpdateType.CHANGE_GARAGE_PAGE) {
      this.updatePage(state);
    } else if (updateType === UpdateType.CREATE_CAR) {
      this.resetCreateControl();
      this.updatePage(state);
    } else if (updateType === UpdateType.UPDATE_CAR) {
      this.resetUpdateControl();
      this.updatePage(state);
    }
  }

  public removeObserver() {
    appStore.removeObserver(this.redraw);
  }

  private disableElements(bool: boolean) {
    (this.getElement().querySelector('.js-create-name') as HTMLInputElement).disabled = bool;
    (this.getElement().querySelector('.js-create-color') as HTMLInputElement).disabled = bool;
    (this.getElement().querySelector('.js-create-car') as HTMLInputElement).disabled = bool;
    (this.getElement().querySelector('.js-prev') as HTMLButtonElement).disabled = bool;
    (this.getElement().querySelector('.js-next') as HTMLButtonElement).disabled = bool;
    (this.getElement().querySelector('.js-generate100cars') as HTMLButtonElement).disabled = bool;
  }

  private showWinnerModal(name: string, time: number) {
    const winnerModalElement = this.getElement().querySelector('.js-garage-modal') as HTMLElement;
    (winnerModalElement.querySelector('.js-garage-name') as HTMLElement).innerText = name;
    (winnerModalElement.querySelector('.js-garage-time') as HTMLElement).innerText =
      time === 0 ? '' : `${time} s`;
    winnerModalElement.style.display = 'flex';
  }

  private hideWinnerModal() {
    const winnerModalElement = this.getElement().querySelector(
      '.js-garage-modal'
    ) as HTMLInputElement;
    winnerModalElement.style.display = 'none';
  }

  private disableReset(bool: boolean) {
    (this.getElement().querySelector('.js-reset') as HTMLButtonElement).disabled = bool;
    (this.getElement().querySelector('.js-race') as HTMLButtonElement).disabled = !bool;
  }

  private handleCloseModal() {
    (this.getElement().querySelector('.js-modal-close') as HTMLButtonElement).addEventListener(
      'click',
      () => this.hideWinnerModal()
    );
  }

  private handleRace() {
    this.getElement()
      .querySelector('.js-race')
      ?.addEventListener('click', async (e) => {
        (e.currentTarget as HTMLButtonElement).disabled = true;
        this.disableElements(true);

        const tracksPromises = this.tracksComponents.map((component) => component.startRace());
        await Promise.allSettled(tracksPromises);
        const animatedTracksPromises = this.tracksComponents.map((component) =>
          component.animateRace()
        );

        try {
          const winner = await Promise.any(animatedTracksPromises);
          const newWinner = { ...winner, time: winner.time / 1000 };
          this.showWinnerModal(winner.name, newWinner.time);
          appStore.dispatch(addWinner(newWinner));
        } catch (error) {
          const isError = (err: unknown): err is Error => (err as Error).message !== undefined;
          if (isError(error)) {
            console.log(Notifications.NO_WINS_ERROR);
            this.showWinnerModal(Notifications.NO_WINS_ERROR, 0);
          }
        }

        await Promise.allSettled(animatedTracksPromises);

        this.tracksComponents.forEach((comp) => comp.disableControls(false));
        this.disableElements(false);
        (this.getElement().querySelector('.js-reset') as HTMLButtonElement).disabled = false;
      });
  }

  private handleReset() {
    this.getElement()
      .querySelector('.js-reset')
      ?.addEventListener('click', async (e) => {
        this.hideWinnerModal();
        (e.currentTarget as HTMLButtonElement).disabled = true;
        const stoppedTracksPromises = this.tracksComponents.map((component) =>
          component.stopRace()
        );
        await Promise.allSettled(stoppedTracksPromises);
        (this.getElement().querySelector('.js-race') as HTMLButtonElement).disabled = false;
      });
  }

  private handleCreateCar() {
    const controlsCreateElement = this.getElement().querySelector('.controls__create');
    const colorCreateElement = controlsCreateElement?.querySelector(
      '.js-create-color'
    ) as HTMLInputElement;
    const nameCreateElement = controlsCreateElement?.querySelector(
      '.js-create-name'
    ) as HTMLInputElement;

    controlsCreateElement?.querySelector('.js-create-car')?.addEventListener('click', () => {
      this.hideWinnerModal();
      appStore.dispatch(createCar(nameCreateElement.value, colorCreateElement.value));
    });
  }

  private handleUpdateCar() {
    this.getElement()
      .querySelector('.js-update-car')
      ?.addEventListener('click', () => {
        if (this.selectedCar === null) return;

        let name = (this.getElement().querySelector('.js-update-name') as HTMLInputElement).value;
        const color = (this.getElement().querySelector('.js-update-color') as HTMLInputElement)
          .value;
        name = name.trim() === '' ? this.selectedCar.name : name.trim();

        appStore.dispatch(updateSelectedCar(this.selectedCar.id, { name, color }));
      });
  }

  private selectClickHandler(id: number, name: string, color: string) {
    this.hideWinnerModal();

    const updateNameElement = this.getElement().querySelector(
      '.js-update-name'
    ) as HTMLInputElement;
    const updateColorElement = this.getElement().querySelector(
      '.js-update-color'
    ) as HTMLInputElement;
    const updateButtonElement = this.getElement().querySelector(
      '.js-update-car'
    ) as HTMLInputElement;

    updateNameElement.disabled = false;
    updateNameElement.value = name;
    updateColorElement.disabled = false;
    updateColorElement.value = color;
    updateButtonElement.disabled = false;

    this.selectedCar = {
      id,
      name,
    };
  }

  private deleteClickHandler(id: number) {
    this.hideWinnerModal();
    appStore.dispatch(deleteSelectedCar(id));
  }

  private handleGenerate100Cars() {
    this.getElement()
      .querySelector('.js-generate100cars')
      ?.addEventListener('click', () => {
        this.hideWinnerModal();
        appStore.dispatch(generate100Cars());
      });
  }

  private handlePageChange() {
    this.getElement()
      .querySelector('.js-prev')
      ?.addEventListener('click', () => {
        this.disableReset(true);
        this.hideWinnerModal();
        appStore.dispatch(changePage(Page.PREV));
      });
    this.getElement()
      .querySelector('.js-next')
      ?.addEventListener('click', () => {
        this.disableReset(true);
        this.hideWinnerModal();
        appStore.dispatch(changePage(Page.NEXT));
      });
  }

  private resetCreateControl() {
    (this.getElement().querySelector('.js-create-name') as HTMLInputElement).value = '';
    (this.getElement().querySelector('.js-create-color') as HTMLInputElement).value =
      randomizeColor();
  }

  private resetUpdateControl() {
    const updateNameElement = this.getElement().querySelector(
      '.js-update-name'
    ) as HTMLInputElement;
    const updateColorElement = this.getElement().querySelector(
      '.js-update-color'
    ) as HTMLInputElement;
    const updateButtonElement = this.getElement().querySelector(
      '.js-update-car'
    ) as HTMLInputElement;

    this.selectedCar = null;
    updateNameElement.value = '';
    updateNameElement.disabled = true;
    updateColorElement.value = '#000000';
    updateColorElement.disabled = true;
    updateButtonElement.disabled = true;
  }

  private updatePage(state: IState) {
    const { totalCars, currentGarage, garagePageNumber } = state;
    (this.getElement().querySelector('.js-cars-amount') as HTMLElement).innerText = `${totalCars}`;
    const tracksElement = this.getElement().querySelector('.js-tracks') as HTMLElement;
    tracksElement.innerHTML = '';
    this.tracksComponents = currentGarage.map(
      (car) =>
        new TrackComponent(
          this.getElement(),
          car,
          this.selectClickHandler,
          this.deleteClickHandler,
          this.disableReset
        )
    );
    const tracks = this.tracksComponents.map((component) => component.getElement());
    tracksElement.append(...tracks);
    (
      this.getElement().querySelector('.js-page-number') as HTMLElement
    ).innerText = `${garagePageNumber}`;
  }

  private generateElement() {
    const { currentGarage } = appStore.getData();
    const tracksElement = this.getElement().querySelector('.js-tracks') as HTMLElement;
    this.tracksComponents = currentGarage.map(
      (car) =>
        new TrackComponent(
          this.getElement(),
          car,
          this.selectClickHandler,
          this.deleteClickHandler,
          this.disableReset
        )
    );
    const tracks = this.tracksComponents.map((component) => component.getElement());
    tracksElement.append(...tracks);
  }

  public getHTML(): string {
    const { totalCars, garagePageNumber } = appStore.getData();

    return `
    <div class="garage">
      <div class="garage__modal js-garage-modal">
        <span class="garage__close js-modal-close"></span>
        <h3 class="garage__modal-title">Winner</h3>
        <span class="garage__name js-garage-name"></span>
        <span class="garage__time js-garage-time"></span>
      </div>
      <div class="controls">
        <div class="controls__left">
          <div class="controls__left-inner">
            <div class="controls__create">
              <div class="controls__create-inps">
                <input class="inp js-create-name" type="text" />
                <input class="color js-create-color" type="color" value="${randomizeColor()}" />
              </div>
              <button class="btn js-create-car" type="button">create</button>
            </div>
            <div class="controls__update">
              <div class="controls__create-inps">
                <input class="inp js-update-name" type="text" disabled />
                <input class="color js-update-color" type="color" disabled />
              </div>
              <button class="btn js-update-car" type="button" disabled>update</button>
            </div>
          </div>
        </div>
        <div class="controls__right">
          <div class="controls__generate">
            <button class="btn js-generate100cars" type="button">generate cars</button>
          </div>
          <div class="controls__race">
            <button class="btn js-race" type="button">race</button>
            <button class="btn js-reset" type="button" disabled>reset</button>
          </div>
        </div>
      </div>
      <h2 class="garage__title">Garage (<span class="js-cars-amount">${totalCars}</span>)</h2>
      <span class="garage__caption">Page №<span class="js-page-number">${garagePageNumber}</span></span>
      <div class="garage__tracks js-tracks">
      </div>
      <div class="garage__pages">
        <button class="btn js-prev" type="button">Prev</button>
        <button class="btn js-next" type="button">Next</button>
      </div>
    </div>
    `;
  }
}

export default GarageComponent;
