// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    moonIcon.classList.toggle('hidden');
    sunIcon.classList.toggle('hidden');
});

// Logo preview
const logoUpload = document.getElementById('logoUpload');
const logoPreview = document.getElementById('logoPreview');
logoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo preview" class="h-full w-full object-cover rounded-lg">`;
        };
        reader.readAsDataURL(file);
    }
});

// File upload and display
const fileUpload = document.getElementById('fileUpload');
const fileList = document.getElementById('fileList');
const uploadedFiles = new Set();

fileUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        if (!uploadedFiles.has(files[i].name)) {
            uploadedFiles.add(files[i].name);
            displayFile(files[i]);
        }
    }
});

function displayFile(file) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-gray-300 dark:bg-gray-600 p-2 rounded';
    li.innerHTML = `
        <span>${file.name}</span>
        <button class="remove-file text-red-500 hover:text-red-700" data-filename="${file.name}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    `;
    fileList.appendChild(li);

    li.querySelector('.remove-file').addEventListener('click', () => removeFile(file.name, li));
}

function removeFile(fileName, listItem) {
    uploadedFiles.delete(fileName);
    listItem.remove();

    // Clear the file input to allow re-uploading the same file
    fileUpload.value = '';
}

// Form submission
const botForm = document.getElementById('botForm');
const snippetContainer = document.getElementById('snippetContainer');
const snippet = document.getElementById('snippet');
const generateButton = document.getElementById('generateButton');
const copySnippet = document.getElementById('copySnippet');
const notification = document.getElementById('notification');

botForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable form fields and show progress
    disableFormFields(true);
    showProgress();

    const formData = new FormData(botForm);

    // Add host URL, bot name, and files to formData
    formData.append('hostUrl', document.getElementById('hostUrl').value);
    formData.append('botName', document.getElementById('botName').value);

    const logoFile = document.getElementById('logoUpload').files[0];
    if (logoFile) {
        formData.append('logoUpload', logoFile);
    }

    // Append all uploaded files to formData
    uploadedFiles.forEach(fileName => {
        const file = Array.from(fileUpload.files).find(f => f.name === fileName);
        if (file) {
            formData.append('fileUpload', file);
        }
    });

    try {
        const response = await fetch('/create-bot', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const embedCode = `
<script src="https://cdn.jsdelivr.net/gh/shahdivax/QuizWiz/custombot/static/js/widget.js"><\/script>
<script>
    CustomBot.init({
        serverUrl: '${data.serverUrl}',
        botName: '${data.botName}',
        botImageUrl: '${data.botImageUrl}',
        botId: '${data.botId}'
    });
<\/script>
`;

        snippet.textContent = embedCode;
        snippetContainer.classList.remove('hidden');
        showNotification('Bot created successfully!');
    } catch (error) {
        console.error('Error creating bot:', error);
        showNotification('An error occurred while creating the bot. Please try again.', 'error');
    } finally {
        // Re-enable form fields and hide progress
        disableFormFields(false);
        hideProgress();
    }
});

copySnippet.addEventListener('click', () => {
    navigator.clipboard.writeText(snippet.textContent.trim()).then(() => {
        showNotification('Snippet copied to clipboard!');
    }).catch(err => {
        console.error('Error copying snippet: ', err);
        showNotification('Failed to copy snippet. Please try again.', 'error');
    });
});

function disableFormFields(disabled) {
    const formElements = botForm.elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = disabled;
    }
}

function showProgress() {
    generateButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating...
    `;
    generateButton.disabled = true;
}

function hideProgress() {
    generateButton.innerHTML = 'Generate Snippet';
    generateButton.disabled = false;
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    notification.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}