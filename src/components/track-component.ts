import { ICar } from '../helpers/types';
import { driveEngine, startEngine, stopEngine } from '../store/actions';
import ElementAbstract from './element-abstract';

class TrackComponent extends ElementAbstract {
  private car: ICar;
  private selectClickHandler: (id: number, name: string, color: string) => void;
  private deleteClickHandler: (id: number) => void;
  private disableReset: (bool: boolean) => void;
  private carAnimation: Animation | undefined;
  private time: number;
  private parentElement: HTMLElement;

  constructor(
    parentElement: HTMLElement,
    car: ICar,
    selectHandler: (id: number, name: string, color: string) => void,
    deleteHandler: (id: number) => void,
    disableReset: (bool: boolean) => void
  ) {
    super();
    this.car = car;
    this.time = 0;
    this.parentElement = parentElement;

    this.selectClickHandler = selectHandler;
    this.deleteClickHandler = deleteHandler;
    this.disableReset = disableReset;
    this.handleSelectClick();
    this.handleDeleteClick();
    this.handleStartEngine();
    this.handleStopEngine();
  }

  public async startRace() {
    (this.getElement().querySelector('.js-start') as HTMLButtonElement).disabled = true;
    this.disableControls(true);
    this.time = await startEngine(this.car.id);
  }

  public async animateRace() {
    this.carAnimation = this.setAnimation(this.time);
    this.carAnimation.play();

    const isDriveOk = await driveEngine(this.car.id);

    if (!isDriveOk) {
      this.carAnimation.pause();
      return Promise.reject();
    }

    return {
      id: this.car.id,
      time: this.time,
      name: this.car.name,
    };
  }

  public async stopRace() {
    (this.getElement().querySelector('.js-stop') as HTMLButtonElement).disabled = true;
    await stopEngine(this.car.id);
    this.carAnimation?.cancel();
    (this.getElement().querySelector('.js-start') as HTMLButtonElement).disabled = false;
  }

  private handleStartEngine() {
    this.getElement()
      .querySelector('.js-start')
      ?.addEventListener('click', async (e) => {
        (e.currentTarget as HTMLButtonElement).disabled = true;
        (this.parentElement.querySelector('.js-race') as HTMLButtonElement).disabled = true;

        const time = await startEngine(this.car.id);
        this.carAnimation = this.setAnimation(time);
        this.carAnimation.play();

        (this.parentElement.querySelector('.js-reset') as HTMLButtonElement).disabled = false;
        (this.getElement().querySelector('.js-stop') as HTMLButtonElement).disabled = false;

        const isDriveOk = await driveEngine(this.car.id);

        if (!isDriveOk) this.carAnimation.pause();
      });
  }

  private handleStopEngine() {
    this.getElement()
      .querySelector('.js-stop')
      ?.addEventListener('click', async (e) => {
        (e.currentTarget as HTMLButtonElement).disabled = true;

        await stopEngine(this.car.id);

        this.carAnimation?.cancel();

        (this.getElement().querySelector('.js-start') as HTMLButtonElement).disabled = false;
        // this.disableReset(true);
      });
  }

  private handleSelectClick() {
    this.getElement()
      .querySelector('.js-select')
      ?.addEventListener('click', () => {
        this.selectClickHandler(this.car.id, this.car.name, this.car.color);
      });
  }

  private handleDeleteClick() {
    this.getElement()
      .querySelector('.js-remove')
      ?.addEventListener('click', () => {
        this.deleteClickHandler(this.car.id);
      });
  }

  public disableControls(bool: boolean) {
    (this.getElement().querySelector('.js-remove') as HTMLButtonElement).disabled = bool;
    (this.getElement().querySelector('.js-select') as HTMLButtonElement).disabled = bool;
    // (this.getElement().querySelector('.js-stop') as HTMLButtonElement).disabled = bool;
  }

  private setAnimation(time: number) {
    const car = this.getElement().querySelector('.track__car');

    const carAnimationSettings = new KeyframeEffect(
      car,
      [{ left: '0' }, { left: 'calc(100% - 50px)' }],
      { duration: time, fill: 'forwards', easing: 'ease-in-out' }
    );

    return new Animation(carAnimationSettings);
  }

