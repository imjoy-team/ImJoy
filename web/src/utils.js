
// wordgenjs from https://github.com/gurshabad/wordgenjs
const arrAnimals = ['Aardvark', 'Albatross', 'Alligator', 'Alpaca', 'Ant', 'Anteater', 'Antelope', 'Ape', 'Armadillo', 'Ass_Donkey', 'Baboon', 'Badger', 'Barracuda', 'Bat', 'Bear', 'Beaver', 'Bee', 'Bison', 'Boa', 'Buffalo', 'Butterfly', 'Camel', 'Capybara', 'Caribou', 'Cassowary', 'Cat', 'Caterpillar', 'Cattle', 'Chamois', 'Cheetah', 'Chicken', 'Chimpanzee', 'Chinchilla', 'Chough', 'Clam', 'Cobra', 'Cockroach', 'Cod', 'Cormorant', 'Coyote', 'Crab', 'Crane', 'Crocodile', 'Crow', 'Curlew', 'Deer', 'Dinosaur', 'Dog', 'Dogfish', 'Dolphin', 'Donkey', 'Dotterel', 'Dove', 'Dragonfly', 'Duck', 'Dugong', 'Dunlin', 'Eagle', 'Echidna', 'Eel', 'Eland', 'Elephant', 'Elephantseal', 'Elk', 'Emu', 'Falcon', 'Ferret', 'Finch', 'Fish', 'Flamingo', 'Fox', 'Frog', 'Gaur', 'Gazelle', 'Gerbil', 'GiantPanda', 'Giraffe', 'Gnat', 'Gnu', 'Goat', 'Goose', 'Goldfinch', 'Goldfish', 'Gorilla', 'Goshawk', 'Grasshopper', 'Grouse', 'Guanaco', 'Guineafowl', 'Guineapig', 'Gull', 'Hamster', 'Hare', 'Hawk', 'Hedgehog', 'Heron', 'Herring', 'Hippopotamus', 'Hornet', 'Horse', 'Human', 'Hummingbird', 'Hyena', 'Ibex', 'Ibis', 'Jackal', 'Jaguar', 'Jay', 'Jellyfish', 'Kangaroo', 'Kingfisher', 'Koala', 'Komodo', 'Kookabura', 'Kouprey', 'Kudu', 'Lapwing', 'Lark', 'Lemur', 'Leopard', 'Lion', 'Llama', 'Lobster', 'Locust', 'Loris', 'Louse', 'Lyrebird', 'Magpie', 'Mallard', 'Manatee', 'Mandrill', 'Mantis', 'Marten', 'Meerkat', 'Mink', 'Mole', 'Mongoose', 'Monkey', 'Moose', 'Mouse', 'Mosquito', 'Mule', 'Narwhal', 'Newt', 'Nightingale', 'Octopus', 'Okapi', 'Opossum', 'Oryx', 'Ostrich', 'Otter', 'Owl', 'Ox', 'Oyster', 'Panther', 'Parrot', 'Partridge', 'Peafowl', 'Pelican', 'Penguin', 'Pheasant', 'Pig', 'Pigeon', 'PolarBear', 'Pony', 'Porcupine', 'Porpoise', 'PrairieDog', 'Quail', 'Quelea', 'Quetzal', 'Rabbit', 'Raccoon', 'Rail', 'Ram', 'Rat', 'Raven', 'Reddeer', 'Redpanda', 'Reindeer', 'Rhinoceros', 'Rook', 'Salamander', 'Salmon', 'SandDollar', 'Sandpiper', 'Sardine', 'Scorpion', 'Sealion', 'SeaUrchin', 'Seahorse', 'Seal', 'Shark', 'Sheep', 'Shrew', 'Skunk', 'Snail', 'Snake', 'Sparrow', 'Spider', 'Spoonbill', 'Squid', 'Squirrel', 'Starling', 'Stingray', 'Stinkbug', 'Stork', 'Swallow', 'Swan', 'Tapir', 'Tarsier', 'Termite', 'Tiger', 'Toad', 'Trout', 'Turkey', 'Turtle', 'Vicu�a', 'Viper', 'Vulture', 'Wallaby', 'Walrus', 'Wasp', 'Waterbuffalo', 'Weasel', 'Whale', 'Wolf', 'Wolverine', 'Wombat', 'Woodcock', 'Woodpecker', 'Worm', 'Wren', 'Yak', 'Zebra'];
const arrColours = ['almond', 'amaranthine', 'amber', 'amethyst', 'antique', 'apple', 'apricot', 'aqua', 'aquamarine', 'argent', 'auburn', 'avocado', 'azure', 'babyblue', 'banana', 'battleshipgray', 'bay', 'beige', 'Bermudagreen', 'beryl', 'biceblue', 'bicegreen', 'bice', 'biscuit', 'bisque', 'black', 'blanchedalmond', 'blazeorange', 'blonde', 'bloodred', 'bluegreen', 'blueviolet', 'blue', 'blueberry', 'bone', 'bottlegreen', 'brass', 'brickred', 'bronzeyellow', 'bronze', 'brown', 'buckskin', 'buff', 'burgundy', 'burlywood', 'burntorange', 'burntsienna', 'burntumber', 'butterscotch', 'cadetblue', 'Cambridgeblue', 'canary', 'cardinal', 'carmine', 'carnation', 'carnelian', 'carroty', 'celadon', 'cerise', 'cerulean', 'chamois', 'champagne', 'charcoal', 'chartreuse', 'cherryred', 'chestnut', 'Chinesered', 'chocolate', 'cinereous', 'cinnabar', 'cinnamon', 'citrine', 'clairdelune', 'claret', 'coalblack', 'cobaltblue', 'cocoa', 'coffee', 'coolgray', 'Copenhagenblue', 'copper', 'coral', 'cornflowerblue', 'cornflower', 'cornsilk', 'cream', 'crimson', 'cupreous', 'cyan', 'daffodil', 'damask', 'dandelion', 'dovegray', 'duckeggblue', 'dun', 'Dodgerblue', 'eaudenil', 'ebony', 'ecru', 'eggshellblue', 'eggshell', 'electricblue', 'emeraldgreen', 'emerald', 'fawn', 'federalyellow', 'firebrick', 'fireenginered', 'flame', 'flamingo', 'flaxen', 'flesh', 'floralwhite', 'forestgreen', 'fuchsia', 'fuscous', 'gainsboro', 'gamboge', 'garnet', 'gentianblue', 'gentianviolet', 'geranium', 'ginger', 'glaucous', 'gold', 'goldenbrown', 'goldenrod', 'goldochre', 'grape', 'grassgreen', 'gray', 'green', 'grizzle', 'gules', 'gunmetalgray', 'hazel', 'heather', 'heliotrope', 'henna', 'hepatic', 'hoar', 'honey', 'honeydew', 'hotpink', 'huntergreen', 'iceblue', 'incarnadine', 'Indianred', 'indigo', 'internationalorange', 'irongray', 'ivory', 'jadegreen', 'jade', 'jet', 'jonquil', 'kellygreen', 'Kendalgreen', 'khaki', 'khakigreen', 'lapislazuli', 'laurelgreen', 'lavender', 'lemonchiffon', 'lemon', 'lilac', 'lime', 'Lincolngreen', 'linen', 'liver', 'loden', 'lovat', 'macaroniandcheese', 'madder', 'magenta', 'magicmint', 'magnolia', 'mahogany', 'malachite', 'maroon', 'mauve', 'mazarine', 'melon', 'midnightblue', 'mignonette', 'militarygrey', 'mint', 'mintcream', 'mistyrose', 'moccasin', 'mocha', 'mossgreen', 'mulberry', 'mustard', 'natural', 'navajowhite', 'navy', 'Nileblue', 'Nilegreen', 'oak', 'oatmeal', 'oceangrey', 'ochre', 'offwhite', 'oldgold', 'oldlace', 'olivedrab', 'olive', 'orange', 'orchid', 'outerspace', 'oxblood', 'Oxfordblue', 'oyster', 'pansy', 'paprika', 'Parisgreen', 'patina', 'peagreen', 'peach', 'peacockblue', 'pearlgray', 'pearly', 'periwinkle', 'perse', 'petrolblue', 'petunia', 'pewter', 'pillarboxred', 'pinegreen', 'pink', 'pistachiogreen', 'platinumblond', 'platinum', 'plum', 'Pompeianred', 'poppy', 'powderblue', 'primrose', 'Prussianblue', 'puce', 'puke', 'purple', 'purpure', 'quartz', 'quince', 'raspberry', 'rawsienna', 'redviolet', 'red', 'reseda', 'riflegreen', 'robin_seggblue', 'rose', 'rouge', 'royalblue', 'royalpurple', 'ruby', 'russet', 'rust', 'sable', 'saddlebrown', 'safetyorange', 'saffron', 'sagegreen', 'salmon', 'sand', 'sandy', 'sanguine', 'sapphire', 'sard', 'saxeblue', 'scarlet', 'schoolbusyellow', 'seagreen', 'seashell', 'sepia', 'shockingpink', 'sienna', 'silver', 'silvergray', 'skyblue', 'slate', 'slateblack', 'slateblue', 'slategray', 'smoke', 'snow', 'sorrel', 'springgreen', 'stammel', 'steelblue', 'stone', 'straw', 'strawberry', 'sulfur', 'sunflower', 'tan', 'tangerine', 'taupe', 'taxiyellow', 'teak', 'teal', 'terracotta', 'timberwolf', 'titian', 'topaz', 'towcolored', 'Turkeyred', 'turquoise', 'Tyrianpurple', 'ultramarine', 'umber', 'Vandykebrown', 'venetianred', 'verdant', 'vermilion', 'vert', 'violetred', 'violet', 'virid', 'viridian', 'vividorange', 'walnut', 'Wedgewoodblue', 'wheat', 'wheaten', 'white', 'wine', 'xanthic', 'yellow', 'zaffre'];
// const arrCharacters =  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '^', '&', '*'];

