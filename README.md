# Реклама готелю «Нивки» і ресторану «Букет Côtelette»

▶️ **[Дивитися відео (49 с, 1080p)](https://vyakhno.github.io/hotel-nivki-ad/)** · [завантажити mp4](hotel-nivki-ad-web.mp4)

Рекламний ролик для готелю «Нивки» (Київ) та ресторану при ньому. Зроблено як домашнє завдання майстер-класу Claude Code: усю роботу, від збору фактів і фото до монтажу, виконав Claude Code.

## Як зроблено

| Етап | Інструмент |
|---|---|
| Факти та фото | сайт готелю, Booking, buketkotlet.net, Instagram @buket_cotelette ([FACTS.md](FACTS.md)) |
| Сценарій | 8 сцен, українською ([SCRIPT.md](SCRIPT.md)) |
| Відео | Grok Imagine (xAI), 13 кліпів із реальних фото готелю ([shots.json](shots.json), [tools/grok-video.mjs](tools/grok-video.mjs)) |
| Озвучка | Gemini TTS, голос Sulafat ([audio/vo.txt](audio/vo.txt)) |
| Музика | Google Lyria RealTime ([tools/music/lyria.mjs](tools/music/lyria.mjs)) |
| Монтаж і титри | HyperFrames, HTML → відео ([video/](video/)) |

Кліпи — це анімовані ШІ версії справжніх фото готелю та ресторану.

## Зібрати заново

```bash
cd video
npx hyperframes preview
npx hyperframes render -q delivery -o ../hotel-nivki-ad.mp4
```
