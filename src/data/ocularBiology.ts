export interface OcularBiologyProfile {
  /** Short classification of the ocular system */
  eyeType: string;
  /** Exact pupil geometry used by the 3D eyeball builder */
  pupilType: 'round' | 'slit' | 'hslit' | 'w-cephalopod' | 'compound' | 'trinocular-compound';
  /** Human-readable description of the pupil & iris mechanism */
  pupilShapeLabel: string;
  /** Eyeball diameter in millimeters + kid-friendly size comparison */
  eyeballDiameterMm: string;
  /** Photoreceptor types (rods, cones, opsins, rhabdomeres) */
  photoreceptors: string;
  /** Field of view & binocular overlap */
  fieldOfView: string;
  /** How the cornea, tear film, scleral ring, and crystalline lens focus light */
  corneaAndLens: string;
  /** Whether the species has abony scleral ossicle ring */
  hasScleralOssicles: boolean;
  /** Optional tapetum lucidum retro-reflective glow hex color */
  tapetumColor?: string;
  /** Outer iris color hex */
  irisPrimaryHex: string;
  /** Inner collarette / stromal fiber highlight color hex */
  irisSecondaryHex: string;
  /** Sclera tint hex */
  scleraHex: string;
  /** Vivid National Geographic / Smithsonian explanation for kids */
  kidVisionSecret: string;
  /** Museum / scientific reference citation */
  museumReference: string;
}

