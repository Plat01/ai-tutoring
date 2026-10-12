// Публикует каталог и статические ресурсы дашбордов; локальные служебные файлы остаются в репозитории.
import { cp, mkdir, readdir, access, rm } from 'node:fs/promises';
import { join } from 'node:path';
const root = new URL('../', import.meta.url).pathname;
const out = join(root, '_site');
await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'dashboards'), { recursive: true });
await cp(join(root, 'index.html'), join(out, 'index.html'));
let count = 0;
for (const entry of await readdir(join(root, 'dashboards'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const source = join(root, 'dashboards', entry.name);
  try { await access(join(source, 'index.html')); } catch { continue; }
  const destination = join(out, 'dashboards', entry.name);
  await mkdir(destination, { recursive: true });
  await cp(join(source, 'index.html'), join(destination, 'index.html'));
  // Сохраняет структуру папок и относительные пути локальных ресурсов.
  await cp(source, destination, {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:README\.md|verification\.md|sources-check\.json|index\.export\.html|\.DS_Store)$/.test(path)
  });
  count++;
}
if (count === 0) throw new Error('Не найдено ни одного дашборда с index.html');
console.log(`GitHub Pages: ${count} дашборд(ов), каталог _site/`);
