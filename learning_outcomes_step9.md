# Learning Outcomes — Step 9: Purchased Toggle, computed(), and Empty States

## Concepts covered

### `computed()`
Derives a value from reactive state. It is **lazy and cached** — it only
recalculates when its dependencies change, and returns the cached result on
every other read.

```ts
const purchasedItems = computed(() => props.list.items.filter(item => item.purchased))
const remainingItems = computed(() => props.list.items.filter(item => !item.purchased))
const progressPct    = computed(() =>
  props.list.items.length
    ? Math.round((purchasedItems.value.length / props.list.items.length) * 100)
    : 0
)
```

The previous inline `.filter()` calls in the template ran on every render
regardless of whether the data changed. `computed` means the filtering only
runs when `props.list.items` actually changes, and all three values are derived
consistently from the same source.

### Separating items into two visual groups
Rather than a single `v-for` with conditional styling, purchased and remaining
items are rendered as two separate loops with a visual divider in between.

```html
<ShoppingItem v-for="item in remainingItems" ... />
<li v-if="remainingItems.length && purchasedItems.length"> <!-- divider --> </li>
<ShoppingItem v-for="item in purchasedItems" ... />
```

This makes the list easier to scan — unchecked items are always at the top.

### Conditional rendering with `v-if`
`v-if` completely removes an element from the DOM when its condition is false.
It was used in two places:

1. The section divider — only rendered when both groups are non-empty, avoiding
   a floating separator with nothing on one side.
2. The "Clear purchased" button — only rendered when there are purchased items
   to clear, avoiding a permanently visible button that does nothing.

Compare with `v-show`, which keeps the element in the DOM but toggles
`display: none`. Use `v-if` when the element is conditionally meaningless;
use `v-show` when you are toggling visibility frequently and want to avoid
repeated mount/unmount cost.

### Empty state
When the items array is empty, a descriptive message replaces the blank list.
Always account for empty states — they turn a confusing blank space into a
clear prompt for the user.

```html
<p v-if="!list.items.length" class="...">
  No items yet. Add one below.
</p>
```

### Keeping actions in the composable
`clearPurchased` was added to `useShoppingLists` rather than handled inline in
the component. This keeps the composable the single source of truth for all
state mutations, and means the logic is automatically persisted to localStorage
via the existing `watch` without any extra wiring.
