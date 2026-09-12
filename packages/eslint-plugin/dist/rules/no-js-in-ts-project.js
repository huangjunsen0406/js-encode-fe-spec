"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noJsInTsProject = void 0;
const path_1 = __importDefault(require("path"));
const JS_REG = /\.jsx?$/;
const DEFAULT_WHITE_LIST = [
    'commitlint.config.js',
    'eslintrc.js',
    'prettierrc.js',
    'stylelintrc.js',
];
exports.noJsInTsProject = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow JS files in TypeScript projects',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    whiteList: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                    autoMerge: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            noJSInTSProject: 'The "{{fileName}}" is not recommended in TS project',
        },
    },
    create(context) {
        const fileName = typeof context.filename === 'string' ? context.filename : context.getFilename?.();
        if (!fileName)
            return {};
        const extName = path_1.default.extname(fileName);
        const ruleOptions = context.options[0] || {};
        let { whiteList = [], autoMerge = true } = ruleOptions;
        if (whiteList.length === 0) {
            whiteList = DEFAULT_WHITE_LIST;
        }
        else if (autoMerge) {
            whiteList = Array.from(new Set([...DEFAULT_WHITE_LIST, ...whiteList]));
        }
        const whiteListReg = new RegExp(`(${whiteList.join('|')})$`);
        if (!whiteListReg.test(fileName) && JS_REG.test(extName)) {
            context.report({
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 0 },
                },
                messageId: 'noJSInTSProject',
                data: {
                    fileName,
                },
            });
        }
        return {};
    },
};
