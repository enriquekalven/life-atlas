// Security compliance (mandatory-secure-web-skills):
// - Input Validation: Language codes from URL query parameters (?lang=) and localStorage are
//   strictly validated against the allow-listed SUPPORTED_LANGUAGES tuple before use.
// - XSS Prevention: All translated UI strings are static literals rendered via React JSX auto-escaping.

export type SupportedLang =
  | 'en'
  | 'es'
  | 'zh'
  | 'yue'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'fr'
  | 'it'
  | 'de'
  | 'ar';

export type LanguageCode = SupportedLang;

export interface LangOption {
  code: SupportedLang;
  label: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: readonly LangOption[] = [
  { code: 'en', label: 'EN · English', dir: 'ltr' },
  { code: 'es', label: 'ES · Español', dir: 'ltr' },
  { code: 'zh', label: '中文 · 简体', dir: 'ltr' },
  { code: 'yue', label: '粵語 · 繁體', dir: 'ltr' },
  { code: 'ja', label: 'JA · 日本語', dir: 'ltr' },
  { code: 'ko', label: 'KO · 한국어', dir: 'ltr' },
  { code: 'pt', label: 'PT · Português', dir: 'ltr' },
  { code: 'fr', label: 'FR · Français', dir: 'ltr' },
  { code: 'it', label: 'IT · Italiano', dir: 'ltr' },
  { code: 'de', label: 'DE · Deutsch', dir: 'ltr' },
  { code: 'ar', label: 'AR · العربية', dir: 'rtl' },
] as const;

const LANG_STORAGE_KEY = 'tf-lang';

export function isSupportedLang(value: unknown): value is SupportedLang {
  return (
    typeof value === 'string' &&
    SUPPORTED_LANGUAGES.some((l) => l.code === value)
  );
}

export function detectInitialLang(): SupportedLang {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (isSupportedLang(urlLang)) return urlLang;

    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isSupportedLang(stored)) return stored;

    const nav = (window.navigator.language || '').toLowerCase();
    if (nav.startsWith('yue') || nav === 'zh-hk' || nav === 'zh-mo') return 'yue';
    const short = nav.split('-')[0];
    if (isSupportedLang(short)) return short;
  } catch {
    // Fail-safe fallback to English
  }
  return 'en';
}

export function applyDocumentLang(lang: SupportedLang): void {
  if (typeof document === 'undefined') return;
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, meta.code);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export interface UiTranslations {
  subtitleBadge: string;
  tagline: string;
  tabAll: string;
  tabLiving: string;
  tabExtinct: string;
  searchPlaceholder: string;
  liveDbBtn: string;
  searchingBtn: string;
  badgesLabel: string;
  continentLabel: string;
  climateLabel: string;
  classLabel: string;
  resetFilters: string;
  showingCountPrefix: string;
  showingCountSuffix: string;
  globeTitle: string;
  climateBandsOn: string;
  climateBandsOff: string;
  rosterTitle: string;
  rosterHint: string;
  kidScaleOn: string;
  kidScaleOff: string;
  pauseMotion: string;
  playMotion: string;
  activeViewPrefix: string;
  cookieTitle: string;
  cookieBody: string;
  cookieAccept: string;
  cookieDecline: string;
  cookieButtonTitle: string;
}

