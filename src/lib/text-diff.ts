export interface DiffLine {
    type: "same" | "added" | "removed";
    text: string;
}

export function diffLines(before: string, after: string): DiffLine[] {
    const a = before.split("\n");
    const b = after.split("\n");
    if (a.length * b.length > 1_000_000) {
        return [
            { type: "removed", text: before },
            { type: "added", text: after },
        ];
    }

    const widths = b.length + 1;
    const table = new Uint32Array((a.length + 1) * widths);
    for (let i = a.length - 1; i >= 0; i--) {
        for (let j = b.length - 1; j >= 0; j--) {
            table[i * widths + j] = a[i] === b[j]
                ? table[(i + 1) * widths + j + 1] + 1
                : Math.max(table[(i + 1) * widths + j], table[i * widths + j + 1]);
        }
    }

    const result: DiffLine[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
            result.push({ type: "same", text: a[i] });
            i++;
            j++;
        } else if (table[(i + 1) * widths + j] >= table[i * widths + j + 1]) {
            result.push({ type: "removed", text: a[i++] });
        } else {
            result.push({ type: "added", text: b[j++] });
        }
    }
    while (i < a.length) result.push({ type: "removed", text: a[i++] });
    while (j < b.length) result.push({ type: "added", text: b[j++] });
    return result;
}
