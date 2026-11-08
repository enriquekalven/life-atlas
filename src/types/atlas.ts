export type TemporalStatus = 'living' | 'extinct';

export type GeologicalEraId =
  | 'all'
  | 'cambrian'
  | 'devonian'
  | 'carboniferous'
  | 'permian'
  | 'triassic'
  | 'jurassic'
  | 'cretaceous'
  | 'paleogene'
  | 'neogene'
  | 'pleistocene'
  | 'holocene';

export type ClimateZone =
  | 'Tropical Rainforest'
  | 'Savanna & Grassland'
  | 'Arid Desert'
  | 'Temperate Forest'
  | 'Boreal & Taiga'
  | 'Polar & Tundra'
  | 'Pelagic Ocean'
  | 'Coral Reef & Shallow Seas'
  | 'Abyssal Deep Sea'
  | 'Freshwater River & Wetland'
  | 'Mountain & Alpine'
  | 'Prehistoric Greenhouse';

export type TaxonomicClass =
  | 'Mammalia'
  | 'Aves'
  | 'Reptilia'
  | 'Amphibia'
  | 'Actinopterygii'
  | 'Chondrichthyes'
  | 'Cephalopoda'
  | 'Arthropoda'
  | 'Synapsida'
  | 'Placodermi';

export type BodyArchetype =
  | 'feline_predator'
  | 'proboscidean'
  | 'cetacean'
  | 'avian_raptor'
  | 'penguin'
  | 'shark_ichthyosaur'
  | 'marine_reptile'
  | 'crocodilian'
  | 'amphibian'
  | 'cephalopod'
  | 'arthropod'
  | 'ursid';

export type AnatomyLayer = 'exterior' | 'muscular' | 'skeletal' | 'organs';

export type AnatomyAnchorName =
  | 'snout' | 'jaw' | 'eye' | 'brain' | 'ear' | 'neck' | 'chest' | 'heart' | 'lungs'
  | 'belly' | 'hips' | 'tail' | 'tailTip' | 'dorsal' | 'flank' | 'forelimb' | 'hindlimb'
  | 'foot' | 'pectoralFin' | 'dorsalFin' | 'caudalFin' | 'wing' | 'sail' | 'frill'
  | 'tusk' | 'horn' | 'trunk' | 'arms' | 'claws' | 'gills' | 'antenna' | 'skull'
  | 'spine' | 'pelvis' | 'skin' | 'throat';

export interface AnatomyHotspot {
  id: string;
  name: string;
  layer: AnatomyLayer;
  /** Legacy coordinate hint; the 3D engine positions pins via `anchor` (resolved from the name when absent). */
  position: [number, number, number];
  /** Optional explicit anatomical anchor on the procedural body. */
  anchor?: AnatomyAnchorName;
  system:
    | 'Cardiovascular'
    | 'Skeletal'
    | 'Nervous & Sensory'
    | 'Locomotor'
    | 'Digestive'
    | 'Respiratory'
    | 'Integumentary';
  kidSummary: string;
  scientificDetail: string;
  funComparison: string;
}

export interface AnimalQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface HabitatCoordinate {
  lat: number;
  lng: number;
  label: string;
}

export interface AnimalMetrics {
  lengthMeters: number;
  heightMeters: number;
  weightKg: number;
  topSpeedKmh: number;
  lifespanYears: string;
  heartRateBpm: string;
  biteForceN?: string;
}

export interface VisualPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  eyeColor: string;
  skinRoughness: number;
  patternType:
    | 'solid'
    | 'stripes'
    | 'spots'
    | 'countershade'
    | 'scales'
    | 'feathers'
    | 'plates'
    | 'iridescent';
}

export interface AnimalRecord {
  id: string;
  commonName: string;
  scientificName: string;
  taxonomy: {
    kingdom: 'Animalia';
    phylum: string;
    class: TaxonomicClass;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  temporalStatus: TemporalStatus;
  eraId: Exclude<GeologicalEraId, 'all'>;
  timeRangeMya: string;
  conservationStatus:
    | 'Least Concern'
    | 'Near Threatened'
    | 'Vulnerable'
    | 'Endangered'
    | 'Critically Endangered'
    | 'Extinct (Holocene)'
    | 'Extinct (Prehistoric)';
  continents: string[];
  regionDescription: string;
  coordinates: HabitatCoordinate[];
  climateZone: ClimateZone;
  temperatureRangeC: string;
  habitatDepthOrAltitude: string;
  diet:
    | 'Carnivore'
    | 'Herbivore'
    | 'Omnivore'
    | 'Filter Feeder'
    | 'Piscivore'
    | 'Insectivore';
  metrics: AnimalMetrics;
  archetype: BodyArchetype;
  visualPalette: VisualPalette;
  kidHeadline: string;
  overview: string;
  evolutionaryStory: string;
  superpowers: string[];
  anatomyHotspots: AnatomyHotspot[];
  quiz: AnimalQuizQuestion[];
  externalSource?: 'curated' | 'gbif' | 'pbdb';
}

export interface GeologicalEraInfo {
  id: GeologicalEraId;
  name: string;
  periodSpan: string;
  myaNumeric: number;
  globalTempAvgC: string;
  oxygenPercent: string;
  continentalLayout: string;
  kidDescription: string;
  accentHex: string;
}
