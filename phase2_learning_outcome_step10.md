# Phase 2 — Learning Outcome Step 10: Full CRUD with Create & Delete Lists

## Concepts covered

### UI state vs application state
`showAddForm` lives in `index.vue` as a plain `ref` — not in the composable.

**Rule of thumb:** if only one component needs to know about a piece of state, keep it local. The composable should only hold state that is shared across components or that needs to be persisted. A form visibility toggle is purely a UI concern and has no place in the composable.

### Inline event handlers vs named functions
```html
<!-- Inline expression — single statement, no extraction needed -->
@cancel="showAddForm = false"

<!-- Named function — multiple statements justify extraction -->
@submit="handleAddList"
```

An inline expression keeps things concise when there is only one thing to do.
Extract to a function when:
- There are multiple statements (call `addList` + close the form)
- There is any branching logic
- The expression is hard to read at a glance

Both approaches are valid. The choice is about readability, not correctness.

### Component encapsulation with emits
`AddListForm.vue` owns its own input field, validation, and local ref for the
name. It emits `submit` with the name or `cancel` — it has no knowledge of
lists, the composable, or how the data will be used.

```
AddListForm        ← owns the input, validation, emit submit/cancel
  └── index.vue   ← handles visibility (showAddForm) and what happens on submit
```

This makes `AddListForm` reusable anywhere a name-collection prompt is needed,
not just for list creation.

### Trash icon with SVG
The delete button uses an inline SVG for the trash icon rather than an icon
library. For a few small icons this avoids an unnecessary dependency. If the
app accumulates many icons, consider an icon library or a reusable `Icon`
component.

### Pluralised label
A simple ternary in the template handles English pluralisation:
```html
{{ lists.length }} {{ lists.length === 1 ? 'list' : 'lists' }}
```
This avoids "1 lists" without pulling in a utility library. For more complex
i18n, use `vue-i18n` or Nuxt's `@nuxtjs/i18n` module.

## Completed feature set (Phase 2)

| Action | Composable function | UI location |
|---|---|---|
| Create list | `addList` | New list form in `AddListForm.vue` |
| Delete list | `removeList` | Trash icon in `ShoppingList.vue` header |
| Add item | `addItem` | Form in `ShoppingList.vue` footer |
| Remove item | `removeItem` | Hover × on `ShoppingItem.vue` |
| Toggle purchased | `toggleItem` | Checkbox in `ShoppingItem.vue` |
| Clear purchased | `clearPurchased` | Footer button in `ShoppingList.vue` |
