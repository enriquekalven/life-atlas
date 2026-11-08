import type { AnimalRecord, AnatomyHotspot } from '../types/atlas';
import type { LanguageCode } from '../i18n';

export interface SpeciesLocalizedEntry {
  name: string;
  narration: string;
}

export const SPECIES_LOCALIZED_NARRATIONS: Record<
  string,
  Record<LanguageCode, SpeciesLocalizedEntry>
> = {
  'african-bush-elephant': {
    en: {
      name: 'African Bush Elephant',
      narration:
        'African Bush Elephant, scientific name Loxodonta africana. The largest living land animal on Earth, weighing up to ten metric tons. Its prehensile trunk contains over forty thousand muscles, and its massive vascularized ears radiate excess body heat across the African savanna.',
    },
    es: {
      name: 'Elefante Africano de Sabana',
      narration:
        'Elefante africano de sabana, nombre científico Loxodonta africana. Es el animal terrestre vivo más grande de la Tierra, con un peso de hasta diez toneladas métricas. Su trompa prensil contiene más de cuarenta mil músculos y sus enormes orejas vascularizadas disipan el calor en la sabana africana.',
    },
    zh: {
      name: '非洲草原象',
      narration:
        '非洲草原象。它是地球上现存最大的陆地动物，体重可达十公吨。它灵活的象鼻拥有超过四万块肌肉，巨大的血管化耳朵能在非洲大草原上散发多余的体温。',
    },
    yue: {
      name: '非洲草原象',
      narration:
        '非洲草原象。佢係地球上現存最大型嘅陸地動物，體重可以去到十公噸。佢靈活嘅象鼻入面有超過四萬組肌肉，而巨大嘅耳朵就可以幫助散熱。',
    },
    ja: {
      name: 'アフリカゾウ',
      narration:
        'アフリカゾウ、学名ロクソドンタ・アフリカーナ。地球上で最大の現生陸上動物で、体重は最大10トンに達します。器用な鼻には4万以上の筋肉があり、大きな耳の血管網でサバンナの暑さから体温を逃がします。',
    },
    ko: {
      name: '아프리카코끼리',
      narration:
        '아프리카코끼리, 학명 록소돈타 아프리키나. 지구상에서 가장 큰 현존 육상 동물로 몸무게가 최대 10톤에 달합니다. 정교한 코에는 4만 개 이상의 근육이 있으며, 거대한 귀의 혈관으로 체열을 식힙니다.',
    },
    pt: {
      name: 'Elefante-da-savana',
      narration:
        'Elefante-da-savana, nome científico Loxodonta africana. O maior animal terrestre vivo da Terra, pesando até dez toneladas. Sua tromba preênsil contém mais de quarenta mil músculos, e suas grandes orelhas vascularizadas dissipam o calor na savana africana.',
    },
    fr: {
      name: 'Éléphant de savane d’Afrique',
      narration:
        'Éléphant de savane d’Afrique, nom scientifique Loxodonta africana. Le plus grand animal terrestre vivant sur Terre, pesant jusqu’à dix tonnes. Sa trompe préhensile compte plus de quarante mille muscles et ses grandes oreilles vascularisées dissipent la chaleur.',
    },
    it: {
      name: 'Elefante africano di savana',
      narration:
        'Elefante africano di savana, nome scientifico Loxodonta africana. Il più grande animale terrestre vivente, con un peso fino a dieci tonnellate. La sua proboscide prensile contiene oltre quarantamila muscoli e le grandi orecchie disperdono il calore.',
    },
    de: {
      name: 'Afrikanischer Steppenelefant',
      narration:
        'Afrikanischer Steppenelefant, wissenschaftlicher Name Loxodonta africana. Das größte lebende Landtier der Erde mit einem Gewicht von bis zu zehn Tonnen. Sein Greifrüssel enthält über vierzigtausend Muskeln, und seine großen Ohren leiten Körperwärme ab.',
    },
    ar: {
      name: 'فيل الأدغال الأفريقي',
      narration:
        'فيل الأدغال الأفريقي، الاسم العلمي لوكسودونتا أفريكانا. أكبر حيوان بري حي على وجه الأرض، ويصل وزنه إلى عشرة أطنان. يحتوي خرطومه القابض على أكثر من أربعين ألف عضلة، وتساعد أذناه الكبيرتان على تبريد جسمه.',
    },
  },
  'blue-whale': {
    en: {
      name: 'Antarctic Blue Whale',
      narration:
        'Antarctic Blue Whale, scientific name Balaenoptera musculus. Reaching thirty meters in length and nearly two hundred tons, it is the largest animal ever known to have lived. Its car-sized four-chambered heart pumps blood through aorta vessels wide enough for a child to crawl through.',
    },
    es: {
      name: 'Ballena Azul Antártica',
      narration:
        'Ballena azul antártica, nombre científico Balaenoptera musculus. Con treinta metros de longitud y casi doscientas toneladas, es el animal más grande que jamás haya existido. Su corazón del tamaño de un automóvil impulsa sangre por arterias gigantescas.',
    },
    zh: {
      name: '南极蓝鲸',
      narration:
        '南极蓝鲸。体长可达三十米，重达近两百吨，是地球历史上已知最大的动物。它那堪比小汽车大小的四腔心脏通过宽阔的主动脉为全身供血。',
    },
    yue: {
      name: '南極藍鯨',
      narration:
        '南極藍鯨。身長去到三十米，重達差唔多兩百噸，係地球歷史上最大型嘅動物。佢個心臟好似架私家車咁大，透過粗大嘅主動脈泵血去全身。',
    },
    ja: {
      name: 'シロナガスクジラ',
      narration:
        'シロナガスクジラ、学名バラエノプテラ・ムスクルス。体長30メートル、体重約200トンに達する地球史上最大の動物です。小型車ほどの大きさの心臓が、巨大な大動脈を通じて全身に血液を送り出します。',
    },
    ko: {
      name: '대왕고래',
      narration:
        '대왕고래, 학명 발라이노프테라 무스쿨루스. 몸길이 30미터, 몸무게 약 200톤에 달하는 지구 역사상 가장 거대한 동물입니다. 자동차 크기의 심장이 거대한 대동맥을 통해 온몸으로 혈액을 뿜어냅니다.',
    },
    pt: {
      name: 'Baleia-azul Antártica',
      narration:
        'Baleia-azul antártica, nome científico Balaenoptera musculus. Alcançando trinta metros de comprimento e quase duzentas toneladas, é o maior animal que já viveu na Terra. Seu coração do tamanho de um carro bombeia sangue por vasos gigantescos.',
    },
    fr: {
      name: 'Baleine bleue antarctique',
      narration:
        'Baleine bleue antarctique, nom scientifique Balaenoptera musculus. Atteignant trente mètres de long et près de deux cents tonnes, c’est le plus grand animal ayant jamais vécu. Son cœur de la taille d’une voiture propulse le sang dans d’immenses artères.',
    },
    it: {
      name: 'Balenottera azzurra antartica',
      narration:
        'Balenottera azzurra antartica, nome scientifico Balaenoptera musculus. Con trenta metri di lunghezza e quasi duecento tonnellate, è il più grande animale mai esistito. Il suo cuore grande come un’auto pompa il sangue attraverso arterie gigantesche.',
    },
    de: {
      name: 'Antarktischer Blauwal',
      narration:
        'Antarktischer Blauwal, wissenschaftlicher Name Balaenoptera musculus. Mit dreißig Metern Länge und fast zweihundert Tonnen Gewicht ist er das größte Tier der Erdgeschichte. Sein autogroßes Herz pumpt Blut durch riesige Aortagefäße.',
    },
    ar: {
      name: 'الحوت الأزرق القطبي',
      narration:
        'الحوت الأزرق القطبي، الاسم العلمي بالينوبتيرا موسكولوس. يصل طوله إلى ثلاثين متراً ووزنه إلى قرابة مئتي طن، وهو أضخم كائن حي معروف في تاريخ الأرض، وله قلب بحجم سيارة صغيرة.',
    },
  },
  'siberian-tiger': {
    en: {
      name: 'Siberian Tiger',
      narration:
        'Siberian Amur Tiger, scientific name Panthera tigris altaica. An apex felid predator built for explosive ambush across snowy boreal forests. Its unique black stripes act as disruptive camouflage, while retractable claws and a thousand-pound bite force subdue large prey.',
    },
    es: {
      name: 'Tigre Siberiano',
      narration:
        'Tigre siberiano de Amur, nombre científico Panthera tigris altaica. Un depredador felino ápice diseñado para emboscadas explosivas en los bosques boreales nevados. Sus rayas únicas funcionan como camuflaje disruptivo y posee garras retráctiles letales.',
    },
    zh: {
      name: '西伯利亚虎（东北虎）',
      narration:
        '西伯利亚虎，又称东北虎。它是雪域针叶林中的顶级猫科掠食者。独一无二的黑色条纹如同指纹般提供破坏性伪装，可伸缩利爪与强大的咬合力能瞬间制服大型猎物。',
    },
    yue: {
      name: '西伯利亞虎（東北虎）',
      narration:
        '西伯利亞虎，又叫東北虎。佢係雪林入面嘅頂級貓科獵食者。獨特嘅黑色條紋可以提供完美偽裝，配合埋伸縮利爪同驚人咬合力。',
    },
    ja: {
      name: 'シベリアトラ（アムールトラ）',
      narration:
        'シベリアトラ、学名パンテーラ・ティグリス・アルタイカ。雪深い北方林で爆発的な待ち伏せ狩りを行う頂点捕食者です。固有の縞模様がカモフラージュとなり、出し入れ可能な鉤爪と強力な咬合力を備えています。',
    },
    ko: {
      name: '시베리아호랑이 (아무르호랑이)',
      narration:
        '시베리아호랑이, 학명 판테라 티그리스 알타이카. 눈 덮인 북방 숲에서 폭발적인 매복 사냥을 하는 최상위 포식자입니다. 고유한 줄무늬는 위장 효과를 주며 접이식 발톱과 강력한 치악력을 지녔습니다.',
    },
    pt: {
      name: 'Tigre-siberiano',
      narration:
        'Tigre-siberiano de Amur, nome científico Panthera tigris altaica. Um predador felino de topo adaptado para emboscadas explosivas em florestas boreais nevadas. Suas listras únicas oferecem camuflagem disruptiva e garras retráteis poderosas.',
    },
    fr: {
      name: 'Tigre de Sibérie',
      narration:
        'Tigre de Sibérie, nom scientifique Panthera tigris altaica. Un superprédateur félin conçu pour des embuscades explosives dans la taïga enneigée. Ses rayures uniques servent de camouflage disruptif et ses griffes rétractiles sont redoutables.',
    },
    it: {
      name: 'Tigre siberiana',
      narration:
        'Tigre siberiana dell’Amur, nome scientifico Panthera tigris altaica. Un predatore felino all’apice, costruito per agguati esplosivi nelle foreste boreali innevate, dotato di strisce mimetiche uniche e artigli retrattili.',
    },
    de: {
      name: 'Sibirischer Tiger',
      narration:
        'Sibirischer Tiger, wissenschaftlicher Name Panthera tigris altaica. Ein Spitzenprädator der verschneiten Taiga, ausgestattet mit einzigartigen Tarnstreifen, einziehbaren Krallen und enormer Beißkraft.',
    },
    ar: {
      name: 'الببر السيبيري',
      narration:
        'الببر السيبيري، الاسم العلمي بانثيرا تيغريس ألتيكا. مفترس قمة من السنوريات مهيأ للكمائن السريعة في الغابات الثلجية، يتميز بخطوطه الفريدة ومخالبه القابلة للسحب وقوة عضته الهائلة.',
    },
  },
  'polar-bear': {
    en: {
      name: 'Polar Bear',
      narration:
        'Polar Bear, scientific name Ursus maritimus. The supreme hypercarnivore of the Arctic sea ice. Its translucent hollow guard hairs scatter light to appear snow-white while trapping warmth over black skin and a ten-centimeter layer of insulating blubber.',
    },
    es: {
      name: 'Oso Polar',
      narration:
        'Oso polar, nombre científico Ursus maritimus. El gran carnívoro del hielo marino ártico. Sus pelos huecos translúcidos reflejan la luz luciendo blancos como la nieve y retienen el calor sobre su piel negra y una gruesa capa de grasa.',
    },
    zh: {
      name: '北极熊',
      narration:
        '北极熊。北极海冰上的顶级肉食动物。它半透明的中空护毛通过散射光线呈现出雪白色，配合黑色皮肤与十厘米厚的脂肪层抵御严寒。',
    },
    yue: {
      name: '北極熊',
      narration:
        '北極熊。北極海冰上面嘅頂級捕食者。佢半透明嘅中空毛髮折射光線顯得雪白，入面係黑色皮膚同十厘米厚嘅保暖脂肪。',
    },
    ja: {
      name: 'ホッキョクグマ',
      narration:
        'ホッキョクグマ、学名ウルスス・マリティムス。北極の海氷に君臨する最大の肉食獣です。中空で透明な毛が光を散乱させて白く見え、黒い皮膚と厚さ10センチの脂肪層で極寒に耐えます。',
    },
    ko: {
      name: '북극곰',
      narration:
        '북극곰, 학명 우르수스 마리티무스. 북극 해빙의 최상위 육식동물입니다. 속이 빈 반투명 털이 빛을 산란시켜 하얗게 보이며, 검은 피부와 10센티미터 두께의 지방층으로 체온을 유지합니다.',
    },
    pt: {
      name: 'Urso-polar',
      narration:
        'Urso-polar, nome científico Ursus maritimus. O grande carnívoro do gelo marinho ártico. Seus pelos ocos translúcidos refletem a luz parecendo brancos, protegendo sua pele negra e uma espessa camada de gordura.',
    },
    fr: {
      name: 'Ours polaire',
      narration:
        'Ours polaire, nom scientifique Ursus maritimus. Le grand carnivore de la banquise arctique. Ses poils creux translucides diffusent la lumière et retiennent la chaleur sur sa peau noire et une épaisse couche de graisse.',
    },
    it: {
      name: 'Orso polare',
      narration:
        'Orso polare, nome scientifico Ursus maritimus. Il grande carnivoro dei ghiacci artici. I suoi peli cavi traslucidi riflettono la luce e trattengono il calore sopra la pelle nera e uno spesso strato di grasso.',
    },
    de: {
      name: 'Eisbär',
      narration:
        'Eisbär, wissenschaftlicher Name Ursus maritimus. Der Spitzenjäger des arktischen Meereises. Seine lichtdurchlässigen Hohlhaare wirken schneeweiß und isolieren zusammen mit schwarzer Haut und einer dicken Fettschicht.',
    },
    ar: {
      name: 'الدب القطبي',
      narration:
        'الدب القطبي، الاسم العلمي أورسوس ماريتيموس. المفترس الأعلى في الجليد البحري القطبي، يتميز بفراء شفاف مجوف يعكس الضوء ليبدو أبيض اللون فوق جلد أسود وطبقة دهنية سميكة للعزل الحراري.',
    },
  },
  'peregrine-falcon': {
    en: {
      name: 'Peregrine Falcon',
      narration:
        'Peregrine Falcon, scientific name Falco peregrinus. The fastest animal on Earth, reaching diving speeds over three hundred eighty kilometers per hour. Conical tubercles inside its nostrils baffle supersonic shockwaves so its lungs can breathe during vertical stoops.',
    },
    es: {
      name: 'Halcón Peregrino',
      narration:
        'Halcón peregrino, nombre científico Falco peregrinus. El animal más veloz de la Tierra, superando los trescientos ochenta kilómetros por hora en picado. Los tubérculos cónicos en sus fosas nasales regulan la presión del aire a alta velocidad.',
    },
    zh: {
      name: '游隼',
      narration:
        '游隼。地球上速度最快的动物，俯冲时速超过三百八十公里。它鼻孔内的锥形骨突能减缓高速气流冲击，使肺部在极速俯冲时仍能顺畅呼吸。',
    },
    yue: {
      name: '遊隼',
      narration:
        '遊隼。地球上速度最快嘅動物，俯衝時速超過三百八十公里。鼻孔入面嘅錐形結構可以減緩高速氣流，令佢喺極速俯衝時都抖到氣。',
    },
    ja: {
      name: 'ハヤブサ',
      narration:
        'ハヤブサ、学名ファルコ・ペレグリヌス。急降下時の時速が380キロを超える地球最速の動物です。鼻孔内の円錐形の突起が空気の衝撃波を和らげ、超高速飛行中の呼吸を可能にします。',
    },
    ko: {
      name: '매 (송골매)',
      narration:
        '송골매, 학명 팔코 페레그리누스. 급강하 속도가 시속 380킬로미터를 넘는 지구상에서 가장 빠른 동물입니다. 콧구멍 안의 원뿔형 돌기가 공기 압력을 조절해 고속 비행 중에도 호흡을 돕습니다.',
    },
    pt: {
      name: 'Falcão-peregrino',
      narration:
        'Falcão-peregrino, nome científico Falco peregrinus. O animal mais rápido da Terra, atingindo mais de trezentos e oitenta quilômetros por hora em mergulho aéreo, com narinas adaptadas para respirar sob pressão extrema.',
    },
    fr: {
      name: 'Faucon pèlerin',
      narration:
        'Faucon pèlerin, nom scientifique Falco peregrinus. L’animal le plus rapide sur Terre, dépassant trois cent quatre-vingts kilomètres par heure en piqué grâce à ses ailes profilées et ses narines à déflecteurs d’air.',
    },
    it: {
      name: 'Falco pellegrino',
      narration:
        'Falco pellegrino, nome scientifico Falco peregrinus. L’animale più veloce della Terra, capace di superare i trecentottanta chilometri orari in picchiata grazie al corpo aerodinamico e ai tubercoli nasali.',
    },
    de: {
      name: 'Wanderfalke',
      narration:
        'Wanderfalke, wissenschaftlicher Name Falco peregrinus. Das schnellste Tier der Erde, das im Sturzflug über dreihundertachtzig Kilometer pro Stunde erreicht. Spezielle Kegel in den Nasenlöchern bremsen den Luftstrom.',
    },
    ar: {
      name: 'الشاهين',
      narration:
        'صقر الشاهين، الاسم العلمي فالكو بيريغرينوس. أسرع كائن حي على وجه الأرض، إذ تتجاوز سرعته أثناء الانقضاض ثلاثمئة وثمانين كيلومتراً في الساعة بفضل أجنحته الانسيابية وتصميم منخريه الفريد.',
    },
  },
  'emperor-penguin': {
    en: {
      name: 'Emperor Penguin',
      narration:
        'Emperor Penguin, scientific name Aptenodytes forsteri. The tallest and deepest-diving penguin, plunging over five hundred meters into freezing Antarctic waters. Solidified bones, oxygen-storing myoglobin, and counter-current heat exchangers keep it thriving at minus forty degrees.',
    },
    es: {
      name: 'Pingüino Emperador',
      narration:
        'Pingüino emperador, nombre científico Aptenodytes forsteri. El pingüino más alto y buceador más profundo, capaz de sumergirse a más de quinientos metros en aguas antárticas heladas gracias a su mioglobina y plumaje aislante.',
    },
    zh: {
      name: '帝企鹅',
      narration:
        '帝企鹅。体型最高、潜水最深的企鹅，能潜入五百米深的南极冰海。致密的骨骼、富含肌红蛋白的肌肉以及逆流热交换血管让它在零下四十度严寒中生存。',
    },
    yue: {
      name: '帝企鵝',
      narration:
        '帝企鵝。體型最高同潛水最深嘅企鵝，可以潛入超過五百米深嘅南極冰海，靠高密度骨骼同保暖羽毛抵禦零下四十度嚴寒。',
    },
    ja: {
      name: 'コウテイペンギン',
      narration:
        'コウテイペンギン、学名アプテノディテス・フォルステリ。最大のペンギンであり、水深500メートル以上の南極海に潜水できます。高密度の骨と酸素を蓄えるミオグロビンで極寒の海を生き抜きます。',
    },
    ko: {
      name: '황제펭귄',
      narration:
        '황제펭귄, 학명 압테노디테스 포르스테리. 가장 크고 깊게 잠수하는 펭귄으로 남극 바다 수심 500미터 이상까지 잠수합니다. 단단한 뼈와 산소를 저장하는 미오글로빈으로 혹한을 견딥니다.',
    },
    pt: {
      name: 'Pinguim-imperador',
      narration:
        'Pinguim-imperador, nome científico Aptenodytes forsteri. O maior pinguim do mundo, capaz de mergulhar a mais de quinhentos metros nas águas geladas da Antártida com ossos densos e plumagem térmica.',
    },
    fr: {
      name: 'Manchot empereur',
      narration:
        'Manchot empereur, nom scientifique Aptenodytes forsteri. Le plus grand des manchots, capable de plonger à plus de cinq cents mètres dans l’océan Austral grâce à ses os denses et ses réserves de myoglobine.',
    },
    it: {
      name: 'Pinguino imperatore',
      narration:
        'Pinguino imperatore, nome scientifico Aptenodytes forsteri. Il più grande dei pinguini, capace di immergersi oltre i cinquecento metri nelle acque gelide dell’Antartide.',
    },
    de: {
      name: 'Kaiserpinguin',
      narration:
        'Kaiserpinguin, wissenschaftlicher Name Aptenodytes forsteri. Der größte Pinguin der Erde, der über fünfhundert Meter tief in das eiskalte Südpolarmeer taucht.',
    },
    ar: {
      name: 'البطريق الإمبراطور',
      narration:
        'البطريق الإمبراطور، الاسم العلمي أبتينوديتس فورستري. أطول البطاريق وأعمقها غوصاً، إذ يغوص لأكثر من خمسمئة متر في مياه القارة القطبية الجنوبية المتجمدة.',
    },
  },
  'saltwater-crocodile': {
    en: {
      name: 'Saltwater Crocodile',
      narration:
        'Saltwater Crocodile, scientific name Crocodylus porosus. The largest living reptile, armed with bony dorsal osteoderms and the strongest measured bite force of any living animal. A unique four-chambered heart with a foramen of Panizza lets it shunt blood away from its lungs underwater.',
    },
    es: {
      name: 'Cocodrilo de Agua Salada',
      narration:
        'Cocodrilo de agua salada, nombre científico Crocodylus porosus. El reptil vivo más grande, protegido por osteodermos óseos y dotado de la mordida más potente del reino animal actual.',
    },
    zh: {
      name: '湾鳄（咸水鳄）',
      narration:
        '湾鳄，又称咸水鳄。现存最大的爬行动物，背部覆盖骨质皮内成骨装甲，拥有现存动物中最强的实测咬合力，特殊的四腔心脏使其能长时间潜伏水下。',
    },
    yue: {
      name: '灣鱷（鹹水鱷）',
      narration:
        '灣鱷，又叫鹹水鱷。現存最大型嘅爬行動物，背脊有堅硬嘅骨板裝甲，仲擁有現存動物入面最強勁嘅咬合力。',
    },
    ja: {
      name: 'イリエワニ',
      narration:
        'イリエワニ、学名クロコディルス・ポロサス。現生最大の爬虫類で、背中の骨質板と現生動物で最強の咬合力を持っています。特殊な4心房心室の心臓により長時間の潜水が可能です。',
    },
    ko: {
      name: '바다악어',
      narration:
        '바다악어, 학명 크로코딜루스 포로수스. 현존하는 가장 큰 파충류로 등 쪽의 골판 갑옷과 현존 동물 중 가장 강력한 치악력을 지니고 있습니다.',
    },
    pt: {
      name: 'Crocodilo-de-água-salgada',
      narration:
        'Crocodilo-de-água-salgada, nome científico Crocodylus porosus. O maior réptil vivo, protegido por osteodermos ósseos e dotado da mordida mais forte entre os animais atuais.',
    },
    fr: {
      name: 'Crocodile marin',
      narration:
        'Crocodile marin, nom scientifique Crocodylus porosus. Le plus grand reptile vivant, protégé par des ostéodermes osseux et doté de la morsure la plus puissante du règne animal actuel.',
    },
    it: {
      name: 'Coccodrillo marino',
      narration:
        'Coccodrillo marino, nome scientifico Crocodylus porosus. Il più grande rettile vivente, corazzato da osteodermi ossei e dotato della forza di morso più potente tra gli animali attuali.',
    },
    de: {
      name: 'Leistenkrokodil',
      narration:
        'Leistenkrokodil, wissenschaftlicher Name Crocodylus porosus. Das größte lebende Reptil, gepanzert mit Knochenplatten und ausgestattet mit der stärksten gemessenen Beißkraft aller heutigen Tiere.',
    },
    ar: {
      name: 'تمساح المياه المالحة',
      narration:
        'تمساح المياه المالحة، الاسم العلمي كروكوديلوس بوروسوس. أكبر الزواحف الحية حجماً، يتميز بدرع عظمي ظهري وبأقوى عضة مسجلة بين الحيوانات الحية.',
    },
  },
  'golden-poison-frog': {
    en: {
      name: 'Golden Poison Dart Frog',
      narration:
        'Golden Poison Dart Frog, scientific name Phyllobates terribilis. Though only five centimeters long, its bright aposematic skin secretes batrachotoxin alkaloid sequestered from rainforest beetles and ants, making it one of the most toxic vertebrates on Earth.',
    },
    es: {
      name: 'Rana Dardo Dorada',
      narration:
        'Rana dardo venenosa dorada, nombre científico Phyllobates terribilis. Con solo cinco centímetros, su brillante piel aposemática secreta batracotoxina obtenida de su dieta de insectos amazónicos.',
    },
    zh: {
      name: '金色箭毒蛙',
      narration:
        '金色箭毒蛙。虽然体长仅五厘米，但它鲜艳的警戒色皮肤能分泌从雨林昆虫食物中富集的蛙毒素，是地球上毒性最强的脊椎动物之一。',
    },
    yue: {
      name: '金色箭毒蛙',
      narration:
        '金色箭毒蛙。雖然身長得五厘米，但佢鮮豔嘅皮膚會分泌由雨林昆蟲食物入面提煉出嚟嘅劇毒生物鹼。',
    },
    ja: {
      name: 'モウドクフキヤガエル',
      narration:
        'モウドクフキヤガエル、学名フィロバテス・テリビリス。体長わずか5センチながら、食べる昆虫からバトラコトキシンを蓄積し、鮮やかな警戒色を持つ地球上で最も有毒な脊椎動物の一つです。',
    },
    ko: {
      name: '황금독화살개구리',
      narration:
        '황금독화살개구리, 학명 필로바테스 테리빌리스. 몸길이는 5센티미터에 불과하지만 먹이 곤충에서 얻은 바트라코톡신을 피부에 축적하는 매우 강력한 독성 양서류입니다.',
    },
    pt: {
      name: 'Sapo-dourado-venenoso',
      narration:
        'Sapo-dourado-venenoso, nome científico Phyllobates terribilis. Com apenas cinco centímetros, sua pele brilhante secreta batracotoxina acumulada a partir de insetos da floresta tropical.',
    },
    fr: {
      name: 'Kokoï de Colombie',
      narration:
        'Kokoï de Colombie, nom scientifique Phyllobates terribilis. Bien que mesurant seulement cinq centimètres, sa peau jaune vif sécrète de la batrachotoxine issue de son alimentation d’insectes.',
    },
    it: {
      name: 'Rana freccia dorata',
      narration:
        'Rana freccia dorata, nome scientifico Phyllobates terribilis. Lunga solo cinque centimetri, la sua pelle dorata secerne batracotossina accumulata dagli insetti della foresta pluviale.',
    },
    de: {
      name: 'Schrecklicher Pfeilgiftfrosch',
      narration:
        'Schrecklicher Pfeilgiftfrosch, wissenschaftlicher Name Phyllobates terribilis. Nur fünf Zentimeter groß, sondert seine leuchtend gelbe Haut Batrachotoxin ab, das er aus Regenwaldinsekten gewinnt.',
    },
    ar: {
      name: 'ضفدع السهام السام الذهبي',
      narration:
        'ضفدع السهام السام الذهبي، الاسم العلمي فيلوباتس تيريبيليس. رغم صغر حجمه، يفرز جلده الأصفر التحذيري سم الباتراكوتوكسين المستخلص من الحشرات الاستوائية.',
    },
  },
  'great-white-shark': {
    en: {
      name: 'Great White Shark',
      narration:
        'Great White Shark, scientific name Carcharodon carcharias. An apex marine predator with a cartilaginous skeleton, serrated conveyor-belt teeth, and electroreceptive Ampullae of Lorenzini that detect the faint bioelectric heartbeats of prey.',
    },
    es: {
      name: 'Gran Tiburón Blanco',
      narration:
        'Gran tiburón blanco, nombre científico Carcharodon carcharias. Un depredador marino ápice con esqueleto cartilaginoso, dientes aserrados renovables y ampollas de Lorenzini que detectan campos bioeléctricos.',
    },
    zh: {
      name: '大白鲨',
      narration:
        '大白鲨。海洋顶级掠食者，拥有轻盈坚韧的软骨骨骼、不断替换的锯齿状牙齿，以及吻部能感应猎物微弱生物电场的劳伦氏壶腹。',
    },
    yue: {
      name: '大白鯊',
      narration:
        '大白鯊。海洋入面嘅頂級捕食者，擁有軟骨骨骼、不斷替換嘅鋸齒狀牙齒，同埋可以感應獵物微弱生物電嘅勞倫氏壺腹。',
    },
    ja: {
      name: 'ホホジロザメ',
      narration:
        'ホホジロザメ、学名カルカロドン・カルカリアス。軟骨の骨格と次々に生え変わるノコギリ状の歯を持ち、鼻先のロレンチーニ瓶で獲物の微弱な生体電流を感知する海の頂点捕食者です。',
    },
    ko: {
      name: '백상아리',
      narration:
        '백상아리, 학명 카르카로돈 카르카리아스. 연골 골격과 끊임없이 교체되는 톱니 모양 이빨, 먹이의 미세한 생체 전기를 감지하는 로렌치니 기관을 가진 해양 최상위 포식자입니다.',
    },
    pt: {
      name: 'Tubarão-branco',
      narration:
        'Tubarão-branco, nome científico Carcharodon carcharias. Um predador marinho de topo com esqueleto cartilaginoso, dentes serrilhados renováveis e ampolas de Lorenzini eletudorrecetoras.',
    },
    fr: {
      name: 'Grand requin blanc',
      narration:
        'Grand requin blanc, nom scientifique Carcharodon carcharias. Un superprédateur marin au squelette cartilagineux, doté de dents crénelées renouvelables et d’ampoules de Lorenzini électroréceptrices.',
    },
    it: {
      name: 'Grande squalo bianco',
      narration:
        'Grande squalo bianco, nome scientifico Carcharodon carcharias. Predatore marino all’apice con scheletro cartilagineo, denti seghettati a ricambio continuo e ampolle di Lorenzini elettrorecettrici.',
    },
    de: {
      name: 'Weißer Hai',
      narration:
        'Weißer Hai, wissenschaftlicher Name Carcharodon carcharias. Ein maritimer Spitzenprädator mit Knorpelskelett, nachwachsenden Sägezähnen und Elektrorezeptoren, den Lorenzinischen Ampullen.',
    },
    ar: {
      name: 'القرش الأبيض الكبير',
      narration:
        'القرش الأبيض الكبير، الاسم العلمي كاركارودون كاركارياس. مفترس بحري قمة يمتلك هيكلاً غضروفياً وأسناناً مسننة متجددة ومستقبلات كهربائية تكشف نبضات الفرائس.',
    },
  },
  'giant-pacific-octopus': {
    en: {
      name: 'Giant Pacific Octopus',
      narration:
        'Giant Pacific Octopus, scientific name Enteroctopus dofleini. The largest cephalopod species, equipped with three hearts, copper-based blue hemocyanin blood, nine neural centers distributed across its eight arms, and chromatophores for instant camouflage.',
    },
    es: {
      name: 'Pulpo Gigante del Pacífico',
      narration:
        'Pulpo gigante del Pacífico, nombre científico Enteroctopus dofleini. El cefalópodo más grande, dotado de tres corazones, sangre azul con hemocianina, neuronas distribuidas en sus ocho brazos y cromatóforos para camuflaje instantáneo.',
    },
    zh: {
      name: '北太平洋巨型章鱼',
      narration:
        '北太平洋巨型章鱼。体型最大的章鱼，拥有三颗心脏、富含铜离子的蓝色血蓝蛋白血液、分布在八条腕足中的神经节，以及能瞬间变色伪装的色素细胞。',
    },
    yue: {
      name: '北太平洋巨型章魚',
      narration:
        '北太平洋巨型章魚。體型最大嘅章魚，有三個心臟、藍色嘅血液，同埋分佈喺八隻觸手入面嘅神經系統，可以瞬間變色偽裝。',
    },
    ja: {
      name: 'ミズダコ',
      narration:
        'ミズダコ、学名エンテロクトプス・ドフレイニ。世界最大のタコで、3つの心臓と銅を含む青い血液を持ち、8本の腕に分散した神経系と色素胞で瞬時にカモフラージュします。',
    },
    ko: {
      name: '대왕문어',
      narration:
        '대왕문어, 학명 엔테로크토푸스 도플레이니. 세계에서 가장 큰 문어로 3개의 심장과 푸른색 혈액, 여덟 개의 다리에 분산된 신경계, 순식간에 위장하는 색소포를 지녔습니다.',
    },
    pt: {
      name: 'Polvo-gigante-do-pacífico',
      narration:
        'Polvo-gigante-do-pacífico, nome científico Enteroctopus dofleini. O maior polvo do mundo, com três corações, sangue azul rico em cobre e cromatóforos para camuflagem instantânea.',
    },
    fr: {
      name: 'Pieuvre géante du Pacifique',
      narration:
        'Pieuvre géante du Pacifique, nom scientifique Enteroctopus dofleini. Le plus grand des octopodes, doté de trois cœurs, de sang bleu à hémocyanine et de chromatophores pour un camouflage instantané.',
    },
    it: {
      name: 'Polpo gigante del Pacifico',
      narration:
        'Polpo gigante del Pacifico, nome scientifico Enteroctopus dofleini. Il più grande ottopode, dotato di tre cuori, sangue blu a base di rame e cromatofori per il mimetismo istantaneo.',
    },
    de: {
      name: 'Pazifischer Riesenkrake',
      narration:
        'Pazifischer Riesenkrake, wissenschaftlicher Name Enteroctopus dofleini. Der größte Krake der Welt mit drei Herzen, blauem Blut auf Kupferbasis und blitzschneller Tarnung durch Chromatophoren.',
    },
    ar: {
      name: 'أخطبوط المحيط الهادئ العملاق',
      narration:
        'أخطبوط المحيط الهادئ العملاق، الاسم العلمي إنتيروكتوبوس دوفليني. أكبر أنواع الأخطبوط، يمتلك ثلاثة قلوب ودماً أزرق غنياً بالنحاس وخلايا صبغية للتمويه الفوري.',
    },
  },
  'peacock-mantis-shrimp': {
    en: {
      name: 'Peacock Mantis Shrimp',
      narration:
        'Peacock Mantis Shrimp, scientific name Odontodactylus scyllarus. Its spring-loaded raptorial clubs strike at the speed of a twenty-two caliber bullet, boiling the surrounding water into imploding cavitation bubbles, while its compound eyes contain sixteen photoreceptor types.',
    },
    es: {
      name: 'Camarón Mantis Pavo Real',
      narration:
        'Camarón mantis pavo real, nombre científico Odontodactylus scyllarus. Sus apéndices raptores golpean a la velocidad de una bala creando burbujas de cavitación, y sus ojos compuestos poseen dieciséis tipos de fotorreceptores.',
    },
    zh: {
      name: '雀尾螳螂虾',
      narration:
        '雀尾螳螂虾。它带弹簧结构的掠肢出击速度堪比点二二口径子弹，能击穿海水产生空化气泡冲击波；其复眼拥有十六种感光细胞，能看到偏振光与紫外线。',
    },
    yue: {
      name: '雀尾螳螂蝦',
      narration:
        '雀尾螳螂蝦。佢嘅捕食前肢出拳速度好似子彈咁快，可以喺水入面產生空化氣泡衝擊波，而複眼仲有十六種感光受體。',
    },
    ja: {
      name: 'モンハナシャコ',
      narration:
        'モンハナシャコ、学名オドントダクティルス・スキラルス。バネ仕掛けの捕脚は銃弾並みの速度で繰り出され、キャビテーション気泡の衝撃波を生みます。複眼には16種類の光受容体があります。',
    },
    ko: {
      name: '공작갯가재',
      narration:
        '공작갯가재, 학명 오돈토닥틸루스 스킬라루스. 용수철 같은 포획 다리로 총알 속도의 펀치를 날려 공동 현상 충격파를 일으키며, 16종의 광수용체를 가진 겹눈을 지녔습니다.',
    },
    pt: {
      name: 'Tamarutaca-pavão',
      narration:
        'Tamarutaca-pavão, nome científico Odontodactylus scyllarus. Seus apêndices golpeiam na velocidade de uma bala criando bolhas de cavitação, e seus olhos compostos possuem dezesseis tipos de fotorreceptores.',
    },
    fr: {
      name: 'Crevette-mante paon',
      narration:
        'Crevette-mante paon, nom scientifique Odontodactylus scyllarus. Ses pattes ravisseuses frappent à la vitesse d’une balle en créant des bulles de cavitation, et ses yeux comptent seize types de photorécepteurs.',
    },
    it: {
      name: 'Canocchia pavone',
      narration:
        'Canocchia pavone, nome scientifico Odontodactylus scyllarus. Le sue appendici colpiscono alla velocità di un proiettile generando bolle di cavitazione, mentre gli occhi composti hanno sedici tipi di fotorecettori.',
    },
    de: {
      name: 'Pfauen-Fangschreckenkrebs',
      narration:
        'Pfauen-Fangschreckenkrebs, wissenschaftlicher Name Odontodactylus scyllarus. Seine Fangbeine schlagen geschossartig zu und erzeugen Kavitationsblasen, während seine Komplexaugen sechzehn Fotorezeptortypen besitzen.',
    },
    ar: {
      name: 'روبيان السرعوف الطاووسي',
      narration:
        'روبيان السرعوف الطاووسي، الاسم العلمي أودونتوداكتيلوس سيلاروس. تضرب أطرافه بسرعة الرصاصة مولدة فقاعات تجويف صدمية، وتمتلك عيناه المركبتان ستة عشر نوعاً من المستقبلات الضوئية.',
    },
  },
  'coelacanth': {
    en: {
      name: 'West Indian Ocean Coelacanth',
      narration:
        'West Indian Ocean Coelacanth, scientific name Latimeria chalumnae. A living lobe-finned fish lineage over four hundred million years old. Its fleshy paired fins contain humerus and femur bones homologous to tetrapod limbs, plus a hinged intracranial joint.',
    },
    es: {
      name: 'Celacanto del Océano Índico',
      narration:
        'Celacanto del océano Índico, nombre científico Latimeria chalumnae. Un pez de aletas lobuladas cuyo linaje supera los cuatrocientos millones de años, con huesos en sus aletas homólogos a las extremidades de los vertebrados terrestres.',
    },
    zh: {
      name: '西印度洋矛尾鱼（腔棘鱼）',
      narration:
        '西印度洋矛尾鱼，又称腔棘鱼。延续超过四亿年的肉鳍鱼活化石，其肉质偶鳍内部具有与陆生四足动物同源的肱骨和股骨，头骨内还有独特的颅内关节。',
    },
    yue: {
      name: '西印度洋腔棘魚',
      narration:
        '西印度洋腔棘魚。延續超過四億年嘅肉鰭魚活化石，佢嘅肉質魚鰭入面有同陸地四足動物同源嘅骨骼結構。',
    },
    ja: {
      name: 'シーラカンス',
      narration:
        'シーラカンス、学名ラティメリア・カルムナエ。4億年以上前の姿を保つ肉鰭類の生きた化石です。肉質のヒレの内部には陸上脊椎動物の四肢と相同な骨が備わっています。',
    },
    ko: {
      name: '실러캔스',
      narration:
        '실러캔스, 학명 라티메리아 칼룸나이. 4억 년 이상 이어져 온 총기어류 살아있는 화석으로, 육질 지느러미 안에 육상 사지동물의 팔다리 뼈와 상동인 골격 구조를 가지고 있습니다.',
    },
    pt: {
      name: 'Celacanto',
      narration:
        'Celacanto do Oceano Índico, nome científico Latimeria chalumnae. Um peixe de nadadeiras lobadas com mais de quatrocentos milhões de anos de história evolutiva, elo vivo com os vertebrados terrestres.',
    },
    fr: {
      name: 'Cœlacanthe',
      narration:
        'Cœlacanthe de l’océan Indien, nom scientifique Latimeria chalumnae. Un poisson à nageoires charnues vieux de plus de quatre cents millions d’années, dont les os des nageoires préfigurent les membres des tétrapodes.',
    },
    it: {
      name: 'Celacanto',
      narration:
        'Celacanto dell’Oceano Indiano, nome scientifico Latimeria chalumnae. Un pesce dalle pinne lobate antico di oltre quattrocento milioni di anni, con ossa interne omologhe agli arti dei tetrapodi.',
    },
    de: {
      name: 'Quastenflosser',
      narration:
        'Komoren-Quastenflosser, wissenschaftlicher Name Latimeria chalumnae. Ein über vierhundert Millionen Jahre alter Fleischflosser, dessen paarige Flossen Knochen wie die Gliedmaßen der Landwirbeltiere enthalten.',
    },
    ar: {
      name: 'سمكة السيلكانث',
      narration:
        'سمكة السيلكانث، الاسم العلمي لاتيميريا كالومناي. أحفورة حية من الأسماك فصية الزعانف يعود نسبها لأكثر من أربعمئة مليون سنة، وتحتوي زعانفها على عظام تشبه أطراف الرباعيات.',
    },
  },
  'komodo-dragon': {
    en: {
      name: 'Komodo Dragon',
      narration:
        'Komodo Dragon, scientific name Varanus komodoensis. The largest living lizard on Earth. Beneath its scaly skin lies a chainmail mesh of tiny osteoderm bones, while its forked tongue samples airborne scent molecules for its Jacobson’s organ and its lower jaw delivers anticoagulant venom.',
    },
    es: {
      name: 'Dragón de Komodo',
      narration:
        'Dragón de Komodo, nombre científico Varanus komodoensis. El lagarto vivo más grande de la Tierra, protegido por una cota de malla de osteodermos dérmicos y armado con glándulas de veneno anticoagulante en la mandíbula inferior.',
    },
    zh: {
      name: '科莫多巨蜥',
      narration:
        '科莫多巨蜥。地球上现存最大的蜥蜴。它鳞片皮肤下嵌有锁子甲般的细小皮内成骨，分叉的舌头将气味分子送入犁鼻器，下颌毒腺则能分泌抗凝血毒素。',
    },
    yue: {
      name: '科莫多龍（科莫多巨蜥）',
      narration:
        '科莫多巨蜥。地球上現存最大型嘅蜥蜴，皮膚下面有好似鎖子甲咁嘅細小骨板，下顎仲有分泌抗凝血毒素嘅毒腺。',
    },
    ja: {
      name: 'コモドオオトカゲ',
      narration:
        'コモドオオトカゲ、学名ヴァラヌス・コモドエンシス。現生最大のトカゲで、皮膚の下には鎖帷子のような骨質板があり、二股の舌で匂いを感知し、下顎の毒腺から抗凝固毒を分泌します。',
    },
    ko: {
      name: '코모도왕도마뱀',
      narration:
        '코모도왕도마뱀, 학명 바라누스 코모도엔시스. 현존하는 가장 큰 도마뱀으로 피부 아래 사슬갑옷 같은 골편이 박혀 있으며, 아래턱 독샘에서 혈액 응고를 막는 독을 분비합니다.',
    },
    pt: {
      name: 'Dragão-de-komodo',
      narration:
        'Dragão-de-komodo, nome científico Varanus komodoensis. O maior lagarto vivo da Terra, revestido por uma malha de osteodermos sob a pele e glândulas de veneno anticoagulante na mandíbula.',
    },
    fr: {
      name: 'Dragon de Komodo',
      narration:
        'Dragon de Komodo, nom scientifique Varanus komodoensis. Le plus grand lézard vivant, protégé par une cotte de mailles d’ostéodermes sous la peau et doté de glandes à venin anticoagulant.',
    },
    it: {
      name: 'Drago di Komodo',
      narration:
        'Drago di Komodo, nome scientifico Varanus komodoensis. Il più grande sauro vivente, protetto da una maglia di osteodermi dermici e dotato di ghiandole velenifere anticoagulanti.',
    },
    de: {
      name: 'Komodowaran',
      narration:
        'Komodowaran, wissenschaftlicher Name Varanus komodoensis. Die größte lebende Echse der Erde mit einem Kettenhemd aus Hautknochenplatten und blutgerinnungshemmenden Giftdrüsen im Unterkiefer.',
    },
    ar: {
      name: 'تنين كومودو',
      narration:
        'تنين كومودو، الاسم العلمي فارانوس كومودوينسيس. أكبر سحلية حية على الأرض، يمتلك درعاً عظمياً تحت جلده ولساناً مشقوقاً للشم وغدداً تفرز سماً مضاداً لتخثر الدم.',
    },
  },
  'axolotl': {
    en: {
      name: 'Axolotl',
      narration:
        'Axolotl, scientific name Ambystoma mexicanum. A neotenic salamander from Lake Xochimilco that retains its feathery external gills into adulthood. It possesses extraordinary scar-free regenerative biology, able to regrow entire limbs, spinal cord segments, and heart tissue.',
    },
    es: {
      name: 'Ajolote Mexicano',
      narration:
        'Ajolote mexicano, nombre científico Ambystoma mexicanum. Una salamandra neoténica de Xochimilco que conserva sus branquias externas plumosas de por vida y puede regenerar extremidades completas, médula espinal y tejido cardíaco sin cicatrices.',
    },
    zh: {
      name: '美西螈（六角恐龙）',
      narration:
        '美西螈，俗称六角恐龙。原产于墨西哥霍奇米尔科湖的幼态延续两栖动物，终生保留羽状外鳃，拥有惊人的无疤痕再生能力，可再生完整四肢、脊髓甚至心肌组织。',
    },
    yue: {
      name: '美西螈（六角恐龍）',
      narration:
        '美西螈，俗稱六角恐龍。終生保留羽毛狀外鰓嘅兩棲動物，擁有驚人嘅再生能力，可以重新生出完整嘅手腳、脊髓同心臟組織。',
    },
    ja: {
      name: 'ウーパールーパー（メキシコサラマンダー）',
      narration:
        'メキシコサラマンダー、通称ウーパールーパー、学名アンビストマ・メキシカナム。羽毛のような外鰓を一生残す幼形成熟の両生類で、四肢や脊髄、心臓組織まで傷跡なく再生する驚異の能力を持ちます。',
    },
    ko: {
      name: '아홀로틀 (우파루파)',
      narration:
        '아홀로틀, 학명 암비스토마 멕시카눔. 깃털 모양의 외아가미를 평생 유지하는 유형성숙 양서류로, 팔다리와 척수, 심장 조직까지 흉터 없이 재생하는 놀라운 능력을 지녔습니다.',
    },
    pt: {
      name: 'Axolote',
      narration:
        'Axolote mexicano, nome científico Ambystoma mexicanum. Uma salamandra neotênica que mantém suas brânquias externas plumosas na fase adulta e regenera membros inteiros, medula espinhal e tecido cardíaco.',
    },
    fr: {
      name: 'Axolotl',
      narration:
        'Axolotl, nom scientifique Ambystoma mexicanum. Une salamandre néoténique du Mexique qui conserve ses branchies externes plumeuses et peut régénérer ses membres, sa moelle épinière et son cœur sans cicatrice.',
    },
    it: {
      name: 'Axolotl',
      narration:
        'Axolotl, nome scientifico Ambystoma mexicanum. Una salamandra neotenica messicana che conserva le branchie esterne piumose e rigenera arti interi, midollo spinale e tessuto cardiaco.',
    },
    de: {
      name: 'Axolotl',
      narration:
        'Axolotl, wissenschaftlicher Name Ambystoma mexicanum. Ein neotener Schwanzlurch aus Mexiko mit gefiederten Außenkiemen, der ganze Gliedmaßen, Rückenmark und Herzgewebe narbenfrei regenerieren kann.',
    },
    ar: {
      name: 'الأكسولوتل (سمندل المكسيك)',
      narration:
        'الأكسولوتل، الاسم العلمي أمبيستوما مكسيكانوم. برمائي يحتفظ بخياشيمه الخارجية الريشية طوال حياته، ويتميز بقدرة مذهلة على تجديد أطرافه وحبله الشوكي وأنسجة قلبه بالكامل.',
    },
  },
  'archelon-ischyros': {
    en: {
      name: 'Archelon',
      narration:
        'Archelon, scientific name Archelon ischyros. The largest sea turtle ever discovered, swimming across the Late Cretaceous Western Interior Seaway seventy-five million years ago. Over four meters long, it had a leathery skeletal framework carapace and giant oar-like foreflippers.',
    },
    es: {
      name: 'Archelon (Tortuga Marina Gigante)',
      narration:
        'Archelon, nombre científico Archelon ischyros. La tortuga marina más grande jamás descubierta, que habitó los mares del Cretácico superior hace setenta y cinco millones de años, superando los cuatro metros de longitud.',
    },
    zh: {
      name: '帝龟（古巨龟）',
      narration:
        '帝龟。地球历史上已知最大的海龟，生活在七千五百万年前的晚白垩世内陆海道，体长超过四米，背甲由轻量化骨框与革质皮肤构成，前肢演化为巨大的划水桨。',
    },
    yue: {
      name: '帝龜（古巨龜）',
      narration:
        '帝龜。地球歷史上最大型嘅海龜，生活喺七千五百萬年前嘅晚白堊世海洋，身長超過四米，擁有一對好似船槳咁大嘅前鰭。',
    },
    ja: {
      name: 'アーケロン',
      narration:
        'アーケロン、学名アーケロン・イスキロス。約7500万年前の白亜紀後期の海を泳いでいた史上最大のウミガメです。体長は4メートルを超え、軽量化された骨格と皮革質の甲羅を持っていました。',
    },
    ko: {
      name: '아르켈론',
      narration:
        '아르켈론, 학명 아르켈론 이스키로스. 7500만 년 전 백악기 후기 바다를 누볐던 역사상 가장 거대한 바다거북으로, 몸길이가 4미터를 넘고 가죽질 등갑과 거대한 노 모양의 앞지느러미를 가졌습니다.',
    },
    pt: {
      name: 'Archelon (Tartaruga-marinha Gigante)',
      narration:
        'Archelon, nome científico Archelon ischyros. A maior tartaruga marinha já descoberta, nadando nos mares do Cretáceo Superior há setenta e cinco milhões de anos, com mais de quatro metros de comprimento.',
    },
    fr: {
      name: 'Archélon',
      narration:
        'Archélon, nom scientifique Archelon ischyros. La plus grande tortue marine jamais découverte, vivant au Crétacé supérieur il y a soixante-quinze millions d’années et dépassant quatre mètres de long.',
    },
    it: {
      name: 'Archelon',
      narration:
        'Archelon, nome scientifico Archelon ischyros. La più grande tartaruga marina mai scoperta, vissuta nel Cretaceo superiore settantacinque milioni di anni fa, lunga oltre quattro metri.',
    },
    de: {
      name: 'Archelon (Riesen-Meeresschildkröte)',
      narration:
        'Archelon, wissenschaftlicher Name Archelon ischyros. Die größte bekannte Meeresschildkröte der Erdgeschichte aus der späten Kreidezeit vor fünfundsiebzig Millionen Jahren, über vier Meter lang.',
    },
    ar: {
      name: 'أركيلون (السلحفاة البحرية العملاقة)',
      narration:
        'أركيلون، الاسم العلمي أركيلون إسكيروس. أضخم سلحفاة بحرية مكتشفة في التاريخ، عاشت في العصر الطباشيري المتأخر قبل خمسة وسبعين مليون سنة وتجاوز طولها أربعة أمتار.',
    },
  },
  'shonisaurus-popularis': {
    en: {
      name: 'Shonisaurus',
      narration:
        'Shonisaurus, scientific name Shonisaurus popularis. A colossal Late Triassic ichthyosaur reaching fifteen meters in length. Through convergent evolution with dolphins and whales, this marine reptile evolved a streamlined body, four equal-sized flippers, and enormous deep-diving eyes.',
    },
    es: {
      name: 'Shonisaurus (Ictiosaurio Gigante)',
      narration:
        'Shonisaurus, nombre científico Shonisaurus popularis. Un colosal ictiosaurio del Triásico superior de quince metros de longitud, con cuatro aletas simétricas y ojos gigantes para cazar en las profundidades marinas.',
    },
    zh: {
      name: '秀尼鱼龙',
      narration:
        '秀尼鱼龙。生活在晚三叠世的巨型鱼龙，体长可达十五米。作为海洋爬行动物，它通过趋同演化形成了流线型身躯、四枚等长的鳍状肢以及适应深海捕猎的巨眼。',
    },
    yue: {
      name: '秀尼魚龍',
      narration:
        '秀尼魚龍。晚三疊世嘅巨型海洋爬行動物，身長去到十五米，擁有流線型身體、四塊對稱嘅鰭肢同埋深海捕獵用嘅大眼睛。',
    },
    ja: {
      name: 'ショニサウルス',
      narration:
        'ショニサウルス、学名ショニサウルス・ポプラリス。三畳紀後期の海に生息した全長15メートルに達する巨大魚竜です。4枚の長いヒレと深海の暗闇を見通す巨大な目を持っていました。',
    },
    ko: {
      name: '쇼니사우루스',
      narration:
        '쇼니사우루스, 학명 쇼니사우루스 포풀라리스. 트라이아스기 후기에 살았던 몸길이 15미터의 거대 어룡으로, 네 개의 긴 지느러미 다리와 심해 사냥을 위한 거대한 눈을 지녔습니다.',
    },
    pt: {
      name: 'Shonisaurus (Ictiossauro Gigante)',
      narration:
        'Shonisaurus, nome científico Shonisaurus popularis. Um ictiossauro colossal do Triássico Superior com quinze metros de comprimento, quatro nadadeiras alongadas e olhos enormes adaptados às profundezas.',
    },
    fr: {
      name: 'Shonisaurus',
      narration:
        'Shonisaurus, nom scientifique Shonisaurus popularis. Un ichthyosaure colossal du Trias supérieur atteignant quinze mètres de long, doté de quatre grandes palettes natatoires et d’yeux géants.',
    },
    it: {
      name: 'Shonisaurus',
      narration:
        'Shonisaurus, nome scientifico Shonisaurus popularis. Un colossale ittiosauro del Triassico superiore lungo quindici metri, con quattro pinne simmetriche e grandi occhi per la caccia abissale.',
    },
    de: {
      name: 'Shonisaurus (Riesen-Ichthyosaurier)',
      narration:
        'Shonisaurus, wissenschaftlicher Name Shonisaurus popularis. Ein fünfzehn Meter langer Riesen-Ichthyosaurier der späten Trias mit vier gleich großen Flossen und riesigen Tiefseeaugen.',
    },
    ar: {
      name: 'شونيسورس (الإكصور العملاق)',
      narration:
        'شونيسورس، الاسم العلمي شونيسورس بوبيولاريس. زاحف بحري عملاق من العصر الثلاثي المتأخر بلغ طوله خمسة عشر متراً، وتميز بأربع زعانف متناظرة وعيون ضخمة للغوص العميق.',
    },
  },
  'otodus-megalodon': {
    en: {
      name: 'Megalodon',
      narration:
        'Megalodon, scientific name Otodus megalodon. The largest predatory shark in Earth’s history, patrolling Miocene and Pliocene oceans up to sixteen meters long. Its two-meter-wide jaws held over two hundred seventy serrated teeth capable of crushing whale ribs with over one hundred eighty thousand Newtons of force.',
    },
    es: {
      name: 'Megalodón',
      narration:
        'Megalodón, nombre científico Otodus megalodon. El tiburón depredador más grande en la historia de la Tierra, alcanzando dieciséis metros de longitud y una mordida capaz de triturar las costillas de grandes ballenas.',
    },
    zh: {
      name: '巨齿鲨',
      narration:
        '巨齿鲨。地球历史上最庞大的掠食性鲨鱼，体长可达十六米。它两米宽的颌部排列着两百七十多颗手掌大小的锯齿状利齿，咬合力超过十八万牛顿，专门猎食古代鲸类。',
    },
    yue: {
      name: '巨齒鯊',
      narration:
        '巨齒鯊。地球歷史上最大型嘅掠食性鯊魚，身長去到十六米，兩米闊嘅大口入面有超過兩百七十隻手掌咁大嘅鋸齒牙，專門捕食古代鯨魚。',
    },
    ja: {
      name: 'メガロドン',
      narration:
        'メガロドン、学名オトドゥス・メガロドン。全長16メートルに達する地球史上最大の捕食性サメです。幅2メートルの顎に270本以上の巨大なノコギリ歯を備え、古代のクジラを捕食していました。',
    },
    ko: {
      name: '메갈로돈',
      narration:
        '메갈로돈, 학명 오토두스 메갈로돈. 몸길이 16미터에 달했던 지구 역사상 가장 거대한 포식성 상어로, 폭 2미터의 턱과 270여 개의 거대한 톱니 이빨로 고대 고래를 사냥했습니다.',
    },
    pt: {
      name: 'Megalodonte',
      narration:
        'Megalodonte, nome científico Otodus megalodon. O maior tubarão predador da história da Terra, com até dezesseis metros de comprimento e mandíbulas de dois metros capazes de esmagar ossos de baleias.',
    },
    fr: {
      name: 'Mégalodon',
      narration:
        'Mégalodon, nom scientifique Otodus megalodon. Le plus grand requin prédateur de l’histoire de la Terre, atteignant seize mètres de long avec une mâchoire de deux mètres capable de broyer des côtes de baleines.',
    },
    it: {
      name: 'Megalodonte',
      narration:
        'Megalodonte, nome scientifico Otodus megalodon. Il più grande squalo predatore della storia della Terra, lungo fino a sedici metri, con fauci larghe due metri e oltre duecentosettanta denti seghettati.',
    },
    de: {
      name: 'Megalodon',
      narration:
        'Megalodon, wissenschaftlicher Name Otodus megalodon. Der größte Raubhai der Erdgeschichte mit bis zu sechzehn Metern Länge und einem zwei Meter breiten Kiefer, der selbst Walknochen zermalmen konnte.',
    },
    ar: {
      name: 'الميغالودون',
      narration:
        'الميغالودون، الاسم العلمي أوتودوس ميغالودون. أضخم قرش مفترس في تاريخ الأرض، وصل طوله إلى ستة عشر متراً بأسنان مسننة بحجم الكف قادرة على تحطيم عظام الحيتان.',
    },
  },
  'woolly-mammoth': {
    en: {
      name: 'Woolly Mammoth',
      narration:
        'Woolly Mammoth, scientific name Mammuthus primigenius. An Ice Age proboscidean engineered for the freezing mammoth steppe, featuring a meter-long shaggy overcoat, tiny frostbite-resistant ears, cold-adapted hemoglobin, and spiral tusks over three meters long used to sweep snow off tundra grasses.',
    },
    es: {
      name: 'Mamut Lanudo',
      narration:
        'Mamut lanudo, nombre científico Mammuthus primigenius. Un gigante de la Edad de Hielo adaptado a la estepa glacial con pelaje de un metro de largo, orejas pequeñas y enormes colmillos curvados de más de tres metros.',
    },
    zh: {
      name: '猛犸象（长毛猛犸）',
      narration:
        '真猛犸象，又称长毛猛犸。冰河时代的冻原巨兽，身披长达一米的浓密长毛与厚脂肪层，拥有防冻伤的小耳朵、耐寒血红蛋白，以及长达三米多的螺旋长牙用来拨开积雪觅食。',
    },
    yue: {
      name: '長毛象（猛獁象）',
      narration:
        '長毛猛獁象。冰河時期嘅凍原巨獸，全身披住一米長嘅厚毛，仲有一對超過三米長嘅彎曲象牙用嚟撥開積雪搵食。',
    },
    ja: {
      name: 'ケナガマンモス',
      narration:
        'ケナガマンモス、学名マンムトゥス・プリミゲニウス。氷河期のステップに適応した巨獣で、長さ1メートルの長い体毛、凍傷を防ぐ小さな耳、雪をかき分ける3メートル以上の湾曲した牙を持っていました。',
    },
    ko: {
      name: '털매머드',
      narration:
        '털매머드, 학명 맘무투스 프리미게니우스. 빙하기 툰드라 초원에 적응한 거대 코끼리류로, 1미터 길이의 긴 털과 작은 귀, 눈을 파헤쳐 풀을 뜯던 3미터 이상의 휜 상아를 지녔습니다.',
    },
    pt: {
      name: 'Mamute-lanoso',
      narration:
        'Mamute-lanoso, nome científico Mammuthus primigenius. Um gigante da Era do Gelo adaptado à estepe congelada, com pelagem espessa, orelhas pequenas e presas curvas de mais de três metros.',
    },
    fr: {
      name: 'Mammouth laineux',
      narration:
        'Mammouth laineux, nom scientifique Mammuthus primigenius. Géant de l’âge de glace adapté à la steppe glacée, doté d’une épaisse toison, de petites oreilles et de défenses recourbées de plus de trois mètres.',
    },
    it: {
      name: 'Mammut lanoso',
      narration:
        'Mammut lanoso, nome scientifico Mammuthus primigenius. Gigante dell’era glaciale adattato alla steppa dei mammut, con folta pelliccia, piccole orecchie e zanne ricurve lunghe oltre tre metri.',
    },
    de: {
      name: 'Wollhaarmammut',
      narration:
        'Wollhaarmammut, wissenschaftlicher Name Mammuthus primigenius. Ein Eiszeit-Riese der Mammutsteppe mit meterlangem Fell, kleinen Ohren gegen Erfrierungen und über drei Meter langen geschwungenen Stoßzähnen.',
    },
    ar: {
      name: 'الماموث الصوفي',
      narration:
        'الماموث الصوفي، الاسم العلمي ماموثوس بريميجينيوس. عملاق العصر الجليدي المتكيف مع السهوب المتجمدة بفضل فرائه الكثيف الطويل وأنيابه المنحنية التي يتجاوز طولها ثلاثة أمتار.',
    },
  },
  'smilodon-fatalis': {
    en: {
      name: 'Saber-Toothed Cat (Smilodon)',
      narration:
        'Smilodon, scientific name Smilodon fatalis. A muscular Pleistocene machairodont felid armed with twenty-eight-centimeter serrated upper canine blades. Its jaws could gape to an astonishing one hundred twenty degrees while wrestle-pinning bison and ground sloths with bear-like forelimbs.',
    },
    es: {
      name: 'Tigre Dientes de Sable (Smilodon)',
      narration:
        'Smilodon, nombre científico Smilodon fatalis. Un poderoso felino del Pleistoceno armado con caninos superiores aserrados de veintiocho centímetros y extremidades delanteras extremadamente musculosas.',
    },
    zh: {
      name: '致命刃齿虎（剑齿虎）',
      narration:
        '致命刃齿虎，俗称剑齿虎。更新世强壮的剑齿猫科掠食者，拥有二十八厘米长的锯齿状上犬齿，下颌可张开至惊人的一百二十度，并靠熊一般粗壮的前肢制服大型猎物。',
    },
    yue: {
      name: '劍齒虎（致命刃齒虎）',
      narration:
        '劍齒虎。冰河時期強壯嘅掠食者，擁有一對二十八厘米長嘅軍刀狀上犬齒，個口可以擘大到一百二十度，前肢好似熊咁強壯。',
    },
    ja: {
      name: 'スミロドン（サーベルタイガー）',
      narration:
        'スミロドン、学名スミロドン・ファタリス。長さ28センチに達する刃物のような上顎犬歯を持つ更新世の剣歯虎です。顎は120度まで大きく開き、クマのように頑丈な前脚で大型獣を押さえ込みました。',
    },
    ko: {
      name: '스밀로돈 (검치호랑이)',
      narration:
        '스밀로돈, 학명 스밀로돈 파탈리스. 28센티미터 길이의 검 모양 윗송곳니를 지닌 플라이스토세 검치호랑이로, 턱을 120도까지 벌릴 수 있었으며 곰처럼 억센 앞다리로 사냥감을 제압했습니다.',
    },
    pt: {
      name: 'Tigre-dentes-de-sabre (Smilodon)',
      narration:
        'Smilodon, nome científico Smilodon fatalis. Um poderoso felino do Pleistoceno armado com caninos superiores de vinte e oito centímetros e membros anteriores extremamente robustos.',
    },
    fr: {
      name: 'Smilodon (Tigre à dents de sabre)',
      narration:
        'Smilodon, nom scientifique Smilodon fatalis. Puissant félin du Pléistocène armé de canines supérieures en lame de sabre de vingt-huit centimètres et d’une ouverture de mâchoire de cent vingt degrés.',
    },
    it: {
      name: 'Smilodonte (Tigre dai denti a sciabola)',
      narration:
        'Smilodonte, nome scientifico Smilodon fatalis. Potente felino del Pleistocene dotato di canini superiori lunghi ventotto centimetri e arti anteriori massicci per immobilizzare grandi prede.',
    },
    de: {
      name: 'Säbelzahnkatze (Smilodon)',
      narration:
        'Smilodon, wissenschaftlicher Name Smilodon fatalis. Eine kräftige Säbelzahnkatze des Pleistozäns mit achtundzwanzig Zentimeter langen Oberkiefer-Eckzähnen und einem Kieferöffnungswinkel von hundertzwanzig Grad.',
    },
    ar: {
      name: 'سميلودون (النمر سيفيّ الأسنان)',
      narration:
        'سميلودون، الاسم العلمي سميلودون فاتاليس. سنوري عضلي من العصر الجليدي مسلح بأنياب علوية كالسيف بطول ثمانية وعشرين سنتيمتراً وفك ينفتح بزاوية مئة وعشرين درجة.',
    },
  },
  'dunkleosteus-terrelli': {
    en: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, scientific name Dunkleosteus terrelli. An eight-meter Late Devonian armored placoderm fish that ruled the seas three hundred sixty million years ago. Instead of teeth, it had self-sharpening bony gnathal plates powered by a four-bar linkage skull that snapped open in twenty milliseconds.',
    },
    es: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, nombre científico Dunkleosteus terrelli. Un pez placodermo acorazado del Devónico superior de ocho metros de largo, armado con placas óseas autoafilables en lugar de dientes.',
    },
    zh: {
      name: '邓氏鱼',
      narration:
        '邓氏鱼。三亿六千万年前晚泥盆世海洋中的八米级装甲盾皮鱼霸主。它没有普通牙齿，而是演化出自锐式骨质刃片，配合四连杆颅骨机构，能在二十毫秒内张口产生吸力并瞬间咬碎硬壳猎物。',
    },
    yue: {
      name: '鄧氏魚',
      narration:
        '鄧氏魚。三億六千萬年前泥盆紀海洋嘅裝甲盾皮魚霸主，身長八米，用自動磨利嘅骨質刀片代替牙齒，咬合力驚人。',
    },
    ja: {
      name: 'ダンクルオステウス',
      narration:
        'ダンクルオステウス、学名ダンクルオステウス・テレリ。約3億6000万年前のデボン紀後期の海に君臨した体長8メートルの装甲板皮類です。歯の代わりに自己研磨する顎の骨板を持ち、わずか20ミリ秒で口を開いて獲物を噛み砕きました。',
    },
    ko: {
      name: '둔클레오스테우스',
      narration:
        '둔클레오스테우스, 학명 둔클레오스테우스 테렐리. 3억 6천만 년 전 데본기 후기 바다를 지배한 8미터 길이의 갑주어로, 이빨 대신 스스로 날이 서는 턱 골판을 이용해 강력한 힘으로 먹이를 부쉈습니다.',
    },
    pt: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, nome científico Dunkleosteus terrelli. Um peixe placodermo couraçado do Devoniano Superior com oito metros de comprimento e placas ósseas autoafiáveis no lugar de dentes.',
    },
    fr: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, nom scientifique Dunkleosteus terrelli. Un poisson placoderme cuirassé du Dévonien supérieur mesurant huit mètres, doté de lames osseuses auto-aiguisantes à la place des dents.',
    },
    it: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, nome scientifico Dunkleosteus terrelli. Un pesce placoderma corazzato del Devoniano superiore lungo otto metri, armato di piastre ossee autoaffilanti al posto dei denti.',
    },
    de: {
      name: 'Dunkleosteus',
      narration:
        'Dunkleosteus, wissenschaftlicher Name Dunkleosteus terrelli. Ein acht Meter langer gepanzerter Placoderm-Fisch aus dem Oberdevon mit selbstschärfenden Knochenschneiden statt Zähnen.',
    },
    ar: {
      name: 'دنكليوستيوس',
      narration:
        'دنكليوستيوس، الاسم العلمي دنكليوستيوس تيريلي. سمكة مدرعة عملاقة من العصر الديفوني المتأخر بطول ثمانية أمتار، امتلكت صفائح عظمية حادة ذاتية الشحذ بدلاً من الأسنان.',
    },
  },
  'meganeura-monyi': {
    en: {
      name: 'Meganeura',
      narration:
        'Meganeura, scientific name Meganeura monyi. A giant Carboniferous griffinfly with a seventy-centimeter wingspan, fueled by hyper-oxygenated thirty-five percent atmospheric oxygen pushed through thoracic spiracles and tracheal tubes.',
    },
    es: {
      name: 'Meganeura (Libélula Gigante)',
      narration:
        'Meganeura, nombre científico Meganeura monyi. Un insecto gigante del Carbonífero con setenta centímetros de envergadura, impulsado por los altos niveles de oxígeno atmosférico de los bosques hulleros antiguos.',
    },
    zh: {
      name: '巨脉蜻蜓',
      narration:
        '巨脉蜻蜓。生活在三亿年前石炭纪煤系森林中的巨型古蜻蜓，翼展达七十厘米。当时地球大气含氧量高达百分之三十五，通过其胸腹气门与气管系统支撑了庞大的飞行体型。',
    },
    yue: {
      name: '巨脈蜻蜓',
      narration:
        '巨脈蜻蜓。三億年前石炭紀嘅巨型古蜻蜓，翼展去到七十厘米，靠當時高達百分之三十五嘅大氣氧氣濃度支撐龐大體型。',
    },
    ja: {
      name: 'メガネウラ',
      narration:
        'メガネウラ、学名メガネウラ・モニィ。石炭紀の森林を飛んでいた翼開長70センチに達する史上最大級の昆虫です。当時の35パーセントに達する高濃度の酸素が気管系を通じて巨体を支えていました。',
    },
    ko: {
      name: '메가네우라',
      narration:
        '메가네우라, 학명 메가네우라 모니. 석탄기 숲을 날아다녔던 날개폭 70센티미터의 거대 잠자리형 곤충으로, 당시 35퍼센트에 달했던 대기 중 고농도 산소 덕분에 거대한 몸집을 유지했습니다.',
    },
    pt: {
      name: 'Meganeura',
      narration:
        'Meganeura, nome científico Meganeura monyi. Um inseto gigante do Carbonífero com setenta centímetros de envergadura, sustentado pela atmosfera hiperoxigenada das antigas florestas.',
    },
    fr: {
      name: 'Méganeura',
      narration:
        'Méganeura, nom scientifique Meganeura monyi. Un insecte géant du Carbonifère doté d’une envergure de soixante-dix centimètres, rendu possible par une atmosphère riche à trente-cinq pour cent d’oxygène.',
    },
    it: {
      name: 'Meganeura',
      narration:
        'Meganeura, nome scientifico Meganeura monyi. Un insetto gigante del Carbonifero con un’apertura alare di settanta centimetri, favorito dall’atmosfera iperossigenata delle foreste antiche.',
    },
    de: {
      name: 'Meganeura (Riesenlibelle)',
      narration:
        'Meganeura, wissenschaftlicher Name Meganeura monyi. Ein Rieseninsekt aus dem Karbon mit siebzig Zentimetern Flügelspannweite, ermöglicht durch den damals hohen Sauerstoffgehalt der Atmosphäre.',
    },
    ar: {
      name: 'ميغانيورا (اليعسوب العملاق)',
      narration:
        'ميغانيورا، الاسم العلمي ميغانيورا موني. حشرة عملاقة من العصر الكربوني بلغ باع جناحيها سبعين سنتيمتراً بفضل ارتفاع نسبة الأكسجين في الغلاف الجوي القديم.',
    },
  },
  'inostrancevia-alexandri': {
    en: {
      name: 'Inostrancevia',
      narration:
        'Inostrancevia, scientific name Inostrancevia alexandri. The largest gorgonopsid stem-mammal predator of the Late Permian, long before dinosaurs evolved. Over three meters long, this synapsid combined tough leathery proto-mammalian hide with fifteen-centimeter saber fangs.',
    },
    es: {
      name: 'Inostrancevia (Gorgonópsido Gigante)',
      narration:
        'Inostrancevia, nombre científico Inostrancevia alexandri. El mayor depredador gorgonópsido del Pérmico superior, un terápsido pariente temprano de los mamíferos armado con colmillos de sable de quince centímetros.',
    },
    zh: {
      name: '亚历山大伊诺斯特兰采夫兽（巨型丽齿兽）',
      narration:
        '伊诺斯特兰采夫兽，俗称巨型丽齿兽。二叠纪晚期最庞大的合弓纲兽孔目顶级掠食者，在恐龙出现之前便统治陆地。作为早期似哺乳爬行动物，它结合了强韧的革质皮肤与十五厘米长的剑状犬齿。',
    },
    yue: {
      name: '伊諾斯特蘭采夫獸（巨型麗齒獸）',
      narration:
        '伊諾斯特蘭采夫獸。二疊紀晚期最大型嘅麗齒獸類頂級捕食者，係早期似哺乳動物嘅合弓綱巨獸，擁有一對十五厘米長嘅劍齒。',
    },
    ja: {
      name: 'イノストランケヴィア',
      narration:
        'イノストランケヴィア、学名イノストランケヴィア・アレクサンドリ。恐竜が登場する前のペルム紀後期に君臨した全長3メートル以上の最大級のゴルゴノプス類で、哺乳類の遠い親戚にあたる単弓類の頂点捕食者です。',
    },
    ko: {
      name: '이노스트란케비아',
      narration:
        '이노스트란케비아, 학명 이노스트란케비아 알렉산드리. 공룡이 나타나기 전 페름기 후기를 지배했던 몸길이 3미터 이상의 최대급 고르고놉스류 단궁류로, 15센티미터의 검치를 지닌 포유류의 먼 친척입니다.',
    },
    pt: {
      name: 'Inostrancevia',
      narration:
        'Inostrancevia, nome científico Inostrancevia alexandri. O maior predador gorgonopsídeo do Permiano Superior, um sinapsídeo ancestral dos mamíferos com presas de sabre de quinze centímetros.',
    },
    fr: {
      name: 'Inostrancevia',
      narration:
        'Inostrancevia, nom scientifique Inostrancevia alexandri. Le plus grand prédateur gorgonopsien du Permien supérieur, un synapside apparenté aux premiers mammifères doté de canines en sabre.',
    },
    it: {
      name: 'Inostrancevia',
      narration:
        'Inostrancevia, nome scientifico Inostrancevia alexandri. Il più grande predatore gorgonopside del Permiano superiore, un sinapside proto-mammifero lungo oltre tre metri con zanne a sciabola.',
    },
    de: {
      name: 'Inostrancevia (Riesen-Gorgonopside)',
      narration:
        'Inostrancevia, wissenschaftlicher Name Inostrancevia alexandri. Das größte Gorgonopsiden-Raubtier des späten Perm, ein säugetierähnlicher Synapside mit fünfzehn Zentimeter langen Säbelzähnen.',
    },
    ar: {
      name: 'إينوسترانسيفيا',
      narration:
        'إينوسترانسيفيا، الاسم العلمي إينوسترانسيفيا ألكسندري. أضخم مفترس من الغورغونوبسيات في العصر البرمي المتأخر قبل ظهور الديناصورات، وهو مندمج الأقواس قريب من أسلاف الثدييات.',
    },
  },
  'anomalocaris-canadensis': {
    en: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, scientific name Anomalocaris canadensis. Earth’s first apex predator during the Cambrian Explosion five hundred eight million years ago. It swam with undulating lateral flaps, tracked trilobites with twenty-four-thousand-lens stalked compound eyes, and seized prey with segmented frontal appendages.',
    },
    es: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, nombre científico Anomalocaris canadensis. El primer superdepredador de la Tierra durante la Explosión Cámbrica hace quinientos ocho millones de años, con ojos compuestos pedunculados y apéndices frontales articulados.',
    },
    zh: {
      name: '加拿大奇虾',
      narration:
        '加拿大奇虾。五亿零八百万年前寒武纪生命大爆发时期的地球第一代顶级掠食者。它依靠两侧波浪状游泳叶游动，拥有两万四千枚晶状体的柄眼和带刺的节肢前附肢。',
    },
    yue: {
      name: '加拿大奇蝦',
      narration:
        '加拿大奇蝦。五億年前寒武紀大爆發時期嘅地球第一代頂級捕食者，靠身體兩側嘅扇葉游水，用一對帶刺嘅前附肢捕捉獵物。',
    },
    ja: {
      name: 'アノマロカリス',
      narration:
        'アノマロカリス、学名アノマロカリス・カナデンシス。約5億800万年前のカンブリア爆発の海に君臨した地球最初の頂点捕食者です。2万4000個以上のレンズを持つ複眼と節のある前部付属肢を備えていました。',
    },
    ko: {
      name: '아노말로카리스',
      narration:
        '아노말로카리스, 학명 아노말로카리스 카나덴시스. 5억 8백만 년 전 캄브리아기 대폭발 시기 지구의 첫 최상위 포식자로, 물결치는 옆지느러미와 정교한 겹눈, 마디진 앞부속지를 지녔습니다.',
    },
    pt: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, nome científico Anomalocaris canadensis. O primeiro superpredador da Terra durante a Explosão Cambriana há quinhentos e oito milhões de anos, dotado de olhos compostos e apêndices frontais.',
    },
    fr: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, nom scientifique Anomalocaris canadensis. Le tout premier superprédateur de la Terre lors de l’explosion cambrienne il y a cinq cent huit millions d’années, doté d’yeux composés sur pédoncules.',
    },
    it: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, nome scientifico Anomalocaris canadensis. Il primo superpredatore della Terra durante l’esplosione cambriana cinquecentootto milioni di anni fa, dotato di occhi composti e appendici frontali.',
    },
    de: {
      name: 'Anomalocaris',
      narration:
        'Anomalocaris, wissenschaftlicher Name Anomalocaris canadensis. Der erste Spitzenprädator der Erde während der Kambrischen Explosion vor fünfhundertacht Millionen Jahren mit Facettenaugen und Greifarmen.',
    },
    ar: {
      name: 'أنومالوكاريس',
      narration:
        'أنومالوكاريس، الاسم العلمي أنومالوكاريس كانادينسيس. أول مفترس قمة في تاريخ الأرض خلال الانفجار الكامبري قبل خمسمئة وثمانية ملايين سنة، بعيون مركبة وزوائد أمامية مفصلية.',
    },
  },
  'leedsichthys-problematicus': {
    en: {
      name: 'Leedsichthys',
      narration:
        'Leedsichthys, scientific name Leedsichthys problematicus. The largest ray-finned bony fish ever discovered, reaching sixteen meters across Middle Jurassic seas. Like modern whale sharks and baleen whales, this gentle giant filtered vast clouds of zooplankton through delicate gill rakers.',
    },
    es: {
      name: 'Leedsichthys (Pez Gigante del Jurásico)',
      narration:
        'Leedsichthys, nombre científico Leedsichthys problematicus. El pez óseo de aletas radiadas más grande de la historia, alcanzando dieciséis metros en los mares del Jurásico medio como un gigante filtrador de plancton.',
    },
    zh: {
      name: '利兹鱼',
      narration:
        '利兹鱼。地球历史上已知最大的辐鳍硬骨鱼，在中侏罗世海洋中体长可达十六米。如同现代鲸鲨一般，这头温和的巨兽通过精密的鳃耙过滤海水中的浮游生物。',
    },
    yue: {
      name: '利茲魚',
      narration:
        '利茲魚。地球歷史上最大型嘅硬骨魚，喺侏羅紀海洋身長去到十六米，靠精密嘅鰓耙過濾海水入面嘅浮游生物。',
    },
    ja: {
      name: 'リードシクティス',
      narration:
        'リードシクティス、学名リードシクティス・プロブレマティクス。ジュラ紀中期の海を泳いでいた全長16メートルに達する史上最大の条鰭類・硬骨魚です。細かい鰓耙でプランクトンを濾過摂食していました。',
    },
    ko: {
      name: '리드시크티스',
      narration:
        '리드시크티스, 학명 리드시크티스 프로블레마티쿠스. 쥐라기 중기 바다에 살았던 몸길이 16미터의 역사상 가장 거대한 경골어류로, 정교한 아가미갈퀴로 동물성 플랑크톤을 걸러 먹었습니다.',
    },
    pt: {
      name: 'Leedsichthys',
      narration:
        'Leedsichthys, nome científico Leedsichthys problematicus. O maior peixe ósseo da história da Terra, atingindo dezesseis metros nos mares do Jurássico Médio como um gigante filtrador de plâncton.',
    },
    fr: {
      name: 'Leedsichthys',
      narration:
        'Leedsichthys, nom scientifique Leedsichthys problematicus. Le plus grand poisson osseux à nageoires rayonnées jamais découvert, mesurant jusqu’à seize mètres dans les mers du Jurassique moyen.',
    },
    it: {
      name: 'Leedsichthys',
      narration:
        'Leedsichthys, nome scientifico Leedsichthys problematicus. Il più grande pesce osseo mai scoperto, lungo fino a sedici metri nei mari del Giurassico medio, gigante filtratore di plancton.',
    },
    de: {
      name: 'Leedsichthys (Jurassischer Riesenfisch)',
      narration:
        'Leedsichthys, wissenschaftlicher Name Leedsichthys problematicus. Der größte bekannte Knochenfisch der Erdgeschichte, der im mittleren Jura sechzehn Meter Länge erreichte und Plankton filterte.',
    },
    ar: {
      name: 'ليدزيكثيس (سمكة الجوراسي العملاقة)',
      narration:
        'ليدزيكثيس، الاسم العلمي ليدزيكثيس بروبليماتيكوس. أضخم سمكة عظمية معروفة في التاريخ، بلغ طولها ستة عشر متراً في بحار العصر الجوراسي وكانت تتغذى بترشيح العوالق.',
    },
  },
  'sarcosuchus-imperator': {
    en: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, scientific name Sarcosuchus imperator. An eleven-meter Early Cretaceous crocodyliform giant weighing eight metric tons. Its elongated snout ended in a bulbous resonance chamber called a bulla, and interlocking dorsal osteoderms formed continuous body armor.',
    },
    es: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, nombre científico Sarcosuchus imperator. Un gigante cocodriliforme del Cretácico inferior de once metros de longitud y ocho toneladas, con un bulbo resonador en el extremo de su hocico.',
    },
    zh: {
      name: '帝鳄（肌鳄）',
      narration:
        '帝鳄。生活在早白垩世河流中的十一米级巨型鳄形类，体重达八公吨。它修长的吻端具有球状共鸣腔，背部连续嵌合的骨质皮内成骨构成了坚不可摧的背甲。',
    },
    yue: {
      name: '帝鱷',
      narration:
        '帝鱷。早白堊世河流生態系入面嘅巨型鱷形類，身長十一米，重達八公噸，嘴尖有一個球狀共鳴腔，背脊鋪滿堅硬嘅骨板。',
    },
    ja: {
      name: 'サルコスクス（スーパークロック）',
      narration:
        'サルコスクス、学名サルコスクス・インペラトル。白亜紀前期の河川に生息していた全長11メートル、体重8トンの巨大ワニ形類です。吻の先端に球状の膨らみを持ち、強固な装甲板で覆われていました。',
    },
    ko: {
      name: '사르코수쿠스 (슈퍼크록)',
      narration:
        '사르코수쿠스, 학명 사르코수쿠스 임페라토르. 백악기 전기 강가에 살았던 몸길이 11미터, 몸무게 8톤의 거대 악어형 파충류로, 주둥이 끝의 둥근 공명 기관과 단단한 등 갑옷을 지녔습니다.',
    },
    pt: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, nome científico Sarcosuchus imperator. Um crocodiliforme gigante do Cretáceo Inferior com onze metros de comprimento e oito toneladas, protegido por placas ósseas contínuas.',
    },
    fr: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, nom scientifique Sarcosuchus imperator. Un crocodiliforme géant du Crétacé inférieur mesurant onze mètres et pesant huit tonnes, doté d’un museau terminé par une bulle nasale.',
    },
    it: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, nome scientifico Sarcosuchus imperator. Un gigantesco coccodrilliforme del Cretaceo inferiore lungo undici metri e pesante otto tonnellate, corazzato da osteodermi dorsali.',
    },
    de: {
      name: 'Sarcosuchus (SuperCroc)',
      narration:
        'Sarcosuchus, wissenschaftlicher Name Sarcosuchus imperator. Ein elf Meter langes und acht Tonnen schweres Riesen-Krokodil der frühen Kreidezeit mit einer knollenförmigen Schnauzenspitze.',
    },
    ar: {
      name: 'ساركوسوكس (التمساح الإمبراطور)',
      narration:
        'ساركوسوكس، الاسم العلمي ساركوسوكس إمبيراتور. تمساح عملاق من العصر الطباشيري المبكر بلغ طوله أحد عشر متراً ووزنه ثمانية أطنان، وتميزت مقدمة خطمه بانتفاخ صوتي مميز.',
    },
  },
  'basilosaurus-cetoides': {
    en: {
      name: 'Basilosaurus',
      narration:
        'Basilosaurus, scientific name Basilosaurus cetoides. An eighteen-meter Late Eocene archaeocete whale from thirty-eight million years ago. A famous transitional fossil proving whales evolved from land mammals, it retained small external hind legs with ankle bones and toes.',
    },
    es: {
      name: 'Basilosaurus (Ballena Primitiva)',
      narration:
        'Basilosaurus, nombre científico Basilosaurus cetoides. Una ballena primitiva del Eoceno superior de dieciocho metros de largo que aún conservaba pequeñas patas traseras externas, demostrando la evolución de las ballenas desde mamíferos terrestres.',
    },
    zh: {
      name: '龙王鲸',
      narration:
        '龙王鲸。三千八百万年前晚始新世的十八米级古鲸类顶级掠食者。作为鲸类由陆生哺乳动物演化而来的关键过渡化石，它的身体后方仍保留着带有踝骨和脚趾的退化后肢。',
    },
    yue: {
      name: '龍王鯨',
      narration:
        '龍王鯨。三千八百萬年前始新世嘅古鯨魚，身長十八米，身體後面仲保留住細小嘅退化後腿，證明鯨魚係由陸地哺乳動物演化而嚟。',
    },
    ja: {
      name: 'バシロサウルス',
      narration:
        'バシロサウルス、学名バシロサウルス・ケトイデス。約3800万年前の始新世後期の海にいた全長18メートルの古代クジラです。小さな後ろ脚の骨格を残しており、クジラが陸上哺乳類から進化した証拠となっています。',
    },
    ko: {
      name: '바실로사우루스',
      narration:
        '바실로사우루스, 학명 바실로사우루스 케토이데스. 3800만 년 전 에오세 후기에 살았던 몸길이 18미터의 고대 고래로, 발목뼈와 발가락이 있는 작은 뒷다리가 남아 있어 고래의 육상 포유류 기원을 증명합니다.',
    },
    pt: {
      name: 'Basilosaurus',
      narration:
        'Basilosaurus, nome científico Basilosaurus cetoides. Uma baleia primitiva do Eoceno Superior com dezoito metros de comprimento que ainda preservava pequenas patas traseiras vestigiais.',
    },
    fr: {
      name: 'Basilosaurus',
      narration:
        'Basilosaurus, nom scientifique Basilosaurus cetoides. Une baleine primitive de l’Éocène supérieur mesurant dix-huit mètres, célèbre pour ses petits membres postérieurs vestigiaux prouvant l’origine terrestre des cétacés.',
    },
    it: {
      name: 'Basilosaurus',
      narration:
        'Basilosaurus, nome scientifico Basilosaurus cetoides. Una balena primitiva dell’Eocene superiore lunga diciotto metri, dotata di piccoli arti posteriori vestigiali che testimoniano l’evoluzione terrestre dei cetacei.',
    },
    de: {
      name: 'Basilosaurus (Urwal)',
      narration:
        'Basilosaurus, wissenschaftlicher Name Basilosaurus cetoides. Ein achtzehn Meter langer Urwal aus dem späten Eozän, der noch kleine äußere Hinterbeine besaß und die Abstammung der Wale von Landtieren belegt.',
    },
    ar: {
      name: 'باسيلوصورس (الحوت القديم)',
      narration:
        'باسيلوصورس، الاسم العلمي باسيلوصورس سيتويدس. حوت قديم من عصر الإيوسين المتأخر بطول ثمانية عشر متراً، احتفظ بأطراف خلفية صغيرة تثبت تطور الحيتان من ثدييات برية.',
    },
  },
  'homo-sapiens': {
    en: {
      name: 'Human (Homo sapiens)',
      narration:
        'Anatomically Modern Human, scientific name Homo sapiens. Defined by habitual bipedal locomotion, precision opposable thumbs, high-endurance eccrine sweat cooling, and an eighty-six-billion-neuron cerebral cortex capable of complex language, symbolic art, and scientific inquiry.',
    },
    es: {
      name: 'Ser Humano (Homo sapiens)',
      narration:
        'Ser humano anatómicamente moderno, nombre científico Homo sapiens. Caracterizado por su locomoción bípeda erguida, pulgares oponibles de precisión y una corteza cerebral con ochenta y seis mil millones de neuronas capaz de lenguaje complejo y ciencia.',
    },
    zh: {
      name: '现代人类（智人）',
      narration:
        '解剖学意义上的现代人类。以直立双足行走、高精度的对生拇指、高效的全身汗腺散热系统，以及拥有八百六十亿神经元、能够创造复杂语言与科学文明的大脑皮层为特征。',
    },
    yue: {
      name: '現代人類（智人）',
      narration:
        '現代智人。擁有直立雙足行走能力、靈活嘅對生拇指、高效排汗散熱系統，同埋包含八百六十億個神經元嘅高階大腦皮層。',
    },
    ja: {
      name: 'ヒト（ホモ・サピエンス）',
      narration:
        '現生人類、学名ホモ・サピエンス。直立二足歩行、精密な把握を可能にする母指対向性、発汗による高い体温調節能力、そして860億個の神経細胞を持ち言語や科学を生み出す大脳皮質を特徴とします。',
    },
    ko: {
      name: '현생 인류 (호모 사피엔스)',
      narration:
        '해부학적 현생 인류, 학명 호모 사피엔스. 직립 이족보행과 정교한 맞섬 엄지손가락, 땀샘을 통한 체온 조절, 그리고 860억 개의 뉴런으로 언어와 과학 문명을 이룩한 대뇌 피질을 특징으로 합니다.',
    },
    pt: {
      name: 'Ser Humano (Homo sapiens)',
      narration:
        'Ser humano anatomicamente moderno, nome científico Homo sapiens. Definido pela locomoção bípede ereta, polegares opositores de precisão e um córtex cerebral com oitenta e seis bilhões de neurônios.',
    },
    fr: {
      name: 'Être humain (Homo sapiens)',
      narration:
        'Humain anatomiquement moderne, nom scientifique Homo sapiens. Caractérisé par la bipédie permanente, le pouce opposable de précision et un cortex cérébral de quatre-vingt-six milliards de neurones.',
    },
    it: {
      name: 'Essere umano (Homo sapiens)',
      narration:
        'Essere umano anatomicamente moderno, nome scientifico Homo sapiens. Caratterizzato da locomozione bipede eretta, pollice opponibile di precisione e una corteccia cerebrale con ottantasei miliardi di neuroni.',
    },
    de: {
      name: 'Mensch (Homo sapiens)',
      narration:
        'Anatomisch moderner Mensch, wissenschaftlicher Name Homo sapiens. Gekennzeichnet durch aufrechten zweibeinigen Gang, opponierbare Präzisionsdaumen und eine Großhirnrinde mit sechsundachtzig Milliarden Neuronen.',
    },
    ar: {
      name: 'الإنسان العاقل (هومو سابينس)',
      narration:
        'الإنسان الحديث تشريحياً، الاسم العلمي هومو سابينس. يتميز بالمشي المنتصب على قدمين والإبهام المقابل الدقيق وقشرة دماغية تضم ستة وثمانين مليار خلية عصبية.',
    },
  },
};

