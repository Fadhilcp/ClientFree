
class TokenStore {
    private accessToken: string | null = null;

    set(token: string) {
        this.accessToken = token;
    }

    get(): string | null {
        return this.accessToken;
    }

    clear() {
        this.accessToken = null;
    }
}

export const tokenStore = new TokenStore();