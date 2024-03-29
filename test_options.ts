import { test as base } from '@playwright/test';

export type TestOptions = {
  ss: string;
};

export const test = base.extend<TestOptions>({
  ss: ['http://localhost', { option: true }],
});