export type SseEvent = {
  type: 'item-added' | 'item-updated' | 'item-removed'
  data: Record<string, unknown>
}

export function useListEvents(listId: string) {
  const latestEvent = ref<SseEvent | null>(null)

  let eventSource: EventSource | null = null

  function connect() {
    disconnect()
    eventSource = new EventSource(`/api/lists/${listId}/events`)

    eventSource.addEventListener('item-added', (e) => {
      latestEvent.value = { type: 'item-added', data: JSON.parse(e.data) }
    })
    eventSource.addEventListener('item-updated', (e) => {
      latestEvent.value = { type: 'item-updated', data: JSON.parse(e.data) }
    })
    eventSource.addEventListener('item-removed', (e) => {
      latestEvent.value = { type: 'item-removed', data: JSON.parse(e.data) }
    })
  }

  function disconnect() {
    eventSource?.close()
    eventSource = null
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { latestEvent }
}
