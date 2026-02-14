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
        // Forced verified key for guaranteed performance
        const apiKey = "AIzaSyD4zUodxal4lPfpELIr6GrVfCq3p5EJtvs";

        // Using v1 API and the latest flash model for stability
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
            }
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
        const prompt = `You are TravelGuideAI, a minimalist travel planner.

Create a simple and clean travel itinerary for ${dest}.

Traveler Input:
- Destination: ${dest}
- Trip Duration: ${days} days and ${nights} nights
- Preferences: ${prefs}

INSTRUCTIONS:
1. Keep the output extremely simple and concise.
2. Structure the itinerary day-wise (Day 1, Day 2, etc.).
3. Each day must have slots for: 🌅 Morning, 🍽 Lunch, 🌇 Afternoon, 🌙 Evening.
4. Use short, punchy bullet points (max 12 words per activity).
5. **Avoid long paragraphs.** Jump straight to the details.
6. Include 2 local gems (briefly).
7. For each place, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)
8. End with:
   - 💰 Budget Range
   - 🧳 Simple Packing List (bullet points)
   - 💡 3 Short Tips
   - 🌐 5 Essential Phrases

Formatting:
   - Use clear ### headers.
   - Use bullet points for EVERYTHING.
   - No filler text or AI jargon.`;

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

For each, provide a brief bulleted list:
1. Destination name (with Maps link)
2. Why it fits (1 sentence)
3. Highlights (bullet points)
4. Budget & Weather (short)

Keep it simple, clean, and scannable. Format with Markdown.`;

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

            const prompt = `Create a simple and scannable packing checklist for ${dest} in ${month}.
    
Trip Details:
- Duration: ${days} days
- Activities: ${activities}

INSTRUCTIONS:
- **NO long paragraphs.** Go straight to the lists.
- Use checkboxes [ ] for every item.
- Keep descriptions to max 5 words.
- Use ### headers for categories (Clothing, Essentials, Gadgets, Documents).

Format with clean Markdown.`;

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

        const prompt = `Write a simple ${type} for ${dest}. Focus on: ${extra}. Use short paragraphs and bullet points. For each place, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME). Keep it minimal and readable.`;

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
        resultsContent.innerHTML = marked.parse(content);
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
            const modPrompt = `Modify the existing itinerary based on this request: "${userRequest}".

Current Itinerary:
${currentItinerary}

STRICT INSTRUCTIONS:
1. Keep the output extremely simple and concise.
2. Only adjust relevant parts.
3. Use bullet points for all activities.
4. Avoid any long paragraphs. 
5. Format with simple Markdown.`;

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

    // Parallax Mouse Movement on Cards (Desktop Only)
    const cards = document.querySelectorAll('.dest-card, .scenario-card, .glass-panel:not(.generator-section)');
    if (window.innerWidth > 768) {
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
    }

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
