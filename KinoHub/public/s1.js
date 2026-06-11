// ====================================================================
// 1. ЛОГІКА ЕКОНОМІКИ ТА МАГАЗИНУ АВАТАРІВ
// ====================================================================
if (!localStorage.getItem('userBalance')) {
    localStorage.setItem('userBalance', '50000');
}
if (!localStorage.getItem('selectedAvatar')) {
    localStorage.setItem('selectedAvatar', 'https://i.pinimg.com/736x/62/e9/ba/62e9ba0691ba8f98b93e397fe14c47de.jpg');
}
if (!localStorage.getItem('purchasedAvatars')) {
    localStorage.setItem('purchasedAvatars', JSON.stringify(['https://i.pinimg.com/736x/62/e9/ba/62e9ba0691ba8f98b93e397fe14c47de.jpg']));
}

function updateUI() {
    const balance = localStorage.getItem('userBalance');
    const selected = localStorage.getItem('selectedAvatar');
    const purchased = JSON.parse(localStorage.getItem('purchasedAvatars')) || [];

    const balanceElement = document.getElementById('balance');
    if (balanceElement) balanceElement.innerText = Number(balance).toLocaleString();

    const userAvatarImg = document.getElementById('user-avatar');
    if (userAvatarImg && selected) {
        if (selected.startsWith('linear-gradient') || selected.startsWith('#')) {
            userAvatarImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; 
            userAvatarImg.style.background = selected;
            userAvatarImg.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        } else if (selected.startsWith('flag:')) {
            const country = selected.replace('flag:', '');
            let svgContent = '';
            if (country === 'ua') svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 1" preserveAspectRatio="none"><rect width="2" height="0.5" fill="#0057B7"/><rect y="0.5" width="2" height="0.5" fill="#FFD700"/></svg>';
            else if (country === 'pl') svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 1" preserveAspectRatio="none"><rect width="2" height="0.5" fill="#FFFFFF"/><rect y="0.5" width="2" height="0.5" fill="#DC143C"/></svg>';
            else if (country === 'cz') svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="1" fill="#FFFFFF"/><rect y="1" width="3" height="1" fill="#D7141A"/><polygon points="0,0 1.5,1 0,2" fill="#11457E"/></svg>';
            userAvatarImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
            userAvatarImg.style.background = 'transparent';
            userAvatarImg.style.border = '2px solid #555';
        } else {
            userAvatarImg.src = selected;
            userAvatarImg.style.background = 'transparent';
            userAvatarImg.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        }
    }

    const allCards = document.querySelectorAll('.avatar-item');
    allCards.forEach(card => {
        const element = card.querySelector('.main-av');
        if (!element) return;
        const imgUrl = element.getAttribute('src') || element.getAttribute('data-avatar');
        const button = card.querySelector('.buy-btn');
        const priceTag = card.querySelector('.price');

        if (purchased.includes(imgUrl)) {
            if (button) {
                button.innerText = (selected === imgUrl) ? "Selected" : "Select";
                button.setAttribute('onclick', `setAvatar('${imgUrl}')`);
            }
            if (priceTag) priceTag.innerText = "Owned";
            card.classList.add('owned');
        }
    });
}

function handleAvatarAction(imgUrl, price, button) {
    let currentBalance = parseInt(localStorage.getItem('userBalance')) || 0;
    let purchased = JSON.parse(localStorage.getItem('purchasedAvatars')) || [];

    if (currentBalance >= price) {
        currentBalance -= price;
        purchased.push(imgUrl);
        localStorage.setItem('userBalance', currentBalance);
        localStorage.setItem('purchasedAvatars', JSON.stringify(purchased));
        localStorage.setItem('selectedAvatar', imgUrl);
        updateUI();
    } else {
        alert("Не вистачає зірок!");
    }
}

function setAvatar(imgUrl) { 
    localStorage.setItem('selectedAvatar', imgUrl); 
    updateUI(); 
}

