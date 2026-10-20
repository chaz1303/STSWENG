const loginButton =
    document.getElementById('login-button');

loginButton.addEventListener('click', () => {

    const username =
        document.getElementById('username').value;

    const password =
        document.getElementById('password').value;

    const error =
        document.getElementById('error-message');

    if (
        username === 'standard_user' &&
        password === 'secret_sauce'
    ) {

        document
            .getElementById('login-page')
            .hidden = true;

        document
            .getElementById('products-page')
            .hidden = false;

        error.textContent = '';

    } else {

        error.textContent =
            'Invalid username or password.';
    }
});