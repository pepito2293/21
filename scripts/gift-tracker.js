const STORAGE_KEY = 'gift-tracker-items-v1';
const statusLabels = {
  'a-acheter': 'À acheter',
  commande: 'Commandé',
  recu: 'Reçu',
  emballe: 'Emballé',
  offert: 'Offert',
};
const statusFlow = ['a-acheter', 'commande', 'recu', 'emballe', 'offert'];

const form = document.getElementById('giftForm');
const list = document.getElementById('giftList');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const budgetTotalEl = document.getElementById('budgetTotal');
const amountSpentEl = document.getElementById('amountSpent');
const budgetRemainingEl = document.getElementById('budgetRemaining');
const giftsPendingEl = document.getElementById('giftsPending');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const countdownEl = document.getElementById('countdown');

function loadGifts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveGifts(gifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
}

function formatCurrency(value) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function computeCountdown() {
  const now = new Date();
  const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
  const target = new Date(year, 11, 25, 0, 0, 0);
  const diff = target - now;
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  countdownEl.textContent = days === 0 ? "C'est Noël !" : `${days} jour${days > 1 ? 's' : ''}`;
}

function updateStats(gifts) {
  const totalBudget = gifts.reduce((sum, gift) => sum + (Number(gift.budget) || 0), 0);
  const totalSpent = gifts.reduce((sum, gift) => sum + (Number(gift.price) || 0), 0);
  const completed = gifts.filter((gift) => gift.status === 'offert').length;
  const remainingCount = gifts.length - completed;
  const progress = gifts.length ? Math.round((completed / gifts.length) * 100) : 0;

  budgetTotalEl.textContent = formatCurrency(totalBudget);
  amountSpentEl.textContent = formatCurrency(totalSpent);
  budgetRemainingEl.textContent = formatCurrency(Math.max(totalBudget - totalSpent, 0));
  giftsPendingEl.textContent = remainingCount;
  progressFill.style.width = `${progress}%`;
  progressFill.parentElement.setAttribute('aria-valuenow', progress.toString());
  progressText.textContent = `${progress}% des cadeaux prêts`;
}

function renderEmptyState() {
  list.innerHTML = '<div class="empty-state">Aucun cadeau enregistré pour le moment. Ajoutez votre première idée !</div>';
}

function createStatusSelect(id, currentStatus) {
  const select = document.createElement('select');
  select.dataset.id = id;
  select.className = 'status-select';
  Object.entries(statusLabels).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = currentStatus === value;
    select.appendChild(option);
  });
  return select;
}

