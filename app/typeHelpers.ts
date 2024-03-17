export const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
    if (value === null || value === undefined) return false;
    const _: TValue = value;
    return true;
}
