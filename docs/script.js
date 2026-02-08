document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const itineraryForm = document.getElementById('itinerary-form');
    const contentForm = document.getElementById('content-form');
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');
    const copyBtn = document.getElementById('copy-btn');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Also update nav links if needed
            document.querySelectorAll('.nav-links a').forEach(a => {
                if (a.getAttribute('href') === `#${tabId}`) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });
        });
    });

    // Generate Content via Gemini REST API
    async function callGeminiAPI(prompt) {
        let apiKey = localStorage.getItem('gemini_api_key');

        // Fallback for demo purposes
        if (!apiKey) {
            apiKey = "AIzaSyBljKqmqUdhKOUsKVkcs10JKOR56r4cK4E";
        }

        if (!apiKey) {
            throw new Error('Please save your Google Gemini API Key in the Settings tab first.');
        }

        // Using gemini-1.5-flash-latest for better availability
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Gemini API Error:", err);
                throw new Error(err.error?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No content generated. The AI might have been blocked or returned empty.");
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Fetch Error:", error);
            throw error; // Re-throw to be caught by the caller
        }
    }

    // Handle Hero Search
    const heroSearchBtn = document.getElementById('hero-search-btn');
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            const dest = document.getElementById('hero-dest').value;
            const vibe = document.getElementById('hero-vibe').value;
            const when = document.getElementById('hero-when').value;

            // Scroll to Generator
            const generatorSection = document.getElementById('generator');
            generatorSection.scrollIntoView({ behavior: 'smooth' });

            // Activate Itinerary Tab
            const itineraryTabBtn = document.querySelector('[data-tab="itinerary"]');
            itineraryTabBtn.click();

            // Pre-fill Form
            if (dest) document.getElementById('destination').value = dest;

            let preferences = [];
            if (vibe) preferences.push(`Travel Style: ${vibe}`);
            if (when) preferences.push(`Travel Month: ${when}`);

            if (preferences.length > 0) {
                const prefsInput = document.getElementById('preferences');
                const existingPrefs = prefsInput.value;
                const newPrefs = preferences.join(', ');

                if (existingPrefs) {
                    prefsInput.value = `${existingPrefs}, ${newPrefs}`;
                } else {
                    prefsInput.value = newPrefs;
                }
            }
        });
    }

    // Save API Key
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');

    // Load existing key or check Magic Link
    const urlParams = new URLSearchParams(window.location.search);
    const magicKey = urlParams.get('key');

    if (magicKey) {
        localStorage.setItem('gemini_api_key', magicKey);
        // Clean URL without reloading
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
        apiKeyInput.value = magicKey;
        alert('API Key auto-configured from Magic Link!');
    } else if (localStorage.getItem('gemini_api_key')) {
        apiKeyInput.value = localStorage.getItem('gemini_api_key');
    }

    if (saveKeyBtn) {
        saveKeyBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('gemini_api_key', key);
                alert('API Key saved successfully!');
            } else {
                alert('Please enter a valid API Key.');
            }
        });
    }

    // Handle Itinerary Generation
    itineraryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('generate-itinerary-btn');
        const loader = btn.querySelector('.loader');
        const btnText = btn.querySelector('.btn-text');

        const dest = document.getElementById('destination').value;
        const days = document.getElementById('days').value;
        const nights = document.getElementById('nights').value;
        const prefs = document.getElementById('preferences').value;

        // Enhanced AI Travel Planner Prompt
        const prompt = `You are an intelligent AI travel planner.

Generate a detailed itinerary for ${dest}.

Travel Duration: ${days} days and ${nights} nights
Travel Style/Preferences: ${prefs}

STRICT RULES:
- Structure output day-wise
- Optimize locations geographically
- Adjust activities based on Travel Style:
   • Adventure → trekking, water sports, hiking
   • Relax → scenic spots, cafes, sunset points
   • Romantic → private experiences, cozy dining
   • Foodie → local markets, signature dishes
   • History → monuments, museums, heritage walks
- Consider weather in the travel month
- Avoid generic descriptions
- Include hidden local experiences
- Add local transport suggestions
- Add estimated daily cost range

Format the output beautifully with proper Markdown formatting.`;

        setLoading(true, btn, loader, btnText);

        try {
            const result = await callGeminiAPI(prompt);
            showResults(result);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false, btn, loader, btnText);
        }
    });

    // Handle Content Generation
    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('generate-content-btn');
        const loader = btn.querySelector('.loader');
        const btnText = btn.querySelector('.btn-text');

        const type = document.getElementById('content-type').value;
        const dest = document.getElementById('content-destination').value;
        const extra = document.getElementById('content-extra').value;

        const prompt = `Write a ${type} for ${dest}. Focus on: ${extra}. Make it engaging and useful for travelers. Format nicely with Markdown.`;

        setLoading(true, btn, loader, btnText);

        try {
            const result = await callGeminiAPI(prompt);
            showResults(result);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false, btn, loader, btnText);
        }
    });

    // Helper functions
    function setLoading(isLoading, btn, loader, btnText) {
        if (isLoading) {
            btn.disabled = true;
            loader.classList.remove('hidden');
            btnText.textContent = 'Generating...';
        } else {
            btn.disabled = false;
            loader.classList.add('hidden');
            btnText.textContent = btn.id === 'generate-itinerary-btn' ? 'Generate My Itinerary' : 'Generate Engaging Content';
        }
    }

    function showResults(content) {
        resultsContent.textContent = content; // Using textContent to preserve formatting or we could use a MD library
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultsContent.textContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        });
    });

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Hero Scroll Effect
    const bgLayers = [
        document.querySelector('.layer-1'),
        document.querySelector('.layer-2'),
        document.querySelector('.layer-3'),
        document.querySelector('.layer-4')
    ];
    const heroText = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');

    window.addEventListener('scroll', () => {
        const scroll = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight - windowHeight;
        const progress = scroll / totalHeight;

        // Global Scale effect (1.1 to 0.85)
        const scale = 1.1 - (progress * 0.25);

        // Hero Content Fade
        const heroOpacity = Math.max(0, 1 - (scroll / (windowHeight * 0.5)));
        if (heroText) heroText.style.opacity = heroOpacity;
        if (heroP) heroP.style.opacity = heroOpacity;

        // Background Layer Transitions
        bgLayers.forEach((layer, index) => {
            if (!layer) return;

            const parallaxShift = progress * -100;
            layer.style.transform = `scale(${scale}) translateY(${parallaxShift}px)`;

            if (index === 0) {
                layer.style.opacity = 1;
            } else {
                const start = (index - 1) * 0.3 + 0.1;
                const end = start + 0.3;

                let layerOpacity = 0;
                if (progress > start) {
                    layerOpacity = Math.min(1, (progress - start) / (end - start));
                }
                layer.style.opacity = layerOpacity;
            }
        });
    });
});
