# Data Safety 답변지 — OpenDocs

> Play Console → 정책 → 앱 콘텐츠 → 데이터 보안 (Data safety)
> 아래 답변 그대로 입력하면 됩니다.

## 1. Data collection and security

### Does your app collect or share any of the required user data types?
**Yes** (광고 ID, 분석 데이터 수집)

### Is all of the user data collected by your app encrypted in transit?
**Yes** (HTTPS 만 사용)

### Do you provide a way for users to request that their data be deleted?
**Yes** ⭐ (2026-04-26 정정 — Yes 가 정답)
**URL**: `https://info-gate.github.io/opendocs/delete-account/`
> 이유: delete-account 페이지에 캐시 삭제 + 앱 삭제 = 데이터 즉시 제거 안내 + contact email 명시.
> "No" 답변은 페이지가 없을 때만. URL 게시했으면 무조건 Yes.

---

## 2. Data types collected

### Personal info
- ❌ Name
- ❌ Email address
- ❌ User IDs
- ❌ Address
- ❌ Phone number
- ❌ Race and ethnicity
- ❌ Political or religious beliefs
- ❌ Sexual orientation
- ❌ Other info

### Financial info
- ❌ All none

### Health and fitness
- ❌ All none

### Messages
- ❌ All none

### Photos and videos
- ❌ All none (사용자가 열기로 선택한 파일만 임시 처리, 수집 X)

### Audio files
- ❌ All none

### Files and docs
- ❌ All none (사용자가 열기로 선택한 파일만 임시 처리, 수집 X)

### Calendar
- ❌ All none

### Contacts
- ❌ All none

### App activity
- ✅ **App interactions** — 화면 이동, 버튼 클릭 (PostHog 분석)
  - Collected: ✅ / Shared: ❌
  - Required: ❌ Optional
  - Purpose: Analytics
  - Why: 사용자 인터랙션 분석으로 UX 개선
- ❌ In-app search history
- ❌ Installed apps
- ❌ Other user-generated content
- ❌ Other actions

### Web browsing
- ❌ Browsing history

### App info and performance
- ✅ **Crash logs** — Sentry 오류 추적
  - Collected: ✅ / Shared: ❌
  - Required: ❌ Optional
  - Purpose: Analytics
- ✅ **Diagnostics** — 성능 측정
  - Collected: ✅ / Shared: ❌
  - Required: ❌ Optional
  - Purpose: Analytics
- ❌ Other app performance data

### Device or other identifiers
- ✅ **Device or other IDs** — Google AdMob 광고 ID
  - Collected: ✅ / Shared: ✅ (Google AdMob)
  - Required: ✅ Required
  - Purpose: Advertising or marketing, Analytics

---

## 3. Security practices

### Is your data encrypted in transit?
**Yes**

### Do you provide a way for users to request that their data be deleted?
**No** — 위 답변과 동일

### Has your app been independently validated against a global security standard?
**No** (작은 무료 앱 — 외부 감사 없음)

### Committed to follow the Play Families Policy?
**N/A** (가족용 앱 아님)

---

## 요약 (Play Console 표시 결과)

```
Data shared:
  - Device or other IDs (광고용)

Data collected:
  - App interactions (분석)
  - Crash logs (분석)
  - Diagnostics (분석)
  - Device or other IDs (광고/분석)

Security:
  - Data encrypted in transit
  - User cannot request data deletion (계정 없음, 앱 삭제로 대체)
```
