import { ActionType, Notifications, UpdateType } from '../helpers/consts';
import { IAction, IState, TObserver } from '../helpers/types';

class AppStore {
  public observers: TObserver[];
  private state: IState;

  constructor() {
    this.observers = [];

    this.state = {
      totalCars: 0,
      totalWinners: 0,
      garagePageNumber: 1,
      currentGarage: [],
      winnersPageNumber: 1,
      currentWinners: [],
      allWinners: [],
      sortby: 'id',
      order: 'ASC',
      lastWinner: {
        name: '',
        time: 0,
      },
    };
  }

  public getData() {
    return this.state;
  }

  public addObserver(observer: TObserver): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: TObserver): void {
    this.observers = this.observers.filter((existedObserver) => existedObserver !== observer);
  }

  private notify(state: IState, updateType: UpdateType): void {
    this.observers.forEach((observer) => observer(state, updateType));
  }

  public dispatch(action: IAction | Promise<IAction>) {
    if (action instanceof Promise) {
      action
        .then((res) => this.reducer(res))
        .catch((reason) => console.log(`${Notifications.SOME_ERROR}:\n${reason}`));
    } else {
      this.reducer(action);
    }
  }

  private reducer(action: IAction) {
    switch (action.type) {
      case ActionType.INIT:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.INIT);

        break;
      case ActionType.GENERATE_100_CARS:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CHANGE_GARAGE_PAGE);

        break;
      case ActionType.CHANGE_PAGE:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CHANGE_GARAGE_PAGE);
        break;
      case ActionType.CHANGE_WINNER_PAGE:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CHANGE_WINNER_PAGE);

        break;
      case ActionType.CREATE_CAR:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CREATE_CAR);

        break;
      case ActionType.UPDATE_CAR:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.UPDATE_CAR);

        break;
      case ActionType.DELETE_CAR:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.UPDATE_CAR);

        break;
      case ActionType.SORT:
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CHANGE_WINNER_PAGE);

        break;
      case ActionType.ADD_WINNER: {
        this.state = { ...this.state, ...action.payload };
        this.notify(this.state, UpdateType.CHANGE_WINNER_PAGE);

        break;
      }
      default:
        break;
    }
  }
}

export default new AppStore();
