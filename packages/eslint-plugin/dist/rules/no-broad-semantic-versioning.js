"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noBroadSemanticVersioning = void 0;
const path_1 = __importDefault(require("path"));
exports.noBroadSemanticVersioning = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow broad semantic versioning in package.json',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        messages: {
            noBroadSemanticVersioning: 'The "{{dependencyName}}" is not recommended to use "{{versioning}}"',
        },
    },
    create(context) {
        const filename = typeof context.filename === 'string' ? context.filename : context.getFilename?.();
        if (filename && path_1.default.basename(filename) !== 'package.json') {
            return {};
        }
        return {
            Property(node) {
                if (node.key &&
                    node.key.value &&
                    (node.key.value === 'dependencies' || node.key.value === 'devDependencies') &&
                    node.value &&
                    node.value.properties) {
                    node.value.properties.forEach((property) => {
                        if (property.key && property.key.value && property.value && property.value.value) {
                            const dependencyName = property.key.value;
                            const dependencyVersion = String(property.value.value);
                            if (dependencyVersion.indexOf('*') > -1 ||
                                dependencyVersion.indexOf('x') > -1 ||
                                dependencyVersion.indexOf('>') > -1) {
                                context.report({
                                    loc: property.loc,
                                    messageId: 'noBroadSemanticVersioning',
                                    data: {
                                        dependencyName,
                                        versioning: dependencyVersion,
                                    },
                                });
                            }
                        }
                    });
                }
            },
        };
    },
};
