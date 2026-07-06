export const TOUR_SEEN_STORAGE_KEY = 'hpm-tour-seen-v1';

export const TOUR_STEPS = [
  {
    id: 'address',
    target: 'address-search',
    title: 'Start with your address',
    body: 'Type your street address here and we will center the map on your home.',
    placement: 'bottom',
    pointerCue: true
  },
  {
    id: 'map-customization',
    target: 'map-customization',
    title: 'Customize your map',
    body: 'Show or hide street names and nearby landmarks like schools and parks.',
    placement: 'left',
    requiresMobileSheet: true
  },
  {
    id: 'select-size',
    target: 'select-size',
    title: 'Choose your mat size',
    body: 'Pick The Neighbourhood or The Hometown — this sets how much of your neighbourhood gets printed.',
    placement: 'left',
    requiresMobileSheet: true
  },
  {
    id: 'map-controls',
    target: 'map-frame',
    title: 'Move around the map',
    body: 'Use your mouse or trackpad to frame the perfect street for your mat.',
    placement: 'center',
    gestureLegend: true
  }
];
