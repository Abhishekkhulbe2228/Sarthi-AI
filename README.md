<br># 🧭 Sarthi AI — Multi-Agent AI Travel Planner

<p align="center">
  <strong>An intelligent, multi-agent travel planning system powered by LangGraph, Groq LLM, and real-time APIs.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/LangGraph-1.2-orange?logo=langchain&logoColor=white" alt="LangGraph">
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-purple" alt="Groq">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 📖 Overview

**Sarthi AI** (सारथी — meaning "charioteer" or "guide" in Hindi) is a full-stack AI travel assistant that takes a natural language travel request and produces a complete travel plan — including **live flight data**, **hotel recommendations**, and a **day-by-day itinerary** — all orchestrated by a multi-agent graph pipeline.

### What It Does

> *"Plan a 7 days Japan trip from India"*

Sarthi AI takes this single sentence and:

1. 🛫 **Fetches live flights** from Delhi (DEL) to Tokyo (NRT) via AviationStack API
2. 🏨 **Searches for hotels** using Tavily web search
3. 📋 **Generates a detailed itinerary** with an LLM (Groq LLaMA 3.3 70B)
4. 📝 **Compiles a final response** with trip summary, budget estimates, and recommendations
5. 💾 **Persists conversation state** in PostgreSQL for multi-turn interactions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUEST                         │
│              "Plan a 7 days Japan trip from India"           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Server (app.py)                  │
│                                                             │
│  POST /api/travel  ──►  run_travel_agent()                  │
│  GET  /            ──►  Frontend UI (Jinja2)                │
│  GET  /health      ──►  Health Check                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               LangGraph Multi-Agent Pipeline                │
│                      (backend.py)                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Flight Agent │───►│ Hotel Agent  │───►│  Itinerary   │   │
│  │              │    │              │    │    Agent      │   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘   │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ AviationStack│    │ Tavily Search│    │   Groq LLM   │   │
│  │     API      │    │     API      │    │ LLaMA 3.3 70B│   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                             │
│                    ┌──────────────┐                          │
│                    │ Final Agent  │ ◄── Compiles everything  │
│                    └──────┬───────┘                          │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  PostgreSQL (Render) │
                 │   Checkpointer      │
                 │  (conversation state)│
                 └─────────────────────┘
