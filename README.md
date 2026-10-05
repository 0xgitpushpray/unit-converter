# Unit Converter

A simple server-rendered web app that converts between units of measurement. No database and no dependencies, just Node.js.

## Features

- **Length:** millimeter, centimeter, meter, kilometer, inch, foot, yard, mile
- **Weight:** milligram, gram, kilogram, ounce, pound
- **Temperature:** Celsius, Fahrenheit, Kelvin

Each category has its own page (`/length`, `/weight`, `/temperature`). The form posts back to the same page and the server renders the converted value.

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
- `converters.js`: unit definitions and conversion logic
- `public/style.css`: styling
- `test.js`: conversion tests
