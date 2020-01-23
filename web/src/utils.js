/*eslint no-useless-escape: "off"*/
import axios from "axios";

/**
 * A special kind of event:
 *  - which can only be emitted once;
 *  - executes a set of subscribed handlers upon emission;
 *  - if a handler is subscribed after the event was emitted, it
 *    will be invoked immideately.
 *
 * Used for the events which only happen once (or do not happen at
 * all) during a single plugin lifecycle - connect, disconnect and
 * connection failure
 */
export const Whenable = function() {
  this._emitted = false;
  this._handlers = [];
};

/**
 * Emits the Whenable event, calls all the handlers already
 * subscribed, switches the object to the 'emitted' state (when
 * all future subscibed listeners will be immideately issued
 * instead of being stored)
 */
Whenable.prototype.emit = function(e) {
  if (!this._emitted) {
    this._emitted = true;
    this._e = e;
    var handler;
    while ((handler = this._handlers.pop())) {
      setTimeout(handler.bind(null, e), 0);
    }
  }
};

/**
 * Saves the provided function as a handler for the Whenable
 * event. This handler will then be called upon the event emission
 * (if it has not been emitted yet), or will be scheduled for
 * immediate issue (if the event has already been emmitted before)
 *
 * @param {Function} handler to subscribe for the event
 */
Whenable.prototype.whenEmitted = function(handler) {
  handler = this._checkHandler(handler);
  if (this._emitted) {
    setTimeout(handler.bind(null, this._e), 0);
  } else {
    this._handlers.push(handler);
  }
};

/**
 * Checks if the provided object is suitable for being subscribed
 * to the event (= is a function), throws an exception if not
 *
 * @param {Object} obj to check for being subscribable
 *
 * @throws {Exception} if object is not suitable for subscription
 *
 * @returns {Object} the provided object if yes
 */
Whenable.prototype._checkHandler = function(handler) {
  var type = typeof handler;
  if (type != "function") {
    var msg =
      "A function may only be subsribed to the event, " +
      type +
      " was provided instead";
    throw new Error(msg);
  }

  return handler;
};

export function assert(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}

export function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.MaxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

export function compareVersions(v1, comparator, v2) {
  comparator = comparator == "=" ? "==" : comparator;
  if (
    ["==", "===", "<", "<=", ">", ">=", "!=", "!=="].indexOf(comparator) == -1
  ) {
    throw new Error("Invalid comparator. " + comparator);
  }
  var v1parts = v1.split("."),
    v2parts = v2.split(".");
  var maxLen = Math.max(v1parts.length, v2parts.length);
  var part1, part2;
  var cmp = 0;
  for (var i = 0; i < maxLen && !cmp; i++) {
    part1 = parseInt(v1parts[i], 10) || 0;
    part2 = parseInt(v2parts[i], 10) || 0;
    if (part1 < part2) cmp = 1;
    if (part1 > part2) cmp = -1;
  }
  return eval("0" + comparator + cmp);
}

export function pathJoin(/* path segments */) {
  // Split the inputs into a list of path commands.
  var parts = [];
  for (var i = 0, l = arguments.length; i < l; i++) {
    parts = parts.concat(arguments[i].split("/"));
  }
  // Interpret the path commands to get the new resolved path.
  var newParts = [];
  for (i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === ".") continue;
    // Interpret ".." to pop the last segment
    if (part === "..") newParts.pop();
    // Push new path segments.
    else newParts.push(part);
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === "") newParts.unshift("");
  // Turn back into a single string path.
  return newParts.join("/") || (newParts.length ? "/" : ".");
}

// A simple function to get the dirname of a path
// Trailing slashes are ignored. Leading slash is preserved.
export function dirName(path) {
  return pathJoin(path, "..");
}

// from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
export function mobilecheck() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

export function mobileAndTabletcheck() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