```

### Agent Pipeline Flow

```
START ──► flight_agent ──► hotel_agent ──► itinerary_agent ──► final_agent ──► END
```

| Agent | Purpose | Data Source |
|-------|---------|-------------|
| **Flight Agent** | Fetches live flight status/schedule data | AviationStack API |
| **Hotel Agent** | Searches for best hotel recommendations | Tavily Web Search API |
| **Itinerary Agent** | Generates a practical day-by-day plan | Groq LLM (LLaMA 3.3 70B) |
| **Final Agent** | Compiles everything into a polished response | Groq LLM (LLaMA 3.3 70B) |

---

## 📁 Project Structure

```
Sarthi-AI/
├── app.py                    # FastAPI server — routes & API endpoints
├── backend.py                # LangGraph agent pipeline & orchestration
├── test.py                   # CLI test script for the agent
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (API keys) — gitignored
├── .gitignore
│
├── tools/                    # External API tool integrations
│   ├── __init__.py
│   ├── flight_tool.py        # AviationStack flight search tool (540+ lines)
│   └── tavily_tool.py        # Tavily web search tool
│
└── frontend/                 # Frontend assets (served by FastAPI)
    ├── templates/
    │   └── index.html        # Main UI template (Jinja2)
    └── static/
        ├── style.css         # Stylesheet
        └── script.js         # Client-side JavaScript
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **LLM** | Groq (LLaMA 3.3 70B Versatile) | Natural language understanding & generation |
| **Agent Framework** | LangGraph + LangChain | Multi-agent state graph orchestration |
| **Flight Data** | AviationStack API | Real-time flight schedules & status |
| **Web Search** | Tavily API | Hotel search & travel information |
| **Backend** | FastAPI + Uvicorn | Async web server with REST API |
| **Frontend** | HTML/CSS/JS + Jinja2 | Server-rendered UI templates |
| **Database** | PostgreSQL (Render) | Conversation state checkpointing |
| **State Management** | LangGraph PostgresSaver | Persistent multi-turn conversation memory |

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.12+
- PostgreSQL database (e.g., [Render](https://render.com/) free tier)
- API Keys for: Groq, AviationStack, Tavily

### 1. Clone the Repository

```bash
git clone https://github.com/Abhishekkhulbe2228/Sarthi-AI.git
cd Sarthi-AI
```

### 2. Create Virtual Environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# LLM
GROQ_API_KEY=your_groq_api_key

# Flight Data
AVIATION_STACK_API_KEY=your_aviationstack_api_key

# Web Search
TAVILY_API_KEY=your_tavily_api_key

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Default departure airport (IATA code)
DEFAULT_ORIGIN_IATA=DEL

# LangSmith Tracing (optional)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=Sarthi-AI
```

### 5. Get Your API Keys

| Service | Free Tier | Sign Up |
|---------|-----------|---------|
| **Groq** | Yes (generous rate limits) | [console.groq.com](https://console.groq.com/) |
| **AviationStack** | 100 requests/month | [aviationstack.com](https://aviationstack.com/) |
| **Tavily** | 1000 searches/month | [tavily.com](https://tavily.com/) |
| **Render PostgreSQL** | Free (90 days) | [render.com](https://render.com/) |

---

## 🚀 Running the Application

### Option 1: FastAPI Server (Web UI)

```bash
python app.py
```

Opens at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Frontend UI |
| `POST` | `/api/travel` | Submit a travel request |
| `GET` | `/health` | Health check |

**POST `/api/travel`** — Request Body:

```json
{
  "message": "Plan a 7 days Japan trip from India",
  "thread_id": "optional_session_id"
}
```

**Response:**

```json
{
  "success": true,
  "thread_id": "user_abc123",
  "answer": "## Trip Summary\n...",
  "flight_results": "Live flights from DEL to NRT...",
  "hotel_results": "1. **Hotel Name**...",
  "itinerary": "Day 1: Arrive in Tokyo...",
  "llm_calls": 4
}
```

### Option 2: CLI Test

```bash
python test.py
```

You'll be prompted to enter a travel request interactively.

---

## 🛫 Flight Tool — Deep Dive

The flight tool (`tools/flight_tool.py`) is the most sophisticated component, featuring:

### Intelligent Location Resolution

The tool can parse natural language queries and resolve locations to IATA airport codes:

```
"Plan a 7 days Japan trip from India"
    ├── Origin:      "India"  →  IN  →  DEL (Indira Gandhi International)
    └── Destination: "Japan"  →  JP  →  NRT (Narita International)
```

### Supported Input Formats

| Input Type | Example | Resolves To |
|-----------|---------|-------------|
| Country name | `Japan` | NRT |
| City name | `Tokyo`, `Mumbai` | NRT, BOM |
| IATA code | `JFK` | JFK |
| Aliases | `USA`, `UK`, `UAE` | JFK, LHR, DXB |
| Natural language | `"flights from Delhi to London"` | DEL → LHR |

### Route Parsing Patterns

The tool understands multiple query patterns:

- `"from India to Japan"` → DEL → NRT
- `"to Tokyo from Delhi"` → DEL → NRT
- `"flights from Mumbai"` → BOM → (all destinations)
- `"flights to London"` → (all origins) → LHR
- `"DEL to NRT"` → Direct IATA codes
- `"all country flights"` → Global live data
- `"Japan trip"` → DEL → NRT (uses default origin)

### Covered Regions

**22 countries** with preferred airports and **20+ cities** with direct IATA mappings, including India, Japan, USA, UK, UAE, Singapore, Thailand, and more.

---

## 🔍 Tavily Search Tool

The Tavily tool (`tools/tavily_tool.py`) provides web search capabilities:

- Searches for hotel recommendations, tourist attractions, and travel info
- Returns top 5 results with title, URL, and content snippet
- Snippets are truncated to 300 characters for concise output

---

## 🧠 State Management

Sarthi AI uses **LangGraph's PostgresSaver** for persistent conversation state:

```python
class TravelState(TypedDict):
    messages: list[AnyMessage]    # Full conversation history
    user_query: str               # Original user request
    flight_results: str           # AviationStack API response
    hotel_results: str            # Tavily search results
    itinerary: str                # LLM-generated itinerary
    llm_calls: int                # Total LLM invocations count
```

Each conversation is identified by a `thread_id`, enabling:
- Multi-turn conversations
- Session persistence across server restarts
- Conversation replay and debugging

---

## 📊 Example Output

**Input:** `"Plan a 7 days Japan trip from India"`

**Output includes:**

1. **✈️ Trip Summary** — Overview of the travel plan
2. **🛫 Flight Information** — Live flights from DEL with airline, terminal, gate, and schedule
3. **🏨 Hotel Suggestions** — Top-rated hotels with links and descriptions
4. **📅 Day-by-Day Itinerary** — Practical daily plan covering sightseeing, food, and travel
5. **💰 Estimated Budget** — Approximate costs for flights, hotels, food, and activities
6. **💡 Final Recommendations** — Pro tips and important travel notes

---

## 🗺️ Roadmap

- [ ] Build the frontend UI (HTML/CSS/JS)
- [ ] Add Amadeus API integration for flight ticket pricing
- [ ] Add weather forecast integration
- [ ] Multi-language support
- [ ] Voice input support
- [ ] Deploy to Render / Railway

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Abhishekkhulbe2228">Abhishek</a>
</p>
