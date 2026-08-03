const CUSTOM_TOPIC_PLACEHOLDER = "Genel";

// Kullanıcıya özel "uğraş" kayıtlarında Topic her zaman "Genel" adıyla otomatik
// oluşturulur (bkz. subjects.service.ts) - bu durumda kullanıcıya konu adı yerine
// asıl anlamlı olan ders/uğraş adını göstermek gerekir.
export function getDisplayTopicLabel(topic: { name: string }, subject: { name: string }): string {
  return topic.name === CUSTOM_TOPIC_PLACEHOLDER ? subject.name : topic.name;
}
