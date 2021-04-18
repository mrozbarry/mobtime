import * as State from './state.js';
import * as effects from './effects.js';
import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

export const SetAllowSound = (state, allowSound) => [
  {
    ...state,
    allowSound,
  },
];

export const AddToast = (state, toast) => State.concatToasts(state, toast);
export const DismissToast = state => State.dismissToastMessage(state);

const makeToastMessage = (message, actions) => ({
  message,
  actions: actions.map(a => ({
    ...a,
    onclick: state => a.onclick(DismissToast(state)),
  })),
});

const toastMessages = {
  firstTime: [
    makeToastMessage('Mobtime sounds are turned off', [
      { text: 'Turn on', onclick: s => s },
      { text: `Leave off, and don't ask again`, onclick: s => s },
    ]),
    makeToastMessage('Mobtime notifications are turned off', [
      { text: 'Request permission', onclick: s => s },
      { text: `Leave off, and don't ask again`, onclick: s => s },
    ]),
  ],
  activateSound: [
    makeToastMessage('Mobtime sounds need to be activated', [
      { text: 'Activate', onclick: state => SetAllowSound(state, true) },
    ]),
  ],
  default: [],
};

export const SetProfile = (state, profile) => State.setProfile(state, profile);
export const SaveProfile = state => [
  state,
  effects.SaveProfile({
    externals: state.externals,
    profile: State.getProfile(state),
    setProfile: SetProfile,
  }),
];
export const UpdateProfile = (state, profilePartial) =>
  State.mergeProfile(state, profilePartial);

export const Init = (_, { timerId, externals }) => [
  State.initial(timerId, externals),
  effects.LoadProfile({
    externals,
    setProfile: SetProfile,
  }),
];

export const SetCurrentTime = (state, { currentTime }) => {
  const nextState = State.setCurrentTime(state, currentTime);
  const remainingTime = calculateTimeRemaining(nextState);

  return [
    nextState,
    effects.UpdateTitleWithTime({
      remainingTime,
      externals: state.externals,
    }),
  ];
};

export const EndTurn = state => {
  if (state.timerStartedAt === null) {
    return state;
  }

  return [
    State.endTurn(state),
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      externals: state.externals,
    }),
    effects.Notify({
      notification: state.allowNotification,
      sound: state.profile.allowSound,
      title: 'Mobtime',
      text: 'The timer is up!',
      externals: state.externals,
    }),
  ];
};

export const Completed = (state, { isEndOfTurn }) => [
  State.cycleMob(State.endTurn(state)),
  effects.UpdateTitleWithTime({
    remainingTime: 0,
    externals: state.externals,
  }),
  isEndOfTurn &&
    effects.andThen({
      action: EndTurn,
      props: {},
    }),
];
export const CompletedAndShare = (state, { isEndOfTurn }) => [
  ...Completed(state, { isEndOfTurn }),
  effects.CompleteTimer({
    websocketPort: state.websocketPort,
  }),
];

export const ShareMob = state => [
  state,
  effects.UpdateMob({
    websocketPort: state.websocketPort,
    mob: State.getMob(state),
  }),
];

export const RenameUser = (state, { id, value }) => {
  const mob = State.getMob(state).map(m => ({
    ...m,
    name: m.id === id ? value : m.name,
  }));

  return ShareMob(State.setMob(state, mob));
};

export const SetMob = (state, mob) => State.setMob(state, mob);

export const ShuffleMob = state => ShareMob(State.shuffleMob(state));

export const CycleMob = state => [
  ...ShareMob(State.shuffleMob(state)),
  state.timerStartedAt > 0 &&
    effects.andThen({
      action: Completed,
      props: { isEndOfTurn: true },
    }),
];

export const AddNameToMob = state =>
  ShareMob(
    State.addToMob(state, 'Dudley', null), // TODO
  );

export const RemoveFromMob = (state, id) =>
  ShareMob(State.removeFromMob(state, id));

export const ShareGoals = state => [
  state,
  effects.UpdateGoals({
    websocketPort: state.websocketPort,
    goals: State.getGoals(state),
  }),
];

export const AddGoal = state =>
  ShareGoals(
    State.addToGoals(state, 'Do better'), // TODO
  );

