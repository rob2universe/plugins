/**
 * Check whether camunda:property is a input or output property.
 *
 * @param {ModdleElement} prop
 *
 * @return {boolean}
 */
export function isIoProperty(prop) {

  const {
    name,
    value
  } = prop;

  return /^(input|output):/.test(name);
}

export function parseIoPropertyValue(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
}

/**
 * Parse <camunda:property name="{input|output}:$variableName" value="$type;$description" />.
 *
 * @param {ModdleElement} prop
 *
 * @return {Object}
 */
export function parseIoProperty(prop) {

  const [
    _0,
    type,
    name
  ] = /^(input|output):(.*)/.exec(prop.name);

  const [
    _1,
    dataType,
    description
  ] = /^([^;]+);(.*)/s.exec(prop.value);

  return {
    name,
    type,
    dataType,
    description
  };
}

export function getIoPropertyProps(options) {

  var {
    name,
    type,
    dataType,
    description
  } = options;

  var propertyName = `${type}:${name}`;

  var propertyValue = `${dataType};${description}`;

  return {
    name: propertyName,
    value: propertyValue
  };
}

export function createIoProperty(factory, options) {
  return factory.create('camunda:Property', getIoPropertyProps(options));
}