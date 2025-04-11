document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
  
    // Toggle chatbot window visibility
    chatbotToggle.addEventListener('click', () => {
      chatbotWindow.classList.toggle('hidden');
    });
  
    // Append a message to the chatbot messages area
    function appendMessage(sender, text) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('mb-2', sender === 'user' ? 'text-right' : 'text-left');
      msgDiv.innerHTML = `<span class="inline-block p-2 rounded ${sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'}">${text}</span>`;
      chatbotMessages.appendChild(msgDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  
    // Handle chatbot form submission
    chatbotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = chatbotInput.value.trim();
      if (!query) return;
      appendMessage('user', query);
      chatbotInput.value = '';
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query })
        });
        const data = await response.json();
        appendMessage('bot', data.response);
      } catch (error) {
        console.error('Chatbot error:', error);
        appendMessage('bot', 'Sorry, something went wrong. Please try again later.');
      }
    });
  });
  