import { isDefined } from 'twenty-shared/utils';

/*
 * Convierte el valor de cualquier campo de un registro en el texto que se ve
 * en una tarjeta. No pretende cubrir todos los tipos: cuando el valor no es
 * algo que se pueda leer de un vistazo, la tarjeta simplemente no muestra
 * nada en ese hueco.
 */
export const getRecordFieldTextValue = (value: unknown): string | undefined => {
  if (!isDefined(value) || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim() === '' ? undefined : value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => getRecordFieldTextValue(entry))
      .filter(isDefined);

    return parts.length === 0 ? undefined : parts.join(', ');
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    // Enlaces: se prefiere la etiqueta visible sobre la direccion.
    if (isDefined(record.primaryLinkLabel) || isDefined(record.primaryLinkUrl)) {
      return getRecordFieldTextValue(
        record.primaryLinkLabel ?? record.primaryLinkUrl,
      );
    }

    // Nombre completo repartido en dos campos.
    if (isDefined(record.firstName) || isDefined(record.lastName)) {
      const fullName = [record.firstName, record.lastName]
        .filter((part) => typeof part === 'string' && part !== '')
        .join(' ');

      return fullName === '' ? undefined : fullName;
    }

    if (isDefined(record.text)) {
      return getRecordFieldTextValue(record.text);
    }

    if (isDefined(record.markdown)) {
      return getRecordFieldTextValue(record.markdown);
    }

    if (isDefined(record.amountMicros)) {
      const amount = Number(record.amountMicros) / 1_000_000;

      return Number.isNaN(amount) ? undefined : String(amount);
    }
  }

  return undefined;
};
