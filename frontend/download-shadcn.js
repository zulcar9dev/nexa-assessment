const fs = require('fs');
const path = require('path');
const https = require('https');

const components = [
  'button', 'card', 'input', 'select', 'badge', 
  'dropdown-menu', 'dialog', 'tabs', 'label', 
  'separator', 'avatar', 'tooltip', 'table', 
  'chart', 'skeleton'
];

const UI_DIR = path.join(__dirname, 'src', 'components', 'ui');
if (!fs.existsSync(UI_DIR)) {
  fs.mkdirSync(UI_DIR, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const component of components) {
    try {
      console.log(`Downloading ${component}...`);
      const data = await fetchJson(`https://ui.shadcn.com/r/styles/nova/${component}.json`);
      if (data && data.files) {
        for (const file of data.files) {
          const content = file.content;
          const targetPath = path.join(UI_DIR, `${component}.tsx`);
          fs.writeFileSync(targetPath, content);
          console.log(`- Saved ${targetPath}`);
        }
      }
    } catch (e) {
      console.error(`Failed to download ${component}:`, e.message);
    }
  }
}

run();