export const ORGAN_SYSTEM_LABELS: Record<AnatomyHotspot['system'], Record<LanguageCode, string>> = {
  Skeletal: {
    en: 'Skeletal System',
    es: 'Sistema Esquelético',
    zh: '骨骼系统',
    yue: '骨骼系統',
    ja: '骨格系',
    ko: '골격계',
    pt: 'Sistema Esquelético',
    fr: 'Système Squelettique',
    it: 'Sistema Scheletrico',
    de: 'Skelettsystem',
    ar: 'الجهاز الهيكلي',
  },
  Locomotor: {
    en: 'Locomotor & Muscular System',
    es: 'Sistema Locomotor y Muscular',
    zh: '运动与肌肉系统',
    yue: '運動與肌肉系統',
    ja: '運動・筋系',
    ko: '운동 및 근육계',
    pt: 'Sistema Locomotor e Muscular',
    fr: 'Système Locomoteur et Musculaire',
    it: 'Sistema Locomotore e Muscolare',
    de: 'Bewegungs- und Muskelsystem',
    ar: 'الجهاز الحركي والعضلي',
  },
  Cardiovascular: {
    en: 'Cardiovascular System',
    es: 'Sistema Cardiovascular',
    zh: '心血管系统',
    yue: '心血管系統',
    ja: '循環器系',
    ko: '심혈관계',
    pt: 'Sistema Cardiovascular',
    fr: 'Système Cardiovasculaire',
    it: 'Sistema Cardiovascolare',
    de: 'Herz-Kreislauf-System',
    ar: 'الجهاز القلبي الوعائي',
  },
  Respiratory: {
    en: 'Respiratory System',
    es: 'Sistema Respiratorio',
    zh: '呼吸系统',
    yue: '呼吸系統',
    ja: '呼吸器系',
    ko: '호흡기계',
    pt: 'Sistema Respiratório',
    fr: 'Système Respiratoire',
    it: 'Sistema Respiratorio',
    de: 'Atmungssystem',
    ar: 'الجهاز التنفسي',
  },
  'Nervous & Sensory': {
    en: 'Nervous & Sensory System',
    es: 'Sistema Nervioso y Sensorial',
    zh: '神经与感官系统',
    yue: '神經與感官系統',
    ja: '神経・感覚器系',
    ko: '신경 및 감각계',
    pt: 'Sistema Nervoso e Sensorial',
    fr: 'Système Nerveux et Sensoriel',
    it: 'Sistema Nervoso e Sensoriale',
    de: 'Nerven- und Sinnessystem',
    ar: 'الجهاز العصبي والحسي',
  },
  Digestive: {
    en: 'Digestive System',
    es: 'Sistema Digestivo',
    zh: '消化系统',
    yue: '消化系統',
    ja: '消化器系',
    ko: '소화기계',
    pt: 'Sistema Digestivo',
    fr: 'Système Digestif',
    it: 'Sistema Digerente',
    de: 'Verdauungssystem',
    ar: 'الجهاز الهضمي',
  },
  Integumentary: {
    en: 'Integumentary System',
    es: 'Sistema Tegumentario',
    zh: '被皮与外层系统',
    yue: '外皮與毛鱗系統',
    ja: '外皮系',
    ko: '외피계',
    pt: 'Sistema Tegumentar',
    fr: 'Système Tégumentaire',
    it: 'Sistema Tegumentario',
    de: 'Haut- und Integumentsystem',
    ar: 'الجهاز اللحافي والجلدي',
  },
};

