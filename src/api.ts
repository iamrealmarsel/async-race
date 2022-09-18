import { GARAGE_LIMIT, GENERATION_LIMIT, Status, WINNER_LIMIT } from './helpers/consts';
import { ICar, IPostCar, IServerWinner, TPostWinner } from './helpers/types';
import { randomizeColor, randomizeName } from './helpers/utils';

const enum Endpoint {
  GARAGE = 'https://async-race-be-mars.herokuapp.com/garage',
  WINNERS = 'https://async-race-be-mars.herokuapp.com/winners',
  ENGINE = 'https://async-race-be-mars.herokuapp.com/engine',
}

export const getCars = async (
  pageNumber = 1,
  limitCount = GARAGE_LIMIT
): Promise<{ currentGarage: ICar[]; totalCars: number }> => {
  const response = await fetch(`${Endpoint.GARAGE}/?_page=${pageNumber}&_limit=${limitCount}`);
  const cars = (await response.json()) as ICar[];
  const totalCarsStr = response.headers.get('X-Total-Count') ?? '';
  const totalCars = +totalCarsStr;

  return { currentGarage: cars, totalCars };
};

export const postCar = async (car: IPostCar) =>
  fetch(`${Endpoint.GARAGE}`, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(car),
  });

export const post100Cars = () =>
  Array(GENERATION_LIMIT)
    .fill(0)
    .map(() => postCar({ name: randomizeName(), color: randomizeColor() }));

export const updateCar = (id: number, car: IPostCar) =>
  fetch(`${Endpoint.GARAGE}/${id}`, {
    method: 'PUT',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(car),
  });

export const deleteCar = (id: number) =>
  fetch(`${Endpoint.GARAGE}/${id}`, {
    method: 'DELETE',
  });

export const deleteWinner = (id: number) =>
  fetch(`${Endpoint.WINNERS}/${id}`, {
    method: 'DELETE',
  });

export const getWinners = async (
  pageNumber = 1,
  sort = 'id',
  order = 'ASC'
): Promise<{ winners: IServerWinner[]; totalWinners: number }> => {
  const response = await fetch(
    `${Endpoint.WINNERS}/?_page=${pageNumber}&_limit=${WINNER_LIMIT}&_sort=${sort}&_order=${order}`
  );

  const winners = (await response.json()) as IServerWinner[];
  const totalWinnersStr = response.headers.get('X-Total-Count') ?? 0;
  const totalWinners = +totalWinnersStr;

  return { winners, totalWinners };
};

export const getAllWinners = async (): Promise<IServerWinner[]> => {
  const response = await fetch(`${Endpoint.WINNERS}`);
  const winners = (await response.json()) as IServerWinner[];

  return winners;
};

export const getCar = async (id: number) => (await fetch(`${Endpoint.GARAGE}/${id}`)).json();

export const manageCarEngine = async (id: number, status: Status) =>
  fetch(`${Endpoint.ENGINE}/?id=${id}&status=${status}`, {
    method: 'PATCH',
  });

export const postWinner = async (winner: IServerWinner) =>
  fetch(`${Endpoint.WINNERS}`, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(winner),
  });

export const updateWinner = async (id: number, winner: TPostWinner) =>
  fetch(`${Endpoint.WINNERS}/${id}`, {
    method: 'PUT',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(winner),
  });
