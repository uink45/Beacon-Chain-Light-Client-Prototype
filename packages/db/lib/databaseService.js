"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
class DatabaseService {
    constructor(opts) {
        this.config = opts.config;
        this.db = opts.controller;
    }
    async start() {
        await this.db.start();
    }
    async stop() {
        await this.db.stop();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=databaseService.js.map