import { ServerConnection, Stream } from './protocol.js';

export interface User {
    username: string;
    permissions: string[];
    data: Record<string, any>;
}

export interface ChatMessage {
    id: string;
    username: string;
    time: number;
    text: string;
    kind: string;
    privileged?: boolean;
}

export interface RemoteTrack {
    id: string;
    stream: Stream;
    kind: string;
    label: string;
}

class WebRTCState {
    connection = $state<any>(null);
    users = $state<Record<string, User>>({});
    chat = $state<ChatMessage[]>([]);
    joined = $state(false);
    connected = $state(false);
    error = $state<string | null>(null);
    remoteTracks = $state<RemoteTrack[]>([]);
    localUpStream = $state<any>(null);
    micEnabled = $state(false);
    cameraEnabled = $state(false);
    settingsOpen = $state(false);
    settings = $state({
        simulcast: 'auto',
        send: 'normal',
        request: 'everything',
        activityDetection: false,
        displayAll: false,
        mirrorView: true,
        blackboardMode: false,
        preprocessing: true,
        hqaudio: false,
    });

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    init() {
        const sc = new ServerConnection();
        this.connection = sc;

        sc.onconnected = () => {
            console.log('Connected to Galene');
            this.connected = true;
            this.error = null;
        };

        sc.onerror = (e: any) => {
            console.error('Galene error:', e);
            this.error = e.toString();
        };

        sc.onclose = () => {
            console.log('Galene connection closed');
            this.connected = false;
            this.joined = false;
            this.users = {};
            this.remoteTracks = [];
        };

        sc.onuser = (id: string, kind: string) => {
            console.log('onuser:', { id, kind });
            if (kind === 'add' || kind === 'change') {
                this.users[id] = sc.users[id];
            } else if (kind === 'delete') {
                delete this.users[id];
            }
        };

        sc.onjoined = (kind: string, group: string, permissions: string[], status: any, data: any, error: string | null) => {
            console.log('onjoined:', { kind, group, permissions, status, error });
            if (kind === 'join' || kind === 'change') {
                this.joined = true;
                this.error = null;
                if (status && status.rtcConfiguration) {
                    sc.rtcConfiguration = status.rtcConfiguration;
                }
                // Request media from others. 
                // In Galene protocol, '' means "all users", 
                // and we want both video and audio.
                sc.request({ '': ['video', 'audio'] });
            } else if (kind === 'fail' || kind === 'leave') {
                this.error = error || (kind === 'fail' ? 'Join failed' : null);
                this.joined = false;
            }
        };

        sc.onchat = (
            id: string, 
            source: string, 
            dest: string, 
            username: string, 
            time: Date | null, 
            privileged: boolean, 
            history: boolean, 
            kind: string, 
            text: string
        ) => {
            this.chat.push({ 
                id, 
                username: username || source, 
                time: time ? time.getTime() : Date.now(), 
                text, 
                kind, 
                privileged 
            });
        };

        sc.ondownstream = (stream: any) => {
            console.log('ondownstream:', stream);
            
            stream.onclose = () => {
                this.remoteTracks = this.remoteTracks.filter(t => t.stream !== stream);
            };

            stream.onerror = (e: any) => {
                console.error('Stream error:', e);
            };

            // Stream objects in protocol.js can have multiple tracks, 
            // but for UI tiles we usually want one tile per Stream object.
            // When we get a new downtrack, we check if we already have a tile for this stream.
            stream.ondowntrack = (track: any) => {
                console.log('ondowntrack:', track.kind, track.label);
                if (!this.remoteTracks.some(t => t.stream === stream)) {
                    this.remoteTracks.push({
                        id: stream.id,
                        stream: stream,
                        kind: 'video', // we want video if it exists
                        label: stream.username || stream.source || 'Peer'
                    });
                }
            };
        };
    }

    async connect(url: string): Promise<void> {
        if (!this.connection) return;
        if (this.connected) return;

        return new Promise((resolve, reject) => {
            const sc = this.connection;
            const oldConnected = sc.onconnected;
            const oldError = sc.onerror;

            sc.onconnected = () => {
                if (oldConnected) oldConnected.call(sc);
                resolve();
            };

            sc.onerror = (e: any) => {
                if (oldError) oldError.call(sc, e);
                reject(e);
            };

            try {
                sc.connect(url);
            } catch (e: any) {
                reject(e);
            }
        });
    }

    async join(group: string, username: string, creds: any): Promise<void> {
        if (!this.connection) return;

        return new Promise((resolve, reject) => {
            const sc = this.connection;
            const oldJoined = sc.onjoined;

            sc.onjoined = (kind: string, group: string, permissions: string[], status: any, data: any, error: string | null) => {
                if (oldJoined) oldJoined.call(sc, kind, group, permissions, status, data, error);
                if (kind === 'join' || kind === 'change') {
                    resolve();
                } else if (kind === 'fail') {
                    reject(new Error(error || 'Join failed'));
                }
            };

            try {
                sc.join(group, username, creds);
            } catch (e: any) {
                reject(e);
            }
        });
    }

    async close() {
        if (this.localUpStream) {
            this.stopCamera();
        }
        if (this.connection) {
            this.connection.close();
        }
    }

    async startCamera() {
        if (!this.connection) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.error = 'Media access is not supported in this browser (likely due to an insecure context/lack of HTTPS).';
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

            const up = this.connection.newUpStream();
            // Disable automatic negotiation to avoid race conditions 
            // with our manual call below.
            up.pc.onnegotiationneeded = null;
            
            up.label = 'camera';
            up.setStream(stream);

            // CRITICAL: Manually add tracks to the peer connection 
            // before negotiating, otherwise the offer will be empty.
            stream.getTracks().forEach((t: any) => {
                up.pc.addTrack(t, stream);
            });
            
            console.log('Starting local stream negotiation...');
            await up.negotiate();
            console.log('Local stream connected');

            this.localUpStream = up;
            this.micEnabled = true;
            this.cameraEnabled = true;

            up.onclose = () => {
                const s = up.stream;
                if (s) {
                    s.getTracks().forEach((t: any) => t.stop());
                }
                this.localUpStream = null;
                this.micEnabled = false;
                this.cameraEnabled = false;
            };
        } catch (e: any) {
            this.error = e.toString();
        }
    }

    stopCamera() {
        if (this.localUpStream) {
            this.localUpStream.close();
        }
    }

    toggleMic() {
        if (!this.localUpStream) return;
        const stream = this.localUpStream.stream;
        if (stream) {
            stream.getAudioTracks().forEach((t: any) => {
                t.enabled = !this.micEnabled;
            });
            this.micEnabled = !this.micEnabled;
        }
    }

    toggleCamera() {
        if (!this.localUpStream) return;
        const stream = this.localUpStream.stream;
        if (stream) {
            stream.getVideoTracks().forEach((t: any) => {
                t.enabled = !this.cameraEnabled;
            });
            this.cameraEnabled = !this.cameraEnabled;
        }
    }
}

export const rtc = new WebRTCState();
