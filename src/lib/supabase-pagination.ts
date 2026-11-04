import "server-only";

const PAGE_SIZE = 1000;

interface PageResult<T> {
    data: T[] | null;
    error: unknown;
}

export async function fetchAllPages<T>(
    queryPage: (from: number, to: number) => Promise<PageResult<T>>
): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await queryPage(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        const page = data ?? [];
        rows.push(...page);
        if (page.length < PAGE_SIZE) return rows;
    }
}
