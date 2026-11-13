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


## Полная сверка всех мест — 13.11.2026

Каждое место искалось в OpenStreetMap (Nominatim) по названию; расхождения разобраны вручную. Для нацпарков — точка у главного входа, а не центр парка.

| id | было | стало | Δ, км | что это |
|---|---|---|---|---|
| `mirissa-bays` | [5.9407, 80.4699] | 5.94316, 80.4618 | 0.94 | Mirissa Beach (natural/beach) |
| `udawalawe` | [6.438, 80.888] | 6.43766, 80.88853 | 0.07 | вход в парк (Udawalawe Elephants Park) |
| `weligama` | [5.972, 80.429] | 5.96884, 80.42516 | 0.55 | Weligama Beach |
| `tangalle` | [6.024, 80.794] | 6.03812, 80.79776 | 1.62 | Medaketiya — главный пляж Тангалле |
| `wewurukannala` | [5.955, 80.695] | 5.97928, 80.69746 | 2.71 | у станции Wewrukannala, храм рядом |
| `hummanaya` | [5.993, 80.723] | 5.97762, 80.73873 | 2.44 | Hummanaya Blow Hole (natural/blowhole) |
| `unawatuna` | [6.017, 80.243] | 6.01755, 80.23775 | 0.58 | White Jungle Beach (natural/beach) |
| `madu-river` | [6.296, 80.045] | 6.28287, 80.05803 | 2.05 | Madu Ganga |
| `bentota` | [6.421, 79.996] | 6.42907, 79.99433 | 0.92 | Bentota beach |
| `bundala` | [6.183, 81.233] | 6.20986, 81.22518 | 3.11 | Bundala National Park |
| `yala` | [6.37, 81.52] | 6.27635, 81.40299 | 16.60 | Палатупана — главный вход в Ялу (Блок 1) |
| `kataragama` | [6.417, 81.333] | 6.41846, 81.33365 | 0.18 | Ruhunu Maha Kataragama Devalaya |
| `ella-train` | [6.9271, 80.8] | 6.87615, 81.04749 | 27.90 | Ella Railway Station |
| `liptons-seat` | [6.79, 80.964] | 6.78066, 81.01551 | 5.78 | Lipton's Seat (tourism/viewpoint) |
| `polonnaruwa` | [7.9403, 81.0188] | 7.94876, 81.00249 | 2.03 | Древний город Полоннарува (archaeological_site) |
| `anuradhapura` | [8.3114, 80.4037] | 8.35243, 80.39991 | 4.58 | Священный город Анурадхапура (archaeological_site) |
| `colombo` | [6.9271, 79.8612] | 6.92496, 79.84446 | 1.86 | Galle Face Green |
| `arugam-bay` | [6.84, 81.836] | 6.84685, 81.8307 | 0.96 | Arugam Bay |
| `wilpattu` | [8.456, 80.013] | 8.44965, 80.01673 | 0.82 | Wilpattu National Park |
| `kalpitiya` | [8.233, 79.759] | 8.23681, 79.76615 | 0.89 | Kalpitiya |
| `jaffna` | [9.6615, 80.0255] | 9.66509, 80.0093 | 1.82 | Jaffna |

**Проверено (точка = конкретный объект OSM):** 50 мест, `coordsVerified: true`.

**Приблизительно (в OSM нет объекта — сверить в Google Maps на месте):** thalaramba, lagoon, fireflies, sinharaja, animal-sos, crocodiles, snake-farm, wewurukannala, nuwara-eliya, horton-plains, minneriya, kitulgala, wilpattu.

**Без точки на карте:** quinta, imc-clinic, cafe-extreme, bamboo-hut, mirissa-inn, concept-la-mer, giragala, duck-lake, solt, curry-gedara, tuana.