export const OCULAR_BIOLOGY_BY_SPECIES: Record<string, OcularBiologyProfile> = {
  'homo-sapiens': {
    eyeType: 'Trichromatic Foveal Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Autonomic Pupil (2–8 mm Pupillary Light Reflex)',
    eyeballDiameterMm: '24 mm (Size of a US Quarter / Table Grape)',
    photoreceptors: '3 Cone Opsins (Red L, Green M, Blue S — 6M Cones) + 120M Night Rods',
    fieldOfView: '180° Total Horizontal (120° Binocular 3D Depth Overlap)',
    corneaAndLens: 'Curved Tear-Film Cornea (43 Diopters, IOR 1.376) + Flexible Ciliary-Focused Crystalline Lens',
    hasScleralOssicles: false,
    irisPrimaryHex: '#7c4a24',
    irisSecondaryHex: '#d99b52',
    scleraHex: '#f8f5f0',
    kidVisionSecret:
      'Humans are the only primates with bright white sclera ("whites of the eyes") exposed around the iris—an evolutionary adaptation so other humans can follow your gaze without a single word!',
    museumReference: 'Smithsonian NMNH David H. Koch Hall of Human Origins • Land & Nilsson (2012) Animal Eyes',
  },
  'african-bush-elephant': {
    eyeType: 'Arrhythmic Crepuscular Mammalian Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil with Thick Protective Third Eyelid (Nictitating Membrane)',
    eyeballDiameterMm: '38 – 42 mm (Golf-Ball Sized with Long Downward Dust-Shield Eyelashes)',
    photoreceptors: 'Dichromatic Day/Night Vision (Blue & Red/Green Opsins + Dense Rod Tapetum Fibrosum)',
    fieldOfView: '300° Panoramic Perimeter Scan (65° Forward Binocular Trunk-Tip Overlap)',
    corneaAndLens: 'Thickened Dust-Resistant Cornea Protected by Harderian Gland Oil Tear Film (No Tear Ducts!)',
    hasScleralOssicles: false,
    tapetumColor: '#a3e635',
    irisPrimaryHex: '#6b3e1b',
    irisSecondaryHex: '#b4783c',
    scleraHex: '#e6ddd0',
    kidVisionSecret:
      'At night, an elephant’s eyes switch to the exact same light-sensing gene pigments humans use for color vision, letting herds spot lions under starlight!',
    museumReference: 'Smithsonian NMNH Henry the Elephant Rotunda Specimen (USNM 304615) • National Geographic',
  },
  'blue-whale': {
    eyeType: 'Hyper-Pressurized Pelagic Cetacean Camera Eye',
    pupilType: 'hslit',
    pupilShapeLabel: 'Horizontally Elongated U-Kidney Pupil with Operculum Light Shield',
    eyeballDiameterMm: '107 – 120 mm (Grapefruit-Sized with 4-cm Thick Sclera Wall!)',
    photoreceptors: 'Monochromatic Deep-Sea L-Cone Abolition (Rod-Dominated 482 nm Bioluminescence Sensitivity)',
    fieldOfView: '290° Lateral Up/Down Filter-Feeding Scan',
    corneaAndLens: 'Flattened Underwater Cornea + Perfectly Spherical High-Refractive Fish-Style Lens',
    hasScleralOssicles: false,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#1e3a5f',
    irisSecondaryHex: '#60a5fa',
    scleraHex: '#cbd5e1',
    kidVisionSecret:
      'To keep crushing deep-ocean water pressure from flattening its eyeball, a Blue Whale’s white sclera shell is nearly 4 centimeters (1.5 inches) thick—tougher than a car tire!',
    museumReference: 'Smithsonian NMNH Sant Ocean Hall Phoenix Blue Whale Collection • Walls (1942)',
  },
  'siberian-tiger': {
    eyeType: 'Nocturnal/Crepuscular Apex Felid Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Large Circular Big-Cat Pupil (Unlike Small Housecats’ Vertical Slits!)',
    eyeballDiameterMm: '36 mm (Ping-Pong Ball Sized with 6× Human Night Sensitivity)',
    photoreceptors: 'High-Density Rod Retina + Riboflavin Tapetum Lucidum Cellulosum Mirror',
    fieldOfView: '200° Total with 120° Stereoscopic 3D Pounce Depth Perception',
    corneaAndLens: 'Giant Wide-Aperture Cornea & Anterior Chamber Maximizing Photon Capture in Taiga Twilight',
    hasScleralOssicles: false,
    tapetumColor: '#eab308',
    irisPrimaryHex: '#ca8a04',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#ede6d8',
    kidVisionSecret:
      'Why do small housecats have vertical slit pupils while giant tigers and lions have round pupils? Scientists discovered vertical slits work best for predators close to the ground, while taller big cats use round pupils for long-distance depth perception!',
    museumReference: 'Smithsonian National Zoo & Conservation Biology Institute • Banks et al. (2015) Science Advances',
  },
  'polar-bear': {
    eyeType: 'Arctic UV-Filtering Amphibious Ursid Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil with Built-In UV-Blocking Nictitating "Snow Goggles"',
    eyeballDiameterMm: '30 mm (Walnut-Sized with Dark Melanin Eyelid Rims Against Snow Glare)',
    photoreceptors: 'Dichromatic Cone Array + Dense Rods Tuned for White-on-White Seal Contrast',
    fieldOfView: '210° Ice-Floe Horizon & Breathing-Hole Scan',
    corneaAndLens: 'Dual-Medium Cornea + Strong Ciliary Muscle Accommodation for Swimming Under Arctic Pack Ice',
    hasScleralOssicles: false,
    tapetumColor: '#fde047',
    irisPrimaryHex: '#5c3418',
    irisSecondaryHex: '#a16207',
    scleraHex: '#dfd6c8',
    kidVisionSecret:
      'Polar bears have a translucent third eyelid that slides sideways across their eye like built-in ski goggles to prevent snow blindness from blinding Arctic ultraviolet glare—and helps them see underwater!',
    museumReference: 'Smithsonian NMNH Hall of Mammals Arctic Collection • National Geographic Polar Expeditions',
  },
  'peregrine-falcon': {
    eyeType: 'Tubular Bifoveate Raptor Telescopic Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular High-Speed Pupil Framed by 15 Overlapping Bony Scleral Ossicles',
    eyeballDiameterMm: '28 mm (Takes Up Nearly 50% of the Entire Skull Volume!)',
    photoreceptors: 'Tetrachromatic (4 Cone Types Including UV + Coloured Retinal Oil Droplets) • 2.4× Human Acuity',
    fieldOfView: '260° Total with Dual Foveae (Deep Telephoto Central Fovea + Wide Temporal Fovea)',
    corneaAndLens: '15 Bony Scleral Ossicle Plates Prevent 389 km/h Wind Pressure from Deforming the Cornea During a Stoop!',
    hasScleralOssicles: true,
    irisPrimaryHex: '#451a03',
    irisSecondaryHex: '#b45309',
    scleraHex: '#facc15',
    kidVisionSecret:
      'A Peregrine Falcon has TWO zooming zones (foveae) in each eye and processes images at 129 frames per second (twice as fast as humans), letting it spot a pigeon from 3 kilometers away while diving at 389 km/h!',
    museumReference: 'Smithsonian NMNH Division of Birds • Tucker (2000) Journal of Experimental Biology',
  },
  'emperor-penguin': {
    eyeType: 'Amphibious Sub-Zero Diving Avian Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Diamond-to-Round Extreme-Stop Pupil (Constricts to a 1-mm Pinhole on Ice!)',
    eyeballDiameterMm: '32 mm (Flattened Cornea Supported by a Rigid Bony Scleral Ossicle Ring)',
    photoreceptors: 'Blue-Green Shifted Cones & Rods (Lost Red Sensitivity to Peer Into 500m Deep Antarctic Darkness)',
    fieldOfView: '280° Krill-Swarm & Leopard-Seal Detection',
    corneaAndLens: 'Ultra-Flat Cornea (10.2 Diopters) Prevents Underwater Blur When Diving From Air Into Freezing Sea',
    hasScleralOssicles: true,
    irisPrimaryHex: '#3b1d0f',
    irisSecondaryHex: '#9a3412',
    scleraHex: '#e2e8f0',
    kidVisionSecret:
      'On bright Antarctic snow, an Emperor Penguin shrinks its pupil into a tiny square pinhole; seconds later, 500 meters underwater in pitch darkness, its pupil opens 300 times wider in area!',
    museumReference: 'Smithsonian NMNH Antarctic Research Collection • Martin (1999) Penguin Vision',
  },
  'saltwater-crocodile': {
    eyeType: 'Periscopic Waterline Ambush Reptilian Eye',
    pupilType: 'slit',
    pupilShapeLabel: 'Razor-Thin Vertical Slit Pupil + Translucent Underwater Nictitating Goggle',
    eyeballDiameterMm: '34 mm (Dorsally Mounted Periscope Turret with Bony Supraorbital Armor)',
    photoreceptors: 'Horizontal Retinal Visual Streak (Sharp 1D Waterline Horizon Focus) + Red/Orange Tapetum',
    fieldOfView: '270° Waterline Panorama with 25° Forward Strike Overlap',
    corneaAndLens: 'Refractive Air Cornea (Blurs Slightly Underwater, Where Pressure Receptors Take Over)',
    hasScleralOssicles: false,
    tapetumColor: '#f97316',
    irisPrimaryHex: '#a3e635',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#d9f99d',
    kidVisionSecret:
      'A crocodile’s retina has a special horizontal ribbon of super-packed nerve cells called a "foveal streak" that stays aligned with the river riverbank so it can scan the entire shoreline without moving its head!',
    museumReference: 'Smithsonian NMNH Reptile Discovery Center • Nagloo et al. (2016) Journal of Experimental Biology',
  },
  'golden-poison-frog': {
    eyeType: 'Bulging Amphibian Color-Night-Vision Camera Eye',
    pupilType: 'hslit',
    pupilShapeLabel: 'Horizontally Oval Dark-Gold Pupil with Elevating Retractor Bulbi Muscle',
    eyeballDiameterMm: '7 mm (Protruding Dome Eyes That Also Push Down Into the Roof of the Mouth to Help Swallow!)',
    photoreceptors: 'Dual-Rod System (Green Rods + Blue Rods) Enabling Full Color Vision Even in Pitch Darkness!',
    fieldOfView: '350° Almost Complete All-Around Rainforest Leaf-Litter Vision',
    corneaAndLens: 'Steeply Curved Terrestrial Cornea + Protractor Lentis Muscle That Slides the Lens Forward & Back',
    hasScleralOssicles: false,
    irisPrimaryHex: '#422006',
    irisSecondaryHex: '#eab308',
    scleraHex: '#fef08a',
    kidVisionSecret:
      'Frogs are the only vertebrates with TWO different kinds of night-vision rod cells, meaning they can see bright colors in moonlight so dim that humans see only black and white—and they pull their eyeballs down into their mouth roof to push food down their throat!',
    museumReference: 'Smithsonian Tropical Research Institute (STRI, Panama) • Yovanovich et al. (2017)',
  },
  'great-white-shark': {
    eyeType: 'Brain-Heated Pelagic Chondrichthyan Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Deep Midnight-Blue Iris with Mobile Pupil & Protective Cartilaginous Roll-Back',
    eyeballDiameterMm: '48 mm (Warmed Up to 14°C Above Freezing Ocean Water by Red Eye-Muscle Heaters!)',
    photoreceptors: 'Cone-Rich Dorsal Retina Looking Up at Silhouette Prey + Silver Guanine Tapetum Plates',
    fieldOfView: '310° Pelagic Scan with Blind Spot Directly Under the Snout Tip',
    corneaAndLens: 'Iso-Refractive Cornea + Rigid Spherical Crystalline Lens Moved by the Ventral Campanula Halleri Muscle',
    hasScleralOssicles: false,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#0f172a',
    irisSecondaryHex: '#3b82f6',
    scleraHex: '#94a3b8',
    kidVisionSecret:
      'Great White Sharks do NOT have pitch-black lifeless eyes—up close, they have a deep sapphire-blue iris! When biting, they roll their entire eyeball backward 180° inside the socket to expose a tough white cartilage shield!',
    museumReference: 'Smithsonian NMNH Sant Ocean Hall Shark Exhibit • Lisney et al. (2012)',
  },
  'giant-pacific-octopus': {
    eyeType: 'Convergent Cephalopod Rhabdomeric Camera Eye (No Blind Spot!)',
    pupilType: 'w-cephalopod',
    pupilShapeLabel: 'Horizontal Rectangular / W-Curved Slit Pupil for Off-Axis Color Depth Judging',
    eyeballDiameterMm: '45 mm (20M Photoreceptors + Statocyst Gravity Sensor Keeps the Pupil Horizontal!)',
    photoreceptors: 'Single Opsin Rhabdomeric Array + Polarization Sensitivity + Chromatic Aberration Color Sensing!',
    fieldOfView: '340° Periscopic Turret Rotation',
    corneaAndLens: 'Two-Part Fused Spherical Lens (Moves Forward & Back Like a Camera Zoom Lens) + No Blind Spot!',
    hasScleralOssicles: false,
    irisPrimaryHex: '#d97706',
    irisSecondaryHex: '#fef3c7',
    scleraHex: '#b45309',
    kidVisionSecret:
      'Even though octopuses have only ONE color pigment in their retina, scientists discovered their weird W-shaped pupil acts like a prism—splitting colors into different focus depths so the octopus can still match any color on the seafloor! Plus, unlike humans, their optic nerve wires in from behind the retina, so they have ZERO blind spot!',
    museumReference: 'Smithsonian National Zoo Invertebrate Exhibit • Stubbs & Stubbs (2016) PNAS',
  },
  'peacock-mantis-shrimp': {
    eyeType: 'Stalked Trinocular Compound Eye with 16 Photoreceptor Channels',
    pupilType: 'trinocular-compound',
    pupilShapeLabel: 'Three-Zone Compound Hemisphere Divided by a 6-Row Color & Polarization Midband',
    eyeballDiameterMm: '11 mm Stalked Ommatidial Globes (10,000+ Hexagonal Facets per Eye!)',
    photoreceptors: '12–16 Photoreceptor Types (Deep UV 300 nm to Far-Red 720 nm + Linear & Circular Polarized Light!)',
    fieldOfView: '360° Independent Gimballed Stalk Rotation (Trinocular Depth Perception in a Single Eye!)',
    corneaAndLens: 'Thousands of Crystalline Cones + Quarter-Wave Retarder Microvilli for Circular Polarization',
    hasScleralOssicles: false,
    irisPrimaryHex: '#10b981',
    irisSecondaryHex: '#f43f5e',
    scleraHex: '#38bdf8',
    kidVisionSecret:
      'Each ONE of a Peacock Mantis Shrimp’s eyes has three separate "pseudopupils" looking at the same spot from three angles at once—giving it 3D depth perception with a single eye, plus 16 kinds of color/UV/polarization sensors (humans only have 3)!',
    museumReference: 'Smithsonian Marine Station • Marshall & Oberwinkler (1999) Nature',
  },
  'west-indian-ocean-coelacanth': {
    eyeType: 'Abyssal Volcanic-Cave Sarcopterygian Tapetal Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Wide-Aperture Circular Pupil with Brilliant Emerald-Silver Guanine Mirror',
    eyeballDiameterMm: '52 mm (Encased in a Complete Ring of 18 Bony Scleral Ossicle Plates)',
    photoreceptors: '98.5% Rods Tuned to 473 nm Deep-Ocean Blue Light + Guanine Crystal Tapetum Lucidum',
    fieldOfView: '260° Volcanic Lava-Cave & Slope Scan',
    corneaAndLens: 'Clear Spectacle Dome + Large Spherical Deep-Sea Crystalline Lens',
    hasScleralOssicles: true,
    tapetumColor: '#34d399',
    irisPrimaryHex: '#059669',
    irisSecondaryHex: '#a7f3d0',
    scleraHex: '#94a3b8',
    kidVisionSecret:
      'Living 200 to 700 meters deep where almost all sunlight has vanished, the Coelacanth’s retina is tuned to the exact 473-nanometer wavelength of glowing deep-sea bioluminescent prey!',
    museumReference: 'Smithsonian NMNH Coelacanth Specimen USNM 205871 • Yokoyama et al. (1999)',
  },
  coelacanth: {
    eyeType: 'Abyssal Volcanic-Cave Sarcopterygian Tapetal Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Wide-Aperture Circular Pupil with Brilliant Emerald-Silver Guanine Mirror',
    eyeballDiameterMm: '52 mm (Encased in a Complete Ring of 18 Bony Scleral Ossicle Plates)',
    photoreceptors: '98.5% Rods Tuned to 473 nm Deep-Ocean Blue Light + Guanine Crystal Tapetum Lucidum',
    fieldOfView: '260° Volcanic Lava-Cave & Slope Scan',
    corneaAndLens: 'Clear Spectacle Dome + Large Spherical Deep-Sea Crystalline Lens',
    hasScleralOssicles: true,
    tapetumColor: '#34d399',
    irisPrimaryHex: '#059669',
    irisSecondaryHex: '#a7f3d0',
    scleraHex: '#94a3b8',
    kidVisionSecret:
      'Living 200 to 700 meters deep where almost all sunlight has vanished, the Coelacanth’s retina is tuned to the exact 473-nanometer wavelength of glowing deep-sea bioluminescent prey!',
    museumReference: 'Smithsonian NMNH Coelacanth Specimen USNM 205871 • Yokoyama et al. (1999)',
  },
  'archelon-ischyros': {
    eyeType: 'Pelagic Marine Testudine Scleral-Ring Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil Supported by 12 Overlapping Bony Scleral Ossicles + Salt-Excreting Lacrymal Gland',
    eyeballDiameterMm: '58 mm (Protected by Overhanging Bony Prefrontal Skull Roof Plates)',
    photoreceptors: 'Tetrachromatic Cone Oil-Droplet Array + Bioluminescent Jellyfish Rod Sensitivity',
    fieldOfView: '280° Western Interior Seaway Jellyfish & Ammonite Scan',
    corneaAndLens: 'Flattened Marine Cornea + Spherical Underwater Lens + Giant Orbital Salt Gland Behind Each Eye',
    hasScleralOssicles: true,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#78350f',
    irisSecondaryHex: '#f59e0b',
    scleraHex: '#d6d3d1',
    kidVisionSecret:
      'Behind each of Archelon’s eyeballs sat a giant salt gland bigger than its actual brain—crying out thick salty tears to dump excess ocean salt from eating thousands of Cretaceous jellyfish!',
    museumReference: 'Peabody Museum of Natural History / Smithsonian NMNH Marine Turtle Osteology',
  },
  'leedsichthys-problematicus': {
    eyeType: 'Colossal Jurassic Suspension-Feeding Pachycormiform Teleost Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Plankton-Scanning Pupil Encased in a Bony Scleral Ring',
    eyeballDiameterMm: '95 mm (Grapefruit-Sized Lateral Eye Positioned Ahead of the Giant Gill Basket)',
    photoreceptors: 'UV/Blue-Sensitive Cone & Rod Retina Tuned for Spotting Translucent Zooplankton Swarms',
    fieldOfView: '300° Lateral & Forward Plankton-Cloud Detection',
    corneaAndLens: 'Spherical Gradient-Index Fish Crystalline Lens Protruding Through the Pupil Aperture',
    hasScleralOssicles: true,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#1e3a8a',
    irisSecondaryHex: '#93c5fd',
    scleraHex: '#cbd5e1',
    kidVisionSecret:
      'At 16.5 meters long, Leedsichthys was the largest bony fish ever to swim on Earth—using grapefruit-sized eyes tuned to ultraviolet light to spot clouds of tiny glowing shrimp in Jurassic seas!',
    museumReference: 'Natural History Museum London / Liston et al. (2013) Pachycormid Paleobiology',
  },
  'axolotl': {
    eyeType: 'Neotenic Aquatic Urodelian Camera Eye (Can Regenerate Its Own Retina & Lens!)',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Lidless Pupil Framed by an Iridescent Golden Xanthophore Ring',
    eyeballDiameterMm: '5.5 mm (Jewel-Like Lidless Aquatic Eye with Gold Chromatophore Iris)',
    photoreceptors: 'Cone & Dual-Rod Amphibian Retina Capable of Complete Stem-Cell Regeneration!',
    fieldOfView: '280° Benthic Lake-Bottom Scan',
    corneaAndLens: 'Spherical Aquatic Lens That Can Regrow From Iris Epithelial Cells if Damaged (Wolffian Regeneration)',
    hasScleralOssicles: false,
    irisPrimaryHex: '#ca8a04',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#f472b6',
    kidVisionSecret:
      'If an Axolotl’s eye lens or retina is injured, pigmented cells in the top of its iris transform into stem cells and grow a brand-new, working crystalline lens and optic nerve!',
    museumReference: 'Smithsonian National Zoo Amphibian Conservation Lab • Suetsugu-Maki et al. (2012)',
  },
  'komodo-dragon': {
    eyeType: 'Diurnal All-Cone Varanid Reptilian Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Diurnal Pupil Set Inside a Bony Scleral Ossicle Ring & Osteoderm Brow',
    eyeballDiameterMm: '22 mm (Sharp Daytime Color Vision Up to 300 Meters Away)',
    photoreceptors: '100% Cone-Dominated Retina with Oil-Droplet Color Filters (Excellent Daytime Color, Poor Night Vision)',
    fieldOfView: '260° Savanna Ambush Scan',
    corneaAndLens: '15 Scleral Ossicle Plates + Rapid Ciliary Accommodation for Tracking Sprinting Deer',
    hasScleralOssicles: true,
    irisPrimaryHex: '#92400e',
    irisSecondaryHex: '#f59e0b',
    scleraHex: '#d6d3d1',
    kidVisionSecret:
      'Unlike nocturnal geckos, Komodo Dragons have almost ZERO night-vision rods in their eyes—their retinas are packed purely with color-sensing cones so they can spot moving prey 300 meters away in blazing tropical sunlight, then sleep at night!',
    museumReference: 'Smithsonian National Zoo Komodo Dragon Research Program',
  },
  'woolly-mammoth': {
    eyeType: 'Pleistocene Blizzard-Adapted Proboscidean Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil Protected by Deep Periorbital Fur & Sebaceous Anti-Freeze Glands',
    eyeballDiameterMm: '38 mm (Preserved in Siberian Permafrost Mummies like Lyuba & Yuka!)',
    photoreceptors: 'Arrhythmic Polar Daylight / 24-Hour Arctic Winter Night Adaptation',
    fieldOfView: '290° Mammoth-Steppe Horizon Scan',
    corneaAndLens: 'Thickened Oily Tear Film Prevented Corneal Freezing at -50°C Windchill',
    hasScleralOssicles: false,
    tapetumColor: '#fde047',
    irisPrimaryHex: '#78350f',
    irisSecondaryHex: '#d97706',
    scleraHex: '#e7e5e4',
    kidVisionSecret:
      'Frozen mammoth calves discovered in Siberian permafrost still have their actual eyelashes and eyelids preserved after 40,000 years—showing extra-thick oil glands that kept their eyes from freezing solid in Ice Age blizzards!',
    museumReference: 'Smithsonian NMNH Deep Time Hall Woolly Mammoth Mount • Siberian Permafrost Necropsies',
  },
  'smilodon-fatalis': {
    eyeType: 'Stereoscopic Binocular Machairodont Saber-Tooth Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Large Circular Crepuscular Pupil for Precision Neck-Bite Targeting',
    eyeballDiameterMm: '37 mm (Forward-Rotated Orbits in Rancho La Brea Skulls)',
    photoreceptors: 'High-Acuity Central Area + Reflective Tapetum Lucidum for Tar-Pit Twilight Hunts',
    fieldOfView: '205° with High Binocular 3D Overlap (~115°)',
    corneaAndLens: 'Large Anterior Chamber Protected by Heavy Postorbital Brow Bars',
    hasScleralOssicles: false,
    tapetumColor: '#facc15',
    irisPrimaryHex: '#d97706',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#f5f5f4',
    kidVisionSecret:
      'Because Smilodon’s 28-centimeter saber fangs could snap if they hit solid bone, its forward-facing eyes gave it surgical 3D depth perception to aim its bite within millimeters on struggling Ice Age bison!',
    museumReference: 'Smithsonian NMNH Smilodon fatalis Holotype & La Brea Collection (USNM)',
  },
  'otodus-megalodon': {
    eyeType: 'Giant Endothermic Lamniform Apex Predator Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Deep Sapphire-Cobalt Iris with Circular Pupil & Cranial Heater Rete Mirabile',
    eyeballDiameterMm: '90 – 105 mm (Softball-Sized Heated Eye for Hunting Whales From Below!)',
    photoreceptors: 'Dorsal High-Acuity Retinal Strip + Silver Guanine Tapetum Lucidum',
    fieldOfView: '300° Pelagic Silhouette Tracking',
    corneaAndLens: 'Massive Spherical Crystalline Lens Warmed by Red Swimming Muscle Heat Exchangers',
    hasScleralOssicles: false,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#1e293b',
    irisSecondaryHex: '#60a5fa',
    scleraHex: '#94a3b8',
    kidVisionSecret:
      'Like its modern cousin the Great White Shark, Megalodon pumped warm blood from its swimming muscles directly behind its softball-sized eyes and brain—keeping its vision super-fast even in cold deep water!',
    museumReference: 'Smithsonian NMNH Sant Ocean Hall Carcharocles megalodon Jaw Reconstruction',
  },
  'dunkleosteus-terrelli': {
    eyeType: 'Bony-Armored Devonian Placoderm Scleral-Ring Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil Encased in a Solid 4-Plate Bony Scleral Armor Capsule',
    eyeballDiameterMm: '85 mm (Fossilized Bony Eyeball Rings Found Intact Inside Cleveland Shale Skulls!)',
    photoreceptors: 'Early Gnathostome Tetrachromatic Cone + Rod Retina',
    fieldOfView: '270° Devonian Reef & Pelagic Scan',
    corneaAndLens: '4 Fused Dermal Scleral Bone Plates Held the Eyeball Rigid During 50-Millisecond Suction Strikes',
    hasScleralOssicles: true,
    irisPrimaryHex: '#b45309',
    irisSecondaryHex: '#fbbf24',
    scleraHex: '#d6d3d1',
    kidVisionSecret:
      'Even the eyeballs of Dunkleosteus had bone armor! Paleontologists found complete bony rings of four curved plates right inside its eye sockets that stopped its eyeballs from buckling when its jaws snapped open in 1/50th of a second!',
    museumReference: 'Cleveland Museum of Natural History / Smithsonian NMNH Devonian Placoderm Collection',
  },
  'anomalocaris-canadensis': {
    eyeType: 'Stalked 16,000-Lens Cambrian Compound Eye',
    pupilType: 'compound',
    pupilShapeLabel: 'Hexagonal Honeycomb Array of 16,000+ Ommatidia Lenses with Dark Pseudopupil',
    eyeballDiameterMm: '25 – 30 mm Pear-Shaped Stalked Compound Eyes (Fossilized in Emu Bay & Burgess Shale!)',
    photoreceptors: '16,000+ Individual Rhabdomeric Ommatidia per Eye (Among the Sharpest Arthropodan Eyes Ever!)',
    fieldOfView: '340° Panoramic Cambrian Seafloor & Midwater Tracking',
    corneaAndLens: '16,000 Individual Calcite/Chitinous Hexagonal Micro-Lenses (60–110 Microns Each)',
    hasScleralOssicles: false,
    irisPrimaryHex: '#e11d48',
    irisSecondaryHex: '#fda4af',
    scleraHex: '#881337',
    kidVisionSecret:
      'In 2011, paleontologists found actual 515-million-year-old fossilized Anomalocaris eyes in Australia with over 16,000 microscopic hexagonal lenses per eye—30 times more lenses than a housefly, proving vision helped spark the Cambrian Explosion!',
    museumReference: 'Smithsonian NMNH Charles D. Walcott Burgess Shale Collection • Paterson et al. (2011) Nature',
  },
  'meganeura-monyi': {
    eyeType: 'Wraparound 30,000-Ommatidia Aerial Interceptor Compound Eye',
    pupilType: 'compound',
    pupilShapeLabel: 'Dual-Zone Dorsal/Ventral Hexagonal Facet Array with High-Acuity Sky Fovea',
    eyeballDiameterMm: '18 mm Globular Wraparound Compound domes Covering 80% of the Head',
    photoreceptors: 'Up to 30,000 Ommatidia per Eye with UV/Blue Dorsal Sky-Contrast Channels & 250 Hz Flicker Fusion',
    fieldOfView: '355° Near-Complete Spherical Aerial Intercept Envelope',
    corneaAndLens: '30,000 Chitinous Corneal Facets; Larger Upper Facets Track Flying Prey Against Bright Swamp Skies',
    hasScleralOssicles: false,
    irisPrimaryHex: '#047857',
    irisSecondaryHex: '#6ee7b7',
    scleraHex: '#064e3b',
    kidVisionSecret:
      'Like modern dragonflies on a giant scale, Meganeura’s wraparound compound eyes had nearly 30,000 hexagonal mini-lenses split into two zones: giant top lenses to spot insects against bright clouds, and smaller bottom lenses to scan dark Carboniferous coal swamps!',
    museumReference: 'Muséum National d’Histoire Naturelle Paris / Smithsonian NMNH Paleoentomology',
  },
  'titanoboa-cerrejonensis': {
    eyeType: 'Amphibious Paleocene Constrictor Eye + Labial Thermal Vision',
    pupilType: 'slit',
    pupilShapeLabel: 'Vertical Elliptical Slit Pupil Covered by a Transparent Fused Eyecap (Brille)',
    eyeballDiameterMm: '24 mm (Dorsolaterally Positioned for Murky Tropical River Ambush)',
    photoreceptors: 'Duplex Rod/Cone Retina + Trigeminal Infrared Thermal Pit Sensing',
    fieldOfView: '240° Water-Surface & Canopy Scan',
    corneaAndLens: 'No Movable Eyelids! Protected by a Clear Keratin Spectacle Scale ("Brille") Shed With the Skin',
    hasScleralOssicles: false,
    irisPrimaryHex: '#a16207',
    irisSecondaryHex: '#facc15',
    scleraHex: '#ca8a04',
    kidVisionSecret:
      'Snakes like Titanoboa never blink because they have no eyelids! Instead, a clear armor scale called a "brille" covers each eye like a permanent diving mask so murky Paleocene swamp water could never scratch its cornea!',
    museumReference: 'Smithsonian Tropical Research Institute & NMNH Cerrejón Titanoboa Expedition',
  },
  'paraceratherium-transouralicum': {
    eyeType: 'High-Canopy Giant Perissodactyl Mammalian Camera Eye',
    pupilType: 'hslit',
    pupilShapeLabel: 'Horizontally Oval Ungulate Pupil Situated 6 Meters Above the Ground',
    eyeballDiameterMm: '46 mm (Elevated High on the Skull Below the Huge Nasal Horn-Free Arch)',
    photoreceptors: 'Dichromatic Ungulate Cone Array + Wide Horizontal Retinal Visual Streak',
    fieldOfView: '310° Oligocene Woodland & Floodplain Horizon Scan',
    corneaAndLens: 'Large Terrestrial Cornea with Cyclovergence (Eyeballs Rotate to Keep the Pupil Level When Lowering Head!)',
    hasScleralOssicles: false,
    irisPrimaryHex: '#78350f',
    irisSecondaryHex: '#d97706',
    scleraHex: '#e7e5e4',
    kidVisionSecret:
      'With its head towering 6 meters (20 feet) in the air, Paraceratherium had the highest living watchtower of any mammal in history—and like modern rhinos and horses, its eyeballs rotated in their sockets whenever it raised or lowered its neck!',
    museumReference: 'American Museum of Natural History / Smithsonian NMNH Paleobiology Perissodactyls',
  },
  'inostrancevia-alexandri': {
    eyeType: 'Permian Saber-Toothed Synapsid Scleral-Ring Camera Eye',
    pupilType: 'slit',
    pupilShapeLabel: 'Vertical Cat-Like Ambush Slit Framed by an Ancestral Bony Scleral Ring',
    eyeballDiameterMm: '35 mm (Deeply Recessed Inside Rugose Bony Supraorbital Brow Bosses)',
    photoreceptors: 'Nocturnal/Crepuscular Synapsid Rod-Rich Retina (Evolving During the "Nocturnal Bottleneck")',
    fieldOfView: '220° with Forward-Angled Binocular Strike Overlap',
    corneaAndLens: 'Retained Ancestral Synapsid Bony Scleral Ossicle Ring (Later Lost in True Mammals!)',
    hasScleralOssicles: true,
    tapetumColor: '#fbbf24',
    irisPrimaryHex: '#dc2626',
    irisSecondaryHex: '#fca5a5',
    scleraHex: '#d6d3d1',
    kidVisionSecret:
      'Even though Inostrancevia was a stem-mammal synapsid (closer to us than to lizards!), fossils show gorgonopsids still had a ring of tiny bone plates inside their eyeballs—a feature our mammal ancestors later lost!',
    museumReference: 'Paleontological Institute Moscow / Angielczyk & Kammerer (2018) Synapsid Vision',
  },
  'shonisaurus-popularis': {
    eyeType: 'Largest Vertebrate Eye in Earth History (Deep-Diving Ichthyosaur)',
    pupilType: 'round',
    pupilShapeLabel: 'Colossal Wide-Aperture Pupil Framed by 15 Massive Bony Scleral Ossicle Plates',
    eyeballDiameterMm: '300 mm (30 Centimeters / Basketball-Sized — 100× the Light-Gathering Area of a Human Eye!)',
    photoreceptors: 'Ultra-Sensitive Deep-Sea Rod Array Capable of Seeing Giant Squid at 1,000 Meters Depth',
    fieldOfView: '280° Mesopelagic & Bathypelagic Twilight Scan',
    corneaAndLens: 'Fossilized 30-cm Scleral Bone Ring Resisted Crushing Water Pressure During High-Speed Dives',
    hasScleralOssicles: true,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#0284c7',
    irisSecondaryHex: '#7dd3fc',
    scleraHex: '#cbd5e1',
    kidVisionSecret:
      'Ichthyosaurs like Shonisaurus evolved the BIGGEST eyeballs of any vertebrate that ever lived—up to 30 centimeters (12 inches) across, the size of a basketball! That huge aperture let them spot glowing giant squid half a mile deep in pitch-black Triassic oceans!',
    museumReference: 'Berlin Ichthyosaur State Park / Motani et al. (1999) Nature — Largest Eyes in Vertebrates',
  },
  'megatherium-americanum': {
    eyeType: 'Diurnal Bipedal-Browsing Xenarthran Mammalian Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Circular Pupil Recessed Behind Heavy Zygomatic Cheek Flanges',
    eyeballDiameterMm: '34 mm (Protected from Thorny Acacia Branches by Thick Fibrous Eyelids)',
    photoreceptors: 'Rod-Dominated Xenarthran Retina + Protective Harderian Tear Secretions',
    fieldOfView: '250° Pampas Grassland & Tree-Canopy Scan',
    corneaAndLens: 'Thick Corneal Epithelium Shielded Against Dust and Thorny Branches While Pulling Down Trees',
    hasScleralOssicles: false,
    irisPrimaryHex: '#713f12',
    irisSecondaryHex: '#ca8a04',
    scleraHex: '#e7e5e4',
    kidVisionSecret:
      'While modern tree sloths have very blurry eyesight in bright sunlight, giant ground sloths like Megatherium stood 4 meters tall in open sunlit savannas and used deep bone shields around their eyes to protect them while snapping thorny branches!',
    museumReference: 'Museo de Ciencias Naturales Madrid / Smithsonian NMNH Pleistocene Xenarthra',
  },
  'doedicurus-clavicaudatus': {
    eyeType: 'Helmet-Shielded Cingulate Glyptodont Mammalian Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Deep-Set Circular Pupil Recessed Inside a Bony Casque Cephalic Shield',
    eyeballDiameterMm: '26 mm (Armored Behind Thick Supraorbital Osteoderm Rosettes)',
    photoreceptors: 'Low-Glare Dichromatic Pampas Grazing Retina',
    fieldOfView: '280° Lateral Tail-Club Swing & Predator Alert Scan',
    corneaAndLens: 'Dust-Resistant Cornea Protected by Bony Eyebrow Scutes During Tail-Club Duels',
    hasScleralOssicles: false,
    irisPrimaryHex: '#92400e',
    irisSecondaryHex: '#fbbf24',
    scleraHex: '#d6d3d1',
    kidVisionSecret:
      'Because Doedicurus swung its 65-kilogram spiked tail club backward by watching over its shoulder, its eyes sat on the sides of its armored head helmet with a clear view all the way back to its tail!',
    museumReference: 'Museo de La Plata / Smithsonian NMNH South American Megafauna Collection',
  },
  'livyatan-melvillei': {
    eyeType: 'Raptorial Macroraptorial Sperm-Whale Camera Eye',
    pupilType: 'hslit',
    pupilShapeLabel: 'Horizontally Oval Cetacean Pupil Built for Surface-to-Depth Whale Hunting',
    eyeballDiameterMm: '85 mm (Positioned Behind the Giant Spermaceti-Basin Maxilla)',
    photoreceptors: 'High-Contrast Pelagic Rod Array + Reflective Tapetum Fibrosum',
    fieldOfView: '270° Lateral & Ventral Baleen-Whale Tracking',
    corneaAndLens: 'Thick Pressure-Resistant Sclera + Spherical Underwater Lens Paired with Biosonar Echolocation',
    hasScleralOssicles: false,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#1e3a8a',
    irisSecondaryHex: '#93c5fd',
    scleraHex: '#cbd5e1',
    kidVisionSecret:
      'Unlike modern sperm whales that hunt tiny squid in total darkness a mile deep, Livyatan hunted giant baleen whales near the sunlit ocean surface—combining powerful echolocation sonar with huge 8.5-centimeter eyes!',
    museumReference: 'Muséum National d’Histoire Naturelle / Lambert et al. (2010) Nature (Pisco Formation, Peru)',
  },
  'sarcosuchus-imperator': {
    eyeType: 'Telescoped Dorsal-Periscope Pholidosaur Crocodylomorph Eye',
    pupilType: 'slit',
    pupilShapeLabel: 'Vertical Ambush Slit Pupil Raised High on Bony Dorsal Periscope Turrets',
    eyeballDiameterMm: '48 mm (Elevated Above the Skull Roof so Only the Eyes & Nostril BulbBroke the Water!)',
    photoreceptors: 'Horizontal Waterline Foveal Streak + Orange-Gold Guanine Tapetum Lucidum',
    fieldOfView: '280° Cretaceous Riverbank Ambush Panorama',
    corneaAndLens: 'Bony Palpebral Eyelid Armor Plates Shielded the Top of the Eyeball from Struggling Dinosaur Prey!',
    hasScleralOssicles: false,
    tapetumColor: '#f59e0b',
    irisPrimaryHex: '#84cc16',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#ecfccb',
    kidVisionSecret:
      'Sarcosuchus had a special bony "eyelid plate" (palpebral bone) right above each eye like a built-in armored visor, and its sockets tilted upward like submarine periscopes so its 8-ton body could hide completely underwater!',
    museumReference: 'National Geographic Society / Sereno et al. (2001) Science ("SuperCroc" Gadoufaoua Specimen)',
  },
  'basilosaurus-cetoides': {
    eyeType: 'Shallow-Tethys Archaeocete Early Whale Camera Eye',
    pupilType: 'round',
    pupilShapeLabel: 'Large Circular Sunlit-Lagoon Hunting Pupil Under a Broad Supraorbital Shield',
    eyeballDiameterMm: '62 mm (Protected by a Shelf-Like Brow Bone Overhanging the Orbit)',
    photoreceptors: 'Bright-Light Coastal Lagoon Cone & Rod Array (Before Whales Evolved High-Frequency Biosonar!)',
    fieldOfView: '260° Shallow Coral-Sea & Mangrove Hunting Scan',
    corneaAndLens: 'Spherical Aquatic Lens; Relied Heavily on Vision & Low-Frequency Hearing Since It Lacked a Forehead Melon!',
    hasScleralOssicles: false,
    tapetumColor: '#38bdf8',
    irisPrimaryHex: '#b45309',
    irisSecondaryHex: '#fde047',
    scleraHex: '#cbd5e1',
    kidVisionSecret:
      'Because Basilosaurus lived 38 million years ago before whales evolved high-frequency sonar ("echolocation"), it relied on huge, sharp eyes tucked under a bony sun-visor brow ridge to hunt sharks in clear tropical lagoons!',
    museumReference: 'Smithsonian NMNH Sant Ocean Hall 36-Foot Basilosaurus cetoides Skeleton (USNM 4675)',
  },
};

