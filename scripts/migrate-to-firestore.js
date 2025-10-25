import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Firebase 설정 (환경변수 또는 직접 입력)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// JSON 파일 읽기
function loadJSON(filename, subfolder = 'data') {
  const filePath = join(__dirname, '..', subfolder, filename);
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Firestore에 데이터 업로드 (배열 형태)
async function uploadCollection(collectionName, data) {
  console.log(`\n📤 ${collectionName} 컬렉션 업로드 중...`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of data) {
    try {
      // id를 문서 ID로 사용
      const docRef = doc(db, collectionName, String(item.id));
      await setDoc(docRef, item);
      successCount++;
      console.log(`  ✓ 문서 ${item.id} 업로드 완료`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ 문서 ${item.id} 업로드 실패:`, error.message);
    }
  }

  console.log(`✅ ${collectionName} 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
  return { successCount, errorCount };
}

// Firestore에 단일 문서 업로드 (객체 형태)
async function uploadSingleDocument(collectionName, documentId, data) {
  console.log(`\n📤 ${collectionName}/${documentId} 문서 업로드 중...`);

  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
    console.log(`  ✓ 문서 업로드 완료`);
    console.log(`✅ ${collectionName}/${documentId} 완료`);
    return { successCount: 1, errorCount: 0 };
  } catch (error) {
    console.error(`  ✗ 문서 업로드 실패:`, error.message);
    console.log(`❌ ${collectionName}/${documentId} 실패`);
    return { successCount: 0, errorCount: 1 };
  }
}

// 메인 마이그레이션 함수
async function migrateAllData() {
  console.log('🚀 Firestore 마이그레이션 시작...\n');

  try {
    // 1. 개발 노트 마이그레이션
    const devNotes = loadJSON('dev_note.json');
    await uploadCollection('dev_notes', devNotes);

    // 2. 즐겨찾기 URL 마이그레이션
    const favoriteUrls = loadJSON('favorite_url.json');
    await uploadCollection('favorite_urls', favoriteUrls);

    // 3. 직원 관리 마이그레이션
    const hrManagement = loadJSON('hr_management.json');
    await uploadCollection('employees', hrManagement);

    // 4. 정산 데이터 마이그레이션
    const settlements = loadJSON('settlements.json');
    await uploadCollection('settlements', settlements);

    // 5. 프롬프트 마이그레이션
    const prompts = loadJSON('prompts.json', 'public/data');
    await uploadSingleDocument('prompts', 'default', prompts);

    console.log('\n🎉 모든 데이터 마이그레이션 완료!');
  } catch (error) {
    console.error('\n❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
migrateAllData();
