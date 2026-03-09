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
    const searchInput = document.querySelector('.nav-search input');

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    const generatorSection = document.getElementById('generator');
                    generatorSection.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById('TAB_ITINERARY_BTN').click(); // Ensure correct tab is active
                    document.getElementById('destination').value = query;
                }
            }
        });
    }

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabEl = document.getElementById(`${tabId}-tab`);
            if (tabEl) tabEl.classList.add('active');

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

    // Central API Caller (Placeholder initially, will be enhanced)
    let callGeminiAPI = async function (prompt) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocal) {
            try {
                const response = await fetch('/api/generate-raw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || `API Error: ${response.status}`);
                }

                const data = await response.json();
                return data.content;
            } catch (error) {
                console.error("Local API Error:", error);
                throw error;
            }
        } else {
            // Static Production Fallback (No key by default)
            throw new Error("API Key required for production. Please use the Connection Settings.");
        }
    };

    // Handle Hero Search
    const heroSearchBtn = document.getElementById('hero-search-btn');
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            const destEl = document.getElementById('hero-dest');
            const vibeEl = document.getElementById('hero-vibe');
            const whenEl = document.getElementById('hero-when');

            if (!destEl || !vibeEl || !whenEl) return;

            const dest = destEl.value;
            const vibe = vibeEl.value;
            const when = whenEl.value;

            // Scroll to Generator
            const generatorSection = document.getElementById('generator');
            if (generatorSection) generatorSection.scrollIntoView({ behavior: 'smooth' });

            // Activate Itinerary Tab
            const itineraryTabBtn = document.querySelector('[data-tab="itinerary"]');
            if (itineraryTabBtn) itineraryTabBtn.click();

            // Pre-fill Form
            const destInput = document.getElementById('destination');
            if (dest && destInput) destInput.value = dest;

            let preferences = [];
            if (vibe) preferences.push(`Travel Style: ${vibe}`);
            if (when) preferences.push(`Travel Month: ${when}`);

            if (preferences.length > 0) {
                const prefsInput = document.getElementById('preferences');
                if (prefsInput) {
                    const existingPrefs = prefsInput.value;
                    const newPrefs = preferences.join(', ');
                    prefsInput.value = existingPrefs ? `${existingPrefs}, ${newPrefs}` : newPrefs;
                }
            }
        });
    }

    // Generator Forms
    const setupForm = (form, btnId, promptGen) => {
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById(btnId);
            const loader = btn.querySelector('.loader');
            const btnText = btn.querySelector('.btn-text');

            const prompt = promptGen();
            setLoading(true, btn, loader, btnText);

            try {
                const result = await callGeminiAPI(prompt);
                showResults(result);
            } catch (error) {
                console.error("Task Error:", error);
                alert('Neural Connection Error:\n\n' + error.message);
                if (error.message.includes('API key')) {
                    const apiModal = document.getElementById('api-modal');
                    if (apiModal) apiModal.classList.remove('hidden');
                }
            } finally {
                setLoading(false, btn, loader, btnText);
            }
        });
    };

    setupForm(itineraryForm, 'generate-itinerary-btn', () => {
        const dest = document.getElementById('destination').value;
        const days = document.getElementById('days').value;
        const nights = document.getElementById('nights').value;
        const prefs = document.getElementById('preferences').value;
        return `Create a cleaning minimalist travel itinerary for ${dest} (${days} days, ${nights} nights). Preferences: ${prefs}. Include Google Maps links: [Place](https://www.google.com/maps/search/?api=1&query=PLACE). Use bullet points.`;
    });

    setupForm(finderForm, 'find-destinations-btn', () => {
        const month = document.getElementById('finder-month').value;
        const style = document.getElementById('finder-style').value;
        const budget = document.getElementById('finder-budget').value;
        return `Suggest 5 destinations for ${month} with ${style} style and ${budget} budget. Include Maps links.`;
    });

    setupForm(packingForm, 'generate-packing-btn', () => {
        const dest = document.getElementById('packing-destination').value;
        const month = document.getElementById('packing-month').value;
        const days = document.getElementById('packing-days').value;
        const activities = document.getElementById('packing-activities').value;
        return `Packing checklist for ${dest} in ${month} (${days} days). Activities: ${activities}. Use checkboxes [ ].`;
    });

    setupForm(contentForm, 'generate-content-btn', () => {
        const type = document.getElementById('content-type').value;
        const dest = document.getElementById('content-destination').value;
        const extra = document.getElementById('content-extra').value;
        return `Write a ${type} for ${dest}. Focus: ${extra}.`;
    });

    // Helper functions
    let currentItinerary = '';

    function setLoading(isLoading, btn, loader, btnText) {
        if (!btn || !loader || !btnText) return;
        if (isLoading) {
            btn.disabled = true;
            loader.classList.remove('hidden');
            btnText.textContent = 'Generating...';
        } else {
            btn.disabled = false;
            loader.classList.add('hidden');
            const originalTexts = {
                'generate-itinerary-btn': 'Craft My Adventure',
                'find-destinations-btn': 'Find Perfect Destinations',
                'modify-btn': 'Apply Changes',
                'generate-packing-btn': 'Generate Checklist',
                'generate-content-btn': 'Generate Intelligence'
            };
            btnText.textContent = originalTexts[btn.id] || 'Generate';
        }
    }

    function showResults(content) {
        currentItinerary = content;
        if (resultsContent) resultsContent.innerHTML = marked.parse(content);
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        const modPanel = document.getElementById('modification-panel');
        if (modPanel) modPanel.style.display = 'block';
    }

    // Modification Form
    const modificationForm = document.getElementById('modification-form');
    if (modificationForm) {
        modificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('modify-btn');
            const loader = btn.querySelector('.loader');
            const btnText = btn.querySelector('.btn-text');
            const userRequest = document.getElementById('modification-input').value;

            if (!userRequest.trim() || !currentItinerary) return;

            const modPrompt = `Modify this itinerary: "${userRequest}".\n\nOriginal:\n${currentItinerary}`;
            setLoading(true, btn, loader, btnText);
            try {
                const result = await callGeminiAPI(modPrompt);
                showResults(result);
                document.getElementById('modification-input').value = '';
            } catch (error) {
                alert('Mod error: ' + error.message);
            } finally {
                setLoading(false, btn, loader, btnText);
            }
        });
    }

    // UI/UX Effects
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(resultsContent.textContent).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = originalText, 2000);
            });
        });
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Hero Parallax
    window.addEventListener('scroll', () => {
        const scroll = window.pageYOffset;
        const progress = scroll / (document.documentElement.scrollHeight - window.innerHeight);
        const scale = 1.1 - (progress * 0.25);
        const heroText = document.querySelector('.hero h1');
        const heroP = document.querySelector('.hero p');
        if (heroText) heroText.style.opacity = Math.max(0, 1 - (scroll / 400));
        if (heroP) heroP.style.opacity = Math.max(0, 1 - (scroll / 400));

        document.querySelectorAll('.hero-bg').forEach((layer, index) => {
            const shift = progress * -100;
            layer.style.transform = `scale(${scale}) translateY(${shift}px)`;
            if (index > 0) {
                const start = (index - 1) * 0.3 + 0.1;
                layer.style.opacity = progress > start ? Math.min(1, (progress - start) / 0.3) : 0;
            }
        });
    });

    // ===== NEURAL CONNECTION (API KEY MODAL) =====
    const connectionBadge = document.getElementById('connection-badge');
    const apiModal = document.getElementById('api-modal');
    const closeApiModal = document.getElementById('close-api-modal');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const clearApiKeyBtn = document.getElementById('clear-api-key');
    const userApiKeyInput = document.getElementById('user-api-key');
    const statusDot = connectionBadge ? connectionBadge.querySelector('.status-dot') : null;

    const updateStatusUI = () => {
        if (!statusDot) return;
        const key = localStorage.getItem('GEMINI_API_KEY');
        statusDot.classList.toggle('active', !!key);
        statusDot.classList.remove('error');
    };

    if (connectionBadge) {
        connectionBadge.addEventListener('click', () => apiModal.classList.remove('hidden'));
    }
    if (closeApiModal) {
        closeApiModal.addEventListener('click', () => apiModal.classList.add('hidden'));
    }

    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const key = userApiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('GEMINI_API_KEY', key);
                updateStatusUI();
                apiModal.classList.add('hidden');
                alert('Secure Neural Connection Established.');
            }
        });
    }

    if (clearApiKeyBtn) {
        clearApiKeyBtn.addEventListener('click', () => {
            localStorage.removeItem('GEMINI_API_KEY');
            userApiKeyInput.value = '';
            updateStatusUI();
            alert('Neural Connection Reset.');
        });
    }

    // Wrap the original API caller with local storage key logic
    const baseCaller = callGeminiAPI;
    callGeminiAPI = async (prompt) => {
        const userKey = localStorage.getItem('GEMINI_API_KEY');
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (userKey && userKey.trim() !== '' && userKey !== 'null') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${userKey}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (!response.ok) {
                    let errorMessage = `API Error: ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData.error && errData.error.message) {
                            errorMessage = errData.error.message;
                        }
                    } catch (e) { }

                    if (response.status === 403 || response.status === 400) {
                        if (statusDot) statusDot.classList.add('error');
                        // If the key is invalid, we should probably warn them or clear it
                        console.warn("API Key issue detected. Consider clearing your settings.");
                    }
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            } catch (e) {
                console.error("Neural Error:", e);
                throw e;
            }
        }
        return baseCaller(prompt);
    };

    updateStatusUI();

    // Smooth scroll for nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
