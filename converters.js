// Linear categories: each unit stores its size relative to a base unit.
// Temperature is not linear, so it converts through Celsius.
const categories = {
  length: {
    title: 'Length',
    symbols: { millimeter: 'mm', centimeter: 'cm', meter: 'm', kilometer: 'km', inch: 'in', foot: 'ft', yard: 'yd', mile: 'mi' },
    units: {
      millimeter: 0.001,
      centimeter: 0.01,
      meter: 1,
      kilometer: 1000,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.344,
    },
  },
  weight: {
    title: 'Weight',
    symbols: { milligram: 'mg', gram: 'g', kilogram: 'kg', ounce: 'oz', pound: 'lb' },
    units: {
      milligram: 0.000001,
      gram: 0.001,
      kilogram: 1,
      ounce: 0.028349523125,
      pound: 0.45359237,
    },
  },
  temperature: {
    title: 'Temperature',
    symbols: { Celsius: '°C', Fahrenheit: '°F', Kelvin: 'K' },
    units: { Celsius: null, Fahrenheit: null, Kelvin: null },
  },
  area: {
    title: 'Area',
    symbols: {
      'square millimeter': 'mm²', 'square centimeter': 'cm²', 'square meter': 'm²', hectare: 'ha',
      'square kilometer': 'km²', 'square inch': 'in²', 'square foot': 'ft²', 'square yard': 'yd²',
      acre: 'ac', 'square mile': 'mi²',
    },
    units: {
      'square millimeter': 0.000001,
      'square centimeter': 0.0001,
      'square meter': 1,
      hectare: 10000,
      'square kilometer': 1000000,
      'square inch': 0.00064516,
      'square foot': 0.09290304,
      'square yard': 0.83612736,
      acre: 4046.8564224,
      'square mile': 2589988.110336,
    },
  },
  // US customary volumes (US teaspoon, tablespoon, fluid ounce, cup, pint, quart, gallon).
  volume: {
    title: 'Volume',
    symbols: {
      milliliter: 'mL', liter: 'L', 'cubic meter': 'm³', teaspoon: 'tsp', tablespoon: 'tbsp',
      'fluid ounce': 'fl oz', cup: 'cup', pint: 'pt', quart: 'qt', gallon: 'gal',
    },
    units: {
      milliliter: 0.001,
      liter: 1,
      'cubic meter': 1000,
      teaspoon: 0.00492892159375,
      tablespoon: 0.01478676478125,
      'fluid ounce': 0.0295735295625,
      cup: 0.2365882365,
      pint: 0.473176473,
      quart: 0.946352946,
      gallon: 3.785411784,
    },
  },
  speed: {
    title: 'Speed',
    symbols: { 'meter per second': 'm/s', 'kilometer per hour': 'km/h', 'mile per hour': 'mph', knot: 'kn', 'foot per second': 'ft/s' },
    units: {
      'meter per second': 1,
      'kilometer per hour': 1 / 3.6,
      'mile per hour': 0.44704,
      knot: 1852 / 3600,
      'foot per second': 0.3048,
    },
  },
  time: {
    title: 'Time',
    symbols: { millisecond: 'ms', second: 's', minute: 'min', hour: 'h', day: 'd', week: 'wk' },
    units: {
      millisecond: 0.001,
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
    },
  },
};

const toCelsius = {
  Celsius: (v) => v,
  Fahrenheit: (v) => ((v - 32) * 5) / 9,
  Kelvin: (v) => v - 273.15,
};
const fromCelsius = {
  Celsius: (c) => c,
  Fahrenheit: (c) => (c * 9) / 5 + 32,
  Kelvin: (c) => c + 273.15,
};

function convert(category, value, from, to) {
  const cat = categories[category];
  if (!cat) throw new Error('Unknown category');
  if (!(from in cat.units) || !(to in cat.units)) throw new Error('Unknown unit');
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Please enter a valid number');

  if (category === 'temperature') {
    const c = toCelsius[from](value);
    if (c < -273.15 - 1e-9) throw new Error('Temperature is below absolute zero');
    return fromCelsius[to](c);
  }
  return (value * cat.units[from]) / cat.units[to];
}

// Round away floating point noise (e.g. 0.30000000000000004) without losing precision.
function format(n) {
  return String(parseFloat(n.toPrecision(10)));
}

// One file for both runtimes: Node requires it, the browser loads it as a plain script.
const api = { categories, convert, format };
if (typeof module === 'object' && module.exports) module.exports = api;
else globalThis.Converters = api;
