import { sync as commandExists } from 'command-exists';

const promise: Promise<'npm' | 'pnpm'> = new Promise((resolve) => {
  if (!commandExists('pnpm')) {
    return resolve('npm');
  }
  resolve('pnpm');
});

export default promise;