export function animalGenerator() {
    const randAnimal = arrAnimals[Math.floor(Math.random() * arrAnimals.length)].toLowerCase();
    return randAnimal;
}

export function colourGenerator() {
    const randColour = arrColours[Math.floor(Math.random() * arrColours.length)].toLowerCase();
    return randColour
}

export function randId() {
     return Math.random().toString(36).substr(2, 10);
}

export const Filters = {}

Filters.getPixels = function(canvas) {
  var c = canvas
  var ctx = c.getContext('2d')
  return ctx.getImageData(0,0,c.width,c.height)
}

Filters.filterImage = function(pixels, filter, var_args) {
  var args = [pixels];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
}

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
}

Filters.brightness = function(pixels, offset, ratio) {
  var d = pixels.data;
  var v;
  for (var i=0; i<d.length; i+=4) {
    v = parseInt((d[i]-offset)*ratio);
    if(v>255){
      v = 255;
    }
    else if(v<0){
      v = 0;
    }
    d[i] = v;
    d[i+1] = v;
    d[i+2] = v;
    d[i+3] = 255;  // fully opaque
  }
  return pixels;
}

Filters.min_max = function(pixels) {
  var d = pixels.data;
  var v;
  var min=Number.POSITIVE_INFINITY, max=Number.NEGATIVE_INFINITY, avg=0;
  for (var i=0; i<d.length; i+=4) {
    if(d[i]<min) min=d[i];
    if(d[i]>max) max=d[i];
    avg += (d[i]/(d.length/4))
  }
  return {min:min, max:max, avg:avg};
}

