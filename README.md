# 포트폴리오 매니저

한국 주식 포트폴리오 관리 웹앱. 종목 thesis/catalyst 추적, 야후 파이낸스 현재가, Gemini AI 카탈리스트 점검 기능 제공.

## 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 Gemini API 키를 입력합니다:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받을 수 있습니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

```bash
npm run deploy
```

`vite.config.js`의 `base` 값이 GitHub 저장소명과 일치하는지 확인하세요.
