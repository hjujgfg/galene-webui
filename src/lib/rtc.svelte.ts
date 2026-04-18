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
    previewStream = $state<MediaStream | null>(null);
    micEnabled = $state(false);
    cameraEnabled = $state(false);
    settingsOpen = $state(false);
    chatOpen = $state(false);
    userListOpen = $state(false);
    endpoint = $state('');
    settings = $state({
        simulcast: 'auto',
        send: 'unlimited',
        request: 'everything',
        activityDetection: false,
        displayAll: false,
        mirrorView: true,
        blackboardMode: false,
        preprocessing: true,
        hqaudio: true,
    });

    constructor() {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.endpoint = `${protocol}//${window.location.host}/ws`;
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
            this.stopLocalStream();
        }
        if (this.connection) {
            this.connection.close();
        }
    }

    async startPreview(audio: boolean, video: boolean) {
        if (!audio && !video) {
            this.stopPreview();
            this.micEnabled = false;
            this.cameraEnabled = false;
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.error = 'Media access is not supported in this browser (likely due to an insecure context/lack of HTTPS).';
            return;
        }
        try {
            if (this.previewStream) {
                this.stopPreview();
            }
            this.previewStream = await navigator.mediaDevices.getUserMedia({
                audio: audio,
                video: video
            });
            this.micEnabled = audio;
            this.cameraEnabled = video;
        } catch (e: any) {
            this.error = e.toString();
        }
    }

    stopPreview() {
        if (this.previewStream) {
            this.previewStream.getTracks().forEach(t => t.stop());
            this.previewStream = null;
        }
        this.micEnabled = false;
        this.cameraEnabled = false;
    }

    async togglePreviewMic() {
        if (!this.previewStream) {
            await this.startPreview(true, false);
            return;
        }

        if (this.micEnabled) {
            // Turning OFF
            if (!this.cameraEnabled) {
                this.stopPreview();
            } else {
                // Restart preview with audio:false
                await this.startPreview(false, true);
            }
            return;
        }

        // Turning ON
        const audioTracks = this.previewStream.getAudioTracks();
        if (audioTracks.length === 0) {
            const wasVideo = this.cameraEnabled;
            await this.startPreview(true, wasVideo);
        } else {
            audioTracks.forEach(t => t.enabled = true);
            this.micEnabled = true;
        }
    }

    async togglePreviewCamera() {
        if (!this.previewStream) {
            await this.startPreview(false, true);
            return;
        }

        if (this.cameraEnabled) {
            // Turning OFF
            if (!this.micEnabled) {
                this.stopPreview();
            } else {
                // Restart preview with video:false
                await this.startPreview(true, false);
            }
            return;
        }

        const videoTracks = this.previewStream.getVideoTracks();
        if (videoTracks.length === 0) {
            const wasAudio = this.micEnabled;
            await this.startPreview(wasAudio, true);
        } else {
            videoTracks.forEach(t => t.enabled = true);
            this.cameraEnabled = true;
        }
    }

    async startLocalStream(audio: boolean, video: boolean) {
        if (!this.connection) return;
        if (!audio && !video) {
            this.stopLocalStream();
            this.micEnabled = false;
            this.cameraEnabled = false;
            return;
        }
        
        try {
            let stream = this.previewStream;
            if (!stream) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    this.error = 'Media access is not supported in this browser (likely due to an insecure context/lack of HTTPS).';
                    return;
                }
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: audio,
                    video: video
                });
            }

            const up = this.connection.newUpStream();
            up.pc.onnegotiationneeded = null;
            
            up.label = video ? 'camera' : 'audio';
            up.setStream(stream);

            // Ensure tracks match the desired enabled state
            if (stream) {
                stream.getAudioTracks().forEach(t => t.enabled = audio);
                stream.getVideoTracks().forEach(t => t.enabled = video);
            }

            stream.getTracks().forEach((t: any) => {
                up.pc.addTrack(t, stream);
            });
            
            console.log('Starting local stream negotiation...');
            await up.negotiate();
            console.log('Local stream connected');

            this.localUpStream = up;
            this.previewStream = null; // Adopted by upStream
            this.micEnabled = audio;
            this.cameraEnabled = video;

            up.onclose = () => {
                const s = up.stream;
                if (s) {
                    s.getTracks().forEach((t: any) => t.stop());
                }
                // Only reset if this is still the current active stream
                if (this.localUpStream === up) {
                    this.localUpStream = null;
                    this.micEnabled = false;
                    this.cameraEnabled = false;
                }
            };
        } catch (e: any) {
            this.error = e.toString();
        }
    }

    stopLocalStream() {
        if (this.localUpStream) {
            const up = this.localUpStream;
            // Explicitly stop tracks before closing to ensure browser 
            // releases hardware immediately.
            if (up.stream) {
                up.stream.getTracks().forEach((t: any) => t.stop());
            }
            up.close();
        }
    }

    async toggleMic() {
        if (!this.localUpStream) {
            await this.startLocalStream(true, false);
            return;
        }

        if (this.micEnabled) {
            // We want to turn it OFF
            if (!this.cameraEnabled) {
                // Last track, just stop
                this.stopLocalStream();
            } else {
                // Video is still on, restart stream with audio:false
                this.stopLocalStream();
                await this.startLocalStream(false, true);
            }
            return;
        }

        // We want to turn it ON
        const stream = this.localUpStream.stream;
        if (stream) {
            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) {
                // We have a stream (video) but no audio track. Restart with both.
                const wasVideoEnabled = this.cameraEnabled;
                this.stopLocalStream();
                await this.startLocalStream(true, wasVideoEnabled);
                return;
            }
            tracks.forEach((t: any) => {
                t.enabled = true;
            });
            this.micEnabled = true;
        }
    }

    async toggleCamera() {
        if (!this.localUpStream) {
            await this.startLocalStream(false, true);
            return;
        }

        if (this.cameraEnabled) {
            // We want to turn it OFF
            if (!this.micEnabled) {
                // Last track, just stop
                this.stopLocalStream();
            } else {
                // Mic is still on, restart stream with video:false
                this.stopLocalStream();
                await this.startLocalStream(true, false);
            }
            return;
        }
        
        // We want to turn it ON
        const stream = this.localUpStream.stream;
        if (stream) {
            const tracks = stream.getVideoTracks();
            if (tracks.length === 0) {
                // We have a stream (audio) but no video track. Restart with both.
                const wasMicEnabled = this.micEnabled;
                this.stopLocalStream();
                await this.startLocalStream(wasMicEnabled, true);
                return;
            }
            tracks.forEach((t: any) => {
                t.enabled = true;
            });
            this.cameraEnabled = true;
        }
    }
}

export const rtc = new WebRTCState();
