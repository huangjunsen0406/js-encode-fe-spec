"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noHttpUrl = void 0;
exports.noHttpUrl = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow http urls, recommend https',
            category: 'Possible Errors',
            recommended: true,
        },
        schema: [],
        messages: {
            noHttpUrl: 'Recommended "{{url}}" switch to HTTPS',
        },
    },
    create(context) {
        return {
            Literal(node) {
                if (node.value && typeof node.value === 'string' && node.value.startsWith('http:')) {
                    context.report({
                        node,
                        messageId: 'noHttpUrl',
                        data: {
                            url: node.value,
                        },
                    });
                }
            },
        };
    },
};
