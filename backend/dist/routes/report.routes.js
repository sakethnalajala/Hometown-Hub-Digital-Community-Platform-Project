"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../validators/schemas");
exports.reportRouter = (0, express_1.Router)();
// POST /api/reports
exports.reportRouter.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.createReportSchema), async (req, res) => {
    try {
        const { reason, description, contentType, contentId, reportedUserId } = req.body;
        // Prevent duplicate reports
        const existing = await prisma_1.prisma.report.findFirst({
            where: { reporterId: req.user.userId, contentType, contentId },
        });
        if (existing) {
            res.status(409).json({ success: false, message: 'You have already reported this content' });
            return;
        }
        const report = await prisma_1.prisma.report.create({
            data: {
                reason, description, contentType, contentId,
                reportedUserId: reportedUserId || null,
                reporterId: req.user.userId,
            },
        });
        res.status(201).json({ success: true, message: 'Report submitted successfully', data: report });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to submit report' });
    }
});
//# sourceMappingURL=report.routes.js.map