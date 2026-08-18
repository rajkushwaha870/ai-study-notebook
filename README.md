# 📚 AI Study Notebook

> An AI-powered study platform designed to help students organize notes, manage study material, and learn with an integrated AI assistant.

🌐 **Live Demo:** https://note-book.growhigh990.workers.dev
💻 **Source Code:** https://github.com/rajkushwaha870/ai-study-notebook

---

## 🚀 About The Project

**AI Study Notebook** is a full-stack study platform that combines note management, document handling, authentication, and AI-powered learning assistance in one application.

The goal of the project is to provide students with a single workspace where they can manage their study material and use AI to understand difficult concepts.

---

## ✨ Features

* 🔐 **Google Authentication**

  * Secure user authentication using Google OAuth.

* 🤖 **AI Study Assistant**

  * Ask questions and get AI-powered explanations.
  * Designed to make learning easier and more interactive.

* 📝 **Notes Management**

  * Create and manage study notes.
  * Organize learning material in one place.

* 📄 **PDF Management**

  * View and manage PDF study material.

* 🖼️ **Image OCR**

  * Extract text from images for easier study and processing.

* 📱 **PWA Support**

  * Installable and responsive application experience.

* ☁️ **Cloud Deployment**

  * Deployed using Cloudflare Workers.

* 📱 **Responsive UI**

  * Works across desktop and mobile devices.

---

## 🛠️ Tech Stack

| Technology             | Purpose                           |
| ---------------------- | --------------------------------- |
| **Astro**              | Web framework                     |
| **React**              | Interactive UI components         |
| **TypeScript**         | Type-safe development             |
| **Tailwind CSS**       | UI styling                        |
| **Supabase**           | Database & authentication backend |
| **Google OAuth**       | User authentication               |
| **Cloudflare Workers** | Production deployment             |
| **PWA**                | Installable web application       |

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Astro + React     │
                    │    Frontend         │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐    ┌─────────────┐   ┌─────────────┐
       │ Supabase  │    │ AI Assistant│   │ Cloudflare  │
       │ Backend   │    │             │   │   Workers   │
       └───────────┘    └─────────────┘   └─────────────┘
```

---

## 📂 Project Structure

```text
ai-study-notebook/
│
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── utils/
│
├── supabase/
│   └── migrations/
│
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── wrangler.jsonc
└── README.md
```

---

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/rajkushwaha870/ai-study-notebook.git
```

### 2. Enter the project

```bash
cd ai-study-notebook
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file and add the required Supabase and AI configuration.

> Never commit your `.env` file or private API keys to GitHub.

### 5. Start development server

```bash
npm run dev
```

The application will be available locally through the development server.

---

## 🌐 Deployment

The production version of the application is deployed on **Cloudflare Workers**.

🔗 **Live Application:**
https://note-book.growhigh990.workers.dev

---

## 🔐 Authentication

The application uses:

* Google OAuth
* Supabase Authentication
* Secure session management

---

## 🎯 What I Learned

Building this project helped me gain practical experience with:

* Full-stack web application development
* React component architecture
* Astro
* TypeScript
* Supabase backend integration
* OAuth authentication
* Database integration
* AI API integration
* PWA development
* Cloud deployment
* Git & GitHub
* Environment variable management

---

## 🔮 Future Improvements

* [ ] Advanced AI chat with conversation history
* [ ] Better note search
* [ ] AI-generated quizzes
* [ ] AI-generated summaries
* [ ] Study progress tracking
* [ ] More file formats
* [ ] Dark/light theme improvements
* [ ] Better mobile experience

---

## 👨‍💻 Developer

**Raj Kushwaha**

BCA Student | Web Development | AI Projects

GitHub:
https://github.com/rajkushwaha870

---

## 📄 License

This project is available for educational and personal use.
