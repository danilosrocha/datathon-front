"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, SendHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FactValue, InputSpec } from "@/lib/api/types";
import { formatCep, isValidCep } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AnswerInputProps {
  input: InputSpec;
  onSubmit: (value: FactValue) => void;
  disabled?: boolean;
  /** Valor atual (edição de card). */
  initialValue?: FactValue;
  /** `compact` no editor do card; `prominent` na pergunta em destaque. */
  size?: "prominent" | "compact";
  labelledBy?: string;
}

const optionClass =
  "h-auto min-h-11 w-full justify-start rounded-lg border border-input bg-white px-3.5 py-2 text-left text-sm font-medium whitespace-normal text-ink-800 hover:border-brand-300 hover:bg-brand-50 data-[state=on]:border-brand-600 data-[state=on]:bg-brand-600 data-[state=on]:text-white";

/** Campo de resposta que se adapta ao `input.type` da pergunta (CONTRATOS_API §3.3). */
export function AnswerInput({ input, onSubmit, disabled, initialValue, size = "prominent", labelledBy }: AnswerInputProps) {
  switch (input.type) {
    case "boolean":
      return (
        <div role="group" aria-labelledby={labelledBy} className="grid w-full grid-cols-2 gap-2">
          <Button size={size === "prominent" ? "xl" : "md"} disabled={disabled} onClick={() => onSubmit(true)} className="w-full">
            <Check data-icon="inline-start" />
            Sim
          </Button>
          <Button
            size={size === "prominent" ? "xl" : "md"}
            variant="outline"
            disabled={disabled}
            onClick={() => onSubmit(false)}
            className="w-full border-brand-300 text-brand-900 hover:bg-brand-50"
          >
            <X data-icon="inline-start" />
            Não
          </Button>
        </div>
      );
    case "select":
      return (
        <ToggleGroup
          type="single"
          value={typeof initialValue === "string" ? initialValue : ""}
          onValueChange={(value) => value && onSubmit(value)}
          disabled={disabled}
          aria-labelledby={labelledBy}
          className={cn("grid w-full gap-2", input.options.length > 3 && size === "prominent" ? "sm:grid-cols-2" : "")}
        >
          {input.options.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} className={optionClass}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    case "multiselect":
      return <MultiSelect input={input} onSubmit={onSubmit} disabled={disabled} initialValue={initialValue} size={size} labelledBy={labelledBy} />;
    default:
      return <TextLike input={input} onSubmit={onSubmit} disabled={disabled} initialValue={initialValue} size={size} labelledBy={labelledBy} />;
  }
}

function MultiSelect({
  input,
  onSubmit,
  disabled,
  initialValue,
  size,
  labelledBy,
}: Pick<AnswerInputProps, "onSubmit" | "disabled" | "initialValue" | "size" | "labelledBy"> & {
  input: Extract<InputSpec, { type: "multiselect" }>;
}) {
  const [values, setValues] = useState<string[]>(Array.isArray(initialValue) ? initialValue : []);

  function handleChange(next: string[]) {
    // "nenhuma/nenhum" exclui as demais opções.
    const exclusive = next.find((value) => value.startsWith("nenhu") && !values.includes(value));
    setValues(exclusive ? [exclusive] : next.filter((value) => !value.startsWith("nenhu")));
  }

  return (
    <div className="w-full space-y-3">
      <ToggleGroup
        type="multiple"
        value={values}
        onValueChange={handleChange}
        disabled={disabled}
        aria-labelledby={labelledBy}
        className={cn("grid w-full gap-2", size === "prominent" ? "sm:grid-cols-2" : "grid-cols-2")}
      >
        {input.options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className={optionClass}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button
        size={size === "prominent" ? "xl" : "md"}
        disabled={disabled || values.length === 0}
        onClick={() => onSubmit(values)}
        className="w-full bg-brand-600 text-white hover:bg-brand-700"
      >
        Confirmar seleção {values.length > 0 && `(${values.length})`}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}

function TextLike({ input, onSubmit, disabled, initialValue, size, labelledBy }: AnswerInputProps) {
  const errorId = useId();
  const [raw, setRaw] = useState(initialValue === null || initialValue === undefined ? "" : String(initialValue));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = raw.trim();
    if (!text) return setError("Escreva uma resposta para continuar.");
    if (input.type === "cep" && !isValidCep(text)) return setError("Informe os 8 números do CEP.");
    if (input.type === "cnpj" && text.replace(/\D/g, "").length !== 14) return setError("Informe os 14 números do CNPJ.");
    if (input.type === "number") {
      const value = Number(text);
      if (Number.isNaN(value)) return setError("Informe um número.");
      if (input.min !== undefined && value < input.min) return setError(`Use um valor a partir de ${input.min}.`);
      if (input.max !== undefined && value > input.max) return setError(`Use um valor até ${input.max}.`);
      setError(null);
      return onSubmit(value);
    }
    setError(null);
    onSubmit(input.type === "cep" || input.type === "cnpj" ? text.replace(/\D/g, "") : text);
  }

  const placeholder =
    input.type === "cep" ? "00000-000" : input.type === "cnpj" ? "00.000.000/0000-00" : input.type === "number" ? "0" : "Escreva aqui";

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-1.5">
      <div className={cn("flex w-full gap-2", input.type === "text" && size === "prominent" ? "items-end" : "items-center")}>
        <div className="relative flex-1">
          {input.type === "text" && size === "prominent" ? (
            <Textarea
              aria-labelledby={labelledBy}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              value={raw}
              disabled={disabled}
              onChange={(event) => setRaw(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={2}
              className="min-h-12 max-h-32 w-full resize-y bg-white text-base leading-snug py-2.5"
            />
          ) : (
            <Input
              aria-labelledby={labelledBy}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              value={raw}
              disabled={disabled}
              onChange={(event) => setRaw(input.type === "cep" ? formatCep(event.target.value) : event.target.value)}
              inputMode={input.type === "text" ? "text" : "numeric"}
              type={input.type === "number" ? "number" : "text"}
              min={input.type === "number" ? input.min : undefined}
              max={input.type === "number" ? input.max : undefined}
              autoComplete={input.type === "cep" ? "postal-code" : "off"}
              placeholder={placeholder}
              className={cn("w-full bg-white", size === "prominent" ? "h-12 text-base" : "h-10", input.type === "number" && input.unit && "pr-14")}
            />
          )}
          {input.type === "number" && input.unit && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-600">{input.unit}</span>
          )}
        </div>
        {size === "prominent" ? (
          <Button
            type="submit"
            size="icon-xl"
            disabled={disabled || !raw.trim()}
            aria-label="Enviar resposta"
            className="h-12 w-12 shrink-0 bg-brand-600 text-white hover:bg-brand-700"
          >
            <SendHorizontal />
          </Button>
        ) : (
          <Button type="submit" size="md" disabled={disabled}>
            Salvar
          </Button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
