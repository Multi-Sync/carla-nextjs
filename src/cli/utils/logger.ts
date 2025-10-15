/**
 * Logger utilities for CLI output
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  success(message: string): void {
    console.log(chalk.green('✅'), message);
  }

  error(message: string): void {
    console.log(chalk.red('❌'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠️'), message);
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ️'), message);
  }

  log(message: string): void {
    console.log(message);
  }

  startSpinner(text: string): void {
    this.spinner = ora(text).start();
  }

  updateSpinnerText(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  succeedSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    }
  }

  failSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  section(title: string): void {
    console.log('\n' + chalk.bold.cyan(title));
  }

  list(items: string[]): void {
    items.forEach(item => {
      console.log('  •', item);
    });
  }

  code(code: string): void {
    console.log(chalk.gray(code));
  }
}

export const logger = new Logger();
