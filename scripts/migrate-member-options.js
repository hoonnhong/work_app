import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateMemberOptions() {
  try {
    console.log('🚀 Starting member options migration to Firestore...');

    const defaultOptions = {
      roleCategories: {
        cooperative: {
          label: '조합원 역할',
          roles: ['이사', '감사', '대의원']
        },
        work: {
          label: '근로 형태',
          roles: ['직원', '활동가', '강사', '자원봉사자']
        },
        business: {
          label: '거래 관계',
          roles: ['거래처']
        }
      },
      departmentCategories: {
        activist: {
          label: '활동가',
          departments: ['건강지킴이 1기', '건강지킴이 2기', '건강지킴이 3기', '단기근로']
        },
        organization: {
          label: '조직',
          departments: ['사무국', '이사회']
        },
        other: {
          label: '기타',
          departments: ['기타']
        }
      }
    };

    const docRef = doc(db, 'settings', 'memberOptions');
    await setDoc(docRef, defaultOptions);

    console.log('✅ Member options migration completed successfully!');
    console.log('📊 Migrated document ID: default');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateMemberOptions();
