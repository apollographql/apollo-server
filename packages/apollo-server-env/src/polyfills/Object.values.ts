interface ObjectConstructor {
  /**
   * Returns an array of values of the enumerable properties of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  values<T>(o: { [s: string]: T } | ArrayLike<T>): T[];
}

if (!global.Object.values) {
  global.Object.values = function(o) {
    return Object.keys(o).map(key => o[key]);
  };
}
