module.exports = function (api) {
    api.cache(true);
    const presets = [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 3,
            },
        ],
        "@babel/typescript",
    ];
    const plugins = [
        ["@babel/plugin-proposal-decorators", {
            legacy: true
        }],
        ["@babel/proposal-class-properties"],
        ["transform-inline-environment-variables", {
            "include": [
              "NODE_ENV",
              "APP_ENV"
            ]
        }]
    ];
    return {
        presets,
        plugins,
    }
}