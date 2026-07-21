# StudyMentor - Veri Bilimi Hazırlık Çalışması (NumPy & Pandas)
# Bu dosya Hafta 1 kapsamında veri manipülasyonu pratikleri yapmanız için hazırlanmıştır.
# Kodu çalıştırmak için terminalden `python study_pandas.py` komutunu verebilirsiniz.

import numpy as np
import pandas as pd
import os

print("--- StudyMentor Veri Bilimi Hazırlık Modülü ---")

# =====================================================================
# 1. BÖLÜM: NUMPY İLE TEMEL DİZİ İŞLEMLERİ
# =====================================================================
print("\n[1] NumPy Egzersizleri")

# Rastgele çalışma saatleri üretelim (Örn: 7 günlük çalışma süresi saat cinsinden)
study_hours = np.array([2.5, 4.0, 1.5, 3.0, 0.0, 5.5, 3.5])
print("7 Günlük Çalışma Süreleri Dizi:", study_hours)

# Ortalama çalışma süresi
mean_hours = np.mean(study_hours)
print("Ortalama Günlük Çalışma Süresi:", round(mean_hours, 2), "saat")

# Toplam çalışma süresi
total_hours = np.sum(study_hours)
print("Haftalık Toplam Çalışma Süresi:", total_hours, "saat")

# 3 saatten fazla çalışılan günlerin filtrelenmesi
productive_days = study_hours[study_hours > 3.0]
print("3 Saatten Fazla Çalışılan Günlerin Süreleri:", productive_days)


# =====================================================================
# 2. BÖLÜM: PANDAS DATAFRAME OLUŞTURMA & FİLTRELEME
# =====================================================================
print("\n[2] Pandas DataFrame İşlemleri")

# Örnek çalışma verileri sözlüğü
data = {
    "Oturum_ID": [1, 2, 3, 4, 5, 6, 7],
    "Ders": ["Matematik", "Fizik", "Matematik", "Türkçe", "Tarih", "Fizik", "Matematik"],
    "Sure_Dakika": [90, 45, 120, 60, 30, 90, 45],
    "Zorluk": [4, 3, 5, 2, 1, 4, 3],       # 1-5 arası zorluk
    "Verimlilik": [5, 4, 3, 5, 4, 2, 4]   # 1-5 arası verim
}

# DataFrame oluşturma
df_sessions = pd.DataFrame(data)
print("\n--- İlk DataFrame (Çalışma Oturumları) ---")
print(df_sessions)

# Filtreleme: Verimliliği 4 ve üzeri olan oturumlar
highly_productive = df_sessions[df_sessions["Verimlilik"] >= 4]
print("\n--- Verimliliği >= 4 Olan Oturumlar ---")
print(highly_productive)


# =====================================================================
# 3. BÖLÜM: GROUPBY İLE GRUPLAMA VE ANALİZ
# =====================================================================
print("\n[3] Pandas Groupby İşlemleri")

# Ders bazında toplam çalışma süreleri ve ortalama verimlilik
subject_analysis = df_sessions.groupby("Ders").agg(
    Toplam_Sure_Dakika=("Sure_Dakika", "sum"),
    Ortalama_Verimlilik=("Verimlilik", "mean"),
    Oturum_Sayisi=("Oturum_ID", "count")
).reset_index()

print("\n--- Ders Bazında Gelişmiş Analiz ---")
print(subject_analysis)


# =====================================================================
# 4. BÖLÜM: MERGE (TABLOLARI BİRLEŞTİRME)
# =====================================================================
print("\n[4] Pandas Merge İşlemleri")

# Derslere göre zorluk katsayıları tablosu
subject_info = pd.DataFrame({
    "Ders": ["Matematik", "Fizik", "Türkçe", "Tarih", "Kimya"],
    "Katsayi": [4, 4, 3, 2, 3] # Derslerin sınav katsayıları
})

# Çalışma oturumları tablosu ile ders katsayıları tablosunu birleştirme
merged_df = pd.merge(df_sessions, subject_info, on="Ders", how="left")
print("\n--- Katsayı Verisi ile Birleştirilmiş Tablo ---")
print(merged_df)


# =====================================================================
# 5. BÖLÜM: KENDİNİZİ DENEYİN (KÜÇÜK EGZERSİZ)
# =====================================================================
print("\n[5] Egzersiz Soruları")
print("1. Yukarıdaki 'df_sessions' tablosunda 60 dakikadan uzun süren oturumları listeleyin.")
print("2. Ders bazında Ortalama Zorluk derecesini hesaplayın.")
print("3. Bu kodu 'python study_pandas.py' komutuyla çalıştırıp çıktıları gözlemleyin.")
