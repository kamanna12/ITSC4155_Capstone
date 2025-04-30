document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotClear = document.getElementById('chatbot-clear');

  let greeted = false;

  let messageHistory = [
    {
      role: "system",
      content: `
  You are a helpful assistant for a web application called DribbleData — an NBA analytics site where users can:
  - Search for player statistics from the last 5 playoff games
  - Compare two players side-by-side using a separate Compare Players page
  - Use autocomplete suggestions when entering player names
  - Use a chatbot (you) for guidance
  
  App Rules:
  - Users must be logged in to access any features
  - To view a player's stats, users must go to the Search page and begin typing the player's **first name** (or part of it), such as "ste" or "steph" for Stephen Curry. Typing only a last name (like "Curry") will not return results.
  - The Search page only allows viewing one player’s stats and chart
  - The Compare Players page is separate from Search and requires entering two player names
  - There is no guest access
  - You should answer all user questions in a friendly and helpful tone, based only on what the app can actually do
  `
    }
  ];
  
  

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mb-2', sender === 'user' ? 'text-right' : 'text-left');
    msgDiv.innerHTML = `<span class="inline-block p-2 rounded ${sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'}">${text}</span>`;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  async function sendAndRenderMessage(content) {
    appendMessage('user', content);
    messageHistory.push({ role: "user", content });

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory })
      });
      const data = await response.json();
      appendMessage('bot', data.response);
      messageHistory.push({ role: "assistant", content: data.response });
    } catch (error) {
      console.error('Chatbot error:', error);
      appendMessage('bot', 'Sorry, something went wrong.');
    }
  }

  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');

    // Auto-greet only the first time chatbot is opened
    if (!greeted && !chatbotWindow.classList.contains('hidden')) {
      greeted = true;
      const greeting = "Hello! How can I help you today?";
      appendMessage('bot', greeting);
      messageHistory.push({ role: "assistant", content: greeting });
    }
  });

  chatbotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = chatbotInput.value.trim();
    if (!query) return;
    chatbotInput.value = '';
    await sendAndRenderMessage(query);
  });

  chatbotClear.addEventListener('click', () => {
    chatbotMessages.innerHTML = '';
    messageHistory = [
      { role: "system", content: "You're a helpful assistant for a basketball stats web app. You help users search players, compare stats, and navigate the site." }
    ];
    greeted = false;
  });
});
