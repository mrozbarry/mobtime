import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  const getTimer = (timerId) => storage.read()[timerId];

  router.get('/add/:name', (request, response) => {
    const { name } = request.params;
    const { mob, lockedMob } = getTimer(request.timerId);

    if (mob.includes(name)) {
      return response
        .status(400)
        .json({ message: 'User is already in mob' })
        .end();
    }

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.AddUser(name, request.token, request.timerId));

    return response.status(201).end();
  });

  router.get('/remove/:id', (request, response) => {
    const { id } = request.params;
    const { lockedMob } = getTimer(request.timerId);

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.RemoveUser(id, request.token, request.timerId));

    return response.status(201).end();
  });

  router.get('/move/:sourceIndex/to/:destinationIndex', (request, response) => {
    const sourceIndex = Number(request.params.sourceIndex);
    const destinationIndex = Number(request.params.destinationIndex);

    if (Number.isNaN(sourceIndex) || Number.isNaN(destinationIndex)) {
      return response
        .status(400)
        .json({
          message: 'You must provide and source and desintation indexes',
          sourceIndex,
          destinationIndex,
        })
        .end();
    }

    dispatch(action.MoveUser(sourceIndex, destinationIndex, request.token, request.timerId));

    return response.status(204).end();
  });

  router.get('/rename/:id/:name', (request, response) => {
    const { id, name } = request.params;

    if (name.length < 3) {
      return response
        .status(400)
        .json({
          message: 'You must provide a name with at least 3 characters',
        })
        .end();
    }

    dispatch(action.RenameUser(
      id,
      name,
      request.token,
      request.timerId,
    ));

    return response.status(204).end();
  });

  router.get('/cycle', (request, response) => {
    dispatch(action.CycleMob(request.token, request.timerId));

    return response.status(204).end();
  });

  router.get('/shuffle', (request, response) => {
    const { lockedMob } = getTimer(request.timerId);

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.ShuffleMob(request.token, request.timerId));

    return response.status(204).end();
  });

  router.get('/lock', (request, response) => {
    dispatch(action.LockMob(request.token, request.timerId));

    return response.status(204).end();
  });

  router.get('/unlock', (request, response) => {
    dispatch(action.UnlockMob(request.token, request.timerId));

    return response.status(204).end();
  });

  return router;
};
