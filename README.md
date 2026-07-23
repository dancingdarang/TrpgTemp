# OVER:EDGE — 더블 크로스 통합 DB

GitHub Pages로 바로 올릴 수 있는 정적 사이트입니다.
서버나 빌드 과정 없이, **CSV 파일만 수정하고 push하면 사이트에 자동 반영**됩니다.

## 1. GitHub Pages에 올리기

1. GitHub에서 새 저장소를 만듭니다 (예: `my-trpg-db`).
2. 이 폴더 안의 파일들을 그대로 저장소에 올립니다 (git push, 또는 웹에서 파일 업로드).
3. 저장소 **Settings → Pages** 에서 Source를 `main` 브랜치 / `root` 로 설정합니다.
4. 잠시 후 `https://<계정명>.github.io/<저장소명>/` 주소로 접속하면 사이트가 보입니다.

## 2. 데이터 편집 방법 (엑셀/CSV)

`data/` 폴더 안의 CSV 파일들이 실제 표시되는 데이터입니다.

| 파일 | 분류 |
|---|---|
| `data/syndromes.csv` | 신드롬 |
| `data/effects.csv` | 이펙트 (신드롬별 스킬) |
| `data/items.csv` | 장비/아이템 |
| `data/npcs.csv` | 이레귤러 도감 |
| `data/rules.csv` | 규칙 정리 |
| `data/characters.csv` | 캐릭터 열람 (PC) |

수정 방법:

1. CSV 파일을 엑셀(또는 구글 시트, 한셀 등)로 엽니다.
2. 첫 번째 줄(헤더)은 표의 열 제목이 됩니다 — 열을 추가/삭제하면 사이트 표도 그대로 따라갑니다.
3. 내용을 수정한 뒤 **CSV UTF-8 형식**으로 다시 저장합니다. (엑셀 "다른 이름으로 저장" → "CSV UTF-8(쉼표로 분리)")
4. 저장한 파일을 GitHub 저장소에 다시 올리면(commit & push) 사이트가 바로 반영됩니다. 빌드나 배포 작업이 따로 필요 없습니다.

> 지금 들어있는 데이터는 전부 "예시" 자리표시자입니다. 실제 룰북 데이터로 교체해서 쓰세요.

## 2-1. 캐릭터 초상화 이미지 추가하기

`data/characters.csv`의 `이미지` 열에 적은 파일명을, `Image/Character/` 폴더 안에 그 이름 그대로(대소문자까지 정확히) 넣어두면 캐릭터 열람 화면에 자동으로 표시됩니다.

```
Image/Character/Clara_Hart_Portrait.png
```

- 파일명이 비어있거나 해당 파일이 없으면 "NO IMAGE" 자리표시자가 대신 표시됩니다.
- 이미지도 CSV와 마찬가지로 `push_all.bat`으로 올리면 반영됩니다 (용량이 크면 `push_data.bat`이 아니라 `push_all.bat`을 쓰세요 — `push_data.bat`은 `data/` 폴더만 올립니다).

## 3. 분류(탭) 추가/변경하기

`assets/js/app.js` 맨 위의 `CATEGORIES` 배열에 한 줄만 추가하면 새 탭이 생깁니다.

```js
const CATEGORIES = [
  { id: "syndromes", label: "신드롬",  file: "data/syndromes.csv" },
  // 새 분류 예시:
  { id: "scenarios", label: "시나리오", file: "data/scenarios.csv" },
];
```

이후 `data/scenarios.csv` 파일을 같은 헤더 규칙으로 만들어 넣으면 됩니다.

## 4. 로컬에서 미리보기

CSV는 `fetch`로 불러오기 때문에 `index.html`을 그냥 더블클릭해서 열면
브라우저 보안 정책상 로드가 안 될 수 있습니다. 아래처럼 간단한 로컬 서버로 확인하세요.

```bash
# 이 폴더에서 실행
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 폴더 구조

```
index.html
assets/
  css/style.css
  js/app.js
data/
  syndromes.csv
  renegades.csv
  items.csv
  npcs.csv
  rules.csv
```