export const UI_STRINGS: Record<SupportedLang, UiTranslations> = {
  en: {
    subtitleBadge: 'Kids Science & Paleo Atlas',
    tagline: 'Interactive 3D Living & Extinct Animals • 4-Layer X-Ray Anatomy • Biomes & 541M Years of Earth History',
    tabAll: '🌍 All Epochs',
    tabLiving: '🐾 Living Today',
    tabExtinct: '🦴 Extinct & Fossils',
    searchPlaceholder: 'Search any animal or fossil (e.g. Tiger, Narwhal, Mammoth, Megalodon)...',
    liveDbBtn: 'Live Global DB',
    searchingBtn: 'Searching...',
    badgesLabel: 'Explorer Badges',
    continentLabel: 'Continent/Ocean:',
    climateLabel: 'Climate Biome:',
    classLabel: 'Animal Class:',
    resetFilters: 'Reset Filters',
    showingCountPrefix: 'Showing',
    showingCountSuffix: 'interactive 3D species on globe',
    globeTitle: '3D Earth & Paleo-Biome Globe',
    climateBandsOn: 'Climate Bands: ON',
    climateBandsOff: 'Climate Bands: OFF',
    rosterTitle: 'Interactive 3D Species Roster',
    rosterHint: 'Click any animal to inspect in 3D',
    kidScaleOn: 'Kid Size Scale: ON',
    kidScaleOff: 'Kid Size Scale: OFF',
    pauseMotion: 'Pause Motion',
    playMotion: 'Play Motion',
    activeViewPrefix: 'Active 3D View:',
    cookieTitle: 'Optional Analytics Cookies',
    cookieBody: 'We use optional, privacy-hardened analytics (IP anonymized, no ad personalization) to see which 3D animals kids explore most.',
    cookieAccept: 'Allow Analytics',
    cookieDecline: 'No Thanks',
    cookieButtonTitle: 'Analytics & Cookie Preferences',
  },
  es: {
    subtitleBadge: 'Atlas de Ciencia y Paleontología',
    tagline: 'Animales 3D Vivos y Extintos • Anatomía Rayos X de 4 Capas • Biomas y 541M de Años de Historia',
    tabAll: '🌍 Todas las Épocas',
    tabLiving: '🐾 Vivos Hoy',
    tabExtinct: '🦴 Extintos y Fósiles',
    searchPlaceholder: 'Busca cualquier animal o fósil (ej. Tigre, Mamut, Megalodón)...',
    liveDbBtn: 'Base Global en Vivo',
    searchingBtn: 'Buscando...',
    badgesLabel: 'Insignias',
    continentLabel: 'Continente/Océano:',
    climateLabel: 'Bioma Climático:',
    classLabel: 'Clase Animal:',
    resetFilters: 'Restablecer',
    showingCountPrefix: 'Mostrando',
    showingCountSuffix: 'especies 3D en el globo',
    globeTitle: 'Globo 3D de la Tierra y Paleobiomas',
    climateBandsOn: 'Franjas Climáticas: SÍ',
    climateBandsOff: 'Franjas Climáticas: NO',
    rosterTitle: 'Catálogo de Especies 3D',
    rosterHint: 'Haz clic en un animal para inspeccionarlo en 3D',
    kidScaleOn: 'Escala Infantil: SÍ',
    kidScaleOff: 'Escala Infantil: NO',
    pauseMotion: 'Pausar Movimiento',
    playMotion: 'Reproducir Movimiento',
    activeViewPrefix: 'Vista 3D Activa:',
    cookieTitle: 'Cookies Analíticas Opcionales',
    cookieBody: 'Usamos analíticas opcionales con privacidad reforzada (IP anonimizada, sin anuncios) para mejorar el atlas 3D.',
    cookieAccept: 'Permitir Analíticas',
    cookieDecline: 'No, gracias',
    cookieButtonTitle: 'Preferencias de Cookies y Analíticas',
  },
  zh: {
    subtitleBadge: '少儿生命与古生物 3D 图鉴',
    tagline: '3D 现生与灭绝动物 • 4 层 X 光解剖 • 生物群系与 5.41 亿年地球生命史',
    tabAll: '🌍 全部地质时代',
    tabLiving: '🐾 现生物种',
    tabExtinct: '🦴 灭绝与化石',
    searchPlaceholder: '搜索任何动物或化石（如：东北虎、猛犸象、巨齿鲨）...',
    liveDbBtn: '全球实时数据库',
    searchingBtn: '搜索中...',
    badgesLabel: '探索徽章',
    continentLabel: '大洲/大洋：',
    climateLabel: '气候群系：',
    classLabel: '动物纲目：',
    resetFilters: '重置筛选',
    showingCountPrefix: '地球仪上显示',
    showingCountSuffix: '种 3D 互动生物',
    globeTitle: '3D 地球与古生物群系仪',
    climateBandsOn: '气候带：开启',
    climateBandsOff: '气候带：关闭',
    rosterTitle: '3D 物种名录',
    rosterHint: '点击任意动物进入 3D 解剖观察',
    kidScaleOn: '儿童身高对比：开启',
    kidScaleOff: '儿童身高对比：关闭',
    pauseMotion: '暂停动画',
    playMotion: '播放动画',
    activeViewPrefix: '当前 3D 图层：',
    cookieTitle: '可选分析 Cookie',
    cookieBody: '我们使用严格匿名化的可选统计（隐去 IP、禁用广告追踪）来改进 3D 动物图鉴体验。',
    cookieAccept: '允许统计',
    cookieDecline: '暂不需要',
    cookieButtonTitle: 'Cookie 与统计偏好设置',
  },
  yue: {
    subtitleBadge: '兒童自然科學與古生物 3D 圖鑑',
    tagline: '3D 現生與滅絕動物 • 4 層 X 光解剖 • 生態群落與 5.41 億年地球歷史',
    tabAll: '🌍 全部年代',
    tabLiving: '🐾 現今物種',
    tabExtinct: '🦴 滅絕與化石',
    searchPlaceholder: '搜尋任何動物或化石（例如：老虎、長毛象、巨齒鯊）...',
    liveDbBtn: '全球即時資料庫',
    searchingBtn: '搜尋緊...',
    badgesLabel: '探索徽章',
    continentLabel: '大洲/大洋：',
    climateLabel: '氣候生態帶：',
    classLabel: '動物綱目：',
    resetFilters: '重設篩選',
    showingCountPrefix: '顯示緊',
    showingCountSuffix: '種 3D 互動動物',
    globeTitle: '3D 地球與古生態儀',
    climateBandsOn: '氣候帶：開',
    climateBandsOff: '氣候帶：關',
    rosterTitle: '3D 物種名冊',
    rosterHint: '撳任何動物進入 3D 解剖檢視',
    kidScaleOn: '小朋友身高對比：開',
    kidScaleOff: '小朋友身高對比：關',
    pauseMotion: '暫停動作',
    playMotion: '播放動作',
    activeViewPrefix: '目前 3D 圖層：',
    cookieTitle: '可選分析 Cookie',
    cookieBody: '我哋使用私隱保護嘅可選分析（匿名 IP、無廣告追蹤）嚟了解小朋友最鍾意邊啲 3D 動物。',
    cookieAccept: '允許分析',
    cookieDecline: '唔使喇',
    cookieButtonTitle: 'Cookie 與分析設定',
  },
  ja: {
    subtitleBadge: 'キッズ動物＆古生物 3D 図鑑',
    tagline: '現生・絶滅動物の 3D モデル • 4層 X線解剖 • バイオームと 5億4100万年の生命史',
    tabAll: '🌍 すべての時代',
    tabLiving: '🐾 現生動物',
    tabExtinct: '🦴 絶滅種・化石',
    searchPlaceholder: '動物や化石を検索（例：トラ、マンモス、メガロドン）...',
    liveDbBtn: '世界ライブDB',
    searchingBtn: '検索中...',
    badgesLabel: '探検バッジ',
    continentLabel: '大陸・海洋：',
    climateLabel: '気候バイオーム：',
    classLabel: '分類クラス：',
    resetFilters: 'リセット',
    showingCountPrefix: '地球儀に',
    showingCountSuffix: '種の 3D 生物を表示中',
    globeTitle: '3D 地球＆古環境グローブ',
    climateBandsOn: '気候帯：ON',
    climateBandsOff: '気候帯：OFF',
    rosterTitle: '3D 生物ラインナップ',
    rosterHint: '動物をクリックして 3D 解剖スタジオへ',
    kidScaleOn: '子どもサイズ比較：ON',
    kidScaleOff: '子どもサイズ比較：OFF',
    pauseMotion: '動きを一時停止',
    playMotion: '動きを再生',
    activeViewPrefix: '表示中の 3D レイヤー：',
    cookieTitle: '任意のアクセス解析 Cookie',
    cookieBody: 'IP匿名化・広告追跡なしのプライバシー保護された任意解析のみを使用し、3D図鑑の改善に役立てます。',
    cookieAccept: '解析を許可',
    cookieDecline: '許可しない',
    cookieButtonTitle: 'Cookie と解析の設定',
  },
  ko: {
    subtitleBadge: '어린이 동물 & 고생물 3D 도감',
    tagline: '살아있는 동물과 멸종 동물 3D • 4단계 X-레이 해부학 • 기후 생물군계와 5억 4,100만 년 지구 역사',
    tabAll: '🌍 모든 지질 시대',
    tabLiving: '🐾 현생 동물',
    tabExtinct: '🦴 멸종 동물 & 화석',
    searchPlaceholder: '동물이나 화석 검색 (예: 호랑이, 매머드, 메갈로돈)...',
    liveDbBtn: '글로벌 실시간 DB',
    searchingBtn: '검색 중...',
    badgesLabel: '탐험 배지',
    continentLabel: '대륙/대양:',
    climateLabel: '기후 생물군계:',
    classLabel: '동물 강(Class):',
    resetFilters: '필터 초기화',
    showingCountPrefix: '지구본에',
    showingCountSuffix: '종의 3D 생물 표시 중',
    globeTitle: '3D 지구 & 고생태 지구본',
    climateBandsOn: '기후대: 켜짐',
    climateBandsOff: '기후대: 꺼짐',
    rosterTitle: '3D 생물 목록',
    rosterHint: '동물을 클릭해 3D 해부 구조를 살펴보세요',
    kidScaleOn: '어린이 크기 비교: 켜짐',
    kidScaleOff: '어린이 크기 비교: 꺼짐',
    pauseMotion: '동작 일시정지',
    playMotion: '동작 재생',
    activeViewPrefix: '현재 3D 레이어:',
    cookieTitle: '선택적 분석 쿠키',
    cookieBody: 'IP 익명화 및 광고 추적이 차단된 선택적 분석만을 사용하여 3D 도감 경험을 개선합니다.',
    cookieAccept: '분석 허용',
    cookieDecline: '거부',
    cookieButtonTitle: '쿠키 및 분석 환경설정',
  },
  pt: {
    subtitleBadge: 'Atlas 3D de Ciência e Paleontologia',
    tagline: 'Animais 3D Vivos e Extintos • Anatomia Raio-X em 4 Camadas • Biomas e 541M de Anos da Terra',
    tabAll: '🌍 Todas as Épocas',
    tabLiving: '🐾 Vivos Hoje',
    tabExtinct: '🦴 Extintos e Fósseis',
    searchPlaceholder: 'Pesquise qualquer animal ou fóssil (ex. Tigre, Mamute, Megalodonte)...',
    liveDbBtn: 'Base Global ao Vivo',
    searchingBtn: 'Pesquisando...',
    badgesLabel: 'Insígnias',
    continentLabel: 'Continente/Oceano:',
    climateLabel: 'Bioma Climático:',
    classLabel: 'Classe Animal:',
    resetFilters: 'Limpar Filtros',
    showingCountPrefix: 'Mostrando',
    showingCountSuffix: 'espécies 3D no globo',
    globeTitle: 'Globo 3D da Terra e Paleobiomas',
    climateBandsOn: 'Faixas Climáticas: ON',
    climateBandsOff: 'Faixas Climáticas: OFF',
    rosterTitle: 'Catálogo de Espécies 3D',
    rosterHint: 'Clique em qualquer animal para inspecionar em 3D',
    kidScaleOn: 'Escala Infantil: ON',
    kidScaleOff: 'Escala Infantil: OFF',
    pauseMotion: 'Pausar Movimento',
    playMotion: 'Reproduzir Movimento',
    activeViewPrefix: 'Vista 3D Ativa:',
    cookieTitle: 'Cookies Analíticos Opcionais',
    cookieBody: 'Usamos analíticas opcionais com privacidade reforçada (IP anonimizado, sem anúncios) para melhorar o atlas 3D.',
    cookieAccept: 'Permitir Analíticas',
    cookieDecline: 'Não, obrigado',
    cookieButtonTitle: 'Preferências de Cookies e Analíticas',
  },
  fr: {
    subtitleBadge: 'Atlas 3D Sciences & Paléontologie',
    tagline: 'Animaux 3D Vivants et Disparus • Anatomie Rayons X 4 Couches • Biomes et 541M d’Années d’Histoire',
    tabAll: '🌍 Toutes les Époques',
    tabLiving: '🐾 Vivants Aujourd’hui',
    tabExtinct: '🦴 Disparus & Fossiles',
    searchPlaceholder: 'Rechercher un animal ou fossile (ex. Tigre, Mammouth, Mégalodon)...',
    liveDbBtn: 'Base Mondiale Live',
    searchingBtn: 'Recherche...',
    badgesLabel: 'Badges Explorateur',
    continentLabel: 'Continent/Océan :',
    climateLabel: 'Biome Climatique :',
    classLabel: 'Classe Animale :',
    resetFilters: 'Réinitialiser',
    showingCountPrefix: 'Affichage de',
    showingCountSuffix: 'espèces 3D sur le globe',
    globeTitle: 'Globe Terrestre 3D & Paléo-Biomes',
    climateBandsOn: 'Bandes Climatiques : OUI',
    climateBandsOff: 'Bandes Climatiques : NON',
    rosterTitle: 'Catalogue des Espèces 3D',
    rosterHint: 'Cliquez sur un animal pour l’inspecter en 3D',
    kidScaleOn: 'Échelle Enfant : OUI',
    kidScaleOff: 'Échelle Enfant : NON',
    pauseMotion: 'Pause Animation',
    playMotion: 'Lire Animation',
    activeViewPrefix: 'Couche 3D Active :',
    cookieTitle: 'Cookies Analytiques Optionnels',
    cookieBody: 'Nous utilisons des mesures d’audience optionnelles respectueuses de la vie privée (IP anonymisée, sans publicité).',
    cookieAccept: 'Autoriser',
    cookieDecline: 'Refuser',
    cookieButtonTitle: 'Préférences Cookies & Analytiques',
  },
  it: {
    subtitleBadge: 'Atlante 3D di Scienza e Paleontologia',
    tagline: 'Animali 3D Viventi ed Estinti • Anatomia Raggi X a 4 Strati • Biomi e 541M di Anni della Terra',
    tabAll: '🌍 Tutte le Epoche',
    tabLiving: '🐾 Viventi Oggi',
    tabExtinct: '🦴 Estinti e Fossili',
    searchPlaceholder: 'Cerca qualsiasi animale o fossile (es. Tigre, Mammut, Megalodonte)...',
    liveDbBtn: 'DB Globale Live',
    searchingBtn: 'Ricerca...',
    badgesLabel: 'Badge Esploratore',
    continentLabel: 'Continente/Oceano:',
    climateLabel: 'Bioma Climatico:',
    classLabel: 'Classe Animale:',
    resetFilters: 'Reimposta Filtri',
    showingCountPrefix: 'Visualizzazione di',
    showingCountSuffix: 'specie 3D sul globo',
    globeTitle: 'Globo 3D della Terra e Paleobiomi',
    climateBandsOn: 'Fasce Climatiche: ON',
    climateBandsOff: 'Fasce Climatiche: OFF',
    rosterTitle: 'Catalogo Specie 3D',
    rosterHint: 'Clicca su un animale per esplorarlo in 3D',
    kidScaleOn: 'Scala Bambino: ON',
    kidScaleOff: 'Scala Bambino: OFF',
    pauseMotion: 'Pausa Movimento',
    playMotion: 'Avvia Movimento',
    activeViewPrefix: 'Vista 3D Attiva:',
    cookieTitle: 'Cookie Analitici Facoltativi',
    cookieBody: 'Utilizziamo analisi facoltative rispettose della privacy (IP anonimizzato, nessun annuncio) per migliorare l’atlante 3D.',
    cookieAccept: 'Consenti Analisi',
    cookieDecline: 'No, grazie',
    cookieButtonTitle: 'Preferenze Cookie e Analisi',
  },
  de: {
    subtitleBadge: '3D-Natur- & Paläontologie-Atlas',
    tagline: 'Lebende & Ausgestorbene 3D-Tiere • 4-Schichten-Röntgenanatomie • Biome & 541 Mio. Jahre Erdgeschichte',
    tabAll: '🌍 Alle Erdzeitalter',
    tabLiving: '🐾 Heute Lebend',
    tabExtinct: '🦴 Ausgestorben & Fossilien',
    searchPlaceholder: 'Tier oder Fossil suchen (z. B. Tiger, Mammut, Megalodon)...',
    liveDbBtn: 'Globale Live-DB',
    searchingBtn: 'Suche...',
    badgesLabel: 'Entdecker-Abzeichen',
    continentLabel: 'Kontinent/Ozean:',
    climateLabel: 'Klimabiom:',
    classLabel: 'Tierklasse:',
    resetFilters: 'Filter zurücksetzen',
    showingCountPrefix: 'Zeige',
    showingCountSuffix: 'interaktive 3D-Arten auf dem Globus',
    globeTitle: '3D-Erd- & Paläobiom-Globus',
    climateBandsOn: 'Klimazonen: AN',
    climateBandsOff: 'Klimazonen: AUS',
    rosterTitle: 'Interaktives 3D-Artenverzeichnis',
    rosterHint: 'Klicke auf ein Tier für die 3D-Anatomieansicht',
    kidScaleOn: 'Kindergrößenvergleich: AN',
    kidScaleOff: 'Kindergrößenvergleich: AUS',
    pauseMotion: 'Bewegung pausieren',
    playMotion: 'Bewegung abspielen',
    activeViewPrefix: 'Aktive 3D-Ansicht:',
    cookieTitle: 'Optionale Analyse-Cookies',
    cookieBody: 'Wir nutzen optionale, datenschutzfreundliche Analysen (IP anonymisiert, keine personalisierte Werbung) zur Verbesserung des 3D-Atlas.',
    cookieAccept: 'Analyse erlauben',
    cookieDecline: 'Ablehnen',
    cookieButtonTitle: 'Cookie- & Analyse-Einstellungen',
  },
  ar: {
    subtitleBadge: 'أطلس العلوم والحفريات ثلاثي الأبعاد',
    tagline: 'حيوانات حية ومنقرضة ثلاثية الأبعاد • تشريح بالأشعة السينية من 4 طبقات • 541 مليون سنة من تاريخ الأرض',
    tabAll: '🌍 جميع العصور',
    tabLiving: '🐾 الكائنات الحية اليوم',
    tabExtinct: '🦴 المنقرضة والحفريات',
    searchPlaceholder: 'ابحث عن أي حيوان أو أحفورة (مثل النمر، الماموث، الميجالودون)...',
    liveDbBtn: 'قاعدة البيانات العالمية',
    searchingBtn: 'جارٍ البحث...',
    badgesLabel: 'شارات المستكشف',
    continentLabel: 'القارة / المحيط:',
    climateLabel: 'البيئة المناخية:',
    classLabel: 'طائفة الحيوان:',
    resetFilters: 'إعادة ضبط الفلاتر',
    showingCountPrefix: 'عرض',
    showingCountSuffix: 'نوعاً ثلاثي الأبعاد على الكرة الأرضية',
    globeTitle: 'مجسم الأرض والبيئات القديمة ثلاثي الأبعاد',
    climateBandsOn: 'النطاقات المناخية: مفعل',
    climateBandsOff: 'النطاقات المناخية: متوقف',
    rosterTitle: 'قائمة الأنواع ثلاثية الأبعاد',
    rosterHint: 'انقر على أي حيوان لفحصه بالأبعاد الثلاثية',
    kidScaleOn: 'مقارنة حجم الطفل: مفعل',
    kidScaleOff: 'مقارنة حجم الطفل: متوقف',
    pauseMotion: 'إيقاف الحركة',
    playMotion: 'تشغيل الحركة',
    activeViewPrefix: 'الطبقة النشطة:',
    cookieTitle: 'ملفات تعريف الارتباط التحليلية الاختيارية',
    cookieBody: 'نستخدم تحليلات اختيارية تحمي الخصوصية (إخفاء عنوان IP، بدون إعلانات مخصصة) لتحسين تجربة الأطلس ثلاثي الأبعاد.',
    cookieAccept: 'السماح بالتحليلات',
    cookieDecline: 'لا شكراً',
    cookieButtonTitle: 'إعدادات الخصوصية والتحليلات',
  },
};
