import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { AudioRecorder, AudioPlayer } from '../lib/audio';
import { checkAvailability, bookAppointment } from '../lib/appointments';

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    // Create AudioContext synchronously on click to avoid losing user gesture context
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioCtx;
    const recorder = new AudioRecorder(audioCtx);
    const player = new AudioPlayer(audioCtx);
    
    player.onPlayStart = () => setIsSpeaking(true);
    player.onPlayEnd = () => setIsSpeaking(false);

    recorderRef.current = recorder;
    playerRef.current = player;

    try {
      // Resume audio context in case it was suspended
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 1. Check for API key selection (AI Studio environment)
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
        }
      }

      // 2. Validate API Key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        throw new Error("GEMINI_API_KEY is missing! Make sure your .env file is in the root folder and you ran 'npm run build'.");
      }

      // 3. Request microphone immediately to preserve user gesture
      let isSessionOpen = false;
      await recorder.start((base64Data) => {
        if (isSessionOpen && sessionRef.current) {
          sessionRef.current.then((session: any) => {
            try {
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            } catch (e) {
              console.warn("Failed to send audio chunk", e);
            }
          });
        }
      });

      // 4. Connect to Gemini Live API
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are Miriam, the highly capable, friendly, and professional AI receptionist for Brown's IT Solutions in Atlanta. 
You sound super human, warm, and engaging. 
Your job is to help callers book appointments and explain the various services provided to Atlanta Businesses.
Our services are: Business Consulting, Backup & Recovery Systems, Computer Networking, Computer Repair, Cybersecurity, IT Consulting, Network Support, Cloud Management, Web Design, Web Development, and IT Support (Remote and On-Site).

For booking appointments:
1. Ask for the customer's name, phone number, email address, and what service they need.
2. Ask what date they prefer.
3. Use the checkAvailability tool to find available times for that date.
4. Offer the available times to the customer.
5. Once they choose a time, use the bookAppointment tool to finalize the booking.
6. Confirm the booking details with the customer.

Keep your responses concise, conversational, and helpful. Do not sound robotic.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "checkAvailability",
                  description: "Check available appointment times for a specific date.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      date: {
                        type: Type.STRING,
                        description: "The date to check availability for, in YYYY-MM-DD format."
                      }
                    },
                    required: ["date"]
                  }
                },
                {
                  name: "bookAppointment",
                  description: "Book an appointment for a customer.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      customerName: { type: Type.STRING, description: "Customer's full name" },
                      customerEmail: { type: Type.STRING, description: "Customer's email address" },
                      customerPhone: { type: Type.STRING, description: "Customer's phone number" },
                      service: { type: Type.STRING, description: "The IT service requested" },
                      date: { type: Type.STRING, description: "Date of the appointment in YYYY-MM-DD format" },
                      time: { type: Type.STRING, description: "Time of the appointment in HH:MM format" }
                    },
                    required: ["customerName", "customerEmail", "customerPhone", "service", "date", "time"]
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onopen: () => {
            isSessionOpen = true;
            setIsConnected(true);
            setIsConnecting(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            // iOS fix: Proactively resume context on incoming message
            if (audioContextRef.current?.state === 'suspended') {
              audioContextRef.current.resume().catch(console.warn);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              player.play(base64Audio);
            }
            
            if (message.serverContent?.interrupted) {
              player.stop();
            }

            const toolCalls = message.toolCall?.functionCalls;
            if (toolCalls) {
              sessionPromise.then(async (session) => {
                const functionResponses = await Promise.all(toolCalls.map(async (call) => {
                  let response = {};
                  try {
                    if (call.name === "checkAvailability") {
                      const args = call.args as { date: string };
                      const slots = await checkAvailability(args.date);
                      response = { availableTimes: slots };
                    } else if (call.name === "bookAppointment") {
                      const args = call.args as { customerName: string, customerEmail: string, customerPhone: string, service: string, date: string, time: string };
                      const id = await bookAppointment(args);
                      response = { success: true, appointmentId: id };
                    }
                  } catch (e) {
                    response = { error: String(e) };
                  }
                  return {
                    id: call.id,
                    name: call.name,
                    response
                  };
                }));
                
                session.sendToolResponse({ functionResponses });
              });
            }
          },
          onclose: () => {
            isSessionOpen = false;
            setIsConnected(false);
            setIsConnecting(false);
            cleanup();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            isSessionOpen = false;
            
            // Handle permission error specifically by resetting key selection state
            if (err instanceof Error && err.message.includes("The caller does not have permission")) {
              setError("API Key permission denied. Please check your GEMINI_API_KEY.");
            } else {
              setError(err instanceof Error ? err.message : "An error occurred");
            }
            
            setIsConnected(false);
            setIsConnecting(false);
            cleanup();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnecting(false);
      cleanup();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
    }
    cleanup();
    setIsConnected(false);
  }, []);

  const cleanup = () => {
    recorderRef.current?.stop();
    playerRef.current?.stop();
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    error,
    connect,
    disconnect,
  };
}
