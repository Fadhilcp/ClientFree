export interface IDashBoardOverviewService<T> {
    getPaymentOverview(userId: string): Promise<T>;
}