// ====================================================================
// 2. ДИНАМІЧНА КАРУСЕЛЬ 
// ====================================================================
const carousel = document.getElementById('carousel');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function renderCarousel() {
    if (!carousel || !moviesDatabase || moviesDatabase.length === 0) return;
    const carouselMovies = moviesDatabase.slice(0, 7);
    
    carousel.innerHTML = carouselMovies.map(m => `
        <div class="movie-card">
            <a href="movie.html?id=${m.id}" title="${m.title}" style="display: block; width: 100%; height: 100%;">
                <img src="${m.img}" alt="${m.title}">
            </a>
        </div>
    `).join('');
    updateCarousel();
}

function updateCarousel() {
    if (!carousel) return;
    const cards = document.querySelectorAll('.movie-card');
    if (cards.length === 0) return;
    cards.forEach(card => card.className = 'movie-card');
    const center = 3; 
    if (cards[center]) {
        cards[center].classList.add('active');
        if (cards[center - 1]) cards[center - 1].classList.add('mid-left');
        if (cards[center + 1]) cards[center + 1].classList.add('mid-right');
        if (cards[center - 2]) cards[center - 2].classList.add('far-left');
        if (cards[center + 2]) cards[center + 2].classList.add('far-right');
    }
}

if (nextBtn && prevBtn && carousel) {
    nextBtn.addEventListener('click', () => { 
        const cards = document.querySelectorAll('.movie-card');
        if (cards.length > 0) { carousel.appendChild(cards[0]); updateCarousel(); }
    });
    prevBtn.addEventListener('click', () => { 
        const cards = document.querySelectorAll('.movie-card');
        if (cards.length > 0) { carousel.insertBefore(cards[cards.length - 1], cards[0]); updateCarousel(); }
    });
}

// 3. Хмара бази даних та заванитаження (JSONBIN)

let moviesDatabase = []; 
let filteredMovies = []; 
let currentPage = 1;
const itemsPerPage = 4;  

const CLOUD_BIN_ID = '6a24577af5f4af5e29c32cf6';
const CLOUD_API_KEY = '$2a$10$2XqOLrSsXthcKg925l/Sk.6PqMKbqGF/XzRytUJtSw29fDlVNGouq';

async function loadMoviesFromJSON() {
    const listContainer = document.getElementById('movie-list');
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_BIN_ID}/latest?t=${timestamp}`, {
            headers: { 'X-Master-Key': CLOUD_API_KEY, 'Cache-Control': 'no-cache' }
        }); 
        if (!response.ok) throw new Error(`Помилка HTTP: ${response.status}`);
        
        const data = await response.json();
        moviesDatabase = data.record; 
        filteredMovies = [...moviesDatabase];      
        
        if (document.getElementById('carousel')) renderCarousel(); 
        if (document.getElementById('movie-list')) renderKinokradList();   
        if (document.getElementById('player-section') && typeof loadSpecificMovie === 'function') loadSpecificMovie();
    } catch (error) {
        console.error("Помилка БД:", error);
        if (listContainer) listContainer.innerHTML = '<p style="color:red; text-align:center;">Помилка підключення до онлайн бази.</p>';
    }
}

function renderKinokradList() {
    const listContainer = document.getElementById('movie-list');
    if (!listContainer) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);

    if (moviesToShow.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#aaa; width: 100%; padding: 40px; font-size: 1.1rem;">За вашим запитом нічого не знайдено.</p>';
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    listContainer.innerHTML = moviesToShow.map(m => {
        const ratingVal = parseFloat(m.rating) || 0; 
        const filledStars = Math.round(ratingVal); 
        const emptyStars = 10 - filledStars; 
        const starsHtml = '★'.repeat(filledStars) + '☆'.repeat(emptyStars > 0 ? emptyStars : 0);
        
        return `
        <div class="kinokrad-card" onclick="window.location.href='movie.html?id=${m.id || 0}'" style="cursor:pointer;" data-id="${m.id}">
            <img src="${m.img}" class="kinokrad-poster" alt="${m.title}">
            <div class="kinokrad-info">
                <h3>${m.title}</h3>
                <div class="stars" style="color: #f1c40f; margin: 5px 0;" title="${ratingVal}/10">
                    ${starsHtml} <span style="font-size: 12px; color: #888; font-weight: normal;">(${ratingVal}/10)</span>
                </div>
                <div class="kinokrad-meta">
                    <div><b>Якість:</b> ${m.quality || 'Невідомо'}</div>
                    <div><b>Рік:</b> ${m.year || 'Невідомо'}</div>
                    <div><b>Жанр:</b> ${m.genre || 'Невідомо'}</div>
                    <div><b>Країна:</b> ${m.country || 'Невідомо'}</div>
                </div>
                <p class="kinokrad-desc">${m.desc || ''}</p>
            </div>
        </div>
        `;
    }).join('');
    
    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    let buttonsHTML = '';

    if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }

    buttonsHTML += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">❮</button>`;
    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `<button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    buttonsHTML += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">❯</button>`;

    paginationContainer.innerHTML = buttonsHTML;
}

