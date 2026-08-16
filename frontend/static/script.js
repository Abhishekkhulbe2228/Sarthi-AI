/* ================================================
   Sarthi AI — Client-Side Logic
   ================================================ */

(function () {
    "use strict";

    // ---- DOM References ----
    const chatArea       = document.getElementById("chat-area");
    const welcomeScreen  = document.getElementById("welcome-screen");
    const messagesBox    = document.getElementById("messages-container");
    const inputForm      = document.getElementById("input-form");
    const userInput      = document.getElementById("user-input");
    const btnSend        = document.getElementById("btn-send");
    const btnNewChat     = document.getElementById("btn-new-chat");
    const chips          = document.querySelectorAll(".chip");
    const btnThemeToggle = document.getElementById("btn-theme-toggle");
    const sunIcon        = btnThemeToggle.querySelector(".sun-icon");
    const moonIcon       = btnThemeToggle.querySelector(".moon-icon");

    // ---- State ----
    let threadId = null;
    let isProcessing = false;

    // ---- Pipeline Steps Definition ----
    const PIPELINE_STEPS = [
        { id: "flight",    label: "Searching live flights",       icon: "✈️" },
        { id: "hotel",     label: "Finding hotel options",        icon: "🏨" },
        { id: "itinerary", label: "Building your itinerary",      icon: "📋" },
        { id: "final",     label: "Compiling final travel plan",  icon: "✨" },
    ];

    // ---- Initialize ----
    function init() {
        inputForm.addEventListener("submit", handleSubmit);
        btnNewChat.addEventListener("click", resetChat);
        userInput.addEventListener("input", autoResize);
        userInput.addEventListener("keydown", handleKeyDown);

        // Initialize Theme
        initTheme();

        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                const query = chip.getAttribute("data-query");
                if (query && !isProcessing) {
                    userInput.value = query;
                    handleSubmit(new Event("submit"));
                }
            });
        });

        userInput.focus();
    }

    // ---- Theme Toggling ----
    function initTheme() {
        const savedTheme = localStorage.getItem("sarthi-theme") || "dark";
        setTheme(savedTheme);

        btnThemeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        if (theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            sunIcon.classList.add("hidden");
            moonIcon.classList.remove("hidden");
        } else {
            document.documentElement.removeAttribute("data-theme");
            sunIcon.classList.remove("hidden");
            moonIcon.classList.add("hidden");
        }
        localStorage.setItem("sarthi-theme", theme);
    }

    // ---- Auto-resize Textarea ----
    function autoResize() {
        userInput.style.height = "auto";
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
    }

    // ---- Keyboard Handling ----
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            inputForm.dispatchEvent(new Event("submit"));
        }
    }

    // ---- Submit Handler ----
    function handleSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message || isProcessing) return;

        isProcessing = true;
        btnSend.disabled = true;

        // Hide welcome, show messages
        welcomeScreen.classList.add("hidden");
        messagesBox.classList.remove("hidden");

        // Add user message
        appendUserMessage(message);

        // Clear input
        userInput.value = "";
        userInput.style.height = "auto";

        // Show loading pipeline
        const loadingEl = appendLoadingPipeline();

        // Start simulated pipeline progress
        const pipelineTimer = animatePipeline(loadingEl);

        // Call API
        fetchTravelPlan(message, loadingEl, pipelineTimer);
    }

    // ---- Append User Message ----
    function appendUserMessage(text) {
        const div = document.createElement("div");
        div.className = "message message-user";
        div.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
        messagesBox.appendChild(div);
        scrollToBottom();
    }

    // ---- Append AI Message ----
    let responseCounter = 0;

    function appendAIMessage(markdownText) {
        responseCounter++;
        const responseId = `response-${responseCounter}`;
        const div = document.createElement("div");
        div.className = "message message-ai";
        div.setAttribute("data-response-id", responseId);
        div.setAttribute("data-raw-markdown", markdownText);
        div.innerHTML = `
            <div class="message-ai-header">
                <div class="ai-avatar">
                    <svg viewBox="0 0 16 16" fill="white">
                        <path d="M8 2 L12 6 L8 12 L4 6Z" />
                    </svg>
                </div>
                <span class="ai-name">Sarthi AI</span>
            </div>
            <div class="message-content" id="${responseId}">${renderMarkdown(markdownText)}
                <div class="response-actions">
                    <button class="action-btn btn-copy" onclick="window.__sarthi.copyResponse('${responseId}')" title="Copy to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span class="action-btn-label">Copy</span>
                    </button>
                    <button class="action-btn btn-download" onclick="window.__sarthi.downloadPDF('${responseId}')" title="Download as PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span class="action-btn-label">Download PDF</span>
                    </button>
                </div>
            </div>
        `;
        messagesBox.appendChild(div);
        scrollToBottom();
    }

    // ---- Append Error Message ----
    function appendErrorMessage(errorText) {
        const div = document.createElement("div");
        div.className = "message message-ai message-error";
        div.innerHTML = `
            <div class="message-ai-header">
                <div class="ai-avatar">
                    <svg viewBox="0 0 16 16" fill="white">
                        <path d="M8 2 L12 6 L8 12 L4 6Z" />
                    </svg>
                </div>
                <span class="ai-name">Sarthi AI</span>
            </div>
            <div class="message-content">
                <p class="error-text">⚠️ Something went wrong</p>
                <p>${escapeHtml(errorText)}</p>
                <p style="color: var(--text-tertiary); margin-top: 0.5em;">Please try again or rephrase your request.</p>
            </div>
        `;
        messagesBox.appendChild(div);
        scrollToBottom();
    }

    // ---- Loading Pipeline ----
    function appendLoadingPipeline() {
        const div = document.createElement("div");
        div.className = "message message-ai loading-container";

        let stepsHTML = "";
        PIPELINE_STEPS.forEach((step, i) => {
            const stateClass = i === 0 ? "step-active" : "step-pending";
            stepsHTML += `
                <div class="pipeline-step ${stateClass}" data-step="${step.id}">
                    <div class="step-indicator">${step.icon}</div>
                    <span class="step-label">${step.label}</span>
                </div>
            `;
            if (i < PIPELINE_STEPS.length - 1) {
                stepsHTML += `<div class="step-connector"></div>`;
            }
        });

        div.innerHTML = `
            <div class="message-ai-header">
                <div class="ai-avatar">
                    <svg viewBox="0 0 16 16" fill="white">
                        <path d="M8 2 L12 6 L8 12 L4 6Z" />
                    </svg>
                </div>
                <span class="ai-name">Sarthi AI</span>
            </div>
            <div class="agent-pipeline">
                <div class="pipeline-title">Planning your trip</div>
                ${stepsHTML}
                <div class="thinking-dots">
                    <span>Working</span>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;

        messagesBox.appendChild(div);
        scrollToBottom();
        return div;
    }

    // ---- Animate Pipeline Steps ----
    function animatePipeline(loadingEl) {
        let currentStep = 0;
        const steps = loadingEl.querySelectorAll(".pipeline-step");
        const connectors = loadingEl.querySelectorAll(".step-connector");

        const timer = setInterval(() => {
            if (currentStep >= steps.length - 1) {
                clearInterval(timer);
                return;
            }

            // Mark current as done
            steps[currentStep].classList.remove("step-active");
            steps[currentStep].classList.add("step-done");

            // Mark connector as connected
            if (connectors[currentStep]) {
                connectors[currentStep].classList.add("connected");
            }

            currentStep++;

            // Mark next as active
            if (currentStep < steps.length) {
                steps[currentStep].classList.remove("step-pending");
                steps[currentStep].classList.add("step-active");
            }

            scrollToBottom();
        }, 4000); // ~4s per step to match typical API response time

        return timer;
    }

    // ---- Complete Pipeline (all steps done) ----
    function completePipeline(loadingEl) {
        const steps = loadingEl.querySelectorAll(".pipeline-step");
        const connectors = loadingEl.querySelectorAll(".step-connector");

        steps.forEach((step) => {
            step.classList.remove("step-active", "step-pending");
            step.classList.add("step-done");
        });

        connectors.forEach((c) => c.classList.add("connected"));
    }

    // ---- API Call ----
    async function fetchTravelPlan(message, loadingEl, pipelineTimer) {
        try {
            const response = await fetch("/api/travel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    thread_id: threadId,
                }),
            });

            const data = await response.json();

            // Stop pipeline animation
            clearInterval(pipelineTimer);

            if (data.success) {
                threadId = data.thread_id;

                // Complete all pipeline steps
                completePipeline(loadingEl);

                // Small delay to show completion, then show result
                setTimeout(() => {
                    loadingEl.remove();
                    appendAIMessage(data.answer);
                }, 600);
            } else {
                loadingEl.remove();
                appendErrorMessage(data.error || "Unknown error occurred.");
            }
        } catch (err) {
            clearInterval(pipelineTimer);
            loadingEl.remove();
            appendErrorMessage(
                err.message || "Network error. Please check your connection."
            );
        } finally {
            isProcessing = false;
            btnSend.disabled = false;
            userInput.focus();
        }
    }

    // ---- Reset Chat ----
    function resetChat() {
        threadId = null;
        messagesBox.innerHTML = "";
        messagesBox.classList.add("hidden");
        welcomeScreen.classList.remove("hidden");
        userInput.value = "";
        userInput.style.height = "auto";
        userInput.focus();
    }

    // ---- Scroll to Bottom ----
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        });
    }

    // ---- Render Markdown ----
    function renderMarkdown(text) {
        if (typeof marked !== "undefined" && marked.parse) {
            marked.setOptions({
                breaks: true,
                gfm: true,
            });
            return marked.parse(text);
        }
        // Fallback: basic line breaks
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");
    }

    // ---- Escape HTML ----
    function escapeHtml(str) {
        const el = document.createElement("span");
        el.textContent = str;
        return el.innerHTML;
    }

    // ---- Copy Response ----
    function copyResponse(responseId) {
        const messageEl = document.querySelector(`[data-response-id] #${responseId}`);
        const parentMsg = messageEl ? messageEl.closest(".message-ai") : null;
        const rawMarkdown = parentMsg ? parentMsg.getAttribute("data-raw-markdown") : "";

        const textToCopy = rawMarkdown || (messageEl ? messageEl.innerText : "");
        const copyBtn = messageEl ? messageEl.querySelector(".btn-copy") : null;

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (copyBtn) {
                const label = copyBtn.querySelector(".action-btn-label");
                copyBtn.classList.add("copied");
                label.textContent = "Copied!";
                setTimeout(() => {
                    copyBtn.classList.remove("copied");
                    label.textContent = "Copy";
                }, 2000);
            }
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = textToCopy;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            if (copyBtn) {
                const label = copyBtn.querySelector(".action-btn-label");
                copyBtn.classList.add("copied");
                label.textContent = "Copied!";
                setTimeout(() => {
                    copyBtn.classList.remove("copied");
                    label.textContent = "Copy";
                }, 2000);
            }
        });
    }

    // ---- Download PDF ----
    function downloadPDF(responseId) {
        const messageEl = document.getElementById(responseId);
        if (!messageEl) return;

        const downloadBtn = messageEl.querySelector(".btn-download");
        if (downloadBtn) {
            downloadBtn.classList.add("downloading");
            const label = downloadBtn.querySelector(".action-btn-label");
            label.textContent = "Generating...";
        }

        // Create a clean clone for PDF (without action buttons)
        const pdfContent = document.createElement("div");
        pdfContent.innerHTML = messageEl.innerHTML;

        // Remove action buttons from the clone
        const actionsEl = pdfContent.querySelector(".response-actions");
        if (actionsEl) actionsEl.remove();

        // Add branding header
        const header = document.createElement("div");
        header.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:14px; border-bottom:2px solid #F59E0B;">
                <div style="font-size:20px; font-weight:700; color:#F59E0B;">🧭 Sarthi AI</div>
                <div style="font-size:11px; color:#888; margin-left:auto;">Travel Plan — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
        `;
        pdfContent.insertBefore(header, pdfContent.firstChild);

        // PDF options
        const opt = {
            margin:       [12, 14, 12, 14],
            filename:     `Sarthi-AI-Travel-Plan-${new Date().toISOString().slice(0, 10)}.pdf`,
            image:        { type: "jpeg", quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
            jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
        };

        // Apply PDF-friendly styles to the clone
        pdfContent.style.cssText = `
            font-family: 'Inter', 'Segoe UI', sans-serif;
            font-size: 13px;
            line-height: 1.7;
            color: #1a1a1a;
            padding: 8px;
        `;

        // Style headings in the clone
        pdfContent.querySelectorAll("h1, h2, h3").forEach((h) => {
            h.style.color = "#1a1a1a";
            h.style.marginTop = "18px";
            h.style.marginBottom = "8px";
        });
        pdfContent.querySelectorAll("h2").forEach((h) => {
            h.style.color = "#D97706";
            h.style.borderBottom = "1px solid #eee";
            h.style.paddingBottom = "4px";
        });
        pdfContent.querySelectorAll("strong").forEach((s) => {
            s.style.color = "#B45309";
        });
        pdfContent.querySelectorAll("hr").forEach((hr) => {
            hr.style.border = "none";
            hr.style.borderTop = "1px solid #e5e5e5";
            hr.style.margin = "14px 0";
        });
        pdfContent.querySelectorAll("table").forEach((t) => {
            t.style.borderCollapse = "collapse";
            t.style.width = "100%";
            t.style.fontSize = "12px";
        });
        pdfContent.querySelectorAll("th, td").forEach((cell) => {
            cell.style.padding = "6px 10px";
            cell.style.borderBottom = "1px solid #e5e5e5";
            cell.style.textAlign = "left";
        });
        pdfContent.querySelectorAll("th").forEach((th) => {
            th.style.color = "#D97706";
            th.style.fontWeight = "600";
        });

        if (typeof html2pdf !== "undefined") {
            html2pdf().set(opt).from(pdfContent).save().then(() => {
                if (downloadBtn) {
                    downloadBtn.classList.remove("downloading");
                    const label = downloadBtn.querySelector(".action-btn-label");
                    label.textContent = "Downloaded!";
                    setTimeout(() => {
                        label.textContent = "Download PDF";
                    }, 2000);
                }
            }).catch(() => {
                if (downloadBtn) {
                    downloadBtn.classList.remove("downloading");
                    const label = downloadBtn.querySelector(".action-btn-label");
                    label.textContent = "Download PDF";
                }
                alert("PDF generation failed. Please try again.");
            });
        } else {
            // Fallback: open print dialog
            const printWin = window.open("", "_blank");
            printWin.document.write(`
                <html><head><title>Sarthi AI Travel Plan</title>
                <style>body{font-family:Inter,sans-serif;padding:30px;color:#1a1a1a;line-height:1.7;font-size:14px;}
                h2{color:#D97706;border-bottom:1px solid #eee;padding-bottom:4px;}
                strong{color:#B45309;}
                hr{border:none;border-top:1px solid #e5e5e5;margin:14px 0;}</style>
                </head><body>${pdfContent.innerHTML}</body></html>
            `);
            printWin.document.close();
            printWin.print();

            if (downloadBtn) {
                downloadBtn.classList.remove("downloading");
                const label = downloadBtn.querySelector(".action-btn-label");
                label.textContent = "Download PDF";
            }
        }
    }

    // ---- Expose to window for inline onclick handlers ----
    window.__sarthi = {
        copyResponse,
        downloadPDF,
    };

    // ---- Boot ----
    document.addEventListener("DOMContentLoaded", init);
})();
