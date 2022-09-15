import {
  deleteCar,
  deleteWinner,
  getAllWinners,
  getCar,
  getCars,
  getWinners,
  manageCarEngine,
  post100Cars,
  postCar,
  postWinner,
  updateCar,
  updateWinner,
} from '../api';
import {
  ActionType,
  GARAGE_LIMIT,
  Order,
  Page,
  Sort,
  SortBy,
  Status,
  WINNER_LIMIT,
} from '../helpers/consts';
import { IAction, ICar, IPostCar, IServerWinner, IWinner } from '../helpers/types';
import { randomizeName } from '../helpers/utils';
import appStore from './app-store';

const getFilledWinners = async (winners: IServerWinner[]): Promise<IWinner[]> => {
  const carPromises = winners.map(async (winner) => getCar(winner.id));
  const carResults = await Promise.allSettled(carPromises);

  const currentWinners: IWinner[] = carResults.map((item) => {
    if (item.status === 'fulfilled') {
      const selectedWinner = winners.find((winner) => winner.id === item.value.id);
      const currentWinner = { ...selectedWinner, ...item.value };

      return currentWinner;
    }

    return null;
  });

  return currentWinners;
};

export const init = async (): Promise<IAction> => {
  const { currentGarage, totalCars } = await getCars();
  const { winners, totalWinners } = await getWinners();

  const currentWinners = await getFilledWinners(winners);
  const allWinners = await getAllWinners();

  return {
    type: ActionType.INIT,
    payload: {
      totalCars,
      totalWinners,
      currentGarage,
      currentWinners,
      allWinners,
    },
  };
};

export const generate100Cars = async (): Promise<IAction> => {
  await Promise.allSettled(post100Cars());

  const { garagePageNumber } = appStore.getData();

  const { currentGarage, totalCars } = await getCars(garagePageNumber);

  return {
    type: ActionType.GENERATE_100_CARS,
    payload: {
      totalCars,
      currentGarage,
    },
  };
};

export const changePage = async (direction: Page): Promise<IAction> => {
  let { garagePageNumber } = appStore.getData();
  const { totalCars } = appStore.getData();
  const pageLimit = Math.ceil(totalCars / GARAGE_LIMIT);
  let currentGarage: ICar[];

  if (direction === Page.NEXT) {
    garagePageNumber = garagePageNumber >= pageLimit ? garagePageNumber : (garagePageNumber += 1);
    currentGarage = (await getCars(garagePageNumber)).currentGarage;
  } else if (direction === Page.PREV) {
    garagePageNumber = garagePageNumber === 1 ? garagePageNumber : (garagePageNumber -= 1);
    currentGarage = (await getCars(garagePageNumber)).currentGarage;
  } else {
    currentGarage = (await getCars(garagePageNumber)).currentGarage;
  }

  return {
    type: ActionType.CHANGE_PAGE,
    payload: {
      garagePageNumber,
      currentGarage,
    },
  };
};

export const changeWinnerPage = async (direction: Page): Promise<IAction> => {
  let { winnersPageNumber } = appStore.getData();
  const { totalWinners, sortby, order } = appStore.getData();
  const pageLimit = Math.ceil(totalWinners / WINNER_LIMIT);
  let currentWinners: IWinner[];

  if (direction === Page.NEXT) {
    winnersPageNumber =
      winnersPageNumber >= pageLimit ? winnersPageNumber : (winnersPageNumber += 1);
    const { winners } = await getWinners(winnersPageNumber, sortby, order);
    currentWinners = await getFilledWinners(winners);
  } else if (direction === Page.PREV) {
    winnersPageNumber = winnersPageNumber === 1 ? winnersPageNumber : (winnersPageNumber -= 1);
    const { winners } = await getWinners(winnersPageNumber, sortby, order);
    currentWinners = await getFilledWinners(winners);
  } else {
    const { winners } = await getWinners(winnersPageNumber, sortby, order);
    currentWinners = await getFilledWinners(winners);
  }

  return {
    type: ActionType.CHANGE_WINNER_PAGE,
    payload: {
      winnersPageNumber,
      currentWinners,
    },
  };
};

export const createCar = async (nameVal: string, colorVal: string): Promise<IAction> => {
  const name = nameVal.trim() === '' ? randomizeName() : nameVal.trim();

  await postCar({ name, color: colorVal });

  const { garagePageNumber } = appStore.getData();
  const { currentGarage, totalCars } = await getCars(garagePageNumber);

  return {
    type: ActionType.CREATE_CAR,
    payload: {
      totalCars,
      currentGarage,
    },
  };
};

