import type { FactValue, InputSpec, Option } from "@/lib/api/types";

/** Faixas de entrada `MoneyRange` (CONTRATOS_API §2). */
export const MONEY_RANGE_OPTIONS: Option[] = [
  { value: "ate_10k", label: "Até R$ 10 mil" },
  { value: "10k_50k", label: "R$ 10 a 50 mil" },
  { value: "50k_200k", label: "R$ 50 a 200 mil" },
  { value: "200k_1m", label: "R$ 200 mil a 1 milhão" },
  { value: "1m_7_5m", label: "R$ 1 a 7,5 milhões" },
  { value: "acima_7_5m", label: "Acima de R$ 7,5 milhões" },
];

export function formatCep(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function isValidCep(raw: string) {
  return raw.replace(/\D/g, "").length === 8;
}

/** Texto legível de um valor, usado na atualização otimista antes do `profile.patch`. */
export function displayValue(input: InputSpec | null, value: FactValue): string {
  if (value === null || value === undefined) return "—";
  if (!input) return Array.isArray(value) ? value.join(", ") : String(value);
  switch (input.type) {
    case "boolean":
      return value ? "Sim" : "Não";
    case "select":
      return input.options.find((option) => option.value === value)?.label ?? String(value);
    case "multiselect": {
      const values = Array.isArray(value) ? value : [String(value)];
      return values.map((item) => input.options.find((option) => option.value === item)?.label ?? item).join(", ");
    }
    case "number":
      return `${value}${input.unit ? ` ${input.unit}` : ""}`;
    case "cep":
      return formatCep(String(value));
    default:
      return String(value);
  }
}
