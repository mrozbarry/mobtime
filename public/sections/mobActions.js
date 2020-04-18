import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const mobActions = () => h(section, {
  class: {
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
  },
}, [

  h(button, {
    class: {
      'text-lg': true,
      'bg-white': true,
      'text-blue-600': true,
      'flex-grow': true,
      'mr-1': true,
    },
    onclick: actions.CycleMob,
  }, 'Rotate'),

  h(button, {
    class: {
      'text-lg': true,
      'bg-white': true,
      'text-blue-600': true,
      'flex-grow': true,
      'ml-1': true,
    },
    onclick: actions.ShuffleMob,
  }, 'Randomize'),

]);
