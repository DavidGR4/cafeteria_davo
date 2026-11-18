const assert = require('node:assert/strict');
const test = require('node:test');
const getProductPriceAnswer = require('../src/utils/product-price-answer');

const products = [
  {
    nombre: 'Flat White Australiano',
    precio_bob: '25.00',
    tamanio_presentacion: 'Vaso 200 ml'
  },
  {
    nombre: 'Cappuccino Italiano Texturizado',
    precio_bob: '24.00',
    tamanio_presentacion: 'Taza 240 ml'
  }
];

test('answers a known product price from the database row', () => {
  assert.equal(
    getProductPriceAnswer('¿Cuánto cuesta el flat white australiano?', products),
    'El precio registrado de Flat White Australiano es Bs. 25.00 (Vaso 200 ml).'
  );
});

test('matches an unambiguous shortened product name', () => {
  assert.equal(
    getProductPriceAnswer('¿Cuál es el precio del flat white?', products),
    'El precio registrado de Flat White Australiano es Bs. 25.00 (Vaso 200 ml).'
  );
});

test('uses the previous user product for a price follow-up, not the bot price', () => {
  const history = [
    { sender: 'user', text: '¿Cuánto cuesta el Flat White Australiano?' },
    { sender: 'bot', text: 'Cuesta Bs. 28.' }
  ];

  assert.equal(
    getProductPriceAnswer('¿Y el precio sigue igual?', products, history),
    'El precio registrado de Flat White Australiano es Bs. 25.00 (Vaso 200 ml).'
  );
});

test('leaves budget recommendations to the chatbot', () => {
  assert.equal(
    getProductPriceAnswer('¿Qué productos cuestan menos de 30 Bs?', products),
    null
  );
});

test('does not let the model invent a price for an unidentified product', () => {
  assert.match(
    getProductPriceAnswer('¿Cuánto cuesta el té matcha?', products),
    /No identifiqué el producto/
  );
});
