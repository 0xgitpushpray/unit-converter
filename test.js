const assert = require('assert');
const { convert, format } = require('./converters');

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
assert.throws(() => convert('temperature', -300, 'Celsius', 'Kelvin'));
assert.throws(() => convert('length', NaN, 'meter', 'foot'));
assert.throws(() => convert('length', 1, 'meter', 'parsec'));
console.log('All tests passed');
