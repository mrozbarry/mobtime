import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';
import { reorderable } from '/components/reorderable.js';

export const goalList = (props) => h(section, null, [
  h(reorderable, {
    dragType: 'goal',
    items: props.goals,
    renderItem: (item) => h(goal, item),
    drag: props.drag,
  }),
  //props.goals.map(({ id, text, completed }) => h(goal, {
    //id,
    //text,
    //completed,
  //})),
]);
