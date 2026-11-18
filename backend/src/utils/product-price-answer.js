const PRICE_QUESTION_PATTERN = /\b(?:precios?|cu[aá]nt[oa]s?|costos?|cuestan?|valen?|sale)\b/i;
const BUDGET_QUERY_PATTERN =
  /\b(?:recomiend\w*|recomend\w*|sugier\w*|presupuesto|alcanz\w*|menos\s+de|menor(?:es)?\s+(?:a|que)|hasta|maximo)\b/;
const GENERIC_PRODUCT_WORDS = new Set([
  'a',
  'al',
  'con',
  'de',
  'del',
  'el',
  'en',
  'la',
  'las',
  'los',
  'para',
  'por',
  'un',
  'una',
  'y'
]);

function normalizeText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMentionedProducts(text, products) {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedNames = products.map((product) => normalizeText(product.nombre));
  const exactMatches = products.filter((_, index) =>
    normalizedText.includes(` ${normalizedNames[index]} `)
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const tokensByProduct = normalizedNames.map((name) =>
    [...new Set(name.split(' ').filter((token) => token && !GENERIC_PRODUCT_WORDS.has(token)))]
  );
  const tokenFrequency = new Map();

  for (const tokens of tokensByProduct) {
    for (const token of tokens) {
      tokenFrequency.set(token, (tokenFrequency.get(token) ?? 0) + 1);
    }
  }

  const textTokens = new Set(normalizedText.trim().split(/\s+/));
  return products.filter((_, index) =>
    tokensByProduct[index].some(
      (token) => tokenFrequency.get(token) === 1 && textTokens.has(token)
    )
  );
}

function formatProductPrice(product) {
  const price = product.precio_bob;
  if (price === null || price === undefined || String(price).trim() === '') {
    return `El precio de ${product.nombre} no está registrado actualmente.`;
  }

  const presentation = product.tamanio_presentacion
    ? ` (${product.tamanio_presentacion})`
    : '';
  return `El precio registrado de ${product.nombre} es Bs. ${String(price).trim()}${presentation}.`;
}

function getLatestUserMessage(history) {
  if (!Array.isArray(history)) {
    return null;
  }

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    if (
      message &&
      (message.sender === 'user' || message.role === 'user') &&
      typeof (message.text || message.content) === 'string'
    ) {
      return message.text || message.content;
    }
  }

  return null;
}

function getProductPriceAnswer(prompt, products, history = []) {
  if (!PRICE_QUESTION_PATTERN.test(prompt)) {
    return null;
  }

  const currentMatches = findMentionedProducts(prompt, products);
  if (currentMatches.length > 0) {
    return currentMatches.map(formatProductPrice).join('\n');
  }

  const normalizedPrompt = normalizeText(prompt);
  if (BUDGET_QUERY_PATTERN.test(normalizedPrompt)) {
    return null;
  }

  const previousUserMessage = getLatestUserMessage(history);
  if (previousUserMessage) {
    const previousMatches = findMentionedProducts(previousUserMessage, products);
    if (previousMatches.length > 0) {
      return previousMatches.map(formatProductPrice).join('\n');
    }
  }

  return 'No identifiqué el producto en el menú. Dime su nombre como aparece en la carta para consultar su precio registrado.';
}

module.exports = getProductPriceAnswer;