// wordgenjs from https://github.com/gurshabad/wordgenjs
const arrAnimals = [
  "Aardvark",
  "Albatross",
  "Alligator",
  "Alpaca",
  "Ant",
  "Anteater",
  "Antelope",
  "Ape",
  "Armadillo",
  "Ass_Donkey",
  "Baboon",
  "Badger",
  "Barracuda",
  "Bat",
  "Bear",
  "Beaver",
  "Bee",
  "Bison",
  "Boa",
  "Buffalo",
  "Butterfly",
  "Camel",
  "Capybara",
  "Caribou",
  "Cassowary",
  "Cat",
  "Caterpillar",
  "Cattle",
  "Chamois",
  "Cheetah",
  "Chicken",
  "Chimpanzee",
  "Chinchilla",
  "Chough",
  "Clam",
  "Cobra",
  "Cockroach",
  "Cod",
  "Cormorant",
  "Coyote",
  "Crab",
  "Crane",
  "Crocodile",
  "Crow",
  "Curlew",
  "Deer",
  "Dinosaur",
  "Dog",
  "Dogfish",
  "Dolphin",
  "Donkey",
  "Dotterel",
  "Dove",
  "Dragonfly",
  "Duck",
  "Dugong",
  "Dunlin",
  "Eagle",
  "Echidna",
  "Eel",
  "Eland",
  "Elephant",
  "Elephantseal",
  "Elk",
  "Emu",
  "Falcon",
  "Ferret",
  "Finch",
  "Fish",
  "Flamingo",
  "Fox",
  "Frog",
  "Gaur",
  "Gazelle",
  "Gerbil",
  "GiantPanda",
  "Giraffe",
  "Gnat",
  "Gnu",
  "Goat",
  "Goose",
  "Goldfinch",
  "Goldfish",
  "Gorilla",
  "Goshawk",
  "Grasshopper",
  "Grouse",
  "Guanaco",
  "Guineafowl",
  "Guineapig",
  "Gull",
  "Hamster",
  "Hare",
  "Hawk",
  "Hedgehog",
  "Heron",
  "Herring",
  "Hippopotamus",
  "Hornet",
  "Horse",
  "Human",
  "Hummingbird",
  "Hyena",
  "Ibex",
  "Ibis",
  "Jackal",
  "Jaguar",
  "Jay",
  "Jellyfish",
  "Kangaroo",
  "Kingfisher",
  "Koala",
  "Komodo",
  "Kookabura",
  "Kouprey",
  "Kudu",
  "Lapwing",
  "Lark",
  "Lemur",
  "Leopard",
  "Lion",
  "Llama",
  "Lobster",
  "Locust",
  "Loris",
  "Louse",
  "Lyrebird",
  "Magpie",
  "Mallard",
  "Manatee",
  "Mandrill",
  "Mantis",
  "Marten",
  "Meerkat",
  "Mink",
  "Mole",
  "Mongoose",
  "Monkey",
  "Moose",
  "Mouse",
  "Mosquito",
  "Mule",
  "Narwhal",
  "Newt",
  "Nightingale",
  "Octopus",
  "Okapi",
  "Opossum",
  "Oryx",
  "Ostrich",
  "Otter",
  "Owl",
  "Ox",
  "Oyster",
  "Panther",
  "Parrot",
  "Partridge",
  "Peafowl",
  "Pelican",
  "Penguin",
  "Pheasant",
  "Pig",
  "Pigeon",
  "PolarBear",
  "Pony",
  "Porcupine",
  "Porpoise",
  "PrairieDog",
  "Quail",
  "Quelea",
  "Quetzal",
  "Rabbit",
  "Raccoon",
  "Rail",
  "Ram",
  "Rat",
  "Raven",
  "Reddeer",
  "Redpanda",
  "Reindeer",
  "Rhinoceros",
  "Rook",
  "Salamander",
  "Salmon",
  "SandDollar",
  "Sandpiper",
  "Sardine",
  "Scorpion",
  "Sealion",
  "SeaUrchin",
  "Seahorse",
  "Seal",
  "Shark",
  "Sheep",
  "Shrew",
  "Skunk",
  "Snail",
  "Snake",
  "Sparrow",
  "Spider",
  "Spoonbill",
  "Squid",
  "Squirrel",
  "Starling",
  "Stingray",
  "Stinkbug",
  "Stork",
  "Swallow",
  "Swan",
  "Tapir",
  "Tarsier",
  "Termite",
  "Tiger",
  "Toad",
  "Trout",
  "Turkey",
  "Turtle",
  "Vicu�a",
  "Viper",
  "Vulture",
  "Wallaby",
  "Walrus",
  "Wasp",
  "Waterbuffalo",
  "Weasel",
  "Whale",
  "Wolf",
  "Wolverine",
  "Wombat",
  "Woodcock",
  "Woodpecker",
  "Worm",
  "Wren",
  "Yak",
  "Zebra",
];
const arrColours = [
  "almond",
  "amaranthine",
  "amber",
  "amethyst",
  "antique",
  "apple",
  "apricot",
  "aqua",
  "aquamarine",
  "argent",
  "auburn",
  "avocado",
  "azure",
  "babyblue",
  "banana",
  "battleshipgray",
  "bay",
  "beige",
  "Bermudagreen",
  "beryl",
  "biceblue",
  "bicegreen",
  "bice",
  "biscuit",
  "bisque",
  "black",
  "blanchedalmond",
  "blazeorange",
  "blonde",
  "bloodred",
  "bluegreen",
  "blueviolet",
  "blue",
  "blueberry",
  "bone",
  "bottlegreen",
  "brass",
  "brickred",
  "bronzeyellow",
  "bronze",
  "brown",
  "buckskin",
  "buff",
  "burgundy",
  "burlywood",
  "burntorange",
  "burntsienna",
  "burntumber",
  "butterscotch",
  "cadetblue",
  "Cambridgeblue",
  "canary",
  "cardinal",
  "carmine",
  "carnation",
  "carnelian",
  "carroty",
  "celadon",
  "cerise",
  "cerulean",
  "chamois",
  "champagne",
  "charcoal",
  "chartreuse",
  "cherryred",
  "chestnut",
  "Chinesered",
  "chocolate",
  "cinereous",
  "cinnabar",
  "cinnamon",
  "citrine",
  "clairdelune",
  "claret",
  "coalblack",
  "cobaltblue",
  "cocoa",
  "coffee",
  "coolgray",
  "Copenhagenblue",
  "copper",
  "coral",
  "cornflowerblue",
  "cornflower",
  "cornsilk",
  "cream",
  "crimson",
  "cupreous",
  "cyan",
  "daffodil",
  "damask",
  "dandelion",
  "dovegray",
  "duckeggblue",
  "dun",
  "Dodgerblue",
  "eaudenil",
  "ebony",
  "ecru",
  "eggshellblue",
  "eggshell",
  "electricblue",
  "emeraldgreen",
  "emerald",
  "fawn",
  "federalyellow",
  "firebrick",
  "fireenginered",
  "flame",
  "flamingo",
  "flaxen",
  "flesh",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "fuscous",
  "gainsboro",
  "gamboge",
  "garnet",
  "gentianblue",
  "gentianviolet",
  "geranium",
  "ginger",
  "glaucous",
  "gold",
  "goldenbrown",
  "goldenrod",
  "goldochre",
  "grape",
  "grassgreen",
  "gray",
  "green",
  "grizzle",
  "gules",
  "gunmetalgray",
  "hazel",
  "heather",
  "heliotrope",
  "henna",
  "hepatic",
  "hoar",
  "honey",
  "honeydew",
  "hotpink",
  "huntergreen",
  "iceblue",
  "incarnadine",
  "Indianred",
  "indigo",
  "internationalorange",
  "irongray",
  "ivory",
  "jadegreen",
  "jade",
  "jet",
  "jonquil",
  "kellygreen",
  "Kendalgreen",
  "khaki",
  "khakigreen",
  "lapislazuli",
  "laurelgreen",
  "lavender",
  "lemonchiffon",
  "lemon",
  "lilac",
  "lime",
  "Lincolngreen",
  "linen",
  "liver",
  "loden",
  "lovat",
  "macaroniandcheese",
  "madder",
  "magenta",
  "magicmint",
  "magnolia",
  "mahogany",
  "malachite",
  "maroon",
  "mauve",
  "mazarine",
  "melon",
  "midnightblue",
  "mignonette",
  "militarygrey",
  "mint",
  "mintcream",
  "mistyrose",
  "moccasin",
  "mocha",
  "mossgreen",
  "mulberry",
  "mustard",
  "natural",
  "navajowhite",
  "navy",
  "Nileblue",
  "Nilegreen",
  "oak",
  "oatmeal",
  "oceangrey",
  "ochre",
  "offwhite",
  "oldgold",
  "oldlace",
  "olivedrab",
  "olive",
  "orange",
  "orchid",
  "outerspace",
  "oxblood",
  "Oxfordblue",
  "oyster",
  "pansy",
  "paprika",
  "Parisgreen",
  "patina",
  "peagreen",
  "peach",
  "peacockblue",
  "pearlgray",
  "pearly",
  "periwinkle",
  "perse",
  "petrolblue",
  "petunia",
  "pewter",
  "pillarboxred",
  "pinegreen",
  "pink",
  "pistachiogreen",
  "platinumblond",
  "platinum",
  "plum",
  "Pompeianred",
  "poppy",
  "powderblue",
  "primrose",
  "Prussianblue",
  "puce",
  "puke",
  "purple",
  "purpure",
  "quartz",
  "quince",
  "raspberry",
  "rawsienna",
  "redviolet",
  "red",
  "reseda",
  "riflegreen",
  "robin_seggblue",
  "rose",
  "rouge",
  "royalblue",
  "royalpurple",
  "ruby",
  "russet",
  "rust",
  "sable",
  "saddlebrown",
  "safetyorange",
  "saffron",
  "sagegreen",
  "salmon",
  "sand",
  "sandy",
  "sanguine",
  "sapphire",
  "sard",
  "saxeblue",
  "scarlet",
  "schoolbusyellow",
  "seagreen",
  "seashell",
  "sepia",
  "shockingpink",
  "sienna",
  "silver",
  "silvergray",
  "skyblue",
  "slate",
  "slateblack",
  "slateblue",
  "slategray",
  "smoke",
  "snow",
  "sorrel",
  "springgreen",
  "stammel",
  "steelblue",
  "stone",
  "straw",
  "strawberry",
  "sulfur",
  "sunflower",
  "tan",
  "tangerine",
  "taupe",
  "taxiyellow",
  "teak",
  "teal",
  "terracotta",
  "timberwolf",
  "titian",
  "topaz",
  "towcolored",
  "Turkeyred",
  "turquoise",
  "Tyrianpurple",
  "ultramarine",
  "umber",
  "Vandykebrown",
  "venetianred",
  "verdant",
  "vermilion",
  "vert",
  "violetred",
  "violet",
  "virid",
  "viridian",
  "vividorange",
  "walnut",
  "Wedgewoodblue",
  "wheat",
  "wheaten",
  "white",
  "wine",
  "xanthic",
  "yellow",
  "zaffre",
];
// const arrCharacters =  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '^', '&', '*'];

