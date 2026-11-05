// Switches the Dev menu flips to show failure states the happy path never reaches.
export const mockFlags = { noManongFree: false, failNextPayment: false };

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
