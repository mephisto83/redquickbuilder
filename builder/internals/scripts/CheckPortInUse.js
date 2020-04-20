import chalk from 'chalk';
import detectPort from 'detect-port';

const port = process.env.PORT || '1354';

detectPort(port, (err, availablePort) => {
  if (port !== String(availablePort)) {
    throw new Error(
      chalk.whiteBright.bgRed.bold(
        `Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4444 yarn dev`
      )
    );
  } else {
    process.exit(0);
  }
});