const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
export const url_regex = new RegExp(expression);

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function animalGenerator() {
  const randAnimal = arrAnimals[
    Math.floor(Math.random() * arrAnimals.length)
  ].toLowerCase();
  return randAnimal;
}

export function colourGenerator() {
  const randColour = arrColours[
    Math.floor(Math.random() * arrColours.length)
  ].toLowerCase();
  return randColour;
}

export function randId() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}

export function escapeHTML(html) {
  const escapeEl = document.createElement("textarea");
  escapeEl.textContent = html;
  return escapeEl.innerHTML;
}

// Deep clone
export function _clone(aObject) {
  if (!aObject) {
    return aObject;
  }
  var bObject, v, k;
  bObject = Array.isArray(aObject) ? [] : {};
  for (k in aObject) {
    v = aObject[k];
    bObject[k] = typeof v === "object" ? _clone(v) : v;
  }
  return bObject;
}

export const Filters = {};

Filters.getPixels = function(canvas) {
  var c = canvas;
  var ctx = c.getContext("2d");
  return ctx.getImageData(0, 0, c.width, c.height);
};

Filters.filterImage = function(pixels, filter) {
  var args = [pixels];
  for (var i = 2; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.grayscale = function(pixels) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return pixels;
};

Filters.brightness = function(pixels, offset, ratio) {
  var d = pixels.data;
  var v;
  for (var i = 0; i < d.length; i += 4) {
    v = parseInt((d[i] - offset) * ratio);
    if (v > 255) {
      v = 255;
    } else if (v < 0) {
      v = 0;
    }
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255; // fully opaque
  }
  return pixels;
};

Filters.min_max = function(pixels) {
  var d = pixels.data;
  var min = Number.POSITIVE_INFINITY,
    max = Number.NEGATIVE_INFINITY,
    avg = 0;
  for (var i = 0; i < d.length; i += 4) {
    if (d[i] < min) min = d[i];
    if (d[i] > max) max = d[i];
    avg += d[i] / (d.length / 4);
  }
  return { min: min, max: max, avg: avg };
};

Filters.lut = function(pixels, lut) {
  var d = pixels.data;
  var v;
  for (var i = 0; i < d.length; i += 4) {
    v = d[i];
    d[i] = lut[v][0];
    d[i + 1] = lut[v][1];
    d[i + 2] = lut[v][2];
    d[i + 3] = 255; // fully opaque
  }
  return pixels;
};

// from https://github.com/segmentio/is-url
/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

export function isUrl(string) {
  if (typeof string !== "string") {
    return false;
  }

  var match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  var everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  ) {
    return true;
  }

  return false;
}

