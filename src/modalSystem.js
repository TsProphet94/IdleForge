// ───────────────────────────────────────────────────────────────────────────
// CUSTOM MODAL SYSTEM
// ───────────────────────────────────────────────────────────────────────────

class ModalSystem {
  constructor() {
    this.currentModal = null;
  }

  createModal(options) {
    // Remove existing modal if any
    this.closeModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const container = document.createElement("div");
    container.className = "modal-container";

    const header = document.createElement("div");
    header.className = "modal-header";

    const icon = document.createElement("div");
    icon.className = `modal-icon ${options.type || "info"}`;
    icon.innerHTML = options.icon || "⚠️";

    const title = document.createElement("h3");
    title.className = "modal-title";
    title.textContent = options.title || "Notification";

    header.appendChild(icon);
    header.appendChild(title);

    const content = document.createElement("div");
    content.className = "modal-content";
    content.innerHTML = options.message || "";

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    // Add buttons based on options
    if (options.buttons) {
      options.buttons.forEach((button) => {
        const btn = document.createElement("button");
        btn.className = `modal-btn ${button.class || "secondary"}`;
        btn.innerHTML = button.text;
        btn.onclick = () => {
          this.closeModal();
          if (button.callback) button.callback();
        };
        actions.appendChild(btn);
      });
    }

    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(actions);
    overlay.appendChild(container);

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeModal();
        if (options.onCancel) options.onCancel();
      }
    });

    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        if (options.onCancel) options.onCancel();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);

    document.body.appendChild(overlay);
    this.currentModal = overlay;

    // Animate in
    setTimeout(() => {
      overlay.classList.add("show");
    }, 10);

    return overlay;
  }

  closeModal() {
    if (this.currentModal) {
      this.currentModal.classList.remove("show");
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }

  showOfflineRewards(offlineTime, totalRewards) {
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
      if (minutes > 0) return `${minutes}m ${secs}s`;
      return `${secs}s`;
    };

    const fmt = (num) => {
      if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q";
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
      return num.toFixed(0);
    };

    const rewardsBreakdown = Object.entries(totalRewards)
      .filter(([_, amount]) => amount > 0)
      .map(([resource, amount]) => {
        const capRes = resource.charAt(0).toUpperCase() + resource.slice(1);
        return `<li><strong>${capRes}:</strong> ${fmt(amount)}</li>`;
      })
      .join("");

    this.createModal({
      title: "Welcome Back!",
      icon: "🌙",
      type: "success",
      message: `
        <div class="offline-rewards-content">
          <p>You were away for <strong>${formatTime(offlineTime)}</strong></p>
          <p>Your mines continued working at 10% efficiency:</p>
          <ul class="offline-rewards-list">
            ${rewardsBreakdown}
          </ul>
          <p class="offline-note">💡 <em>Premium upgrades can increase offline efficiency!</em></p>
        </div>
      `,
      buttons: [
        {
          text: "Collect Rewards",
          class: "primary",
          callback: () => {
            // Rewards are applied when the modal is created
          }
        }
      ]
    });
  }

  showServiceWorkerUpdate() {
    this.createModal({
      title: "Update Available",
      icon: "🔄",
      type: "info",
      message: `
        <p>A new version of IdleForge is available!</p>
        <p>Click "Update Now" to get the latest features and improvements.</p>
      `,
      buttons: [
        {
          text: "Update Now",
          class: "primary",
          callback: () => {
            window.location.reload();
          }
        },
        {
          text: "Later",
          class: "secondary"
        }
      ]
    });
  }
}

// Initialize modal system
const modalSystem = new ModalSystem();

export { ModalSystem, modalSystem };