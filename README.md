## garbage-recycle [![garbage-recycle](https://img.shields.io/npm/v/garbage-recycle.svg)](https://npmjs.org/garbage-recycle)

> 🚮中国垃圾分类查询

### Installation

```bash
$ npm install garbage-recycle
```

### Example

```js
const garbageRecycle = require('garbage-recycle');

(async () => {

    console.log(garbageRecycle.categories);

    const search = await garbageRecycle();
    const results = await search('小龙虾');
    console.log(results);
    
})();

```

server example

```js
const garbageRecycle = require('garbage-recycle');

garbageRecycle.createServer(server => {
  server.listen(3000, () => {
    console.log('server is running at ', server.address()); 
  });
});
```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### ISC

This work is licensed under the [ISC license](./LICENSE).

---