'use strict';

const rule = require('../../dist/rules/no-http-url').noHttpUrl;
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester();

ruleTester.run('no-http-url', rule, {
  valid: [
    {
      code: "var test = 'https://junsen.online';",
    },
  ],

  invalid: [
    {
      code: "var test = 'http://junsen.online';",
      output: "var test = 'http://junsen.online';",
      errors: [
        {
          message: 'Recommended "http://junsen.online" switch to HTTPS',
        },
      ],
    },
    {
      code: "<img src='http://junsen.online' />",
      output: "<img src='http://junsen.online' />",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [
        {
          message: 'Recommended "http://junsen.online" switch to HTTPS',
        },
      ],
    },
  ],
});
