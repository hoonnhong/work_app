import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Firebase 설정
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

// 컬렉션에 createdAt 필드 추가
async function addCreatedAtToCollection(collectionName) {
  console.log(`\n📝 ${collectionName} 컬렉션에 createdAt 추가 중...`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  try {
    const querySnapshot = await getDocs(collection(db, collectionName));

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();

        // 이미 createdAt이 있으면 건너뛰기
        if (data.createdAt) {
          console.log(`  ⏭ 문서 ${docSnapshot.id}: 이미 createdAt 존재`);
          skipCount++;
          continue;
        }

        // createdAt 추가 (현재 시간을 ISO 8601 형식으로)
        const docRef = doc(db, collectionName, docSnapshot.id);
        await updateDoc(docRef, {
          createdAt: new Date().toISOString()
        });

        successCount++;
        console.log(`  ✓ 문서 ${docSnapshot.id}: createdAt 추가 완료`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ 문서 ${docSnapshot.id} 업데이트 실패:`, error.message);
      }
    }

    console.log(`✅ ${collectionName} 완료: 성공 ${successCount}개, 건너뜀 ${skipCount}개, 실패 ${errorCount}개`);
    return { successCount, skipCount, errorCount };
  } catch (error) {
    console.error(`❌ ${collectionName} 처리 중 오류:`, error.message);
    throw error;
  }
}

// 메인 함수
async function addCreatedAtToAll() {
  console.log('🚀 Firestore 컬렉션에 createdAt 필드 추가 시작...\n');

  try {
    // 모든 컬렉션에 createdAt 추가
    await addCreatedAtToCollection('dev_notes');
    await addCreatedAtToCollection('favorite_urls');
    await addCreatedAtToCollection('employees');
    await addCreatedAtToCollection('settlements');
    await addCreatedAtToCollection('prompts');

    console.log('\n🎉 모든 컬렉션에 createdAt 추가 완료!');
  } catch (error) {
    console.error('\n❌ 작업 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
addCreatedAtToAll();
