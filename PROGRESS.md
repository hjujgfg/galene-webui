# Galène WebUI Rewrite - Progress Summary

## Accomplishments

### 🚀 Deployment & Routing
- **Galène Integration:** Fixed the "Forbidden" error by configuring SvelteKit to generate a proper `index.html` entry point for Galène's static file server.
- **Path Compatibility:** Changed the SvelteKit internal directory from `_app/` to `app/` to avoid routing conflicts with Galène's group handlers.
- **Dev Workflow:** Set up a Vite proxy for `/ws` to bypass `Origin` check issues and integrated `basic-ssl` to allow HTTPS testing on mobile devices (essential for `getUserMedia`).

### 🔧 WebRTC & Protocol (protocol.js)
- **Stable Negotiation:** Fixed the "no ice-ufrag" server error by ensuring tracks are manually added to the `RTCPeerConnection` before triggering negotiation.
- **Reactive State:** Wrapped the Galène `ServerConnection` in a Svelte 5 reactive module (`rtc.svelte.ts`), mapping protocol callbacks to reactive runes.
- **Identity Management:** Resolved "unknown user" warnings by ensuring the group join process completes before media streams are published.
- **Media Cleanup:** Fixed hardware leakage where the camera/mic remained active after being toggled off by implementing explicit track stopping and stream restarts.

### 🎨 UI/UX & Aesthetics
- **Modern Login:** Built a "Dark Aero" login page featuring a real-time media preview.
- **Async Join Flow:** Converted the callback-based `connect` and `join` methods into Promises to provide a smooth, single-click join experience with loading states.
- **Persistent State:** Ensured that camera and microphone choices made on the preview screen are correctly carried over into the meeting.
- **Animated Layout:** Added sliding animations using Svelte transitions for the User List, Chat, and Settings panels.
- **HD Quality:** Updated media constraints to request 720p HD video by default.

---

## 🛠 Next Steps

### 1. Video Quality & Optimization
- **Bitrate Controls:** Map the "Send Resolution" settings to the WebRTC `RTCRtpSender` parameters to enforce bitrate and resolution limits.
- **Simulcast:** Implement proper simulcast support in the upstream configuration for better performance in large groups.
- **Stats Monitoring:** Display real-time connection stats (latency, packet loss) in the PeerTiles.

### 2. Device Management
- **Device Enumeration:** Add the ability to list and select specific microphones, cameras, and output speakers.
- **Preview Switching:** Allow users to switch their active camera directly from the preview screen.

### 3. Screen Sharing
- **Implementation:** Integrate `navigator.mediaDevices.getDisplayMedia`.
- **Dual-Streaming:** Test and optimize the UI for users sharing both their camera and their screen simultaneously.

### 4. Advanced Features
- **Operator Actions:** Add UI for kicking users and managing group permissions.
- **File Transfer:** Implement the Galène peer-to-peer file transfer protocol.
- **Blackboard Mode:** Add support for the shared drawing/presentation mode.
