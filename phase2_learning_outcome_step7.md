# Learning Outcomes — Step 7: Making the List Interactive

## Concepts covered

### `ref<T>()`
Wraps a value in a reactive container. Reading it in script requires `.value`; in the template Vue unwraps it automatically. Because the array items are plain objects inside a `ref`, Vue makes them deeply reactive — mutating a nested property like `item.purchased = true` triggers a re-render without needing to replace the whole array.

### `defineEmits<T>()`
The TypeScript generic form lets you declare emit names and their payload types in one place.

```ts
const emit = defineEmits<{
  toggle: []              // no payload
  addItem: [name: string] // one string argument
}>()
```

This gives you type checking at every call site. If you emit the wrong payload type, TypeScript will catch it at build time.

### Props down, events up
State lives in the parent. Children signal intent via `$emit`. The parent performs the mutation. This keeps each component focused on a single responsibility.

```
index.vue           owns state, handles mutations
  └── ShoppingList    forwards events with item.id attached
        └── ShoppingItem   emits 'toggle' and 'remove' (no payload needed)
```

`ShoppingItem` doesn't know lists exist — it just says "I was toggled". `ShoppingList` forwards that with the item id. `index.vue` does the actual state mutation.

### camelCase emits → kebab-case listeners
Vue automatically converts camelCase emit names to kebab-case event listeners in the template. `toggleItem` emitted in the component becomes `@toggle-item` in the parent. Either casing works on both sides — pick one convention and be consistent.

### `$event` in templates
In an inline event handler, `$event` refers to the first argument of the emitted payload:

```html
@add-item="addItem(list.id, $event)"
```

This is equivalent to the longer arrow function form:

```html
@add-item="(name) => addItem(list.id, name)"
```

Use the arrow function form when you need to be more explicit, or when there are multiple arguments.

### `@submit.prevent`
Vue event modifiers let you call `event.preventDefault()` without writing it in the handler. `.prevent` is the most common; others include `.stop` (stopPropagation), `.once` (fire once), and `.self` (only trigger if the event target is the element itself).
