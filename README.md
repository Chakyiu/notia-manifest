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
| AI agent | [Chakyiu/notia-ai-agent](https://github.com/Chakyiu/notia-ai-agent) |
| Daily notes | [Chakyiu/notia-daily-note](https://github.com/Chakyiu/notia-daily-note) |
| Markdown editor | [Chakyiu/notia-markdown-editing-tool](https://github.com/Chakyiu/notia-markdown-editing-tool) |
| Templater | [Chakyiu/notia-templater](https://github.com/Chakyiu/notia-templater) |
| Theme enhancer | [Chakyiu/notia-theme-enhancer](https://github.com/Chakyiu/notia-theme-enhancer) |

## Adding a plugin

A plugin repository contains `manifest.json` and `main.js` (or the file `main` names), the same files a vault's `.notia/plugins` folder holds. Open a pull request that adds one object to `community-plugins.json` and a row to the table above. The `id` is the `id` in that repository's `manifest.json`, and `branch` is the branch Notia should install — read it from the repository, it is not always `main`.

## Keeping the list in sync

Every change to a plugin repository has to reach this list: a new plugin is added to `community-plugins.json` and the table, and an entry's `name`, `description`, `repo`, or `branch` is corrected when the plugin changes.

`scripts/check-plugins.mjs` enforces that. It reads the list and, for each entry, fetches the plugin's `manifest.json` from its repository and branch; it fails when the branch has no manifest or when the manifest's `id` differs from the entry's. It also lists each owner's repositories and fails for a `notia-*` repository whose `manifest.json` id is not in the list, which is how a newly added plugin shows up. Name and description differences are reported as warnings.

```sh
node scripts/check-plugins.mjs
```

Node 18 or newer, no dependencies. The workflow in `.github/workflows/check-plugins.yml` runs the same check on every push and pull request, and once a day, so a plugin change that was never added here turns that run red.

## License

[MIT](LICENSE).
