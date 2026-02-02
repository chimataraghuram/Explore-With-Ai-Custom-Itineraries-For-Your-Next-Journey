# Explore With AI - Custom Itineraries

An AI-powered travel companion that generates custom itineraries and travel content using Google's Generative AI.

## Features

- **Custom Itinerary Generation**: Create day-by-day travel plans based on your destination, duration, and preferences.
- **Travel Content Creation**: Generate articles, guides, and tips for travel blogs.
- **Dual Interface**:
  - **Web App**: A custom frontend powered by FastAPI (`server.py` + `public/`).
  - **Streamlit App**: A rapid prototype interface (`app.py`).

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