Filters.lut = function(pixels, lut) {
  var d = pixels.data;
  var v;
  for (var i=0; i<d.length; i+=4) {
    v = d[i];
    d[i] = lut[v][0];
    d[i+1] = lut[v][1];
    d[i+2] = lut[v][2];
    d[i+3] = 255;  // fully opaque
  }
  return pixels;
}

export const hot_lut = [
  [10, 0, 0],
[13, 0, 0],
[15, 0, 0],
[18, 0, 0],
[21, 0, 0],
[23, 0, 0],
[26, 0, 0],
[28, 0, 0],
[31, 0, 0],
[34, 0, 0],
[36, 0, 0],
[39, 0, 0],
[42, 0, 0],
[44, 0, 0],
[47, 0, 0],
[49, 0, 0],
[52, 0, 0],
[55, 0, 0],
[57, 0, 0],
[60, 0, 0],
[63, 0, 0],
[65, 0, 0],
[68, 0, 0],
[70, 0, 0],
[73, 0, 0],
[76, 0, 0],
[78, 0, 0],
[81, 0, 0],
[84, 0, 0],
[86, 0, 0],
[89, 0, 0],
[91, 0, 0],
[94, 0, 0],
[97, 0, 0],
[99, 0, 0],
[102, 0, 0],
[105, 0, 0],
[107, 0, 0],
[110, 0, 0],
[112, 0, 0],
[115, 0, 0],
[118, 0, 0],
[120, 0, 0],
[123, 0, 0],
[126, 0, 0],
[128, 0, 0],
[131, 0, 0],
[133, 0, 0],
[136, 0, 0],
[139, 0, 0],
[141, 0, 0],
[144, 0, 0],
[147, 0, 0],
[149, 0, 0],
[152, 0, 0],
[154, 0, 0],
[157, 0, 0],
[160, 0, 0],
[162, 0, 0],
[165, 0, 0],
[168, 0, 0],
[170, 0, 0],
[173, 0, 0],
[175, 0, 0],
[178, 0, 0],
[181, 0, 0],
[183, 0, 0],
[186, 0, 0],
[189, 0, 0],
[191, 0, 0],
[194, 0, 0],
[196, 0, 0],
[199, 0, 0],
[202, 0, 0],
[204, 0, 0],
[207, 0, 0],
[210, 0, 0],
[212, 0, 0],
[215, 0, 0],
[217, 0, 0],
[220, 0, 0],
[223, 0, 0],
[225, 0, 0],
[228, 0, 0],
[231, 0, 0],
[233, 0, 0],
[236, 0, 0],
[238, 0, 0],
[241, 0, 0],
[244, 0, 0],
[246, 0, 0],
[249, 0, 0],
[252, 0, 0],
[254, 0, 0],
[255, 2, 0],
[255, 5, 0],
[255, 7, 0],
[255, 10, 0],
[255, 12, 0],
[255, 15, 0],
[255, 18, 0],
[255, 20, 0],
[255, 23, 0],
[255, 26, 0],
[255, 28, 0],
[255, 31, 0],
[255, 33, 0],
[255, 36, 0],
[255, 39, 0],
[255, 41, 0],
[255, 44, 0],
[255, 47, 0],
[255, 49, 0],
[255, 52, 0],
[255, 54, 0],
[255, 57, 0],
[255, 60, 0],
[255, 62, 0],
[255, 65, 0],
[255, 68, 0],
[255, 70, 0],
[255, 73, 0],
[255, 75, 0],
[255, 78, 0],
[255, 81, 0],
[255, 83, 0],
[255, 86, 0],
[255, 89, 0],
[255, 91, 0],
[255, 94, 0],
[255, 96, 0],
[255, 99, 0],
[255, 102, 0],
[255, 104, 0],
[255, 107, 0],
[255, 110, 0],
[255, 112, 0],
[255, 115, 0],
[255, 117, 0],
[255, 120, 0],
[255, 123, 0],
[255, 125, 0],
[255, 128, 0],
[255, 131, 0],
[255, 133, 0],
[255, 136, 0],
[255, 138, 0],
[255, 141, 0],
[255, 144, 0],
[255, 146, 0],
[255, 149, 0],
[255, 151, 0],
[255, 154, 0],
[255, 157, 0],
[255, 159, 0],
[255, 162, 0],
[255, 165, 0],
[255, 167, 0],
[255, 170, 0],
[255, 172, 0],
[255, 175, 0],
[255, 178, 0],
[255, 180, 0],
[255, 183, 0],
[255, 186, 0],
[255, 188, 0],
[255, 191, 0],
[255, 193, 0],
[255, 196, 0],
[255, 199, 0],
[255, 201, 0],
[255, 204, 0],
[255, 207, 0],
[255, 209, 0],
[255, 212, 0],
[255, 214, 0],
[255, 217, 0],
[255, 220, 0],
[255, 222, 0],
[255, 225, 0],
[255, 228, 0],
[255, 230, 0],
[255, 233, 0],
[255, 235, 0],
[255, 238, 0],
[255, 241, 0],
[255, 243, 0],
[255, 246, 0],
[255, 249, 0],
[255, 251, 0],
[255, 254, 0],
[255, 255, 2],
[255, 255, 6],
[255, 255, 10],
[255, 255, 14],
[255, 255, 18],
[255, 255, 22],
[255, 255, 26],
[255, 255, 30],
[255, 255, 34],
[255, 255, 38],
[255, 255, 42],
[255, 255, 46],
[255, 255, 50],
[255, 255, 54],
[255, 255, 58],
[255, 255, 62],
[255, 255, 65],
[255, 255, 69],
[255, 255, 73],
[255, 255, 77],
[255, 255, 81],
[255, 255, 85],
[255, 255, 89],
[255, 255, 93],
[255, 255, 97],
[255, 255, 101],
[255, 255, 105],
[255, 255, 109],
[255, 255, 113],
[255, 255, 117],
[255, 255, 121],
[255, 255, 125],
[255, 255, 128],
[255, 255, 132],
[255, 255, 136],
[255, 255, 140],
[255, 255, 144],
[255, 255, 148],
[255, 255, 152],
[255, 255, 156],
[255, 255, 160],
[255, 255, 164],
[255, 255, 168],
[255, 255, 172],
[255, 255, 176],
[255, 255, 180],
[255, 255, 184],
[255, 255, 188],
[255, 255, 191],
[255, 255, 195],
[255, 255, 199],
[255, 255, 203],
[255, 255, 207],
[255, 255, 211],
[255, 255, 215],
[255, 255, 219],
[255, 255, 223],
[255, 255, 227],
[255, 255, 231],
[255, 255, 235],
[255, 255, 239],
[255, 255, 243],
[255, 255, 247],
[255, 255, 251],
[255, 255, 255]
]