function changePage(newPage) {
    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderKinokradList();
        const newsSection = document.querySelector('.news-section');
        if (newsSection) newsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ====================================================================
// 4. ПРЕМІУМ-ВАЛЮТА ТА МОДАЛЬНІ ВІКНА
// ====================================================================
if (!localStorage.getItem('premiumBalance')) localStorage.setItem('premiumBalance', '150');

const closeBtns = document.querySelectorAll('.close-btn');
closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-modal');
        const modal = document.getElementById(targetId);
        if(modal) modal.classList.remove('show');
    });
});

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) event.target.classList.remove('show');
});

// ====================================================================
// 5. ЕФЕКТ КЛІКУ НА ФІЛЬТРИ ТА ЖАНРИ
// ====================================================================
const filterPills = document.querySelectorAll('.filter-pill, .filter-tab, .status-circle');
filterPills.forEach(pill => {
    pill.addEventListener('click', function() {
        if (this.innerText.trim() === "Всі") {
            filterPills.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
        } else {
            filterPills.forEach(p => { if (p.innerText.trim() === "Всі") p.classList.remove('selected'); });
            this.classList.toggle('selected');
        }
    });
});

function applyAllFilters() {
    if (typeof moviesDatabase === 'undefined' || moviesDatabase.length === 0) return;
    
    let filtered = [...moviesDatabase];
    const activePill = document.querySelector('.filter-pill.selected, .filter-tab.selected, .status-circle.selected');
    const value = activePill ? activePill.innerText.trim() : "Всі";

    if (value === "Новинки") {
        filtered.sort((a, b) => b.year - a.year);
    } else if (value === "За рейтингом ★") {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (value !== "Всі") {
        filtered = filtered.filter(m => 
            (m.genre && m.genre.toLowerCase().includes(value.toLowerCase())) || 
            (m.title && m.title.toLowerCase().includes(value.toLowerCase())) || 
            m.year == parseInt(value)
        );
    }

    filteredMovies = filtered;
    currentPage = 1; 
    renderKinokradList(); 
}

// ====================================================================
// 6. СПРАВЖНІЙ AI ЧАТ-БОТ (ЗБЕРЕЖЕННЯ ПЕРЕПИСКИ В LOCALSTORAGE)
// ====================================================================
let isAiFilterActive = false; 

function toggleAiFilter() {
    isAiFilterActive = !isAiFilterActive;
    const iconBtn = document.getElementById('aiToggleBtn');
    
    if (iconBtn) {
        if (isAiFilterActive) {
            iconBtn.classList.add('active'); 
            iconBtn.title = 'AI Фільтр: УВІМКНЕНО';
        } else {
            iconBtn.classList.remove('active'); 
            iconBtn.title = 'AI Фільтр: ВИМКНЕНО';
        }
    }
}

const toggleBtnEl = document.getElementById('aiToggleBtn');
if (toggleBtnEl) toggleBtnEl.addEventListener('click', toggleAiFilter);

const sendBtn = document.getElementById('send-btn');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Функція для запису повідомлення в історію браузера
function saveChatToLocalStorage(sender, messageText) {
    let history = JSON.parse(localStorage.getItem('chat_messages_history')) || [];
    history.push({ sender: sender, text: messageText });
    localStorage.setItem('chat_messages_history', JSON.stringify(history));
}

// Функція для виведення збереженої історії у вікно чату
function loadChatHistory() {
    if (!chatMessages) return;
    const history = JSON.parse(localStorage.getItem('chat_messages_history')) || [];
    chatMessages.innerHTML = ''; // Очищаємо перед рендером
    
    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = (msg.sender === 'user') ? 'user-message' : 'bot-message';
        div.innerText = msg.text;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    if (!chatInput || !chatMessages) return;
    const text = chatInput.value.trim();
    if (text === "") return;

    const useFilter = isAiFilterActive;

    // Створюємо повідомлення користувача у DOM
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.innerText = text;
    chatMessages.appendChild(userDiv);
    
    // Зберігаємо повідомлення користувача в пам'ять
    saveChatToLocalStorage('user', text);
    
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Тимчасовий індикатор друку бота
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'bot-message';
    loadingDiv.innerText = useFilter ? "⏳ Шукаю фільми у базі..." : "⏳ Друкує...";
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, useFilter: useFilter }) 
        });

        if (!response.ok) throw new Error("Помилка мережі");
        const data = await response.json();

        if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);

        // Створюємо офіційну відповідь бота у DOM
        const botDiv = document.createElement('div');
        botDiv.className = 'bot-message';
        botDiv.innerText = data.reply;
        chatMessages.appendChild(botDiv);

        // Зберігаємо відповідь бота в пам'ять
        saveChatToLocalStorage('bot', data.reply);

        if (useFilter && data.action === 'filter') {
            if (data.movieIds && data.movieIds.length > 0) {
                const targetIds = data.movieIds.map(String);
                filteredMovies = moviesDatabase.filter(m => targetIds.includes(String(m.id)));
            } else {
                filteredMovies = []; 
            }
            
            currentPage = 1; 
            renderKinokradList(); 
            
            const movieListSection = document.getElementById('movie-list');
            if (movieListSection) movieListSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    } catch (error) {
        console.error("Chat error:", error);
        if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
        const errDiv = document.createElement('div');
        errDiv.className = 'bot-message';
        errDiv.style.color = 'red';
        errDiv.innerText = "Упс... Зв'язок із сервером втрачено.";
        chatMessages.appendChild(errDiv);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendBtn) sendBtn.addEventListener('click', () => sendMessage()); 
