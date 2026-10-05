const assert = require('assert');
const { categories, convert, format } = require('./converters');

const eq = (cat, v, f, t, expected) =>
  assert.strictEqual(format(convert(cat, v, f, t)), String(expected), `${v} ${f} -> ${t}`);

eq('length', 1, 'mile', 'kilometer', 1.609344);
eq('length', 12, 'inch', 'foot', 1);
eq('length', 100, 'centimeter', 'meter', 1);
eq('weight', 1, 'pound', 'ounce', 16);
eq('weight', 1, 'kilogram', 'gram', 1000);
eq('temperature', 100, 'Celsius', 'Fahrenheit', 212);
eq('temperature', 32, 'Fahrenheit', 'Celsius', 0);
eq('temperature', 0, 'Celsius', 'Kelvin', 273.15);
eq('area', 1, 'acre', 'square foot', 43560);
eq('area', 1, 'hectare', 'square meter', 10000);
eq('area', 1, 'square kilometer', 'hectare', 100);
eq('volume', 1, 'gallon', 'quart', 4);
eq('volume', 1, 'liter', 'milliliter', 1000);
eq('volume', 1, 'cup', 'tablespoon', 16);
eq('volume', 1, 'tablespoon', 'teaspoon', 3);
eq('speed', 1, 'mile per hour', 'kilometer per hour', 1.609344);
eq('speed', 36, 'kilometer per hour', 'meter per second', 10);
eq('speed', 1, 'knot', 'kilometer per hour', 1.852);
eq('time', 1, 'day', 'hour', 24);
eq('time', 1, 'week', 'day', 7);
eq('time', 1500, 'millisecond', 'second', 1.5);

// every unit has a display symbol, and every category converts to itself unchanged
for (const [key, cat] of Object.entries(categories)) {
  for (const u of Object.keys(cat.units)) {
    assert.ok(cat.symbols[u], `${key}/${u} has a symbol`);
    eq(key, 42, u, u, 42);
  }
}
assert.throws(() => convert('temperature', -300, 'Celsius', 'Kelvin'));
assert.throws(() => convert('length', NaN, 'meter', 'foot'));
assert.throws(() => convert('length', 1, 'meter', 'parsec'));
console.log('All tests passed');
