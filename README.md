# notia-manifest

The community plugin list for [Notia](https://github.com/Chakyiu/notia).

Notia reads [`community-plugins.json`](community-plugins.json) from this repository and can install a plugin from it. Settings → Plugins shows the list. Installing a plugin downloads its GitHub repository and copies the plugin files into the vault's `.notia/plugins` folder. An existing `data.json` is left in place. The plugin's code runs only after it is turned on.

## The list

`community-plugins.json` is a JSON array. Each object is one plugin:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | The plugin id. It matches `id` in the repository's `manifest.json`, and it is the folder name Notia installs into. Letters, digits, dashes, and underscores. |
| `name` | yes | The name shown in the list. |
| `author` | no | Who wrote it. |
| `description` | no | One or two sentences. |
| `repo` | yes | A GitHub repository, `owner/name`. |
| `branch` | no | The git branch to download. The default is `main`. |

Notia downloads `https://codeload.github.com/<repo>/zip/refs/heads/<branch>` and copies the plugin files out of that archive. It skips tests, `README`, `LICENSE`, `package.json`, and `notia.d.ts`. The archive's `manifest.json` id has to be the same as `id` here.

## Plugins

| Plugin | Repository |
| --- | --- |
| Daily notes | [Chakyiu/notia-daily-note](https://github.com/Chakyiu/notia-daily-note) |
| Markdown editor | [Chakyiu/notia-markdown-editing-tool](https://github.com/Chakyiu/notia-markdown-editing-tool) |
| Templater | [Chakyiu/notia-templater](https://github.com/Chakyiu/notia-templater) |
| Theme enhancer | [Chakyiu/notia-theme-enhancer](https://github.com/Chakyiu/notia-theme-enhancer) |

## Adding a plugin

A plugin repository contains `manifest.json` and `main.js` (or the file `main` names), the same files a vault's `.notia/plugins` folder holds. Open a pull request that adds one object to `community-plugins.json`. The `id` is the `id` in that repository's `manifest.json`, and `branch` is the branch Notia should install.

## License

[MIT](LICENSE).
