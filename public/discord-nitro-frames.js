/**
 * Official Discord Nitro Avatar Decorations (217 Authentic Animated Assets)
 * Direct high-speed 60FPS animated Discord CDN presets with neon glowing drop-shadows
 */

(function() {
  'use strict';

  const DISCORD_NITRO_FRAMES = {
  "none": {
    "id": "none",
    "name": "ไม่มีกรอบ",
    "category": "all",
    "url": ""
  },
  "nitro-hugh-the-rainbow": {
    "id": "nitro-hugh-the-rainbow",
    "name": "Hugh the Rainbow",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
    "discordId": "1352687418418921532"
  },
  "nitro-phoenix": {
    "id": "nitro-phoenix",
    "name": "Phoenix",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_0e839cd79500e7b68e2bbbed54790c28.png?size=240&passthrough=true",
    "discordId": "1352687448228106302"
  },
  "nitro-firecrackers": {
    "id": "nitro-firecrackers",
    "name": "Firecrackers",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_0f4f1b40921ce680b60007e94427d1f2.png?size=160&passthrough=true",
    "discordId": "1352687476317093888"
  },
  "nitro-flaming-sword": {
    "id": "nitro-flaming-sword",
    "name": "Flaming Sword",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_0f5d6c4dd8ae74662ee9c40722a56cbd.png?size=240&passthrough=true",
    "discordId": "1352687565219692648"
  },
  "nitro-ramenbowl": {
    "id": "nitro-ramenbowl",
    "name": "RamenBowl",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_001e956faa73bd0410c455234c62818f.png?size=240&passthrough=true",
    "discordId": "1352687609780113562"
  },
  "nitro-steampunk-cat-ears": {
    "id": "nitro-steampunk-cat-ears",
    "name": "Steampunk Cat Ears",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_1acbe609daec21fa5b866df9e5a42cb7.png?size=240&passthrough=true",
    "discordId": "1352687646475817051"
  },
  "nitro-lucky-envelopes": {
    "id": "nitro-lucky-envelopes",
    "name": "Lucky Envelopes",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_1b1df0ae8c2d34afd85da5c22a0d761a.png?size=240&passthrough=true",
    "discordId": "1352687706303500391"
  },
  "nitro-magical-potion": {
    "id": "nitro-magical-potion",
    "name": "Magical Potion",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_1dbc603c181999b9815cb426dfec71a6.png?size=240&passthrough=true",
    "discordId": "1352687727283273788"
  },
  "nitro-akuma": {
    "id": "nitro-akuma",
    "name": "Akuma",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_1e8cb6070b13f775a41384c84c5a53e1.png?size=240&passthrough=true",
    "discordId": "1352687750910054440"
  },
  "nitro-next-turn-button": {
    "id": "nitro-next-turn-button",
    "name": "Next Turn Button",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_2b95e7a4951a1a092e7870bf1d456262.png?size=240&passthrough=true",
    "discordId": "1352687779103903754"
  },
  "nitro-snowglobe": {
    "id": "nitro-snowglobe",
    "name": "Snowglobe",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_2ca5fb1ecf0dac410b38d76cb4aae7f9.png?size=240&passthrough=true",
    "discordId": "1352687799467249694"
  },
  "nitro-feelin-nervous": {
    "id": "nitro-feelin-nervous",
    "name": "Feelin'Nervous",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_2d792aad5003faf6809e26879a7eae6b.png?size=240&passthrough=true",
    "discordId": "1352687817125531759"
  },
  "nitro-lotus-flower": {
    "id": "nitro-lotus-flower",
    "name": "Lotus Flower",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_2e55d644e11acb6253dfa422eff16dfd.png?size=240&passthrough=true",
    "discordId": "1352687886021034025"
  },
  "nitro-angry": {
    "id": "nitro-angry",
    "name": "Angry",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png?size=240&passthrough=true",
    "discordId": "1352687923060936756"
  },
  "nitro-owlbear-cub": {
    "id": "nitro-owlbear-cub",
    "name": "Owlbear Cub",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3c5743cedcb72131c58278278a97c143.png?size=240&passthrough=true",
    "discordId": "1352687950558920748"
  },
  "nitro-straw-hat": {
    "id": "nitro-straw-hat",
    "name": "Straw Hat",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3d1e6078b2e4c8865e0ad0f429d651b1.png?size=240&passthrough=true",
    "discordId": "1352687975795920928"
  },
  "nitro-heartbloom": {
    "id": "nitro-heartbloom",
    "name": "Heartbloom",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3e1fc3c7ee2e34e8176f4737427e8f4f.png?size=240&passthrough=true",
    "discordId": "1352688006338842714"
  },
  "nitro-candlelight": {
    "id": "nitro-candlelight",
    "name": "Candlelight",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3f29e6edfe1cff43736f644cf1d01278.png?size=240&passthrough=true",
    "discordId": "1352688027096584397"
  },
  "nitro-treasure-and-key": {
    "id": "nitro-treasure-and-key",
    "name": "Treasure and Key",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_4c9f2ec29c05755456dbce45d8190ed4.png?size=240&passthrough=true",
    "discordId": "1352688047501611089"
  },
  "nitro-in-tears": {
    "id": "nitro-in-tears",
    "name": "in Tears",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_4cc97277177b166fd7d4af3bdb370815.png?size=240&passthrough=true",
    "discordId": "1352688136488222821"
  },
  "nitro-butterflies": {
    "id": "nitro-butterflies",
    "name": "Butterflies",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_4cd9ae5a8d103c219eacd3674d7730cd.png?size=240&passthrough=true",
    "discordId": "1352688164925341844"
  },
  "nitro-zombie-food": {
    "id": "nitro-zombie-food",
    "name": "Zombie Food",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_4f2b75e5adff09709702613ea0e2cb70.png?size=240&passthrough=true",
    "discordId": "1352688185896992921"
  },
  "nitro-bubble-tea": {
    "id": "nitro-bubble-tea",
    "name": "Bubble Tea",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_5b1319abfc9f928479b68a73635f591d.png?size=240&passthrough=true",
    "discordId": "1352688217828233266"
  },
  "nitro-witch-hat-plum": {
    "id": "nitro-witch-hat-plum",
    "name": "Witch Hat (Plum)",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_5e8abacc7a7454d6b08b5cc84cac1d80.png?size=240&passthrough=true",
    "discordId": "1352688243153571911"
  },
  "nitro-shy": {
    "id": "nitro-shy",
    "name": "Shy",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6b793a5f7e4e15eea6b10a4fde448511.png?size=240&passthrough=true",
    "discordId": "1352688272836657297"
  },
  "nitro-black-hole": {
    "id": "nitro-black-hole",
    "name": "Black Hole",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6d16b27d9415cafe3b289053644337c4.png?size=240&passthrough=true",
    "discordId": "1352688305011167307"
  },
  "nitro-mirage": {
    "id": "nitro-mirage",
    "name": "Mirage",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6d99f670de3fcee669660fe262e896ea.png?size=240&passthrough=true",
    "discordId": "1352688338082988064"
  },
  "nitro-ufo": {
    "id": "nitro-ufo",
    "name": "UFO",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6fdbddb6229453eac3bbb212edf5cd1c.png?size=240&passthrough=true",
    "discordId": "1352688400959799449"
  },
  "nitro-aespa-fanlight": {
    "id": "nitro-aespa-fanlight",
    "name": "aespa Fanlight",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_007d64a922ff5773fb9464945de93c8e.png?size=240&passthrough=true",
    "discordId": "1352688431376891965"
  },
  "nitro-sakura-warrior": {
    "id": "nitro-sakura-warrior",
    "name": "Sakura Warrior",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_7cf09c7e78d6eb35ae354acc1d5cc676.png?size=240&passthrough=true",
    "discordId": "1352688457037910088"
  },
  "nitro-fox-hat": {
    "id": "nitro-fox-hat",
    "name": "Fox Hat",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_7d305bca6cf371df98c059f9d2ef05e4.png?size=240&passthrough=true",
    "discordId": "1352688484300882133"
  },
  "nitro-lovestruck": {
    "id": "nitro-lovestruck",
    "name": "Lovestruck",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_7f44d538ec830f479605f7bf8720afda.png?size=240&passthrough=true",
    "discordId": "1352688511169466368"
  },
  "nitro-crossbones": {
    "id": "nitro-crossbones",
    "name": "Crossbones",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_7f863078aee4932cd50ee4e3b55d3035.png?size=240&passthrough=true",
    "discordId": "1352688535949541542"
  },
  "nitro-group-hug": {
    "id": "nitro-group-hug",
    "name": "Group Hug",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8ad98d25ee4e4512704f759476eeb294.png?size=240&passthrough=true",
    "discordId": "1352688607072223346"
  },
  "nitro-pipedream": {
    "id": "nitro-pipedream",
    "name": "Pipedream",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8c17e799bfeffa797042569a1ebcafc0.png?size=240&passthrough=true",
    "discordId": "1352688633144147999"
  },
  "nitro-hex-tiles": {
    "id": "nitro-hex-tiles",
    "name": "Hex Tiles",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8dddba8c2a9704a943bb7020a3d0a418.png?size=240&passthrough=true",
    "discordId": "1352688660683952178"
  },
  "nitro-crystal-ball-blue": {
    "id": "nitro-crystal-ball-blue",
    "name": "Crystal Ball (Blue)",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8ee8ae54bddfcb17d7d5c5f9bce41c0d.png?size=240&passthrough=true",
    "discordId": "1352688718753824790"
  },
  "nitro-in-love": {
    "id": "nitro-in-love",
    "name": "In Love",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8ffa2ba9bff18e96b76c2e66fd0d7fa3.png?size=240&passthrough=true",
    "discordId": "1352688769211568149"
  },
  "nitro-hex-lights": {
    "id": "nitro-hex-lights",
    "name": "Hex Lights",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_09bb4197c743ea31b7eb052eddd3e892.png?size=240&passthrough=true",
    "discordId": "1352688796176613546"
  },
  "nitro-frag-out": {
    "id": "nitro-frag-out",
    "name": "FRAG OUT",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_09de63526a45be1ddac70e84718ee04a.png?size=240&passthrough=true",
    "discordId": "1352688824165072956"
  },
  "nitro-solar-orbit": {
    "id": "nitro-solar-orbit",
    "name": "Solar Orbit",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9a6bf0ab30a6719d6eb09fa4996984ca.png?size=240&passthrough=true",
    "discordId": "1352688892385562714"
  },
  "nitro-the-monster-you-created": {
    "id": "nitro-the-monster-you-created",
    "name": "The Monster You Created",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9bc421cef4bdcfffeb2344b44ad91b44.png?size=240&passthrough=true",
    "discordId": "1352688917081624607"
  },
  "nitro-good-ol-pepper": {
    "id": "nitro-good-ol-pepper",
    "name": "Good Ol'Pepper",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9cc1c1426ea5478aac7be6cdefdbc568.png?size=240&passthrough=true",
    "discordId": "1352688939907027080"
  },
  "nitro-fan-flourish": {
    "id": "nitro-fan-flourish",
    "name": "Fan Flourish",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9d2ff9685be0c668ef6990b0035fac17.png?size=240&passthrough=true",
    "discordId": "1352689042474664017"
  },
  "nitro-skull-medallion": {
    "id": "nitro-skull-medallion",
    "name": "Skull Medallion",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9d67a1cbf81fe7197c871e94f619b04b.png?size=240&passthrough=true",
    "discordId": "1352689087655579730"
  },
  "nitro-tarrain-tiles": {
    "id": "nitro-tarrain-tiles",
    "name": "Tarrain Tiles",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9d95e36bc282523fddc63d31a8d01091.png?size=240&passthrough=true",
    "discordId": "1352689118374793286"
  },
  "nitro-feelin-scrumptious": {
    "id": "nitro-feelin-scrumptious",
    "name": "Feelin'Scrumptious",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9d35467f282b8c72a26f5aa40aa2a637.png?size=240&passthrough=true",
    "discordId": "1352689152877002843"
  },
  "nitro-red-lantern": {
    "id": "nitro-red-lantern",
    "name": "Red Lantern",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9e16d86b2887eb2a3bed36a5b8876935.png?size=240&passthrough=true",
    "discordId": "1352689219063255172"
  },
  "nitro-mooncaps-blue": {
    "id": "nitro-mooncaps-blue",
    "name": "Mooncaps (Blue)",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_25f7407a6a0c5de43736a1f24c3b7979.png?size=160&passthrough=true",
    "discordId": "1352689708521623694"
  },
  "nitro-honeyblossom": {
    "id": "nitro-honeyblossom",
    "name": "Honeyblossom",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_27bbf0b53b1054cf61e9a4c0e8d4027f.png?size=240&passthrough=true",
    "discordId": "1352689726620045322"
  },
  "nitro-string-lights-dusk": {
    "id": "nitro-string-lights-dusk",
    "name": "String Lights (Dusk)",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_28e531da18a80b8287837332154c5f58.png?size=160&passthrough=true",
    "discordId": "1352689749915209910"
  },
  "nitro-defensive-shield": {
    "id": "nitro-defensive-shield",
    "name": "Defensive Shield",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_29a0533cb3de61aa8179810188f3830d.png?size=240&passthrough=true",
    "discordId": "1352689842177179739"
  },
  "nitro-heartstrings-blue": {
    "id": "nitro-heartstrings-blue",
    "name": "Heartstrings (Blue)",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_42cc3fe7133523096466102e7a222003.png?size=160&passthrough=true",
    "discordId": "1352690651065614386"
  },
  "nitro-magical-girl": {
    "id": "nitro-magical-girl",
    "name": "Magical Girl",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_45f7f9975255971b197d34d77fb50ede.png?size=240&passthrough=true",
    "discordId": "1352690708863123569"
  },
  "nitro-unicorn": {
    "id": "nitro-unicorn",
    "name": "Unicorn",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_47c0f4b4a837894998d5a316acf74f87.png?size=240&passthrough=true",
    "discordId": "1352690738680565934"
  },
  "nitro-chromawave": {
    "id": "nitro-chromawave",
    "name": "Chromawave",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_49c479e15533fb4c02eb320c9c137433.png?size=240&passthrough=true",
    "discordId": "1352690760096419902"
  },
  "nitro-rocket-puncher": {
    "id": "nitro-rocket-puncher",
    "name": "Rocket Puncher",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_49ed38f73003e2e182f77190af0a0a56.png?size=240&passthrough=true",
    "discordId": "1352690799728529560"
  },
  "nitro-slither-n-snack": {
    "id": "nitro-slither-n-snack",
    "name": "Slither'n Snack",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_49ffdb1883d8c644a8eb68711ee58be9.png?size=240&passthrough=true",
    "discordId": "1352690823388725409"
  },
  "nitro-koi-pond": {
    "id": "nitro-koi-pond",
    "name": "Koi Pond",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_50b440810b1bbd89f6284f36d40ad0af.png?size=240&passthrough=true",
    "discordId": "1352690853906350131"
  },
  "nitro-faces-of-the-moon": {
    "id": "nitro-faces-of-the-moon",
    "name": "Faces of the Moon",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_50cfb73a4c52235363491855d3c3c3bc.png?size=240&passthrough=true",
    "discordId": "1352690918247108608"
  },
  "nitro-dismay": {
    "id": "nitro-dismay",
    "name": "Dismay",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_51d3bb502109eec26c76386ec980bc8b.png?size=240&passthrough=true",
    "discordId": "1352690993832656939"
  },
  "nitro-sweat-drops": {
    "id": "nitro-sweat-drops",
    "name": "Sweat Drops",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_55c9d0354290afa8b7fe47ea9bd7dbcf.png?size=240&passthrough=true",
    "discordId": "1352691036043870249"
  },
  "nitro-lofi-girl-outfit": {
    "id": "nitro-lofi-girl-outfit",
    "name": "Lofi Girl Outfit",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_60cb281fac6d8f558efaf6dd9fe4dbe4.png?size=240&passthrough=true",
    "discordId": "1352691059309940816"
  },
  "nitro-viper-poison-cloud": {
    "id": "nitro-viper-poison-cloud",
    "name": "Viper Poison Cloud",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_62cd9d7c0031a7c1eb5ad5cc96992189.png?size=240&passthrough=true",
    "discordId": "1352691081883684954"
  },
  "nitro-heartstrings-red": {
    "id": "nitro-heartstrings-red",
    "name": "Heartstrings (Red)",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_63a69109db554a66764cbe61c6e556ef.png?size=240&passthrough=true",
    "discordId": "1352691113173061683"
  },
  "nitro-lunar-lanterns": {
    "id": "nitro-lunar-lanterns",
    "name": "Lunar Lanterns",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_63b29ec5b1ea6bb01c2251049838d822.png?size=240&passthrough=true",
    "discordId": "1352691135067459586"
  },
  "nitro-string-lights-ember": {
    "id": "nitro-string-lights-ember",
    "name": "String Lights (Ember)",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_63d17f42ee46a843d99a58655910bc6a.png?size=160&passthrough=true",
    "discordId": "1352691229426712658"
  },
  "nitro-m-bison": {
    "id": "nitro-m-bison",
    "name": "M. Bison",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_66f69effef43b4f7c4f5d0739079a947.png?size=160&passthrough=true",
    "discordId": "1352691255334670466"
  },
  "nitro-ryu": {
    "id": "nitro-ryu",
    "name": "Ryu",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_68cb6c21d6222cd9285c08068f39873d.png?size=240&passthrough=true",
    "discordId": "1352691293532323920"
  },
  "nitro-magic-portal-purple": {
    "id": "nitro-magic-portal-purple",
    "name": "Magic Portal (Purple)",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_72d1fd7c47cc7a98c8f64d175773344b.png?size=240&passthrough=true",
    "discordId": "1352691337694019626"
  },
  "nitro-cozy-cat": {
    "id": "nitro-cozy-cat",
    "name": "Cozy Cat",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_77b7b6a740a9451e1ef39c0252154ef8.png?size=240&passthrough=true",
    "discordId": "1352691394426306601"
  },
  "nitro-scallywag": {
    "id": "nitro-scallywag",
    "name": "Scallywag",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_78f326d95c0193c317470e3e81db81e7.png?size=240&passthrough=true",
    "discordId": "1352691419080560700"
  },
  "nitro-balance": {
    "id": "nitro-balance",
    "name": "Balance",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_82e4df4028396ad5ccaaafb397fa6248.png?size=240&passthrough=true",
    "discordId": "1352691512143777956"
  },
  "nitro-fishbones": {
    "id": "nitro-fishbones",
    "name": "FISHBONES!",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_84a67b33ef5b75e17f858a95648c973f.png?size=240&passthrough=true",
    "discordId": "1352691761096425493"
  },
  "nitro-string-lights": {
    "id": "nitro-string-lights",
    "name": "String Lights",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_88f42fb7360d8224a670a50c3496f315.png?size=240&passthrough=true",
    "discordId": "1352691788103548969"
  },
  "nitro-valorant-champions-2024": {
    "id": "nitro-valorant-champions-2024",
    "name": "VALORANT Champions 2024",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_90e0dce3cc48c4a9607b6d41209c737e.png?size=240&passthrough=true",
    "discordId": "1352691811377741834"
  },
  "nitro-cannon-fire": {
    "id": "nitro-cannon-fire",
    "name": "Cannon Fire",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_91a33236cf2728310a3a29bbdc8e0d29.png?size=240&passthrough=true",
    "discordId": "1352691833905614918"
  },
  "nitro-playful-lofi-cat": {
    "id": "nitro-playful-lofi-cat",
    "name": "Playful Lofi Cat",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_96f65d0aacc4a94b50ef7fb656d5826d.png?size=240&passthrough=true",
    "discordId": "1352691863324459141"
  },
  "nitro-crystal-elk": {
    "id": "nitro-crystal-elk",
    "name": "Crystal Elk",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_98c7600d304b86ca3b18272e1da05559.png?size=240&passthrough=true",
    "discordId": "1352691886514770042"
  },
  "nitro-magic-portal-blue": {
    "id": "nitro-magic-portal-blue",
    "name": "Magic Portal (Blue)",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_98cf94e029ac79c5b377413d1a2bd82f.png?size=160&passthrough=true",
    "discordId": "1352691919498645605"
  },
  "nitro-implant": {
    "id": "nitro-implant",
    "name": "Implant",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_172fa9da0af8698e37f5e5de76637439.png?size=240&passthrough=true",
    "discordId": "1352691945964568749"
  },
  "nitro-cottage-home": {
    "id": "nitro-cottage-home",
    "name": "Cottage Home",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_210b82b98876083ce393ecd92eb07260.png?size=240&passthrough=true",
    "discordId": "1352691999261851779"
  },
  "nitro-bloomling": {
    "id": "nitro-bloomling",
    "name": "Bloomling",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_306a56249fe3c3d2bc7a30041cb63e0e.png?size=240&passthrough=true",
    "discordId": "1352692107332157602"
  },
  "nitro-lightning": {
    "id": "nitro-lightning",
    "name": "Lightning",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_365eed4178528fe8293c4212e8e2d5cb.png?size=240&passthrough=true",
    "discordId": "1352692128836223108"
  },
  "nitro-mech-flora": {
    "id": "nitro-mech-flora",
    "name": "Mech flora",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_459cf2afde41f01559a4a4204ab81767.png?size=240&passthrough=true",
    "discordId": "1352692175095206049"
  },
  "nitro-lava-lamp-bundle": {
    "id": "nitro-lava-lamp-bundle",
    "name": "Lava Lamp Bundle",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_462b0bddc07dd495765fe12abe8b077f.png?size=240&passthrough=true",
    "discordId": "1352692217273389066"
  },
  "nitro-mallow-jump": {
    "id": "nitro-mallow-jump",
    "name": "Mallow Jump",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_492f6b54b761c0a14d9dbc9c98aaa0f5.png?size=240&passthrough=true",
    "discordId": "1352692240333410386"
  },
  "nitro-dancing-fairies": {
    "id": "nitro-dancing-fairies",
    "name": "Dancing fairies",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_535aa3354b1a7395c271bb2f53be4275.png?size=240&passthrough=true",
    "discordId": "1352692264907968694"
  },
  "nitro-air": {
    "id": "nitro-air",
    "name": "Air",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_554b7c34f7b6c709f19535aacb128e7b.png?size=240&passthrough=true",
    "discordId": "1352692287074861078"
  },
  "nitro-rose-bearer": {
    "id": "nitro-rose-bearer",
    "name": "Rose Bearer",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_555ad9b90a13534180b9274d013e3651.png?size=240&passthrough=true",
    "discordId": "1352692307270570004"
  },
  "nitro-power-by-shimmer": {
    "id": "nitro-power-by-shimmer",
    "name": "Power by shimmer",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_609fb5c17a4d5ff2e2bec1a1931a9caa.png?size=240&passthrough=true",
    "discordId": "1352692335942701156"
  },
  "nitro-head-in-the-clouds": {
    "id": "nitro-head-in-the-clouds",
    "name": "Head in the clouds",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_670b722e56740d11d1e6fe55b8094013.png?size=240&passthrough=true",
    "discordId": "1352692355722907833"
  },
  "nitro-fall-leaves": {
    "id": "nitro-fall-leaves",
    "name": "fall leaves",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_720a2045510ec16f9878237d2ff9873f.png?size=160&passthrough=true",
    "discordId": "1352692381627060275"
  },
  "nitro-pirate-captain": {
    "id": "nitro-pirate-captain",
    "name": "Pirate captain",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_798a5bcbb11067e4d9ab339e51d2a16c.png?size=240&passthrough=true",
    "discordId": "1352692425881157674"
  },
  "nitro-blade-storm": {
    "id": "nitro-blade-storm",
    "name": "Blade storm",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_904b1989077c91fca1168d39bfcaa0a4.png?size=240&passthrough=true",
    "discordId": "1352692487805730907"
  },
  "nitro-guile": {
    "id": "nitro-guile",
    "name": "Guile",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_993ac691660d3d67b500d995e121b220.png?size=240&passthrough=true",
    "discordId": "1352692508408156221"
  },
  "nitro-sproutling": {
    "id": "nitro-sproutling",
    "name": "sproutling",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_3012fad396abbf24e325431800b51510.png?size=240&passthrough=true",
    "discordId": "1352693177865338994"
  },
  "nitro-midnight-sorceress": {
    "id": "nitro-midnight-sorceress",
    "name": "Midnight Sorceress",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_4430a4ee89b7fba456e765db21f38485.png?size=240&passthrough=true",
    "discordId": "1352693202444091394"
  },
  "nitro-fall-leaves-98": {
    "id": "nitro-fall-leaves-98",
    "name": "fall Leaves",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_5087f7f988bd1b2819cac3e33d0150f5.png?size=240&passthrough=true",
    "discordId": "1352693244877602906"
  },
  "nitro-doodling": {
    "id": "nitro-doodling",
    "name": "Doodling",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_5873ecaa76fb549654b40095293f902e.png?size=240&passthrough=true",
    "discordId": "1352693265073307761"
  },
  "nitro-sleepy-chilledcow": {
    "id": "nitro-sleepy-chilledcow",
    "name": "Sleepy chilledcow",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6649e251a23f24935471ee02c212675b.png?size=240&passthrough=true",
    "discordId": "1352693289643409479"
  },
  "nitro-armamenter": {
    "id": "nitro-armamenter",
    "name": "Armamenter",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_6912c651e979fbfdc479ed082a571513.png?size=240&passthrough=true",
    "discordId": "1352693320580730973"
  },
  "nitro-flame-chompers": {
    "id": "nitro-flame-chompers",
    "name": "Flame Chompers",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8396e9830e3e288cd3aaa6daf18b605a.png?size=240&passthrough=true",
    "discordId": "1352693353027731476"
  },
  "nitro-constellations": {
    "id": "nitro-constellations",
    "name": "Constellations",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_8552f9857793aed0cf816f370e2df3be.png?size=240&passthrough=true",
    "discordId": "1352693385877520388"
  },
  "nitro-cat-onesie": {
    "id": "nitro-cat-onesie",
    "name": "cat onesie",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9661cf3296ac236d8815e3f5b809a467.png?size=240&passthrough=true",
    "discordId": "1352693406949970104"
  },
  "nitro-strawberry-vine": {
    "id": "nitro-strawberry-vine",
    "name": "Strawberry Vine",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_9867b1ba56601e745cfe741e6b00b835.png?size=240&passthrough=true",
    "discordId": "1352693430224158802"
  },
  "nitro-sakura-lnk": {
    "id": "nitro-sakura-lnk",
    "name": "sakura lnk",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_13913a00bd9990ab4102a3bf069f0f3f.png?size=240&passthrough=true",
    "discordId": "1352693460288929843"
  },
  "nitro-spooky-cat-ears": {
    "id": "nitro-spooky-cat-ears",
    "name": "spooky cat Ears",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_33656b7ed12cde00c1826b654cf65590.png?size=240&passthrough=true",
    "discordId": "1352693571765141534"
  },
  "nitro-dark-hood": {
    "id": "nitro-dark-hood",
    "name": "Dark Hood",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_41445f736db3525135b6b9e1122f2254.png?size=240&passthrough=true",
    "discordId": "1352693599590154470"
  },
  "nitro-sushi-roll": {
    "id": "nitro-sushi-roll",
    "name": "sushi roll",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_44045ae47175eaca4ed1b4d889b62b27.png?size=240&passthrough=true",
    "discordId": "1352693617424072735"
  },
  "nitro-string-lights-110": {
    "id": "nitro-string-lights-110",
    "name": "string Lights",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_47136c333dc989a0f0f9852e878d3844.png?size=160&passthrough=true",
    "discordId": "1352693640862105601"
  },
  "nitro-gelatinous-cube": {
    "id": "nitro-gelatinous-cube",
    "name": "Gelatinous Cube",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_66604bb5c9351541f30c20a4e78c239c.png?size=240&passthrough=true",
    "discordId": "1352693685904605215"
  },
  "nitro-feelin-awe": {
    "id": "nitro-feelin-awe",
    "name": "Feelin' awe",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_89155faed81b205d59fbbefa4316952d.png?size=240&passthrough=true",
    "discordId": "1352693708272828508"
  },
  "nitro-dice": {
    "id": "nitro-dice",
    "name": "Dice",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_94191be95bb9c471ff17644f3639eb6d.png?size=240&passthrough=true",
    "discordId": "1352693734965510174"
  },
  "nitro-a-hint-of-clove": {
    "id": "nitro-a-hint-of-clove",
    "name": "A hint of clove",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_98555e40cc6802bd3a4fed906af1d992.png?size=240&passthrough=true",
    "discordId": "1352693762416971926"
  },
  "nitro-neon-nibbles": {
    "id": "nitro-neon-nibbles",
    "name": "Neon Nibbles",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_126219d37fa9422dab6a075064453750.png?size=240&passthrough=true",
    "discordId": "1352693800526680106"
  },
  "nitro-water": {
    "id": "nitro-water",
    "name": "Water",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_250640ab00a8837a1d56f35879138177.png?size=240&passthrough=true",
    "discordId": "1352693820197834762"
  },
  "nitro-dragon-s-smile": {
    "id": "nitro-dragon-s-smile",
    "name": "Dragon's smile",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_445566ed965b2c1632a5b45c92f32d11.png?size=240&passthrough=true",
    "discordId": "1352693842612060294"
  },
  "nitro-joystick": {
    "id": "nitro-joystick",
    "name": "Joystick",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_795573a62c6d9b583f3029100f90d56b.png?size=240&passthrough=true",
    "discordId": "1352693884920008816"
  },
  "nitro-spirit-embers": {
    "id": "nitro-spirit-embers",
    "name": "Spirit Embers",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_1005898c6acf56a9ac5010baf444f6fd.png?size=240&passthrough=true",
    "discordId": "1352693911243591731"
  },
  "nitro-got-xenoglossy": {
    "id": "nitro-got-xenoglossy",
    "name": "Got xenoglossy",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_35713167cc82e0f408c26dfc032a7f0f.png?size=160&passthrough=true",
    "discordId": "1352693968386920540"
  },
  "nitro-kabuto": {
    "id": "nitro-kabuto",
    "name": "Kabuto",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_084353360ae4f9b5b3b5f186e5525de0.png?size=240&passthrough=true",
    "discordId": "1352694027215962113"
  },
  "nitro-aurora": {
    "id": "nitro-aurora",
    "name": "Aurora",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_386445551be850bb16b73a225d0d0602.png?size=240&passthrough=true",
    "discordId": "1352694050289094759"
  },
  "nitro-dandelion-duo": {
    "id": "nitro-dandelion-duo",
    "name": "Dandelion Duo",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_629689577fa1da2ef0061a5a8c930de1.png?size=240&passthrough=true",
    "discordId": "1352694063567999048"
  },
  "nitro-rage": {
    "id": "nitro-rage",
    "name": "Rage",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a0db4314b8cc271c8f472357aa895005.png?size=240&passthrough=true",
    "discordId": "1352694081611890831"
  },
  "nitro-fresh-pine": {
    "id": "nitro-fresh-pine",
    "name": "Fresh pine",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a0fafb7c7ee7f1e5b1442f44f3aa14b7.png?size=240&passthrough=true",
    "discordId": "1352694121873281086"
  },
  "nitro-ruby-hearts": {
    "id": "nitro-ruby-hearts",
    "name": "Ruby hearts",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a1c0581971d4a296908829289fea2c47.png?size=240&passthrough=true",
    "discordId": "1352694149530390549"
  },
  "nitro-city-walls": {
    "id": "nitro-city-walls",
    "name": "city walls",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a4e8e02dbbba6889428c744df7aa5a81.png?size=240&passthrough=true",
    "discordId": "1352694177770639443"
  },
  "nitro-polar-bear-hat": {
    "id": "nitro-polar-bear-hat",
    "name": "Polar Bear hat",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a7e6467b5332ab7a2b725aa225e6c752.png?size=240&passthrough=true",
    "discordId": "1352694220980355195"
  },
  "nitro-dusk-and-dawn": {
    "id": "nitro-dusk-and-dawn",
    "name": "Dusk and Dawn",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a44e9335ea869639fdf812f3642a56a6.png?size=240&passthrough=true",
    "discordId": "1352694253116985364"
  },
  "nitro-reyna-s-leer": {
    "id": "nitro-reyna-s-leer",
    "name": "Reyna's leer",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a87e3efa4de2956331831681231ce63b.png?size=240&passthrough=true",
    "discordId": "1352694278773543012"
  },
  "nitro-baby-displacer-beast": {
    "id": "nitro-baby-displacer-beast",
    "name": "Baby Displacer Beast",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a842a9cf76fdaf91a6354937b31ecdef.png?size=240&passthrough=true",
    "discordId": "1352694314739695658"
  },
  "nitro-oni-mask": {
    "id": "nitro-oni-mask",
    "name": "oni mask",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a21393f8a2cb8eafbdfb5364fb1cbbae.png?size=240&passthrough=true",
    "discordId": "1352694339842871419"
  },
  "nitro-fire": {
    "id": "nitro-fire",
    "name": "Fire",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a065206df7b011a5510e4e5bca7d49be.png?size=240&passthrough=true",
    "discordId": "1352694362345308230"
  },
  "nitro-bowler-hat": {
    "id": "nitro-bowler-hat",
    "name": "Bowler hat",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_a67833d0f3138d7dcdee98c39eae33d7.png?size=240&passthrough=true",
    "discordId": "1352694406507139236"
  },
  "nitro-the-petal-pack": {
    "id": "nitro-the-petal-pack",
    "name": "The petal pack",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_ab95c78401ce4ec85c25a6d308db9d85.png?size=240&passthrough=true",
    "discordId": "1352694485968224357"
  },
  "nitro-the-anomaly": {
    "id": "nitro-the-anomaly",
    "name": "The Anomaly",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_af5ee420e5f860ff2cdbb5fa4633f2cf.png?size=240&passthrough=true",
    "discordId": "1352694765300219986"
  },
  "nitro-cypher-neural-theft": {
    "id": "nitro-cypher-neural-theft",
    "name": "cypher Neural Theft",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_b1efe77f379c6c9c6e47e6b6299d5a7d.png?size=240&passthrough=true",
    "discordId": "1352694791770476544"
  },
  "nitro-devil": {
    "id": "nitro-devil",
    "name": "Devil",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_b4dcf63b6af2e20cba91af61c0e3a8a7.png?size=240&passthrough=true",
    "discordId": "1352694867980980306"
  },
  "nitro-shocked": {
    "id": "nitro-shocked",
    "name": "shocked",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_b98e8b204d59882fb7f9f7c86922c0bf.png?size=240&passthrough=true",
    "discordId": "1352694908854468739"
  },
  "nitro-mooncaps": {
    "id": "nitro-mooncaps",
    "name": "Mooncaps",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_b13180be7866281f6fa588a49dd7feb0.png?size=240&passthrough=true",
    "discordId": "1352694928404385876"
  },
  "nitro-helmsman": {
    "id": "nitro-helmsman",
    "name": "Helmsman",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_b98093bb7723235a4cd2792762795640.png?size=240&passthrough=true",
    "discordId": "1352694972104572958"
  },
  "nitro-cozy-headphones": {
    "id": "nitro-cozy-headphones",
    "name": "cozy Headphones",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_bb71042ccd2ca277a69f086a4f3354d0.png?size=240&passthrough=true",
    "discordId": "1352695043420459172"
  },
  "nitro-fall-leaves-143": {
    "id": "nitro-fall-leaves-143",
    "name": "Fall Leaves",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_bc63175fe462d8748b68ea5179249418.png?size=160&passthrough=true",
    "discordId": "1352696581907943577"
  },
  "nitro-kitsune": {
    "id": "nitro-kitsune",
    "name": "Kitsune",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_be111e4303d634c55500202a61656e0b.png?size=240&passthrough=true",
    "discordId": "1352696607715360902"
  },
  "nitro-brass-beats": {
    "id": "nitro-brass-beats",
    "name": "Brass beats",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_bfaeda83edb41e78250eedc71bed31fc.png?size=240&passthrough=true",
    "discordId": "1352696804558373021"
  },
  "nitro-soul-leaving-body": {
    "id": "nitro-soul-leaving-body",
    "name": "soul Leaving Body",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c3c09bd122898be35093d0d59850f627.png?size=240&passthrough=true",
    "discordId": "1352696831217369209"
  },
  "nitro-cat-ears": {
    "id": "nitro-cat-ears",
    "name": "cat Ears",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c3cffc19e9784f7d0b005eecdf1b566e.png?size=240&passthrough=true",
    "discordId": "1352696854491693117"
  },
  "nitro-aradiating-energy": {
    "id": "nitro-aradiating-energy",
    "name": "ARadiating Energy",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c7e1751e8122f1b475cb3006966fb28c.png?size=240&passthrough=true",
    "discordId": "1352696975203762186"
  },
  "nitro-wizard-hat": {
    "id": "nitro-wizard-hat",
    "name": "Wizard Hat",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c25b962e5cabb9a656f02c50095d6496.png?size=240&passthrough=true",
    "discordId": "1352697057424707665"
  },
  "nitro-shuriken-s-mark": {
    "id": "nitro-shuriken-s-mark",
    "name": "shuriken's mark",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c32ce5680d4be96e059790ad493aa0fe.png?size=240&passthrough=true",
    "discordId": "1352697077485797480"
  },
  "nitro-omen-s-cowl": {
    "id": "nitro-omen-s-cowl",
    "name": "omen's cowl",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c45abe8c7585fdb41b8d8d4d666f1588.png?size=240&passthrough=true",
    "discordId": "1352697154413662371"
  },
  "nitro-autumn-crown": {
    "id": "nitro-autumn-crown",
    "name": "Autumn crown",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_c509c4760e5e1a50fa341d68f3c1901b.png?size=240&passthrough=true",
    "discordId": "1352697251914317835"
  },
  "nitro-digital-sunrise": {
    "id": "nitro-digital-sunrise",
    "name": "Digital Sunrise",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_cc83efd93ecd6e41857449c3c0ef9b22.png?size=240&passthrough=true",
    "discordId": "1352697387529015310"
  },
  "nitro-golden-hex": {
    "id": "nitro-golden-hex",
    "name": "Golden Hex",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_ccee9031d66bc0f2d7ed0c6178d01784.png?size=240&passthrough=true",
    "discordId": "1352697419321839847"
  },
  "nitro-e-d-hacker": {
    "id": "nitro-e-d-hacker",
    "name": "E.D Hacker",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_cdca4a092a03b16b94e50289fe3f7bd1.png?size=160&passthrough=true",
    "discordId": "1352697445313806449"
  },
  "nitro-malefic-crown": {
    "id": "nitro-malefic-crown",
    "name": "Malefic Crown",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d1ea7b8650bf3d64a03304c2ceb7d089.png?size=240&passthrough=true",
    "discordId": "1352697497419780278"
  },
  "nitro-magical-wand": {
    "id": "nitro-magical-wand",
    "name": "Magical Wand",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d3a9c3a1c89ccb0e1ab8724a5c965f48.png?size=240&passthrough=true",
    "discordId": "1352697518995144714"
  },
  "nitro-disxcore-headset": {
    "id": "nitro-disxcore-headset",
    "name": "DISXCORE Headset",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d3da36040163ee0f9176dfe7ced45cdc.png?size=240&passthrough=true",
    "discordId": "1352697535453724744"
  },
  "nitro-flux-alchemy": {
    "id": "nitro-flux-alchemy",
    "name": "Flux Alchemy",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d8d93c7a53c0dd07a4074b745210434d.png?size=240&passthrough=true",
    "discordId": "1352697562724827166"
  },
  "nitro-glowing-runes": {
    "id": "nitro-glowing-runes",
    "name": "Glowing Runes",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d650e22f6c4bab4fc0969e9d35edbcb0.png?size=240&passthrough=true",
    "discordId": "1352697583205613610"
  },
  "nitro-snake-s-hug": {
    "id": "nitro-snake-s-hug",
    "name": "Snake's Hug",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d859cee893cffd5dd0fa17a6caea44e0.png?size=240&passthrough=true",
    "discordId": "1352697616067985539"
  },
  "nitro-starry-eyed": {
    "id": "nitro-starry-eyed",
    "name": "Starry Eyed",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_d72066b8cecbadd9fc951913ebcc384f.png?size=240&passthrough=true",
    "discordId": "1352697629829628077"
  },
  "nitro-yoru-bundle": {
    "id": "nitro-yoru-bundle",
    "name": "Yoru Bundle",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_da532f804b47f1681006c2996eb07b2a.png?size=240&passthrough=true",
    "discordId": "1352697650029400134"
  },
  "nitro-wizard-s-staff": {
    "id": "nitro-wizard-s-staff",
    "name": "Wizard's Staff",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_db9baf0ba7cf449d2b027c06309dbe8d.png?size=240&passthrough=true",
    "discordId": "1352697675367317564"
  },
  "nitro-the-hexcore": {
    "id": "nitro-the-hexcore",
    "name": "The Hexcore",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_dbb1abd90367c1a31a94f7e162f3a3c3.png?size=240&passthrough=true",
    "discordId": "1352697694774366228"
  },
  "nitro-juri": {
    "id": "nitro-juri",
    "name": "Juri",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_dcfe10bac4a782ffb5eefef7a8003115.png?size=240&passthrough=true",
    "discordId": "1352697712050442331"
  },
  "nitro-rumbling": {
    "id": "nitro-rumbling",
    "name": "Rumbling",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_df5442048d7d5b8b8906f3a9cd93f0ab.png?size=240&passthrough=true",
    "discordId": "1352697728097845382"
  },
  "nitro-mix-string-light-bundle": {
    "id": "nitro-mix-string-light-bundle",
    "name": "Mix string Light bundle",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_dff769a0f922bb56ab0d4ba2bcbacfae.png?size=160&passthrough=true",
    "discordId": "1352697747807145994"
  },
  "nitro-sakura-scholar": {
    "id": "nitro-sakura-scholar",
    "name": "Sakura scholar",
    "category": "anime",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e0a2df84cf7eb8e098a13e37ec9027c1.png?size=240&passthrough=true",
    "discordId": "1352697764852535377"
  },
  "nitro-rainy-mood": {
    "id": "nitro-rainy-mood",
    "name": "Rainy Mood",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e8c11f139e55dac538cdaafb3caa2317.png?size=240&passthrough=true",
    "discordId": "1352697789502587005"
  },
  "nitro-aim-for-love": {
    "id": "nitro-aim-for-love",
    "name": "Aim For Love",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e60cc4d7f4d8a6e79dd8cc67d2b13d6c.png?size=240&passthrough=true",
    "discordId": "1352697809866063984"
  },
  "nitro-clyde-invaders": {
    "id": "nitro-clyde-invaders",
    "name": "Clyde invaders",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e72e44eeea89e92dc02c9bec8b02d158.png?size=240&passthrough=true",
    "discordId": "1352697831517065247"
  },
  "nitro-glitch": {
    "id": "nitro-glitch",
    "name": "Glitch",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e90ebc0114e7bdc30353c8b11953ea41.png?size=240&passthrough=true",
    "discordId": "1352697856972292126"
  },
  "nitro-uwu-xp": {
    "id": "nitro-uwu-xp",
    "name": "UwU XP",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e257ca83b5b164968fd036f69dbb2ad9.png?size=240&passthrough=true",
    "discordId": "1352697872679829636"
  },
  "nitro-cozy-post-it": {
    "id": "nitro-cozy-post-it",
    "name": "Cozy POST-IT",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_e671277ab6d18c0de00871347eed94a7.png?size=240&passthrough=true",
    "discordId": "1352697894125441114"
  },
  "nitro-eldritch-ring": {
    "id": "nitro-eldritch-ring",
    "name": "Eldritch Ring",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_ef6fe8b27123eacccebe51c92a61587c.png?size=240&passthrough=true",
    "discordId": "1352697946075959401"
  },
  "nitro-aracanist-bundle": {
    "id": "nitro-aracanist-bundle",
    "name": "Aracanist Bundle",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_ef8d97374ffdbf140df1164be6c69e46.png?size=240&passthrough=true",
    "discordId": "1352697965634130036"
  },
  "nitro-starlight-whales": {
    "id": "nitro-starlight-whales",
    "name": "Starlight Whales",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_efe3081ee3359a77b515575b5f7bc8c0.png?size=240&passthrough=true",
    "discordId": "1352697985758265397"
  },
  "nitro-timekeeper-s-clock": {
    "id": "nitro-timekeeper-s-clock",
    "name": "Timekeeper's Clock",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f1c60c026aa89971e360ba88643d92c0.png?size=240&passthrough=true",
    "discordId": "1352698006889168916"
  },
  "nitro-ki-energy": {
    "id": "nitro-ki-energy",
    "name": "Ki Energy",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f3af281c65cf0cf590e9e1f59e9c6cf6.png?size=240&passthrough=true",
    "discordId": "1352698022596710462"
  },
  "nitro-port-of-soul": {
    "id": "nitro-port-of-soul",
    "name": "Port of Soul",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f4fcdab859b2eab1874fbe7182d5aa26.png?size=240&passthrough=true",
    "discordId": "1352698039193567346"
  },
  "nitro-azure-dice-roll-bundle": {
    "id": "nitro-azure-dice-roll-bundle",
    "name": "Azure Dice Roll Bundle",
    "category": "gaming",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f8ffeba6f389d1475c8794ca88b59785.png?size=160&passthrough=true",
    "discordId": "1352698064510386300"
  },
  "nitro-feelin-panic": {
    "id": "nitro-feelin-panic",
    "name": "Feelin' Panic",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f11c214394044d001d81c983dcab354f.png?size=240&passthrough=true",
    "discordId": "1352698086086021162"
  },
  "nitro-a-sphere-of-gusting-wind-swirls-around-the-avatar": {
    "id": "nitro-a-sphere-of-gusting-wind-swirls-around-the-avatar",
    "name": "A sphere of gusting wind swirls around the avatar.",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f081c6b2c85c5ebe5df42f1c24d45bb5.png?size=240&passthrough=true",
    "discordId": "1352699002910408835"
  },
  "nitro-bunny-zzzs": {
    "id": "nitro-bunny-zzzs",
    "name": "Bunny Zzzs",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f438bb9b2f25ac55058fc169ecc8096e.png?size=240&passthrough=true",
    "discordId": "1352699027686297663"
  },
  "nitro-ken": {
    "id": "nitro-ken",
    "name": "Ken",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f524554b7f42a214d15c226c344a5357.png?size=240&passthrough=true",
    "discordId": "1352699041737080902"
  },
  "nitro-oasis": {
    "id": "nitro-oasis",
    "name": "Oasis",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_f740031cc97d1b7eb73c0d0ac1dd09f3.png?size=240&passthrough=true",
    "discordId": "1352699058581540967"
  },
  "nitro-cat-ear-headset": {
    "id": "nitro-cat-ear-headset",
    "name": "Cat Ear Headset",
    "category": "cute",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fa39ba4d9eff38d2eeb47ebcb623e4ca.png?size=240&passthrough=true",
    "discordId": "1352699090789601291"
  },
  "nitro-earht": {
    "id": "nitro-earht",
    "name": "Earht",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fa014594d4b2b4249e1098c0adc85b47.png?size=240&passthrough=true",
    "discordId": "1352699125149208626"
  },
  "nitro-gold-laurel-wreath": {
    "id": "nitro-gold-laurel-wreath",
    "name": "Gold Laurel Wreath",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fcb0de14da228879b455f1f1d3919749.png?size=240&passthrough=true",
    "discordId": "1352699175698960556"
  },
  "nitro-fairy-pixie-bundle": {
    "id": "nitro-fairy-pixie-bundle",
    "name": "Fairy & Pixie Bundle",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fe3c76cac2adf426832a7e495e8329d3.png?size=160&passthrough=true",
    "discordId": "1352699197501214732"
  },
  "nitro-death-s-edge": {
    "id": "nitro-death-s-edge",
    "name": "Death's Edge",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fe63036018fefb8abe3172383497e3bf.png?size=240&passthrough=true",
    "discordId": "1352699217994321951"
  },
  "nitro-autumn-s-arbor": {
    "id": "nitro-autumn-s-arbor",
    "name": "Autumn's Arbor",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fead934c894e95e070d8a0301f9f0b27.png?size=240&passthrough=true",
    "discordId": "1352699238735413403"
  },
  "nitro-futuristic-ui": {
    "id": "nitro-futuristic-ui",
    "name": "Futuristic UI",
    "category": "effects",
    "url": "https://cdn.discordapp.com/avatar-decoration-presets/a_fed43ab12698df65902ba06727e20c0e.png?size=240&passthrough=true",
    "discordId": "1352699261078474864"
  },
  "nitro-libya": {
    "id": "nitro-libya",
    "name": "Libya",
    "category": "flags",
    "url": "https://i.ibb.co/VJ7q2FV/ezgif-7-a2ecd1b7f9.png",
    "discordId": "Libya"
  },
  "nitro-algeria": {
    "id": "nitro-algeria",
    "name": "Algeria",
    "category": "flags",
    "url": "https://i.ibb.co/C7Zdqnp/ezgif-1-148d3d8ea9.png",
    "discordId": "Algeria"
  },
  "nitro-bahrain": {
    "id": "nitro-bahrain",
    "name": "Bahrain",
    "category": "flags",
    "url": "https://i.ibb.co/Dr5gMvn/ezgif-1-bf03b81f9d.png",
    "discordId": "Bahrain"
  },
  "nitro-comoros": {
    "id": "nitro-comoros",
    "name": "Comoros",
    "category": "flags",
    "url": "https://i.ibb.co/9nqKx3b/ezgif-1-f0b73c7a9f.png",
    "discordId": "Comoros"
  },
  "nitro-tunisia": {
    "id": "nitro-tunisia",
    "name": "Tunisia",
    "category": "flags",
    "url": "https://i.ibb.co/Ksqq6d7/ezgif-7-727033509f.png",
    "discordId": "Tunisia"
  },
  "nitro-uae": {
    "id": "nitro-uae",
    "name": "UAE",
    "category": "flags",
    "url": "https://i.ibb.co/mSRswm8/ezgif-7-637d28d3db.png",
    "discordId": "UAE"
  },
  "nitro-somalia": {
    "id": "nitro-somalia",
    "name": "Somalia",
    "category": "flags",
    "url": "https://i.ibb.co/Sn84j7t/ezgif-7-0f127c7b46.png",
    "discordId": "Somalia"
  },
  "nitro-sudan": {
    "id": "nitro-sudan",
    "name": "Sudan",
    "category": "flags",
    "url": "https://i.ibb.co/TLTD2Jk/ezgif-7-b07f2e63fe.png",
    "discordId": "Sudan"
  },
  "nitro-syria": {
    "id": "nitro-syria",
    "name": "Syria",
    "category": "flags",
    "url": "https://i.ibb.co/dQvcZQp/ezgif-7-369d86d58c.png",
    "discordId": "Syria"
  },
  "nitro-yemen": {
    "id": "nitro-yemen",
    "name": "Yemen",
    "category": "flags",
    "url": "https://i.ibb.co/kDF5G5v/ezgif-7-ea2030a439.png",
    "discordId": "Yemen"
  },
  "nitro-overlay": {
    "id": "nitro-overlay",
    "name": "Overlay",
    "category": "flags",
    "url": "https://i.ibb.co/hZD0mmM/ezgif-7-699c07f6f4.png",
    "discordId": "Overlay"
  },
  "nitro-palestine": {
    "id": "nitro-palestine",
    "name": "Palestine",
    "category": "flags",
    "url": "https://i.ibb.co/w6b12fc/ezgif-7-5217c6ff98.png",
    "discordId": "Palestine"
  },
  "nitro-qatar": {
    "id": "nitro-qatar",
    "name": "Qatar",
    "category": "flags",
    "url": "https://i.ibb.co/xs2Lktj/ezgif-7-44263314da.png",
    "discordId": "Qatar"
  },
  "nitro-saudi": {
    "id": "nitro-saudi",
    "name": "Saudi",
    "category": "flags",
    "url": "https://i.ibb.co/rGYFpWw/ezgif-7-8da0a9f5eb.png",
    "discordId": "Saudi"
  },
  "nitro-jordan": {
    "id": "nitro-jordan",
    "name": "Jordan",
    "category": "flags",
    "url": "https://i.ibb.co/hyBBCB7/ezgif-7-df80ea6e6e.png",
    "discordId": "Jordan"
  },
  "nitro-kuwait": {
    "id": "nitro-kuwait",
    "name": "Kuwait",
    "category": "flags",
    "url": "https://i.ibb.co/y58DkH5/ezgif-7-af7e8c28ab.png",
    "discordId": "Kuwait"
  },
  "nitro-lebanon": {
    "id": "nitro-lebanon",
    "name": "Lebanon",
    "category": "flags",
    "url": "https://i.ibb.co/LPYNzGG/ezgif-7-d9dc5b4cc6.png",
    "discordId": "Lebanon"
  },
  "nitro-mauritania": {
    "id": "nitro-mauritania",
    "name": "Mauritania",
    "category": "flags",
    "url": "https://i.ibb.co/8mZKC19/ezgif-7-f78d395b85.png",
    "discordId": "Mauritania"
  },
  "nitro-morocco": {
    "id": "nitro-morocco",
    "name": "Morocco",
    "category": "flags",
    "url": "https://i.ibb.co/kSdbdCn/ezgif-7-f3b2fab832.png",
    "discordId": "Morocco"
  },
  "nitro-djibouti": {
    "id": "nitro-djibouti",
    "name": "Djibouti",
    "category": "flags",
    "url": "https://i.ibb.co/cQFNw8G/ezgif-1-92158fd061.png",
    "discordId": "Djibouti"
  },
  "nitro-egypt": {
    "id": "nitro-egypt",
    "name": "Egypt",
    "category": "flags",
    "url": "https://i.ibb.co/hs9GjBp/ezgif-7-f21e193074.png",
    "discordId": "Egypt"
  },
  "nitro-iraq": {
    "id": "nitro-iraq",
    "name": "iraq",
    "category": "flags",
    "url": "https://i.ibb.co/Q6CLZyM/ezgif-7-126237475a.png",
    "discordId": "iraq"
  }
};

  const LEGACY_ALIASES = {
  "nitro-sakura": "nitro-sakura-warrior",
  "nitro-cyber": "nitro-cyber-katana",
  "nitro-flames": "nitro-flaming-sword",
  "nitro-arcade": "nitro-arcade",
  "nitro-boba": "nitro-bubble-tea",
  "nitro-kitsune": "nitro-fox-hat",
  "nitro-alchemist": "nitro-magical-potion",
  "nitro-cursed": "nitro-crossbones",
  "nitro-snowflake": "nitro-snowglobe",
  "nitro-lotus": "nitro-lotus-flower"
};

  function normalizeDiscordFrameKey(rawKey) {
    if (!rawKey || rawKey === 'none' || rawKey === 'frame-none') return 'none';
    if (DISCORD_NITRO_FRAMES[rawKey]) return rawKey;
    if (LEGACY_ALIASES[rawKey] && DISCORD_NITRO_FRAMES[LEGACY_ALIASES[rawKey]]) return LEGACY_ALIASES[rawKey];
    
    // Check if key is raw discordId or slug
    for (const k in DISCORD_NITRO_FRAMES) {
      if (DISCORD_NITRO_FRAMES[k].discordId === rawKey) return k;
    }
    return 'none';
  }

  function applyAvatarFrame(target, frameKey) {
    const normalizedKey = normalizeDiscordFrameKey(frameKey);
    const frameData = DISCORD_NITRO_FRAMES[normalizedKey];

    let overlayEl = null;
    let wrapperEl = null;

    if (typeof target === 'string') {
      target = document.getElementById(target);
    }

    if (target) {
      if (target.id === 'navUserAvatar' || target.id === 'navAvatarWrapper') {
        overlayEl = document.getElementById('navAvatarDecoration');
        wrapperEl = document.getElementById('navAvatarWrapper');
      } else if (target.id === 'userAvatar' || target.id === 'userAvatarRing') {
        overlayEl = document.getElementById('profileAvatarDecoration');
        wrapperEl = document.getElementById('userAvatarRing');
      } else if (target.classList && target.classList.contains('avatar-decoration-overlay')) {
        overlayEl = target;
        wrapperEl = target.parentElement;
      } else if (target.classList && target.classList.contains('avatar-decoration-wrapper')) {
        wrapperEl = target;
        overlayEl = target.querySelector('.avatar-decoration-overlay');
      } else {
        wrapperEl = target.closest ? target.closest('.avatar-decoration-wrapper') : target.parentElement;
        if (wrapperEl) {
          overlayEl = wrapperEl.querySelector('.avatar-decoration-overlay');
        }
      }
    }

    if (overlayEl) {
      if (!frameData || normalizedKey === 'none' || !frameData.url) {
        overlayEl.innerHTML = '';
        overlayEl.className = 'avatar-decoration-overlay';
        if (wrapperEl) {
          wrapperEl.classList.remove('has-nitro-decoration');
        }
      } else {
        overlayEl.innerHTML = '<img src="' + frameData.url + '" class="nitro-decoration-img" alt="' + (frameData.name || 'Discord Nitro') + '" loading="lazy">';
        overlayEl.className = 'avatar-decoration-overlay has-active-decoration';
        if (wrapperEl) {
          wrapperEl.classList.add('has-nitro-decoration');
        }
      }
    }
  }

  window.CURRENT_NITRO_CATEGORY = 'all';
  window.CURRENT_NITRO_SEARCH = '';

  function renderDiscordNitroFramesGrid(activeFilter, searchQuery) {
    if (activeFilter !== undefined) window.CURRENT_NITRO_CATEGORY = activeFilter;
    if (searchQuery !== undefined) window.CURRENT_NITRO_SEARCH = searchQuery;

    const cat = window.CURRENT_NITRO_CATEGORY || 'all';
    const query = (window.CURRENT_NITRO_SEARCH || '').trim().toLowerCase();

    const grid = document.getElementById('profileFrameSelectorGrid');
    if (!grid) return;

    const currentKey = normalizeDiscordFrameKey(window.currentProfileFrame || 'none');
    const allFrames = Object.values(DISCORD_NITRO_FRAMES);

    const filtered = allFrames.filter(f => {
      if (f.id === 'none') return true;
      if (cat !== 'all' && f.category !== cat) return false;
      if (query && !f.name.toLowerCase().includes(query)) return false;
      return true;
    });

    const countBadge = document.getElementById('nitroFrameCountBadge');
    if (countBadge) {
      countBadge.textContent = filtered.length + ' / ' + (allFrames.length - 1);
    }

    grid.innerHTML = filtered.map(f => {
      const isSelected = f.id === currentKey;
      const previewContent = (f.id === 'none' || !f.url)
        ? '<div class="nitro-none-circle"><i class="fa-solid fa-ban"></i></div>'
        : '<img src="' + f.url + '" class="nitro-card-decor-img" alt="' + f.name + '" loading="lazy">';

      return (
        '<div class="nitro-frame-card ' + (isSelected ? 'active' : '') + '" data-frame="' + f.id + '" title="' + f.name + '" onclick="selectProfileFrame(\'' + f.id + '\')">' +
          '<div class="nitro-card-preview-wrap">' +
            '<div class="nitro-card-avatar-base">' +
              '<i class="fa-solid fa-user nitro-card-dummy-icon"></i>' +
            '</div>' +
            '<div class="nitro-card-decor-layer">' +
              previewContent +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function filterNitroFrames(category) {
    document.querySelectorAll('.nitro-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
    });
    renderDiscordNitroFramesGrid(category, window.CURRENT_NITRO_SEARCH);
  }

  function searchNitroFrames(query) {
    renderDiscordNitroFramesGrid(window.CURRENT_NITRO_CATEGORY, query);
  }

  function selectProfileFrame(frameKey) {
    const normalizedKey = normalizeDiscordFrameKey(frameKey);
    window.currentProfileFrame = normalizedKey;

    const ringEl = document.getElementById('userAvatarRing');
    applyAvatarFrame(ringEl, normalizedKey);

    const frameData = DISCORD_NITRO_FRAMES[normalizedKey];
    const badge = document.getElementById('nitroSelectedNameBadge');
    if (badge) {
      badge.textContent = frameData ? frameData.name : 'ไม่มีกรอบ';
    }

    document.querySelectorAll('.nitro-frame-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-frame') === normalizedKey);
    });
  }

  // Export to global window object
  window.DISCORD_NITRO_FRAMES = DISCORD_NITRO_FRAMES;
  window.normalizeDiscordFrameKey = normalizeDiscordFrameKey;
  window.applyAvatarFrame = applyAvatarFrame;
  window.renderDiscordNitroFramesGrid = renderDiscordNitroFramesGrid;
  window.filterNitroFrames = filterNitroFrames;
  window.searchNitroFrames = searchNitroFrames;
  window.selectProfileFrame = selectProfileFrame;

})();
