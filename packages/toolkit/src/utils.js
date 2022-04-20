const isBool = (v) => {
  return typeof v === 'boolean';
}

const isString = (v) => {
  return typeof v === 'string';
}

const isNumber = (v) => {
  return typeof v === 'number';
}

const isBinary = (v) => {
  return v.startsWith('base64:');
}


const paramType = (v) => {
  if (isBool(v)) {
    return 'boolean';
  }

  if (isString(v)) {
    return 'string';
  }

  if (isNumber(v)) {
    return 'integer';
  }

  if (isBinary(v)) {
    return 'binary';
  }

  throw new Error('Unexpected value type');
}


module.exports = {
  isBool,
  isString,
  isNumber,
  isBinary,
  paramType
}