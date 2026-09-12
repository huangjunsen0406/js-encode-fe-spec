"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
const no_http_url_1 = require("./rules/no-http-url");
const no_secret_info_1 = require("./rules/no-secret-info");
const no_broad_semantic_versioning_1 = require("./rules/no-broad-semantic-versioning");
const no_js_in_ts_project_1 = require("./rules/no-js-in-ts-project");
exports.rules = {
    'no-http-url': no_http_url_1.noHttpUrl,
    'no-secret-info': no_secret_info_1.noSecretInfo,
    'no-broad-semantic-versioning': no_broad_semantic_versioning_1.noBroadSemanticVersioning,
    'no-js-in-ts-project': no_js_in_ts_project_1.noJsInTsProject,
};
// 兼容 Flat Config 插件对象
const plugin = {
    meta: {
        name: '@huangjunsen/eslint-plugin',
        version: '2.0.0',
    },
    rules: exports.rules,
};
exports.configs = {
    // Flat Config recommended 预设
    recommended: {
        plugins: {
            '@huangjunsen': plugin,
        },
        rules: {
            '@huangjunsen/no-http-url': 'warn',
            '@huangjunsen/no-secret-info': 'error',
        },
    },
    // Legacy Config 兼容预设
    'legacy-recommended': {
        plugins: ['@huangjunsen'],
        rules: {
            '@huangjunsen/no-http-url': 'warn',
            '@huangjunsen/no-secret-info': 'error',
        },
    },
};
plugin.configs = exports.configs;
exports.default = plugin;