  public getHTML(): string {
    const { name, color } = this.car;

    return `
      <div class="track">
        <div class="track__controls">
          <div class="track__top">
            <button class="btn js-remove" type="button">🙅</button>
            <button class="btn js-select" type="button">👉</button>
          </div>
          <div class="track__bottom">
            <button class="btn js-start" type="button">A</button>
            <button class="btn js-stop" type="button" disabled>B</button>
          </div>
        </div>
        <div class="track__road">
          <div class="track__name">${name}</div>
          <div class="track__car">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
            <g>
            <path style="fill:#FFFFFF;" d="M137.456,322.941c16.526,0,29.957,13.443,29.957,29.957c0,16.515-13.432,29.957-29.957,29.957
            c-16.515,0-29.957-13.443-29.957-29.957C107.498,336.383,120.941,322.941,137.456,322.941z"/>
            <path style="fill:#FFFFFF;" d="M374.544,322.941c16.515,0,29.957,13.443,29.957,29.957c0,16.515-13.443,29.957-29.957,29.957
            c-16.526,0-29.957-13.443-29.957-29.957C344.587,336.383,358.019,322.941,374.544,322.941z"/>
            <path style="fill:#FFFFFF;" d="M208.373,118.25v83.064H53.052l65.46-69.545c6.177-6.569,22.256-13.519,31.276-13.519H208.373z"/>
            </g>
            <path style="fill:#C5E2E2;" d="M335.665,129.056l33.596,72.257H208.373V118.25h110.265
            C323.998,118.25,333.388,124.208,335.665,129.056z"/>
            <path style="fill:${color};" d="M457.107,233.994c0-5.164,0.839-10.12,2.386-14.772c0-0.011-38.204-12.746-38.204-12.746
            c-8.53-2.832-18.628-11.82-22.463-19.946l-33.596-71.397c-7.647-16.264-28.618-29.565-46.592-29.565H149.787
            c-17.974,0-42.757,10.708-55.078,23.803l-75.34,80.046c-6.155,6.547-11.199,19.249-11.199,28.236v102.563
            c0,17.974,14.706,32.681,32.681,32.681h23.073c0-40.611,32.921-73.532,73.532-73.532s73.532,32.921,73.532,73.532h90.025
            c0-40.611,32.921-73.532,73.532-73.532s73.532,32.921,73.532,73.532c0,0,11.634,0,27.288,0s28.465-14.706,28.465-32.681v-39.5
            C478.023,280.717,457.107,259.801,457.107,233.994z M53.052,201.314l65.46-69.545c6.177-6.569,22.256-13.519,31.276-13.519h168.851
            c5.36,0,14.75,5.959,17.027,10.806l33.596,72.257H53.052z"/>
            <g>
            <path style="fill:#AECE71;" d="M137.456,279.366c40.611,0,73.532,32.921,73.532,73.532s-32.921,73.532-73.532,73.532
            s-73.532-32.921-73.532-73.532S96.844,279.366,137.456,279.366z M167.413,352.898c0-16.515-13.432-29.957-29.957-29.957
            c-16.515,0-29.957,13.443-29.957,29.957c0,16.515,13.443,29.957,29.957,29.957C153.981,382.856,167.413,369.413,167.413,352.898z"
            />
            <path style="fill:#AECE71;" d="M374.544,279.366c40.611,0,73.532,32.921,73.532,73.532s-32.921,73.532-73.532,73.532
            s-73.532-32.921-73.532-73.532S333.933,279.366,374.544,279.366z M404.502,352.898c0-16.515-13.443-29.957-29.957-29.957
            c-16.526,0-29.957,13.443-29.957,29.957c0,16.515,13.432,29.957,29.957,29.957C391.059,382.856,404.502,369.413,404.502,352.898z"
            />
            </g>
            <path style="fill:#EEC278;" d="M459.504,219.223c24.38,8.127,44.326,35.796,44.326,61.494c-25.807,0-46.723-20.916-46.723-46.723
            C457.107,228.831,457.946,223.874,459.504,219.223z"/>
            <g>
            <path style="fill:#700019;" d="M137.46,391.027c21.024,0,38.128-17.104,38.128-38.128c0-21.024-17.104-38.128-38.128-38.128
            s-38.128,17.104-38.128,38.128C99.332,373.923,116.436,391.027,137.46,391.027z M137.46,331.112
            c12.013,0,21.787,9.774,21.787,21.787s-9.774,21.787-21.787,21.787s-21.787-9.774-21.787-21.787S125.445,331.112,137.46,331.112z"
            />
            <path style="fill:#700019;" d="M374.54,314.772c-21.024,0-38.128,17.104-38.128,38.128c0,21.024,17.104,38.128,38.128,38.128
            c21.024,0,38.128-17.104,38.128-38.128C412.668,331.876,395.564,314.772,374.54,314.772z M374.54,374.686
            c-12.013,0-21.787-9.774-21.787-21.787s9.774-21.787,21.787-21.787s21.787,9.774,21.787,21.787S386.555,374.686,374.54,374.686z"/>
            <path style="fill:#700019;" d="M149.787,126.419h25.904c4.513,0,8.17-3.658,8.17-8.17c0-4.512-3.657-8.17-8.17-8.17h-25.904
            c-11.354,0-29.447,7.817-37.231,16.087l-65.458,69.55c-2.234,2.374-2.842,5.848-1.55,8.84c1.293,2.992,4.241,4.929,7.5,4.929
            h316.21c2.791,0,5.387-1.424,6.888-3.777c1.5-2.352,1.697-5.308,0.521-7.838l-33.611-72.295
            c-3.611-7.676-15.935-15.496-24.418-15.496H208.372c-4.513,0-8.17,3.658-8.17,8.17l-0.001,74.896H71.959l52.496-55.78
            C129.077,132.454,143.046,126.419,149.787,126.419z M216.542,126.419h102.073c2.4,0.112,8.543,4.01,9.64,6.08l28.196,60.646
            h-139.91L216.542,126.419z"/>
            <path style="fill:#700019;" d="M512,280.719c0-29.011-22.392-60.077-49.913-69.251c-0.019-0.007-38.213-12.738-38.213-12.738
            c-6.377-2.125-14.789-9.599-17.651-15.68l-33.596-71.391c-9.041-19.212-32.755-34.262-53.989-34.262H149.787
            c-20.305,0-47.112,11.582-61.028,26.369l-75.338,80.048C5.895,191.811,0,206.674,0,217.655v102.563
            c0,22.526,18.325,40.851,40.851,40.851h15.316c4.112,41.228,38.999,73.532,81.293,73.532s77.18-32.304,81.293-73.532h49.576
            c4.513,0,8.17-3.658,8.17-8.17c0-4.512-3.657-8.17-8.17-8.17h-49.576c-4.112-41.228-38.999-73.532-81.293-73.532
            s-77.18,32.304-81.293,73.532H40.851c-13.515,0-24.511-10.995-24.511-24.511V217.655c0-6.856,4.28-17.648,8.979-22.64l75.339-80.05
            c10.829-11.507,33.328-21.227,49.129-21.227h168.851c14.905,0,32.857,11.393,39.203,24.879l33.596,71.391
            c4.816,10.235,16.539,20.649,27.268,24.225l31.045,10.348c-0.536,3.095-0.815,6.241-0.815,9.414
            c0,27.493,20.317,50.326,46.725,54.284v31.94c0,13.516-9.104,24.511-20.296,24.511h-19.531
            c-4.112-41.228-38.999-73.532-81.293-73.532c-45.051,0-81.702,36.652-81.702,81.702s36.652,81.702,81.702,81.702
            c42.293,0,77.18-32.304,81.293-73.532h19.531c20.201,0,36.636-18.325,36.636-40.851L512,280.719L512,280.719z M137.46,287.538
            c36.04,0,65.362,29.321,65.362,65.362s-29.321,65.362-65.362,65.362s-65.362-29.321-65.362-65.362S101.42,287.538,137.46,287.538z
            M374.54,418.261c-36.04,0-65.362-29.321-65.362-65.362s29.321-65.362,65.362-65.362s65.362,29.321,65.362,65.362
            S410.58,418.261,374.54,418.261z M465.275,233.995c0-1.056,0.044-2.107,0.127-3.152c14.336,8.309,25.913,24.369,29.265,40.596
            C477.819,267.317,465.275,252.097,465.275,233.995z"/>
            </g>
            </svg>
          </div>

          <div class="track__flag">
            <span class="flag-svg">🏁</span>
          </div>
        </div>


      </div>
    `;
  }
}

export default TrackComponent;
