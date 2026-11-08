import { AnatomyHotspot } from '../types/atlas';
import { AnatomyAnchor } from './bodyPlans';

/**
 * Resolves where on the 3D body a hotspot pin should be anchored.
 * Explicit `hotspot.anchor` wins; otherwise keyword rules (first match wins),
 * then a sensible default per anatomy layer.
 */

const RULES: Array<[RegExp, AnatomyAnchor]> = [
  [/trunk|proboscis/i, 'trunk'],
  [/tusk/i, 'tusk'],
  [/horn|crest/i, 'horn'],
  [/frill/i, 'frill'],
  [/sail/i, 'sail'],
  [/fluke|caudal|peduncle|tail fan|tailfan/i, 'caudalFin'],
  [/\btail\b|bobtail/i, 'tail'],
  [/wing|remig|feather|quill|patagi/i, 'wing'],
  [/pectoral|flipper|lobe fin|paddle/i, 'pectoralFin'],
  [/dorsal fin/i, 'dorsalFin'],
  [/gill|branchi|spiracle|trache/i, 'gills'],
  [/antenna/i, 'antenna'],
  [/club|dactyl|raptorial|appendage|sickle|talon/i, 'claws'],
  [/sucker|tentacle|arm\b|arms\b|forelimb|humerus|biceps|shoulder|scapula|pole-vault|vault/i, 'forelimb'],
  [/hindlimb|femur|thigh|leg\b|legs\b|hock|plantaris|catapult|urostyle/i, 'hindlimb'],
  [/paw|foot|feet|pad\b|hoof|toe|cushion|snowshoe|tarso/i, 'foot'],
  [/ear|pinna/i, 'ear'],
  [/eye|optic|ocular|lens|compound|ommatid|vision|binocular/i, 'eye'],
  [/brain|olfactory|cerebell|cochlea|neural|nervous|endocast/i, 'brain'],
  [/skull|cranium|cranial|jaw|mandib|teeth|tooth|dentition|canine|fang|beak|rostrum|baleen|tongue|bite|blade|gnathal|oral|mouth|pterygoid|saber/i, 'jaw'],
  [/nostril|nares|nasal|snout|tubercle|rosette/i, 'snout'],
  [/heart|ventric|cardiac|aort|hemoglobin|blood|vessel|rete|hemocyanin/i, 'heart'],
  [/lung|air sac|air-sac|respirat|breath|blowhole|bladder/i, 'lungs'],
  [/stomach|gut|intestin|liver|digest|gizzard|crop|ink|spiral valve|hepat/i, 'belly'],
  [/pelvi|hip|vestigial|synsacrum|sacr/i, 'hips'],
  [/vertebra|spine|notochord|neck|cervical|backbone|column|ossified tendon/i, 'spine'],
  [/rib|keel|sternum|gastralia|thorax|thoracic|chest|pectoralis/i, 'chest'],
  [/fur|coat|hair|pelage|skin|scale|scute|osteoderm|armor|armour|plate|denticle|plumage|integument|chromatophore|papill|camouflage|pigment|stripe|guard hair|membrane|pycnofib|epiderm|cosmoid/i, 'skin'],
  [/muscle|muscul|tendon|locomot|fiber|fibre|flight engine|propuls|flap|swim/i, 'flank'],
];

const LAYER_DEFAULT: Record<AnatomyHotspot['layer'], AnatomyAnchor> = {
  exterior: 'skin',
  muscular: 'flank',
  skeletal: 'skull',
  organs: 'heart',
};

export function resolveAnchor(hotspot: Pick<AnatomyHotspot, 'name' | 'layer' | 'anchor' | 'system'>): AnatomyAnchor {
  if (hotspot.anchor) return hotspot.anchor;
  for (const [re, anchor] of RULES) {
    if (re.test(hotspot.name)) return anchor;
  }
  if (hotspot.system === 'Cardiovascular') return 'heart';
  if (hotspot.system === 'Respiratory') return 'lungs';
  if (hotspot.system === 'Digestive') return 'belly';
  if (hotspot.system === 'Nervous & Sensory') return 'brain';
  if (hotspot.system === 'Skeletal') return 'skull';
  return LAYER_DEFAULT[hotspot.layer];
}
