# Настройка проекта для student ID 73194

Текущий репозиторий: https://github.com/Vitalii73194/vistula-task-manager. Код загружен, GitHub Pages включён из корня main. В инструкции ниже приведено требуемое заданием имя аккаунта; сейчас используется Vitalii73194. Перед сдачей нужно устранить это расхождение. Supabase уже настроен, повторно создавать проект не требуется.

## 1. Supabase

1. Зарегистрируйся или войди на https://supabase.com/dashboard.
2. Создай отдельный бесплатный проект для учебных тестовых данных. Пароль базы сохрани у себя; его не нужно добавлять в приложение.
3. Дождись запуска проекта. Открой **SQL Editor**, создай запрос, вставь содержимое `supabase-setup.sql` и выполни его.
4. В настройках проекта найди **Project URL** (обычно в Data API) и **Publishable key** в API Keys. Для приложения нужен ключ вида `sb_publishable_...`.
5. Замени два значения-заглушки в `config.json` своими значениями. `tableName` оставь `tasks`.

```json
{
  "supabaseUrl": "https://YOUR_PROJECT_ID.supabase.co",
  "supabasePublishableKey": "YOUR_SUPABASE_PUBLISHABLE_KEY",
  "tableName": "tasks"
}
```

Этот проект специально разрешает всем посетителям CRUD над учебной таблицей, как требует задание. Используй только тестовые данные. Publishable key публичный; secret/service-role keys и пароль базы публиковать нельзя.

Справка: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [REST API](https://supabase.com/docs/guides/api/creating-routes).

## 2. Локальная проверка

Из папки проекта:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Открой http://127.0.0.1:8000/ и проверь создание, редактирование, смену статуса и удаление задачи. Обновляй страницу между проверками: данные должны сохраняться в Supabase. Остановить сервер: Ctrl+C.

## 3. GitHub и публикация

1. Создай или используй учебный аккаунт **vistula-team-project-73194**.
2. Создай в нём публичный репозиторий **vistula-task-manager**. При использовании команд ниже оставь его пустым, без автоматического README.
3. После заполнения `config.json` выполни в папке проекта:

```powershell
git add index.html app.js app.test.cjs style.css config.json README.md SETUP.md COLLABORATION.md supabase-setup.sql scripts/check-supabase.cjs .gitignore .nojekyll
git commit -m "Add Task Manager with Supabase REST integration"
git branch -M main
git remote add origin https://github.com/vistula-team-project-73194/vistula-task-manager.git
git push -u origin main
```

Если `origin` уже существует, сначала проверь `git remote -v`, а не добавляй второй. При push войди именно в учебный аккаунт.

4. В репозитории открой **Settings → Pages → Build and deployment → Deploy from a branch**, выбери **main** и **/(root)**, сохрани.
5. Дождись успешной публикации и проверь https://vistula-team-project-73194.github.io/vistula-task-manager/.

## 4. Партнёр и сдача

Выполни обмен Pull Request по `COLLABORATION.md`. Добавь ссылки на оба смерженных PR в `README.md` и опубликуй изменение.

Проверь пункты Manual acceptance check в README на GitHub Pages. В Platon отправь только:

```text
https://vistula-team-project-73194.github.io/vistula-task-manager/
```

Рекомендуемый срок из задания: 8 ноября 2026, 23:59. Это не окончательный дедлайн.
