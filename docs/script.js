document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const itineraryForm = document.getElementById('itinerary-form');
    const finderForm = document.getElementById('finder-form');
    const contentForm = document.getElementById('content-form');
    const packingForm = document.getElementById('packing-form');
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
        const prompt = `You are TravelGuideAI, an intelligent travel planning assistant.

Before generating the itinerary:
- Briefly consider the typical climate conditions in ${dest} during the travel month mentioned in preferences.
- Identify and avoid any activities that would be inappropriate or impossible due to the seasonal weather (e.g., skiing in summer, beach days in monsoon, hiking in extreme heat).

Generate a personalized travel itinerary for ${dest}.

Traveler Input:
- Destination: ${dest}
- Trip Duration: ${days} days and ${nights} nights
- Travel Style/Preferences: ${prefs}

STRICT INSTRUCTIONS:
1. Start the itinerary with a brief 2-sentence personalization summary explaining why this plan fits the traveler’s selected vibe and preferences.
2. Structure output day-wise (Day 1, Day 2, Day 3...).
2. For each day, include these specific sections: Morning, Afternoon, and Evening.
3. Recommend local food options for each day (breakfast, lunch, or dinner suggestions).
4. Optimize locations geographically to minimize travel time between spots.
5. Adjust activities specifically based on the Travel Style:
   - Adventure → outdoor, hiking, water activities
   - Relax → scenic spots, cafes, sunset views
   - Romantic → intimate dining, peaceful spots
   - Foodie → street food, local restaurants
   - Culture → heritage sites, museums
6. Ensure all suggested activities are appropriate for the destination's climate in the specific travel month.
7. Include an estimated daily budget range (e.g., $100 - $150 per day).
8. Add exactly 2 hidden local gems with a brief description of why they are special.
9. For each landmark or restaurant, include a Google Maps link in this format: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)
10. Keep the output highly structured, professional, and easy to read using Markdown.

COST BREAKDOWN (at the end):
Estimate total trip cost for ${dest}:
- Budget hotel per night
- Food per day
- Local transport per day
- Activity tickets & entry fees

Show the estimated total cost for ${days} days and provide 3 practical cost-saving tips.

PACKING CHECKLIST:
Generate a specific packing checklist for ${dest} in the travel month mentioned.
Organize into:
- 👗 Clothing (Weather-appropriate & respectful for local culture)
- 🎒 Essentials (Sunscreen, medication, walking shoes)
- 🔌 Gadgets (Adapters, power banks, camera)
- 📄 Documents (ID, bookings, insurance)

Format the entire response as a professional travel dossier. `;

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

    // Handle Destination Finder
    if (finderForm) {
        finderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('find-destinations-btn');
            const loader = btn.querySelector('.loader');
            const btnText = btn.querySelector('.btn-text');

            const month = document.getElementById('finder-month').value;
            const style = document.getElementById('finder-style').value;
            const budget = document.getElementById('finder-budget').value;

            if (!month || !style) {
                alert('Please select both month and travel style.');
                return;
            }

            const prompt = `Suggest 5 destinations based on:
- Travel Month: ${month}
- Travel Style: ${style}
- Budget Level: ${budget}

For each destination, provide:
1. Destination name with country
2. Why it's perfect for ${style} travelers in ${month}
3. Key highlights and experiences
4. Typical ${budget} budget range
5. Weather conditions in ${month}
6. Include a Google Maps search link: [Destination Name](https://www.google.com/maps/search/?api=1&query=DESTINATION_NAME)

Format beautifully with Markdown. Make each destination compelling and specific.`;

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
    }

    // Handle Packing Checklist
    if (packingForm) {
        packingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('generate-packing-btn');
            const loader = btn.querySelector('.loader');
            const btnText = btn.querySelector('.btn-text');

            const dest = document.getElementById('packing-destination').value;
            const month = document.getElementById('packing-month').value;
            const days = document.getElementById('packing-days').value;
            const activities = document.getElementById('packing-activities').value;

            const prompt = `Create a detailed packing checklist for a trip to ${dest} in ${month}.
    
Trip Details:
- Duration: ${days} days
- Activities: ${activities}

Consider:
- Typical weather in ${dest} during ${month}
- Cultural norms for clothing
- Specific requirements for the mentioned activities

Organize the checklist into these sections:
- 👗 Clothing (Weather-appropriate & respectful)
- 🎒 Essentials (Personal care, safety, comfort)
- 🔌 Gadgets (Tech, power, capture)
- 📄 Documents (Travel essentials)

Keep the formatting clean with Markdown checkboxes [ ].`;

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
    }

    // Handle Content Generation
    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('generate-content-btn');
        const loader = btn.querySelector('.loader');
        const btnText = btn.querySelector('.btn-text');

        const type = document.getElementById('content-type').value;
        const dest = document.getElementById('content-destination').value;
        const extra = document.getElementById('content-extra').value;

        const prompt = `Write a ${type} for ${dest}. Focus on: ${extra}. Make it engaging and useful for travelers. For each place mentioned, include a Google Maps search link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME). Format nicely with Markdown.`;

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
    let currentItinerary = ''; // Store current itinerary for modifications
    let currentContext = {}; // Store destination, days, nights, prefs

    function setLoading(isLoading, btn, loader, btnText) {
        if (isLoading) {
            btn.disabled = true;
            loader.classList.remove('hidden');
            btnText.textContent = 'Generating...';
        } else {
            btn.disabled = false;
            loader.classList.add('hidden');
            if (btn.id === 'generate-itinerary-btn') {
                btnText.textContent = 'Craft My Adventure';
            } else if (btn.id === 'find-destinations-btn') {
                btnText.textContent = 'Find Perfect Destinations';
            } else if (btn.id === 'modify-btn') {
                btnText.textContent = 'Apply Changes';
            } else if (btn.id === 'generate-packing-btn') {
                btnText.textContent = 'Generate Checklist';
            } else {
                btnText.textContent = 'Generate Intelligence';
            }
        }
    }

    function showResults(content) {
        currentItinerary = content; // Store for modifications
        resultsContent.textContent = content;
        resultsSection.classList.remove('hidden');

        // Show modification panel
        const modPanel = document.getElementById('modification-panel');
        if (modPanel) {
            modPanel.style.display = 'block';
        }

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Handle Modification Requests
    const modificationForm = document.getElementById('modification-form');
    if (modificationForm) {
        modificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('modify-btn');
            const loader = btn.querySelector('.loader');
            const btnText = btn.querySelector('.btn-text');
            const userRequest = document.getElementById('modification-input').value;

            if (!userRequest.trim()) {
                alert('Please enter a modification request.');
                return;
            }

            if (!currentItinerary) {
                alert('Please generate an itinerary first.');
                return;
            }

            // Modification prompt
            const modPrompt = `Modify the existing itinerary.

User request: "${userRequest}"

Current Itinerary:
${currentItinerary}

STRICT INSTRUCTIONS:
1. Start the itinerary with a brief 2-sentence personalization summary explaining why this plan fits the traveler’s selected vibe and preferences.
2. Keep structure same.
3. Only adjust relevant parts.
4. Maintain travel optimization.
5. Format beautifully with Markdown.`;

            setLoading(true, btn, loader, btnText);

            try {
                const result = await callGeminiAPI(modPrompt);
                showResults(result);
                document.getElementById('modification-input').value = ''; // Clear input
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                setLoading(false, btn, loader, btnText);
            }
        });
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

    // ===== ENHANCED ANIMATIONS =====

    // Parallax Mouse Movement on Cards
    const cards = document.querySelectorAll('.dest-card, .scenario-card, .glass-panel');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // Button Ripple Effect
    const buttons = document.querySelectorAll('.primary-btn, .search-btn, .tab-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Smooth Fade-in for Result Content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.target === resultsContent) {
                resultsContent.style.opacity = '0';
                setTimeout(() => {
                    resultsContent.style.transition = 'opacity 0.5s ease';
                    resultsContent.style.opacity = '1';
                }, 50);
            }
        });
    });

    observer.observe(resultsContent, { childList: true });

    // Stagger Animation for Destination Cards
    const destCards = document.querySelectorAll('.dest-card');
    destCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });

    // Input Focus Animation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 15px rgba(194, 255, 77, 0.3)';
        });

        input.addEventListener('blur', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // Loading Spinner for Generate Buttons
    function createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        return spinner;
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