export const updateSelectedCar = async (id: number, car: IPostCar): Promise<IAction> => {
  await updateCar(id, car);

  const { garagePageNumber, winnersPageNumber, sortby, order } = appStore.getData();
  const { currentGarage } = await getCars(garagePageNumber);
  const { winners } = await getWinners(winnersPageNumber, sortby, order);
  const currentWinners = await getFilledWinners(winners);

  return {
    type: ActionType.UPDATE_CAR,
    payload: {
      currentGarage,
      currentWinners,
    },
  };
};

export const deleteSelectedCar = async (id: number): Promise<IAction> => {
  await deleteCar(id);

  const allWinners = await getAllWinners();
  const index = allWinners.findIndex((item) => item.id === id);
  if (index !== -1) await deleteWinner(id);

  const {
    garagePageNumber: pageNumber,
    currentGarage: currGarage,
    currentWinners,
    winnersPageNumber,
    sortby,
    order,
  } = appStore.getData();

  let garagePageNumber;
  let winPageNum;

  if (winnersPageNumber === 1) {
    winPageNum = winnersPageNumber;
  } else {
    winPageNum = currentWinners.length > 1 ? winnersPageNumber : winnersPageNumber - 1;
  }

  const { totalWinners, winners } = await getWinners(winPageNum, sortby, order);

  if (pageNumber === 1) {
    garagePageNumber = pageNumber;
  } else {
    garagePageNumber = currGarage.length > 1 ? pageNumber : pageNumber - 1;
  }

  const { currentGarage, totalCars } = await getCars(garagePageNumber);

  return {
    type: ActionType.DELETE_CAR,
    payload: {
      currentGarage,
      totalCars,
      garagePageNumber,
      totalWinners,
      currentWinners: await getFilledWinners(winners),
    },
  };
};

export const sortWinners = async (dataset: string | undefined): Promise<IAction> => {
  if (dataset === undefined) return { type: ActionType.DEFAULT };

  let sort;
  let order;

  if (dataset === Sort.WINS_UP) {
    sort = SortBy.WINS;
    order = Order.ASC;
  } else if (dataset === Sort.WINS_DOWN) {
    sort = SortBy.WINS;
    order = Order.DESC;
  } else if (dataset === Sort.BESTTIME_UP) {
    sort = SortBy.TIME;
    order = Order.ASC;
  } else if (dataset === Sort.BESTTIME_DOWN) {
    sort = SortBy.TIME;
    order = Order.DESC;
  }

  const { winnersPageNumber } = appStore.getData();
  const { winners } = await getWinners(winnersPageNumber, sort, order);
  const currentWinners = await getFilledWinners(winners);

  return {
    type: ActionType.SORT,
    payload: {
      currentWinners,
      sortby: sort,
      order,
    },
  };
};

export const startEngine = async (id: number) => {
  const { distance, velocity } = await (await manageCarEngine(id, Status.START)).json();
  const time = distance / velocity;
  // const time = distance / velocity / 1000;

  return Math.ceil(time);
};

export const stopEngine = async (id: number) => manageCarEngine(id, Status.STOP);

export const driveEngine = async (id: number) => {
  const response = await manageCarEngine(id, Status.DRIVE);

  if (response.status === 500) return false;

  return true;
};

export const addWinner = async (winner: { id: number; time: number; name: string }) => {
  const { allWinners } = appStore.getData();

  const selectedWinner = allWinners.find((item) => item.id === winner.id);

  if (selectedWinner === undefined) {
    await postWinner({ ...winner, wins: 1 });
  } else if (selectedWinner.time > winner.time) {
    const adaptToPostWinner = { wins: selectedWinner.wins + 1, time: winner.time };
    await updateWinner(winner.id, adaptToPostWinner);
  } else {
    return { type: ActionType.DEFAULT };
  }

  const { winnersPageNumber, sortby, order } = appStore.getData();
  const { winners, totalWinners } = await getWinners(winnersPageNumber, sortby, order);
  const currentWinners = await getFilledWinners(winners);
  const newAllWinners = await getAllWinners();

  return {
    type: ActionType.ADD_WINNER,
    payload: {
      allWinners: newAllWinners,
      currentWinners,
      totalWinners,
      lastWinner: {
        name: winner.name,
        time: winner.time,
      },
    },
  };
};
