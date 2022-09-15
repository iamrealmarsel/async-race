import { Order, Sort, SortBy } from '../helpers/consts';
import { sortWinners } from '../store/actions';
import appStore from '../store/app-store';
import ElementAbstract from './element-abstract';

class WinnerCaptionComponent extends ElementAbstract {
  constructor() {
    super();
    this.handleSort();
  }

  private handleSort() {
    this.getElement()
      .querySelectorAll('[data-sort]')
      .forEach((elem) => {
        elem.addEventListener('click', (e) => {
          appStore.dispatch(sortWinners((e.currentTarget as HTMLElement).dataset.sort));
        });
      });
  }

  public getHTML(): string {
    const { sortby, order } = appStore.getData();

    return `
  <div class="winnersCaption row">
  <span class="row__col-num">№</span>
  <span class="row__col-pic">Pic</span>
  <span class="row__col-name">Name</span>
  <span class="winnersCaption__wins row__col-wins">Wins
    <span class="winners__sort ${sortby === SortBy.WINS && order === Order.ASC ? 'active' : ''}" 
    data-sort="${Sort.WINS_UP}">☝︎</span>
    <span class="winners__sort ${sortby === SortBy.WINS && order === Order.DESC ? 'active' : ''}" 
    data-sort="${Sort.WINS_DOWN}">☟</span>
  </span>
  <span class="winnersCaption__time row__col-time">Best time
    <span class="winners__sort ${sortby === SortBy.TIME && order === Order.ASC ? 'active' : ''}" 
      data-sort="${Sort.BESTTIME_UP}">☝︎</span>
    <span class="winners__sort ${sortby === SortBy.TIME && order === Order.DESC ? 'active' : ''}" 
      data-sort="${Sort.BESTTIME_DOWN}">☟</span>
  </span>
  </div>`;
  }
}

export default WinnerCaptionComponent;
