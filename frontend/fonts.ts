export const SANS_SERIF_FONTS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Noto Sans',
    'Oswald', 'Raleway', 'PT Sans', 'Work Sans', 'DM Sans', 'Nunito', 'Ubuntu',
    'Mukta', 'Rubik', 'Quicksand', 'Hind', 'Nanum Gothic', 'Fira Sans', 'Barlow',
    'Kanit', 'Josefin Sans', 'Tajawal', 'IBM Plex Sans', 'Cabin', 'Anton',
    'Dosis', 'Teko', 'Exo 2', 'Oxygen', 'Manrope', 'Signika', 'Asap', 'Karla'
];

export const SERIF_FONTS = [
    'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Noto Serif',
    'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Bitter',
    'Cormorant Garamond', 'Domine', 'Arvo', 'Vollkorn', 'Zilla Slab',
    'Spectral', 'Aleo', 'Neuton', 'Cardo', 'Tinos', 'Slabo 27px',
    'Roboto Slab', 'Bree Serif', 'Frank Ruhl Libre', 'Rokkitt', 'Amiri',
    'Gelasio', 'Quattrocento', 'Alice', 'Prata', 'Glegoo', 'Rufina',
    'Gilda Display', 'Caudex', 'Solway', 'Literata'
];

export const SCRIPT_FONTS = [
    'Pacifico', 'Dancing Script', 'Satisfy', 'Great Vibes', 'Caveat',
    'Kaushan Script', 'Cookie', 'Sacramento', 'Alex Brush', 'Yellowtail',
    'Tangerine', 'Lobster', 'Lobster Two', 'Marck Script', 'Allura',
    'Parisienne', 'Pinyon Script', 'Grand Hotel', 'Mr Dafoe', 'Damion',
    'Rouge Script', 'Courgette', 'Niconne', 'Italianno', 'Rochester',
    'Yesteryear', 'Herr Von Muellerhoff', 'Sail', 'Style Script', 'Arizonia'
];

export const CATEGORIZED_FONTS = [
    { label: 'Sans-Serif (Clean, Modern)', fonts: SANS_SERIF_FONTS },
    { label: 'Serif (Classic, Formal)', fonts: SERIF_FONTS },
    { label: 'Script & Cursive (Elegant, Playful)', fonts: SCRIPT_FONTS }
];

export const ALL_FONTS = [...SANS_SERIF_FONTS, ...SERIF_FONTS, ...SCRIPT_FONTS];
