const garbageRecycle = require('..');


(async () => {

  console.log(garbageRecycle.categories);

  const search = await garbageRecycle();
  const results = await search('一次性');
  console.log(results);

})();