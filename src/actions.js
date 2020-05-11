import enumerize from '@mrbarrysoftware/js-enumerize';

export default enumerize({
  Init: [],

  Load: [Object],

  AddTimer: [String],
  PingTimer: [String, String],
  RemoveTimer: [String],

  AddToken: [String, String],
  RemoveToken: [String, String],

  StartTimerFromSeconds: [Number, String, String],
  StartTimer: [String, String],
  PauseTimer: [String, String],
  ResetTimer: [String, String],

  AddUser: [String, String, String],
  RemoveUser: [String, String, String],
  MoveUser: [Number, Number, String, String],

  AddGoal: [String, String, String],
  CompleteGoal: [String, Boolean, String, String],
  RemoveGoal: [String, String, String],
  MoveGoal: [Number, Number, String, String],

  LockMob: [String],
  UnlockMob: [String],

  ShuffleMob: [String, String],
  CycleMob: [String, String],

  UpdateSettings: [Object, String, String],
});
