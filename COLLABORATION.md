# Обмен Pull Request с партнёром

Каждый студент должен отправить один PR в репозиторий другого студента и самостоятельно смержить один входящий PR. Оба PR должны быть смержены.

## Твой PR партнёру

1. Сделай fork его публичного `vistula-task-manager` в аккаунт `vistula-team-project-73194`.
2. В fork создай ветку `feature/team-contribution`.
3. В корне **его проекта** добавь `contribution.json` с содержимым:

```json
{"contributorStudentId":"73194"}
```

4. Добавь туда `contribution.html`:
   - HTML title и заголовок: `Team Contribution`;
   - кнопка `id="load-contributor"`, текст `Show Contributor`;
   - элемент `id="contributor-student-id"`;
   - ссылка на `index.html`;
   - по нажатию кнопки `fetch("contribution.json")`, проверка успешного ответа, чтение `contributorStudentId` и вывод через `textContent`;
   - ID берётся из JSON, а не из константы JavaScript.
5. Commit, push, затем PR из своей ветки в **main репозитория партнёра**. Заголовок: `Add contributor page – 73194`.
6. Партнёр проверяет и мержит PR. Проверь его опубликованные `/contribution.html` и `/contribution.json`.

## PR партнёра тебе

Партнёр делает то же самое для твоего репозитория через свой аккаунт и fork. В его JSON должен быть **его student ID**. Проверь изменения и сам смержи PR.

После публикации открой свой `/contribution.html`, нажми Show Contributor и проверь ID. Главная страница уже содержит ссылку на эту страницу.

Добавь настоящие ссылки на оба смерженных PR в `README.md`. Не заменяй сотрудничество собственными коммитами этих двух файлов: проверяется история PR и два разных автора.
