import { createElement } from '../helpers/utils';

abstract class ElementAbstract {
  private element: null | HTMLElement;

  constructor() {
    this.element = null;
  }

  public abstract getHTML(): string;

  public getElement(): HTMLElement {
    if (!this.element) {
      this.element = createElement(this.getHTML());
    }

    return this.element;
  }

  public removeElement(): void {
    this.element?.remove();
    this.element = null;
  }
}

export default ElementAbstract;
