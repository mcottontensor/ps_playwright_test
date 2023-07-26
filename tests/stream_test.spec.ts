import { test, expect } from '@playwright/test';
import * as uuid from 'uuid';
import * as path from 'path'
import * as fs from 'fs';

const __dirname = path.dirname(__filename);
const __resultsDirectory = path.join(__dirname, '../results');
const __screenshotDirectory = path.join(__resultsDirectory, 'screenshots');

if (!fs.existsSync(__resultsDirectory)) {
  fs.mkdirSync(__resultsDirectory, { recursive: true });
}

if (!fs.existsSync(__screenshotDirectory)) {
  fs.mkdirSync(__screenshotDirectory, { recursive: true });
}

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

test('stream test', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto(`file:${path.join(__dirname, 'TestClient/www/index.html')}`);

  // Click the get started link.
  await page.getByRole('button', { name: 'Connect' }).click();

  await page.locator('#streamingVideo').click();

  await delay(20000);

  let results = await page.evaluate(()=> {
    let videoStats = pixelStreaming._webRtcController.peerConnectionController.aggregatedStats.inboundVideoStats;
    let r = {};
    r.bitrate = videoStats.bitrate;
    r.jitter = videoStats.jitter;
    r.fps = videoStats.framesPerSecond;
    r.frame_count = videoStats.framesReceived;
    return r;
  });

  const screenshotName = uuid.v1() + '.png';
  await page.screenshot({
    path: path.join(__screenshotDirectory, screenshotName),
    fullPage: false
  });
  results.screenshot = screenshotName;

  // store the results
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  const resultsFilename = 'Result-' + year + '' + month + '' + date + '' + hours + '' + minutes + '' + seconds + '.json';
  fs.writeFile(path.join(__resultsDirectory, resultsFilename), JSON.stringify(results), (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  });

  await expect(results.frame_count > 0).toBeTruthy();
});
