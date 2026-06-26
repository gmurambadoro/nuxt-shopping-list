import { EventEmitter } from 'node:events'

type SseMessage = { event: string; data: unknown }

const emitter = new EventEmitter()

export function subscribeToList(listId: string, callback: (msg: SseMessage) => void) {
  emitter.on(listId, callback)
  return () => { emitter.off(listId, callback) }
}

export function broadcastToList(listId: string, event: string, data: unknown) {
  emitter.emit(listId, { event, data })
}
