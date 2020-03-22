# Card-changer

Cards stack UI lib

## Usage

Install lib

```sh
npm install card-changer
```

Make root container for card-changer

```html
<div id="root"></div>
```

Init card changer

```js
import CardChanger from "card-changer";

const cardChanger = new CardChanger(document.querySelector("#root"), {
  cards: [
    {
      id: "card1",
      frontContent: "...", // HTML content or element with front card content
      backContent: "...", // HTML content or element with back card content
    },
    {
      id: "card2",
      frontContent: "...",
      backContent: "...",
    },
    // ...
  ],
  activeCardId: "card1",
  stackSize: 3,
  stackHeight: 40,
});
```

## API

### Options

...

### Methods

...

### Events

...
