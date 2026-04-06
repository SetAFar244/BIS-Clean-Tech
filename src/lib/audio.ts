export class AudioRecorder {
  private context: AudioContext;
  private stream: MediaStream | null = null;
  private worklet: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(context: AudioContext) {
    this.context = context;
  }

  async start(onData: (base64: string) => void) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
      },
    });

    await this.context.audioWorklet.addModule(
      URL.createObjectURL(
        new Blob(
          [
            `
            class RecorderWorklet extends AudioWorkletProcessor {
              process(inputs, outputs, parameters) {
                const input = inputs[0];
                if (input && input.length > 0) {
                  const channelData = input[0];
                  const pcm16 = new Int16Array(channelData.length);
                  for (let i = 0; i < channelData.length; i++) {
                    let s = Math.max(-1, Math.min(1, channelData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  this.port.postMessage(pcm16.buffer);
                }
                return true;
              }
            }
            registerProcessor('recorder-worklet', RecorderWorklet);
            `
          ],
          { type: 'application/javascript' }
        )
      )
    );

    this.source = this.context.createMediaStreamSource(this.stream);
    this.worklet = new AudioWorkletNode(this.context, 'recorder-worklet');

    this.worklet.port.onmessage = (e) => {
      const buffer = e.data as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      onData(btoa(binary));
    };

    this.source.connect(this.worklet);
  }

  stop() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.source?.disconnect();
    this.worklet?.disconnect();
    this.stream = null;
    this.source = null;
    this.worklet = null;
  }
}

export class AudioPlayer {
  private context: AudioContext;
  private nextTime: number = 0;
  private sources: AudioBufferSourceNode[] = [];
  public onPlayStart?: () => void;
  public onPlayEnd?: () => void;
  private activeSources = 0;

  constructor(context: AudioContext) {
    this.context = context;
  }

  play(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }

    const buffer = this.context.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);

    const currentTime = this.context.currentTime;
    if (this.nextTime < currentTime) {
      this.nextTime = currentTime;
    }

    source.start(this.nextTime);
    this.sources.push(source);
    
    if (this.activeSources === 0 && this.onPlayStart) {
      this.onPlayStart();
    }
    this.activeSources++;

    source.onended = () => {
      this.sources = this.sources.filter(s => s !== source);
      this.activeSources--;
      if (this.activeSources === 0 && this.onPlayEnd) {
        this.onPlayEnd();
      }
    };

    this.nextTime += buffer.duration;
  }

  stop() {
    this.sources.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    this.sources = [];
    this.nextTime = 0;
    this.activeSources = 0;
    if (this.onPlayEnd) this.onPlayEnd();
  }
}
