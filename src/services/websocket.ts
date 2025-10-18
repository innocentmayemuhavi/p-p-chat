import { WS_URL } from '../shared/constants';

export type MessageType = 'text' | 'system';

export interface Message {
    id: string;
    from: string;
    to: string;
    message: string;
    timestamp: string;
    type: MessageType;
}

export interface WebSocketMessage {
    type: 'authenticate' | 'signal' | 'message' | 'typing' | 'user-status' | 'offline-messages';
    [key: string]: any;
}

class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, Set<Function>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;

    connect(token: string, peerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(WS_URL);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;

                    // Authenticate
                    this.send({
                        type: 'authenticate',
                        token,
                        peerId,
                    });

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.attemptReconnect(token, peerId);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect(token: string, peerId: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect(token, peerId).catch(() => {
                    // Connection failed, will retry
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }

    send(data: WebSocketMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    on(eventType: string, handler: Function) {
        if (!this.messageHandlers.has(eventType)) {
            this.messageHandlers.set(eventType, new Set());
        }
        this.messageHandlers.get(eventType)!.add(handler);
    }

    off(eventType: string, handler: Function) {
        const handlers = this.messageHandlers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    private handleMessage(data: WebSocketMessage) {
        const handlers = this.messageHandlers.get(data.type);
        if (handlers) {
            handlers.forEach((handler) => handler(data));
        }
    }

    sendMessage(to: string, from: string, message: string, id: string) {
        this.send({
            type: 'message',
            to,
            from,
            message,
            timestamp: new Date().toISOString(),
            id,
        });
    }

    sendTyping(to: string, from: string, isTyping: boolean) {
        this.send({
            type: 'typing',
            to,
            from,
            isTyping,
        });
    }

    sendSignal(to: string, from: string, signal: any, peerId: string) {
        this.send({
            type: 'signal',
            to,
            from,
            signal,
            peerId,
        });
    }
}

export const wsService = new WebSocketService();
