# 📝 Firebase To-Do App

순수 HTML/CSS/JS + Firebase Firestore로 만든 실시간 할 일 관리 앱.

## 기능
- ✅ 할 일 **추가 / 수정 / 삭제**
- ✅ 완료 체크 (토글)
- ✅ **All / Todo / Done** 탭 분류 (개수 표시)
- ✅ Firestore `onSnapshot` 실시간 동기화 (여러 탭/기기 자동 반영)

## 파일 구조
| 파일 | 설명 |
|------|------|
| `index.html` | 마크업 |
| `style.css` | 스타일 |
| `app.js` | Firestore CRUD + 렌더링 로직 |
| `firebase-config.js` | **본인 Firebase 설정값 입력** |

## 실행 방법

### 1. Firebase 프로젝트 만들기
1. [Firebase 콘솔](https://console.firebase.google.com) 접속 → **프로젝트 추가**
2. 좌측 **빌드 > Firestore Database** → **데이터베이스 만들기**
   - 위치 선택 후, **테스트 모드로 시작** (개발용)
3. 프로젝트 개요 옆 **⚙️ > 프로젝트 설정 > 내 앱 > 웹(</>)** 앱 등록
4. 표시되는 `firebaseConfig` 객체 값을 복사

### 2. 설정값 입력
`firebase-config.js` 의 값을 위에서 복사한 값으로 교체.

### 3. 로컬 서버로 실행
`type="module"` 사용으로 `file://` 직접 열기는 CORS 차단됨. **로컬 서버 필요**:

```bash
# 방법 1: Python
python3 -m http.server 5500

# 방법 2: VS Code "Live Server" 확장 → index.html 우클릭 > Open with Live Server
```

브라우저에서 `http://localhost:5500` 접속.

## Firestore 데이터 구조
```
todos (collection)
 └─ {docId}
     ├─ text: string
     ├─ done: boolean
     └─ createdAt: timestamp
```

## ⚠️ 보안 참고
테스트 모드 규칙은 누구나 읽기/쓰기 가능하므로 **개발용**입니다.
배포 시에는 Firebase Authentication + 보안 규칙을 적용하세요.
