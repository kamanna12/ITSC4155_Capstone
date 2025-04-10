document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionBox = document.getElementById('suggestionBox');

    if (!searchInput || !suggestionBox) return;

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();

        // Clear suggestions if empty
        if (!query) {
            suggestionBox.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
            const players = await response.json();

            // Clear previous suggestions
            suggestionBox.innerHTML = '';

            // Populate suggestions (limit to 5 should already happen on the backend)
            players.forEach(player => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
                suggestionItem.textContent = player.full_name;

                // Instead of redirecting immediately, fill the search box with the chosen player's name
                suggestionItem.addEventListener('click', () => {
                    searchInput.value = player.full_name;
                    suggestionBox.innerHTML = ''; // Clear suggestions after selection
                });

                suggestionBox.appendChild(suggestionItem);
            });
        } catch (err) {
            console.error('Error fetching autocomplete suggestions:', err);
        }
    });
});
