## Intro
@iron-man/container-api React多端容器

## start-up

``` shell
npm run bootstrap
npm run start
npm run build:typing
```
copy `packages/container-api/lib` to Demo `/context`;

![alt](https://user-images.githubusercontent.com/28922129/120215185-04550480-c268-11eb-95db-837e643206fc.png)


## Use
> assets entry: https://0.0.0.0:7105/index.js

[webpack external](https://webpack.js.org/configuration/externals/#externals) 搭配 requirejs

third party config
``` js
// webpack.config.js
module.exports = {
  externals: {
    '@iron-man/container-api': '@iron-man/container-api'
  }
}
```

template html
```html
<script src="//cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.min.js"></script>
<script>
window.requirejs.config({ 
  paths: {
    "@iron-man/container-web-api": "//0.0.0.0:7105/index"
  } 
})
</script>
```

Define `src/typing/@iron-man/container-api`

```ts
import type * as ContainerAPI from '../../context/index';

declare module '@iron-man/container-api' {
  export = ContainerAPI;
}
```

``` tsx
function ChatList() {
  const container = useContext(containerContext);
  const { ComponentLoader, navAPI } = container;
  return (
    <div className="chat-list">
      <div>
        <ComponentLoader
          componentURI="https://0.0.0.0:8082/todoList"
          props={{
            title: '蔬菜',
            itemList: ['🥒', '🥔', '🎃'],
          }}
        />
        <ComponentLoader
          componentURI="group://todoList#TodoList"
          props={{
            title: '水果',
            itemList: ['🍌', '🍊', '🍐', '🍉'],
          }}
        />
      </div>
    </div>
  );
}
function ContainerDemo(): ReactElement {
  return (
    <div className="container">
      <Container cacheOptions={[/^(group:\/\/)?chat(\.[A-Za-z0-9_-]+)?(#\w+)?$/i]}>
        <ChatList />
      </Container>
    </div>
  );
}
```