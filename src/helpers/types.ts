import { ActionType, UpdateType } from './consts';

export interface IPostCar {
  name: string;
  color: string;
}

export interface ICar extends IPostCar {
  id: number;
}

export interface IWinner extends ICar {
  wins: number;
  time: number;
}

export interface IServerWinner {
  id: number;
  wins: number;
  time: number;
}

export type TPostWinner = Omit<IServerWinner, 'id'>;

export interface IState {
  totalCars: number;
  totalWinners: number;
  garagePageNumber: number;
  winnersPageNumber: number;
  currentGarage: ICar[];
  currentWinners: IWinner[];
  allWinners: IServerWinner[];
  sortby: string;
  order: string;
  lastWinner: {
    name: string;
    time: number;
  };
}

export type TObserver = (state: IState, updateType: UpdateType) => void;

export interface IAction {
  type: ActionType;
  payload?: Partial<IState>;
}