if (chatInput) chatInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') sendMessage(); 
});

// ====================================================================
// 7. НАДІЙНА СИСТЕМА ПЕРЕНОСУ ТА ПОСТІЙНОСТІ СТАНУ ЧАТУ
// ====================================================================
function initGlobalChatPersistence() {
    const chatSidebar = document.querySelector('.chat-sidebar');
    const pinBtn = document.getElementById('pin-chat-btn');
    const chatHeader = document.querySelector('.chat-header');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    
    if (!chatSidebar) return;

    // ОДРАЗУ завантажуємо збережені повідомлення переписки
    loadChatHistory();

    function saveChatState() {
        localStorage.setItem('chat_unpinned', chatSidebar.classList.contains('unpinned'));
        localStorage.setItem('chat_visible', chatSidebar.style.display !== 'none');
        localStorage.setItem('chat_left', chatSidebar.style.left);
        localStorage.setItem('chat_top', chatSidebar.style.top);
    }

    const isUnpinnedStore = localStorage.getItem('chat_unpinned') === 'true';
    const isVisibleStore = localStorage.getItem('chat_visible') !== 'false'; 
    const leftStore = localStorage.getItem('chat_left');
    const topStore = localStorage.getItem('chat_top');

    if (isUnpinnedStore) {
        chatSidebar.classList.add('unpinned');
        if (pinBtn) { pinBtn.innerText = '📌'; pinBtn.title = 'Закріпити чат'; }
        if (leftStore) chatSidebar.style.setProperty('left', leftStore, 'important');
        if (topStore) chatSidebar.style.setProperty('top', topStore, 'important');
    } else {
        chatSidebar.classList.remove('unpinned');
        if (pinBtn) { pinBtn.innerText = '🔓'; pinBtn.title = 'Відкріпити чат'; }
    }

    if (isVisibleStore) {
        chatSidebar.style.setProperty('display', 'flex', 'important');
        if (chatToggleBtn) chatToggleBtn.classList.add('active-toggle');
    } else {
        chatSidebar.style.setProperty('display', 'none', 'important');
        if (chatToggleBtn) chatToggleBtn.classList.remove('active-toggle');
    }

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            const isCurrentlyVisible = chatSidebar.style.display !== 'none';
            if (isCurrentlyVisible) {
                chatSidebar.style.setProperty('display', 'none', 'important');
                chatToggleBtn.classList.remove('active-toggle');
            } else {
                chatSidebar.style.setProperty('display', 'flex', 'important');
                chatToggleBtn.classList.add('active-toggle');
            }
            saveChatState();
        });
    }

    if (pinBtn) {
        pinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const nowUnpinned = !chatSidebar.classList.contains('unpinned');
            chatSidebar.classList.toggle('unpinned', nowUnpinned);

            if (nowUnpinned) {
                pinBtn.innerText = '📌'; pinBtn.title = 'Закріпити чат';
            } else {
                pinBtn.innerText = '🔓'; pinBtn.title = 'Відкріпити чат';
                chatSidebar.style.removeProperty('left');
                chatSidebar.style.removeProperty('top');
            }
            saveChatState();
        });
    }
    
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatSidebar.style.setProperty('display', 'none', 'important');
            if (chatToggleBtn) chatToggleBtn.classList.remove('active-toggle');
            saveChatState();
        });
    }

    if (openChatBtn) {
        openChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyVisible = chatSidebar.style.display !== 'none';
            if (isCurrentlyVisible) {
                chatSidebar.style.setProperty('display', 'none', 'important');
                if (chatToggleBtn) chatToggleBtn.classList.remove('active-toggle');
            } else {
                chatSidebar.style.setProperty('display', 'flex', 'important');
                if (chatToggleBtn) chatToggleBtn.classList.add('active-toggle');
            }
            saveChatState();
        });
    }

    let isDragging = false;
    let offsetX = 0; let offsetY = 0;

    const dragHandle = chatHeader || chatSidebar;
    dragHandle.addEventListener('mousedown', (e) => {
        if (!chatSidebar.classList.contains('unpinned')) return;
        if (['INPUT', 'BUTTON', 'SPAN'].includes(e.target.tagName) || e.target.id === 'chat-messages' || e.target.closest('.chat-input-area')) return;

        isDragging = true;
        const rect = chatSidebar.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        chatSidebar.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        const maxX = window.innerWidth - chatSidebar.offsetWidth;
        const maxY = window.innerHeight - chatSidebar.offsetHeight;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;

        chatSidebar.style.setProperty('left', x + 'px', 'important');
        chatSidebar.style.setProperty('top', y + 'px', 'important');
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            chatSidebar.style.userSelect = '';
            saveChatState();
        }
    });
}

