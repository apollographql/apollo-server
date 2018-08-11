if (!global.Object.values) {
  global.Object.values = function(o: any) {
    return Object.keys(o).map(key => o[key]);
  };
}