export const ORGAN_SYSTEM_DESCRIPTIONS: Record<
  AnatomyHotspot['system'],
  Record<LanguageCode, (speciesName: string, weightStr: string) => string>
> = {
  Skeletal: {
    en: (s, w) =>
      `${s}, Skeletal System. This mineralized framework supports a body mass of ${w}, protecting the brain and vital internal organs while anchoring powerful locomotor tendons.`,
    es: (s, w) =>
      `${s}, Sistema Esquelético. Esta estructura mineralizada sostiene una masa corporal de ${w}, protegiendo el cerebro y los órganos vitales mientras ancla los tendones locomotores.`,
    zh: (s, w) =>
      `${s}，骨骼系统。这一矿化骨骼框架支撑着${w}的体重，保护大脑与重要内脏器官，并为强健的运动肌腱提供稳固支点。`,
    yue: (s, w) =>
      `${s}，骨骼系統。呢個礦化骨骼結構支撐住${w}嘅體重，保護大腦同重要內臟器官，同時為強壯嘅肌腱提供支點。`,
    ja: (s, w) =>
      `${s}、骨格系。この強固な骨格構造は${w}の体重を支え、脳や重要な内臓を保護するとともに、強力な筋肉と腱の支点となります。`,
    ko: (s, w) =>
      `${s}, 골격계. 이 단단한 골격 구조는 ${w}의 체중을 지탱하며 뇌와 주요 장기를 보호하고 강력한 근육과 힘줄을 고정합니다.`,
    pt: (s, w) =>
      `${s}, Sistema Esquelético. Esta estrutura mineralizada sustenta uma massa corporal de ${w}, protegendo o cérebro e os órgãos vitais enquanto ancora os tendões locomotores.`,
    fr: (s, w) =>
      `${s}, Système Squelettique. Cette charpente minéralisée soutient une masse corporelle de ${w}, protégeant le cerveau et les organes vitaux tout en ancrant les tendons moteurs.`,
    it: (s, w) =>
      `${s}, Sistema Scheletrico. Questa struttura mineralizzata sostiene una massa corporea di ${w}, proteggendo il cervello e gli organi vitali e ancorando i tendini locomotori.`,
    de: (s, w) =>
      `${s}, Skelettsystem. Dieses mineralisierte Knochengerüst trägt eine Körpermasse von ${w}, schützt Gehirn sowie lebenswichtige Organe und verankert kräftige Sehnen.`,
    ar: (s, w) =>
      `${s}، الجهاز الهيكلي. يدعم هذا الهيكل العظمي المتين كتلة جسم تبلغ ${w}، ويحمي الدماغ والأعضاء الحيوية ويربط الأوتار العضلية القوية.`,
  },
  Locomotor: {
    en: (s, w) =>
      `${s}, Locomotor and Muscular System. Striated muscle bundles convert metabolic energy into propulsion, propelling a body mass of ${w} through its habitat with high biomechanical efficiency.`,
    es: (s, w) =>
      `${s}, Sistema Locomotor y Muscular. Los haces de músculo estriado convierten la energía metabólica en fuerza mecánica para impulsar una masa de ${w} con gran eficiencia biomecánica.`,
    zh: (s, w) =>
      `${s}，运动与肌肉系统。横纹肌束将代谢能量转化为强大的机械推进力，以极高的生物力学效率驱动重达${w}的身躯。`,
    yue: (s, w) =>
      `${s}，運動與肌肉系統。橫紋肌束將代謝能量轉化為推進動力，以極高嘅生物力學效率帶動重達${w}嘅身體。`,
    ja: (s, w) =>
      `${s}、運動・筋系。横紋筋の束が代謝エネルギーを推進力へと変換し、${w}の身体を高い生体力学効率で動かします。`,
    ko: (s, w) =>
      `${s}, 운동 및 근육계. 횡문근 다발이 대사 에너지를 추진력으로 전환하여 ${w}의 몸을 높은 생체역학적 효율로 움직입니다.`,
    pt: (s, w) =>
      `${s}, Sistema Locomotor e Muscular. Feixes de músculos estriados convertem energia metabólica em propulsão, movendo uma massa de ${w} com alta eficiência biomecânica.`,
    fr: (s, w) =>
      `${s}, Système Locomoteur et Musculaire. Les faisceaux de muscles striés convertissent l’énergie métabolique en propulsion pour déplacer une masse de ${w} avec efficacité.`,
    it: (s, w) =>
      `${s}, Sistema Locomotore e Muscolare. I fasci di muscoli striati convertono l’energia metabolica in propulsione, muovendo una massa di ${w} con elevata efficienza biomeccanica.`,
    de: (s, w) =>
      `${s}, Bewegungs- und Muskelsystem. Quergestreifte Muskelbündel wandeln Stoffwechselenergie in Vortrieb um und bewegen eine Körpermasse von ${w} mit hoher Effizienz.`,
    ar: (s, w) =>
      `${s}، الجهاز الحركي والعضلي. تحول الحزم العضلية المخططة الطاقة الأيضية إلى قوة دفع تحرك جسماً يزن ${w} بكفاءة ميكانيكية عالية.`,
  },
  Cardiovascular: {
    en: (s, w) =>
      `${s}, Cardiovascular System. The muscular heart and arterial network circulate oxygenated blood and nutrients throughout a ${w} body while regulating core thermal balance.`,
    es: (s, w) =>
      `${s}, Sistema Cardiovascular. El corazón muscular y la red arterial distribuyen sangre oxigenada y nutrientes por un cuerpo de ${w}, regulando el equilibrio térmico.`,
    zh: (s, w) =>
      `${s}，心血管系统。强健的心脏与动脉血管网将富含氧气的血液和养分输送至${w}的全身，并精密调节核心体温平衡。`,
    yue: (s, w) =>
      `${s}，心血管系統。強壯嘅心臟同血管網絡將充滿氧氣嘅血液輸送到${w}嘅全身，同時調節體溫平衡。`,
    ja: (s, w) =>
      `${s}、循環器系。強靭な心臓と動脈ネットワークが酸素と栄養に富んだ血液を${w}の全身へ送り届け、体温バランスを調整します。`,
    ko: (s, w) =>
      `${s}, 심혈관계. 강력한 심장과 동맥 혈관망이 산소와 영양분이 풍부한 혈액을 ${w}의 전신에 공급하고 체온 균형을 조절합니다.`,
    pt: (s, w) =>
      `${s}, Sistema Cardiovascular. O coração muscular e a rede arterial distribuem sangue oxigenado e nutrientes por um corpo de ${w}, regulando o equilíbrio térmico.`,
    fr: (s, w) =>
      `${s}, Système Cardiovasculaire. Le cœur musculaire et le réseau artériel font circuler le sang oxygéné à travers un corps de ${w} tout en régulant l’équilibre thermique.`,
    it: (s, w) =>
      `${s}, Sistema Cardiovascolare. Il cuore muscolare e la rete arteriosa distribuiscono sangue ossigenato in un corpo di ${w}, regolando l’equilibrio termico.`,
    de: (s, w) =>
      `${s}, Herz-Kreislauf-System. Das muskulöse Herz und das Gefäßnetz pumpen sauerstoffreiches Blut durch einen ${w} schweren Körper und regulieren den Wärmehaushalt.`,
    ar: (s, w) =>
      `${s}، الجهاز القلبي الوعائي. يضخ القلب العضلي وشبكة الشرايين الدم المؤكسج والمغذيات عبر جسم يزن ${w} مع تنظيم التوازن الحراري.`,
  },
  Respiratory: {
    en: (s, w) =>
      `${s}, Respiratory System. Specialized gas-exchange surfaces extract vital oxygen and expel carbon dioxide to sustain the metabolic demands of a ${w} organism.`,
    es: (s, w) =>
      `${s}, Sistema Respiratorio. Las superficies especializadas de intercambio gaseoso captan oxígeno vital y expulsan dióxido de carbono para sostener un organismo de ${w}.`,
    zh: (s, w) =>
      `${s}，呼吸系统。高度特化的气体交换表面高效摄取氧气并排出二氧化碳，满足${w}躯体的高强度代谢需求。`,
    yue: (s, w) =>
      `${s}，呼吸系統。專門嘅氣體交換構造高效吸取氧氣並排出二氧化碳，支持${w}身體嘅新陳代謝需求。`,
    ja: (s, w) =>
      `${s}、呼吸器系。特化したガス交換器官が生命維持に不可欠な酸素を取り込み、二酸化炭素を排出して${w}の代謝を支えます。`,
    ko: (s, w) =>
      `${s}, 호흡기계. 특수화된 가스 교환 기관이 산소를 흡수하고 이산화탄소를 배출하여 ${w} 생물체의 신진대사를 유지합니다.`,
    pt: (s, w) =>
      `${s}, Sistema Respiratório. Superfícies especializadas de troca gasosa extraem oxigênio vital e expelem dióxido de carbono para sustentar um organismo de ${w}.`,
    fr: (s, w) =>
      `${s}, Système Respiratoire. Des surfaces d’échange gazeux spécialisées captent l’oxygène vital et expulsent le dioxyde de carbone pour soutenir un organisme de ${w}.`,
    it: (s, w) =>
      `${s}, Sistema Respiratorio. Superfici specializzate nello scambio gassoso estraggono ossigeno vitale ed espellono anidride carbonica per sostenere un organismo di ${w}.`,
    de: (s, w) =>
      `${s}, Atmungssystem. Spezialisierte Gasaustauschflächen nehmen lebenswichtigen Sauerstoff auf und geben Kohlendioxid ab, um einen ${w} schweren Organismus zu versorgen.`,
    ar: (s, w) =>
      `${s}، الجهاز التنفسي. تستخلص أسطح تبادل الغازات المتخصصة الأكسجين الحيوي وتطرد ثاني أكسيد الكربون لدعم العمليات الأيضية لكائن يزن ${w}.`,
  },
  'Nervous & Sensory': {
    en: (s, w) =>
      `${s}, Nervous and Sensory System. High-speed neural pathways integrate visual, acoustic, and tactile signals, coordinating reflexes and behavior across a ${w} body.`,
    es: (s, w) =>
      `${s}, Sistema Nervioso y Sensorial. Las vías neuronales de alta velocidad integran señales visuales, acústicas y táctiles, coordinando el comportamiento de un cuerpo de ${w}.`,
    zh: (s, w) =>
      `${s}，神经与感官系统。高速神经通路整合视觉、听觉与触觉信号，精准协调${w}身躯的瞬时反射与复杂行为。`,
    yue: (s, w) =>
      `${s}，神經與感官系統。高速神經網絡整合視覺、聽覺同觸覺訊號，精準協調${w}身體嘅反應同行為。`,
    ja: (s, w) =>
      `${s}、神経・感覚器系。高速な神経回路が視覚・聴覚・触覚のシグナルを統合し、${w}の身体の反射と高度な行動を制御します。`,
    ko: (s, w) =>
      `${s}, 신경 및 감각계. 고속 신경 회로가 시각, 청각, 촉각 신호를 통합하여 ${w} 신체의 반사 작용과 정교한 행동을 조율합니다.`,
    pt: (s, w) =>
      `${s}, Sistema Nervoso e Sensorial. Vias neurais de alta velocidade integram sinais visuais, acústicos e táteis, coordenando reflexos em um corpo de ${w}.`,
    fr: (s, w) =>
      `${s}, Système Nerveux et Sensoriel. Les voies neuronales à haute vitesse intègrent les signaux visuels, acoustiques et tactiles pour coordonner un corps de ${w}.`,
    it: (s, w) =>
      `${s}, Sistema Nervoso e Sensoriale. Vie neurali ad alta velocità integrano segnali visivi, acustici e tattili, coordinando i riflessi di un corpo di ${w}.`,
    de: (s, w) =>
      `${s}, Nerven- und Sinnessystem. Schnelle Nervenbahnen verarbeiten optische, akustische und taktile Reize und steuern die Reflexe eines ${w} schweren Körpers.`,
    ar: (s, w) =>
      `${s}، الجهاز العصبي والحسي. تدمج المسارات العصبية السريعة الإشارات البصرية والسمعية واللمسية لتنسيق ردود الفعل والسلوك في جسم يزن ${w}.`,
  },
  Digestive: {
    en: (s, w) =>
      `${s}, Digestive System. Specialized enzymatic and mechanical processing breaks down nutrients and detoxifies compounds to fuel a ${w} body mass.`,
    es: (s, w) =>
      `${s}, Sistema Digestivo. El procesamiento mecánico y enzimático especializado descompone los nutrientes para alimentar una masa corporal de ${w}.`,
    zh: (s, w) =>
      `${s}，消化系统。特化的机械研磨与消化酶分解系统高效吸收营养并代谢毒素，为${w}的躯体提供持续能量。`,
    yue: (s, w) =>
      `${s}，消化系統。特化嘅消化酶同機械分解系統高效吸收養分，為${w}嘅身體提供持續能量。`,
    ja: (s, w) =>
      `${s}、消化器系。特化した消化酵素と機械的消化が栄養素を分解・吸収し、${w}の身体活動を支えるエネルギーを供給します。`,
    ko: (s, w) =>
      `${s}, 소화기계. 특수화된 효소 및 기계적 소화 과정이 영양분을 분해하고 흡수하여 ${w}의 신체에 에너지를 공급합니다.`,
    pt: (s, w) =>
      `${s}, Sistema Digestivo. O processamento enzimático e mecânico especializado decompõe nutrientes para abastecer uma massa corporal de ${w}.`,
    fr: (s, w) =>
      `${s}, Système Digestif. Le traitement enzymatique et mécanique spécialisé décompose les nutriments pour alimenter une masse corporelle de ${w}.`,
    it: (s, w) =>
      `${s}, Sistema Digerente. L’elaborazione enzimatica e meccanica specializzata scompone i nutrienti per alimentare una massa corporea di ${w}.`,
    de: (s, w) =>
      `${s}, Verdauungssystem. Spezialisierte enzymatische und mechanische Prozesse spalten Nährstoffe auf, um eine Körpermasse von ${w} mit Energie zu versorgen.`,
    ar: (s, w) =>
      `${s}، الجهاز الهضمي. تعمل العمليات الإنزيمية والميكانيكية المتخصصة على تفكيك المغذيات وامتصاصها لتزويد جسم يزن ${w} بالطاقة.`,
  },
  Integumentary: {
    en: (s, w) =>
      `${s}, Integumentary System. The outer protective covering shields a ${w} body against environmental extremes, predators, and mechanical abrasion while aiding thermoregulation.`,
    es: (s, w) =>
      `${s}, Sistema Tegumentario. La cubierta exterior protege un cuerpo de ${w} frente al clima extremo y los depredadores, ayudando a regular la temperatura.`,
    zh: (s, w) =>
      `${s}，被皮与外层系统。外层皮肤、毛发或鳞甲保护着${w}的身体免受极端环境与掠食者伤害，并协助调节体温。`,
    yue: (s, w) =>
      `${s}，外皮與毛鱗系統。外層皮膚、毛髮或者鱗片保護住${w}嘅身體免受環境同捕食者傷害，同時幫助調節體溫。`,
    ja: (s, w) =>
      `${s}、外皮系。皮膚や体毛、鱗などの外皮構造が${w}の身体を過酷な環境や捕食者から守り、体温調節を助けます。`,
    ko: (s, w) =>
      `${s}, 외피계. 피부와 털, 비늘 등 외피 구조가 ${w}의 몸을 극한 환경과 포식자로부터 보호하고 체온 조절을 돕습니다.`,
    pt: (s, w) =>
      `${s}, Sistema Tegumentar. O revestimento externo protege um corpo de ${w} contra extremos ambientais e predadores, auxiliando na termorregulação.`,
    fr: (s, w) =>
      `${s}, Système Tégumentaire. L’enveloppe externe protège un corps de ${w} contre les rigueurs de l’environnement et les prédateurs tout en régulant la température.`,
    it: (s, w) =>
      `${s}, Sistema Tegumentario. Il rivestimento esterno protegge un corpo di ${w} dagli estremi ambientali e dai predatori, favorendo la termoregolazione.`,
    de: (s, w) =>
      `${s}, Haut- und Integumentsystem. Die äußere Körperhülle schützt einen ${w} schweren Körper vor Umwelteinflüssen sowie Fressfeinden und unterstützt die Wärmeregulation.`,
    ar: (s, w) =>
      `${s}، الجهاز اللحافي والجلدي. يحمي الغطاء الخارجي جسماً يزن ${w} من الظروف البيئية القاسية والمفترسات ويساعد في تنظيم حرارة الجسم.`,
  },
};