export const CompleteGoal = (state, { id, completed }) =>
  ShareGoals(State.completeGoal(state, id, completed));

export const RemoveGoal = (state, id) =>
  ShareGoals(State.removeGoal(state, id));

export const RemoveCompletedGoals = state =>
  ShareGoals(State.removeCompletedGoals(state));

export const RenameGoal = (state, { id, value }) =>
  ShareGoals(State.editGoal(state, id, value));

export const SetGoals = (state, goals) => State.setGoals(state, goals);

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const PauseTimer = (state, currentTime = Date.now()) =>
  State.pauseTimer(state, currentTime);

export const PauseTimerAndShare = (state, currentTime = Date.now()) => {
  const nextState = PauseTimer(state, currentTime);

  return [
    nextState,
    effects.PauseTimer({
      websocketPort: state.websocketPort,
      timerDuration: state.timerDuration,
    }),
  ];
};

export const ResumeTimer = (state, timerStartedAt = Date.now()) =>
  State.resumeTimer(state, timerStartedAt);

export const ResumeTimerAndShare = (state, timerStartedAt = Date.now()) => [
  ResumeTimer(state, timerStartedAt),
  effects.StartTimer({
    websocketPort: state.websocketPort,
    timerDuration: state.timerDuration,
  }),
];

export const StartTimer = (state, timerStartedAt) => {
  const { duration } = State.getShared(state);
  return State.startTimer(state, timerStartedAt, duration);
};

export const StartTimerAndShare = (state, timerStartedAt) => {
  const nextState = StartTimer(state, timerStartedAt);
  return [
    nextState,
    effects.StartTimer({
      websocketPort: state.websocketPort,
      timerDuration: nextState.timerDuration,
    }),
  ];
};

export const ReplaceTimer = (state, timerAttributes) => ({
  ...state,
  ...timerAttributes,
});

// export const SetAllowNotification = (state, { allowNotification }) => [
// {
// ...state,
// allowNotification,
// },
// allowNotification &&
// effects.Notify({
// title: 'Mobtime Config',
// text: 'You have allowed notifications',
// sound: false,
// externals: state.externals,
// }),
// ];

// export const SetNotificationPermissions = (
// state,
// { notificationPermissions },
// ) => [
// {
// ...state,
// notificationPermissions,
// },
// notificationPermissions === 'granted' &&
// effects.andThen({
// action: SetAllowNotification,
// props: {
// allowNotification: true,
// },
// }),
// ];

// export const RequestNotificationPermission = state => [
// state,
// effects.NotificationPermission({
// SetNotificationPermissions,
// Notification: state.Notification,
// documentElement: state.documentElement,
// }),
// ];

// export const ShowNotification = (state, message) => [
// state,
// effects.DisplayNotification({
// title: 'Cycle Complete',
// text: message,
// }),
// ];

// export const PendingSettingsReset = state => State.pendingSettingsReset(state);

// export const PendingSettingsSet = (state, { key, value }) =>
// State.pendingSettingSet(state, key, value);

export const ShareSettings = state => [
  state,
  effects.UpdateSettings({
    websocketPort: state.websocketPort,
    settings: State.getShared(state),
  }),
];

export const UpdateSettings = state =>
  ShareSettings(
    State.mergeShared(state, {}), // TODO: Where are the new settings coming from?
  );

export const ReplaceSettings = (state, settings) =>
  State.setShared(state, settings);

export const BroadcastJoin = state => [
  state,
  effects.BroadcastJoin({
    websocketPort: state.websocketPort,
  }),
];

export const ShareEverything = state => [
  state,
  effects.UpdateMob({
    websocketPort: state.websocketPort,
    mob: State.getMob(state),
  }),
  effects.UpdateGoals({
    websocketPort: state.websocketPort,
    goals: State.getGoals(state),
  }),
  effects.UpdateSettings({
    websocketPort: state.websocketPort,
    settings: State.getShared(state),
  }),
  state.timerStartedAt > 0 &&
    effects.StartTimer({
      websocketPort: state.websocketPort,
      timerDuration: calculateTimeRemaining(state),
    }),
];

export const SetOwnership = (state, isOwner) =>
  State.mergeLocal(state, { isOwner });
