// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    moonIcon.classList.toggle('hidden');
    sunIcon.classList.toggle('hidden');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    moonIcon.classList.toggle('hidden', savedTheme === 'dark');
    sunIcon.classList.toggle('hidden', savedTheme === 'light');
}

// Logo preview
const logoUpload = document.getElementById('logoUpload');
const logoPreview = document.getElementById('logoPreview');
logoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Logo file size must be less than 10MB', 'error');
            logoUpload.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            logoPreview.innerHTML = `<img src="${imageData}" alt="Logo preview" class="h-full w-full object-cover rounded-lg">`;
            localStorage.setItem('logoPreview', imageData);
        };
        reader.readAsDataURL(file);
    }
});

// Load saved logo preview
const savedLogoPreview = localStorage.getItem('logoPreview');
if (savedLogoPreview) {
    logoPreview.innerHTML = `<img src="${savedLogoPreview}" alt="Logo preview" class="h-full w-full object-cover rounded-lg">`;
}

// File upload and display
const fileUpload = document.getElementById('fileUpload');
const fileList = document.getElementById('fileList');
let uploadedFiles = new Set();
const MAX_FILES = 3;
const MAX_CONTEXT_SIZE = 1000000; // 100,000 characters (about 50 pages of text)
let totalContextSize = 0;
// Load saved uploaded files
const savedUploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles'));
if (savedUploadedFiles) {
    uploadedFiles = new Set(savedUploadedFiles);
    uploadedFiles.forEach(fileName => {
        displayFile({ name: fileName });
    });
}

fileUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    if (uploadedFiles.size + files.length > MAX_FILES) {
        showNotification(`Maximum ${MAX_FILES} files allowed.`, 'error');
        fileUpload.value = '';
        return;
    }

    let newContextSize = 0;
    const fileReadPromises = [];

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > 10 * 1024 * 1024) {
            showNotification(`File ${files[i].name} exceeds 10MB limit and was not added.`, 'error');
            continue;
        }

        const fileReadPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newContextSize += e.target.result.length;
                resolve();
            };
            reader.readAsText(files[i]);
        });

        fileReadPromises.push(fileReadPromise);
    }

    Promise.all(fileReadPromises).then(() => {
        if (totalContextSize + newContextSize > MAX_CONTEXT_SIZE) {
            showNotification('Total context size exceeds the limit. Please remove some files or reduce their content.', 'error');
            fileUpload.value = '';
            return;
        }

        totalContextSize += newContextSize;

        for (let i = 0; i < files.length; i++) {
            if (!uploadedFiles.has(files[i].name)) {
                uploadedFiles.add(files[i].name);
                displayFile(files[i]);
            }
        }
        saveUploadedFiles();
    });
});

function removeFile(fileName, listItem) {
    uploadedFiles.delete(fileName);
    listItem.remove();
    fileUpload.value = '';

    // Recalculate total context size
    totalContextSize = 0;
    const fileReadPromises = [];

    uploadedFiles.forEach(fileName => {
        const file = Array.from(fileUpload.files).find(f => f.name === fileName);
        if (file) {
            const fileReadPromise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    totalContextSize += e.target.result.length;
                    resolve();
                };
                reader.readAsText(file);
            });
            fileReadPromises.push(fileReadPromise);
        }
    });

    Promise.all(fileReadPromises).then(() => {
        saveUploadedFiles();
    });
}


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
    fileUpload.value = '';
    saveUploadedFiles();
}

function saveUploadedFiles() {
    localStorage.setItem('uploadedFiles', JSON.stringify(Array.from(uploadedFiles)));
}

// Form fields
const hostUrlInput = document.getElementById('hostUrl');
const botNameInput = document.getElementById('botName');
const themeSelect = document.getElementById('themeSelect');

// Load saved form data
hostUrlInput.value = localStorage.getItem('hostUrl') || 'https://quizwiz-mtcq.onrender.com/';
botNameInput.value = localStorage.getItem('botName') || '';
themeSelect.value = localStorage.getItem('selectedTheme') || 'default';

// Save form data on input
hostUrlInput.addEventListener('input', () => {
    localStorage.setItem('hostUrl', hostUrlInput.value);
    if (hostUrlInput.value !== 'https://quizwiz-mtcq.onrender.com/') {
        showNotification('Warning: Changing the host URL may affect bot functionality. Only change if you have your own server.', 'warning');
    }
});
botNameInput.addEventListener('input', () => localStorage.setItem('botName', botNameInput.value));
themeSelect.addEventListener('change', () => {
    localStorage.setItem('selectedTheme', themeSelect.value);
    updateSnippet();
});

// Form submission
const botForm = document.getElementById('botForm');
const snippetContainer = document.getElementById('snippetContainer');
const snippet = document.getElementById('snippet');
const generateButton = document.getElementById('generateButton');
const copySnippet = document.getElementById('copySnippet');
const notification = document.getElementById('notification');

// Add a session flag
let botGeneratedThisSession = false;

// Modify the form submission handler
botForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    disableFormFields(true);
    showProgress();

    const formData = new FormData(botForm);

    formData.append('hostUrl', hostUrlInput.value);
    formData.append('botName', botNameInput.value);
    formData.append('theme', themeSelect.value);

    const logoFile = logoUpload.files[0];
    if (logoFile) {
        formData.append('logoUpload', logoFile);
    }

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

        // Save the bot details
        localStorage.setItem('botId', data.botId);
        localStorage.setItem('botImageUrl', data.botImageUrl);
        localStorage.setItem('botName', data.botName);
        localStorage.setItem('hostUrl', data.serverUrl);

        // Set the session flag
        sessionStorage.setItem('botGeneratedThisSession', 'true');
        botGeneratedThisSession = true;

        updateSnippet(data);
        showNotification('Bot created successfully!');
        showBrowserNotification('Your bot is ready!');
    } catch (error) {
        console.error('Error creating bot:', error);
        showNotification('An error occurred while creating the bot. Please try again.', 'error');
    } finally {
        disableFormFields(false);
        hideProgress();
    }
});

