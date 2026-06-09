(function () {
  "use strict";

  const script = document.currentScript;
  if (!script) return;

  const apiKey = script.getAttribute("data-key");
  const apiUrl = script.getAttribute("data-api-url") || window.location.origin;

  if (!apiKey) {
    console.error("[FeedbackWidget] data-key attribute is required");
    return;
  }

  // ============ Styles ============
  const styles = `
    .fbw-button {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 999998 !important;
      background: #000 !important;
      color: #fff !important;
      border: none !important;
      padding: 12px 20px !important;
      border-radius: 999px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      transition: transform 0.2s !important;
    }
    .fbw-button:hover { transform: scale(1.05) !important; }

    .fbw-modal {
      position: fixed !important;
      inset: 0 !important;
      z-index: 999999 !important;
      display: none;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }
    .fbw-modal.open { display: flex !important; }

    .fbw-backdrop {
      position: absolute !important;
      inset: 0 !important;
      background: rgba(0,0,0,0.5) !important;
    }

    .fbw-content {
      position: relative !important;
      background: #fff !important;
      border-radius: 12px !important;
      padding: 24px !important;
      width: 90% !important;
      max-width: 420px !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
    }

    .fbw-title {
      margin: 0 0 16px 0 !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #111 !important;
    }

    .fbw-textarea, .fbw-input {
      width: 100% !important;
      padding: 10px 12px !important;
      border: 1px solid #d1d5db !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-family: inherit !important;
      box-sizing: border-box !important;
      margin-bottom: 12px !important;
      color: #111 !important;
      background: #fff !important;
    }
    .fbw-textarea { min-height: 100px !important; resize: vertical !important; }
    .fbw-textarea:focus, .fbw-input:focus { outline: none !important; border-color: #000 !important; }

    .fbw-actions {
      display: flex !important;
      gap: 8px !important;
      justify-content: flex-end !important;
      margin-top: 8px !important;
    }

    .fbw-btn {
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      border: none !important;
    }
    .fbw-btn-secondary {
      background: #fff !important;
      color: #111 !important;
      border: 1px solid #d1d5db !important;
    }
    .fbw-btn-primary {
      background: #000 !important;
      color: #fff !important;
    }
    .fbw-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }

    .fbw-status {
      margin-top: 12px !important;
      font-size: 13px !important;
      min-height: 18px !important;
    }
    .fbw-status.success { color: #059669 !important; }
    .fbw-status.error { color: #dc2626 !important; }
    .fbw-status.info { color: #6b7280 !important; }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ============ HTML ============
  const button = document.createElement("button");
  button.className = "fbw-button";
  button.type = "button";
  button.textContent = "💬 Feedback";
  document.body.appendChild(button);

  const modal = document.createElement("div");
  modal.className = "fbw-modal";
  modal.innerHTML = `
    <div class="fbw-backdrop"></div>
    <div class="fbw-content">
      <h2 class="fbw-title">Send us feedback</h2>
      <textarea class="fbw-textarea" placeholder="What's on your mind?" maxlength="2000"></textarea>
      <input class="fbw-input" type="email" placeholder="Your email (optional)" />
      <div class="fbw-actions">
        <button type="button" class="fbw-btn fbw-btn-secondary fbw-cancel">Cancel</button>
        <button type="button" class="fbw-btn fbw-btn-primary fbw-submit">Send</button>
      </div>
      <div class="fbw-status"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // ============ Logic ============
  const textarea = modal.querySelector(".fbw-textarea");
  const emailInput = modal.querySelector(".fbw-input");
  const submitBtn = modal.querySelector(".fbw-submit");
  const cancelBtn = modal.querySelector(".fbw-cancel");
  const backdrop = modal.querySelector(".fbw-backdrop");
  const status = modal.querySelector(".fbw-status");

  function openModal() {
    modal.classList.add("open");
    setTimeout(() => textarea.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove("open");
    status.textContent = "";
    status.className = "fbw-status";
  }

  function setStatus(text, type) {
    status.textContent = text;
    status.className = "fbw-status " + type;
  }

  button.addEventListener("click", openModal);
  cancelBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  submitBtn.addEventListener("click", async () => {
    const message = textarea.value.trim();
    const email = emailInput.value.trim();

    if (!message) {
      setStatus("Please enter a message", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending...", "info");

    try {
      const res = await fetch(`${apiUrl}/api/feedback/${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email: email || "",
          pageUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setStatus("✓ Thanks for your feedback!", "success");
      textarea.value = "";
      emailInput.value = "";
      setTimeout(closeModal, 1500);
    } catch (err) {
      setStatus("Error: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();