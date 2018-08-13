const MEDIA_AREA = {
  tabletDown: "tablet-down",
  tabletUp: "tablet-up",
  desktopHDUp: "desktop-hd-up"
};

const DEFAULT_CONFIG = {
  nav: false,
  mouseDrag: true,
  loop: false,
  speed: 600,
  swipeAngle: false
};

const prevArrow = "<img class='tns-controls-prev' src='images/arrow-left.svg' alt=''/>";
const nextArrow = "<img class='tns-controls-next' src='images/arrow-left.svg' alt=''/>";

class BaseSlider {
  toggleListeners(action) {
    this.sliderInfo.events[action]("dragMove", preventClick);
    this.sliderInfo.events[action]("touchMove", preventClick);

    this.sliderInfo.events[action]("dragEnd", admitClick);
    this.sliderInfo.events[action]("touchEnd", admitClick);
  }

  subscribe() {
    this.toggleListeners("on");
  }

  unsubscribe() {
    this.toggleListeners("off");
  }
}

class ScenariosSlider extends BaseSlider {
  constructor() {
    super();

    this.options = Object.assign({}, DEFAULT_CONFIG, {
      container: ".scenarios__list",
      fixedWidth: 200,
      gutter: 15,
      controlsText: [prevArrow, nextArrow],
      slideBy: "page",
      responsive: {
        320: {
          controls: false
        },
        768: {
          controls: true,
          gutter: 0,
          items: 1,
          fixedWidth: 429
        },
        1280: {
          fixedWidth: 644
        }
      }
    });

    this.CARDS_PER_SLIDE = {
      [MEDIA_AREA.tabletDown]: 1,
      [MEDIA_AREA.tabletUp]: 6,
      [MEDIA_AREA.desktopHDUp]: 9
    };

    this.items = Array.from(document.querySelectorAll(".scenarios__item"));
  }

  build() {
    this.sliderInfo = tns(this.options);
    super.subscribe();
  }

  destroy() {
    super.unsubscribe();
    this.sliderInfo.destroy();
  }

  create() {
    this.prepareMarkup(this.CARDS_PER_SLIDE[getCurrentMediaArea()]);
    this.build();

    listenWindowResize(50, info => this.update(info));
  }

  update({ mediaArea, mediaAreaChanged }) {
    if (!mediaAreaChanged) return;

    this.destroy();
    this.prepareMarkup(this.CARDS_PER_SLIDE[mediaArea]);
    this.build();
  }

  prepareMarkup(cardsPerSlide) {
    const list = document.querySelector(".scenarios__list");
    const workedItems = this.items.slice();

    const lis = [];

    const slides = workedItems.length / cardsPerSlide;

    for (let i = 0; i < slides; i++) {
      lis[i] = workedItems.splice(0, cardsPerSlide);
    }

    const nodes = lis.map(slide => {
      const inner = slide.length === 1
        ? slide[0].innerHTML
        : `<ul class="slide-list">${slide.map(s => `<li class="slide-list__item">${s.innerHTML}</li>`).join('')}</ul>`;

      return `<li class="scenarios__item">${inner}</li>`
    }).join('');

    list.innerHTML = nodes;
  }
}

const scenariosSlider = new ScenariosSlider();
scenariosSlider.create();

class InfoDevicesSlider extends BaseSlider {
  constructor() {
    super();

    const container = ".info__devices-list";

    this.options = {
      horizontal: Object.assign({}, DEFAULT_CONFIG, {
        container,
        controls: false,
        edgePadding: 20,
        fixedWidth: 220
      }),
      vertical: Object.assign({}, DEFAULT_CONFIG, {
        container,
        controls: false,
        items: 2,
        gutter: 15,
        axis: "vertical",
        edgePadding: 20
      })
    };
  }

  build(type) {
    this.sliderInfo = tns(this.options[type]);

    super.subscribe();
  }

  destroy() {
    super.unsubscribe();

    this.sliderInfo.destroy();
  }

  rebuild({ mediaArea, mediaAreaChanged }) {
    if (!mediaAreaChanged) return;

    this.destroy();
    this.build(mediaArea === MEDIA_AREA.desktopHDUp ? "vertical" : "horizontal");
  }

  create() {
    this.build(getCurrentMediaArea() === MEDIA_AREA.desktopHDUp ? "vertical" : "horizontal");
    listenWindowResize(50, info => this.rebuild(info));
  }
}

const infoDevicesSlider = new InfoDevicesSlider();
infoDevicesSlider.create();

let isSomeSliderMoving = false;

class DevicesSlider extends BaseSlider {
  constructor() {
    super();

    this.options = Object.assign({}, DEFAULT_CONFIG, {
      container: ".devices__list",
      fixedWidth: 200,
      gutter: 15,
      controlsText: [prevArrow, nextArrow],
      slideBy: "page",
      responsive: {
        320: {
          controls: false
        },
        768: {
          controls: true
        }
      }
    });
  }

  create() {
    this.sliderInfo = tns(this.options);
    super.subscribe();
  }
}

const devicesSlider = new DevicesSlider();
devicesSlider.create();

function preventClick() {
  isSomeSliderMoving = true;
}

function admitClick() {
  isSomeSliderMoving = false;
}

function debounce(f, ms) {

  let timer = null;

  return function (...args) {
    const onComplete = () => {
      f.apply(this, args);
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, ms);
  };
}

function getCurrentMediaArea() {
  return getComputedStyle(document.querySelector(':root')).getPropertyValue('--media').trim();
}

function listenWindowResize(delay, onResize) {
  let currentMediaArea = getCurrentMediaArea();

  window.addEventListener('resize', debounce(() => {
    const mediaArea = getCurrentMediaArea();
    const mediaAreaChanged = mediaArea !== currentMediaArea;
    currentMediaArea = mediaAreaChanged ? mediaArea : currentMediaArea;

    onResize({ mediaArea, mediaAreaChanged });
  }, delay));
}
