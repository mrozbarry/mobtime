import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';
import * as subscriptions from '/subscriptions.js';
import Status from '/status.js';

import { card } from '/components/card.js';
import { fullButton } from '/components/fullButton.js';
import { section } from '/components/section.js';
import { tab } from '/components/tab.js';

import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { setLength } from '/sections/setLength.js';

import { goalList } from '/sections/goalList.js';
import { addGoal } from '/sections/addGoal.js';

import { mobParticipants } from '/sections/mobParticipants.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';
import { qrShare } from '/sections/qrShare.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);

app({
  init: actions.Init(null, initialTimerId),

  view: (state) => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
    },
  }, h(card, {
    class: {
      'min-h-screen': true,
      'sm:min-h-0': true,
      'w-full': true,
      'sm:w-8/12': true,
      'lg:w-6/12': true,
      'xl:w-4/12': true,
      'shadow': false,
      'sm:shadow-lg': true,
      'pt-2': false,
      'pt-0': true,
      'pb-12': true,
      'pb-1': false,
      'sm:mt-2': true,
      'rounded': false,
      'sm:rounded': true,
      'bg-indigo-600': true,
      'text-white': true,
    },
  }, [
    h(header),

    h(timeRemaining, {
      remainingTime: state.remainingTime,
      serverState: state.serverState,
    }),

    h(setLength, {
      timeInMinutes: state.timeInMinutes,
    }),

    h('div', {
      class: {
        'grid': true,
        'grid-cols-3': true,
        'gap-1': true,
        'px-2': true,
        'py-4': true,
        'sm:px-4': true,
      },
    }, [
      h(tab, {
        selected: state.timerTab === 'mob',
        onclick: [actions.SetTimerTab, 'mob'],
      }, 'Mob'),
      h(tab, {
        selected: state.timerTab === 'goals',
        onclick: [actions.SetTimerTab, 'goals'],
      }, 'Goals'),
      h(tab, {
        selected: state.timerTab === 'share',
        onclick: [actions.SetTimerTab, 'share'],
      }, 'Share'),
    ]),

    state.timerTab === 'goals' && [
      h(goalList, {
        goals: state.serverState.goals,
      }),
      h(addGoal, {
        goal: state.goal,
      }),
    ],

    state.timerTab === 'mob' && [
      h(mobParticipants, {
        mobDrag: state.mobDrag,
        mob: state.serverState.mob,
      }),

      h(addParticipant, {
        name: state.name,
      }),

      h(mobActions),
    ],

    state.timerTab === 'share' && [
      h(qrShare),
    ],

    h(section, {
      class: {
        'w-full': true,
        ...Status.caseOf({
          Connecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Connected: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Reconnecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Error: () => ({ 'bg-red-500': true, 'text-white': true }),
        }, state.status),
        'text-center': true,
        'text-xs': true,
      },
    },
      Status.caseOf({
        Connecting: () => 'Websocket connecting',
        Connected: () => `Websocket connected, with ${state.serverState.connections - 1} other(s)`,
        Reconnecting: () => 'Websocket reconnecting',
        Error: (err) => `Error: ${err}`
      }, state.status),
    ),

    h(fullButton, {
      onclick: actions.RequestNotificationPermission,
      class: {
        'hidden': !(!state.allowNotification && ('Notification' in window)),
        'bg-green-500': true,
        'hover:bg-green-700': true,
        'uppercase': true,
        'font-light': true,
        'tracking-widest': true,
        'rounded-tr-lg': true,
        'py-1': true,
      },
    }, 'Enable Notifications'),
  ])),

  subscriptions: state => {
    const { timerId, recaptchaToken } = state;
    return [
      timerId && recaptchaToken && subscriptions.Websocket({
        actions,
        timerId,
        recaptchaToken,
      }),
      Status.caseOf({
        Connected: token => subscriptions.KeepAlive({ token }),
        Connecting: () => false,
        Reconnecting: () => false,
        Error: () => false,
      }, state.status),
      subscriptions.Timer({
        timerStartedAt: state.serverState.timerStartedAt,
        timerDuration: state.serverState.timerDuration,
        actions,
      }),
    ];
  },

  node: document.querySelector('#app'),
});

