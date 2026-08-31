import type { UserProfile } from '../types';

export function getEducationLabel(user: UserProfile): string {
  switch (user.educationLevel) {
    case 'MIDDLE_SCHOOL':
      return `🎓 Ortaokul${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'HIGH_SCHOOL':
      return `🎓 Lise${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'UNIVERSITY':
      return `🎓 Üniversite${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'LIFELONG_LEARNER':
      return '💼 İş Hayatım ve Gelişim';
    case 'EXAM_PREP':
      return '🎯 Bağımsız Sınav Hazırlığı';
  }
}

// Dashboard karşılama mesajı - önce user.mode'a (Öğrenci/Gelişim) bakılır, sadece
// Öğrenci tarafında eğitim seviyesine göre ayrıca inceltilir (örn. üniversite
// öğrencisine "hedefindeki üniversite" demek anlamsız, o hedefe zaten ulaşmış
// durumda). mode üzerinden dallanmak şart - "Platform Modu" anahtarı (bkz.
// AppContext.setUserMode) sadece mode'u değiştirir, educationLevel'a dokunmaz;
// bu yüzden educationLevel'a bakmak, Gelişim'e geçmiş bir üniversite öğrencisine
// yanlışlıkla Öğrenci'nin üniversite metnini gösterirdi.
export function getWelcomeMessage(user: UserProfile): string {
  if (user.mode === 'LIFELONG_LEARNER') {
    return 'Bugün projelerin, kişisel becerilerin ve verimli alışkanlıkların için harika bir çalışma günü!';
  }
  switch (user.educationLevel) {
    case 'MIDDLE_SCHOOL':
      return 'Bugün hedefindeki liseye bir adım daha yaklaşmaya hazır mısın?';
    case 'HIGH_SCHOOL':
      return 'Bugün hedefindeki üniversite için bir adım daha ilerlemeye hazır mısın?';
    case 'UNIVERSITY':
      return 'Bugün akademik hedeflerine bir adım daha yaklaşmaya hazır mısın?';
    case 'EXAM_PREP':
      return 'Bugün hedefindeki sınav için bir adım daha ilerlemeye hazır mısın?';
    case 'LIFELONG_LEARNER':
      return 'Bugün projelerin, kişisel becerilerin ve verimli alışkanlıkların için harika bir çalışma günü!';
  }
}

// İlk kayıttan hemen sonra dashboard'da bir kez gösterilen karşılama. getWelcomeMessage
// (her girişteki günlük selam) ile karıştırılmamalı - bu tek seferlik ve yeni kullanıcıyı
// ilk adımlara yönlendirir. Yapı getWelcomeMessage gibi: önce user.mode.
export function getFirstWelcomeMessage(user: UserProfile): { title: string; body: string } {
  const firstName = user.name.split(' ')[0] || user.name;
  const title = `Hoş geldin, ${firstName}! 🎉`;
  const guideHint =
    'Her ekranın üstünde o bölümün ne işe yaradığını anlatan bir "Bölüm Rehberi" kartı var.';

  if (user.mode === 'LIFELONG_LEARNER') {
    return {
      title,
      body: `StudyMentor'a hoş geldin. ${guideHint} Başlamak için "Uğraşlarım"dan bir uğraş ekle ve ilk odak seansını yap — Kaptan (AI Koç) kısa sürede sana özel öneriler üretmeye başlar.`,
    };
  }
  return {
    title,
    body: `StudyMentor'a hoş geldin. ${guideHint} Başlamak için "Derslerim"den derslerini ekle ve bir konu için ilk mini kontrolünü yap — Kaptan (AI Koç) kısa sürede sana özel öneriler üretmeye başlar.`,
  };
}
