# Development

This document is __a work-in-progress__ which aims to describe various tips for __developing and working with this repository itself__.  It is not intended as a guide on how to use the project within another project, which should be covered elsewhere in the project's documentation.

For now, this will be a collection of tips and tricks for the maintainers of the project.

## Staging a release as a PR

Depending on the size of the release, it may be ideal to have a staging PR which gathers the various features we're intending on releasing into the version.  This can be a great way for the community to understand the scope of a release and a clear way for maintainers to publicize it and gather feedback.

1. Create a branch off `main` named `release-X.Y.Z`, where `X.Y.Z` is the intended release.
2. Edit the `CHANGELOG.md`, removing the `vNEXT` section entirely.  This section will remain on `main` and be resolved during the merge.
3. Add a new section for `### vX.Y.Z` with a bullet indicating that something is coming soon:

   ```
   ### vX.Y.Z

   - Nothing yet! Stay tuned.
   ```

4. Commit this change so GitHub will allow a PR to be opened against `main` with a notable change.  A suggested commit message is `Prepare CHANGELOG.md for upcoming vX.Y.Z release.`
5. Push the branch to GitHub
6. On GitHub, open a PR from the new release branch which targets `main`.
   __For the title of the PR__, use "Release X.Y.Z".  __For the body,__ use the contents of the template in the `.github/APOLLO_RELEASE_TEMPLATE.md` file in this repository.  Adjust the body as you see necessary.

## Publishing a release

### Step 1: Update the CHANGELOG.md

Ensure that the CHANGELOG.md is up to date prior to bumping the version.  Additionally, it's best to go ahead and predict what the version is going to be published as in the next step and commit that in the CHANGELOG.  This allows the Git tags that will be created in Step 2 to include the changes.

### Step 2: Bump the version

To bump the version, use the `release:version-bump` npm script.

   __Option 1__: _(Recommended)_ Bump all packages by the same version bump (e.g. patch, minor, prerelease, etc.).

   > __Note__: Be sure to replace `<version-bump>` in the following command with the appropriate [version bump keyword](https://github.com/lerna/lerna/tree/f6e7a13e60/commands/version#semver-bump)

   ```
   npm run release:version-bump -- <version-bump>
   ```

   __Option 2__: Be prompted for each new version.

   If no parameters are passed, a prompt will be displayed for each package asking for the new version.

   ```
   npm run release:version-bump
   ```


### Step 3: Publish with CI/CD

Immediately after bumping the version, use the `release:start-ci-publish` npm script to publish to npm.

> __Note: By default, publishing will be done to the `latest` tag on npm.__  To publish on a different `dist-tag` set the `APOLLO_DIST_TAG` environment variable.  E.g. To publish to the `alpha` tag instead of `latest`, the following command would be `APOLLO_DIST_TAG=alpha npm run release:start-ci-publish`.

```
npm run release:start-ci-publish
```

#### Step 3b: Manually publishing

__In the event that publishing via CI/CD is not possible, it may be done manually. Publishing manually should be avoided whenever possible.__

1. Log into `npm` with the `apollo-bot` user.

The `apollo-bot` user credentials are available to project owners, but generally used by CI/CD.
Logging in with the following command will use a different npm user configuration file at `$HOME/.npmrc-apollo-bot` so as not to override personal login credentials which may already be used.

```
NPM_CONFIG_USERCONFIG="$HOME/.npmrc-apollo-bot" npm login
```

2. Publish using `lerna` and the `apollo-bot` credentials.


> Note: By default, publishing will be done to the `latest` tag on npm.  To publish on a different `dist-tag` include the `--dist-tag` option below.  E.g. To publish to the `alpha` tag instead of `latest`, add `--dist-tag=alpha`.

```
DEBUG=lerna NPM_CONFIG_USERCONFIG="$HOME/.npmrc-apollo-bot" npx lerna publish from-git
```

#### Step 4: Add the "Complete versioning details" links

While it would be ideal to have this baked into the Git tag, it's not possible to do this in previous steps since we need to reference the commit hash that is created in Step 2's version bumping.

Therefore, after publishing, add an entry to the CHANGELOG that was published which references the "Release" commit in order to provide easier visibility into what was in that that release.  It should be in the following format, where `COMMIT_HASH` is replaced with the Git reference for the most `Release` commmit found in `git log` and should immediately follow the `### vX.Y.Z` header of the version just published:

```
> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/COMMIT_HASH)
```

#### Step 5: Update GitHub Milestones

The milestone for the release should be finalized.  If it didn't have a concrete version as its name, it should be renamed to the version that was finally released.

Then, any remaining issues or PRs which did not land in this version should be moved to a newly-created milestone which reflects the newly intended release for them.

Finally, _close_ (don't delete) the previous milestone once it is at 100% completion.
