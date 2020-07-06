import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

export const goal = (props) => h('div', {
  class: {
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
    'mb-2': true,
    'w-full': true,
  },
}, [
  h('input', {
    id: `goal-${props.id}`,
    type: 'checkbox',
    checked: props.completed,
    onchange: [actions.CompleteGoal, (e) => ({ id: props.id, completed: e.target.checked })],
    class: {
      'mr-3': true,
      'sr-only': true,
    },
  }),
  h('button', {
    onclick: [actions.CompleteGoal, ({ id: props.id, completed: !props.completed })],
  }, [
    h('span', {
      class: {
        'fa-stack': true,
      },
    }, [
      h('i', { class: 'far fa-circle fa-stack-2x' }),
      props.completed && h('i', { class: 'fas fa-check fa-stack-1x text-green-500' }),
    ]),
  ]),
  h('label', {
    for: `goal-${props.id}`,
    class: {
      'text-4xl': true,
      'flex-grow': true,
      'leading-tight': true,
    },
  }, props.text),
]);
