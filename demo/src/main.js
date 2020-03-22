import CardChanger from 'card-changer';

const makeCardFront = ({ pan, color }) =>
  `
  <div class="card front" style="background-color: ${color}">
    <div class="pan">${pan}</div>
  </div>
  `;

const makeCardBack = ({ text = '', color = '#eee' }) =>
  `
  <div class="card back" style="background-color: ${color}">
    <div class="pan">${text}</div>
  </div>
  `;

const cards = [
  {
    id: 'card1',
    frontContent: makeCardFront({ pan: '4485 6949 5850 1138', color: '#d9577c' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
  {
    id: 'card2',
    frontContent: makeCardFront({ pan: '5488 4098 4392 1365', color: '#76e856' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
  {
    id: 'card3',
    frontContent: makeCardFront({ pan: '5273 3166 5145 1675', color: '#4c90a1' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
  {
    id: 'card4',
    frontContent: makeCardFront({ pan: '4556 1113 4396 4008', color: '#e6634c' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
  {
    id: 'card5',
    frontContent: makeCardFront({ pan: '3013 7831 3642 3141', color: '#41c47c' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
  {
    id: 'card6',
    frontContent: makeCardFront({ pan: '3694 7476 1867 9614', color: '#8f476a' }),
    backContent: makeCardBack({ text: 'back here' }),
  },
];

const cardChanger = new CardChanger(document.querySelector('#root'), {
  cards,
  activeCardId: 'card1',
  stackSize: 3,
  stackHeight: 40,
  keepChangeOrder: true,
});

let activeCardIdx = 0;

const selectCardElement = document.createElement('select');
selectCardElement.innerHTML = cards.reduce((acc, item, idx) => {
  acc += `<option value="${idx}">${idx} - ${item.id}</option>`;
  return acc;
}, '');
document.querySelector('#controls').appendChild(selectCardElement);
selectCardElement.addEventListener('keydown', (event) => {
  event.preventDefault();
});

const rotateButtonElement = document.createElement('button');
rotateButtonElement.innerHTML = 'Rotate active card';
rotateButtonElement.addEventListener('click', () => {
  cardChanger.rotate();
});
document.querySelector('#controls').appendChild(rotateButtonElement);

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      activeCardIdx -= 1;
      if (activeCardIdx === -1) {
        activeCardIdx = cards.length - 1;
      }
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      activeCardIdx += 1;
      activeCardIdx = activeCardIdx % cards.length;
      break;
  }
  cardChanger.activeCardId = cards[activeCardIdx].id;
  selectCardElement.value = activeCardIdx;
});

selectCardElement.addEventListener('change', (event) => {
  activeCardIdx = event.target.value;
  cardChanger.activeCardId = cards[event.target.value].id;
});

cardChanger.on('change', (cardId) => {
  activeCardIdx = cards.findIndex((i) => i.id === cardId);
  selectCardElement.value = activeCardIdx;
});
