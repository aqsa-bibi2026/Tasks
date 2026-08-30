import React, {
  useEffect,
  useMemo
} from 'react';

import {
  Activity,
  Archive,
  Blocks,
  CheckCircle2,
  CircleDot,
  Filter,
  LayoutDashboard,
  List,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  View
} from 'lucide-react';

import {
  useOpsStore
} from './store/useOpsStore.js';

import MetricCard from './components/MetricCard.jsx';
import WorkCard from './components/WorkCard.jsx';
import CreateModal from './components/CreateModal.jsx';
import DetailsDrawer from './components/DetailsDrawer.jsx';
import Toast from './components/Toast.jsx';

const statuses = [
  'Backlog',
  'In Progress',
  'Review',
  'Done'
];

export default function App() {
  const {
    items,
    loading,
    error,
    search,
    priorityFilter,
    ownerFilter,
    viewMode,
    selectedItemId,
    drawerOpen,
    createModalOpen,
    toast,
    lastAction,

    loadItems,
    setSearch,
    setPriorityFilter,
    setOwnerFilter,
    setViewMode,
    openDetails,
    closeDetails,
    openCreateModal,
    closeCreateModal,
    clearToast,
    addItem,
    moveItem,
    undoLastAction,
    removeItem
  } = useOpsStore();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const owners = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(
          items.map(
            (item) =>
              item.owner_name
          )
        )
      )
    ],
    [items]
  );

  const filtered = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.title
          .toLowerCase()
          .includes(q) ||
        item.description
          .toLowerCase()
          .includes(q) ||
        item.owner_name
          .toLowerCase()
          .includes(q);

      const matchesPriority =
        priorityFilter === 'All' ||
        item.priority ===
          priorityFilter;

      const matchesOwner =
        ownerFilter === 'All' ||
        item.owner_name ===
          ownerFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesOwner
      );
    });
  }, [
    items,
    search,
    priorityFilter,
    ownerFilter
  ]);

  const selectedItem =
    items.find(
      (item) =>
        item.id === selectedItemId
    );

  const counts = {
    total: items.length,
    active: items.filter(
      (item) =>
        item.status ===
          'In Progress'
    ).length,
    review: items.filter(
      (item) =>
        item.status === 'Review'
    ).length,
    done: items.filter(
      (item) =>
        item.status === 'Done'
    ).length
  };

  return (
    <div className="page">
      <Background />

      <aside className="sidebar">
        <div className="brand">
          <span>
            <Blocks size={22} />
          </span>

          <div>
            <b>OpsBoard</b>
            <small>
              State Operations
            </small>
          </div>
        </div>

        <nav>
          <button className="active">
            <LayoutDashboard size={17} />
            Workspace
          </button>

          <button disabled>
            <Activity size={17} />
            Activity
          </button>

          <button disabled>
            <Archive size={17} />
            Archive
          </button>
        </nav>

        <div className="state-card">
          <Sparkles size={17} />

          <b>
            Zustand global store
          </b>

          <p>
            Filters, drawer, modal,
            selected item, optimistic
            updates and preferences are
            synchronized globally.
          </p>
        </div>

        <div className="task-number">
          TASK 25
          <strong>
            Complex State Management
          </strong>
        </div>
      </aside>

      <main className="workspace">
        <header>
          <div>
            <small className="eyebrow">
              OPERATIONS / WORKFLOW STATE
            </small>

            <h1>
              Control complex UI
              <em> from one store.</em>
            </h1>

            <p>
              A business workflow dashboard
              powered by Zustand with derived
              state, filters, optimistic
              mutations, persisted preferences
              and synchronized components.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            New work item
          </button>
        </header>

        <section className="metrics">
          <MetricCard
            label="TOTAL ITEMS"
            value={counts.total}
            icon={Blocks}
            helper="All workflow records"
          />

          <MetricCard
            label="IN PROGRESS"
            value={counts.active}
            icon={CircleDot}
            helper="Currently active"
          />

          <MetricCard
            label="IN REVIEW"
            value={counts.review}
            icon={View}
            helper="Awaiting approval"
          />

          <MetricCard
            label="COMPLETED"
            value={counts.done}
            icon={CheckCircle2}
            helper="Finished work"
          />
        </section>

        <section className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search title, owner or description..."
            />
          </div>

          <div className="filters">
            <span>
              <Filter size={14} />
              Filters
            </span>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(event) =>
                setOwnerFilter(
                  event.target.value
                )
              }
            >
              {owners.map(
                (owner) => (
                  <option
                    key={owner}
                  >
                    {owner}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={
                viewMode === 'board'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setViewMode('board')
              }
            >
              <LayoutDashboard size={15} />
            </button>

            <button
              className={
                viewMode === 'list'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setViewMode('list')
              }
            >
              <List size={15} />
            </button>
          </div>
        </section>

        {lastAction && (
          <div className="undo-bar">
            <span>
              Status changed successfully.
            </span>

            <button
              onClick={undoLastAction}
            >
              <RotateCcw size={14} />
              Undo
            </button>
          </div>
        )}

        {loading && (
          <div className="state-panel">
            <LoaderCircle
              className="spin"
              size={25}
            />
            Loading workflow...
          </div>
        )}

        {!loading && error && (
          <div className="state-panel error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          viewMode === 'board' && (
            <section className="board">
              {statuses.map(
                (status) => {
                  const group =
                    filtered.filter(
                      (item) =>
                        item.status ===
                          status
                    );

                  return (
                    <div
                      className="column"
                      key={status}
                    >
                      <div className="column-head">
                        <div>
                          <i />
                          <b>{status}</b>
                        </div>

                        <span>
                          {group.length}
                        </span>
                      </div>

                      <div className="column-body">
                        {group.map(
                          (item) => (
                            <WorkCard
                              key={item.id}
                              item={item}
                              onOpen={
                                openDetails
                              }
                              onMove={
                                moveItem
                              }
                            />
                          )
                        )}

                        {group.length ===
                          0 && (
                          <div className="empty-column">
                            No matching items
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </section>
          )}

        {!loading &&
          !error &&
          viewMode === 'list' && (
            <section className="list-view">
              {filtered.map(
                (item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      openDetails(
                        item.id
                      )
                    }
                  >
                    <span
                      className={`priority ${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>

                    <div>
                      <b>{item.title}</b>
                      <small>
                        {item.owner_name}
                      </small>
                    </div>

                    <em>
                      {item.status}
                    </em>
                  </button>
                )
              )}

              {filtered.length === 0 && (
                <div className="state-panel">
                  No matching work items.
                </div>
              )}
            </section>
          )}
      </main>

      {createModalOpen && (
        <CreateModal
          onClose={closeCreateModal}
          onCreate={addItem}
        />
      )}

      {drawerOpen && (
        <DetailsDrawer
          item={selectedItem}
          onClose={closeDetails}
          onDelete={removeItem}
        />
      )}

      <Toast
        toast={toast}
        onClose={clearToast}
      />
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="background-grid" />
    </>
  );
}
