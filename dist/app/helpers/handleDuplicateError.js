"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    var _a;
    const matchedArray = (_a = err.message) === null || _a === void 0 ? void 0 : _a.match(/"([^"]*)"/);
    const duplicateVal = matchedArray ? `"${matchedArray[1]}"` : "This record";
    return {
        statusCode: 400,
        message: `${duplicateVal} already exists. Please use a different value or sign in.`,
    };
};
exports.handleDuplicateError = handleDuplicateError;
