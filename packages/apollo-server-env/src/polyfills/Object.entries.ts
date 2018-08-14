if (!global.Object.entries) {
  global.Object.entries = function(object: any) {
    return Object.keys(object).map(key => [key, object[key]] as [string, any]);
  };
}
