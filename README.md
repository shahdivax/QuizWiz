# QuizWiz

**(This project is deprecated as of now, as Llamaindex has stopped supporting the Gemini API via Google Studio)**

QuizWiz is an advanced, AI-powered chatbot creation platform that enables users to build, deploy, and interact with custom chatbots. Leveraging cutting-edge natural language processing technologies, QuizWiz offers a user-friendly interface for creating intelligent conversational agents tailored to specific domains or purposes.

## Table of Contents
1. [Features](#features)
2. [Demo](#demo)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Technologies Used](#technologies-used)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Support](#support)
12. [License](#license)

## Features

- **Custom Chatbot Creation**: Design chatbots with unique personalities and knowledge bases.
- **Document Processing**: Upload and process various document types (PDF, TXT, DOCX, etc.) to train your chatbot.
- **Web-based Interface**: User-friendly interface for bot creation and interaction.
- **Advanced AI Integration**: Utilizes state-of-the-art AI models for natural language understanding and generation.
- **Scalable Architecture**: Built on PostgreSQL for efficient data storage and retrieval.
- **Cloud Integration**: Seamless integration with Cloudinary for image and file management.
- **Customizable Responses**: Fine-tune your chatbot's responses for specific use cases.
- **Multi-language Support**: Create chatbots in various languages.
- **Analytics Dashboard**: Track chatbot performance and user interactions.

## UI Images
<div style="display: flex; justify-content: space-around;">
  <img src="https://github.com/shahdivax/QuizWiz_Deprecated/blob/main/Images/UI%20(1).png?raw=true" alt="UI Image 1" style="width: 45%;"/>
  <img src="https://github.com/shahdivax/QuizWiz_Deprecated/blob/main/Images/UI%20(2).png?raw=true" alt="UI Image 2" style="width: 45%;"/>
</div>


## Demo

- **Free Usage**: Experience QuizWiz in action at [Demo App](https://quiz-wiz-demo.vercel.app/) (Just a Demom ay not work properly)
- **Official Website**: Learn more about QuizWiz at [Official Website](https://quiz-wiz-official.vercel.app/)

## Prerequisites

Ensure you have the following installed:
- Python 3.8+
- PostgreSQL 12+
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/shahdivax/QuizWiz.git
   cd QuizWiz
   ```

2. Set up a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install required Python packages:
   ```
   pip install -r requirements.txt
   ```

## Configuration

1. Create a `.env` file in the root directory with the following variables:
   ```
   POSTGRESQL_URI=postgresql://username:password@localhost:5432/quizwiz_bot_data
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   FLASK_SECRET_KEY=your_secret_key
   MISTRAL_API_KEY=MISTRAL_API_KEY
   ```

2. Update `config.py` with any additional settings specific to your deployment.

3. Uncomment the all the comments and lines from `api/app.py` and `requirements.txt` when running locally
## Usage

### Running the Application

1. Start the Flask development server:
   ```
   python api/app.py
   ```

2. Access the QuizWiz interface at `http://localhost:5000`

### Creating a Chatbot

1. Provide a name and description for your chatbot.
2. Upload a logo (optional).
3. Upload training documents (PDF, TXT, DOCX, etc.).
4. Configure any additional settings (language, response style, etc.).
5. Click "Create Bot" to generate your custom chatbot.

### Interacting with Your Chatbot

1. Go to the chat interface.
2. Select your chatbot from the list of available bots.
3. Start chatting! Your bot will respond based on its training.

### Managing Your Chatbots

1. Access the bot management dashboard.
2. View analytics, update training data, and adjust settings for your bots.

## Technologies Used

- **Backend**: Flask, SQLAlchemy, psycopg2
- **Database**: PostgreSQL,
- **AI/ML**: LlamaIndex, MistralAI
- **Frontend**: HTML, CSS, JavaScript (potentially React or Vue.js)
- **Cloud Services**: Cloudinary
- **Version Control**: Git

## API Reference

Document your API endpoints here, for example:

- `POST /api/create-bot`: Create a new chatbot
- `POST /api/chat`: Send a message to a chatbot

Refer to the full API documentation for detailed information on request/response formats.

## Deployment

QuizWiz is deployed on Render. To deploy your own instance:

1. Create a Render account and set up a new Web Service.
2. Connect your GitHub repository to Render.
3. Configure environment variables in Render dashboard.
4. Deploy the application.

## Contributing

We welcome contributions to QuizWiz! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact our support team at support@quizwiz.com.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
