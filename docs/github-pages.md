# Дашборды в GitHub Pages

Каталог: https://Plat01.github.io/ai-tutoring/

Справочник по ИИ: https://Plat01.github.io/ai-tutoring/dashboards/ai-basics/

Репозиторий: https://github.com/Plat01/ai-tutoring

## Публикация

Workflow `.github/workflows/pages.yml` готовит статический сайт и публикует его после push в `main`. В настройках репозитория Pages источником должен быть **GitHub Actions**. В workflow используется окружение `github-pages`.

Добавление материала:

1. Создать `dashboards/<название>/index.html` с локальными ресурсами и README.
2. Проверить материал через Lavish и основные взаимодействия.
3. Добавить карточку в корневой `index.html`.
4. Отправить изменения в `main`, дождаться успешного workflow и проверить опубликованную ссылку.

Подготовить сайт локально (нужен Node.js 22+, дополнительные зависимости не требуются):

```bash
node scripts/build-pages.mjs
```

Результат — `_site/`. Скрипт сохраняет структуру `dashboards/` и относительные ссылки. README, отчёты проверок и HTML-экспорты дашбордов не копируются в сайт. Они остаются доступными в репозитории. Папка `_site/` не коммитится.

Дашборды используют статические HTML/CSS/JS и работают без серверной логики. GitHub Pages не выполняет серверный код. Подключения, которым нужен API-ключ, должны решаться отдельно без размещения секрета в HTML.

Документация: [официальная инструкция GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
