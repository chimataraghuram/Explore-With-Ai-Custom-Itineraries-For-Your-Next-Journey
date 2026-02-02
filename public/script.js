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

    // Handle Itinerary Generation
    itineraryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('generate-itinerary-btn');
        const loader = btn.querySelector('.loader');
        const btnText = btn.querySelector('.btn-text');

        const data = {
            destination: document.getElementById('destination').value,
            days: parseInt(document.getElementById('days').value),
            nights: parseInt(document.getElementById('nights').value),
            description: document.getElementById('preferences').value
        };

        setLoading(true, btn, loader, btnText);

        try {
            const response = await fetch('/api/generate-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to generate itinerary');

            const result = await response.json();
            showResults(result.itinerary);
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

        const data = {
            content_type: document.getElementById('content-type').value,
            destination: document.getElementById('content-destination').value,
            extra_info: document.getElementById('content-extra').value
        };

        setLoading(true, btn, loader, btnText);

        try {
            const response = await fetch('/api/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to generate content');

            const result = await response.json();
            showResults(result.content);
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
