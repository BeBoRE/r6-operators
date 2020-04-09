function operatorValue(operator) {
  let value = 1;
  operator.gadgets.forEach((gadget) => {
    if (gadget === 'C4') value *= 1;
    if (gadget === 'IMPACT') value *= 2;
    if (gadget === 'SHIELD') value *= 3;
    if (gadget === 'BARBED') value *= 4;
    if (gadget === 'CAM') value *= 5;
  });

  return value;
}

function compareOperators(operator1, operator2) {
  return operatorValue(operator1) - operatorValue(operator2);
}

const operatorsSorted = data.operators.sort(compareOperators);

const removeHash = (hex) => (hex.charAt(0) === '#' ? hex.slice(1) : hex);

const parseHex = (nakedHex) => {
  const isShort = (
    nakedHex.length === 3
    || nakedHex.length === 4
  );

  const twoDigitHexR = isShort ? `${nakedHex.slice(0, 1)}${nakedHex.slice(0, 1)}` : nakedHex.slice(0, 2);
  const twoDigitHexG = isShort ? `${nakedHex.slice(1, 2)}${nakedHex.slice(1, 2)}` : nakedHex.slice(2, 4);
  const twoDigitHexB = isShort ? `${nakedHex.slice(2, 3)}${nakedHex.slice(2, 3)}` : nakedHex.slice(4, 6);
  const twoDigitHexA = ((isShort ? `${nakedHex.slice(3, 4)}${nakedHex.slice(3, 4)}` : nakedHex.slice(6, 8)) || 'ff');

  // const numericA = +((parseInt(a, 16) / 255).toFixed(2));

  return {
    r: twoDigitHexR,
    g: twoDigitHexG,
    b: twoDigitHexB,
    a: twoDigitHexA,
  };
};

const hexToDecimal = (hex) => parseInt(hex, 16);

const hexesToDecimals = ({
  r, g, b, a,
}) => ({
  r: hexToDecimal(r),
  g: hexToDecimal(g),
  b: hexToDecimal(b),
  a: +((hexToDecimal(a) / 255).toFixed(2)),
});

/**
 * @typedef Rgba
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */

/**
 * Turns an old-fashioned css hex color value into a rgb color value.
 *
 * If you specify an alpha value, you'll get a rgba() value instead.
 *
 * @param hex The hex value to convert. ('123456'. '#123456', ''123', '#123')
 * @return {Rgba} An rgb or rgba value. ('rgb(11, 22, 33)'. 'rgba(11, 22, 33, 0.5)')
 */
const hexToRgba = (hex) => {
  const hashlessHex = removeHash(hex);
  const hexObject = parseHex(hashlessHex);
  const decimalObject = hexesToDecimals(hexObject);

  return decimalObject;
};

/**
 * Calculate relitive luminance
 * @param {Rgba} color
 * @returns {number} relitive luminance
 */
const relitiveLuminance = (color) => {
  const Rs = color.r / 255;
  const Gs = color.g / 255;
  const Bs = color.b / 255;

  let R;
  if (Rs <= 0.03928) R = Rs / 12.92;
  else R = ((Rs + 0.055) / 1.055) ** 2.4;

  let G;
  if (Gs <= 0.03928) G = Gs / 12.92;
  else G = ((Gs + 0.055) / 1.055) ** 2.4;

  let B;
  if (Bs <= 0.03928) B = Bs / 12.92;
  else B = ((Bs + 0.055) / 1.055) ** 2.4;

  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return L;
};

/**
 * Calculates the color contrast
 * @param {Rgba} source
 * @param {Rgba} destination
 */
const calculateContrast = (source, destination) => {
  const finalR = source.a * (source.r - destination.r) + destination.r;
  const finalG = source.a * (source.b - destination.g) + destination.g;
  const finalB = source.a * (source.g - destination.b) + destination.b;

  const finalL = relitiveLuminance({ r: finalR, g: finalG, b: finalB });
  const sourceL = relitiveLuminance(destination);

  const contrast = (Math.max(finalL, sourceL) + 0.05) / (Math.min(finalL, sourceL) + 0.05);

  if (contrast < 1) return 1 / contrast;
  return contrast;
};

/** @typedef {import('vue/types/vue')} Vue */

/** @type {Vue} */
const { Vue } = window;

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#vueApp',
  data: {
    operators: { ...operatorsSorted },
  },
  methods: {
    filterOps(gadgetType) {
      if (gadgetType) {
        this.operators = operatorsSorted.filter((operator) => {
          let hasGadget = false;
          operator.gadgets.forEach((gadget) => {
            if (gadget === gadgetType) hasGadget = true;
          });
          return hasGadget;
        });
      } else {
        this.operators = { ...operatorsSorted };
      }
    },
    bestRatio(hex) {
      const destination = hexToRgba(hex);
      const lightHex = '#FFFD';
      const darkHex = '#000C';

      const light = hexToRgba(lightHex);
      const dark = hexToRgba(darkHex);

      const lightContrast = calculateContrast(light, destination);
      const darkContrast = calculateContrast(dark, destination);

      console.log(`Light contrast: ${lightContrast}`);
      console.log(`Dark contrast: ${darkContrast}`);

      if (lightContrast > darkContrast) return lightHex;
      return darkHex;
    },
  },
});