function updateSnippet(data = null) {
    const selectedTheme = themeSelect.value;
    const botId = data ? data.botId : localStorage.getItem('botId');
    const serverUrl = data ? data.serverUrl : hostUrlInput.value;
    const botName = data ? data.botName : botNameInput.value;
    const botImageUrl = data ? data.botImageUrl : localStorage.getItem('botImageUrl');

    let snippetCode;

    switch(selectedTheme) {
        case 'neural-nexus':
            snippetCode = `
                <div id="neural-nexus-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/neural-nexus-widget.js"></script>
                <script>
                    NeuralNexusWidget.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
            break;
        case 'quantum-realm':
            snippetCode = `
                <div id="quantum-realm-communicator-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/quantum-realm-communicator.js"></script>
                <script>
                    QuantumRealmCommunicator.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
            break;
        case 'interdimensional-portal':
            snippetCode = `
                <div id="interdimensional-portal-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/interdimensional-portal-widget.js"></script>
                <script>
                    InterdimensionalPortalWidget.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
            break;
        case 'floating-islands':
            snippetCode = `
                <div id="floatingislands-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/floating-islands-widget.js"></script>
                <script>
                    FloatingIslandsChat.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
            break;
        case 'ethereal-whisper':
            snippetCode = `
                <div id="ethereal-whisper-chat-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/ethereal-whisper-chat.js"></script>
                <script>
                    EtherealWhisperChat.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
            break;
        default:
            snippetCode = `
                <div id="custombot-container"></div>
                <script src="https://cdn.jsdelivr.net/gh/shahdivax/Quizwiz/custombot/static/js/widget.js"></script>
                <script>
                    CustomBot.init({
                        serverUrl: '${serverUrl}',
                        botName: '${botName}',
                        botImageUrl: '${botImageUrl}',
                        botId: '${botId}'
                    });
                </script>
            `;
    }

    snippet.textContent = snippetCode;
    snippetContainer.classList.remove('hidden');
    localStorage.setItem('generatedSnippet', snippetCode);
}

// Load saved generated snippet
const savedSnippet = localStorage.getItem('generatedSnippet');
if (savedSnippet) {
    snippet.textContent = savedSnippet;
    snippetContainer.classList.remove('hidden');
}

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
    notification.classList.remove('hidden', 'bg-green-500', 'bg-red-500', 'bg-yellow-500');
    notification.classList.add(type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function showBrowserNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("QuizWiz Bot Generator", { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("QuizWiz Bot Generator", { body: message });
            }
        });
    }
}

// Modify the page load handler
window.addEventListener('load', () => {
    // Check if a bot was generated this session
    botGeneratedThisSession = sessionStorage.getItem('botGeneratedThisSession') === 'true';

    if (botGeneratedThisSession) {
        // Load saved form data
        hostUrlInput.value = localStorage.getItem('hostUrl') || 'https://quizwiz-mtcq.onrender.com/';
        botNameInput.value = localStorage.getItem('botName') || '';
        themeSelect.value = localStorage.getItem('selectedTheme') || 'default';

        // Load saved logo preview
        const savedLogoPreview = localStorage.getItem('logoPreview');
        if (savedLogoPreview) {
            logoPreview.innerHTML = `<img src="${savedLogoPreview}" alt="Logo preview" class="h-full w-full object-cover rounded-lg">`;
        }

        // Load saved uploaded files
        const savedUploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles'));
        if (savedUploadedFiles) {
            uploadedFiles = new Set(savedUploadedFiles);
            uploadedFiles.forEach(fileName => {
                displayFile({ name: fileName });
            });
        }

        // Load saved generated snippet
        const savedSnippet = localStorage.getItem('generatedSnippet');
        if (savedSnippet) {
            snippet.textContent = savedSnippet;
            snippetContainer.classList.remove('hidden');
        }
    } else {
        // Clear all saved data
        localStorage.removeItem('botId');
        localStorage.removeItem('botImageUrl');
        localStorage.removeItem('botName');
        localStorage.removeItem('hostUrl');
        localStorage.removeItem('logoPreview');
        localStorage.removeItem('uploadedFiles');
        localStorage.removeItem('generatedSnippet');

        // Reset form fields
        hostUrlInput.value = 'https://quizwiz-mtcq.onrender.com/';
        botNameInput.value = '';
        themeSelect.value = 'default';
        logoPreview.innerHTML = '';
        fileList.innerHTML = '';
        uploadedFiles.clear();
        snippet.textContent = '';
        snippetContainer.classList.add('hidden');
    }

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
});

// Add warning about closing the tab
window.addEventListener('beforeunload', (event) => {
    if (generateButton.disabled) {
        event.preventDefault();
        event.returnValue = '';
    }
});

// Demo link functionality
const demoLink = document.getElementById('demoLink');
demoLink.addEventListener('click', (e) => {
    e.preventDefault();
    const demoUrl = 'https://quiz-wiz-official.vercel.app/#demo'; // Replace with your actual demo URL
    window.open(demoUrl, '_blank');
});
