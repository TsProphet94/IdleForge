// Modal System Module

export class ModalSystem {
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

  showAlert(title, message, type = "info") {
    return new Promise((resolve) => {
      this.createModal({
        title,
        message,
        type,
        icon: type === "warning" ? "⚠️" : type === "info" ? "ℹ️" : "✅",
        buttons: [
          {
            text: "OK",
            class: "primary",
            callback: resolve,
          },
        ],
      });
    });
  }

  showConfirm(title, message, type = "confirm") {
    return new Promise((resolve) => {
      this.createModal({
        title,
        message,
        type,
        icon: type === "prestige" ? "⚡" : type === "danger" ? "⚠️" : "❓",
        buttons: [
          {
            text: "Cancel",
            class: "secondary",
            callback: () => resolve(false),
          },
          {
            text: "Confirm",
            class:
              type === "prestige"
                ? "prestige"
                : type === "danger"
                ? "danger"
                : "primary",
            callback: () => resolve(true),
          },
        ],
        onCancel: () => resolve(false),
      });
    });
  }

  showPrestigeConfirm(reward) {
    return new Promise((resolve) => {
      this.createModal({
        title: "Prestige Confirmation",
        message: `
          <p>Are you sure you want to prestige?</p>
          <p><strong>You will gain:</strong> ${reward} Core Shards</p>
          <p><strong>You will lose:</strong> All resources, money, unlocks, and shop upgrades</p>
          <p><strong>You will keep:</strong> Core upgrades and their bonuses</p>
          <p>This action cannot be undone!</p>
        `,
        type: "prestige",
        icon: "⚡",
        buttons: [
          {
            text: "Cancel",
            class: "secondary",
            callback: () => resolve(false),
          },
          {
            text: `Prestige (+${reward} Core Shards)`,
            class: "prestige",
            callback: () => resolve(true),
          },
        ],
        onCancel: () => resolve(false),
      });
    });
  }

  showUnlockRequirement(resourceName, cost) {
    return this.showAlert(
      "Unlock Required",
      `You need <strong>$${fmt(
        cost
      )}</strong> to unlock <strong>${resourceName}</strong>!`,
      "warning"
    );
  }
}

// Singleton instance
export const modalSystem = new ModalSystem();
