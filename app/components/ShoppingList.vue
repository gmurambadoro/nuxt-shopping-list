<script setup lang="ts">
import type { ShoppingList } from '~/shared/types'

const props = defineProps<{
  list: ShoppingList
}>()

const emit = defineEmits<{
  toggleItem:     [itemId: string]
  removeItem:     [itemId: string]
  addItem:        [name: string]
  clearPurchased: []
  removeList:     []
}>()

const newItemName = ref('')
const shareModal = ref<InstanceType<typeof ShareModal>>()

// computed() derives a value from reactive state and caches the result.
// These only recalculate when props.list.items changes — unlike inline
// .filter() calls in the template, which re-run on every render.
const purchasedItems = computed(() => props.list.items.filter(item => item.purchased))
const remainingItems = computed(() => props.list.items.filter(item => !item.purchased))

// progressPct depends on purchasedItems, so it is also only recalculated
// when the underlying items change. The ternary guards against division by zero
// when the list is empty.
const progressPct = computed(() =>
  props.list.items.length
    ? Math.round((purchasedItems.value.length / props.list.items.length) * 100)
    : 0
)

function submitNewItem() {
  const name = newItemName.value.trim()
  if (!name) return
  emit('addItem', name)
  newItemName.value = ''
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900">{{ list.name }}</h2>
        <p class="text-xs text-gray-400 mt-0.5">Created {{ list.createdAt.slice(0, 10) }}</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- purchasedItems.length reads the cached computed value, not a new filter call -->
        <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {{ purchasedItems.length }}/{{ list.items.length }} done
        </span>

        <!-- Share button — opens the ShareModal -->
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xs"
          title="Share list"
          @click="shareModal?.open()"
        >
          Share
        </button>

        <!-- Delete list button — emits removeList to the parent to handle -->
        <button
          class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
          title="Delete list"
          @click="emit('removeList')"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Progress bar: width is driven by the progressPct computed value -->
    <div class="h-1 bg-gray-100">
      <div
        class="h-1 bg-green-500 transition-all duration-300"
        :style="{ width: progressPct + '%' }"
      />
    </div>

    <ul class="divide-y divide-gray-100">
      <!-- Remaining items rendered first so unchecked items always appear at the top -->
      <ShoppingItem
        v-for="item in remainingItems"
        :key="item.id"
        :item="item"
        @toggle="emit('toggleItem', item.id)"
        @remove="emit('removeItem', item.id)"
      />

      <!--
        v-if completely removes this element from the DOM when false.
        The divider is only meaningful when both groups have items — without
        this guard it would float with nothing below it on a fully checked list.
        Compare with v-show, which keeps the element in the DOM but hides it
        with display:none. Prefer v-if when the element is conditionally
        meaningless; prefer v-show for frequent visibility toggling.
      -->
      <li
        v-if="remainingItems.length && purchasedItems.length"
        class="px-5 py-2 flex items-center gap-3"
      >
        <div class="flex-1 h-px bg-gray-100" />
        <span class="text-xs text-gray-400">Purchased</span>
        <div class="flex-1 h-px bg-gray-100" />
      </li>

      <!-- Purchased items rendered below the divider -->
      <ShoppingItem
        v-for="item in purchasedItems"
        :key="item.id"
        :item="item"
        @toggle="emit('toggleItem', item.id)"
        @remove="emit('removeItem', item.id)"
      />
    </ul>

    <!--
      Empty state: always handle the case where the list has no items.
      A descriptive message is far better UX than a blank gap.
    -->
    <p
      v-if="!list.items.length"
      class="px-5 py-6 text-sm text-gray-400 text-center"
    >
      No items yet. Add one below.
    </p>

    <div class="px-5 py-3 border-t border-gray-100 space-y-2">
      <!-- @submit.prevent calls event.preventDefault() via a Vue event modifier,
           avoiding a full page reload without writing it in the handler itself -->
      <form class="flex gap-2" @submit.prevent="submitNewItem">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Add an item…"
          class="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
        />
        <button
          type="submit"
          class="text-sm font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
          :disabled="!newItemName.trim()"
        >
          Add
        </button>
      </form>

      <!--
        v-if hides this button entirely when there is nothing to clear,
        rather than leaving a disabled button permanently in view.
      -->
      <div class="flex justify-end">
        <button
          v-if="purchasedItems.length"
          class="text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          @click="emit('clearPurchased')"
        >
          Clear {{ purchasedItems.length }} purchased
        </button>
      </div>
    </div>
  </div>

  <!-- Share modal — teleported to document body -->
  <ShareModal ref="shareModal" :list-id="list.id" />
</template>
