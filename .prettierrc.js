module.exports = {
  // Unfortunately, prettierrc doesn't support explicitly enumerating the files
  // we wish to "prettify", instead relying on them being passed as a glob on
  // the CLI.  See https://github.com/prettier/prettier/issues/3764.
  //
  // Unfortunately, that complicates the `package.json` scripts since it
  // requires duplicating globs in multiple places, and also prevents
  // Prettier-enabled editors from knowing what files are to be covered.
  //
  // We can DRY this up a bit by leveraging "requirePragma", an instruction
  // that tells prettier to only prettify files which contain `@prettier`
  // (which none of the files in this repository have) and then specifying the
  // exact files to be prettified.  As the issue above notes, this should become
  // more succinct in Prettier 2.x.
  requirePragma: true,
  overrides: [
    {
      files: '{docs/{,source/**},.,packages/**,test}/{*.js,*.ts}',
      options: {
        requirePragma: false,
        trailingComma: 'all',
        singleQuote: true,
      },
    },
  ],
};
