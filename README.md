# Unit Converter

A fast unit converter with a carpenter's-rule look: boxwood-yellow working surface on ink, a live tick-mark scale that shows where your answer sits, and every unit of the category at a glance. Server-rendered, works without JavaScript, no database, no dependencies, just Node.js.

## Features

- **Length:** millimeter, centimeter, meter, kilometer, inch, foot, yard, mile
- **Weight:** milligram, gram, kilogram, ounce, pound
- **Temperature:** Celsius, Fahrenheit, Kelvin
- **Area:** square mm/cm/m/km, hectare, acre, square inch/foot/yard/mile
- **Volume (US):** milliliter, liter, cubic meter, teaspoon, tablespoon, fluid ounce, cup, pint, quart, gallon
- **Speed:** m/s, km/h, mph, knot, ft/s
- **Time:** millisecond, second, minute, hour, day, week

Each category has its own page (`/length`, `/weight`, `/temperature`, `/area`, `/volume`, `/speed`, `/time`). Without JavaScript the form posts back to the same page and the server renders the result. With JavaScript the answer updates as you type, you can swap units, copy the result, click a unit in the table to make it the target, and share a link such as `/length?value=12&from=inch&to=centimeter`.

## Run

Requires Node.js 18 or newer.

```bash
npm start
```

Then open http://localhost:3000. Set the `PORT` environment variable to use another port.

## Test

```bash
npm test
```

## Structure

- `server.js`: HTTP server, routing and HTML rendering
- `converters.js`: unit definitions and conversion logic (loaded by Node and by the browser)
- `public/style.css`: styling
- `public/app.js`: live conversion, swap, copy, scale
- `DESIGN.md`: the visual system
- `test.js`: conversion tests
