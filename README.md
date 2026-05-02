# Envelopp

> Securely share and sync `.env` files across your team — encrypted locally, stored on GitHub Gists.

Envelopp (`envl`) solves the age-old problem of sharing environment variables without resorting to insecure channels like Slack, email, or text messages. It encrypts your `.env` files locally using **AES-256** before uploading them to a GitHub Gist, meaning even if the Gist is exposed, the contents are completely useless without the password. Multiple `.env.*` files are supported under a single Gist ID, so your entire environment setup lives in one place.

----------

## How It Works

1.  You encrypt one or more `.env.*` files locally with a password using AES-256 encryption.
2.  The encrypted payload is pushed to a GitHub Gist (owned by you or your team lead).
3.  Teammates pull the Gist and decrypt it locally using the shared password.
4.  A `.envl` file in your project root keeps track of the Gist ID so you never have to pass it around manually.

Since encryption happens **before** the data ever leaves your machine, the Gist on GitHub holds nothing but ciphertext. No plaintext secrets ever touch the cloud.

----------

## Installation

Envelopp is distributed as a global npm package.

```bash
npm install -g envelopp
```

After installation, the `envl` command will be available globally in your terminal.

----------

## Prerequisites

Each user needs a **GitHub Personal Access Token** with the `gist` scope enabled. It is strongly recommended to create a dedicated token for Envelopp with **only** Gist access since this limits the blast radius if the token is ever compromised.

To create one:

1.  Go to [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2.  Generate a new token and enable only the **`gist`** scope.
3.  Copy the token — you'll use it in the authentication step below.

----------

## Authentication

Before using any other command, authenticate with your GitHub token:

```bash
envl auth
```

This command prompts you for your GitHub token and saves it to a local config file on your machine. Subsequent commands will automatically read from this config. You won't need to re-authenticate unless you change your token.

You can save the token in two ways:

-   **Global** — applies to all projects on this machine unless there's specific token for the current Gist ID.
-   **Project-specific** — applies only to the current project. This option is available only if the project already has a Gist ID attached (i.e., a `.envl` file exists).

----------

## Usage

### Pushing `.env` Files

```bash
envl push [options]
```

Encrypts and pushes `.env.*` files from your project root to a GitHub Gist. Envelopp supports pushing multiple files under a single Gist ID. Behavior depends on whether a `.envl` file already exists in your project:
 
- **No `.envl` file** — Creates a new Gist and saves the returned Gist ID to a new `.envl` file in your project root.
- **`.envl` file exists** — Reads the Gist ID from `.envl` and syncs the updated encrypted payload to that existing Gist.
If no flags are provided, you'll be presented with an interactive checkbox prompt to select which files to push from those detected in your project root.
 
**Options:**
 
```
Usage: envl push [options]
Seal and sync local .env to GitHub
 
Options:
  -a, --all                 Seal all detected .env files
  -i, --include <files...>  Specifically include files
  -I, --ignore <files...>   Ignore specific files
  -h, --help                display help for command
```
 
> **Note:** Your GitHub token must have write access to the target Gist. If the Gist belongs to a team lead, they must explicitly grant you collaborator access.

----------

### Pulling `.env` Files

```bash
envl pull [options] [gist-id]
```

Downloads and decrypts `.env.*` files from the specified Gist. Once decrypted, pulled keys are merged on top of your existing local files — any variables you have locally that aren't in the Gist are preserved.
 
If your project already has a `.envl` file with a Gist ID, you can omit the `[gist-id]` argument entirely:
 
```bash
envl pull
```
 
If no flags are provided, you'll be presented with an interactive selection prompt to choose which files to sync from those available in the Gist.
 
**Options:**
 
```
Usage: envl pull [options] [id]
Fetch and unseal .env from GitHub
 
Options:
  -a, --all                 Pull all files from the Gist
  -i, --include <files...>  Pull specific files by name
  -h, --help                display help for command
```
 
> **Note:** Pulling does not require write access to the Gist — a token with read (`gist`) scope is sufficient. You only need the Gist ID and the password.

----------

## Project File: `.envl`

The `.envl` file is automatically created in your project root after a successful `push`. It stores the Gist ID associated with your project so that future `push` and `pull` commands know which Gist to target.

Example `.envl`:
```
abc123def456
```

### Should I commit `.envl`?

That depends on your team's workflow:


| Scenario                                                 | Recommendation                    |
| -------------------------------------------------------- | --------------------------------- |
| You want teammates to `pull` without knowing the Gist ID | Commit `.envl` to version control |
| You want to keep the Gist ID private                     | Add `.envl` to `.gitignore`       |


If you add it to `.gitignore`, teammates will need the Gist ID passed to them separately on first use.

----------

## Security Model


| What's stored on GitHub Gists         | What stays on your machine          |
| ------------------------------------- | ----------------------------------- |
| AES-256 encrypted ciphertext          | The plaintext `.env` file           |
| Nothing readable without the password | Your GitHub token (in local config) |
 
- **AES-256** is the same encryption standard used by banks and governments.
- The password is **never** saved anywhere — not on GitHub, not on your local machine. You will be prompted to type it manually in the terminal every time you run `push` or `pull`.
- Even a leaked Gist is fully useless without the password.



----------

## Recommended Workflow for Teams

1.  **Team lead** installs Envelopp, authenticates, and runs `envl push` in the project root. This creates the Gist and generates the `.envl` file.
2.  The team lead shares the **Gist ID** (or commits `.envl`) and the **password** with teammates over a secure channel (e.g., a password manager).
3.  **Teammates** install Envelopp, authenticate with their own tokens, and run `envl pull` (or `envl pull <gist-id>` if `.envl` isn't committed).
4.  Whenever the `.env` changes, the team lead (or any user with write access) runs `envl push` to sync.
5.  Teammates run `envl pull` to get the latest changes.

----------

## Command Reference


| Command                          | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| `envl auth`                      | Authenticate with a GitHub token                                            |
| `envl push`                      | Encrypt and push `.env.*` files to a Gist (interactive if no flags given)   |
| `envl push --all`                | Push all detected `.env.*` files                                            |
| `envl push --include <files...>` | Push specific files                                                         |
| `envl push --ignore <files...>`  | Push all detected files except the ones specified                           |
| `envl pull [gist-id]`            | Pull and decrypt `.env.*` files from a Gist (interactive if no flags given) |
| `envl pull --all`                | Pull all files from the Gist                                                |
| `envl pull --include <files...>` | Pull specific files by name                                                 |


----------

## Contributing

Issues and feature requests are welcome. Feel free to [open an issue](../../issues) — pull requests are not being accepted at this time.

----------

## License

MIT License — see [LICENSE](./LICENSE) for details.