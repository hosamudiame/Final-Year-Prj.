const users = [
    { username: 'user1', password: 'pass1' },
    { username: 'user2', password: 'pass2' }
];

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Check if the user exists and the password is correct
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Store the login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', username);
                
                // Redirect to the main app page
                window.location.href = '/app.html';
            } else {
                alert('Invalid username or password. Please try again.');
            }
        });
    }
});