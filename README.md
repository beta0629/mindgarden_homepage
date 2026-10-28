# 마인드가든 심리상담센터

송도 마인드가든 심리상담센터 홈페이지입니다. Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.

문구, 연락처, 가격, 프로그램, 이미지 경로는 `content/`와 `config/`에 있습니다. 색, 글자, 간격은 `styles/tokens.css`의 디자인 토큰을 사용합니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 환경 변수

| 이름 | 용도 |
|---|---|
| `CONTACT_ENDPOINT` | 문의 폼 전송 주소. 코드에 URL을 쓰지 않습니다. |
| `NEXT_PUBLIC_SITE_URL` | canonical, sitemap, JSON-LD용 사이트 주소. 도메인 연결 전에 설정하지 않아도 빌드는 됩니다. |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 소유 확인 코드 |

문의는 개인정보 수집·이용 동의가 있어야 전송됩니다. 동의하지 않으면 제출되지 않습니다.

## 확인

```bash
npm run check
npm run lint
npm run build
```
