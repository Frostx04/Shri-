# Отчёт геокодинга

Ещё не сгенерирован. Запустите `npm run geocode` на машине с доступом к nominatim.openstreetmap.org (из среды сборки, где делался проект, сервис был недоступен).


## Кафе и спа — проставлено 13.11.2026

У этих мест координат не было (или были примерными); взяты из OpenStreetMap по точному совпадению названия в рамке Мириссы/Унаватуны. `coordsVerified: false` — сверить в Google Maps.

| id | было | стало | как |
|---|---|---|---|
| `lemongrass` | [6.011, 80.249] | 6.00707, 80.24279 | Nominatim, точное совпадение названия |
| `shady-lane` | — | 5.94791, 80.45827 | Nominatim, точное совпадение названия |
| `dewmini` | — | 5.9472, 80.46178 | Nominatim, точное совпадение названия |
| `massage` | — | 5.94484, 80.4639 | Nominatim, точное совпадение названия |
| `hide-place` | — | 5.95021, 80.45831 | Nominatim, точное совпадение названия |
| `mila` | — | 5.94692, 80.45828 | Nominatim, точное совпадение названия |
| `fujisan` | — | 5.96699, 80.4509 | Nominatim, точное совпадение названия |
| `capybara` | — | 5.94576, 80.45738 | Nominatim, точное совпадение названия |
| `fish-point` | — | 5.9717, 80.42799 | Nominatim, точное совпадение названия |
| `food-city` | — | 5.94744, 80.45825 | Nominatim, точное совпадение названия |
| `garlic` | — | 5.94762, 80.4612 | Nominatim, точное совпадение названия |

Не найдены в OSM (остаются без точки на карте, есть кнопка Google Maps): quinta, cafe-extreme, bamboo-hut, mirissa-inn, concept-la-mer, giragala, duck-lake, solt, curry-gedara, tuana, imc-clinic.


## Места плана — исправлено 13.11.2026 (Nominatim, точное название)

| id | было | стало | Δ, км | что нашлось |
|---|---|---|---|---|
| `turtle-beach` | [5.9418, 80.4672] | 5.93925, 80.46828 | 0.31 | Coconut Tree Hill, viewpoint |
| `thalaramba` | [5.953, 80.444] | 5.93984, 80.47538 | 3.77 | деревня Thalaramba в OSM (ориентира Eat Out в OSM нет) |
| `lagoon` | [5.956, 80.48] | 5.94663, 80.482 | 1.07 | озеро Garadnuwa (Гарандува) в OSM — центр озера; точку посадки скажет оператор |
| `fireflies` | [5.97, 80.43] | 5.96452, 80.40895 | 2.41 | Kumbalgama, Matara District |
| `elephant-transit-home` | [6.4245, 80.889] | 6.42688, 80.81711 | 7.95 | Elephant Transit Home, tourism/zoo |
| `handunugoda` | [5.99, 80.356] | 6.01364, 80.36418 | 2.78 | Handunugoda Tea Estate |
| `koggala-museum` | [5.987, 80.328] | 5.98898, 80.32749 | 0.23 | Martin Wickramasinghe Folk Museum Complex |
| `dondra` | [5.921, 80.5895] | 5.92124, 80.59403 | 0.50 | Devinuwara (Dondra) Light House |
| `flying-foxes` | [6.121, 80.738] | 6.12722, 80.74733 | 1.24 | Mulkirigala (деревня) |