// ====================================================================
// 8. СИСТЕМА КОМЕНТАРІВ ТА ЗАВАНТАЖЕННЯ ПЛЕЄРА ДЛЯ MOVIE.HTML
// ====================================================================
function initMovieCommentsSystem() {
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment-btn');

    if (!commentsList || !commentInput || !submitCommentBtn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id') || '0';
    const dbStorageKey = `comments_db_movie_${movieId}`;

    function renderComments() {
        const currentComments = JSON.parse(localStorage.getItem(dbStorageKey)) || [];
        if (currentComments.length > 0) {
            commentsList.innerHTML = currentComments.map(c => `
                <div class="comment-item" style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #e67e22; text-align: left;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-bottom: 5px;">
                        <span style="font-weight: bold; color: #4a90e2;">Користувач</span>
                        <span>${c.date}</span>
                    </div>
                    <div style="color: #fff; font-size: 14px; word-break: break-all;">${c.text}</div>
                </div>
            `).join('');
        } else {
            commentsList.innerHTML = '<p style="color:#aaa; text-align: center; padding: 20px;">Коментарів поки немає. Станьте першим!</p>';
        }
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    function sendCommentToDB() {
        const text = commentInput.value.trim();
        if (text === "") return;
        const now = new Date();
        const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const newCommentPayload = { text: text, date: dateStr };
        const currentComments = JSON.parse(localStorage.getItem(dbStorageKey)) || [];
        currentComments.push(newCommentPayload);
        localStorage.setItem(dbStorageKey, JSON.stringify(currentComments));
        commentInput.value = "";
        renderComments();
    }

    submitCommentBtn.addEventListener('click', sendCommentToDB);
    commentInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendCommentToDB(); });
    renderComments();
}

