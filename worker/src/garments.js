// How each garment should be described to the image model. The model sees the
// front view in garments/<id>.jpg, but it needs the cut in words: without
// "no sleeves", it happily knits sleeves down the dog's legs.
// Ids match src/wardrobe.ts in the site.
export const GARMENTS = {
  blue: {
    look: 'sleeveless light sky-blue cable knit dog jumper with a ribbed turtleneck',
    fit: 'It covers the chest and back and has no sleeves: both front legs come out bare through round ribbed leg holes, so the fur of the legs stays visible.',
  },
  beige: {
    look: 'sleeveless oat-coloured teddy fleece dog vest with a hood and one small brass snap button at the chest',
    fit: 'It is soft curly sherpa fleece, covers the chest and back, the hood rests behind the head, and it has no sleeves: both front legs come out bare through round leg holes.',
  },
  lines: {
    look: 'sleeveless cream knit dog jumper with rust-orange horizontal stripes and a ribbed roll neck',
    fit: 'The stripes run around the body. It covers the chest and back and has no sleeves: both front legs come out bare through round ribbed leg holes.',
  },
  yellow: {
    look: 'glossy mustard-yellow dog rain slicker with a hood, round snap buttons and short elasticated sleeves',
    fit: 'It is shiny waterproof coated fabric. It covers the back and chest, the hood rests behind the head, and the short sleeves cover only the top of the front legs.',
  },
  green: {
    look: 'sleeveless moss-green chunky cable knit dog vest with a ribbed turtleneck',
    fit: 'It is a vest with no sleeves at all, like a tank top: it covers only the chest and back, and both front legs come out completely bare through round ribbed leg holes at the shoulders, so the fur of both front legs stays fully visible.',
  },
}

export function prompt(id) {
  const g = GARMENTS[id]
  return `Edit image 0: dress the dog in the ${g.look} shown in image 1. ${g.fit} Keep the dog's face, eyes, fur colour and texture, body shape and pose, and the whole background, exactly the same as in image 0: only add the garment. The garment fits snugly and matches image 1 in colour, material and pattern. Realistic photo, natural light.`
}
