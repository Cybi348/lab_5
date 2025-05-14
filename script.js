document.addEventListener('DOMContentLoaded', function() {
  // 1. Зберігання даних про систему у localStorage
  const systemInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localStorageAvailable: typeof(Storage) !== "undefined",
      timeOpened: new Date().toISOString()
  };
  
  localStorage.setItem('systemInfo', JSON.stringify(systemInfo));
  
  // Відображення інформації про систему у футері
  const storedInfo = localStorage.getItem('systemInfo');
  const systemInfoElement = document.getElementById('system-info');
  
  if (storedInfo) {
      const parsedInfo = JSON.parse(storedInfo);
      let infoText = '';
      
      for (const [key, value] of Object.entries(parsedInfo)) {
          infoText += `${key}: ${value}\n`;
      }
      
      systemInfoElement.textContent = infoText;
  } else {
      systemInfoElement.textContent = 'Інформація не знайдена в localStorage';
  }
  
  // 2. Отримання та відображення коментарів з серверу
  // 2. Отримання та відображення коментарів з серверу
const studentNumber = 1; // Замініть на ваш номер у журналі
fetch(`https://jsonplaceholder.typicode.com/posts/${studentNumber}/comments`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Помилка отримання коментарів');
        }
        return response.json();
    })
    .then(comments => {
        const commentsList = document.getElementById('comments-list');
        
        comments.forEach(comment => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.name}</span>
                    <a href="mailto:${comment.email}" class="comment-email">${comment.email}</a>
                </div>
                <div class="comment-body">${comment.body}</div>
            `;
            commentsList.appendChild(li);
        });
    })
    .catch(error => {
        console.error('Помилка:', error);
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '<li class="error-message">Не вдалося завантажити відгуки</li>';
    });
  
  // 3. Робота з формою зворотного зв'язку
  const modal = document.getElementById('feedback-modal');
  const feedbackBtn = document.getElementById('feedback-btn');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('feedback-form');
  
  // Функції для роботи з модальним вікном
  function openModal() {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
  }
  
  // Відкриття форми через 1 хвилину
  let timer = setTimeout(() => {
      openModal();
  }, 60000); // 60 секунд = 1 хвилина
  
  // Відкриття форми при кліку на кнопку
  feedbackBtn.addEventListener('click', openModal);
  
  // Закриття форми
  closeBtn.addEventListener('click', closeModal);
  
  // Закриття при кліку поза формою
  window.addEventListener('click', (event) => {
      if (event.target === modal) {
          closeModal();
      }
  });
  
  // Закриття при натисканні Esc
  document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.style.display === 'block') {
          closeModal();
      }
  });
  
  // Відправка форми
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitBtn = form.querySelector('.submit-btn');
      
      try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Відправка...';
          
          const response = await fetch(form.action, {
              method: 'POST',
              body: formData,
              headers: {
                  'Accept': 'application/json'
              }
          });
          
          if (response.ok) {
              alert('Дякуємо за ваш відгук!');
              form.reset();
              closeModal();
              // Якщо форма відправлена, очистити таймер
              clearTimeout(timer);
          } else {
              throw new Error('Помилка відправки форми');
          }
      } catch (error) {
          console.error('Помилка:', error);
          alert('Сталася помилка при відправці форми. Спробуйте ще раз.');
      } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Відправити';
      }
  });
  
  // 4. Перемикач теми
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Функція для перевірки часу доби
  function checkTimeForTheme() {
      const hour = new Date().getHours();
      return hour >= 7 && hour < 21 ? 'light' : 'dark';
  }
  
  // Функція для встановлення теми
  function setTheme(theme) {
      document.body.classList.toggle('dark-mode', theme === 'dark');
      localStorage.setItem('theme', theme);
      
      const icon = themeToggle.querySelector('i');
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Ініціалізація теми
  const savedTheme = localStorage.getItem('theme');
  const timeBasedTheme = checkTimeForTheme();
  
  if (savedTheme) {
      setTheme(savedTheme);
  } else {
      setTheme(timeBasedTheme);
  }
  
  // Перемикання теми при кліку
  themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
  
  // Автоматична зміна теми за часом
  function checkThemeByTime() {
      const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      const timeTheme = checkTimeForTheme();
      
      if (currentTheme !== timeTheme && !localStorage.getItem('theme')) {
          setTheme(timeTheme);
      }
  }
  
  // Перевіряти тему кожну годину
  setInterval(checkThemeByTime, 3600000);
  
  // Слухач для системних налаштувань теми
  prefersDarkScheme.addListener((e) => {
      if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light');
      }
  });
});