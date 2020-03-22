import './style.scss';

function CardChanger(
  element,
  {
    stackSize = 3,
    stackHeight = 60,
    rootClassName = 'card-changer',
    dotsNavigation = true,
    keepChangeOrder = true,
    animationSpeed = 150,
    cardTemplate,
    cards,
    activeCardId,
    unRotateOnChange = true,
  } = {},
) {
  const self = this;

  if (!cards) {
    throw new Error('`cards` parameter is required');
  }

  self.element = element;
  self._cards = cards.map(({ id, pan, color, frontContent, backContent }) => ({
    id,
    pan,
    color,
    frontContent,
    backContent,
  }));
  self._rootContainerElement = null;
  self._cardsContainerElement = null;
  self._dotsContainerElement = null;
  self._activeCardIdx = -1;

  const evtHandlers = {};

  self.on = function (type, handler) {
    (evtHandlers[type] || (evtHandlers[type] = [])).push(handler);
  };

  self.off = function (type, handler) {
    if (evtHandlers[type]) {
      evtHandlers[type].splice(evtHandlers[type].indexOf(handler) >>> 0, 1);
    }
  };

  function emit(type, evt) {
    (evtHandlers[type] || []).slice().map((handler) => {
      handler(evt);
    });
    (evtHandlers['*'] || []).slice().map((handler) => {
      handler(type, evt);
    });
  }

  function cn(...args) {
    const result = args
      .reduce((acc, item) => {
        return `${acc}${rootClassName}__${item} `;
      }, '')
      .trim();
    return escape(result.replace(/\s&/g, ''));
  }

  cardTemplate =
    cardTemplate ||
    `
    <div class="${cn('card')}" data-card-id="{{CARD_ID}}"> 
      <div class="${cn('card-form')}">
        <div class="${cn('card-front')}"></div>
        <div class="${cn('card-back')}"></div>
      </div>
    </div>
    `;

  function updateCardElementsOrder(activeCardIdx) {
    const scaleDiff = stackSize / 30;
    const translateDiff = stackHeight / stackSize;

    for (let i = 0; i < self._cards.length; i += 1) {
      const el = self._cards[(activeCardIdx + i) % self._cards.length].element;
      el.dataset.order = i;
      el.removeAttribute('style');

      if (i === stackSize) {
        el.style.transform = 'scale(0.5) translateY(0px)';
      } else if (i < stackSize) {
        el.style.transform = `scale(${1 - scaleDiff * i}) translateY(${-translateDiff * i}px)`;
      }
      if (i <= stackSize) {
        el.style.zIndex = `${100 - i}`;
        el.style.opacity = `${1}`;
      }

      if (i === 0) {
        el.style.pointerEvents = 'inherit';
      }
    }

    self._cardsContainerElement
      .querySelectorAll('.last')
      .forEach((el) => el.classList.remove('last'));

    if (self._cards.length > stackSize) {
      const lastElement =
        self._cards[(activeCardIdx + self._cards.length - 1) % self._cards.length].element;

      lastElement.classList.add('last');

      lastElement.style.transform = `scale(1.1) translateY(${translateDiff}px)`;
      lastElement.style.zIndex = '101';
      lastElement.style.opacity = '0';
    }
  }

  Object.defineProperty(self, 'activeCardId', {
    set: function (cardId) {
      clearTimeout(self._animationTimeoutId);

      if (self._activeCardId === cardId) {
        return;
      }

      const activeCardIdx = self._cards.findIndex((card) => card.id === cardId);

      const prevActiveCardIdx = self._activeCardIdx === -1 ? activeCardIdx : self._activeCardIdx;

      if (activeCardIdx === -1) {
        throw new Error('Setting active card with wrong id');
      }

      self._activeCardId = cardId;
      self._activeCardIdx = activeCardIdx;

      const diff = Math.abs(self._activeCardIdx - prevActiveCardIdx);

      if (diff > 1 && diff !== self._cards.length - 1 && keepChangeOrder) {
        let currentIdx = prevActiveCardIdx;

        const updatePositionTick = () => {
          currentIdx = (currentIdx + 1) % self._cards.length;
          updateCardElementsOrder(currentIdx);
          if (currentIdx !== activeCardIdx) {
            self._animationTimeoutId = setTimeout(updatePositionTick, animationSpeed);
          }
        };

        updatePositionTick();
      } else {
        updateCardElementsOrder(activeCardIdx);
      }

      if (unRotateOnChange) {
        self._cardsContainerElement
          .querySelectorAll('.rotate')
          .forEach((el) => el.classList.remove('rotate'));
      }

      if (dotsNavigation) {
        self._dotsContainerElement
          .querySelectorAll('.active')
          .forEach((el) => el.classList.remove('active'));

        self._dotsContainerElement
          .querySelector(`.${cn('dot')}[data-card-id="${self._activeCardId}"]`)
          .classList.add('active');
      }

      emit('change', self._activeCardId);
    },
    get: function () {
      return self._activeCardId;
    },
  });

  function htmlToElement(html) {
    html = html || '';
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
  }

  function generateCardElement(card) {
    const cardElement = htmlToElement(cardTemplate.replace(/{{CARD_ID}}/g, card.id));

    if (card.frontContent) {
      const frontContentElement = isElement(card.frontContent)
        ? card.frontContent
        : htmlToElement(card.frontContent);
      cardElement.querySelector(`.${cn('card-front')}`).appendChild(frontContentElement);
    } else {
      throw new Error('Card `frontContent` is required');
    }

    if (card.backContent) {
      const backContentElement = isElement(card.backContent)
        ? card.backContent
        : htmlToElement(card.backContent);
      cardElement.querySelector(`.${cn('card-back')}`).appendChild(backContentElement);
    }

    return cardElement;
  }

  function generateDotElement(card) {
    const dotElement = htmlToElement(`<div class="${cn('dot')}" data-card-id="${card.id}"></div>`);

    dotElement.addEventListener('click', function (event) {
      self.activeCardId = event.target.dataset.cardId;
    });

    return dotElement;
  }

  self.rotate = function () {
    const card = self._cards.find((card) => card.id === self._activeCardId);
    card.element.classList.toggle('rotate');
  };

  function init() {
    self.element.innerHTML = '';

    self._rootContainerElement = htmlToElement(`<div class="${rootClassName}"></div>`);
    self.element.appendChild(self._rootContainerElement);

    self._cardsContainerElement = htmlToElement(`<div class="${cn('cards-container')}"></div>`);
    self._rootContainerElement.appendChild(self._cardsContainerElement);

    if (dotsNavigation) {
      self._dotsContainerElement = htmlToElement(`<div class="${cn('dots-container')}"></div>`);
      self._rootContainerElement.appendChild(self._dotsContainerElement);
    }

    if (!self._cards) {
      self._cardsContainerElement.innerHTML = 'No cards';
      return;
    }

    self._cards.forEach((card) => {
      card.element = generateCardElement(card);
      self._cardsContainerElement.appendChild(card.element);

      if (dotsNavigation) {
        card.dotElement = generateDotElement(card);
        self._dotsContainerElement.appendChild(card.dotElement);
      }
    });

    self.activeCardId = activeCardId || self._cards[0].id;
  }

  init();

  return this;
}

export default CardChanger;
