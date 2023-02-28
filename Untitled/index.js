#!/usr/bin/env node

const findUp = require('find-up');
const fs = require('fs');
const ignore = require('ignore');
const path = require('path');
const program = require('commander');
const { walkStream } = require('@nodelib/fs.walk');
const FileOwner = require('./FileOwner.js');
const Codeowners = require('./codeowners.js');

program
  .command('audit')
  .description('list the owners for all files')
  .option('-u, --unowned', 'unowned files only')
  .option(
    '-r, --root <root_directory>',
    'specify root directory to search from, default is process.cwd()'
  )
  .action((options) => {
    let codeowners;
    var fileowners = {
      files: []
    };
    let rootPath = options.root ? options.root : process.cwd();
    const gitignorePath = findUp.sync('.gitignore', { cwd: rootPath });
    const gitignoreMatcher = ignore();

    if (gitignorePath) {
      gitignoreMatcher.add(fs.readFileSync(gitignorePath).toString());
    }

    try {
      codeowners = new Codeowners(rootPath);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }

    const stream = walkStream(rootPath, {
      deepFilter: (entry) => {
        const split = entry.path.split(path.sep);
        return !split.includes('node_modules') && !split.includes('.git');
      },
      errorFilter: (error) =>
        error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EPERM',
    });

    stream.on('data', (file) => {
      const relative = path
        .relative(codeowners.codeownersDirectory, file.path)
        .replace(/(\r)/g, '\\r');

      const owners = codeowners.getOwner(relative);

      if (options.unowned) {
        if (!owners.length) {
          let fileOwner = new FileOwner(relative, false, "");
          fileowners.files.push(fileOwner);
        }
      } else {
        if (!owners.length) {
          let fileOwner = new FileOwner(relative, false, "");
          fileowners.files.push(fileOwner);
        }else{
          let fileOwner = new FileOwner(relative, true, owners);
          fileowners.files.push(fileOwner);
        }
      }
    });

    stream.on('end', function() {
      var stream = fs.createWriteStream("codeowner-audit");
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(fileowners));
        stream.end();
      });
    });

    stream.on('error', (err) => {
      console.error(err);
    });
  });

program.parse(process.argv);
