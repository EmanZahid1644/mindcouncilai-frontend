const backendURL = 'https://mindcouncil-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard-content');
    const navBtns = document.querySelectorAll('.nav-btn');

    // Card wrapper for all step outputs
    function wrapCard(html) {
        return `<div class="card fade-in">${html}</div>`;
    }

    function showLoading(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = wrapCard('<div class="lavish-loading"><div class="lavish-spinner"></div></div>');
        }
    }
    function showError(targetId, message) {
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = wrapCard(`<div class="lavish-error">${message}</div>`);
        }
    }
    function showSuccess(targetId, message) {
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = wrapCard(`<div class="lavish-success">${message}</div>`);
        }
    }
    function handleGeminiError(data, targetId) {
        if (data && data.error && String(data.error).includes('429')) {
            showError(targetId, '⚠️ Gemini API quota exceeded. Please try again later or upgrade your plan.');
            return true;
        }
        return false;
    }

    // Helper to render input in the center area
    function renderInputInCenter(html) {
        const center = document.querySelector('.dashboard-input-center');
        if (center) center.innerHTML = html;
    }

    // Add more steps here as needed
    const templates = {
        "Step 1": `
            <h2 class="text-xl font-semibold mb-2 text-teal-700" style="display:none">Step 1: Dilemma Input</h2>
            <div id="dilemma-output" class="mt-4"></div>
        `,
        "Step 2": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-blue-700">Step 2: Thought Deconstruction</h2>
            <button id="deconstruct-btn" class="bg-blue-300 text-blue-900 px-4 py-2 rounded-full shadow hover:bg-blue-400 transition-all">Analyze Thought</button>
            <div id="deconstruct-output" class="mt-4"></div>
        `),
        "Step 3": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-green-700">Step 3: Emotional State Detection</h2>
            <button id="emotion-btn" class="bg-green-300 text-green-900 px-4 py-2 rounded-full shadow hover:bg-green-400 transition-all">Detect Emotion</button>
            <div id="emotion-output" class="mt-4"></div>
        `),
        "Step 4": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-indigo-700">Step 4: Council Analysis</h2>
            <button id="council-btn" class="bg-indigo-300 text-indigo-900 px-4 py-2 rounded-full shadow hover:bg-indigo-400 transition-all">Run Council</button>
            <div id="council-output" class="mt-4"></div>
        `),
        "Step 5": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-rose-700">Step 5: Decision Confidence Meter</h2>
            <button id="confidence-btn" class="bg-rose-300 text-rose-900 px-4 py-2 rounded-full shadow hover:bg-rose-400 transition-all">Get Confidence Score</button>
            <div id="confidence-bar-container" class="w-full bg-gray-200 rounded h-6 mt-4 mb-2" style="max-width:400px;display:none;">
                <div id="confidence-bar" class="h-6 rounded bg-green-500 text-white flex items-center justify-center text-sm font-bold transition-all duration-500" style="width:0%">0%</div>
            </div>
            <div id="confidence-output" class="mt-4"></div>
        `),
        // Example for Step 6 and beyond
        "Step 6": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-purple-700">Step 6: What-If Simulator</h2>
            <button id="whatif-btn" class="bg-purple-300 text-purple-900 px-4 py-2 rounded-full shadow hover:bg-purple-400 transition-all">Simulate What-If</button>
            <div id="whatif-output" class="mt-4"></div>
        `),
        "Step 7": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-yellow-700">Step 7: Values Alignment</h2>
            <button id="values-btn" class="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full shadow hover:bg-yellow-400 transition-all">Check Values</button>
            <div id="values-output" class="mt-4"></div>
        `),
        "Step 8": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-pink-700">Step 8: Assumption Stress Test</h2>
            <button id="stress-btn" class="bg-pink-300 text-pink-900 px-4 py-2 rounded-full shadow hover:bg-pink-400 transition-all">Stress Test</button>
            <div id="stress-output" class="mt-4"></div>
        `),
        "Step 9": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-gray-700">Step 9: Verdict</h2>
            <button id="verdict-btn" class="bg-gray-300 text-gray-900 px-4 py-2 rounded-full shadow hover:bg-gray-400 transition-all">Get Verdict</button>
            <div id="verdict-output" class="mt-4"></div>
        `),
        "Step 10": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-lime-700">Step 10: Action Plan</h2>
            <button id="action-btn" class="bg-lime-300 text-lime-900 px-4 py-2 rounded-full shadow hover:bg-lime-400 transition-all">Get Action Plan</button>
            <div id="action-output" class="mt-4"></div>
        `),
        "Step 11": wrapCard(`
            <h2 class="text-xl font-semibold mb-2 text-cyan-700">Step 11: History</h2>
            <button id="history-btn" class="bg-cyan-300 text-cyan-900 px-4 py-2 rounded-full shadow hover:bg-cyan-400 transition-all">Show History</button>
            <div id="history-output" class="mt-4"></div>
        `)
    };

    let dilemmaText = '';
    let sessionId = '';

    function setupStep(step) {
        // Step 1
        if (step === "Step 1") {
            // Render input in center
            renderInputInCenter(`
                <textarea id="dilemma-input" rows="3" placeholder="Describe your dilemma..." class="w-full p-2 border border-teal-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"></textarea>
                <button id="submit-dilemma" class="bg-teal-400 text-white px-4 py-2 rounded-full shadow hover:bg-teal-500 transition-all">Submit</button>
            `);
            const submitBtn = document.getElementById('submit-dilemma');
            if (!submitBtn) return;
            submitBtn.addEventListener('click', async () => {
                const dilemmaInput = document.getElementById('dilemma-input');
                dilemmaText = dilemmaInput.value;
                if (!dilemmaText) return alert("Enter your dilemma first!");
                showLoading('dilemma-output');
                try {
                    const res = await fetch(`${backendURL}/dilemma-input`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dilemma: dilemmaText })
                    });
                    const data = await res.json();
                    if (res.ok && data.raw_dilemma) {
                        showSuccess('dilemma-output', 'Request saved!');
                        document.getElementById('dilemma-output').innerHTML += wrapCard(`<div class="text-base mt-2">${data.raw_dilemma}</div>`);
                    } else {
                        showError('dilemma-output', 'Not saved!<br>' + JSON.stringify(data));
                    }
                } catch (e) {
                    showError('dilemma-output', 'Not saved!');
                }
            });
        } else {
            renderInputInCenter('');
        }

        // Step 2
        if (step === "Step 2") {
            const btn = document.getElementById('deconstruct-btn');
            if (!btn) return;
            btn.addEventListener('click', async () => {
                if (!dilemmaText) return alert("Submit Step 1 first!");
                showLoading('deconstruct-output');
                try {
                    const res = await fetch(`${backendURL}/analyze-thought`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dilemma: dilemmaText })
                    });
                    const data = await res.json();
                    const outputDiv = document.getElementById('deconstruct-output');
                    outputDiv.innerHTML = '';
                    if (handleGeminiError(data, 'deconstruct-output')) return;
                    if (
                        res.ok &&
                        data.structured &&
                        Array.isArray(data.structured.goals) &&
                        Array.isArray(data.structured.fears) &&
                        Array.isArray(data.structured.assumptions) &&
                        Array.isArray(data.structured.constraints)
                    ) {
                        let html = `
                            <div class="lavish-title"><span class="lavish-icon">🧩</span>Thought Breakdown</div>
                            <div class="lavish-section"><b>Goals:</b> ${data.structured.goals.join(', ')}</div>
                            <div class="lavish-section"><b>Fears:</b> ${data.structured.fears.join(', ')}</div>
                            <div class="lavish-section"><b>Assumptions:</b> ${data.structured.assumptions.join(', ')}</div>
                            <div class="lavish-section"><b>Constraints:</b> ${data.structured.constraints.join(', ')}</div>
                        `;
                        if (data.visual_url) {
                            html += `<img src="${data.visual_url}" alt="Visual" class="lavish-visual">`;
                        }
                        outputDiv.innerHTML = wrapCard(html);
                    } else {
                        showError('deconstruct-output', 'Error: Invalid or missing structured response.<br>' + JSON.stringify(data, null, 2));
                    }
                } catch (e) {
                    showError('deconstruct-output', 'Error fetching data.');
                }
            });
        }

        // Step 3
        if (step === "Step 3") {
            const btn = document.getElementById('emotion-btn');
            if (!btn) return;
            btn.addEventListener('click', async () => {
                if (!dilemmaText) return alert("Submit Step 1 first!");
                showLoading('emotion-output');
                try {
                    const res = await fetch(`${backendURL}/emotional-state`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ thought: dilemmaText })
                    });
                    const data = await res.json();
                    const outputDiv = document.getElementById('emotion-output');
                    outputDiv.innerHTML = '';
                    if (handleGeminiError(data, 'emotion-output')) return;
                    if (res.ok && Array.isArray(data.emotions)) {
                        let html = `
                            <div class="lavish-title"><span class="lavish-icon">💚</span>Detected Emotions</div>
                            <div class="lavish-section">${data.emotions.join(', ')}</div>
                            <div class="lavish-section"><b>Advice Tone:</b> ${data.advice_tone || 'N/A'}</div>
                        `;
                        if (data.visual_url) {
                            html += `<img src="${data.visual_url}" alt="Visual" class="lavish-visual">`;
                        }
                        outputDiv.innerHTML = wrapCard(html);
                    } else {
                        showError('emotion-output', 'Error: Invalid or missing emotion response.<br>' + JSON.stringify(data, null, 2));
                    }
                } catch (e) {
                    showError('emotion-output', 'Error fetching data.');
                }
            });
        }

        // Step 4
        if (step === "Step 4") {
            const btn = document.getElementById('council-btn');
            if (!btn) return;
            btn.addEventListener('click', async () => {
                if (!dilemmaText) return alert("Submit Step 1 first!");
                showLoading('council-output');
                try {
                    const res = await fetch(`${backendURL}/run-council`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dilemma: dilemmaText })
                    });
                    const data = await res.json();
                    const outputDiv = document.getElementById('council-output');
                    outputDiv.innerHTML = '';
                    if (handleGeminiError(data, 'council-output')) return;
                    if (res.ok && data.personas) {
                        const p = data.personas;
                        const joinOrNA = (arr) => Array.isArray(arr) ? arr.join(', ') : 'N/A';
                        let html = '';
                        html += `<div class="lavish-title"><span class="lavish-icon">👥</span>Council Analysis</div>`;
                        html += p.rational_analyst ? `<div class="lavish-section"><b>Rational Analyst:</b> Pros: ${joinOrNA(p.rational_analyst.pros)}<br>Cons: ${joinOrNA(p.rational_analyst.cons)}</div>` : '';
                        html += p.emotional_self ? `<div class="lavish-section"><b>Emotional Self:</b> Signals: ${joinOrNA(p.emotional_self.signals)}</div>` : '';
                        html += p.risk_manager ? `<div class="lavish-section"><b>Risk Manager:</b> Risk Level: ${p.risk_manager.risk_level || 'N/A'}, Probability of Failure: ${p.risk_manager.probability_of_failure || 'N/A'}</div>` : '';
                        html += p.future_self && p.future_self.predictions ? `<div class="lavish-section"><b>Future Self:</b> 6 Months: ${p.future_self.predictions["6_months"] || 'N/A'}, 1 Year: ${p.future_self.predictions["1_year"] || 'N/A'}, 5 Years: ${p.future_self.predictions["5_years"] || 'N/A'}</div>` : '';
                        html += p.devils_advocate ? `<div class="lavish-section"><b>Devil's Advocate:</b> Counterarguments: ${joinOrNA(p.devils_advocate.counterarguments)}<br>Blind Spots: ${joinOrNA(p.devils_advocate.blind_spots)}</div>` : '';
                        if (data.visual_url) {
                            html += `<img src="${data.visual_url}" alt="Visual" class="lavish-visual">`;
                        }
                        outputDiv.innerHTML = wrapCard(html);
                    } else {
                        showError('council-output', 'Error: Invalid or missing council response.<br>' + JSON.stringify(data, null, 2));
                    }
                } catch (e) {
                    showError('council-output', 'Error fetching data.');
                }
            });
        }

        // Step 5
        if (step === "Step 5") {
            const btn = document.getElementById('confidence-btn');
            const barContainer = document.getElementById('confidence-bar-container');
            const bar = document.getElementById('confidence-bar');
            if (!btn) return;
            btn.addEventListener('click', async () => {
                if (!dilemmaText) return alert("Submit Step 1 first!");
                let councilPersonas = null;
                showLoading('confidence-output');
                try {
                    const councilOutput = document.getElementById('council-output');
                    if (councilOutput && councilOutput.innerText.includes('Rational Analyst:')) {
                        // For now, skip parsing
                    }
                } catch (e) {}
                try {
                    const res = await fetch(`${backendURL}/confidence-score`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dilemma: dilemmaText, council_personas: councilPersonas })
                    });
                    const data = await res.json();
                    const outputDiv = document.getElementById('confidence-output');
                    outputDiv.innerHTML = '';
                    if (handleGeminiError(data, 'confidence-output')) {
                        barContainer.style.display = 'none';
                        return;
                    }
                    if (res.ok && typeof data.confidence_score === 'number') {
                        let html = '';
                        html += `<div class='lavish-title'><span class='lavish-icon'>🔢</span>Confidence Score: <b>${data.confidence_score}/100</b></div>`;
                        html += `<div class='lavish-section'><b>Explanation:</b> ${data.explanation || 'N/A'}</div>`;
                        html += `<div class='lavish-section'><b>Critical Gaps:</b> ${(Array.isArray(data.critical_gaps) ? data.critical_gaps.join(', ') : 'N/A')}</div>`;
                        if (data.visual_url) {
                            html += `<img src="${data.visual_url}" alt="Visual" class="lavish-visual">`;
                        }
                        outputDiv.innerHTML = wrapCard(html);
                        barContainer.style.display = 'block';
                        let score = Math.max(0, Math.min(100, data.confidence_score));
                        bar.style.width = score + '%';
                        bar.innerText = score + '%';
                        if (score < 40) bar.style.backgroundColor = '#ef4444';
                        else if (score < 70) bar.style.backgroundColor = '#f59e42';
                        else bar.style.backgroundColor = '#22c55e';
                        if (dilemmaText.toLowerCase().includes('die') || dilemmaText.toLowerCase().includes('suicide')) {
                            const crisisDiv = document.createElement('div');
                            crisisDiv.className = 'lavish-error';
                            crisisDiv.innerHTML = '<strong>⚠️ Crisis Warning:</strong> If you or someone you know is struggling with suicidal thoughts, please seek immediate help.<br>' +
                                'Contact <a href="https://www.befrienders.org/" target="_blank" style="color:#b91c1c;text-decoration:underline;">Befrienders Worldwide</a> or your local mental health helpline.';
                            outputDiv.prepend(crisisDiv);
                        }
                    } else {
                        showError('confidence-output', 'Error: Invalid or missing confidence response.<br>' + JSON.stringify(data, null, 2));
                        barContainer.style.display = 'none';
                    }
                } catch (e) {
                    showError('confidence-output', 'Error fetching data.');
                    barContainer.style.display = 'none';
                }
            });
        }
    }

    // Navigation buttons
    // Dynamically support all step buttons (even if added in HTML or future)
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const step = btn.textContent.trim();
            if (templates[step]) {
                dashboard.innerHTML = templates[step];
                setupStep(step);
            } else {
                dashboard.innerHTML = wrapCard(`<p>Coming soon for <b>${step}</b>...</p>`);
            }
        });
    });

    // Default view (first button)
    if (navBtns.length > 0) {
        navBtns[0].classList.add('active');
        const firstStep = navBtns[0].textContent.trim();
        dashboard.innerHTML = templates[firstStep] || wrapCard(`<p>Coming soon for <b>${firstStep}</b>...</p>`);
        setupStep(firstStep);
    }
});

// Motivational quotes for footer
const quotes = [
    "Believe in yourself and all that you are.",
    "Every day is a new beginning.",
    "You are stronger than you think.",
    "Difficult roads often lead to beautiful destinations.",
    "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
    "Small steps every day lead to big results.",
    "You have the power to create change.",
    "Progress, not perfection.",
    "You are not alone. Keep going!",
    "The best way out is always through."
];

function rotateQuotes() {
    const quoteDiv = document.getElementById('motivational-quotes');
    if (!quoteDiv) return;
    let idx = 0;
    function showQuote() {
        quoteDiv.textContent = quotes[idx];
        quoteDiv.style.opacity = 0;
        setTimeout(() => {
            quoteDiv.style.opacity = 1;
        }, 100);
        idx = (idx + 1) % quotes.length;
    }
    showQuote();
    setInterval(showQuote, 6000);
}

rotateQuotes();
