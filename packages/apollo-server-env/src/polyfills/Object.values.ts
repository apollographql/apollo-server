if (!global.Object.values) {
  global.Object.values = function(object: any) {
    return Object.keys(object).map(key => object[key]);
  };
}
