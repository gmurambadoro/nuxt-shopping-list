// Shared types used by both app/ and server/
// We will expand this as the project grows.

export interface ShoppingList {
  id: string
  name: string
  createdAt: string
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  purchased: boolean
}