/**
 * Formats mass in kilograms into 100% native localized units (tons/kg/g) per language,
 * avoiding raw English "tons (lbs)" or untranslated abbreviations during TTS narration.
 */
export function formatLocalizedWeight(massKg: number | undefined, lang: LanguageCode): string {
  const safeKg = Number.isFinite(massKg) && (massKg as number) > 0 ? (massKg as number) : 100;
  if (safeKg >= 1000) {
    const tons = Number((safeKg / 1000).toFixed(1));
    switch (lang) {
      case 'en':
        return `${tons} metric tons`;
      case 'es':
        return `${tons} toneladas`;
      case 'zh':
        return `${tons}吨`;
      case 'yue':
        return `${tons}噸`;
      case 'ja':
        return `${tons}トン`;
      case 'ko':
        return `${tons}톤`;
      case 'pt':
        return `${tons} toneladas`;
      case 'fr':
        return `${tons} tonnes`;
      case 'it':
        return `${tons} tonnellate`;
      case 'de':
        return `${tons} Tonnen`;
      case 'ar':
        return `${tons} طن`;
    }
  }
  if (safeKg < 1) {
    const grams = Math.max(1, Math.round(safeKg * 1000));
    switch (lang) {
      case 'en':
        return `${grams} grams`;
      case 'es':
        return `${grams} gramos`;
      case 'zh':
        return `${grams}克`;
      case 'yue':
        return `${grams}克`;
      case 'ja':
        return `${grams}グラム`;
      case 'ko':
        return `${grams}그램`;
      case 'pt':
        return `${grams} gramas`;
      case 'fr':
        return `${grams} grammes`;
      case 'it':
        return `${grams} grammi`;
      case 'de':
        return `${grams} Gramm`;
      case 'ar':
        return `${grams} غرام`;
    }
  }
  const kg = Number(safeKg.toFixed(1));
  switch (lang) {
    case 'en':
      return `${kg} kilograms`;
    case 'es':
      return `${kg} kilogramos`;
    case 'zh':
      return `${kg}千克`;
    case 'yue':
      return `${kg}公斤`;
    case 'ja':
      return `${kg}キログラム`;
    case 'ko':
      return `${kg}킬로그램`;
    case 'pt':
      return `${kg} quilogramas`;
    case 'fr':
      return `${kg} kilogrammes`;
    case 'it':
      return `${kg} chilogrammi`;
    case 'de':
      return `${kg} Kilogramm`;
    case 'ar':
      return `${kg} كيلوغرام`;
  }
}

