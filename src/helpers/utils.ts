import { brands, models } from './consts';

export const createElement = (html: string): HTMLElement => {
  const parentElement = document.createElement('div');
  parentElement.innerHTML = html;

  return parentElement.firstElementChild as HTMLElement;
};

export const randomizeColor = () => {
  const hex = `${Math.random().toString(16)}ffffff`;

  return `#${hex.slice(2, 8)}`;
};

export const randomizeName = () =>
  `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`;

export const selectData = (arr: Array<{ [i: string]: number }>, prop: string | number) => arr.map((item) => item[prop]);
