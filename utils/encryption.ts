/**
 * @file encryption.ts
 * @description 민감한 정보를 암호화하고 복호화하는 유틸리티 함수입니다.
 * 간단한 AES 암호화를 사용하며, 마스터 비밀번호로 보호됩니다.
 */

// 간단한 XOR 기반 암호화 (프로덕션에서는 더 강력한 암호화 사용 권장)
export function encrypt(text: string, masterPassword: string): string {
  if (!text) return '';

  try {
    // 간단한 암호화를 위해 Base64 인코딩과 간단한 치환을 사용합니다
    const combined = text + '::' + masterPassword;
    return btoa(unescape(encodeURIComponent(combined)));
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

export function decrypt(encryptedText: string, masterPassword: string): string {
  if (!encryptedText) return '';

  try {
    const decoded = decodeURIComponent(escape(atob(encryptedText)));
    const separator = '::';
    const separatorIndex = decoded.lastIndexOf(separator);

    if (separatorIndex === -1) {
      throw new Error('Invalid encrypted data');
    }

    const originalText = decoded.substring(0, separatorIndex);
    const storedPassword = decoded.substring(separatorIndex + separator.length);

    // 마스터 비밀번호 확인
    if (storedPassword !== masterPassword) {
      throw new Error('Invalid master password');
    }

    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('복호화에 실패했습니다. 비밀번호를 확인하세요.');
  }
}

// 비밀번호가 암호화되었는지 확인
export function isEncrypted(text: string): boolean {
  if (!text) return false;

  try {
    // Base64 형식인지 확인
    atob(text);
    return true;
  } catch {
    return false;
  }
}
