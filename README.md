# Haven AI - Elite Real Estate Concierge

Haven AI is a next-generation real estate platform that leverages artificial intelligence to provide personalized property discovery and interactive academy services.

## Architecture

The project is built with a modern, modular architecture:

### Backend (Python/Flask)
- **AI Intelligence**: Powered by **Groq (Llama 3.1)** and **LiteLLM** for lightning-fast, high-accuracy responses.
- **Dual-API Key Strategy**: Uses separate API keys for Concierge and Academy modules to double rate limits and ensure stability.
- **Database**: Uses **SQLite** with **SQLAlchemy** for a robust, local-first data experience.
- **Modular Routes**: Authentication, Property Management, and Chat are separated into clean blueprints.
- **Intelligent Lead Generation**: Automatically logs user inquiries and categorizes them by category, budget, and location.

### Frontend (Next.js 15 / React 19)
- **Component-Based**: UI is decomposed into reusable, modular components.
- **Interactive UX**: Custom hooks handle chat state, property discovery, and real-time quiz feedback.
- **Premium Design**: Modern aesthetic using **Tailwind CSS** and **Framer Motion** for a high-end "Midnight Obsidian" feel.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (two keys recommended for full capacity)

### Installation

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   *Note: Ensure your `.env` file contains `GROQ_API_KEY` and `GROQ_API_KEY_ACADEMY`.*

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Folder Structure

```text
integrated_project/
├── backend/
│   ├── models/       # Database schemas (SQLAlchemy)
│   ├── routes/       # API endpoints (Auth, Chat, Properties)
│   ├── services/     # Core logic (LLM processing, DB interactions)
│   ├── utils/        # Token management and security helpers
│   └── app.py        # Main entry point (Debug mode)
├── frontend/
│   ├── src/
│   │   ├── app/      # Next.js App Router pages
│   │   ├── components/ # Modular UI components (Chat, Navbar, etc.)
│   │   ├── hooks/    # Custom logic hooks (useChat)
│   │   └── types/    # Shared TypeScript interfaces
│   └── tailwind.config.ts
└── scripts/          # Automation scripts for installation
```

## License
© 2026 Haven AI Intelligence. All Rights Reserved.
