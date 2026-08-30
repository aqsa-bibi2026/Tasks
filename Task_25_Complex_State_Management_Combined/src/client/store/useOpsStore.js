import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createWorkItem,
  deleteWorkItem,
  fetchWorkItems,
  updateWorkItemStatus
} from '../api.js';

export const useOpsStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: '',
      search: '',
      priorityFilter: 'All',
      ownerFilter: 'All',
      viewMode: 'board',
      selectedItemId: null,
      drawerOpen: false,
      createModalOpen: false,
      toast: null,
      lastAction: null,

      loadItems: async () => {
        set({
          loading: true,
          error: ''
        });

        try {
          const data =
            await fetchWorkItems();

          set({
            items: data.items,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error.message
          });
        }
      },

      setSearch: (search) =>
        set({ search }),

      setPriorityFilter: (priorityFilter) =>
        set({ priorityFilter }),

      setOwnerFilter: (ownerFilter) =>
        set({ ownerFilter }),

      setViewMode: (viewMode) =>
        set({ viewMode }),

      openDetails: (id) =>
        set({
          selectedItemId: id,
          drawerOpen: true
        }),

      closeDetails: () =>
        set({
          drawerOpen: false
        }),

      openCreateModal: () =>
        set({
          createModalOpen: true
        }),

      closeCreateModal: () =>
        set({
          createModalOpen: false
        }),

      clearToast: () =>
        set({ toast: null }),

      addItem: async (payload) => {
        try {
          const data =
            await createWorkItem(payload);

          set((state) => ({
            items: [
              data.item,
              ...state.items
            ],
            createModalOpen: false,
            toast: {
              tone: 'success',
              message:
                'Work item created.'
            }
          }));

          return true;
        } catch (error) {
          set({
            toast: {
              tone: 'error',
              message: error.message
            }
          });

          return false;
        }
      },

      moveItem: async (id, nextStatus) => {
        const item =
          get().items.find(
            (entry) => entry.id === id
          );

        if (!item || item.status === nextStatus) {
          return;
        }

        const previousStatus = item.status;

        set((state) => ({
          items: state.items.map(
            (entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status: nextStatus
                  }
                : entry
          ),
          lastAction: {
            id,
            previousStatus,
            nextStatus
          },
          toast: {
            tone: 'success',
            message:
              `Moved to ${nextStatus}.`
          }
        }));

        try {
          const data =
            await updateWorkItemStatus(
              id,
              nextStatus
            );

          set((state) => ({
            items: state.items.map(
              (entry) =>
                entry.id === id
                  ? data.item
                  : entry
            )
          }));
        } catch (error) {
          set((state) => ({
            items: state.items.map(
              (entry) =>
                entry.id === id
                  ? {
                      ...entry,
                      status:
                        previousStatus
                    }
                  : entry
            ),
            lastAction: null,
            toast: {
              tone: 'error',
              message:
                'Update failed. Change rolled back.'
            }
          }));
        }
      },

      undoLastAction: async () => {
        const action =
          get().lastAction;

        if (!action) return;

        set({
          lastAction: null
        });

        await get().moveItem(
          action.id,
          action.previousStatus
        );

        set({
          lastAction: null,
          toast: {
            tone: 'success',
            message:
              'Last status change undone.'
          }
        });
      },

      removeItem: async (id) => {
        const previous =
          get().items;

        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id
          ),
          drawerOpen: false,
          selectedItemId: null
        }));

        try {
          await deleteWorkItem(id);

          set({
            toast: {
              tone: 'success',
              message:
                'Work item deleted.'
            }
          });
        } catch (error) {
          set({
            items: previous,
            toast: {
              tone: 'error',
              message:
                'Delete failed. Item restored.'
            }
          });
        }
      }
    }),
    {
      name: 'task25-opsboard-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        priorityFilter:
          state.priorityFilter
      })
    }
  )
);