function renderGifts() {
  const gifts = loadGifts();
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filterValue = statusFilter.value;

  const filtered = gifts.filter((gift) => {
    const matchesStatus = filterValue === 'all' || gift.status === filterValue;
    const matchesSearch = !searchTerm || gift.recipient.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  list.innerHTML = '';

  if (!filtered.length) {
    renderEmptyState();
    updateStats(gifts);
    return;
  }

  filtered.forEach((gift) => {
    const card = document.createElement('article');
    card.className = 'gift-card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const titleWrapper = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = `🎁 ${gift.idea}`;
    const recipient = document.createElement('p');
    recipient.className = 'recipient';
    recipient.textContent = `Pour ${gift.recipient}`;
    titleWrapper.append(title, recipient);

    const status = document.createElement('span');
    status.className = 'status-pill';
    status.dataset.status = gift.status;
    status.textContent = statusLabels[gift.status];

    header.append(titleWrapper, status);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const budget = document.createElement('div');
    budget.textContent = `Budget : ${formatCurrency(Number(gift.budget) || 0)}`;
    const spent = document.createElement('div');
    spent.textContent = `Dépensé : ${formatCurrency(Number(gift.price) || 0)}`;
    const store = document.createElement('div');
    store.textContent = gift.store ? `Magasin : ${gift.store}` : 'Magasin : non précisé';
    meta.append(budget, spent, store);

    const notes = document.createElement('p');
    notes.className = 'notes';
    notes.textContent = gift.notes ? `Notes : ${gift.notes}` : 'Notes : aucune';

    const tags = document.createElement('div');
    tags.className = 'tags';
    if (gift.priority !== 'normal') {
      const priorityTag = document.createElement('span');
      priorityTag.className = 'tag priority';
      priorityTag.textContent = gift.priority === 'important' ? 'Important' : 'Coup de cœur';
      tags.appendChild(priorityTag);
    }
    if (gift.store) {
      const linkTag = document.createElement('span');
      linkTag.className = 'tag link';
      linkTag.textContent = 'Lien / Boutique';
      tags.appendChild(linkTag);
    }

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const statusLabel = document.createElement('label');
    statusLabel.textContent = 'Statut';
    const statusSelect = createStatusSelect(gift.id, gift.status);
    statusLabel.appendChild(statusSelect);

    const amountLabel = document.createElement('label');
    amountLabel.textContent = 'Montant dépensé (€)';
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.min = '0';
    amountInput.step = '0.01';
    amountInput.value = gift.price || '';
    amountInput.dataset.id = gift.id;
    amountInput.className = 'amount-input';
    amountLabel.appendChild(amountInput);

    actions.append(statusLabel, amountLabel);

    const buttons = document.createElement('div');
    buttons.className = 'card-buttons';

    const stepButton = document.createElement('button');
    stepButton.textContent = 'Étape suivante';
    stepButton.dataset.action = 'next';
    stepButton.dataset.id = gift.id;

    const saveAmountButton = document.createElement('button');
    saveAmountButton.textContent = 'Enregistrer le montant';
    saveAmountButton.dataset.action = 'save-amount';
    saveAmountButton.dataset.id = gift.id;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = gift.id;
    deleteButton.className = 'secondary';

    buttons.append(stepButton, saveAmountButton, deleteButton);

    card.append(header, meta, notes, tags, actions, buttons);
    list.appendChild(card);
  });

  updateStats(gifts);
}

function getNextStatus(current) {
  const index = statusFlow.indexOf(current);
  return index >= 0 && index < statusFlow.length - 1 ? statusFlow[index + 1] : current;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  const gifts = loadGifts();

  const gift = {
    id: crypto.randomUUID(),
    recipient: data.get('recipient').trim(),
    idea: data.get('idea').trim(),
    budget: Number(data.get('budget')) || 0,
    price: Number(data.get('price')) || 0,
    store: data.get('store').trim(),
    status: data.get('status'),
    priority: data.get('priority'),
    notes: data.get('notes').trim(),
  };

  gifts.push(gift);
  saveGifts(gifts);
  form.reset();
  renderGifts();
}

function updateGift(id, updater) {
  const gifts = loadGifts();
  const index = gifts.findIndex((gift) => gift.id === id);
  if (index === -1) return;
  gifts[index] = updater(gifts[index]);
  saveGifts(gifts);
  renderGifts();
}

function handleListInteractions(event) {
  const { target } = event;

  if (target.classList.contains('status-select')) {
    updateGift(target.dataset.id, (gift) => ({ ...gift, status: target.value }));
    return;
  }

  if (target.dataset.action === 'next') {
    updateGift(target.dataset.id, (gift) => ({ ...gift, status: getNextStatus(gift.status) }));
    return;
  }

  if (target.dataset.action === 'save-amount') {
    const card = target.closest('.gift-card');
    const amountInput = card.querySelector('.amount-input');
    const newAmount = Number(amountInput.value) || 0;
    updateGift(target.dataset.id, (gift) => ({ ...gift, price: newAmount }));
    return;
  }

  if (target.dataset.action === 'delete') {
    const gifts = loadGifts().filter((gift) => gift.id !== target.dataset.id);
    saveGifts(gifts);
    renderGifts();
  }
}

function init() {
  computeCountdown();
  setInterval(computeCountdown, 1000 * 60 * 60 * 6);
  renderGifts();

  form.addEventListener('submit', handleFormSubmit);
  statusFilter.addEventListener('change', renderGifts);
  searchInput.addEventListener('input', renderGifts);
  list.addEventListener('click', handleListInteractions);
  list.addEventListener('change', handleListInteractions);
}

init();
