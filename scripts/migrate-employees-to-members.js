import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

// employees 컬렉션을 members로 복사
async function migrateEmployeesToMembers() {
  console.log('\n🚀 employees 컬렉션을 members로 마이그레이션 시작...\n');

  let successCount = 0;
  let errorCount = 0;

  try {
    // 1. employees 컬렉션의 모든 문서 가져오기
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    console.log(`📋 employees 컬렉션에서 ${employeesSnapshot.size}개의 문서를 찾았습니다.\n`);

    // 2. 각 문서를 members 컬렉션으로 복사
    console.log('📤 members 컬렉션으로 복사 중...\n');
    for (const docSnapshot of employeesSnapshot.docs) {
      try {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;

        // members 컬렉션에 같은 ID로 문서 생성
        const memberDocRef = doc(db, 'members', docId);
        await setDoc(memberDocRef, data);

        successCount++;
        console.log(`  ✓ 문서 ${docId} (${data.name}): members로 복사 완료`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ 문서 ${docSnapshot.id} 복사 실패:`, error.message);
      }
    }

    console.log(`\n✅ 마이그레이션 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);

    // 3. 옵션: employees 컬렉션 삭제 확인
    console.log('\n⚠️  employees 컬렉션은 삭제하지 않았습니다.');
    console.log('   모든 것이 정상 작동하는지 확인한 후 수동으로 삭제하세요.');
    console.log('   Firebase 콘솔에서 employees 컬렉션을 삭제할 수 있습니다.');

    return { successCount, errorCount };
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류:', error.message);
    throw error;
  }
}

// 메인 함수
async function main() {
  console.log('🔄 Firestore 컬렉션 마이그레이션: employees → members');

  try {
    await migrateEmployeesToMembers();
    console.log('\n🎉 마이그레이션 완료!');
  } catch (error) {
    console.error('\n❌ 작업 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
