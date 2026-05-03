const Session = require('../models/Session');

module.exports = (io, socket) => {
  socket.on('join-room', async ({ roomId, username }) => {
    socket.join(roomId);

    socket.roomId = roomId;
    socket.username = username || 'Anonymous';

    try {
      // Atomically pull any zombie with same username AND check for active duplicate
      const sessionBefore = await Session.findOne({ roomId });
      if (sessionBefore) {
        const activeSockets = await io.in(roomId).fetchSockets();
        const activeSocketIds = new Set(activeSockets.map(s => s.id));

        // A name is "taken" if there's a participant with that username whose socket is still connected
        const nameTaken = sessionBefore.participants.some(
          p => p.username === socket.username && p.socketId !== socket.id && activeSocketIds.has(p.socketId)
        );

        if (nameTaken) {
          socket.emit('join-error', 'Username already taken in this room. Please choose another one.');
          socket.leave(roomId);
          return;
        }
      }

      // Remove any stale/zombie entry with same username before adding fresh one
      await Session.findOneAndUpdate(
        { roomId },
        { $pull: { participants: { username: socket.username } } }
      );
      
      // Add user to session participants and get the updated list
      const updatedSession = await Session.findOneAndUpdate(
        { roomId },
        { $push: { participants: { socketId: socket.id, userId: socket.id, username: socket.username } } },
        { returnDocument: 'after' }
      );

      if (updatedSession) {
         // Broadcast full participant list to everyone in the room (including sender)
         io.in(roomId).emit('room-participants', updatedSession.participants);
      }
      
      // Send a distinct connected event just for toast notifications
      socket.to(roomId).emit('user-connected-toast', socket.username);
      
      // Emit success to the joining user
      socket.emit('join-success');
      
    } catch(err) {
      console.error('Error joining room in DB:', err);
      socket.emit('join-error', 'Failed to join room due to a server error.');
    }
  });

  socket.on('code-change', async ({ roomId, code, language }) => {
    // Broadcast to everyone else in the room
    socket.to(roomId).emit('code-update', { code, language });
    
    // Save to DB (throttle in production, but for now just update)
    try {
      await Session.findOneAndUpdate({ roomId }, { currentCode: code, language });
    } catch (err) {
      console.error('Error saving code:', err);
    }
  });

  socket.on('cursor-move', ({ roomId, cursor }) => {
    socket.to(roomId).emit('cursor-update', {
      socketId: socket.id,
      username: socket.username,
      cursor
    });
  });

  socket.on('next-question-triggered', ({ roomId, session }) => {
    socket.to(roomId).emit('session-updated', session);
  });

  socket.on('draw-action', async ({ roomId, action }) => {
    socket.to(roomId).emit('draw-update', action);
    
    // Append to drawing session
    try {
      await Session.findOneAndUpdate(
        { roomId },
        { $push: { drawingActions: action } }
      );
    } catch (err) {
      console.error('Error saving exact drawing action:', err);
    }
  });

  socket.on('draw-undo', async ({ roomId, strokeId }) => {
    socket.to(roomId).emit('draw-undo', strokeId);
    try {
      await Session.findOneAndUpdate(
        { roomId },
        { $pull: { drawingActions: { strokeId } } }
      );
    } catch (err) {
      console.error('Error undoing drawing action:', err);
    }
  });

  socket.on('draw-clear', async ({ roomId }) => {
    socket.to(roomId).emit('draw-clear');
    try {
      await Session.findOneAndUpdate({ roomId }, { drawingActions: [] });
    } catch (err) {
      console.error('Error clearing drawing:', err);
    }
  });

  socket.on('run-result', ({ roomId, result }) => {
    socket.to(roomId).emit('run-result', result);
  });

  socket.on('webrtc-join', (roomId) => {
    socket.to(roomId).emit('webrtc-user-connected', socket.id);
  });

  socket.on('webrtc-offer', ({ to, offer }) => {
    socket.to(to).emit('webrtc-offer', { from: socket.id, offer });
  });

  socket.on('webrtc-answer', ({ to, answer }) => {
    socket.to(to).emit('webrtc-answer', { from: socket.id, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('webrtc-ice-candidate', { from: socket.id, candidate });
  });

  socket.on('webrtc-disconnect', (roomId) => {
    socket.to(roomId).emit('webrtc-user-disconnected', socket.id);
  });

  socket.on('voice-join', ({ roomId, peerId }) => {
    socket.to(roomId).emit('voice-user-connected', peerId);
  });

  socket.on('disconnect', async () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('webrtc-user-disconnected', socket.id);
      socket.to(socket.roomId).emit('user-disconnected-toast', socket.username);
      
      try {
        const updatedSession = await Session.findOneAndUpdate(
          { roomId: socket.roomId },
          { $pull: { participants: { socketId: socket.id } } },
          { returnDocument: 'after' }
        );
        
        if (updatedSession) {
            io.in(socket.roomId).emit('room-participants', updatedSession.participants);
        }
      } catch (err) {
        console.error('Error removing participant:', err);
      }
    }
  });
};
