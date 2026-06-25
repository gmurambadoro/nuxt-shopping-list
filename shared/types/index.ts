export interface ShoppingList {
  id: string
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
