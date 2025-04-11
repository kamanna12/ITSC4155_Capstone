document.addEventListener('DOMContentLoaded', () => {
    // For the search page (using searchInput and suggestionBox)
    const searchInput = document.getElementById('searchInput');
    const suggestionBox = document.getElementById('suggestionBox');
    
    if (searchInput && suggestionBox) {
      searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (!query) {
          suggestionBox.innerHTML = '';
          return;
        }
        try {
          const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
          const players = await response.json();
          suggestionBox.innerHTML = '';
          players.forEach(player => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
            suggestionItem.textContent = player.full_name;
            suggestionItem.addEventListener('click', () => {
              searchInput.value = player.full_name;
              suggestionBox.innerHTML = '';
            });
            suggestionBox.appendChild(suggestionItem);
          });
        } catch (err) {
          console.error('Error fetching autocomplete suggestions:', err);
        }
      });
    }
  
    // For the Compare Players page: Player 1 autocomplete
    const player1Input = document.getElementById('player1');
    const suggestionBox1 = document.getElementById('suggestionBox1');
    if (player1Input && suggestionBox1) {
      player1Input.addEventListener('input', async () => {
        const query = player1Input.value.trim();
        if (!query) {
          suggestionBox1.innerHTML = '';
          return;
        }
        try {
          const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
          const players = await response.json();
          suggestionBox1.innerHTML = '';
          players.forEach(player => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
            suggestionItem.textContent = player.full_name;
            suggestionItem.addEventListener('click', () => {
              player1Input.value = player.full_name;
              suggestionBox1.innerHTML = '';
            });
            suggestionBox1.appendChild(suggestionItem);
          });
        } catch (err) {
          console.error('Error fetching autocomplete suggestions for player1:', err);
        }
      });
    }
  
    // For the Compare Players page: Player 2 autocomplete
    const player2Input = document.getElementById('player2');
    const suggestionBox2 = document.getElementById('suggestionBox2');
    if (player2Input && suggestionBox2) {
      player2Input.addEventListener('input', async () => {
        const query = player2Input.value.trim();
        if (!query) {
          suggestionBox2.innerHTML = '';
          return;
        }
        try {
          const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
          const players = await response.json();
          suggestionBox2.innerHTML = '';
          players.forEach(player => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
            suggestionItem.textContent = player.full_name;
            suggestionItem.addEventListener('click', () => {
              player2Input.value = player.full_name;
              suggestionBox2.innerHTML = '';
            });
            suggestionBox2.appendChild(suggestionItem);
          });
        } catch (err) {
          console.error('Error fetching autocomplete suggestions for player2:', err);
        }
      });
    }
  });
  