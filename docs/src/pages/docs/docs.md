# Docs



## VNode

Barebones hello world

<div class="tabs-group">
<details><summary>Raw syntax</summary>

```typescript
const app: VNode = {
  tag: 'div',
  children: [
    {
      tag: 'h1',
      children: 'Hello world'
    },
    {
      tag: 'img',
      props: {  
        src: 'https://cool-site.com/frog.jpg',
        alt: 'Frog doing backflip'
      }
    },
  ]
};
```
</details>

<details><summary>Raw syntax</summary>

```typescript
const app: VNode = {
  tag: 'div',
  children: [
    {
      tag: 'h1',
      children: 'Hello world'
    },
    {
      tag: 'img',
      props: {  
        src: 'https://cool-site.com/frog.jpg',
        alt: 'Frog doing backflip'
      }
    },
  ]
};
```
</details>
</div>