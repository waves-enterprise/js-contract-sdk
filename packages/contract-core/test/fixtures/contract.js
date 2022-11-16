"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_core_1 = require("@wavesenterprise/contract-core");
let SimpleContract = class SimpleContract {
    async _contructor(asset0, asset1, feeRate) {
        this.feeRate.set(feeRate);
        this.asset0.set(asset0);
        this.asset1.set(asset1);
    }
};
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "reserve0", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "reserve1", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "totalSupply", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "asset0", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "asset1", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "feeRate", void 0);
__decorate([
    (0, contract_core_1.Var)(),
    __metadata("design:type", Object)
], SimpleContract.prototype, "lpAssetId", void 0);
__decorate([
    (0, contract_core_1.Action)({ onInit: true }),
    __param(0, (0, contract_core_1.Param)('asset0')),
    __param(1, (0, contract_core_1.Param)('asset1')),
    __param(2, (0, contract_core_1.Param)('feeRate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SimpleContract.prototype, "_contructor", null);
SimpleContract = __decorate([
    (0, contract_core_1.Contract)()
], SimpleContract);
exports.default = SimpleContract;
//# sourceMappingURL=SimpleContract.js.map