//from: https://github.com/github-modules/github-url-to-object/blob/master/index.js
const laxUrlRegex = /(?:(?:[^:]+:)?[/][/])?(?:.+@)?([^/]+)([/][^?#]+)/;

export function githubUrlToObject(repoUrl, opts) {
  var obj = {};
  opts = opts || {};

  if (!repoUrl) return null;

  // Allow an object with nested `url` string
  // (common practice in package.json files)
  if (repoUrl.url) repoUrl = repoUrl.url;

  if (typeof repoUrl !== "string") return null;

  var shorthand = repoUrl.match(/^([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/);
  var mediumhand = repoUrl.match(
    /^github:([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/
  );
  var antiquated = repoUrl.match(/^git@[\w-_\.]+:([\w-_]+)\/([\w-_\.]+)$/);

  if (shorthand) {
    obj.user = shorthand[1];
    obj.repo = shorthand[2];
    obj.branch = shorthand[3] || "master";
    obj.host = "github.com";
  } else if (mediumhand) {
    obj.user = mediumhand[1];
    obj.repo = mediumhand[2];
    obj.branch = mediumhand[3] || "master";
    obj.host = "github.com";
  } else if (antiquated) {
    obj.user = antiquated[1];
    obj.repo = antiquated[2].replace(/\.git$/i, "");
    obj.branch = "master";
    obj.host = "github.com";
  } else {
    // Turn git+http URLs into http URLs
    repoUrl = repoUrl.replace(/^git\+/, "");

    if (!isUrl(repoUrl)) return null;

    const [, hostname, pathname] = repoUrl.match(laxUrlRegex) || [];
    if (!hostname) return null;
    if (
      hostname !== "github.com" &&
      hostname !== "www.github.com" &&
      !opts.enterprise
    )
      return null;

    var parts = pathname.match(
      /^\/([\w-_]+)\/([\w-_\.]+)(\/tree\/[\w-_\.\/]+)?(\/blob\/[\w-_\.\/]+)?/
    );
    // ([\w-_\.]+)
    if (!parts) return null;
    obj.user = parts[1];
    obj.repo = parts[2].replace(/\.git$/i, "");

    obj.host = hostname || "github.com";

    if (parts[3] && /^\/tree\/master\//.test(parts[3])) {
      obj.branch = "master";
      obj.path = parts[3].replace(/\/$/, "");
    } else if (parts[3]) {
      obj.branch = parts[3]
        .replace(/^\/tree\//, "")
        .match(/[\w-_.]+\/{0,1}[\w-_]+/)[0];
    } else if (parts[4]) {
      obj.branch = parts[4]
        .replace(/^\/blob\//, "")
        .match(/[\w-_.]+\/{0,1}[\w-_]+/)[0];
    } else {
      obj.branch = "master";
    }
  }

  if (obj.host === "github.com") {
    obj.apiHost = "api.github.com";
  } else {
    obj.apiHost = `${obj.host}/api/v3`;
  }

  obj.tarball_url = `https://${obj.apiHost}/repos/${obj.user}/${
    obj.repo
  }/tarball/${obj.branch}`;
  obj.clone_url = `https://${obj.host}/${obj.user}/${obj.repo}`;

  if (obj.branch === "master") {
    obj.https_url = `https://${obj.host}/${obj.user}/${obj.repo}`;
    obj.travis_url = `https://travis-ci.org/${obj.user}/${obj.repo}`;
    obj.zip_url = `https://${obj.host}/${obj.user}/${
      obj.repo
    }/archive/master.zip`;
  } else {
    obj.https_url = `https://${obj.host}/${obj.user}/${obj.repo}/blob/${
      obj.branch
    }`;
    obj.travis_url = `https://travis-ci.org/${obj.user}/${obj.repo}?branch=${
      obj.branch
    }`;
    obj.zip_url = `https://${obj.host}/${obj.user}/${obj.repo}/archive/${
      obj.branch
    }.zip`;
  }

  // Support deep paths (like lerna-style repos)
  if (obj.path) {
    obj.https_url += obj.path;
  }

  obj.api_url = `https://${obj.apiHost}/repos/${obj.user}/${obj.repo}`;

  return obj;
}

// from: https://github.com/Elixirdoc/github-url-raw
export async function githubUrlRaw(url) {
  if (url.includes("gist.github.com")) {
    const gistId = url.split("/").slice(-1)[0];
    const response = await axios.get("https://api.github.com/gists/" + gistId);
    if (response.status === 200) {
      // TODO: handle multiple files, e.g.: display them all
      const plugin_file = Object.values(response.data.files).filter(file => {
        return file.filename.endsWith(".imjoy.html");
      })[0];
      return plugin_file.raw_url;
    } else {
      throw "Failed to fetch from Gist: " + response.statusText;
    }
  }
  if (!url.includes("blob") || !url.includes("github")) {
    return null;
  }
  var ghObj = githubUrlToObject(url);
  var githubUser = ghObj.user;
  var githubRepo = ghObj.repo;
  // var githubBranch = ghObj.branch;
  var re = new RegExp(
    "^https://github.com/" + githubUser + "/" + githubRepo + "/blob/",
    "g"
  );
  var regStr = url.replace(re, "");

  return (
    "https://raw.githubusercontent.com/" +
    githubUser +
    "/" +
    githubRepo +
    "/" +
    regStr
  );
}

export function githubImJoyManifest(url) {
  var ghObj = githubUrlToObject(url);
  var githubUser = ghObj.user;
  var githubRepo = ghObj.repo;
  var githubBranch = ghObj.branch;
  return (
    "https://raw.githubusercontent.com/" +
    githubUser +
    "/" +
    githubRepo +
    "/" +
    githubBranch +
    "/manifest.imjoy.json"
  );
}

export function githubRepo(url) {
  var ghObj = githubUrlToObject(url);
  return ghObj.user + "/" + ghObj.repo;
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
  [255, 255, 255],
];
