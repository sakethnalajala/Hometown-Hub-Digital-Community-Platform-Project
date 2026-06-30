interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare function sendEmail({ to, subject, html }: EmailOptions): Promise<void>;
export declare function getPasswordResetEmail(name: string, resetUrl: string): string;
export {};
//# sourceMappingURL=email.d.ts.map