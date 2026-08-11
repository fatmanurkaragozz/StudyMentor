import { config } from "../config/env.js";

export interface PriorityFeatures {
  opportunity: number;
  attempt_count: number;
  ms_first_response: number;
  overlap_time: number;
  hint_count: number;
}

export interface PriorityPrediction {
  correct_probability: number;
  priority: "YUKSEK" | "ORTA" | "DUSUK";
}

// ML servisine sadece backend ulasir (server-to-server) - frontend hicbir zaman
// dogrudan ml-service'i cagirmaz, boylece CORS konusu hic gundeme gelmez.
// Servis kapali/yavas olsa bile backend'in kendisi cokmemeli, o yuzden hata
// durumunda (ag hatasi, timeout, non-2xx) null donuyoruz - caller bunu
// "ML su an ulasilamiyor" olarak ele alir, sert bir 500 firlatmaz.
export async function predictPriority(features: PriorityFeatures): Promise<PriorityPrediction | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${config.mlServiceUrl}/predict/priority`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PriorityPrediction;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
