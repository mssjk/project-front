export interface Donation {
    donationId: number;
    userId: number;
    charityId: number;
    charityName?: string;
    amount: number;
    date: string;
    sector? : string; // Optional property for sector

}