export function getOcularBiology(
  animalOrId:
    | string
    | { id: string; archetype?: string; visualPalette?: { eyeColor?: string } },
  archetypeArg?: string,
  eyeColorHexArg?: string
): OcularBiologyProfile {
  const animalId = typeof animalOrId === 'string' ? animalOrId : animalOrId.id;
  const archetype =
    typeof animalOrId === 'string'
      ? archetypeArg ?? 'feline_predator'
      : animalOrId.archetype ?? 'feline_predator';
  const eyeColorHex =
    typeof animalOrId === 'string'
      ? eyeColorHexArg ?? '#d97706'
      : animalOrId.visualPalette?.eyeColor ?? '#d97706';

  const exact = OCULAR_BIOLOGY_BY_SPECIES[animalId];
  if (exact) return exact;

  // Fallback for live GBIF/PBDB dynamically discovered species
  const isArthropod = archetype === 'arthropod';
  const isCephalopod = archetype === 'cephalopod';
  const isRaptor = archetype === 'avian_raptor' || archetype === 'penguin';
  const isCroc = archetype === 'crocodilian';

  return {
    eyeType: isArthropod
      ? 'compound-hex'
      : isCephalopod
      ? 'cephalopod-camera'
      : 'vertebrate-camera',
    pupilType: isArthropod
      ? 'compound'
      : isCephalopod
      ? 'w-cephalopod'
      : isCroc
      ? 'slit'
      : 'round',
    pupilShapeLabel: isArthropod
      ? 'Hexagonal Ommatidia Honeycomb Array with Pseudopupil'
      : isCephalopod
      ? 'W-Shaped Chromatic-Focus Slit Pupil'
      : isCroc
      ? 'Vertical Ambush Slit Pupil'
      : 'Circular Autonomic Pupil with Iris Stroma Fibers',
    eyeballDiameterMm: '24 – 45 mm (Species-Scaled Orbital Globe)',
    photoreceptors: isArthropod
      ? 'Thousands of Rhabdomeric Ommatidia Units'
      : 'Rods (Low-Light Sensitivity) + Multi-Opsin Cones (Color Discrimination)',
    fieldOfView: '240° – 320° Habitat Scan',
    corneaAndLens: 'Refractive Tear-Film Cornea (IOR 1.376) + Focusing Crystalline Lens',
    hasScleralOssicles: isRaptor || isCroc,
    tapetumColor: isCroc ? '#f97316' : undefined,
    irisPrimaryHex: eyeColorHex || '#d97706',
    irisSecondaryHex: '#fef08a',
    scleraHex: '#e7e5e4',
    kidVisionSecret:
      'Rotate and zoom right up to the eyeball to inspect its radial iris muscle fibers, pupil shape, vascular sclera, and wet refractive cornea!',
    museumReference: 'Smithsonian National Museum of Natural History (NMNH) & Global Biodiversity Information Facility',
  };
}
