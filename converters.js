// Linear categories: each unit stores its size relative to a base unit.
// Temperature is not linear, so it converts through Celsius.
const categories = {
  length: {
    title: 'Length',
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
    units: { Celsius: null, Fahrenheit: null, Kelvin: null },
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

module.exports = { categories, convert, format };