export function getLocalizedAnimalName(animal: AnimalRecord, lang: LanguageCode): string {
  return SPECIES_LOCALIZED_NARRATIONS[animal.id]?.[lang]?.name ?? animal.commonName;
}

export function getLocalizedSpeciesNarration(animal: AnimalRecord, lang: LanguageCode): string {
  const localized = SPECIES_LOCALIZED_NARRATIONS[animal.id]?.[lang];
  if (localized?.narration) {
    return localized.narration;
  }
  return `${animal.commonName}, scientific name ${animal.scientificName}. ${animal.kidHeadline}. ${animal.overview}`;
}

export function buildLocalizedHotspotNarration(
  animal: AnimalRecord,
  hotspot: AnatomyHotspot,
  lang: LanguageCode
): string {
  const speciesName = getLocalizedAnimalName(animal, lang);
  const sysLabel = ORGAN_SYSTEM_LABELS[hotspot.system]?.[lang] ?? hotspot.system;
  const weightStr = formatLocalizedWeight(animal.metrics?.weightKg, lang);

  if (lang === 'en') {
    return `${speciesName}, ${sysLabel}: ${hotspot.name}. ${hotspot.kidSummary} Fun comparison: ${hotspot.funComparison}`;
  }

  const formatter = ORGAN_SYSTEM_DESCRIPTIONS[hotspot.system]?.[lang];
  if (formatter) {
    return formatter(speciesName, weightStr);
  }
  return `${speciesName}, ${sysLabel}.`;
}
