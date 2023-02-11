# eslint-plugin-replace-relative-imports

This plugin replaces relative parent imports with a defined alias and is meant to be
used in conjunction with applications built with either webpack `alias` definitions
or `paths` for typescript.

## Usage

Add `replace-relative-imports` to the plugins section of your `eslint` configuration.

```json
{
  "plugins": ["replace-relative-imports"]
}
```

Then add the replace imports rule:

```json
{
  "rules": {
    "replace-relative-imports/replace": ["error", {
      "aliases": [
        { "name": "app", "path": "./src" }
      ]
    }]
  }
}
```

## Configuration

The `aliases` object is required in the configuration. You may define multiple aliases.
If an alias is not found for a specific import, an error will be thrown for that import.

You may also specify blobs in the `ignore` array in order to ignore specific files.

You may also specify list of imports in the `excludeImports` array in order to ignore specific import paths.

Options:
| name             | description                                                | default |
|------------------|------------------------------------------------------------|---------|
| alias (required) | The list of aliases which will be matched for and replaced |         |
| method           | The type of replacement, either all relative paths (`./` included) or only parent imports (`importPath.startsWith('../')`) | "only-parent" |
| ignore           | List of blobs which this rule should ignore                | []      |
| excludeImports   | List of import paths which should not be covered by this rule | []      |

Example:

```json
{
  "rules": {
    "replace-relative-imports/replace": ["error", {
      "ignore": ["**/__tests__/*"],
      "excludeImports": [
        "@/utils/any",
        "./any",
        "../utils/any"
      ],
      "aliases": [
        { "name": "app", "path": "./src" }
      ]
    }]
  }
}
```

## License

[MIT](./LICENSE)
