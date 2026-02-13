# 🌍 TravelGuideAI: The Future of Neural Travel Planning

**TravelGuideAI** is a premium, AI-driven travel intelligence platform built to eliminate the friction of modern trip planning. By leveraging the power of **Google Gemini 1.5**, the platform serves as a "Neural Travel Architect," crafting journeys that are not just destinations, but stories tailored to the traveler's soul.

---

## 🔥 Key Pillars of Intelligence

### 🗺️ **1. Neural Itinerary Engine**
- **Hyper-Personalization**: Goes beyond basic keywords to understand the "vibe" of your journey (Adventure, Relax, Foodie, etc.).
- **Climate-Aware Logic**: Automatically filters out seasonal-inappropriate activities (e.g., no hiking in monsoons or beach days in peak winters).
- **Geographical Optimization**: Smart route planning that minimizes back-and-forth travel, maximizing your time on the ground.
- **Local Gems & Google Maps**: Integrated hidden gems with direct Google Maps navigation links for every recommendation.

### 🎒 **2. Adaptive Packing Assistant**
- Tailored checklists generated based on the specific travel month, duration, and planned activities.
- Considers cultural norms, gadgets, and essential documents.

### ✍️ **3. Creative Content Studio**
- A specialized tool for travel bloggers and creators to generate high-quality destination guides, travel tips, and engaging articles instantly.

### 🎨 **4. Premium Visual Interface**
- A cutting-edge, glassmorphic UI featuring high-density particle effects, parallax 3D interactions, and smooth neural-style transitions optimized for dark mode.

---

## 🛠️ Technology Stack
- **AI Core**: Google Generative AI (Gemini 1.5 Flash/Pro)
- **Frontend**: Streamlit (Internal App) & Modern Vanilla JS/CSS (Web Portal)
- **Styling**: Advanced CSS3 (Glassmorphism, Parallax, High-Density Animations)
- **Language**: Python 3.10+

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```
    GOOGLE_API_KEY=your_api_key_here
    ```

## Running the Application

### Option 1: Streamlit Interface (Recommended for Quick Use)
Run the Streamlit app:
```bash
streamlit run app.py
```

### Option 2: Web Application (FastAPI)
Run the FastAPI backend which serves the custom HTML frontend:
```bash
python server.py
```
Then open `http://localhost:8000` in your browser.

## Deployment

Since this application requires a Python backend, it **cannot** be hosted on GitHub Pages (which only supports static sites).

### Recommended Hosting:
- **Streamlit Cloud**: Easiest for `app.py`. Connect your GitHub repo and select `app.py` as the entry point.
- **Render / Railway**: Best for the full web app (`server.py`).
