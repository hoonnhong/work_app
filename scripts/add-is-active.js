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

// employees 컬렉션에 isActive 필드 추가
async function addIsActiveToEmployees() {
  console.log('\n📝 employees 컬렉션에 isActive 필드 추가 중...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  try {
    const querySnapshot = await getDocs(collection(db, 'employees'));

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();

        // 이미 isActive가 있으면 건너뛰기
        if (data.isActive !== undefined) {
          console.log(`  ⏭ 문서 ${docSnapshot.id} (${data.name}): 이미 isActive 존재`);
          skipCount++;
          continue;
        }

        // isActive 추가 (기본값: true - 재직중)
        const docRef = doc(db, 'employees', docSnapshot.id);
        await updateDoc(docRef, {
          isActive: true
        });

        successCount++;
        console.log(`  ✓ 문서 ${docSnapshot.id} (${data.name}): isActive=true 추가 완료`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ 문서 ${docSnapshot.id} 업데이트 실패:`, error.message);
      }
    }

    console.log(`\n✅ employees 완료: 성공 ${successCount}개, 건너뜀 ${skipCount}개, 실패 ${errorCount}개`);
    return { successCount, skipCount, errorCount };
  } catch (error) {
    console.error('❌ employees 처리 중 오류:', error.message);
    throw error;
  }
}

// 메인 함수
async function main() {
  console.log('🚀 Firestore employees 컬렉션에 isActive 필드 추가 시작...');

  try {
    await addIsActiveToEmployees();
    console.log('\n🎉 isActive 필드 추가 완료!');
  } catch (error) {
    console.error('\n❌ 작업 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