function loadSpecificMovie() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));
    if (isNaN(movieId) || !moviesDatabase) return;

    const movie = moviesDatabase.find(m => m.id === movieId);
    if (movie) {
        const titleEl = document.getElementById('view-movie-title');
        if (titleEl) titleEl.innerText = movie.title;

        const videoSource = document.getElementById('video-source');
        const mainVideo = document.getElementById('main-video');
        const qualitySelector = document.getElementById('quality-selector');
        
        if (videoSource && mainVideo) {
            videoSource.src = movie.video_1080 || movie.video_720 || "";
            mainVideo.load();
            if (qualitySelector) {
                qualitySelector.addEventListener('change', (e) => {
                    const quality = e.target.value;
                    const currentTime = mainVideo.currentTime;
                    const isPlaying = !mainVideo.paused;
                    
                    if (quality === '1080' && movie.video_1080) videoSource.src = movie.video_1080;
                    else if (quality === '720' && movie.video_720) videoSource.src = movie.video_720;
                    
                    mainVideo.load();
                    mainVideo.currentTime = currentTime;
                    if (isPlaying) mainVideo.play();
                });
            }
        }
    } else {
        const titleEl = document.getElementById('view-movie-title');
        if (titleEl) titleEl.innerText = "Фільм не знайдено";
    }
}

// ====================================================================
// 9. ЛОГІКА ВХОДУ ТА МАРШРУТИЗАЦІЯ
// ====================================================================
function handleProfileClick(event) {
    event.preventDefault(); 
    const currentUser = sessionStorage.getItem('secureUser');
    if (currentUser) window.location.href = 'profile.html';
    else window.location.href = 'aurh.html';
}

// ====================================================================
// 10. ЛОГІКА ТЕМИ (СВІТЛА / ТЕМНА)
// ====================================================================
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    if (!themeBtn) return;

    const isLightMode = localStorage.getItem('light_theme') === 'true';

    if (isLightMode) {
        document.body.classList.add('light-theme');
        themeBtn.classList.add('active-toggle');
        if (themeIcon) themeIcon.innerText = '☀️ Тема';
    }

    themeBtn.addEventListener('click', () => {
        themeBtn.classList.toggle('active-toggle');
        const isNowLight = document.body.classList.toggle('light-theme');
        
        if (isNowLight) {
            localStorage.setItem('light_theme', 'true');
            if (themeIcon) themeIcon.innerText = '☀️ Тема';
        } else {
            localStorage.setItem('light_theme', 'false');
            if (themeIcon) themeIcon.innerText = '🌙 Тема';
        }
    });
}

// ====================================================================
// ЄДИНА ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    try { updateUI(); } catch (e) { console.error(e); }
    
    loadMoviesFromJSON(); 
    
    try { initGlobalChatPersistence(); } catch (e) { console.error(e); }
    try { initMovieCommentsSystem(); } catch (e) { console.error(e); }
    try { initThemeToggle(); } catch (e) { console.error(e); } 

    const applyBtn = document.querySelector('.apply-filters-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyAllFilters);
    }
    
    const currentUser = sessionStorage.getItem('secureUser');
    if (currentUser) {
        const usernameSpan = document.getElementById('main-username');
        if (usernameSpan) usernameSpan.innerText = currentUser; 
    }
});