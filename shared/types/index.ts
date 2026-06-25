export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface ShoppingList {
  id: string
  userId: string
  name: string
  createdAt: string
  updatedAt: string
  items: ShoppingItem[]
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  purchased: boolean
  createdAt: string
}
