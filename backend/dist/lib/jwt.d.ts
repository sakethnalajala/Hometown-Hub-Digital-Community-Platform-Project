export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}
export declare function signAccessToken(payload: JwtPayload): string;
export declare function signRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function createRefreshToken(userId: string): Promise<string>;
export declare function revokeRefreshToken(token: string): Promise<void>;
export declare function revokeAllUserTokens(userId: string): Promise<void>;
//# sourceMappingURL=jwt.d.ts.map