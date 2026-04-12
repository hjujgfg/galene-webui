# Project Context: Galène WebRTC Frontend Rewrite

## The Mission
We are rewriting the web frontend for the Galène Selective Forwarding Unit (SFU). The backend is written in Go and handles WebRTC media routing and WebSocket signaling. Our goal is to build a modern, reactive client in Svelte that maintains 100% feature parity with the original UI while drastically improving the architecture and aesthetics.

## Tech Stack
* **Framework:** Svelte (Use modern Svelte 5 Runes: `$state`, `$derived`, `$effect`).
* **Toolchain:** Vite.
* **Styling:** Vanilla CSS (Dark Aero / Glassmorphism aesthetic).
* **Signaling/WebRTC:** Galène's native `protocol.js` (Required).

## Architectural Imperatives (Strict)
1. **Do NOT reinvent the WebRTC wheel:** You must strictly use the `ServerConnection` class provided in `protocol.js` for all WebSocket signaling, ICE candidate negotiation, and track management. Do not attempt to write raw `RTCPeerConnection` logic.
2. **The Reactive Wrapper:** Wrap the `protocol.js` instance in a central, reactive Svelte state module. Map the `protocol.js` class callbacks (e.g., `onuser`, `onupdatetrack`, `onchat`) to update this reactive Svelte state.
3. **Stateless UI Components:** The UI components (VideoGrid, ChatPanel, SettingsSidebar) must act as reactive consumers of the central WebRTC state. They should not manage internal WebRTC media states independently.
4. **Feature Parity:** Reference the original `galene.html` to ensure all core functionality is preserved, including:
   * Login states (Username/Password authentication).
   * Chat functionality (public text messaging).
   * User list tracking with permission indicators (op/present).
   * Media controls (mute microphone, disable camera, screen share).
   * Settings (resolution limits, simulcast, blackboard mode).

## UI/UX Guidelines
* Implement a "Dark Aero" aesthetic: use deep dark backgrounds (e.g., `#0a0a0c`), translucent glass panels (`backdrop-filter: blur(12px)`), and subtle cyan accent glows for active states and focus rings.
* Avoid monolithic files. Break the UI down logically into isolated components (e.g., `LoginForm.svelte`, `ChatPanel.svelte`, `VideoGrid.svelte`, `PeerTile.svelte`).

## Workflow Rules
* Think step-by-step and outline your architectural approach before writing the code.
* Ensure you handle the cleanup of `srcObject` streams when a user disconnects or unpublishes a track to prevent memory leaks in the browser.
* Use global CSS variables (`:root`) for the theme colors to maintain consistency across scoped Svelte components.
