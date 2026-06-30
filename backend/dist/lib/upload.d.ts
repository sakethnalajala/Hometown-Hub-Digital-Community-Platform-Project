import multer from 'multer';
export declare const upload: multer.Multer;
export declare function uploadImage(filePath: string, folder?: string): Promise<string>;
export declare function deleteImage(publicIdOrUrl: string): Promise<void>;
//# sourceMappingURL=upload.d.ts.map