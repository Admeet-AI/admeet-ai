# AI 마케터 음성 출력 (TTS) 구현 방안

## 목표

AI 마케터가 생각(thought)이나 솔루션(solution)을 텍스트로 표시할 때, 동시에 음성으로도 읽어줌.
→ 회의 참여자가 화면을 안 보고도 마케터의 인사이트를 들을 수 있음.

---

## 방안 비교

| | A. Web Speech API | B. OpenAI TTS | C. ElevenLabs |
|---|---|---|---|
| **비용** | 무료 | $15/1M chars | $5~/mo |
| **음질** | 로봇스러움 (기본 한국어) | 자연스러움 (alloy, nova 등) | 매우 자연스러움 |
| **지연** | 즉시 (로컬) | 0.5~2초 (API 왕복) | 0.5~1.5초 |
| **한국어** | 지원 (OS 음성 의존) | 지원 | 지원 |
| **구현** | 프론트 5줄 | 서버 API + 프론트 오디오 재생 | 서버 API + 프론트 오디오 재생 |
| **오프라인** | 가능 | 불가 | 불가 |

---

## 방안 A: Web Speech API (권장 — 해커톤용)

### 개요
브라우저 내장 `SpeechSynthesis` API 사용. 별도 API 키/비용 없이 즉시 구현.

### 구현

```typescript
// hooks/use-tts.ts
export function useTTS() {
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    // 이전 발화 중단
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.1;  // 약간 빠르게 (회의 흐름 방해 최소화)
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // 한국어 음성 선택 (가능하면 여성 음성)
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith("ko"));
    if (koVoice) utterance.voice = koVoice;

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => window.speechSynthesis?.cancel();

  return { speak, stop };
}
```

### 적용 위치

```typescript
// marketer-panel.tsx 또는 meeting page에서
const { speak } = useTTS();

// store 구독 — 새 thought/solution 추가 시 자동 읽기
useEffect(() => {
  const lastThought = thoughts[thoughts.length - 1];
  if (lastThought) speak(lastThought.content);
}, [thoughts.length]);

useEffect(() => {
  const lastSolution = solutions[solutions.length - 1];
  if (lastSolution) speak(lastSolution.solution);
}, [solutions.length]);
```

### 고려사항
- **음성 인식과 충돌**: TTS가 마이크에 다시 잡힐 수 있음 → TTS 발화 중 STT 일시정지 또는 볼륨 조절
- **토글 UI**: 사용자가 음성 on/off 전환할 수 있어야 함
- **큐잉**: 생각 + 솔루션이 동시에 오면 순서대로 읽기 (speechSynthesis는 자체 큐 지원)

---

## 방안 B: OpenAI TTS API

### 개요
서버에서 OpenAI `audio/speech` 엔드포인트로 음성 생성 → 프론트에 오디오 스트리밍.

### 구현

**서버 — 음성 생성 엔드포인트**
```typescript
// routes/tts.ts
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;
  const response = await openai.audio.speech.create({
    model: "tts-1",        // tts-1-hd도 가능
    voice: "nova",         // alloy, echo, fable, onyx, nova, shimmer
    input: text,
    response_format: "mp3",
    speed: 1.1,
  });

  res.set("Content-Type", "audio/mpeg");
  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
});
```

**프론트 — 오디오 재생**
```typescript
const playTTS = async (text: string) => {
  const res = await fetch(`${API_URL}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
};
```

**또는 WebSocket으로 바이너리 전송**
```typescript
// 서버: thought/solution 생성 시 음성도 함께 생성하여 바이너리 프레임으로 전송
// 프론트: 바이너리 메시지 수신 → AudioContext로 재생
```

### 음성 옵션
- `nova`: 여성, 따뜻하고 전문적 → 마케터 페르소나에 적합
- `alloy`: 중성, 차분
- `tts-1`: 저렴, 약간 거친 음질
- `tts-1-hd`: 고음질, 2배 비용

---

## 방안 C: 하이브리드 (A 우선, B 옵션)

기본은 Web Speech API, 사용자가 "고품질 음성" 토글 시 OpenAI TTS 사용.

```typescript
const { speak } = useTTS();
const [useHighQuality, setUseHighQuality] = useState(false);

const announceMarketer = async (text: string) => {
  if (useHighQuality) {
    await playOpenAITTS(text);
  } else {
    speak(text);
  }
};
```

---

## STT ↔ TTS 충돌 방지

TTS 출력이 마이크에 다시 잡히면 무한루프가 될 수 있음.

### 해결 방법

```typescript
// TTS 발화 시작 → STT에 "AI 발화 중" 플래그
utterance.onstart = () => store.setAISpeaking(true);
utterance.onend = () => store.setAISpeaking(false);

// STT onResult에서 AI 발화 중이면 무시
onResult: (text, isFinal) => {
  if (store.getState().isAISpeaking) return;  // AI 음성 무시
  // ...기존 로직
}
```

---

## 구현 순서 (해커톤 권장)

| 순서 | 내용 | 시간 |
|------|------|------|
| 1 | `use-tts.ts` 훅 생성 (Web Speech API) | 10분 |
| 2 | marketer-panel에서 새 thought/solution 시 자동 읽기 | 10분 |
| 3 | 헤더에 음성 on/off 토글 버튼 추가 | 10분 |
| 4 | STT ↔ TTS 충돌 방지 (isAISpeaking 플래그) | 15분 |
| 5 | (선택) OpenAI TTS 고품질 옵션 추가 | 30분 |

**총 45분** (방안 A 기준)

---

## 결론

해커톤에서는 **방안 A (Web Speech API)**로 빠르게 구현.
제품화 시 **방안 B (OpenAI TTS nova 음성)**으로 업그레이드하여 자연스러운 마케터 음성 제공.
